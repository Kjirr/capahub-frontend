// src/components/ArchivePage.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const ArchivePage = ({ showNotification, currentUser, navigateTo }) => {
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArchivedJobs = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/archive/jobs', 'GET');
                setArchivedJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchArchivedJobs();
        }
    }, [currentUser, showNotification]);

    if (isLoading) {
        return <div className="text-center p-10">Archief laden...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Archief</h1>
                <p className="text-base-content/70 mt-2">Hier vindt u een overzicht van al uw voltooide of geannuleerde opdrachten.</p>
            </div>

            {archivedJobs.length === 0 ? (
                <div className="card bg-base-100 text-center p-10">
                    <p>Er zijn geen gearchiveerde opdrachten.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {archivedJobs.map(job => (
                        <div 
                            key={job.id} 
                            // onClick={() => navigateTo('job-details', job.id)} // Kan in de toekomst worden toegevoegd
                            className="card bg-base-100 shadow-md opacity-75" // Gearchiveerde items zijn iets doorzichtiger
                        >
                            <div className="card-body">
                                <h2 className="card-title">{job.title}</h2>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Status:</strong> {job.status}</span>
                                    <span><strong>Afgerond op:</strong> {new Date(job.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchivePage;
