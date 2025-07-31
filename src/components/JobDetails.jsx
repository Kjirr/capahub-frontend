// src/components/JobDetails.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import ConfirmationModal from './ConfirmationModal';

const JobDetails = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchJobDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest(`/jobs/${jobId}`, 'GET');
            setJob(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        if (jobId && currentUser) {
            fetchJobDetails();
        }
    }, [jobId, currentUser, fetchJobDetails]);

    // Functie om te bepalen of de gebruiker de calculator mag gebruiken
    const canUseCalculator = () => {
        if (!currentUser) return false;
        // We gebruiken 'manage_admin' als placeholder voor een betaalde feature
        // Eigenaren hebben sowieso toegang als de module in hun plan zit
        const planPermissions = currentUser.subscription?.permissions?.map(p => p.name) || [];
        if (!planPermissions.includes('manage_admin')) return false;

        if (currentUser.companyRole === 'owner') return true;
        
        // Members moeten ook de individuele permissie hebben
        return currentUser.permissions?.some(p => p.name === 'manage_admin');
    };

    const handleConfirmDelete = async () => { /* ... uw bestaande delete logica ... */ };
    const handleAcceptQuote = async (quoteId) => { /* ... uw bestaande accept logica ... */ };

    if (isLoading) return <div className="loading-text">Opdrachtdetails laden...</div>;
    if (!job) return <div className="loading-text">Opdracht niet gevonden.</div>;
    
    const isOwner = currentUser?.companyId === job.companyId;

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">{job.title}</h1>
                        <p className="page-subtitle">Geplaatst door: {job.company.name}</p>
                    </div>
                     <button onClick={() => navigateTo('marketplace-dashboard')} className="btn btn-ghost">← Terug naar Marktplaats</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        {/* Omschrijving & Ingekomen Offertes... */}
                        <div className="card bg-base-100 shadow-xl"><div className="card-body"><h2 className="card-title-lg">Opdrachtomschrijving</h2><p className="whitespace-pre-wrap">{job.description}</p></div></div>
                        <div className="card bg-base-100 shadow-xl"><div className="card-body"><h2 className="card-title-lg">Ingekomen Offertes ({job.quotes.length})</h2>{/* ... uw offertes-logica ... */}</div></div>
                    </div>

                    <div className="space-y-6 self-start">
                        {/* --- DE ACTIES-SECTIE --- */}
                        {/* Toon alleen als je NIET de eigenaar bent, de opdracht open is, en je de feature mag gebruiken */}
                        {!isOwner && job.status === 'quoting' && canUseCalculator() && (
                            <div className="card bg-success text-success-content shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">Acties</h2>
                                    <p>Denk je dat je deze opdracht kunt uitvoeren? Gebruik de calculator om een offerte te maken.</p>
                                    <div className="card-actions justify-end mt-4">
                                        <button 
                                            onClick={() => navigateTo('create-quote', job.id)}
                                            className="btn btn-neutral"
                                        >
                                            Offerte Calculeren
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Specificaties kaart */}
                        <div className="card bg-base-100 shadow-xl">
                             <div className="card-body">
                                <h2 className="card-title">Specificaties</h2>
                                <ul className="list-none space-y-2 mt-4">
                                    <li><strong>Aantal:</strong> {job.quantity}</li>
                                    <li><strong>Materiaal:</strong> {job.material}</li>
                                    {/* ... etc ... */}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Opdracht Verwijderen"><p>Weet u zeker dat u deze opdracht permanent wilt verwijderen?</p></ConfirmationModal>
        </>
    );
};

export default JobDetails;