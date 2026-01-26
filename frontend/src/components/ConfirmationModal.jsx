// File: components/ConfirmationModal.jsx
//
// Confirmation Modal - Themed confirmation dialog

import React from 'react';
import './ConfirmationModal.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Yes', cancelText = 'No' }) {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <h3>{title || 'Confirm Action'}</h3>
        </div>
        <div className="confirmation-modal-body">
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>
        <div className="confirmation-modal-footer">
          <button className="confirmation-btn confirmation-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirmation-btn confirmation-btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

