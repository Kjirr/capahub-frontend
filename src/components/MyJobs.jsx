// src/components/MyJobs.jsx - Verbeterde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const MyJobs = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiRequest('/jobs/my-jobs');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [showNotification, navigateTo]);

    if (loading) return <p>Opdrachten laden...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Mijn Geplaatste Opdrachten</h2>
            {jobs.length === 0 ? (
                <p>U heeft nog geen opdrachten geplaatst. <span className="link" onClick={() => navigateTo('create-job')}>Plaats uw eerste opdracht.</span></p>
            ) : (
                <div className="space-y-6">
                    {jobs.map(job => (
                        <div key={job.id} className="card">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Opdracht #{job.id.slice(-6).toUpperCase()}</p>
                                    <h3 className="text-xl font-bold text-slate-900 mt-1">{job.title}</h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Geplaatst op: {new Date(job.createdAt).toLocaleDateString('nl-NL')}
                                    </p>
                                </div>
                                <StatusBadge status={job.status} />
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <div className="text-sm font-semibold text-slate-700">
                                    {/* Toon het aantal ontvangen offertes */}
                                    {job._count.quotes} Offerte(s) ontvangen
                                </div>
                                <button onClick={() => navigateTo('job-details', job.id)} className="font-semibold text-blue-600 hover:underline">
                                    Bekijk Details en Offertes →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyJobs;