'use client';

import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = '← 메인으로' }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '90%',
      maxWidth: '600px'
    }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '24px 32px',
          backgroundColor: '#475569',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          fontSize: '24px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#334155';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#475569';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        }}
      >
        <span>{label}</span>
      </button>
    </div>
  );
};