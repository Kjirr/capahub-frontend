// src/components/QuoteRequests.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const QuoteRequests = ({ showNotification, navigateTo, currentUser }) => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            // Deze route haalt de niet-toegewezen opdrachten van de marktplaats op
            const data = await apiRequest('/marketplace/jobs', 'GET');
            setRequests(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchRequests();
        }
    }, [currentUser, fetchRequests]);

    const handleAssign = async (jobId) => {
        try {
            await apiRequest(`/jobs/${jobId}/assign`, 'PUT');
            showNotification('Opdracht aan uzelf toegewezen. U kunt nu een offerte indienen.', 'success');
            // Stuur de gebruiker direct naar de offertepagina
            navigateTo('submit-quote', jobId);
        } catch (error) {
            showNotification(error.message, 'error');
            fetchRequests(); // Herlaad de lijst als het toewijzen mislukt
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
