// src/components/MyJobs.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const MyJobs = ({ showNotification, navigateTo, currentUser }) => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyJobs = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/jobs/my-jobs', 'GET');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        // DE FIX: Voer de fetch alleen uit als we zeker weten wie de gebruiker is.
        if (currentUser) {
            fetchMyJobs();
        }
    }, [currentUser, showNotification]);

    if (isLoading) {
        return <div className="text-center p-10">Mijn opdrachten laden...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mijn Opdrachten</h1>
                    <p className="text-base-content/70 mt-2">Hier vindt u een overzicht van alle opdrachten die u heeft geplaatst.</p>
                </div>
                <button onClick={() => navigateTo('create-job')} className="btn btn-primary">
                    Nieuwe Opdracht Plaatsen
                </button>
            </div>
            
            {jobs.length === 0 ? (
                <div className="card bg-base-100 text-center p-10 shadow-xl">
                    <p>U heeft nog geen opdrachten geplaatst.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('job-details', job.id)} 
                            className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <div className="card-body flex-row justify-between items-center">
                                <div>
                                    <h2 className="card-title">{job.title}</h2>
                                    <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                        <span><strong>Status:</strong> {job.status}</span>
                                        <span><strong>Geplaatst op:</strong> {new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="stat-value">{job._count.quotes}</div>
                                    <div className="stat-desc">Offertes</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyJobs;
