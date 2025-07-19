// src/components/MyProductions.jsx - Opgeschoonde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const MyProductions = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            // Zet laden hier expliciet aan, mocht de component opnieuw laden
            setLoading(true); 
            try {
                const data = await apiRequest('/jobs/production');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                // Zet het laden altijd uit, of het nu slaagt of faalt
                setLoading(false); 
            }
        };
        
        fetchJobs();
    }, [showNotification]); // Dependency array voor consistentie

    if (loading) return <p>Productie-opdrachten laden...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Mijn Productie-opdrachten</h2>
            {jobs.length === 0 ? (<p>U heeft momenteel geen opdrachten in productie.</p>) : (
                <div className="space-y-6">
                    {jobs.map(job => (
                        <div key={job.id} className="card card-clickable" onClick={() => navigateTo('production-details', job.id)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Klant: <span className="font-medium text-slate-700">{job.customerName || 'Onbekend'}</span>
                                    </p>
                                </div>
                                <StatusBadge status={job.status} />
                            </div>
                            <div className="text-right mt-4 text-sm font-semibold text-blue-600">
                                Beheer Productie →
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProductions;