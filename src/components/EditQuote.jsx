// src/components/EditQuote.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditQuote = ({ showNotification, navigateTo, viewParam: quoteId, currentUser }) => {
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const data = await apiRequest(`/quotes/${quoteId}`, 'GET');
                setFormData(data);
            } catch (error) {
                showNotification(error.message, 'error');
            }
        };
        if (currentUser && quoteId) {
            fetchQuote();
        }
    }, [currentUser, quoteId, showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/quotes/${quoteId}`, 'PUT', formData);
            showNotification('Offerte succesvol bijgewerkt!');
            navigateTo('my-submitted-quotes');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!formData) return <div className="text-center p-10">Offerte laden...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Offerte Bewerken ({formData.quoteNumber})</h1>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-6">
                {/* ... (Formulier vergelijkbaar met SubmitQuote.jsx) ... */}
                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary">
                    {isSubmitting ? <span className="loading loading-spinner"></span> : 'Wijzigingen Opslaan'}
                </button>
            </form>
        </div>
    );
};

export default EditQuote;
