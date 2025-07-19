// src/components/ConfirmationModal.jsx

import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose} // Sluit de modal als je op de achtergrond klikt
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()} // Voorkom dat klikken in de modal de modal sluit
            >
                <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
                <div className="text-slate-600 mb-6">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="btn btn-secondary">
                        Annuleren
                    </button>
                    <button onClick={onConfirm} className="btn btn-primary">
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;