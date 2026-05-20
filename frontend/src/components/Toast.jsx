import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  
  // Auto dismiss toast after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={18} style={{ color: 'var(--success)' }} />,
    warning: <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />,
    error: <AlertCircle size={18} style={{ color: 'var(--danger)' }} />,
  };

  const borders = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--danger)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '400px',
        background: '#1e1e24',
        border: '1px solid',
        borderColor: borders[type],
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
    >
      
      {icons[type]}
      
      <div style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
        {message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          padding: '2px',
        }}
      >
        <X size={14} />
      </button>

    </div>
  );
}
