import os
import re
import openpyxl
from decimal import Decimal
from django.utils import timezone
from .models import (
    AcademicProgram, Batch, Center, ReferencePerson,
    CustomFieldDefinition, Student, AcademicYearFee,
    CustomFeeLineItem, PaymentTransaction, WhatsAppTemplate
)


def clean_str(val):
    if val is None:
        return ""
    s = str(val).strip()
    return "" if s.lower() == "none" else s


def parse_decimal(val):
    if val is None or val == "":
        return Decimal("0.00")
    try:
        # Strip currency symbols, commas, spaces
        cleaned = re.sub(r"[^\d.]", "", str(val))
        return Decimal(cleaned) if cleaned else Decimal("0.00")
    except Exception:
        return Decimal("0.00")


def clean_phone(val):
    if not val:
        return ""
    s = str(val).strip()
    # If float e.g. 8639595400.0
    if "." in s:
        s = s.split(".")[0]
    cleaned = re.sub(r"[^\d+]", "", s)
    return cleaned


def parse_reference(raw_ref):
    if not raw_ref:
        return None, ""
    raw = str(raw_ref).strip()
    # Check if format like "JAYRAM: 6281231370"
    if ":" in raw:
        parts = raw.split(":")
        name = parts[0].strip()
        phone = clean_phone(parts[1])
        return name, phone
    return raw, ""


