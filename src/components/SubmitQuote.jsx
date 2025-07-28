// src/components/SubmitQuote.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const SubmitQuote = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        price: '',
        deliveryTime: '',
        comments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJobTitle = async () => {
            setIsLoading(true);
            try {
                // We halen alleen de basis job-info op om de titel te tonen
                const data = await apiRequest(`/jobs/${jobId}`, 'GET');
                setJob(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser && jobId) {
            fetchJobTitle();
        }
    }, [currentUser, jobId, showNotification]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/quotes/${jobId}`, 'POST', formData);
            showNotification('Offerte succesvol ingediend!');
            navigateTo('marketplace'); // Ga terug naar de marktplaats
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "input input-bordered w-full";

    if (isLoading) return <div className="loading-text">Pagina laden...</div>;

    return (
        <div className="form-container">
            <h1 className="text-3xl font-bold mb-2">Offerte Indienen</h1>
            <p className="text-base-content/70 mb-6">Voor opdracht: <span className="font-semibold">{job?.title}</span></p>
            
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-6">
                <div>
                    <label htmlFor="price" className="form-label">
                        <span className="label-text font-semibold">Prijs (in €)</span>
                    </label>
                    <input id="price" name="price" type="number" step="0.01" placeholder="bv. 1250.50" value={formData.price} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="deliveryTime" className="form-label">
                        <span className="label-text font-semibold">Geschatte Levertijd</span>
                    </label>
                    <input id="deliveryTime" name="deliveryTime" type="text" placeholder="bv. 5 werkdagen" value={formData.deliveryTime} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="comments" className="form-label">
                        <span className="label-text font-semibold">Opmerkingen (optioneel)</span>
                    </label>
                    <textarea id="comments" name="comments" placeholder="Extra informatie over uw offerte..." value={formData.comments} onChange={handleChange} className="form-textarea" rows="4"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? <span className="loading-spinner"></span> : 'Offerte Indienen'}
                </button>
            </form>
        </div>
    );
};

export default SubmitQuote;
