from decimal import Decimal
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from .models import (
    AcademicProgram, Batch, Center, ReferencePerson,
    Student, AcademicYearFee, CustomFeeLineItem,
    PaymentTransaction, CustomFieldDefinition, UserRoleProfile,
    WhatsAppTemplate, InstitutionSettings, PasswordResetRequest
)


class ModelAndBusinessLogicTests(TestCase):
    """Exhaustive tests for data models, calculation properties, and integrity constraints"""

    def setUp(self):
        self.program_deg = AcademicProgram.objects.create(
            name="Degree (3 Years)", code="DEGREE", duration_years=3
        )
        self.program_ssc = AcademicProgram.objects.create(
            name="Open School SSC", code="SSC", duration_years=1
        )
        self.center = Center.objects.create(
            code="106- JK", name="JK College Center", contact_number="9848011223"
        )
        self.reference = ReferencePerson.objects.create(
            name="Jayram", phone="9988776655", designation="Coordinator"
        )
        self.batch_deg = Batch.objects.create(
            program=self.program_deg,
            batch_name="26A Degree",
            academic_year="2026-2027",
            default_base_fee=Decimal("25000.00")
        )
        self.batch_deg.centers.add(self.center)

        self.student = Student.objects.create(
            batch=self.batch_deg,
            center=self.center,
            reference=self.reference,
            student_id="26A106BA001",
            registration_no="SDE1001",
            hall_ticket_no="HT2026001",
            admission_no="ADM2026001",
            name="Dalli Srinivas Reddy",
            group="B.A",
            primary_contact="9848022338",
            secondary_contact="9848022339"
        )
        self.year_fee_1 = AcademicYearFee.objects.create(
            student=self.student,
            year_index=1,
            base_annual_fee=Decimal("25000.00")
        )
        self.year_fee_2 = AcademicYearFee.objects.create(
            student=self.student,
            year_index=2,
            base_annual_fee=Decimal("25000.00")
        )

    def test_student_total_fee_and_balance_calculation(self):
        # 2 years * 25,000 = 50,000 fee
        self.assertEqual(self.student.total_fee_amount, Decimal("50000.00"))
        self.assertEqual(self.student.total_paid_amount, Decimal("0.00"))
        self.assertEqual(self.student.total_balance_due, Decimal("50000.00"))
        self.assertEqual(self.student.payment_percentage, 0.0)
        self.assertEqual(self.student.fee_status, "UNPAID")

    def test_scholarship_discount_application(self):
        # Apply ₹5,000 concession on Year 1
        self.year_fee_1.discount_amount = Decimal("5000.00")
        self.year_fee_1.remarks = "Merit Scholarship Approved"
        self.year_fee_1.save()

        self.assertEqual(self.year_fee_1.total_billed, Decimal("20000.00"))
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("45000.00"))
        self.assertEqual(self.student.total_balance_due, Decimal("45000.00"))

    def test_custom_line_items_addition_and_recalculation(self):
        # Add special coaching fee of ₹2,400 to Year 1
        item = CustomFeeLineItem.objects.create(
            year_fee=self.year_fee_1,
            title="Special Coaching Fee",
            amount=Decimal("2400.00")
        )
        self.assertEqual(self.year_fee_1.total_line_items_amount, Decimal("2400.00"))
        self.assertEqual(self.year_fee_1.total_billed, Decimal("27400.00"))

        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("52400.00"))

        # Modify item amount to ₹3,000
        item.amount = Decimal("3000.00")
        item.save()
        self.year_fee_1.refresh_from_db()
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("53000.00"))

        # Delete line item
        item.delete()
        self.year_fee_1.refresh_from_db()
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("50000.00"))

    def test_multi_installment_payments_and_status_transitions(self):
        # Installment 1: ₹10,000 on Year 1
        PaymentTransaction.objects.create(
            year_fee=self.year_fee_1,
            amount=Decimal("10000.00"),
            payment_mode="PHONEPE"
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_paid_amount, Decimal("10000.00"))
        self.assertEqual(self.student.total_balance_due, Decimal("40000.00"))
        self.assertEqual(self.student.payment_percentage, 20.0)
        self.assertEqual(self.student.fee_status, "PARTIAL")

        # Installment 2: ₹15,000 on Year 1 (clears Year 1)
        PaymentTransaction.objects.create(
            year_fee=self.year_fee_1,
            amount=Decimal("15000.00"),
            payment_mode="CASH"
        )
        self.year_fee_1.refresh_from_db()
        self.assertEqual(self.year_fee_1.balance_due, Decimal("0.00"))

        # Installment 3: ₹25,000 on Year 2 (clears total course fee)
        PaymentTransaction.objects.create(
            year_fee=self.year_fee_2,
            amount=Decimal("25000.00"),
            payment_mode="GPAY"
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_paid_amount, Decimal("50000.00"))
        self.assertEqual(self.student.total_balance_due, Decimal("0.00"))
        self.assertEqual(self.student.payment_percentage, 100.0)
        self.assertEqual(self.student.fee_status, "PAID")

    def test_safe_center_and_reference_unlinking(self):
        # Center deletion unlinks student without cascade deleting the student record
        center_id = self.center.id
        self.center.delete()
        self.student.refresh_from_db()
        self.assertIsNone(self.student.center)

        # Reference deletion unlinks student safely
        self.reference.delete()
        self.student.refresh_from_db()
        self.assertIsNone(self.student.reference)

    def test_institution_settings_defaults_and_updates(self):
        settings = InstitutionSettings.objects.create(
            institution_name="Navodaya Educational Academy",
            short_name="Navodaya",
            support_phone="+91 98494 60071"
        )
        self.assertEqual(str(settings), "Navodaya Educational Academy")
        self.assertTrue(settings.smtp_use_tls)
        self.assertEqual(settings.current_academic_year, "2026-2027")


