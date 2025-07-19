// src/components/EditJob.jsx - Complete versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditJob = ({ jobId, navigateTo, showNotification }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                const jobData = await apiRequest(`/jobs/${jobId}`);
                // Formatteer de datum correct voor het HTML-input-veld
                if (jobData.deadline) {
                    jobData.deadline = new Date(jobData.deadline).toISOString().split('T')[0];
                }
                setFormData(jobData);
            } catch (error) {
                showNotification('Kon opdrachtgegevens niet laden.', 'error');
            }
        };
        fetchJob();
    }, [jobId, showNotification]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await apiRequest(`/jobs/${jobId}`, 'PUT', formData);
            showNotification('Opdracht succesvol bijgewerkt!');
            navigateTo('job-details', jobId);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (!formData) return <p>Opdracht wordt geladen...</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleUpdate} className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Opdracht Aanpassen</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Titel van de opdracht*</label>
                        <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Omschrijving*</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Oplage*</label>
                            <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Materiaal*</label>
                            <input type="text" name="material" value={formData.material || ''} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Formaat</label>
                            <input type="text" name="format" value={formData.format || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Gewenste deadline</label>
                            <input type="date" name="deadline" value={formData.deadline || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                     <div className="mt-4 pt-4 border-t">
                        <label className="flex items-center">
                            <input type="checkbox" name="isPublic" checked={formData.isPublic || false} onChange={handleChange} className="h-4 w-4 text-gray-600 border-gray-300 rounded" />
                            <span className="ml-2 text-gray-700">Plaats deze opdracht openbaar op de Marktplaats</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={() => navigateTo('job-details', jobId)} className="btn btn-secondary">Annuleren</button>
                    <button type="submit" className="btn btn-primary">Wijzigingen Opslaan</button>
                </div>
            </form>
        </div>
    );
};

export default EditJob;