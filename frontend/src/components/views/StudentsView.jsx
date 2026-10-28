import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Download, Upload, Plus, Eye,
  MessageSquare, Phone, MoreVertical, User,
  X, SlidersHorizontal, ArrowLeft, Layers, TrendingUp, CheckCircle2, Sparkles, BookOpen,
  ArrowUpDown, ArrowUp, ArrowDown, Users, Check, ChevronDown, Award, Grid, List
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentsView({
  students = [],
  batches = [],
  programs = [],
  centers = [],
  selectedBatch = 'all',
  setSelectedBatch,
  selectedProgram = 'all',
  setSelectedProgram,
  selectedCenter,
  setSelectedCenter,
  candidateType,
  setCandidateType,
  search = '',
  setSearch,
  feeStatus = 'ALL',
  setFeeStatus,
  onViewProfile,
  onRecordPayment,
  onOpenWhatsApp,
  onExportExcel,
  onOpenImport,
  onAddStudent,
  defaultViewMode = 'batches'
}) {
  const { isCaller } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Group directory style: 'whatsapp' (WhatsApp Groups List) or 'grid' (Card Tiles)
  const [directoryStyle, setDirectoryStyle] = useState('whatsapp');

  // Desktop view mode: 'batches' (Browse Batches/Groups) or 'all' (Master Student Table)
  const urlBatch = searchParams.get('batch');
  const [desktopViewMode, setDesktopViewMode] = useState(() => {
    if (urlBatch && urlBatch !== 'all') return 'drilldown';
    if (selectedBatch && selectedBatch !== 'all') return 'drilldown';
    return defaultViewMode || 'batches';
  });

  // Batch search & filter in directory mode
  const [batchSearch, setBatchSearch] = useState('');
  const [batchProgramFilter, setBatchProgramFilter] = useState('all');

  // Course / Specialization Group filter ("course wise")
  const [selectedCourseGroup, setSelectedCourseGroup] = useState('all');

  // Sorting state: 'name_asc', 'name_desc', 'id_asc', 'id_desc', 'balance_desc', 'balance_asc', 'fee_desc'
  const [sortBy, setSortBy] = useState('name_asc');

  // Local state fallbacks if center or candidateType not lifted
  const [localCenter, setLocalCenter] = useState('all');
  const [localCandidateType, setLocalCandidateType] = useState('all');

  const activeCenter = selectedCenter !== undefined ? selectedCenter : localCenter;
  const setActiveCenter = setSelectedCenter || setLocalCenter;

  const activeCandidateType = candidateType !== undefined ? candidateType : localCandidateType;
  const setActiveCandidateType = setCandidateType || setLocalCandidateType;

  // Active batch identification
  const isBatchDrilldownActive = Boolean(selectedBatch && selectedBatch !== 'all');
  const activeBatchObject = useMemo(() => {
    return (batches || []).find((b) => String(b.id) === String(selectedBatch));
  }, [batches, selectedBatch]);

  // Students belonging to active batch (or all students if master)
  const cohortStudents = useMemo(() => {
    if (isBatchDrilldownActive) {
      return (students || []).filter((s) => String(s.batch) === String(selectedBatch));
    }
    return students || [];
  }, [students, isBatchDrilldownActive, selectedBatch]);

  // Active batch financial stats
  const activeBatchStats = useMemo(() => {
    const list = isBatchDrilldownActive ? cohortStudents : (students || []);
    const assessed = list.reduce((acc, s) => acc + Number(s.total_fee_amount || 0), 0);
    const paid = list.reduce((acc, s) => acc + Number(s.total_paid_amount || 0), 0);
    const due = list.reduce((acc, s) => acc + Number(s.total_balance_due || 0), 0);
    const pct = assessed > 0 ? Math.round((paid / assessed) * 100) : 0;
    return { count: list.length, assessed, paid, due, pct };
  }, [cohortStudents, students, isBatchDrilldownActive]);

  // Dynamic Course Groups present in current batch / roster
  const availableCourseGroups = useMemo(() => {
    const groupsMap = new Map();
    cohortStudents.forEach((s) => {
      const g = (s.group || '').trim();
      if (g) {
        groupsMap.set(g, (groupsMap.get(g) || 0) + 1);
      }
    });
    return Array.from(groupsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cohortStudents]);

  // Batch Summaries for Directory Mode
  const batchSummaries = useMemo(() => {
    return (batches || []).map((b) => {
      const bStudents = (students || []).filter((s) => String(s.batch) === String(b.id));
      const count = bStudents.length;
      const totalBilled = bStudents.reduce((acc, s) => acc + Number(s.total_fee_amount || 0), 0);
      const totalPaid = bStudents.reduce((acc, s) => acc + Number(s.total_paid_amount || 0), 0);
      const totalDue = bStudents.reduce((acc, s) => acc + Number(s.total_balance_due || 0), 0);
      const pct = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
      const prog = (programs || []).find((p) => String(p.id) === String(b.program)) || {};
      return {
        ...b,
        student_count: count,
        total_billed: totalBilled,
        total_paid: totalPaid,
        total_due: totalDue,
        collection_pct: pct,
        program_name: prog.name || b.program_name || 'Academic Program',
        program_code: prog.code || b.program_code || 'COURSE'
      };
    });
  }, [batches, students, programs]);

  // Filtered batches for Directory
  const filteredBatches = useMemo(() => {
    return batchSummaries.filter((b) => {
      if (batchProgramFilter !== 'all' && String(b.program) !== String(batchProgramFilter)) {
        return false;
      }
      if (!batchSearch.trim()) return true;
      const q = batchSearch.toLowerCase();
      return (
        (b.batch_name || '').toLowerCase().includes(q) ||
        (b.program_name || '').toLowerCase().includes(q) ||
        (b.program_code || '').toLowerCase().includes(q) ||
        (b.academic_year || '').toLowerCase().includes(q)
      );
    });
  }, [batchSummaries, batchProgramFilter, batchSearch]);

  // Sync from URL search params
  useEffect(() => {
    const batchParam = searchParams.get('batch');
    if (batchParam && batchParam !== 'all') {
      if (batchParam !== selectedBatch) {
        setSelectedBatch(batchParam);
      }
      setDesktopViewMode('drilldown');
    } else if (batchParam === 'all') {
      if (selectedBatch !== 'all') {
        setSelectedBatch('all');
      }
    }

    const programParam = searchParams.get('program');
    if (programParam && programParam !== selectedProgram) {
      setSelectedProgram(programParam);
    }
    const centerParam = searchParams.get('center');
    if (centerParam && centerParam !== activeCenter) {
      setActiveCenter(centerParam);
    }
    const candParam = searchParams.get('candidate_type') || searchParams.get('type');
    if (candParam && candParam !== activeCandidateType) {
      setActiveCandidateType(candParam);
    }
    const statusParam = searchParams.get('status');
    if (statusParam && statusParam !== feeStatus) {
      setFeeStatus(statusParam);
    }
    const queryParam = searchParams.get('q');
    if (queryParam !== null && queryParam !== search) {
      setSearch(queryParam);
    }
    const sortParam = searchParams.get('sort');
    if (sortParam && sortParam !== sortBy) {
      setSortBy(sortParam);
    }
    const courseParam = searchParams.get('course');
    if (courseParam && courseParam !== selectedCourseGroup) {
      setSelectedCourseGroup(courseParam);
    }
  }, [searchParams]);

  // Update URL search params
  const updateFilterParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'ALL') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Helper to drill into a batch
  const handleSelectBatch = (bId) => {
    const strId = String(bId);
    setSelectedBatch(strId);
    updateFilterParam('batch', strId);
    setSelectedCourseGroup('all');
    updateFilterParam('course', 'all');
    setDesktopViewMode('drilldown');
  };

  // Helper to exit batch and go back to Batches Directory
  const handleBackToBatches = () => {
    setSelectedBatch('all');
    updateFilterParam('batch', 'all');
    setSelectedCourseGroup('all');
    updateFilterParam('course', 'all');
    setDesktopViewMode('batches');
  };

  // Reference filter from URL if clicked from reference contacts
  const refFilter = searchParams.get('ref');

  // Filter students based on center, candidate_type, fee status, search, course group
  const filteredStudents = useMemo(() => {
    return cohortStudents.filter((s) => {
      if (activeCenter && activeCenter !== 'all') {
        if (String(s.center) !== String(activeCenter)) return false;
      }
      if (activeCandidateType && activeCandidateType !== 'all') {
        if (String(s.candidate_type || '').toUpperCase() !== activeCandidateType.toUpperCase()) return false;
      }
      if (refFilter) {
        if (String(s.reference) !== String(refFilter)) return false;
      }
      if (selectedCourseGroup && selectedCourseGroup !== 'all') {
        if ((s.group || '').trim().toLowerCase() !== selectedCourseGroup.trim().toLowerCase()) return false;
      }
      if (feeStatus && feeStatus !== 'ALL') {
        if (feeStatus === 'UNPAID') {
          if (s.fee_status !== 'UNPAID' && s.fee_status !== 'PENDING') return false;
        } else if (feeStatus === 'PARTIAL') {
          if (s.fee_status !== 'PARTIAL') return false;
        } else if (feeStatus === 'PAID') {
          if (s.fee_status !== 'PAID') return false;
        }
      }
      if (!isBatchDrilldownActive && selectedProgram && selectedProgram !== 'all') {
        if (String(s.program) !== String(selectedProgram)) return false;
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const idMatch = (s.student_id || s.registration_no || '').toLowerCase().includes(q);
        const ticketMatch = (s.hall_ticket_no || '').toLowerCase().includes(q);
        const phoneMatch = (s.primary_contact || '').includes(q);
        const groupMatch = (s.group || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !ticketMatch && !phoneMatch && !groupMatch) {
          return false;
        }
      }
      return true;
    });
  }, [cohortStudents, activeCenter, activeCandidateType, refFilter, selectedCourseGroup, feeStatus, isBatchDrilldownActive, selectedProgram, search]);

  // Sorting: Name, Roll ID, Balance, Fee Amount
  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    switch (sortBy) {
      case 'id_asc':
        return list.sort((a, b) => {
          const idA = a.student_id || a.registration_no || `STD${a.id}`;
          const idB = b.student_id || b.registration_no || `STD${b.id}`;
          return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
        });
      case 'id_desc':
        return list.sort((a, b) => {
          const idA = a.student_id || a.registration_no || `STD${a.id}`;
          const idB = b.student_id || b.registration_no || `STD${b.id}`;
          return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
        });
      case 'name_desc':
        return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'balance_desc':
        return list.sort((a, b) => Number(b.total_balance_due || 0) - Number(a.total_balance_due || 0));
      case 'balance_asc':
        return list.sort((a, b) => Number(a.total_balance_due || 0) - Number(b.total_balance_due || 0));
      case 'fee_desc':
        return list.sort((a, b) => Number(b.total_fee_amount || 0) - Number(a.total_fee_amount || 0));
      case 'name_asc':
      default:
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  }, [filteredStudents, sortBy]);

  // Column Header Sort Toggle
  const toggleSort = (col) => {
    let nextSort = 'name_asc';
    if (col === 'name') {
      nextSort = sortBy === 'name_asc' ? 'name_desc' : 'name_asc';
    } else if (col === 'id') {
      nextSort = sortBy === 'id_asc' ? 'id_desc' : 'id_asc';
    } else if (col === 'balance') {
      nextSort = sortBy === 'balance_desc' ? 'balance_asc' : 'balance_desc';
    } else if (col === 'fee') {
      nextSort = sortBy === 'fee_desc' ? 'name_asc' : 'fee_desc';
    }
    setSortBy(nextSort);
    updateFilterParam('sort', nextSort);
  };

  const handleResetFilters = () => {
    if (setSearch) setSearch('');
    updateFilterParam('q', '');
    if (setFeeStatus) setFeeStatus('ALL');
    updateFilterParam('status', 'ALL');
    setActiveCenter('all');
    updateFilterParam('center', 'all');
    setActiveCandidateType('all');
    updateFilterParam('candidate_type', 'all');
    setSelectedCourseGroup('all');
    updateFilterParam('course', 'all');
  };

  const activeSecondaryFilterCount =
    (activeCenter && activeCenter !== 'all' ? 1 : 0) +
    (activeCandidateType && activeCandidateType !== 'all' ? 1 : 0) +
    (selectedCourseGroup && selectedCourseGroup !== 'all' ? 1 : 0) +
    (feeStatus && feeStatus !== 'ALL' ? 1 : 0) +
    (search && search.trim() ? 1 : 0);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '••••••';
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getStatusBadge = (status) => {
    if (status === 'PAID') {
      return <span className="status-pill status-paid">Paid</span>;
    } else if (status === 'PARTIAL') {
      return <span className="status-pill status-partial">Partial</span>;
    }
    return <span className="status-pill status-pending">Pending</span>;
  };

  const showBatchDirectory = !isBatchDrilldownActive && desktopViewMode === 'batches';

  return (
    <div>
      {/* Top Main Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        marginBottom: '0.85rem'
      }}>
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Students
            </h2>
            {isBatchDrilldownActive && activeBatchObject && (
              <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.74rem' }}>
                {activeBatchObject.batch_name}
              </span>
            )}
          </div>
          <p className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
            {isBatchDrilldownActive && activeBatchObject
              ? `Cohort roster for ${activeBatchObject.batch_name} (${activeBatchObject.academic_year || '2026-2027'})`
              : 'Browse by academic batches like WhatsApp groups, or access the master student roster.'}
          </p>
        </div>

        {/* Action Buttons: Import, Export, Add Student */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          <button
            onClick={onOpenImport}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', padding: '0.4rem 0.65rem' }}
            title="Import Students from Excel/CSV"
          >
            <Upload size={14} />
            <span className="hide-mobile">Import</span>
          </button>

          <button
            onClick={onExportExcel}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem', padding: '0.4rem 0.65rem' }}
            title="Export Students to Excel"
          >
            <Download size={14} />
            <span className="hide-mobile">Export</span>
          </button>

          <button
            onClick={() => onAddStudent && onAddStudent(isBatchDrilldownActive ? selectedBatch : null)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem', fontWeight: 700, padding: '0.4rem 0.75rem' }}
          >
            <Plus size={15} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Directory View Mode Switcher (Visible when not inside a specific batch) */}
      {!isBatchDrilldownActive && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.85rem'
        }}>
          {/* Left Switcher: Batches Directory vs Master Table */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <button
              type="button"
              onClick={() => {
                setDesktopViewMode('batches');
                setSelectedBatch('all');
                updateFilterParam('batch', 'all');
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: desktopViewMode === 'batches' ? '1px solid var(--primary-300)' : 'none',
                backgroundColor: desktopViewMode === 'batches' ? 'var(--bg-surface)' : 'transparent',
                color: desktopViewMode === 'batches' ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: desktopViewMode === 'batches' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: desktopViewMode === 'batches' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <Layers size={14} />
              <span>Browse by Batches ({batches.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDesktopViewMode('all');
                setSelectedBatch('all');
                updateFilterParam('batch', 'all');
              }}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: desktopViewMode === 'all' ? '1px solid var(--primary-300)' : 'none',
                backgroundColor: desktopViewMode === 'all' ? 'var(--bg-surface)' : 'transparent',
                color: desktopViewMode === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: desktopViewMode === 'all' ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: desktopViewMode === 'all' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              <Users size={14} />
              <span>Master Student Table ({students.length})</span>
            </button>
          </div>

          {/* Right Switcher (When in Batches Directory): WhatsApp List vs Cards Grid */}
          {desktopViewMode === 'batches' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)'
            }}>
              <button
                type="button"
                onClick={() => setDirectoryStyle('whatsapp')}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: directoryStyle === 'whatsapp' ? 'var(--bg-surface)' : 'transparent',
                  color: directoryStyle === 'whatsapp' ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: directoryStyle === 'whatsapp' ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: directoryStyle === 'whatsapp' ? 'var(--shadow-xs)' : 'none'
                }}
                title="WhatsApp Groups List View"
              >
                <List size={13} />
                <span>WhatsApp List</span>
              </button>

              <button
                type="button"
                onClick={() => setDirectoryStyle('grid')}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: directoryStyle === 'grid' ? 'var(--bg-surface)' : 'transparent',
                  color: directoryStyle === 'grid' ? 'var(--primary-700)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: directoryStyle === 'grid' ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: directoryStyle === 'grid' ? 'var(--shadow-xs)' : 'none'
                }}
                title="Card Grid View"
              >
                <Grid size={13} />
                <span>Cards Grid</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. BATCHES DIRECTORY (WhatsApp Groups List / Cards Grid) */}
      {/* ======================================================== */}
      {showBatchDirectory && (
        <div style={{ marginBottom: '1.75rem' }}>
          {/* Program filter tabs for batches */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            marginBottom: '0.75rem'
          }}>
            <button
              onClick={() => setBatchProgramFilter('all')}
              style={{
                padding: '0.32rem 0.7rem',
                borderRadius: 'var(--radius-full)',
                border: batchProgramFilter === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                backgroundColor: batchProgramFilter === 'all' ? 'var(--primary-50)' : 'var(--bg-surface)',
                color: batchProgramFilter === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              All Batches ({batches.length})
            </button>
            {programs.map((p) => {
              const countInProg = batches.filter((b) => String(b.program) === String(p.id)).length;
              const isSelected = String(batchProgramFilter) === String(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setBatchProgramFilter(String(p.id))}
                  style={{
                    padding: '0.32rem 0.7rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p.code === 'DEGREE' ? '🎓 Degree' : p.code === 'PG' ? '🏛️ PG' : p.code === 'INTER' ? '🏫 Inter' : '🎒 SSC'} ({countInProg})
                </button>
              );
            })}
          </div>

          {/* Search bar for Batches Directory */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search batches by name, program, code, or academic year..."
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.35rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.84rem',
                color: 'var(--text-primary)',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)'
              }}
            />
          </div>

          {/* WhatsApp Groups List View (Default & Primary) */}
          {directoryStyle === 'whatsapp' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              padding: '0.45rem',
              boxShadow: 'var(--shadow-xs)'
            }}>
              {filteredBatches.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No batches found matching "{batchSearch}".
                </div>
              ) : (
                filteredBatches.map((b) => {
                  const isDegree = b.program_code === 'DEGREE';
                  const isPG = b.program_code === 'PG';
                  const isInter = b.program_code === 'INTER';

                  const badgeBg = isDegree ? '#EFF6FF' : isPG ? '#FAF5FF' : isInter ? '#FFFBEB' : '#ECFDF5';
                  const badgeColor = isDegree ? '#1D4ED8' : isPG ? '#7E22CE' : isInter ? '#B45309' : '#047857';
                  const badgeBorder = isDegree ? '#BFDBFE' : isPG ? '#E9D5FF' : isInter ? '#FDE68A' : '#A7F3D0';
                  const icon = isDegree ? '🎓' : isPG ? '🏛️' : isInter ? '🏫' : '🎒';

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBatch(b.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, transform 0.12s ease',
                        gap: '0.75rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      }}
                    >
                      {/* WhatsApp Group Avatar */}
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1.5px solid ${badgeBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {icon}
                      </div>

                      {/* WhatsApp Group Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.96rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            lineHeight: 1.25,
                            wordBreak: 'break-word'
                          }}>
                            {b.batch_name}
                          </span>
                          <span style={{
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                            flexShrink: 0
                          }}>
                            {b.program_code}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.25
                        }}>
                          {b.program_name} • {b.academic_year || '2026-2027'} • <strong style={{ color: 'var(--text-secondary)' }}>{b.student_count} Enrolled</strong>
                        </div>
                      </div>

                      {/* WhatsApp Group Right Stats */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', marginBottom: '0.15rem' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: b.collection_pct >= 50 ? '#ECFDF5' : '#FFFBEB',
                            color: b.collection_pct >= 50 ? '#047857' : '#B45309',
                            border: `1px solid ${b.collection_pct >= 50 ? '#A7F3D0' : '#FDE68A'}`
                          }}>
                            {b.collection_pct}% Realized
                          </span>
                          <ChevronDown size={15} style={{ color: 'var(--text-muted)', transform: 'rotate(-90deg)' }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: Number(b.total_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-text)' }}>
                          {Number(b.total_due) > 0 ? `₹${Number(b.total_due).toLocaleString('en-IN')} Due` : 'All Paid ✓'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Cards Grid View (Alternative Layout) */}
          {directoryStyle === 'grid' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '0.75rem'
            }}>
              {filteredBatches.map((b) => {
                const isDegree = b.program_code === 'DEGREE';
                const isPG = b.program_code === 'PG';
                const isInter = b.program_code === 'INTER';

                const badgeBg = isDegree ? '#EFF6FF' : isPG ? '#FAF5FF' : isInter ? '#FFFBEB' : '#ECFDF5';
                const badgeColor = isDegree ? '#1D4ED8' : isPG ? '#7E22CE' : isInter ? '#B45309' : '#047857';
                const badgeBorder = isDegree ? '#BFDBFE' : isPG ? '#E9D5FF' : isInter ? '#FDE68A' : '#A7F3D0';
                const icon = isDegree ? '🎓' : isPG ? '🏛️' : isInter ? '🏫' : '🎒';

                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBatch(b.id)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-light)',
                      padding: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-xs)',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-400)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        padding: '0.12rem 0.45rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`
                      }}>
                        {icon} {b.program_code}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {b.student_count} Enrolled
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                      {b.batch_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                      {b.program_name} • {b.academic_year || '2026-2027'}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.3rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.45rem',
                      textAlign: 'center',
                      marginBottom: '0.65rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billed</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700 }}>{formatCurrency(b.total_billed)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--emerald-text)', textTransform: 'uppercase' }}>Paid</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--emerald-text)' }}>{formatCurrency(b.total_paid)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.58rem', color: 'var(--rose-text)', textTransform: 'uppercase' }}>Due</div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: Number(b.total_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-text)' }}>
                          {formatCurrency(b.total_due)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      <span>Target Realized</span>
                      <span style={{ color: 'var(--emerald-text)' }}>{b.collection_pct}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, b.collection_pct)}%`, backgroundColor: '#10B981' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BATCH DRILL-DOWN DASHBOARD BANNER */}
      {/* ======================================================== */}
      {isBatchDrilldownActive && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '0.85rem 1rem',
          marginBottom: '0.85rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          {/* Top Bar with Back Button & Batch Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.65rem'
          }}>
            <button
              type="button"
              onClick={handleBackToBatches}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, padding: '0.35rem 0.65rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to All Batches</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.78rem', padding: '0.2rem 0.55rem' }}>
                {activeBatchObject ? activeBatchObject.batch_name : 'Batch Roster'}
              </span>
              {activeBatchObject && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {activeBatchObject.academic_year || '2026 - 2027'} • {activeBatchObject.program_name || activeBatchObject.program_code}
                </span>
              )}
            </div>
          </div>

          {/* 4-Stat Cohort KPI Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.45rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.45rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Enrolled</div>
              <div style={{ fontSize: 'clamp(0.85rem, 3vw, 1.05rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeBatchStats.count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Assessed</div>
              <div style={{ fontSize: 'clamp(0.8rem, 3vw, 0.98rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatCurrency(activeBatchStats.assessed)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--emerald-text)', textTransform: 'uppercase', fontWeight: 700 }}>Collected</div>
              <div style={{ fontSize: 'clamp(0.8rem, 3vw, 0.98rem)', fontWeight: 800, color: 'var(--emerald-text)' }}>
                {formatCurrency(activeBatchStats.paid)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--rose-text)', textTransform: 'uppercase', fontWeight: 700 }}>Due Balance</div>
              <div style={{ fontSize: 'clamp(0.8rem, 3vw, 0.98rem)', fontWeight: 800, color: 'var(--rose-text)' }}>
                {formatCurrency(activeBatchStats.due)}
              </div>
            </div>
          </div>

          {/* Realization Progress Bar */}
          <div style={{ marginTop: '0.55rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
              <span>Batch Fee Realization Target</span>
              <span style={{ color: 'var(--emerald-text)' }}>
                {activeBatchStats.pct}% Collected
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, activeBatchStats.pct)}%`,
                backgroundColor: '#10B981',
                borderRadius: 'var(--radius-full)'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ROSTER FILTER & SORT CONTROLS BAR (Clean & No Duplicates) */}
      {/* ======================================================== */}
      {(isBatchDrilldownActive || desktopViewMode === 'all') && (
        <div style={{ marginBottom: '0.85rem' }}>
          {/* Master Table Program Tabs (Only in Master Table mode) */}
          {!isBatchDrilldownActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '0.4rem',
              marginBottom: '0.65rem'
            }}>
              <button
                onClick={() => { setSelectedProgram('all'); updateFilterParam('program', 'all'); }}
                style={{
                  padding: '0.32rem 0.7rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedProgram === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                  backgroundColor: selectedProgram === 'all' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: selectedProgram === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All Programs ({students.length})
              </button>
              {programs.map((p) => {
                const isSelected = String(selectedProgram) === String(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProgram(String(p.id));
                      updateFilterParam('program', String(p.id));
                    }}
                    style={{
                      padding: '0.32rem 0.7rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? 'var(--primary-50)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.code === 'DEGREE' ? '🎓 Degree' : p.code === 'PG' ? '📚 PG' : p.code === 'INTER' ? '📝 Inter' : '🏫 SSC'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Course / Specialization Group Filter Pills ("Course-wise") */}
          {availableCourseGroups.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              overflowX: 'auto',
              paddingBottom: '0.4rem',
              marginBottom: '0.55rem'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.15rem', whiteSpace: 'nowrap' }}>
                Course:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourseGroup('all');
                  updateFilterParam('course', 'all');
                }}
                style={{
                  padding: '0.22rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: selectedCourseGroup === 'all' ? 800 : 600,
                  border: selectedCourseGroup === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                  backgroundColor: selectedCourseGroup === 'all' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: selectedCourseGroup === 'all' ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All Courses ({cohortStudents.length})
              </button>
              {availableCourseGroups.map(({ name, count }) => {
                const isSelected = selectedCourseGroup.toLowerCase() === name.toLowerCase();
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const next = isSelected ? 'all' : name;
                      setSelectedCourseGroup(next);
                      updateFilterParam('course', next);
                    }}
                    style={{
                      padding: '0.22rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: isSelected ? 800 : 600,
                      border: isSelected ? '1.5px solid #2563EB' : '1px solid var(--border-light)',
                      backgroundColor: isSelected ? '#EFF6FF' : 'var(--bg-surface)',
                      color: isSelected ? '#1D4ED8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {name} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Clean Main Filter & Sort Controls Card */}
          <div className="card-compact" style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '0.6rem 0.8rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.55rem'
            }}>
              {/* Search Bar + Mobile Filters Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: '1 1 240px', maxWidth: '100%' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder={isBatchDrilldownActive ? `Search ${activeBatchObject?.batch_name || 'batch'} students...` : 'Search students by name, ID, or phone...'}
                    value={search}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (setSearch) setSearch(val);
                      updateFilterParam('q', val);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.42rem 0.75rem 0.42rem 2.15rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-subtle)',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className="show-mobile-flex"
                  style={{
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.42rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: (showMobileFilters || activeSecondaryFilterCount > 0) ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                    backgroundColor: (showMobileFilters || activeSecondaryFilterCount > 0) ? 'var(--primary-50)' : 'var(--bg-subtle)',
                    color: (showMobileFilters || activeSecondaryFilterCount > 0) ? 'var(--primary-700)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <SlidersHorizontal size={13} />
                  <span>Filters</span>
                  {activeSecondaryFilterCount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--primary-600)',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '999px',
                      fontWeight: 800
                    }}>
                      {activeSecondaryFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Fee Status Chips */}
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      if (setFeeStatus) setFeeStatus(st);
                      updateFilterParam('status', st);
                    }}
                    style={{
                      padding: '0.32rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      border: feeStatus === st ? '1px solid var(--primary-600)' : '1px solid var(--border-light)',
                      backgroundColor: feeStatus === st ? 'var(--primary-50)' : 'var(--bg-subtle)',
                      color: feeStatus === st ? 'var(--primary-600)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {st === 'ALL' ? 'All' : st === 'UNPAID' ? 'Pending' : st === 'PARTIAL' ? 'Partial' : 'Paid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Controls: Sort Dropdown + Study Center + Candidate Type (No Duplicates) */}
            <div className={`students-filter-controls ${showMobileFilters ? 'open' : ''}`} style={{ marginTop: '0.5rem' }}>
              {/* Sorting Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    updateFilterParam('sort', e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.42rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--primary-200)',
                    backgroundColor: 'var(--primary-50)',
                    fontSize: '0.8rem',
                    color: 'var(--primary-700)',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="name_asc">Sort: Name (A → Z)</option>
                  <option value="name_desc">Sort: Name (Z → A)</option>
                  <option value="id_asc">Sort: Roll ID (Ascending)</option>
                  <option value="id_desc">Sort: Roll ID (Descending)</option>
                  <option value="balance_desc">Sort: Due Balance (Highest)</option>
                  <option value="balance_asc">Sort: Due Balance (Lowest)</option>
                  <option value="fee_desc">Sort: Total Fee (Highest)</option>
                </select>
              </div>

              {/* Study Center Filter */}
              <select
                value={activeCenter}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveCenter(val);
                  updateFilterParam('center', val);
                }}
                style={{
                  padding: '0.42rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: activeCenter !== 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                  backgroundColor: activeCenter !== 'all' ? 'var(--primary-50)' : 'var(--bg-subtle)',
                  fontSize: '0.8rem',
                  color: activeCenter !== 'all' ? 'var(--primary-700)' : 'var(--text-primary)',
                  fontWeight: activeCenter !== 'all' ? 700 : 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Study Centers</option>
                {centers.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    Center: {c.code || c.name}
                  </option>
                ))}
              </select>

              {/* Candidate Type Filter (WITH vs WITHOUT) */}
              <select
                value={activeCandidateType}
                onChange={(e) => {
                  const val = e.target.value;
                  setActiveCandidateType(val);
                  updateFilterParam('candidate_type', val);
                }}
                style={{
                  padding: '0.42rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: activeCandidateType !== 'all' ? '1.5px solid #059669' : '1px solid var(--border-light)',
                  backgroundColor: activeCandidateType !== 'all' ? '#ECFDF5' : 'var(--bg-subtle)',
                  fontSize: '0.8rem',
                  color: activeCandidateType !== 'all' ? '#047857' : 'var(--text-primary)',
                  fontWeight: activeCandidateType !== 'all' ? 700 : 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Candidate Types</option>
                <option value="WITH">WITH (Classes & Material)</option>
                <option value="WITHOUT">WITHOUT (Direct/Exam)</option>
              </select>

              {/* Active Reference Filter Chip */}
              {refFilter && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('ref');
                    setSearchParams(newParams, { replace: true });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.32rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>Ref: #{refFilter}</span>
                  <X size={12} />
                </button>
              )}

              {/* Reset Filters Button */}
              {activeSecondaryFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.42rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--rose-600)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <X size={13} />
                  <span>Reset Filters ({activeSecondaryFilterCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. STUDENT ROSTER TABLE (Clean Header & No Debug Text) */}
      {/* ======================================================== */}
      {(isBatchDrilldownActive || desktopViewMode === 'all') && (
        <div>
          {/* Roster Live Count Banner (Clean, no debug pagination note) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            padding: '0.35rem 0.45rem',
            marginBottom: '0.45rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                Showing all {sortedStudents.length} students
              </span>
              {cohortStudents.length !== sortedStudents.length && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  (filtered from {cohortStudents.length} total)
                </span>
              )}
              {selectedCourseGroup !== 'all' && (
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                  Course: {selectedCourseGroup}
                </span>
              )}
            </div>
          </div>

          {/* Desktop & Tablet Full Table (with Sticky Headers) */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            maxHeight: 'calc(100vh - 270px)',
            overflowY: 'auto'
          }} className="hide-mobile">
            <table className="table-compact" style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--bg-subtle)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr style={{
                  borderBottom: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  <th
                    onClick={() => toggleSort('id')}
                    style={{ padding: '0.65rem 0.75rem', width: 45, cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by Roll ID"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>#</span>
                      {sortBy === 'id_asc' ? <ArrowUp size={12} color="var(--primary-600)" /> : sortBy === 'id_desc' ? <ArrowDown size={12} color="var(--primary-600)" /> : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('name')}
                    style={{ padding: '0.65rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by Student Name"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Student Details</span>
                      {sortBy === 'name_asc' ? <ArrowUp size={12} color="var(--primary-600)" /> : sortBy === 'name_desc' ? <ArrowDown size={12} color="var(--primary-600)" /> : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Program & Batch</th>
                  <th
                    onClick={() => toggleSort('fee')}
                    style={{ padding: '0.65rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by Total Fee"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Total Fee</span>
                      {sortBy === 'fee_desc' && <ArrowDown size={12} color="var(--primary-600)" />}
                    </div>
                  </th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Paid</th>
                  <th
                    onClick={() => toggleSort('balance')}
                    style={{ padding: '0.65rem 0.75rem', cursor: 'pointer', userSelect: 'none' }}
                    title="Click to sort by Due Balance"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Balance</span>
                      {sortBy === 'balance_desc' ? <ArrowDown size={12} color="var(--rose-600)" /> : sortBy === 'balance_asc' ? <ArrowUp size={12} color="var(--rose-600)" /> : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
                    </div>
                  </th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center', width: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                        No students found matching current filters
                      </div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '0.5rem' }}
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((s, idx) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        {idx + 1}
                      </td>

                      {/* Student Details with Avatar */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0
                          }}>
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, maxWidth: 190 }}>
                            <div
                              onClick={() => onViewProfile && onViewProfile(s)}
                              className="truncate-text"
                              style={{ fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}
                              title={s.name}
                            >
                              {s.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {s.student_id || s.registration_no || `STD#${s.id}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Program & Course Group with Colorful Badge */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                          <span style={{
                            padding: '0.1rem 0.35rem',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            backgroundColor: s.program_code === 'DEGREE' ? '#EFF6FF' : s.program_code === 'PG' ? '#FAF5FF' : s.program_code === 'INTER' ? '#FFFBEB' : '#ECFDF5',
                            color: s.program_code === 'DEGREE' ? '#1D4ED8' : s.program_code === 'PG' ? '#7E22CE' : s.program_code === 'INTER' ? '#B45309' : '#047857',
                            border: '1px solid',
                            borderColor: s.program_code === 'DEGREE' ? '#BFDBFE' : s.program_code === 'PG' ? '#E9D5FF' : s.program_code === 'INTER' ? '#FDE68A' : '#A7F3D0'
                          }}>
                            {s.program_code || 'COURSE'}
                          </span>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {s.group || s.program_name}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                          <span>Batch: <strong>{s.batch_name}</strong></span>
                          {s.center_code && (
                            <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>• {s.center_code}</span>
                          )}
                        </div>
                      </td>

                      {/* Total Fee */}
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {isCaller ? '••••••' : formatCurrency(s.total_fee_amount)}
                      </td>

                      {/* Paid Amount */}
                      <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--emerald-text)' }}>
                        {formatCurrency(s.total_paid_amount)}
                      </td>

                      {/* Balance Due */}
                      <td style={{
                        padding: '0.55rem 0.75rem',
                        fontWeight: 800,
                        color: Number(s.total_balance_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-text)'
                      }}>
                        {formatCurrency(s.total_balance_due)}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '0.55rem 0.75rem' }}>
                        {getStatusBadge(s.fee_status)}
                      </td>

                      {/* Action Icons */}
                      <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <button
                            onClick={() => onViewProfile && onViewProfile(s)}
                            title="View Student Profile"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              padding: '0.3rem',
                              borderRadius: 'var(--radius-xs)'
                            }}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => onRecordPayment && onRecordPayment(s)}
                            title="Collect Payment"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--primary-600)',
                              padding: '0.3rem',
                              borderRadius: 'var(--radius-xs)'
                            }}
                          >
                            <Plus size={16} />
                          </button>

                          <button
                            onClick={() => onOpenWhatsApp && onOpenWhatsApp(s)}
                            title="Send WhatsApp Reminder"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#25D366',
                              padding: '0.3rem',
                              borderRadius: 'var(--radius-xs)'
                            }}
                          >
                            <MessageSquare size={16} />
                          </button>

                          {s.primary_contact && (
                            <a
                              href={`tel:${s.primary_contact}`}
                              title={`Call ${s.primary_contact}`}
                              style={{
                                color: '#2563EB',
                                padding: '0.3rem',
                                display: 'inline-flex'
                              }}
                            >
                              <Phone size={15} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div style={{ flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }} className="show-mobile-flex">
            {sortedStudents.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)'
              }}>
                No students found matching current filters.
              </div>
            ) : (
              sortedStudents.map((s) => (
                <div
                  key={s.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-light)',
                    padding: '0.9rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {/* Header: Student Name, ID & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.55rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        flexShrink: 0
                      }}>
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div
                          onClick={() => onViewProfile && onViewProfile(s)}
                          style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {s.student_id || s.registration_no || `STD#${s.id}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {getStatusBadge(s.fee_status)}
                    </div>
                  </div>

                  {/* Subheader: Cohort, Batch & Phone */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginBottom: '0.65rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <span style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: s.program_code === 'DEGREE' ? '#EFF6FF' : s.program_code === 'PG' ? '#FAF5FF' : s.program_code === 'INTER' ? '#FFFBEB' : '#ECFDF5',
                        color: s.program_code === 'DEGREE' ? '#1D4ED8' : s.program_code === 'PG' ? '#7E22CE' : s.program_code === 'INTER' ? '#B45309' : '#047857',
                        border: '1px solid',
                        borderColor: s.program_code === 'DEGREE' ? '#BFDBFE' : s.program_code === 'PG' ? '#E9D5FF' : s.program_code === 'INTER' ? '#FDE68A' : '#A7F3D0',
                        flexShrink: 0
                      }}>
                        {s.program_code || 'COURSE'}
                      </span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                        {s.group || s.program_name} • {s.batch_name}
                      </span>
                    </div>
                    {s.primary_contact && (
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
                        {s.primary_contact}
                      </span>
                    )}
                  </div>

                  {/* 3-Column Financial Breakdown Box */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.25rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.35rem',
                    marginBottom: '0.55rem',
                    textAlign: 'center',
                    overflow: 'hidden'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Fee</div>
                      <div style={{ fontSize: 'clamp(0.72rem, 3.2vw, 0.82rem)', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isCaller ? '••••••' : formatCurrency(s.total_fee_amount)}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--emerald-text)', textTransform: 'uppercase', fontWeight: 600 }}>Paid</div>
                      <div style={{ fontSize: 'clamp(0.72rem, 3.2vw, 0.82rem)', fontWeight: 700, color: 'var(--emerald-text)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formatCurrency(s.total_paid_amount)}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--rose-text)', textTransform: 'uppercase', fontWeight: 600 }}>Due Balance</div>
                      <div style={{
                        fontSize: 'clamp(0.72rem, 3.2vw, 0.85rem)',
                        fontWeight: 800,
                        color: Number(s.total_balance_due) > 0 ? 'var(--rose-600)' : 'var(--emerald-text)',
                        marginTop: '0.1rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {formatCurrency(s.total_balance_due)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Mobile Action Buttons Bar */}
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '0.5rem',
                    marginTop: '0.2rem'
                  }}>
                    <div className="student-mobile-actions">
                      <button
                        type="button"
                        onClick={() => onViewProfile && onViewProfile(s)}
                        className="btn btn-secondary btn-sm"
                        title="View Profile"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>

                      {s.primary_contact ? (
                        <a
                          href={`tel:${s.primary_contact}`}
                          className="btn btn-secondary btn-sm"
                          title={`Call ${s.primary_contact}`}
                        >
                          <Phone size={13} />
                          <span>Call</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-secondary btn-sm"
                          style={{ opacity: 0.4, cursor: 'not-allowed' }}
                          title="No phone number"
                        >
                          <Phone size={13} />
                          <span>Call</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp && onOpenWhatsApp(s)}
                        className="btn btn-whatsapp btn-sm"
                        title="WhatsApp Reminder"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRecordPayment && onRecordPayment(s)}
                        className="btn btn-primary btn-sm"
                        title="Collect Payment"
                      >
                        <Plus size={13} />
                        <span>Collect</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
