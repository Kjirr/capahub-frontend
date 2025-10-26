// src/components/QuoteRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: Importeer de store ---
import useAuthStore from '@/store/authStore';
import { getMarketplaceJobs, assignJobToSelf } from '@/api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'currentUser' als prop verwijderd ---
const QuoteRequests = ({ showNotification, navigateTo }) => {
    // Haal de gebruiker direct uit de store
    const { currentUser } = useAuthStore();
    // --- EINDE WIJZIGING ---

    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMarketplaceJobs();
            setRequests(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        // De logica blijft hetzelfde, maar 'currentUser' komt nu uit de store
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser, fetchRequests]);

    const handleAssign = async (jobId) => {
        try {
            await assignJobToSelf(jobId);
            showNotification('Opdracht aan uzelf toegewezen. U kunt nu een offerte indienen.', 'success');
            navigateTo('submit-quote', jobId);
        } catch (error) {
            showNotification(error.message, 'error');
            fetchRequests();
        }
    };

    if (isLoading) return <div className="loading-text">Offerteaanvragen laden...</div>;

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Gedeelde Werkbak: Offerteaanvragen</h1>
                <p className="page-subtitle">Dit zijn de openbare opdrachten die wachten op een offerte.</p>
            </div>

            {requests.length === 0 ? (
                <div className="card-placeholder">
                    <p>Er zijn momenteel geen nieuwe offerteaanvragen.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(job => (
                        <div key={job.id} className="card bg-base-100 shadow-md">
                            <div className="card-body flex-row justify-between items-center">
                                <div>
                                    <h2 className="card-title-lg">{job.title}</h2>
                                    <p className="text-sm text-base-content/70">Klant: {job.company.name}</p>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => handleAssign(job.id)} className="btn-primary">
                                        Toewijzen & Offerte maken
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuoteRequests;