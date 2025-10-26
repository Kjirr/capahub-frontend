// src/components/MyJobs.jsx

import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: Hooks voor navigatie en gebruiker importeren ---
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getMyJobs } from '@/api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: Props bijgewerkt ---
const MyJobs = ({ showNotification }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    // --- EINDE WIJZIGING ---
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMyJobs();
            setJobs(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchMyJobs();
        }
    }, [currentUser, fetchMyJobs]);

    if (isLoading) {
        return <div className="loading-text">Mijn opdrachten laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Mijn Opdrachten</h1>
                    <p className="page-subtitle">Hier vindt u een overzicht van alle opdrachten die u heeft geplaatst.</p>
                </div>
                {/* --- START WIJZIGING: Navigatieknoppen bijgewerkt --- */}
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate('/jobs-dashboard')} className="btn btn-ghost">
                        &larr; Terug
                    </button>
                    <button onClick={() => navigate('/create-job')} className="btn btn-primary">
                        Nieuwe Opdracht Plaatsen
                    </button>
                </div>
                {/* --- EINDE WIJZIGING --- */}
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
                            // --- START WIJZIGING: Navigatie bijgewerkt ---
                            onClick={() => navigate(`/job-details/${job.id}`)} 
                            // --- EINDE WIJZIGING ---
                            className="card-interactive"
                        >
                            <div className="card-body flex-row justify-between items-center">
                                <div>
                                    <h2 className="card-title-lg">{job.title}</h2>
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