import React from 'react'
import './ConfirmationModal.css'

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type }) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className={`modal-title ${type}`}>
                        {type === 'pdf' ? '📄' : '🗑️'} {title}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn cancel-btn" onClick={onClose}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button className={`modal-btn confirm-btn ${type}`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal 