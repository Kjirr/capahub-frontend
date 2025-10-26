// src/components/UpgradeModal.jsx

import React from 'react';

const UpgradeModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) {
        return null;
    }

    // Navigeer naar de (toekomstige) abonnementspagina
    const handleUpgrade = () => {
        // Voor nu sluiten we de modal, later kan dit naar een betaalpagina gaan.
        console.log('Navigeer naar de upgrade-pagina...');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="card-body items-center text-center">
                    
                    <div className="p-4 bg-primary rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14" />
                        </svg>
                    </div>

                    <h2 className="card-title text-2xl">Upgrade Vereist</h2>
                    <p className="mt-2 mb-6 text-base-content/80">{message || 'Voor deze functionaliteit is een upgrade van uw abonnement vereist.'}</p>
                    
                    <div className="card-actions justify-center w-full">
                        <button onClick={onClose} className="btn btn-ghost w-1/2">Later misschien</button>
                        <button onClick={handleUpgrade} className="btn btn-primary w-1/2">Upgrade Nu</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;