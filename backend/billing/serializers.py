from rest_framework import serializers
from .models import (
    AcademicProgram, Batch, Center, ReferencePerson,
    CustomFieldDefinition, Student, AcademicYearFee,
    CustomFeeLineItem, PaymentTransaction, UserRoleProfile,
    WhatsAppTemplate, InstitutionSettings
)
from decimal import Decimal


class AcademicProgramSerializer(serializers.ModelSerializer):
    batch_count = serializers.SerializerMethodField()

    class Meta:
        model = AcademicProgram
        fields = ['id', 'name', 'code', 'duration_years', 'description', 'batch_count']

    def get_batch_count(self, obj):
        return obj.batches.count()


class CenterSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Center
        fields = ['id', 'code', 'name', 'contact_number', 'student_count']

    def get_student_count(self, obj):
        return obj.students.count()


class BatchSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_code = serializers.CharField(source='program.code', read_only=True)
    duration_years = serializers.IntegerField(source='program.duration_years', read_only=True)
    centers = serializers.PrimaryKeyRelatedField(many=True, queryset=Center.objects.all(), required=False)
    centers_data = CenterSerializer(source='centers', many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    total_expected = serializers.SerializerMethodField()
    total_collected = serializers.SerializerMethodField()
    total_due = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            'id', 'program', 'program_name', 'program_code', 'duration_years',
            'batch_name', 'academic_year', 'centers', 'centers_data',
            'whatsapp_group_link', 'candidate_types', 'default_base_fee', 'is_active',
            'student_count', 'total_expected', 'total_collected', 'total_due'
        ]

    def get_student_count(self, obj):
        return obj.students.count()

    def get_total_expected(self, obj):
        total = Decimal('0.00')
        for s in obj.students.all():
            total += s.total_fee_amount
        return str(total)

    def get_total_collected(self, obj):
        total = Decimal('0.00')
        for s in obj.students.all():
            total += s.total_paid_amount
        return str(total)

    def get_total_due(self, obj):
        total = Decimal('0.00')
        for s in obj.students.all():
            total += s.total_balance_due
        return str(total)


class ReferencePersonSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    total_referred_dues = serializers.SerializerMethodField()

    class Meta:
        model = ReferencePerson
        fields = ['id', 'name', 'phone', 'designation', 'notes', 'student_count', 'total_referred_dues']

    def get_student_count(self, obj):
        return obj.students.count()

    def get_total_referred_dues(self, obj):
        total = Decimal('0.00')
        for s in obj.students.all():
            total += s.total_balance_due
        return str(total)


class CustomFieldDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldDefinition
        fields = ['id', 'program', 'field_label', 'field_key', 'field_type', 'options', 'is_required', 'is_masked_for_callers']


class CustomFeeLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFeeLineItem
        fields = ['id', 'year_fee', 'title', 'amount', 'is_optional', 'created_at']


class PaymentTransactionSerializer(serializers.ModelSerializer):
    payment_mode_display = serializers.CharField(source='get_payment_mode_display', read_only=True)
    screenshot_url = serializers.SerializerMethodField()
    student_id = serializers.IntegerField(source='year_fee.student.id', read_only=True)
    student_name = serializers.CharField(source='year_fee.student.name', read_only=True)
    student_code = serializers.CharField(source='year_fee.student.student_id', read_only=True)
    registration_no = serializers.CharField(source='year_fee.student.registration_no', read_only=True)
    batch_name = serializers.CharField(source='year_fee.student.batch.batch_name', read_only=True)
    program_name = serializers.CharField(source='year_fee.student.batch.program.name', read_only=True)
    year_index = serializers.IntegerField(source='year_fee.year_index', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'year_fee', 'amount', 'payment_date', 'payment_mode',
            'payment_mode_display', 'transaction_ref', 'screenshot', 'screenshot_url',
            'notes', 'created_at',
            'student_id', 'student_name', 'student_code', 'registration_no',
            'batch_name', 'program_name', 'year_index'
        ]

    def get_screenshot_url(self, obj):
        if obj.screenshot:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.screenshot.url) if request else obj.screenshot.url
        return None


class AcademicYearFeeSerializer(serializers.ModelSerializer):
    line_items = CustomFeeLineItemSerializer(many=True, read_only=True)
    payments = PaymentTransactionSerializer(many=True, read_only=True)
    total_billed = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()

    class Meta:
        model = AcademicYearFee
        fields = [
            'id', 'year_index', 'base_annual_fee', 'discount_amount',
            'remarks', 'total_billed', 'total_paid', 'balance_due',
            'line_items', 'payments'
        ]

    def get_total_billed(self, obj):
        return str(obj.total_billed)

    def get_total_paid(self, obj):
        return str(obj.total_paid)

    def get_balance_due(self, obj):
        return str(obj.balance_due)


class StudentSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source='batch.batch_name', read_only=True)
    program_name = serializers.CharField(source='batch.program.name', read_only=True)
    program_code = serializers.CharField(source='batch.program.code', read_only=True)
    duration_years = serializers.IntegerField(source='batch.program.duration_years', read_only=True)
    center_name = serializers.CharField(source='center.name', read_only=True, default='')
    center_code = serializers.CharField(source='center.code', read_only=True, default='')
    reference_name = serializers.CharField(source='reference.name', read_only=True, default='')
    reference_phone = serializers.CharField(source='reference.phone', read_only=True, default='')
    
    total_fee_amount = serializers.SerializerMethodField()
    total_paid_amount = serializers.SerializerMethodField()
    total_balance_due = serializers.SerializerMethodField()
    payment_percentage = serializers.FloatField(read_only=True)
    fee_status = serializers.CharField(read_only=True)
    
    year_fees = AcademicYearFeeSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'batch', 'batch_name', 'program_name', 'program_code', 'duration_years',
            'center', 'center_code', 'center_name',
            'reference', 'reference_name', 'reference_phone',
            'student_id', 'registration_no', 'admission_no', 'hall_ticket_no',
            'name', 'group', 'candidate_type',
            'primary_contact', 'secondary_contact', 'number_of_subjects', 'admission_status',
            'custom_fields', 'created_at',
            'total_fee_amount', 'total_paid_amount', 'total_balance_due',
            'payment_percentage', 'fee_status', 'year_fees'
        ]

    def get_total_fee_amount(self, obj):
        request = self.context.get('request')
        # Check role-based field masking
        role_view = request.query_params.get('role_view', None) if request else None
        if role_view == 'TEACHER_CALLER':
            return None # Masked for caller
        return str(obj.total_fee_amount)

    def get_total_paid_amount(self, obj):
        return str(obj.total_paid_amount)

    def get_total_balance_due(self, obj):
        return str(obj.total_balance_due)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        role_view = request.query_params.get('role_view', None) if request else None
        
        # Mask sensitive custom fields if caller
        if role_view == 'TEACHER_CALLER' and 'custom_fields' in ret and isinstance(ret['custom_fields'], dict):
            masked_fields = CustomFieldDefinition.objects.filter(is_masked_for_callers=True).values_list('field_key', flat=True)
            for mf in masked_fields:
                ret['custom_fields'].pop(mf, None)
        return ret


class WhatsAppTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppTemplate
        fields = ['id', 'title', 'message_text', 'is_default']


class UserRoleProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_name = serializers.CharField(source='user.first_name', required=False)
    email = serializers.CharField(source='user.email', required=False)
    assigned_batch_ids = serializers.PrimaryKeyRelatedField(
        many=True, source='assigned_batches', queryset=Batch.objects.all(), required=False
    )
    assigned_batch_names = serializers.SerializerMethodField()

    class Meta:
        model = UserRoleProfile
        fields = [
            'id', 'user', 'username', 'user_name', 'email', 'phone', 'role',
            'assigned_batch_ids', 'assigned_batch_names',
            'can_view_total_fee', 'can_view_financial_analytics',
            'can_edit_fee_structure', 'can_export_excel', 'hidden_custom_fields'
        ]

    def get_assigned_batch_names(self, obj):
        return [b.batch_name for b in obj.assigned_batches.all()]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()

        if 'assigned_batches' in validated_data:
            batches = validated_data.pop('assigned_batches')
            instance.assigned_batches.set(batches)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class InstitutionSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionSettings
        fields = '__all__'

