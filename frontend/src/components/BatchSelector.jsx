import React from 'react';
import { Layers, Plus, BookOpen } from 'lucide-react';

export default function BatchSelector({ batches, selectedBatch, onSelectBatch, onAddBatchClick }) {
  return (
    <div style={{
      marginBottom: '1.25rem',
      overflowX: 'auto',
      paddingBottom: '0.4rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      {/* All Batches Chip */}
      <button
        onClick={() => onSelectBatch('all')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          border: selectedBatch === 'all' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
          backgroundColor: selectedBatch === 'all' ? 'var(--primary-600)' : 'var(--bg-surface)',
          color: selectedBatch === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
          boxShadow: selectedBatch === 'all' ? '0 2px 8px var(--primary-shadow)' : 'var(--shadow-xs)',
          whiteSpace: 'nowrap',
          transition: 'var(--transition)'
        }}
      >
        <Layers size={15} />
        <span>All Batches</span>
      </button>

      {/* Batch Specific Chips */}
      {batches.map((b) => {
        const isSelected = selectedBatch === String(b.id);
        const durationTag = b.duration_years > 1 ? `${b.duration_years}-Yr` : '1-Yr';

        return (
          <button
            key={b.id}
            onClick={() => onSelectBatch(String(b.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
              backgroundColor: isSelected ? 'var(--primary-600)' : 'var(--bg-surface)',
              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: isSelected ? '0 2px 8px var(--primary-shadow)' : 'var(--shadow-xs)',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)'
            }}
          >
            <BookOpen size={14} style={{ opacity: isSelected ? 1 : 0.7 }} />
            <span>{b.batch_name}</span>
            <span style={{
              fontSize: '0.72rem',
              padding: '0.1rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
              color: isSelected ? '#FFFFFF' : 'var(--text-muted)'
            }}>
              {b.student_count} • {durationTag}
            </span>
          </button>
        );
      })}

      {/* Add New Batch Button */}
      <button
        onClick={onAddBatchClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.55rem 0.95rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          border: '1px dashed var(--primary-500)',
          backgroundColor: 'var(--primary-50)',
          color: 'var(--primary-700)',
          whiteSpace: 'nowrap',
          transition: 'var(--transition)'
        }}
        title="Add a previous or upcoming batch"
      >
        <Plus size={15} />
        <span>New Batch</span>
      </button>
    </div>
  );
}
