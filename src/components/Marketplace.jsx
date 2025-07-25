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
        return <div className="text-center p-10">Marktplaats laden...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Marktplaats</h1>
                <p className="text-base-content/70 mt-2">Hier vindt u alle openbare opdrachten waar u een offerte voor kunt indienen.</p>
            </div>
            
            {publicJobs.length === 0 ? (
                <div className="card bg-base-100 text-center p-10">
                    <p>Er zijn momenteel geen openbare opdrachten beschikbaar.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {publicJobs.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('job-details', job.id)}
                            className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <div className="card-body">
                                <h2 className="card-title">{job.title}</h2>
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
