// src/components/JobMarketplace.jsx - Gecorrigeerde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const JobMarketplace = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiRequest('/jobs/marketplace');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [showNotification]);

    if (loading) return <p>Marktplaats wordt geladen...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Opdrachten Marktplaats</h2>
            {jobs.length === 0 ? (<p>Er zijn momenteel geen openbare opdrachten beschikbaar.</p>) : (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="card card-clickable" onClick={() => navigateTo('submit-quote', job.id)}>
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <p className="text-gray-600">Aangevraagd door: 
                                <span 
                                    className="link ml-1" 
                                    onClick={(e) => { e.stopPropagation(); navigateTo('public-profile', job.customerId); }}>
                                    {job.customer?.bedrijfsnaam || 'Onbekend'}
                                </span>
                            </p>
                            <div className="mt-2 text-sm text-slate-600">
                                {/* DE AANPASSING ZIT HIER: geen .specifications meer */}
                                <span className="font-semibold text-slate-800">Oplage:</span> {job.quantity} | 
                                <span className="font-semibold text-slate-800 ml-2">Materiaal:</span> {job.material}
                                {job.location && <> | <span className="font-semibold text-slate-800 ml-2">Locatie:</span> {job.location}</>}
                            </div>
                            <div className="text-right mt-2"><span className="font-semibold text-blue-600">Bekijk en Dien Offerte In →</span></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobMarketplace;