# EduFee Pro — Backend REST API

> **High-Performance Academic Fee & Financial Ledger Backend**  
> Powered by **Python 3.10+**, **Django 5.1**, and **Django REST Framework (DRF)**.

---

## 🏛️ System Architecture

The EduFee Pro backend manages academic cohorts, multi-year student ledgers, installment schedules, dynamic fee line items, payment auditing, Excel ingestion/exports, and role-based permissions.

```text
backend/
├── billing/                # Core billing, students, batches & transactions application
│   ├── migrations/         # Django schema migration history
│   ├── admin.py            # Django Admin registration
│   ├── apps.py             # App configuration
│   ├── models.py           # Relational schema (Student, Batch, Payments, Ledger, etc.)
│   ├── serializers.py      # DRF ModelSerializers with validation
│   ├── services.py         # Business logic (Excel parser, ledger calculations, exports)
│   ├── tests.py            # Automated test suite (16 test cases)
│   ├── urls.py             # REST API routing
│   └── views.py            # API ViewSets and custom endpoints
├── fee_system/             # Root project package
│   ├── settings.py         # Django settings with environment variable overrides
│   ├── urls.py             # Root URL routing & media handlers
│   ├── asgi.py             # ASGI deployment entrypoint
│   └── wsgi.py             # WSGI deployment entrypoint (Gunicorn / uWSGI)
├── media/                  # Media directory (uploaded receipts & logos)
├── manage.py               # Django management CLI
├── requirements.txt        # Python dependency manifest
└── .env.example            # Environment variables template
```

---

## 📊 Core Data Models

| Model | Description |
| :--- | :--- |
| **`AcademicProgram`** | High-level degree or school track (Degree & PG, Open School, etc.). |
| **`Batch`** | Specific academic cohort (e.g., *B.Com Computer Applications 2026-2027*) with standard fee schedules and centers. |
| **`Center`** | Examination or branch study centers associated with cohorts. |
| **`ReferencePerson`** | Referral counselors, admission liaisons, and commission tracking. |
| **`Student`** | Student master record: admission number, hall ticket, contacts, batch assignment, and referral links. |
| **`AcademicYearFee`** | Yearly fee ledger per student, tracking base fees, concessions/discounts, paid amounts, and fee status (`PAID`, `PARTIAL`, `OVERDUE`). |
| **`CustomFeeLineItem`** | Granular fee heads (Lab Fee, Examination, Library, Uniform, Late Fine). |
| **`PaymentTransaction`** | Immutable financial audit ledger: amount, payment mode (UPI, Cash, NEFT, Cheque), reference numbers, and receipt receipts. |
| **`InstitutionSettings`** | Singleton configuration for institution name, logo, address, contact, and branding tokens. |
| **`UserRoleProfile`** | RBAC permission profiles (Super Admin, Accountant, Faculty) controlling data access and privacy masking. |

---

## 🌐 Key REST API Endpoints

All endpoints are mounted under `/api/`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/kpis/` | Real-time financial metrics (collections, dues, active cohorts, run rates). |
| `GET`, `POST` | `/api/students/` | List, filter, search, and register students. |
| `GET`, `PUT`, `PATCH` | `/api/students/{id}/` | Retrieve and update complete student profile. |
| `POST` | `/api/students/{id}/record_payment/` | Record payment transaction, apply to ledger, and generate receipt. |
| `GET` | `/api/students/{id}/whatsapp_link/` | Generate encoded WhatsApp URL with customized reminder text. |
| `GET`, `POST` | `/api/batches/` | Cohort directory and batch fee structure management. |
| `GET`, `POST` | `/api/programs/` | Academic program definitions. |
| `GET`, `POST` | `/api/centers/` | Campus and exam center roster. |
| `GET`, `POST` | `/api/references/` | Referral counselors roster and commission balances. |
| `GET`, `POST` | `/api/payments/` | Transaction audit log with date, mode, and reference filters. |
| `POST` | `/api/line-items/` | Add granular fee line item to a student ledger. |
| `PATCH` | `/api/line-items/{id}/` | Update line item amount or description. |
| `DELETE` | `/api/line-items/{id}/` | Remove custom fee line item. |
| `PATCH` | `/api/year-fees/{id}/` | Update annual discount concessions or remarks. |
| `GET` | `/api/export-excel/` | Export student rosters and financial statements to formatted Excel. |
| `GET`, `POST` | `/api/settings/institution/` | Fetch or update institutional branding and contact information. |
| `POST` | `/api/settings/test-smtp/` | Validate outbound SMTP server credentials. |

---

## 🛠️ Setup & Local Development

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.10, 3.11, 3.12)
- `pip` and `virtualenv`

### 2. Virtual Environment Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 5. Database Migrations
```bash
python manage.py migrate
```

### 6. Create Superuser (Admin Access)
```bash
python manage.py createsuperuser
```

### 7. Run Local Development Server
```bash
python manage.py runserver 127.0.0.1:8000
```

---

## 🧪 Running Automated Tests

Run the test suite with verbose reporting:
```bash
python manage.py test
```
All 16 test cases validate payment calculations, custom line items, fee statuses, and role-based permissions.

---

## 🚀 Production Deployment Checklist

1. Set `DJANGO_DEBUG=False` in `.env`.
2. Generate and set a unique, 50+ character `DJANGO_SECRET_KEY`.
3. Configure `DJANGO_ALLOWED_HOSTS` with your production domain name(s).
4. Configure `CORS_ALLOWED_ORIGINS` to allow your production frontend origin.
5. Point `DATABASES` to production PostgreSQL (`DATABASE_URL`).
6. Run `python manage.py collectstatic --noinput` to collect assets.
7. Serve with **Gunicorn** or **Uvicorn** behind an **Nginx** reverse proxy with SSL enabled (Let's Encrypt / Certbot).
