// src/components/MyProductions.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const MyProductions = ({ showNotification, currentUser, navigateTo }) => {
    const [productions, setProductions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProductions = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/productions/my-productions');
                setProductions(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser) {
            fetchProductions();
        }
    }, [currentUser, showNotification]);

    if (isLoading) return <div className="loading-text">Producties laden...</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Mijn Producties</h1>
                    <p className="page-subtitle">Hier vindt u een overzicht van alle opdrachten die u in productie heeft.</p>
                </div>
                <button onClick={() => navigateTo('production-kanban')} className="btn-secondary">
                    Toon Kanban Bord
                </button>
            </div>

            {productions.length === 0 ? (
                <div className="card-placeholder"><p>U heeft momenteel geen opdrachten in productie.</p></div>
            ) : (
                <div className="space-y-4">
                    {productions.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('production-details', job.id)}
                            className="card-interactive"
                        >
                            <div className="card-body">
                                <h2 className="card-title-lg">{job.title}</h2>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Klant:</strong> {job.customer.bedrijfsnaam}</span>
                                    <span><strong>Status:</strong> {job.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProductions;
