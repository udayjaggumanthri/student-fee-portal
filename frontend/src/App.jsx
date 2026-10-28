import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrandingProvider } from './context/BrandingContext';
import DesktopSidebar from './components/layout/DesktopSidebar';
import DesktopHeader from './components/layout/DesktopHeader';
import MobileHeader from './components/layout/MobileHeader';
import MobileBottomNav from './components/layout/MobileBottomNav';
import MobileDrawer from './components/layout/MobileDrawer';

// Views
import LoginView from './components/views/LoginView';
import DashboardView from './components/views/DashboardView';
import StudentsView from './components/views/StudentsView';
import RecordPaymentView from './components/views/RecordPaymentView';
import StudentProfileView from './components/views/StudentProfileView';
import FeeStructureView from './components/views/FeeStructureView';
import BatchesView from './components/views/BatchesView';
import PaymentsView from './components/views/PaymentsView';
import ReportsView from './components/views/ReportsView';
import CommunicationsView from './components/views/CommunicationsView';
import UsersRolesView from './components/views/UsersRolesView';
import ReferenceContactsView from './components/views/ReferenceContactsView';
import SettingsView from './components/views/SettingsView';
import MobileMoreMenu from './components/views/MobileMoreMenu';
import ExcelImportWizard from './components/views/ExcelImportWizard';
import FeeCollectionHub from './components/views/FeeCollectionHub';

// Modals
import WhatsAppModal from './components/WhatsAppModal';
import ReceiptModal from './components/ReceiptModal';
import AddBatchModal from './components/AddBatchModal';
import AddStudentModal from './components/AddStudentModal';

import { api } from './services/api';

