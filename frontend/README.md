# EduFee Pro — Frontend Web Application

> **Enterprise-grade Student Fee & Academic Ledger Portal**  
> Built with **React 19**, **Vite 8**, and a custom responsive design system.

---

## 🚀 Key Highlights & Architecture

- **React 19 & Vite 8**: Ultra-fast Hot Module Replacement (HMR) and optimized sub-second production bundling.
- **WhatsApp Groups-Style Cohort Directory**: Modern cohort browser displaying batch capacity, collected percentage progress bars, and zero-scroll instant student listings.
- **Official 1-Page A4 Fee Summary Statement**: Fully compliant printable fee certificate with institution header, student bio, fee ledger table, payment transactions, and authorized signoff/seal blocks.
- **Institutional Multi-Theme & Branding Context**: Real-time institution branding configuration (logo, colors, currency, contact details) powered by `BrandingContext`.
- **Role-Based Access Control & Privacy Masking**: Dynamic view modes for Super Admin, Accountant, and Faculty with automatic masking of sensitive phone numbers and Aadhaar IDs.
- **Production-Ready Testing**: Comprehensive unit test suite with 35 passing tests powered by Vitest and `@testing-library/react`.

---

## 📁 Directory Structure

```text
frontend/
├── public/                 # Static assets & favicons
├── src/
│   ├── assets/             # Brand logos & graphics
│   ├── components/
│   │   ├── common/         # DesktopHeader, MobileHeader, Sidebar, Breadcrumbs, StatCard
│   │   ├── modals/         # StudentFeeStatementModal, AddStudentModal, RecordPaymentModal, etc.
│   │   └── views/          # DashboardView, StudentsView, StudentProfileView,
│   │                       # BatchesView, TransactionsView, SettingsView, etc.
│   ├── context/            # BrandingContext, AuthContext, ThemeContext
│   ├── services/           # api.js (Universal REST API client with error normalization)
│   ├── test/               # Vitest test specs (*.test.jsx, *.test.js)
│   ├── App.jsx             # Root application router & view switcher
│   ├── index.css           # Modern CSS token system, utility classes, and print styles
│   └── main.jsx            # Application entrypoint
├── index.html              # HTML5 entry with responsive viewport & font preloading
├── package.json            # Node dependencies and project scripts
├── vite.config.js          # Vite configuration with local proxy & Vitest setup
└── .env.example            # Environment variables template
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
Navigate into the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a local `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default parameters:
```env
# In local development, the relative /api prefix automatically routes
# to the Django backend via the Vite dev server proxy.
VITE_API_URL=/api
VITE_APP_NAME="EduFee Pro"
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🧪 Running Unit Tests

Run the full Vitest suite in single-run mode:
```bash
npm test -- --run
```
To run tests with watch mode:
```bash
npm test
```

---

## 📦 Production Build

To compile a minified, tree-shaken production bundle:
```bash
npm run build
```
The optimized static build is emitted to `frontend/dist/`.  
To preview the production build locally:
```bash
npm run preview
```

---

## 🎨 Design System & Print Engine

- **Tokens**: Defined in `:root` inside `src/index.css` using modern CSS variables (`--bg-primary`, `--accent-primary`, `--border-color`, `--text-primary`).
- **Dark/Light Mode**: Full automatic and toggleable theme support.
- **Print Engine**: The `@media print` rules format the `StudentFeeStatementModal` to strictly fit a single A4 page with high-contrast borders and sharp typography for paper receipts and PDF exports.