class InstitutionExcelImporter:
    """Imports real-world files from d:\\Fee\\Resource into the database"""

    @classmethod
    def import_all_resources(cls, resource_dir=r"d:\Fee\Resource"):
        results = {}
        # 1. 26A.xlsx (Establish official 26A roll numbers: 26A106..., 26A141...)
        batch_26a_path = os.path.join(resource_dir, "DEGREE AND PG 2026-2027", "26A.xlsx")
        if os.path.exists(batch_26a_path):
            results["Batch 26A"] = cls.import_26a_sheet(batch_26a_path)

        # 2. Degree 2026-27.xlsx (Merge fees and SDE numbers into Batch 26A)
        deg_path = os.path.join(resource_dir, "DEGREE AND PG 2026-2027", "Degree 2026-27.xlsx")
        if os.path.exists(deg_path):
            results["Degree"] = cls.import_degree_sheet(deg_path)

        # 3. PG 2026-27.xlsx (Batch PG 26)
        pg_path = os.path.join(resource_dir, "DEGREE AND PG 2026-2027", "PG 2026-27.xlsx")
        if os.path.exists(pg_path):
            results["PG"] = cls.import_pg_sheet(pg_path)

        # 4. Inter 2026-2027 Batch.xlsx
        inter_path = os.path.join(resource_dir, "OPEN SCHOOL 2026-2027", "Inter 2026-2027 Batch.xlsx")
        if os.path.exists(inter_path):
            results["Open School Inter"] = cls.import_inter_sheet(inter_path)

        # 5. ssc 2026-2027 batch.xlsx
        ssc_path = os.path.join(resource_dir, "OPEN SCHOOL 2026-2027", "ssc 2026-2027 batch.xlsx")
        if os.path.exists(ssc_path):
            results["Open School SSC"] = cls.import_ssc_sheet(ssc_path)

        # Create default WhatsApp template
        cls.ensure_default_whatsapp_template()
        return results

    @classmethod
    def ensure_default_whatsapp_template(cls):
        if not WhatsAppTemplate.objects.exists():
            WhatsAppTemplate.objects.create(
                title="Standard Fee Balance Reminder",
                is_default=True,
                message_text=(
                    "Dear {{student_name}},\n\n"
                    "Greetings from Educational Academy.\n"
                    "This is a gentle reminder regarding your {{course}} course fee dues for Batch {{batch}}.\n\n"
                    "📊 Fee Details:\n"
                    "• Total Fee: ₹{{total_fee}}\n"
                    "• Amount Paid: ₹{{paid_amount}}\n"
                    "• Pending Balance Due: ₹{{balance_due}}\n\n"
                    "Kindly clear the pending balance at your earliest convenience via PhonePe/GPay or Office counter.\n"
                    "For any queries, please call us directly.\n\n"
                    "Thank you!"
                )
            )

    @classmethod
    def import_degree_sheet(cls, filepath):
        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet = wb["Sheet1"]
        program, _ = AcademicProgram.objects.get_or_create(
            code="DEGREE",
            defaults={"name": "Degree (3-Year Program)", "duration_years": 3, "description": "B.A., B.Com, B.Sc Undergraduate Programs"}
        )
        batch, _ = Batch.objects.get_or_create(
            program=program,
            batch_name="Degree 2026-27",
            defaults={"academic_year": "2026-2027"}
        )

        # Register custom fields for Degree
        CustomFieldDefinition.objects.get_or_create(
            program=program, field_key="deb",
            defaults={"field_label": "DEB Enrolment ID", "field_type": "text"}
        )
        CustomFieldDefinition.objects.get_or_create(
            program=program, field_key="provisional_no",
            defaults={"field_label": "Provisional Admission No", "field_type": "text"}
        )
        CustomFieldDefinition.objects.get_or_create(
            program=program, field_key="ssc",
            defaults={"field_label": "SSC / Hall Ticket No", "field_type": "text"}
        )

        rows = list(sheet.iter_rows(values_only=True))
        created_count = 0
        for r in rows[1:]: # skip header
            if not r or len(r) < 2 or not r[1]:
                continue
            name = clean_str(r[1])
            if not name or name.lower() == "name":
                continue

            group = clean_str(r[2]) if len(r) > 2 else ""
            total_fee = parse_decimal(r[3]) if len(r) > 3 else Decimal("0.00")
            paid = parse_decimal(r[4]) if len(r) > 4 else Decimal("0.00")
            c_type = clean_str(r[6]) if len(r) > 6 else "WITHOUT"
            ref_raw = clean_str(r[7]) if len(r) > 7 else ""
            contact1 = clean_phone(r[8]) if len(r) > 8 else ""
            contact2 = clean_phone(r[9]) if len(r) > 9 else ""
            deb = clean_str(r[10]) if len(r) > 10 else ""
            prov = clean_str(r[11]) if len(r) > 11 else ""
            ssc = clean_str(r[12]) if len(r) > 12 else ""
            center_code = clean_str(r[13]) if len(r) > 13 else ""
            exam_fee = parse_decimal(r[14]) if len(r) > 14 else Decimal("0.00")

            center = None
            if center_code:
                center, _ = Center.objects.get_or_create(
                    code=center_code,
                    defaults={"name": center_code}
                )

            reference = None
            if ref_raw:
                rname, rphone = parse_reference(ref_raw)
                reference, _ = ReferencePerson.objects.get_or_create(
                    name=rname,
                    defaults={"phone": rphone}
                )

            student = Student.objects.create(
                batch=batch,
                center=center,
                reference=reference,
                name=name,
                group=group,
                candidate_type=c_type or "WITHOUT",
                primary_contact=contact1,
                secondary_contact=contact2,
                registration_no=prov,
                custom_fields={
                    "deb": deb,
                    "provisional_no": prov,
                    "ssc": ssc,
                }
            )

            # Year 1 Fee
            year_fee = AcademicYearFee.objects.create(
                student=student,
                year_index=1,
                base_annual_fee=total_fee,
                remarks="Year 1 Annual Tuition"
            )

            # Exam / Center Fee line item if present
            if exam_fee > 0:
                CustomFeeLineItem.objects.create(
                    year_fee=year_fee,
                    title="University / Center Fee",
                    amount=exam_fee
                )

            # Payment
            if paid > 0:
                PaymentTransaction.objects.create(
                    year_fee=year_fee,
                    amount=paid,
                    payment_date=timezone.now().date(),
                    payment_mode="PHONEPE" if paid >= 5000 else "CASH",
                    notes="Initial payment recorded in spreadsheet"
                )
            created_count += 1

        return created_count

    @classmethod
    def import_26a_sheet(cls, filepath):
        wb = openpyxl.load_workbook(filepath, data_only=True)
        program = AcademicProgram.objects.filter(code="DEGREE").first()
        if not program:
            program, _ = AcademicProgram.objects.get_or_create(
                code="DEGREE",
                defaults={"name": "Degree (3-Year Program)", "duration_years": 3}
            )
        batch, _ = Batch.objects.get_or_create(
            program=program,
            batch_name="26A",
            defaults={"academic_year": "2026-2027"}
        )

        count = 0
        for sheetname in wb.sheetnames:
            sheet = wb[sheetname]
            rows = list(sheet.iter_rows(values_only=True))
            c_type = "WITH" if "WITH" in str(sheetname) or (len(rows) > 0 and "WITH CANDIDATES" in str(rows[0][0])) else "WITHOUT"
            
            for r in rows[2:]: # skip titles
                if not r or len(r) < 3 or not r[1]:
                    continue
                name = clean_str(r[1])
                if not name:
                    continue
                group = clean_str(r[2]) if len(r) > 2 else ""
                center_code = clean_str(r[3]) if len(r) > 3 else ""
                student_id = clean_str(r[4]) if len(r) > 4 else ""

                center = None
                if center_code:
                    center, _ = Center.objects.get_or_create(
                        code=center_code,
                        defaults={"name": center_code}
                    )

                # Find existing student or create new
                student = Student.objects.filter(name__iexact=name, batch=batch).first()
                if not student:
                    student = Student.objects.create(
                        batch=batch,
                        center=center,
                        student_id=student_id,
                        name=name,
                        group=group,
                        candidate_type=c_type,
                        primary_contact="",
                    )
                    # Create default year 1 fee structure
                    AcademicYearFee.objects.create(
                        student=student,
                        year_index=1,
                        base_annual_fee=Decimal("15000.00"),
                        remarks="Year 1 Annual Fee (Batch 26A)"
                    )
                    count += 1
                else:
                    if student_id:
                        student.student_id = student_id
                        student.save()

        return count

    @classmethod
    def import_pg_sheet(cls, filepath):
        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet = wb["Sheet1"]
        program, _ = AcademicProgram.objects.get_or_create(
            code="PG",
            defaults={"name": "Post Graduate (2-Year Program)", "duration_years": 2, "description": "M.A., M.Sc, M.Com Master Programs"}
        )
        batch, _ = Batch.objects.get_or_create(
            program=program,
            batch_name="PG 2026-27",
            defaults={"academic_year": "2026-2027"}
        )

        rows = list(sheet.iter_rows(values_only=True))
        count = 0
        for r in rows[1:]:
            if not r or len(r) < 2 or not r[1]:
                continue
            name = clean_str(r[1])
            if not name:
                continue

            group = clean_str(r[2]) if len(r) > 2 else ""
            total_fee = parse_decimal(r[3]) if len(r) > 3 else Decimal("0.00")
            paid = parse_decimal(r[4]) if len(r) > 4 else Decimal("0.00")
            ref_raw = clean_str(r[6]) if len(r) > 6 else ""
            c_type = clean_str(r[7]) if len(r) > 7 else "WITH"
            contact1 = clean_phone(r[8]) if len(r) > 8 else ""
            contact2 = clean_phone(r[9]) if len(r) > 9 else ""
            deb = clean_str(r[10]) if len(r) > 10 else ""
            ssc = clean_str(r[11]) if len(r) > 11 else ""
            prov = clean_str(r[12]) if len(r) > 12 else ""
            center_code = clean_str(r[13]) if len(r) > 13 else ""
            exam_fee = parse_decimal(r[14]) if len(r) > 14 else Decimal("0.00")

            center = None
            if center_code:
                center, _ = Center.objects.get_or_create(code=center_code, defaults={"name": center_code})

            reference = None
            if ref_raw:
                rname, rphone = parse_reference(ref_raw)
                reference, _ = ReferencePerson.objects.get_or_create(name=rname, defaults={"phone": rphone})

            student = Student.objects.create(
                batch=batch,
                center=center,
                reference=reference,
                name=name,
                group=group,
                candidate_type=c_type,
                primary_contact=contact1,
                secondary_contact=contact2,
                registration_no=prov,
                custom_fields={
                    "deb": deb,
                    "provisional_no": prov,
                    "ssc": ssc,
                }
            )

            year_fee = AcademicYearFee.objects.create(
                student=student,
                year_index=1,
                base_annual_fee=total_fee,
                remarks="Year 1 PG Fee"
            )

            if exam_fee > 0:
                CustomFeeLineItem.objects.create(
                    year_fee=year_fee,
                    title="Center / University Fee",
                    amount=exam_fee
                )

            if paid > 0:
                PaymentTransaction.objects.create(
                    year_fee=year_fee,
                    amount=paid,
                    payment_date=timezone.now().date(),
                    payment_mode="PHONEPE",
                    notes="Initial PG fee payment"
                )
            count += 1
        return count

    @classmethod
    def import_inter_sheet(cls, filepath):
        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet = wb["Sheet1"]
        program, _ = AcademicProgram.objects.get_or_create(
            code="INTER",
            defaults={"name": "Open School Intermediate (1 Year)", "duration_years": 1, "description": "APOSS Intermediate Course"}
        )
        batch, _ = Batch.objects.get_or_create(
            program=program,
            batch_name="Inter 2026-2027 Batch",
            defaults={"academic_year": "2026-2027"}
        )

        rows = list(sheet.iter_rows(values_only=True))
        count = 0
        for r in rows[1:]:
            if not r or len(r) < 2 or not r[1]:
                continue
            name = clean_str(r[1])
            if not name:
                continue

            contact = clean_phone(r[2]) if len(r) > 2 else ""
            group = clean_str(r[3]) if len(r) > 3 else ""
            total_fee = parse_decimal(r[4]) if len(r) > 4 else Decimal("0.00")
            paid = parse_decimal(r[5]) if len(r) > 5 else Decimal("0.00")
            c_type = clean_str(r[7]) if len(r) > 7 else "WITHOUT"
            ref_raw = clean_str(r[8]) if len(r) > 8 else ""
            reg_no = clean_str(r[9]) if len(r) > 9 else ""
            status = clean_str(r[10]) if len(r) > 10 else "Submitted"

            reference = None
            if ref_raw:
                rname, rphone = parse_reference(ref_raw)
                reference, _ = ReferencePerson.objects.get_or_create(name=rname, defaults={"phone": rphone})

            student = Student.objects.create(
                batch=batch,
                reference=reference,
                name=name,
                group=group,
                candidate_type=c_type,
                primary_contact=contact,
                registration_no=reg_no,
                admission_status=status or "Submitted",
            )

            year_fee = AcademicYearFee.objects.create(
                student=student,
                year_index=1,
                base_annual_fee=total_fee,
                remarks="Open School Intermediate Course Fee"
            )

            if paid > 0:
                PaymentTransaction.objects.create(
                    year_fee=year_fee,
                    amount=paid,
                    payment_date=timezone.now().date(),
                    payment_mode="PHONEPE" if paid >= 5000 else "CASH",
                    notes="Initial Open School Inter payment"
                )
            count += 1
        return count

    @classmethod
    def import_ssc_sheet(cls, filepath):
        wb = openpyxl.load_workbook(filepath, data_only=True)
        sheet = wb["Sheet1"]
        program, _ = AcademicProgram.objects.get_or_create(
            code="SSC",
            defaults={"name": "Open School SSC 10th (1 Year)", "duration_years": 1, "description": "APOSS SSC 10th Class Course"}
        )
        batch, _ = Batch.objects.get_or_create(
            program=program,
            batch_name="SSC 2026-2027 Batch",
            defaults={"academic_year": "2026-2027"}
        )

        rows = list(sheet.iter_rows(values_only=True))
        count = 0
        for r in rows[1:]:
            if not r or len(r) < 2 or not r[1]:
                continue
            name = clean_str(r[1])
            if not name:
                continue

            contact = clean_phone(r[2]) if len(r) > 2 else ""
            total_fee = parse_decimal(r[3]) if len(r) > 3 else Decimal("0.00")
            paid = parse_decimal(r[4]) if len(r) > 4 else Decimal("0.00")
            c_type = clean_str(r[6]) if len(r) > 6 else "WITHOUT"
            ref_raw = clean_str(r[7]) if len(r) > 7 else ""
            num_sub = parse_decimal(r[8]) if len(r) > 8 else None
            reg_no = clean_str(r[9]) if len(r) > 9 else ""
            status = clean_str(r[10]) if len(r) > 10 else "Submitted"

            reference = None
            if ref_raw:
                rname, rphone = parse_reference(ref_raw)
                reference, _ = ReferencePerson.objects.get_or_create(name=rname, defaults={"phone": rphone})

            student = Student.objects.create(
                batch=batch,
                reference=reference,
                name=name,
                candidate_type=c_type,
                primary_contact=contact,
                number_of_subjects=int(num_sub) if num_sub else 6,
                registration_no=reg_no,
                admission_status=status or "Submitted",
            )

            year_fee = AcademicYearFee.objects.create(
                student=student,
                year_index=1,
                base_annual_fee=total_fee,
                remarks="Open School SSC 10th Fee"
            )

            if paid > 0:
                PaymentTransaction.objects.create(
                    year_fee=year_fee,
                    amount=paid,
                    payment_date=timezone.now().date(),
                    payment_mode="PHONEPE" if paid >= 5000 else "CASH",
                    notes="Initial Open School SSC payment"
                )
            count += 1
        return count
