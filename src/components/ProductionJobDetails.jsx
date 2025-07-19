import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const ProductionJobDetails = ({ jobId, navigateTo, showNotification }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStepTitle, setNewStepTitle] = useState('');

    const fetchJob = useCallback(async () => {
        if (!jobId) {
            setLoading(false);
            return;
        }
        try {
            const data = await apiRequest(`/jobs/${jobId}`);
            setJob(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    const handleDataRefresh = async () => {
        try {
            const data = await apiRequest(`/jobs/${jobId}`);
            setJob(data);
        } catch (error) {
            showNotification('Kon de laatste data niet ophalen.', 'error');
        }
    };

    const handleStatusUpdate = async (stepId, newStatus) => {
        try {
            await apiRequest(`/steps/${stepId}`, 'PUT', { status: newStatus });
            handleDataRefresh();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const handleAddStep = async (e) => {
        e.preventDefault();
        if (!newStepTitle) return;
        const newOrder = (job.productionSteps?.length || 0) + 1;
        try {
            await apiRequest(`/jobs/${jobId}/steps`, 'POST', { title: newStepTitle, order: newOrder });
            setNewStepTitle('');
            handleDataRefresh();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleJobCompleted = async () => {
        if (window.confirm('Weet je zeker dat je deze opdracht wilt markeren als voltooid?')) {
            try {
                await apiRequest(`/jobs/${jobId}/status`, 'PUT', { status: 'completed' });
                showNotification('Opdracht voltooid!', 'success');
                handleDataRefresh();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    if (loading) return <p>Opdrachtdetails laden...</p>;
    if (!job) return <p>Kon opdracht niet vinden.</p>;

    return (
        <div>
            <button onClick={() => navigateTo('my-productions')} className="btn btn-secondary mb-6">← Terug naar producties</button>
            <div className="card">
                 <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
                    <StatusBadge status={job.status} />
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{job.description}</p>
                 <p className="mt-4 text-sm text-gray-500">
                    Klant: <span className="font-medium">{job.customer?.bedrijfsnaam || 'Onbekend'}</span>
                </p>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Productie Planning</h2>
                <div className="card space-y-4">
                    {job.productionSteps && job.productionSteps.length > 0 ? (
                        job.productionSteps.map(step => (
                            <div key={step.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50">
                                <div>
                                    <p className="font-semibold text-slate-800">{step.title}</p>
                                    <p className="text-sm text-slate-500 capitalize">{step.status.replace('_', ' ')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button disabled={step.status === 'in_progress'} onClick={() => handleStatusUpdate(step.id, 'in_progress')} className="btn btn-secondary text-xs">Start</button>
                                    <button disabled={step.status === 'completed'} onClick={() => handleStatusUpdate(step.id, 'completed')} className="btn btn-primary text-xs">Voltooi</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Nog geen stappen toegevoegd aan de planning.</p>
                    )}
                </div>
                 <form onSubmit={handleAddStep} className="card mt-4 flex gap-4">
                    <input 
                        type="text" 
                        value={newStepTitle} 
                        onChange={(e) => setNewStepTitle(e.target.value)}
                        placeholder="Nieuwe productiestap toevoegen..."
                        className="w-full p-2 border rounded-md"
                    />
                    <button type="submit" className="btn btn-primary">Voeg toe</button>
                </form>
            </div>
            
            {job.status === 'in_production' && (
                <div className="mt-8 card text-center">
                    <h3 className="text-lg font-semibold mb-2">Opdracht Afronden</h3>
                    <p className="text-slate-600 mb-4">Als alle productiestappen zijn voltooid, markeer de opdracht dan als afgerond.</p>
                    <button onClick={handleJobCompleted} className="btn btn-primary bg-green-600 hover:bg-green-700">Markeer als Voltooi</button>
                </div>
            )}
        </div>
    );
};

export default ProductionJobDetails;