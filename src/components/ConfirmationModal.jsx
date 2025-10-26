// src/components/ConfirmationModal.jsx

import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isProcessing }) => {
    if (!isOpen) {
        return null;
    }

    const confirmButtonText = onConfirm ? "Ja, bevestigen" : "Oké";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    <h2 className="card-title">{title}</h2>
                    <div className="text-base-content/80 my-4">
                        {children}
                    </div>
                    <div className="card-actions justify-end">
                        <button onClick={onClose} className="btn btn-ghost" disabled={isProcessing}>
                            {onConfirm ? "Annuleren" : "Sluiten"}
                        </button>
                        {onConfirm && (
                            <button onClick={onConfirm} className="btn btn-primary" disabled={isProcessing}>
                                {isProcessing ? <span className="loading loading-spinner"></span> : confirmButtonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;