// src/components/ProductionKanban

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const KanbanColumn = ({ title, jobs }) => (
    <div className="bg-slate-100 rounded-lg p-4 w-full md:w-1/3">
        <h3 className="font-bold text-lg mb-4 text-slate-700">{title}</h3>
        <div className="space-y-4">
            {jobs.map(job => (
                <div key={job.id} className="card card-clickable">
                    <h4 className="font-bold">{job.title}</h4>
                    <p className="text-sm text-slate-500">Klant: {job.customer.bedrijfsnaam}</p>
                    <div className="mt-2">
                        <StatusBadge status={job.status} />
                    </div>
                </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-slate-400">Geen opdrachten in deze fase.</p>}
        </div>
    </div>
);

const ProductionKanban = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductionJobs = async () => {
            try {
                const data = await apiRequest('/jobs/production');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProductionJobs();
    }, [showNotification]);

    if (loading) return <p>Productieplanning wordt geladen...</p>;
    
    // Verdeel de opdrachten over de kolommen gebaseerd op hun hoofdstatus
    const jobsToDo = jobs.filter(j => j.status === 'in_production' && !j.productionSteps.some(s => s.status === 'in_progress' || s.status === 'completed'));
    const jobsInProgress = jobs.filter(j => j.status === 'in_production' && j.productionSteps.some(s => s.status === 'in_progress'));
    const jobsCompleted = jobs.filter(j => j.status === 'completed');

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Productieplanning (Kanban)</h2>
            <div className="flex flex-col md:flex-row gap-6">
                <KanbanColumn title="Te Doen" jobs={jobsToDo} />
                <KanbanColumn title="Bezig" jobs={jobsInProgress} />
                <KanbanColumn title="Voltooid" jobs={jobsCompleted} />
            </div>
        </div>
    );
};

export default ProductionKanban;