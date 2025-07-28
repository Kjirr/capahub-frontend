// src/components/CreateJob.jsx

import React, { useState } from 'react';
import { apiRequest } from '../api';

const DESCRIPTION_MAX_LENGTH = 500;

const CreateJob = ({ showNotification, navigateTo }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1000);
    const [material, setMaterial] = useState('');
    const [format, setFormat] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [deadline, setDeadline] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDescriptionChange = (e) => {
        if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
            setDescription(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const jobData = { title, description, quantity: Number(quantity), material, format, isPublic, deadline };
            await apiRequest('/jobs', 'POST', jobData);
            showNotification('Opdracht succesvol aangemaakt!');
            navigateTo('my-jobs');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dit is de nieuwe, correcte styling voor de invoervelden
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="form-container">
            <h1 className="page-title mb-6">Nieuwe Opdracht Plaatsen</h1>
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="form-label">Titel</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="description" className="form-label">Omschrijving</label>
                        <textarea id="description" value={description} onChange={handleDescriptionChange} className={inputClasses} rows="5" required></textarea>
                        <p className="text-right text-sm text-gray-500 mt-1">{description.length}/{DESCRIPTION_MAX_LENGTH}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                        <label htmlFor="quantity" className="form-label">Oplage</label>
                        <input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="material" className="form-label">Materiaal</label>
                        <input id="material" type="text" value={material} onChange={e => setMaterial(e.target.value)} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="format" className="form-label">Formaat (optioneel)</label>
                        <input id="format" type="text" value={format} onChange={e => setFormat(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="form-label">Deadline</label>
                        <input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClasses} required />
                    </div>
                </div>
                
                <div className="pt-4 border-t">
                    <div className="flex items-center">
                        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} id="isPublic" className="checkbox mr-3" />
                        <label htmlFor="isPublic">Plaats deze opdracht ook openbaar op de Marktplaats</label>
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Bezig met plaatsen...' : 'Opdracht Plaatsen'}
                </button>
            </form>
        </div>
    );
};

export default CreateJob;