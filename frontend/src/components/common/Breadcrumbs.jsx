import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}
    >
      <Link
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-600)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <Home size={14} />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            {isLast || !item.path ? (
              <span style={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                maxWidth: 'min(260px, 50vw)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-600)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
