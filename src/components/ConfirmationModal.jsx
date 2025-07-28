// src/components/ConfirmationModal.jsx

import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            {/* Modal Panel */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="text-gray-600 mb-6">
                    {children}
                </div>
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="btn-secondary"
                    >
                        Annuleren
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="btn-danger"
                    >
                        Ja, verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
