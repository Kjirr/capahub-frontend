// src/components/CompanyDetailsModal.jsx

import React from 'react';

const CompanyDetailsModal = ({ isOpen, onClose, company, isLoading }) => {
    // Als de modal niet open is, laat dan niets zien
    if (!isOpen) return null;

    return (
        // Dit is de overlay die de achtergrond donkerder maakt
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Close knop rechtsboven */}
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    
                    {isLoading ? (
                        <div className="text-center p-8">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p>Gegevens laden...</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="card-title text-2xl mb-4">{company?.name || 'Bedrijfsdetails'}</h2>
                            <div className="space-y-2">
                                <p><strong>KVK-nummer:</strong> {company?.kvk || 'N/A'}</p>
                                <p><strong>Adres:</strong> {company?.adres || 'N/A'}, {company?.postcode || ''} {company?.plaats || ''}</p>
                                <p><strong>Telefoon:</strong> {company?.telefoon || 'N/A'}</p>
                            </div>
                        </>
                    )}
                    
                    <div className="card-actions justify-end mt-6">
                        <button onClick={onClose} className="btn">Sluiten</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailsModal;