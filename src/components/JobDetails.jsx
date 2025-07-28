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

    const handleConfirmDelete = async () => { /* ... uw bestaande delete logica ... */ };
    const handleAcceptQuote = async (quoteId) => { /* ... uw bestaande accept logica ... */ };

    if (isLoading) return <div className="loading-text">Opdrachtdetails laden...</div>;
    if (!job) return <div className="loading-text">Opdracht niet gevonden.</div>;
    
    const isOwner = currentUser?.userId === job.customerId;

    const renderActionButtons = () => { /* ... uw bestaande knoppen-logica ... */ };

    return (
        <>
            <div className="page-container">
                {/* ... (uw bestaande titel sectie) ... */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title-lg">Opdrachtomschrijving</h2>
                                <p className="whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>

                        {/* --- NIEUW: Productie Voortgang (alleen voor de eigenaar) --- */}
                        {isOwner && job.status === 'in_production' && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title-lg">Productie Voortgang</h2>
                                    {job.productionSteps.length > 0 ? (
                                        <ul className="steps steps-vertical">
                                            {job.productionSteps.map(step => (
                                                <li key={step.id} className={`step ${step.status === 'completed' ? 'step-primary' : ''}`}>
                                                    {step.title}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>De productieplanning is nog niet aangemaakt.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="card bg-base-100 shadow-xl">
                             <div className="card-body">
                                <h2 className="card-title-lg">Ingekomen Offertes ({job.quotes.length})</h2>
                                {/* ... (uw bestaande offertes-logica) ... */}
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl self-start">
                        {/* ... (uw bestaande details sectie) ... */}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Opdracht Verwijderen"
            >
                <p>Weet u zeker dat u deze opdracht permanent wilt verwijderen?</p>
            </ConfirmationModal>
        </>
    );
};

export default JobDetails;