function MainAppShell() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Academic Workspace
  const [academicWorkspace, setAcademicWorkspace] = useState('all');

  // Selected entities
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [candidateType, setCandidateType] = useState('all');
  const [feeStatus, setFeeStatus] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState(null);

  // Modals
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppStudent, setWhatsAppStudent] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptStudent, setReceiptStudent] = useState(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Data state
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [centers, setCenters] = useState([]);
  const [students, setStudents] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load Metadata
  const loadMetadata = async () => {
    try {
      const [bData, pData, cData] = await Promise.all([
        api.getBatches(),
        api.getPrograms(),
        api.getCenters()
      ]);
      setBatches(bData || []);
      setPrograms(pData || []);
      setCenters(cData || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync workspace with batch filter
  useEffect(() => {
    if (academicWorkspace === 'all') {
      setSelectedBatch('all');
    } else if (academicWorkspace === 'degree') {
      const match = batches.find((b) => b.batch_name.includes('26A') || b.batch_name.toLowerCase().includes('degree'));
      if (match) setSelectedBatch(String(match.id));
    } else if (academicWorkspace === 'pg') {
      const match = batches.find((b) => b.batch_name.includes('PG'));
      if (match) setSelectedBatch(String(match.id));
    } else if (academicWorkspace === 'inter') {
      const match = batches.find((b) => b.batch_name.includes('Inter'));
      if (match) setSelectedBatch(String(match.id));
    } else if (academicWorkspace === 'ssc') {
      const match = batches.find((b) => b.batch_name.includes('SSC'));
      if (match) setSelectedBatch(String(match.id));
    }
  }, [academicWorkspace, batches]);

  // Load KPI & Students
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        role_view: role,
        batch: selectedBatch,
        program: selectedProgram,
        center: selectedCenter,
        candidate_type: candidateType,
        fee_status: feeStatus,
        search: search.trim()
      };

      const [kpiRes, sRes] = await Promise.all([
        api.getKPIs({ batch: selectedBatch, program: selectedProgram }),
        api.getStudents(params)
      ]);

      setKpiData(kpiRes);
      setStudents(sRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [role, selectedBatch, selectedProgram, selectedCenter, candidateType, feeStatus, search]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(t);
  }, [loadData]);

  // Payment recording handler
  const handleSavePayment = async (studentId, formData) => {
    await api.recordPayment(studentId, formData);
    await loadData();
    const bData = await api.getBatches();
    setBatches(bData);
  };

  const handleOpenWhatsApp = (student) => {
    setWhatsAppStudent(student);
    setShowWhatsAppModal(true);
  };

  const handleViewReceipt = (student) => {
    setReceiptStudent(student);
    setShowReceiptModal(true);
  };

  const handleExportExcel = () => {
    const url = api.getExportExcelUrl({
      batch: selectedBatch,
      fee_status: feeStatus
    });
    window.open(url, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="edufee-app-shell">
      {/* Desktop Left Navigation Sidebar */}
      <DesktopSidebar />

      <div className="edufee-main-wrapper">
        {/* Desktop Top Header */}
        <DesktopHeader
          search={search}
          setSearch={setSearch}
          academicWorkspace={academicWorkspace}
          setAcademicWorkspace={setAcademicWorkspace}
          programs={programs}
        />

        {/* Mobile Top Header with Hamburger Drawer Trigger */}
        <MobileHeader
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* Content Body Router */}
        <main className="edufee-content-area">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  kpiData={kpiData}
                  programs={programs}
                  batches={batches}
                  academicWorkspace={academicWorkspace}
                  setAcademicWorkspace={setAcademicWorkspace}
                  onOpenCollectPayment={() => navigate('/fee-collection')}
                  onNavigateToStudents={() => navigate('/students')}
                />
              }
            />

            <Route
              path="/students"
              element={
                <StudentsView
                  students={students}
                  batches={batches}
                  programs={programs}
                  centers={centers}
                  selectedBatch={selectedBatch}
                  setSelectedBatch={setSelectedBatch}
                  selectedProgram={selectedProgram}
                  setSelectedProgram={setSelectedProgram}
                  selectedCenter={selectedCenter}
                  setSelectedCenter={setSelectedCenter}
                  candidateType={candidateType}
                  setCandidateType={setCandidateType}
                  search={search}
                  setSearch={setSearch}
                  feeStatus={feeStatus}
                  setFeeStatus={setFeeStatus}
                  onViewProfile={(student) => {
                    setActiveStudent(student);
                    navigate(`/students/${student.student_id || student.id}`);
                  }}
                  onRecordPayment={(student) => {
                    setActiveStudent(student);
                    navigate(`/students/${student.student_id || student.id}/collect`);
                  }}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onExportExcel={handleExportExcel}
                  onOpenImport={() => setShowImportWizard(true)}
                  onAddStudent={(bId) => {
                    if (bId) setSelectedBatch(String(bId));
                    setShowAddStudentModal(true);
                  }}
                />
              }
            />

            <Route
              path="/students/:studentId"
              element={
                <StudentProfileView
                  student={activeStudent}
                  batches={batches}
                  onBack={() => navigate('/students')}
                  onRecordPayment={(student) => {
                    setActiveStudent(student);
                    navigate(`/students/${student.student_id || student.id}/collect`);
                  }}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onViewReceipt={handleViewReceipt}
                  onAddNote={() => {}}
                  onStudentUpdated={(updated) => {
                    setActiveStudent(updated);
                    loadData();
                  }}
                />
              }
            />

            <Route
              path="/students/:studentId/collect"
              element={
                <RecordPaymentView
                  student={activeStudent}
                  onBack={() => {
                    if (activeStudent) {
                      navigate(`/students/${activeStudent.student_id || activeStudent.id}`);
                    } else {
                      navigate('/students');
                    }
                  }}
                  onViewProfile={(student) => {
                    setActiveStudent(student);
                    navigate(`/students/${student.student_id || student.id}`);
                  }}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onViewReceipt={handleViewReceipt}
                  onSavePayment={handleSavePayment}
                />
              }
            />

            <Route
              path="/fee-collection"
              element={
                <FeeCollectionHub
                  students={students}
                  batches={batches}
                  programs={programs}
                  onCollectPaymentForStudent={(s) => {
                    setActiveStudent(s);
                    navigate(`/students/${s.student_id || s.id}/collect`);
                  }}
                  onOpenWhatsApp={handleOpenWhatsApp}
                  onViewProfile={(s) => {
                    setActiveStudent(s);
                    navigate(`/students/${s.student_id || s.id}`);
                  }}
                />
              }
            />

            <Route
              path="/batches"
              element={
                <BatchesView
                  batches={batches}
                  programs={programs}
                  loading={loading}
                  onSelectBatch={(bId) => {
                    setSelectedBatch(String(bId));
                    navigate(`/students?batch=${bId}`);
                  }}
                  onAddNewBatch={() => setShowAddBatchModal(true)}
                  onExportExcel={(bId) => {
                    const url = api.getExportExcelUrl({ batch: bId });
                    window.open(url, '_blank');
                  }}
                  onBatchUpdated={async () => {
                    await loadMetadata();
                    await loadData();
                  }}
                />
              }
            />

            <Route
              path="/reference-contacts"
              element={<ReferenceContactsView />}
            />

            <Route
              path="/fee-structure"
              element={
                <FeeStructureView
                  batches={batches}
                  programs={programs}
                  onInspectBatch={(bId) => {
                    setSelectedBatch(String(bId));
                    navigate(`/students?batch=${bId}`);
                  }}
                />
              }
            />

            <Route
              path="/payments"
              element={
                <PaymentsView
                  batches={batches}
                  programs={programs}
                  onRecordPayment={(s) => {
                    setActiveStudent(s);
                    navigate(`/students/${s.student_id || s.id}/collect`);
                  }}
                  onViewReceipt={handleViewReceipt}
                  onViewProfile={(s) => {
                    setActiveStudent(s);
                    navigate(`/students/${s.student_id || s.id}`);
                  }}
                  onExportExcel={handleExportExcel}
                />
              }
            />

            <Route
              path="/reports"
              element={<ReportsView onExportExcel={handleExportExcel} />}
            />

            <Route
              path="/communications"
              element={<CommunicationsView />}
            />

            <Route
              path="/users-roles"
              element={<UsersRolesView />}
            />

            <Route
              path="/settings"
              element={<SettingsView />}
            />

            <Route
              path="/more"
              element={<MobileMoreMenu />}
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Navigation Ribbon */}
        <MobileBottomNav
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
        />
      </div>

      {/* Slide-out Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />

      {/* Global Modals */}
      {showWhatsAppModal && whatsAppStudent && (
        <WhatsAppModal
          student={whatsAppStudent}
          onClose={() => {
            setShowWhatsAppModal(false);
            setWhatsAppStudent(null);
          }}
        />
      )}

      {showReceiptModal && receiptStudent && (
        <ReceiptModal
          student={receiptStudent}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptStudent(null);
          }}
        />
      )}

      {showImportWizard && (
        <ExcelImportWizard
          onClose={() => setShowImportWizard(false)}
          onImportComplete={async () => {
            await loadData();
            await loadMetadata();
          }}
        />
      )}

      {showAddBatchModal && (
        <AddBatchModal
          programs={programs}
          onClose={() => setShowAddBatchModal(false)}
          onSuccess={async () => {
            await loadMetadata();
            await loadData();
          }}
        />
      )}

      {showAddStudentModal && (
        <AddStudentModal
          batches={batches}
          programs={programs}
          initialBatchId={selectedBatch !== 'all' ? selectedBatch : null}
          onClose={() => setShowAddStudentModal(false)}
          onStudentCreated={async (newStudent) => {
            await loadData();
            await loadMetadata();
            if (newStudent) {
              setActiveStudent(newStudent);
              navigate(`/students/${newStudent.student_id || newStudent.id}`);
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrandingProvider>
          <MainAppShell />
        </BrandingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
