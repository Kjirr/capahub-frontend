// src/components/ProductionKanban.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

// Een sub-component voor een enkele kolom in het Kanban-bord
const KanbanColumn = ({ title, jobs, navigateTo }) => (
    <div className="bg-base-200 rounded-lg p-4 w-full md:w-1/3">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="space-y-4">
            {jobs.map(job => (
                <div 
                    key={job.id} 
                    onClick={() => navigateTo('production-details', job.id)}
                    className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                >
                    <div className="card-body p-4">
                        <h4 className="card-title text-base">{job.title}</h4>
                        <p className="text-sm text-base-content/70">Klant: {job.customer.bedrijfsnaam}</p>
                    </div>
                </div>
            ))}
            {jobs.length === 0 && <p className="text-sm text-base-content/50 p-4">Geen opdrachten in deze fase.</p>}
        </div>
    </div>
);

const ProductionKanban = ({ navigateTo, showNotification, currentUser }) => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProductionJobs = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/productions/my-productions');
                setJobs(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser) {
            fetchProductionJobs();
        }
    }, [currentUser, showNotification]);

    if (isLoading) return <div className="text-center p-10">Productieplanning laden...</div>;
    
    // Verdeel de opdrachten over de kolommen
    const jobsToDo = jobs.filter(j => j.status === 'in_production' && !j.productionSteps.some(s => s.status === 'in_progress' || s.status === 'completed'));
    const jobsInProgress = jobs.filter(j => j.status === 'in_production' && j.productionSteps.some(s => s.status === 'in_progress'));
    const jobsCompleted = jobs.filter(j => j.status === 'completed');

    return (
        <div className="container mx-auto">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Productieplanning</h1>
                    <p className="text-base-content/70 mt-2">Visueel overzicht van uw productielijn.</p>
                </div>
                <button onClick={() => navigateTo('my-productions')} className="btn btn-ghost">
                    &larr; Terug naar Lijstweergave
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <KanbanColumn title="Te Doen" jobs={jobsToDo} navigateTo={navigateTo} />
                <KanbanColumn title="In Uitvoering" jobs={jobsInProgress} navigateTo={navigateTo} />
                <KanbanColumn title="Voltooid" jobs={jobsCompleted} navigateTo={navigateTo} />
            </div>
        </div>
    );
};

export default ProductionKanban;