class APIEndpointTests(TestCase):
    """Exhaustive tests for all REST API endpoints and query parameters"""

    def setUp(self):
        self.client = APIClient()
        self.program = AcademicProgram.objects.create(
            name="Degree (3 Years)", code="DEGREE", duration_years=3
        )
        self.center = Center.objects.create(code="106- JK", name="JK Center")
        self.batch = Batch.objects.create(
            program=self.program,
            batch_name="26A",
            academic_year="2026-2027"
        )
        self.batch.centers.add(self.center)

        self.student = Student.objects.create(
            batch=self.batch,
            center=self.center,
            student_id="26A106BA058",
            admission_no="ADM058",
            hall_ticket_no="HT058",
            name="Dalli Srinivas Reddy",
            group="B.A",
            primary_contact="9848022338"
        )
        self.year_fee = AcademicYearFee.objects.create(
            student=self.student,
            year_index=1,
            base_annual_fee=Decimal("25000.00")
        )

        # WhatsApp template
        self.wa_template = WhatsAppTemplate.objects.create(
            title="Standard Due Reminder",
            message_text="Hello {{student_name}}, your outstanding balance is ₹{{balance_due}}.",
            is_default=True
        )

    def test_student_list_and_search_endpoints(self):
        # Search by student name
        res = self.client.get("/api/students/?search=Srinivas")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        # Search by hall ticket number
        res = self.client.get("/api/students/?search=HT058")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        # Search by admission number
        res = self.client.get("/api/students/?search=ADM058")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        # Search non-existent
        res = self.client.get("/api/students/?search=NonExistentPerson")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 0)

    def test_student_filtering_by_program_batch_center_fee_status(self):
        # Filter by batch
        res = self.client.get(f"/api/students/?batch={self.batch.id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        # Filter by fee status
        res = self.client.get("/api/students/?fee_status=UNPAID")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        res = self.client.get("/api/students/?fee_status=PAID")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 0)

    def test_record_payment_endpoint(self):
        res = self.client.post(f"/api/students/{self.student.id}/record_payment/", {
            "amount": "12000",
            "year_index": 1,
            "payment_mode": "PHONEPE",
            "notes": "First installment payment"
        })
        self.assertEqual(res.status_code, 201)
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_paid_amount, Decimal("12000.00"))
        self.assertEqual(self.student.total_balance_due, Decimal("13000.00"))
        self.assertEqual(self.student.fee_status, "PARTIAL")

    def test_add_custom_line_item_endpoint(self):
        res = self.client.post(f"/api/students/{self.student.id}/add_line_item/", {
            "title": "Semester Exam Fee",
            "amount": "1500",
            "year_index": 1,
            "is_optional": False
        })
        self.assertEqual(res.status_code, 201)
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("26500.00"))

    def test_patch_and_delete_custom_fee_line_item_viewset(self):
        # Create a line item
        item = CustomFeeLineItem.objects.create(
            year_fee=self.year_fee,
            title="Lab Charges",
            amount=Decimal("2000.00")
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("27000.00"))

        # PATCH /api/line-items/<id>/ to update amount
        patch_res = self.client.patch(f"/api/line-items/{item.id}/", {
            "title": "Advanced Lab Charges",
            "amount": "3000.00"
        }, format="json")
        self.assertEqual(patch_res.status_code, 200)
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("28000.00"))

        # DELETE /api/line-items/<id>/
        del_res = self.client.delete(f"/api/line-items/{item.id}/")
        self.assertEqual(del_res.status_code, 200)
        self.student.refresh_from_db()
        self.assertEqual(self.student.total_fee_amount, Decimal("25000.00"))

    def test_patch_academic_year_fee_viewset(self):
        # Update discount / concession
        res = self.client.patch(f"/api/year-fees/{self.year_fee.id}/", {
            "discount_amount": "3000.00",
            "remarks": "Staff Child Concession"
        }, format="json")
        self.assertEqual(res.status_code, 200)

        self.year_fee.refresh_from_db()
        self.assertEqual(self.year_fee.discount_amount, Decimal("3000.00"))
        self.assertEqual(self.year_fee.remarks, "Staff Child Concession")
        self.assertEqual(self.year_fee.total_billed, Decimal("22000.00"))

    def test_kpi_endpoint_aggregations_and_filters(self):
        # Global KPIs
        res = self.client.get("/api/kpis/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["total_students"], 1)
        self.assertEqual(Decimal(str(res.data["total_expected"])), Decimal("25000.00"))
        self.assertEqual(res.data["unpaid_count"], 1)
        self.assertIn("program_breakdown", res.data)
        self.assertTrue(len(res.data["program_breakdown"]) >= 1)

        # Center filter
        res_center = self.client.get(f"/api/kpis/?center={self.center.id}")
        self.assertEqual(res_center.status_code, 200)
        self.assertEqual(res_center.data["total_students"], 1)

    def test_whatsapp_link_with_template_placeholders(self):
        res = self.client.get(f"/api/students/{self.student.id}/whatsapp_link/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("whatsapp_url", res.data)
        url = res.data["whatsapp_url"]
        self.assertIn("wa.me/919848022338", url)
        self.assertIn("Dalli%20Srinivas%20Reddy", url)

    def test_caller_role_field_masking(self):
        # Caller sees total_balance_due but total_fee_amount is masked
        res = self.client.get(f"/api/students/{self.student.id}/?role_view=TEACHER_CALLER")
        self.assertEqual(res.status_code, 200)
        self.assertIsNone(res.data["total_fee_amount"])
        self.assertIsNotNone(res.data["total_balance_due"])

    def test_forgot_and_reset_password_flow(self):
        user = User.objects.create_user(
            username="testuser",
            email="testuser@navodaya.edu",
            password="oldpassword123"
        )

        # 1. Forgot password request
        forgot_res = self.client.post("/api/auth/forgot-password/", {
            "email": "testuser@navodaya.edu"
        }, format="json")
        self.assertEqual(forgot_res.status_code, 200)
        self.assertIn("demo_code", forgot_res.data)
        otp = forgot_res.data["demo_code"]

        # 2. Reset password with correct OTP
        reset_res = self.client.post("/api/auth/reset-password/", {
            "email": "testuser@navodaya.edu",
            "otp_code": otp,
            "new_password": "NewStrongPassword456"
        }, format="json")
        self.assertEqual(reset_res.status_code, 200)
        self.assertTrue(reset_res.data["success"])

        # Verify new password works
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewStrongPassword456"))

        # Re-using same OTP should fail
        reuse_res = self.client.post("/api/auth/reset-password/", {
            "email": "testuser@navodaya.edu",
            "otp_code": otp,
            "new_password": "AnotherPassword789"
        }, format="json")
        self.assertEqual(reuse_res.status_code, 400)
