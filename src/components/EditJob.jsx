// src/components/EditJob.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditJob = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [jobData, setJobData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest(`/jobs/${jobId}`, 'GET');
                // Formatteer de datums correct voor de input-velden
                data.deadline = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';
                data.quotingDeadline = data.quotingDeadline ? new Date(data.quotingDeadline).toISOString().split('T')[0] : '';
                setJobData(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser && jobId) {
            fetchJob();
        }
    }, [currentUser, jobId, showNotification]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJobData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/jobs/${jobId}`, 'PUT', jobData);
            showNotification('Opdracht succesvol bijgewerkt!');
            navigateTo('job-details', jobId);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";

    if (isLoading) return <div className="text-center p-10">Opdracht laden...</div>;
    if (!jobData) return <div className="text-center p-10">Kon opdracht niet laden.</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Opdracht Bewerken</h1>
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block font-semibold mb-1">Titel</label>
                        <input id="title" name="title" type="text" value={jobData.title} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block font-semibold mb-1">Omschrijving</label>
                        <textarea id="description" name="description" value={jobData.description} onChange={handleChange} className={inputClasses} rows="5" required></textarea>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                        <label htmlFor="quantity" className="block font-semibold mb-1">Oplage</label>
                        <input id="quantity" name="quantity" type="number" value={jobData.quantity} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="material" className="block font-semibold mb-1">Materiaal</label>
                        <input id="material" name="material" type="text" value={jobData.material} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="format" className="block font-semibold mb-1">Formaat (optioneel)</label>
                        <input id="format" name="format" type="text" value={jobData.format || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block font-semibold mb-1">Deadline Opdracht</label>
                        <input id="deadline" name="deadline" type="date" value={jobData.deadline} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="quotingDeadline" className="block font-semibold mb-1">Deadline Offertes (optioneel)</label>
                        <input id="quotingDeadline" name="quotingDeadline" type="date" value={jobData.quotingDeadline} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <div className="flex items-center">
                        <input type="checkbox" name="isPublic" checked={jobData.isPublic} onChange={handleChange} id="isPublic" className="checkbox mr-3" />
                        <label htmlFor="isPublic">Plaats deze opdracht ook openbaar op de Marktplaats</label>
                    </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary disabled:opacity-50">
                    {isSubmitting ? 'Bezig met opslaan...' : 'Wijzigingen Opslaan'}
                </button>
            </form>
        </div>
    );
};

export default EditJob;
