// src/components/Marketplace.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const Marketplace = ({ showNotification, navigateTo, currentUser }) => {
    const [publicJobs, setPublicJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicJobs = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/marketplace/jobs', 'GET');
                setPublicJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchPublicJobs();
        }
    }, [currentUser, showNotification]);

    if (isLoading) {
        return <div className="loading-text">Marktplaats laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Marktplaats</h1>
                <p className="page-subtitle">Hier vindt u alle openbare opdrachten waar u een offerte voor kunt indienen.</p>
            </div>
            
            {publicJobs.length === 0 ? (
                <div className="card-placeholder">
                    <p>Er zijn momenteel geen openbare opdrachten beschikbaar.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {publicJobs.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('job-details', job.id)}
                            className="card-interactive"
                        >
                            <div className="card-body">
                                <h2 className="card-title-lg">{job.title}</h2>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Oplage:</strong> {job.quantity}</span>
                                    <span><strong>Materiaal:</strong> {job.material}</span>
                                    <span><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N.v.t.'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
