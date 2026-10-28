from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal

class AcademicProgram(models.Model):
    name = models.CharField(max_length=100) # e.g. "Degree (3 Years)", "PG (2 Years)", "Open School Inter", "Open School SSC"
    code = models.CharField(max_length=20, unique=True) # e.g. "DEGREE", "PG", "INTER", "SSC"
    duration_years = models.PositiveIntegerField(default=1) # 3 for Degree, 2 for PG, 1 for SSC/Inter
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.duration_years} Yr)"


class Center(models.Model):
    code = models.CharField(max_length=50, unique=True) # e.g. "106- JK", "141 - SR", "TUNI CENTER"
    name = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.code or self.name


class Batch(models.Model):
    program = models.ForeignKey(AcademicProgram, on_delete=models.CASCADE, related_name="batches")
    batch_name = models.CharField(max_length=100) # e.g. "26A", "Degree 2026-27", "PG 2026-27"
    academic_year = models.CharField(max_length=20, default="2026-2027")
    centers = models.ManyToManyField(Center, blank=True, related_name="batches")
    whatsapp_group_link = models.CharField(max_length=255, blank=True, default='')
    candidate_types = models.JSONField(default=list, blank=True) # e.g. ["WITH", "WITHOUT"]
    default_base_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Batches"
        ordering = ["-academic_year", "batch_name"]

    def __str__(self):
        return f"{self.batch_name} - {self.program.name}"


class ReferencePerson(models.Model):
    name = models.CharField(max_length=150) # e.g. "JAYRAM", "MASTER ANJI", "MADAM JYOTHI", "TATAJI"
    phone = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=100, blank=True, default='') # e.g. "Lecturer", "Agent", "Headmaster"
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.phone})" if self.phone else self.name


class CustomFieldDefinition(models.Model):
    FIELD_TYPES = (
        ("text", "Text"),
        ("number", "Number"),
        ("date", "Date"),
        ("phone", "Phone Number"),
        ("select", "Dropdown Selection"),
    )
    program = models.ForeignKey(AcademicProgram, on_delete=models.CASCADE, null=True, blank=True, related_name="custom_fields")
    field_label = models.CharField(max_length=100) # e.g. "Contact 3", "DEB ID", "Provisional No"
    field_key = models.SlugField(max_length=100)   # e.g. "contact_3", "deb_id"
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default="text")
    options = models.JSONField(default=list, blank=True) # dropdown options
    is_required = models.BooleanField(default=False)
    is_masked_for_callers = models.BooleanField(default=False)

    class Meta:
        unique_together = ("program", "field_key")

    def __str__(self):
        return f"{self.field_label} ({self.field_key})"


class Student(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="students")
    center = models.ForeignKey(Center, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")
    reference = models.ForeignKey(ReferencePerson, on_delete=models.SET_NULL, null=True, blank=True, related_name="students")
    
    student_id = models.CharField(max_length=50, blank=True, null=True, db_index=True) # e.g. "26A106BA058"
    registration_no = models.CharField(max_length=100, blank=True, null=True, db_index=True) # e.g. "APSSCRN26-1394B5", "SDE149503"
    admission_no = models.CharField(max_length=50, blank=True, null=True, db_index=True) # Future admission number
    hall_ticket_no = models.CharField(max_length=50, blank=True, null=True, db_index=True) # Future hall ticket number
    name = models.CharField(max_length=150, db_index=True)
    group = models.CharField(max_length=100, blank=True) # "BSC COMP", "BA", "BCOM", "BIPC", "MPC", "HEC"
    candidate_type = models.CharField(max_length=50, default="WITHOUT") # "WITH", "WITHOUT", "TUNI CENTER"
    
    primary_contact = models.CharField(max_length=20, blank=True, db_index=True)
    secondary_contact = models.CharField(max_length=20, blank=True)
    
    number_of_subjects = models.PositiveIntegerField(null=True, blank=True) # e.g. 6 for SSC
    admission_status = models.CharField(max_length=50, default="Submitted") # "Submitted", "Cancelled"
    
    # Dynamic JSONField for custom data ("deb", "provisional_no", "ssc", "contact_3", etc.)
    custom_fields = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} ({self.registration_no or self.student_id or self.id})"

    @property
    def total_fee_amount(self):
        """Calculates total fee across all academic years including custom line items"""
        total = Decimal('0.00')
        for yf in self.year_fees.all():
            total += yf.total_billed
        return total

    @property
    def total_paid_amount(self):
        """Calculates total paid across all academic years"""
        total = Decimal('0.00')
        for yf in self.year_fees.all():
            total += yf.total_paid
        return total

    @property
    def total_balance_due(self):
        return max(Decimal('0.00'), self.total_fee_amount - self.total_paid_amount)

    @property
    def payment_percentage(self):
        fee = self.total_fee_amount
        if fee <= 0:
            return 100 if self.total_paid_amount > 0 else 0
        pct = (self.total_paid_amount / fee) * 100
        return min(100, round(float(pct), 1))

    @property
    def fee_status(self):
        due = self.total_balance_due
        paid = self.total_paid_amount
        if due <= Decimal('0.00') and paid > Decimal('0.00'):
            return "PAID"
        elif paid > Decimal('0.00'):
            return "PARTIAL"
        return "UNPAID"


