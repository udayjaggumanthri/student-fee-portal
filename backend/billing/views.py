import urllib.parse
import random
from decimal import Decimal
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.mail import send_mail, get_connection
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from .models import (
    AcademicProgram, Batch, Center, ReferencePerson,
    CustomFieldDefinition, Student, AcademicYearFee,
    CustomFeeLineItem, PaymentTransaction, UserRoleProfile,
    WhatsAppTemplate, InstitutionSettings, PasswordResetRequest
)
from .serializers import (
    AcademicProgramSerializer, BatchSerializer, CenterSerializer,
    ReferencePersonSerializer, CustomFieldDefinitionSerializer,
    CustomFeeLineItemSerializer, PaymentTransactionSerializer,
    AcademicYearFeeSerializer, StudentSerializer,
    WhatsAppTemplateSerializer, UserRoleProfileSerializer,
    InstitutionSettingsSerializer
)
from .services import InstitutionExcelImporter, parse_decimal, clean_str, clean_phone


class KPIView(views.APIView):
    """Returns high-level institution KPI cards for dashboard"""
    def get(self, request):
        batch_id = request.query_params.get('batch')
        program_id = request.query_params.get('program')
        center_id = request.query_params.get('center')
        students = Student.objects.all()

        if batch_id and batch_id != 'all':
            students = students.filter(batch_id=batch_id)
        elif program_id and program_id != 'all':
            students = students.filter(batch__program_id=program_id)
        if center_id and center_id != 'all':
            students = students.filter(center_id=center_id)

        total_students = students.count()
        total_expected = Decimal('0.00')
        total_collected = Decimal('0.00')
        total_dues = Decimal('0.00')
        paid_count = 0
        partial_count = 0
        unpaid_count = 0

        for s in students:
            expected = s.total_fee_amount
            collected = s.total_paid_amount
            due = s.total_balance_due

            total_expected += expected
            total_collected += collected
            total_dues += due

            if due <= 0 and collected > 0:
                paid_count += 1
            elif collected > 0:
                partial_count += 1
            else:
                unpaid_count += 1

        collection_rate = (
            round(float((total_collected / total_expected) * 100), 1)
            if total_expected > 0 else 0
        )

        # Dynamic program breakdown for workspace switcher and analytics
        programs = AcademicProgram.objects.all()
        program_breakdown = []
        for p in programs:
            p_students = Student.objects.filter(batch__program=p)
            p_exp = sum((s.total_fee_amount for s in p_students), Decimal('0.00'))
            p_col = sum((s.total_paid_amount for s in p_students), Decimal('0.00'))
            p_due = sum((s.total_balance_due for s in p_students), Decimal('0.00'))
            p_paid = sum(1 for s in p_students if s.total_balance_due <= 0 and s.total_paid_amount > 0)
            p_partial = sum(1 for s in p_students if s.total_paid_amount > 0 and s.total_balance_due > 0)
            p_unpaid = sum(1 for s in p_students if s.total_paid_amount <= 0)
            program_breakdown.append({
                'id': p.id,
                'name': p.name,
                'code': p.code,
                'student_count': p_students.count(),
                'total_expected': str(p_exp),
                'total_collected': str(p_col),
                'total_due': str(p_due),
                'paid_count': p_paid,
                'partial_count': p_partial,
                'unpaid_count': p_unpaid
            })

        return Response({
            'total_students': total_students,
            'total_expected': str(total_expected),
            'total_collected': str(total_collected),
            'total_dues': str(total_dues),
            'collection_rate': collection_rate,
            'paid_count': paid_count,
            'partial_count': partial_count,
            'unpaid_count': unpaid_count,
            'program_breakdown': program_breakdown
        })


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('batch', 'batch__program', 'center', 'reference').prefetch_related(
        'year_fees__line_items', 'year_fees__payments'
    ).all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        batch_id = self.request.query_params.get('batch')
        program_id = self.request.query_params.get('program')
        status_filter = self.request.query_params.get('fee_status')
        center_id = self.request.query_params.get('center')
        candidate_type = self.request.query_params.get('candidate_type')
        ref_id = self.request.query_params.get('reference')
        search = self.request.query_params.get('search')

        if batch_id and batch_id != 'all':
            qs = qs.filter(batch_id=batch_id)
        if program_id and program_id != 'all':
            qs = qs.filter(batch__program_id=program_id)
        if center_id and center_id != 'all':
            qs = qs.filter(center_id=center_id)
        if candidate_type and candidate_type.lower() != 'all':
            qs = qs.filter(candidate_type__iexact=candidate_type.strip())
        if ref_id and ref_id != 'all':
            qs = qs.filter(reference_id=ref_id)

        # Staff Batch Access Restriction
        staff_username = self.request.query_params.get('staff_user')
        if staff_username:
            prof = UserRoleProfile.objects.filter(user__username=staff_username).first()
            if prof and prof.role == 'TEACHER_CALLER' and prof.assigned_batches.exists():
                qs = qs.filter(batch__in=prof.assigned_batches.all())

        if search:
            s = search.strip()
            qs = qs.filter(
                Q(name__icontains=s) |
                Q(primary_contact__icontains=s) |
                Q(secondary_contact__icontains=s) |
                Q(registration_no__icontains=s) |
                Q(student_id__icontains=s) |
                Q(hall_ticket_no__icontains=s) |
                Q(admission_no__icontains=s) |
                Q(group__icontains=s) |
                Q(reference__name__icontains=s)
            )

        # Status filtering in memory if needed
        if status_filter and status_filter.upper() in ['PAID', 'PARTIAL', 'UNPAID']:
            target = status_filter.upper()
            filtered_ids = [s.id for s in qs if s.fee_status == target]
            return qs.filter(id__in=filtered_ids)
        return qs

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        val = self.kwargs.get(lookup_url_kwarg, '')
        if str(val).isdigit():
            try:
                return super().get_object()
            except Exception:
                pass
        obj = Student.objects.filter(Q(student_id__iexact=val) | Q(registration_no__iexact=val)).first()
        if obj:
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # Support aliases for field names
        if 'full_name' in data and not data.get('name'):
            data['name'] = data.pop('full_name')
        if 'phone_primary' in data and not data.get('primary_contact'):
            data['primary_contact'] = data.pop('phone_primary')
        if 'phone_secondary' in data and not data.get('secondary_contact'):
            data['secondary_contact'] = data.pop('phone_secondary')
        if 'study_center' in data and not data.get('center'):
            data['center'] = data.pop('study_center')
        if 'study_center_id' in data and not data.get('center'):
            data['center'] = data.pop('study_center_id')
        if 'base_tuition_fee' in data and not data.get('base_annual_fee'):
            data['base_annual_fee'] = data.pop('base_tuition_fee')

        base_annual_fee = parse_decimal(data.pop('base_annual_fee', None))

        # Support linking or inline creating reference person
        if 'reference_id' in data and not data.get('reference'):
            data['reference'] = data.pop('reference_id')
        new_ref_name = data.pop('new_reference_name', None)
        new_ref_phone = data.pop('new_reference_phone', None)
        if new_ref_name:
            clean_name = str(new_ref_name).strip()
            if clean_name:
                ref_obj, _ = ReferencePerson.objects.get_or_create(
                    name=clean_name,
                    defaults={'phone': str(new_ref_phone or '').strip()}
                )
                data['reference'] = ref_obj.id

        if 'center_id' in data and not data.get('center'):
            data['center'] = data.pop('center_id')

        # Auto-generate student_id if not explicitly provided
        batch_id = data.get('batch')
        if not data.get('student_id') and batch_id:
            try:
                batch_obj = Batch.objects.get(id=batch_id)
                prefix = ''.join(c for c in batch_obj.batch_name if c.isalnum()).upper() or 'STD'
                count = Student.objects.filter(batch=batch_obj).count() + 1
                data['student_id'] = f"{prefix}-{count:03d}"
            except Exception:
                pass

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        # Determine default base fee from batch if none supplied
        if base_annual_fee <= Decimal('0.00') and student.batch and student.batch.default_base_fee > Decimal('0.00'):
            base_annual_fee = student.batch.default_base_fee

        # Initialize AcademicYearFee for Year 1
        AcademicYearFee.objects.get_or_create(
            student=student,
            year_index=1,
            defaults={'base_annual_fee': base_annual_fee}
        )

        headers = self.get_success_headers(serializer.data)
        fresh_serializer = self.get_serializer(student)
        return Response({
            'message': f'Student "{student.name}" enrolled successfully.',
            'student': fresh_serializer.data
        }, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Support creating or linking a universal reference person inline
        if 'reference_id' in data:
            data['reference'] = data.pop('reference_id')

        new_ref_name = data.pop('new_reference_name', None)
        new_ref_phone = data.pop('new_reference_phone', None)
        if new_ref_name:
            clean_name = str(new_ref_name).strip()
            if clean_name:
                ref_obj, _ = ReferencePerson.objects.get_or_create(
                    name=clean_name,
                    defaults={'phone': str(new_ref_phone or '').strip()}
                )
                data['reference'] = ref_obj.id

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'message': 'Student details updated successfully.',
            'student': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        student_name = instance.name
        student_id_val = instance.student_id or instance.id
        self.perform_destroy(instance)
        return Response({
            'message': f'Student "{student_name}" (#{student_id_val}) deleted successfully.'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser, JSONParser])
    def record_payment(self, request, pk=None):
        student = self.get_object()
        year_index = int(request.data.get('year_index', 1))
        amount = parse_decimal(request.data.get('amount'))
        payment_mode = request.data.get('payment_mode', 'CASH').upper()
        payment_date = request.data.get('payment_date') or timezone.now().date()
        transaction_ref = request.data.get('transaction_ref', '')
        notes = request.data.get('notes', '')
        screenshot = request.FILES.get('screenshot')

        if amount <= 0:
            return Response({'error': 'Payment amount must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create year fee record
        year_fee, _ = AcademicYearFee.objects.get_or_create(
            student=student,
            year_index=year_index,
            defaults={'base_annual_fee': Decimal('15000.00'), 'remarks': f'Year {year_index} fee'}
        )

        payment = PaymentTransaction.objects.create(
            year_fee=year_fee,
            amount=amount,
            payment_date=payment_date,
            payment_mode=payment_mode,
            transaction_ref=transaction_ref,
            screenshot=screenshot,
            notes=notes,
            recorded_by=request.user if request.user.is_authenticated else None
        )

        fresh_student = Student.objects.select_related('batch', 'batch__program', 'center', 'reference').prefetch_related(
            'year_fees__line_items', 'year_fees__payments'
        ).get(id=student.id)
        serializer = StudentSerializer(fresh_student, context={'request': request})
        return Response({
            'message': f'Payment of ₹{amount} recorded successfully.',
            'payment_id': payment.id,
            'student': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_line_item(self, request, pk=None):
        student = self.get_object()
        year_index = int(request.data.get('year_index', 1))
        title = request.data.get('title', 'Special Fee')
        amount = parse_decimal(request.data.get('amount'))

        if amount <= 0:
            return Response({'error': 'Line item amount must be greater than 0.'}, status=status.HTTP_400_BAD_REQUEST)

        year_fee, _ = AcademicYearFee.objects.get_or_create(
            student=student,
            year_index=year_index,
            defaults={'base_annual_fee': Decimal('0.00')}
        )

        item = CustomFeeLineItem.objects.create(
            year_fee=year_fee,
            title=title,
            amount=amount
        )

        fresh_student = Student.objects.select_related('batch', 'batch__program', 'center', 'reference').prefetch_related(
            'year_fees__line_items', 'year_fees__payments'
        ).get(id=student.id)
        serializer = StudentSerializer(fresh_student, context={'request': request})
        return Response({
            'message': f'Added custom fee "{title}" of ₹{amount}',
            'student': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def whatsapp_link(self, request, pk=None):
        student = self.get_object()
        phone = student.primary_contact or student.secondary_contact
        clean_p = clean_phone(phone)
        if not clean_p:
            return Response({'error': 'No valid phone number for student'}, status=status.HTTP_400_BAD_REQUEST)

        # Prepend 91 for Indian phone numbers if 10 digits
        if len(clean_p) == 10 and not clean_p.startswith('91'):
            target_phone = f"91{clean_p}"
        else:
            target_phone = clean_p

        template = WhatsAppTemplate.objects.filter(is_default=True).first()
        raw_msg = template.message_text if template else (
            "Dear {{student_name}},\nFee reminder for {{course}} (Batch: {{batch}}).\n"
            "Total Fee: ₹{{total_fee}}, Paid: ₹{{paid_amount}}, Balance Due: ₹{{balance_due}}.\nThank you!"
        )

        msg = raw_msg.replace('{{student_name}}', student.name)
        msg = msg.replace('{{course}}', student.group or student.batch.program.name)
        msg = msg.replace('{{batch}}', student.batch.batch_name)
        msg = msg.replace('{{hall_ticket_no}}', student.hall_ticket_no or student.student_id or '')
        msg = msg.replace('{{center}}', student.center.code if student.center else 'Main Campus')
        msg = msg.replace('{{center_name}}', student.center.name if student.center else 'Main Campus')
        msg = msg.replace('{{total_fee}}', str(student.total_fee_amount))
        msg = msg.replace('{{paid_amount}}', str(student.total_paid_amount))
        msg = msg.replace('{{balance_due}}', str(student.total_balance_due))

        encoded_text = urllib.parse.quote(msg)
        wa_url = f"https://wa.me/{target_phone}?text={encoded_text}"

        return Response({
            'phone': target_phone,
            'message': msg,
            'whatsapp_url': wa_url
        })


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.select_related('program').prefetch_related('students', 'centers').all()
    serializer_class = BatchSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.batch_name
        student_count = instance.students.count()
        if student_count > 0:
            force = request.query_params.get('force') == 'true' or request.data.get('force') is True
            if not force:
                return Response({
                    'error': f'Batch "{name}" contains {student_count} enrolled students. Please confirm deletion to proceed.',
                    'student_count': student_count,
                    'requires_confirmation': True
                }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return Response({
            'message': f'Batch "{name}" deleted successfully.'
        }, status=status.HTTP_200_OK)


class AcademicProgramViewSet(viewsets.ModelViewSet):
    queryset = AcademicProgram.objects.all()
    serializer_class = AcademicProgramSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        batch_count = instance.batches.count()
        if batch_count > 0:
            force = request.query_params.get('force') == 'true' or request.data.get('force') is True
            if not force:
                return Response({
                    'error': f'Program "{name}" has {batch_count} active batches. Please confirm to reassign or delete.',
                    'requires_confirmation': True
                }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return Response({
            'message': f'Program "{name}" removed successfully.'
        }, status=status.HTTP_200_OK)


class CenterViewSet(viewsets.ModelViewSet):
    queryset = Center.objects.all()
    serializer_class = CenterSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if not data.get('code') and data.get('name'):
            data['code'] = str(data['name']).strip()[:50]
        elif not data.get('name') and data.get('code'):
            data['name'] = str(data['code']).strip()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.code or instance.name
        # Unlink students attached to this center safely
        student_count = instance.students.count()
        instance.students.update(center=None)
        self.perform_destroy(instance)
        return Response({
            'message': f'Study center "{name}" removed successfully. {student_count} student records safely unlinked.'
        }, status=status.HTTP_200_OK)


class ReferencePersonViewSet(viewsets.ModelViewSet):
    queryset = ReferencePerson.objects.prefetch_related('students').all()
    serializer_class = ReferencePersonSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        # Set reference on students to null to preserve student records
        instance.students.update(reference=None)
        self.perform_destroy(instance)
        return Response({
            'message': f'Reference contact "{name}" removed successfully.'
        }, status=status.HTTP_200_OK)


class PaymentTransactionViewSet(viewsets.ModelViewSet):
    queryset = PaymentTransaction.objects.select_related(
        'year_fee__student', 'year_fee__student__batch', 'year_fee__student__batch__program'
    ).order_by('-payment_date', '-id')
    serializer_class = PaymentTransactionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        batch_id = self.request.query_params.get('batch')
        program_id = self.request.query_params.get('program')
        mode = self.request.query_params.get('mode')
        search = self.request.query_params.get('search')

        if batch_id and batch_id != 'all':
            qs = qs.filter(year_fee__student__batch_id=batch_id)
        if program_id and program_id != 'all':
            qs = qs.filter(year_fee__student__batch__program_id=program_id)
        if mode and mode != 'all':
            qs = qs.filter(payment_mode=mode.upper())
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(year_fee__student__name__icontains=s) |
                Q(year_fee__student__student_id__icontains=s) |
                Q(transaction_ref__icontains=s) |
                Q(notes__icontains=s)
            )
        return qs

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        student = instance.year_fee.student
        return Response({
            'message': 'Payment transaction modified successfully.',
            'payment': serializer.data,
            'student_id': student.student_id or student.id,
            'total_fee': str(student.total_fee_amount),
            'total_paid': str(student.total_paid_amount),
            'balance_due': str(student.total_balance_due)
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        student = instance.year_fee.student
        self.perform_destroy(instance)
        return Response({
            'message': 'Payment transaction deleted successfully.',
            'student_id': student.student_id or student.id,
            'total_fee': str(student.total_fee_amount),
            'total_paid': str(student.total_paid_amount),
            'balance_due': str(student.total_balance_due)
        }, status=status.HTTP_200_OK)


class CustomFeeLineItemViewSet(viewsets.ModelViewSet):
    queryset = CustomFeeLineItem.objects.select_related('year_fee', 'year_fee__student').all()
    serializer_class = CustomFeeLineItemSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        student = instance.year_fee.student
        return Response({
            'message': f'Fee item "{instance.title}" updated successfully.',
            'item': serializer.data,
            'student_id': student.student_id or student.id,
            'total_fee': str(student.total_fee_amount),
            'total_paid': str(student.total_paid_amount),
            'balance_due': str(student.total_balance_due)
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        title = instance.title
        student = instance.year_fee.student
        self.perform_destroy(instance)
        return Response({
            'message': f'Fee item "{title}" removed successfully.',
            'student_id': student.student_id or student.id,
            'total_fee': str(student.total_fee_amount),
            'total_paid': str(student.total_paid_amount),
            'balance_due': str(student.total_balance_due)
        }, status=status.HTTP_200_OK)


class AcademicYearFeeViewSet(viewsets.ModelViewSet):
    queryset = AcademicYearFee.objects.select_related('student').all()
    serializer_class = AcademicYearFeeSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        student = instance.student
        return Response({
            'message': f'Academic Year {instance.year_index} fee structure updated successfully.',
            'year_fee': serializer.data,
            'student_id': student.student_id or student.id,
            'total_fee': str(student.total_fee_amount),
            'total_paid': str(student.total_paid_amount),
            'balance_due': str(student.total_balance_due)
        })


class CustomFieldDefinitionViewSet(viewsets.ModelViewSet):
    queryset = CustomFieldDefinition.objects.all()
    serializer_class = CustomFieldDefinitionSerializer


class WhatsAppTemplateViewSet(viewsets.ModelViewSet):
    queryset = WhatsAppTemplate.objects.all()
    serializer_class = WhatsAppTemplateSerializer


class UserRoleProfileViewSet(viewsets.ModelViewSet):
    queryset = UserRoleProfile.objects.select_related('user').all()
    serializer_class = UserRoleProfileSerializer

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        if not user.is_authenticated:
            user = User.objects.filter(is_superuser=True).first() or User.objects.first()

        profile, _ = UserRoleProfile.objects.get_or_create(user=user, defaults={'role': 'ADMIN'})

        if request.method in ['PUT', 'PATCH']:
            name = request.data.get('name') or request.data.get('user_name')
            email = request.data.get('email')
            phone = request.data.get('phone')
            password = request.data.get('password')

            if name:
                user.first_name = name
            if email:
                user.email = email
            if password:
                user.set_password(password)
            user.save()

            if phone is not None:
                profile.phone = phone
            profile.save()

        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password', 'Staff@123')
        name = request.data.get('name', username)
        email = request.data.get('email', f"{username}@navodaya.edu")
        phone = request.data.get('phone', '')
        role = request.data.get('role', 'TEACHER_CALLER')
        batch_ids = request.data.get('assigned_batch_ids', [])

        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'first_name': name})
        if not created and password:
            user.set_password(password)
            user.first_name = name
            user.email = email
            user.save()

        profile, _ = UserRoleProfile.objects.get_or_create(user=user, defaults={'role': role, 'phone': phone})
        profile.role = role
        profile.phone = phone
        if batch_ids:
            profile.assigned_batches.set(batch_ids)
        profile.save()

        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        name = request.data.get('name') or request.data.get('user_name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        role = request.data.get('role')
        batch_ids = request.data.get('assigned_batch_ids')
        password = request.data.get('password')

        user = profile.user
        if name:
            user.first_name = name
        if email:
            user.email = email
        if password:
            user.set_password(password)
        user.save()

        if phone is not None:
            profile.phone = phone
        if role:
            profile.role = role
        if batch_ids is not None:
            profile.assigned_batches.set(batch_ids)
        profile.save()

        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class InstitutionSettingsView(views.APIView):
    def get(self, request):
        settings_obj, _ = InstitutionSettings.objects.get_or_create(id=1)
        serializer = InstitutionSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def post(self, request):
        settings_obj, _ = InstitutionSettings.objects.get_or_create(id=1)
        serializer = InstitutionSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'Institutional white-label settings updated successfully!',
            'settings': serializer.data
        }, status=status.HTTP_200_OK)


class TestSMTPEmailView(views.APIView):
    def post(self, request):
        target_email = request.data.get('target_email')
        settings_obj, _ = InstitutionSettings.objects.get_or_create(id=1)
        target = target_email or settings_obj.support_email or "admin@navodaya.edu"

        subject = f"Test Email from {settings_obj.institution_name}"
        message = (
            f"Hello!\n\nThis is a verification test email from {settings_obj.institution_name}.\n"
            f"SMTP Host: {settings_obj.smtp_host}:{settings_obj.smtp_port}\n"
            f"Encryption: {'TLS' if settings_obj.smtp_use_tls else ('SSL' if settings_obj.smtp_use_ssl else 'None')}\n"
            f"Sent at: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
            "Your email notifications and password reset services are configured successfully."
        )

        try:
            if settings_obj.smtp_host and settings_obj.smtp_username and settings_obj.smtp_password:
                connection = get_connection(
                    backend='django.core.mail.backends.smtp.EmailBackend',
                    host=settings_obj.smtp_host,
                    port=settings_obj.smtp_port,
                    username=settings_obj.smtp_username,
                    password=settings_obj.smtp_password,
                    use_tls=settings_obj.smtp_use_tls,
                    use_ssl=settings_obj.smtp_use_ssl,
                    timeout=10
                )
                send_mail(
                    subject, message, settings_obj.smtp_from_email, [target],
                    connection=connection, fail_silently=False
                )
                return Response({
                    'success': True,
                    'message': f'Test email dispatched successfully to {target} via {settings_obj.smtp_host}!'
                })
            else:
                return Response({
                    'success': True,
                    'simulated': True,
                    'message': f'SMTP test simulated successfully for {target}. (Enter live SMTP password in settings for external relay).'
                })
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Failed to send SMTP email: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(views.APIView):
    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email.split('@')[0]).first()

        otp_code = str(random.randint(100000, 999999))
        PasswordResetRequest.objects.create(email=email, otp_code=otp_code)

        settings_obj, _ = InstitutionSettings.objects.get_or_create(id=1)

        try:
            if settings_obj.smtp_password:
                connection = get_connection(
                    backend='django.core.mail.backends.smtp.EmailBackend',
                    host=settings_obj.smtp_host,
                    port=settings_obj.smtp_port,
                    username=settings_obj.smtp_username,
                    password=settings_obj.smtp_password,
                    use_tls=settings_obj.smtp_use_tls,
                    use_ssl=settings_obj.smtp_use_ssl,
                    timeout=8
                )
                send_mail(
                    f"Password Reset OTP - {settings_obj.institution_name}",
                    f"Your 6-digit password reset OTP is: {otp_code}.\nThis code expires in 15 minutes.",
                    settings_obj.smtp_from_email,
                    [email],
                    connection=connection,
                    fail_silently=True
                )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': f'Password reset verification code sent to {email}.',
            'email': email,
            'otp': otp_code,
            'demo_code': otp_code
        })


class ResetPasswordView(views.APIView):
    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        otp = (request.data.get('otp') or request.data.get('otp_code') or '').strip()
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
            return Response({'error': 'Email, OTP, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_req = PasswordResetRequest.objects.filter(
            email__iexact=email, otp_code=otp, is_used=False
        ).first()

        if not reset_req:
            return Response({'error': 'Invalid or expired OTP verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email.split('@')[0]).first()

        if user:
            user.set_password(new_password)
            user.save()

        reset_req.is_used = True
        reset_req.save()

        return Response({
            'success': True,
            'message': 'Password has been reset successfully. You can now sign in with your new password.'
        })


class InitialIngestView(views.APIView):
    """Triggers auto-ingestion of the pre-existing files in d:\\Fee\\Resource"""
    def post(self, request):
        try:
            results = InstitutionExcelImporter.import_all_resources()
            return Response({
                'message': 'All resource spreadsheets ingested successfully!',
                'summary': results
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExcelExportView(views.APIView):
    """Exports filtered students to a beautifully formatted Excel sheet"""
    def get(self, request):
        batch_id = request.query_params.get('batch')
        status_filter = request.query_params.get('fee_status')
        students = Student.objects.select_related('batch', 'center', 'reference').all()

        if batch_id and batch_id != 'all':
            students = students.filter(batch_id=batch_id)

        if status_filter and status_filter.upper() in ['PAID', 'PARTIAL', 'UNPAID']:
            target = status_filter.upper()
            students = [s for s in students if s.fee_status == target]

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Fee Collection Report"

        # Headers
        headers = [
            "S.No", "Student ID", "Reg / Roll No", "Name", "Batch",
            "Group / Course", "Center", "Reference", "Primary Contact",
            "Secondary Contact", "Total Fee (₹)", "Paid Amount (₹)",
            "Balance Due (₹)", "Status"
        ]
        ws.append(headers)

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")

        row_idx = 2
        for idx, s in enumerate(students, 1):
            ws.append([
                idx,
                s.student_id or "",
                s.registration_no or "",
                s.name,
                s.batch.batch_name if s.batch else "",
                s.group,
                s.center.code if s.center else "",
                s.reference.name if s.reference else "",
                s.primary_contact,
                s.secondary_contact,
                float(s.total_fee_amount),
                float(s.total_paid_amount),
                float(s.total_balance_due),
                s.fee_status
            ])
            row_idx += 1

        # Adjust column widths
        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="fee_collection_report.xlsx"'
        wb.save(response)
        return response
