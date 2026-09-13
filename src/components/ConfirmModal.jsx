import React from 'react';

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#1e293b', border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '12px', padding: '24px', maxWidth: '360px', width: '90%',
          textAlign: 'center', color: '#fff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ marginBottom: '20px', fontSize: '14px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={onConfirm}
            style={{
              background: 'linear-gradient(45deg, #f39c12, #d4af37)',
              color: '#000', border: 'none', padding: '10px 20px',
              borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            OK
          </button>
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', padding: '10px 20px',
              borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}