class AcademicYearFee(models.Model):
    """Represents a specific year's fee record (e.g. Year 1, Year 2, Year 3 for Degree, or single year for SSC/Inter)"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="year_fees")
    year_index = models.PositiveIntegerField(default=1) # 1, 2, or 3
    base_annual_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    remarks = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("student", "year_index")
        ordering = ["year_index"]

    def __str__(self):
        return f"{self.student.name} - Year {self.year_index}"

    @property
    def total_line_items_amount(self):
        return sum(item.amount for item in self.line_items.all()) or Decimal('0.00')

    @property
    def total_billed(self):
        net_base = max(Decimal('0.00'), self.base_annual_fee - self.discount_amount)
        return net_base + self.total_line_items_amount

    @property
    def total_paid(self):
        return sum(p.amount for p in self.payments.all()) or Decimal('0.00')

    @property
    def balance_due(self):
        return max(Decimal('0.00'), self.total_billed - self.total_paid)


class CustomFeeLineItem(models.Model):
    year_fee = models.ForeignKey(AcademicYearFee, on_delete=models.CASCADE, related_name="line_items")
    title = models.CharField(max_length=100) # e.g. "Special Coaching Fee", "University Exam Fee", "Assignment Fee", "Late Fine"
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    is_optional = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title}: ₹{self.amount}"


class PaymentTransaction(models.Model):
    year_fee = models.ForeignKey(AcademicYearFee, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(default=timezone.now, blank=True, null=True)
    payment_mode = models.CharField(
        max_length=30,
        choices=[
            ("CASH", "Cash"),
            ("PHONEPE", "PhonePe"),
            ("GPAY", "Google Pay"),
            ("UPI", "Other UPI"),
            ("NETBANKING", "Net Banking"),
            ("CHEQUE", "Cheque")
        ],
        default="CASH"
    )
    transaction_ref = models.CharField(max_length=100, blank=True)
    screenshot = models.ImageField(upload_to="payments/%Y/%m/", null=True, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date", "-id"]

    def __str__(self):
        return f"₹{self.amount} ({self.payment_mode}) - {self.payment_date}"


class UserRoleProfile(models.Model):
    ROLES = (
        ("ADMIN", "Administrator"),
        ("PRINCIPAL", "Principal / Academic Head"),
        ("TEACHER_CALLER", "Teacher / Fee Caller"),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="role_profile")
    role = models.CharField(max_length=20, choices=ROLES, default="TEACHER_CALLER")
    phone = models.CharField(max_length=20, blank=True)
    assigned_batches = models.ManyToManyField(Batch, blank=True, related_name="assigned_staff")
    
    # Granular Visibility & Privacy Controls
    can_view_total_fee = models.BooleanField(default=True)
    can_view_financial_analytics = models.BooleanField(default=False)
    can_edit_fee_structure = models.BooleanField(default=False)
    can_export_excel = models.BooleanField(default=True)
    hidden_custom_fields = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class WhatsAppTemplate(models.Model):
    title = models.CharField(max_length=100)
    message_text = models.TextField(help_text="Placeholders: {{student_name}}, {{course}}, {{batch}}, {{year}}, {{total_fee}}, {{paid_amount}}, {{balance_due}}")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class InstitutionSettings(models.Model):
    institution_name = models.CharField(max_length=200, default="Navodaya Educational Academy")
    tagline = models.CharField(max_length=255, default="School & Colleges • Fee Management System")
    short_name = models.CharField(max_length=50, default="Navodaya")
    logo_url = models.TextField(blank=True, default="")
    primary_color = models.CharField(max_length=30, default="#1E3A8A")
    accent_color = models.CharField(max_length=30, default="#2563EB")
    support_phone = models.CharField(max_length=50, default="+91 98494 60071")
    support_email = models.EmailField(default="support@navodaya.edu")
    address = models.TextField(default="D.No: 12-4-5, Main Road, Tuni & Kakinada Campuses, Andhra Pradesh")
    receipt_header = models.CharField(max_length=255, default="NAVODAYA EDUCATIONAL ACADEMY - OFFICIAL FEE RECEIPT")
    receipt_footer = models.CharField(max_length=255, default="Thank you for your payment. This is a computer generated receipt.")
    current_academic_year = models.CharField(max_length=20, default="2026-2027")

    # SMTP Configuration
    smtp_host = models.CharField(max_length=150, default="smtp.gmail.com")
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=150, blank=True, default="notifications@navodaya.edu")
    smtp_password = models.CharField(max_length=150, blank=True, default="")
    smtp_use_tls = models.BooleanField(default=True)
    smtp_use_ssl = models.BooleanField(default=False)
    smtp_from_email = models.EmailField(default="noreply@navodaya.edu")
    smtp_from_name = models.CharField(max_length=100, default="Navodaya Academy Administration")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.institution_name


class PasswordResetRequest(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} - OTP {self.otp_code}"

