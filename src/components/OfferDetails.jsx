// src/components/EditOffer.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditOffer = ({ showNotification, navigateTo, viewParam: offerId, currentUser }) => {
    const [offerData, setOfferData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOffer = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest(`/offers/${offerId}`, 'GET');
                setOfferData(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser && offerId) {
            fetchOffer();
        }
    }, [currentUser, offerId, showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfferData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/offers/${offerId}`, 'PUT', offerData);
            showNotification('Aanbod succesvol bijgewerkt!');
            navigateTo('offer-details', offerId);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md";

    if (isLoading) return <div className="loading-text">Aanbod laden...</div>;
    if (!offerData) return <div className="loading-text">Kon aanbod niet laden.</div>;

    return (
        <div className="form-container">
            <h1 className="page-title mb-6">Aanbod Bewerken</h1>
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                <div>
                    <label htmlFor="machineType" className="form-label">Machinetype</label>
                    <input id="machineType" name="machineType" type="text" value={offerData.machineType} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="material" className="form-label">Materiaal</label>
                    <input id="material" name="material" type="text" value={offerData.material} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="location" className="form-label">Locatie (optioneel)</label>
                    <input id="location" name="location" type="text" value={offerData.location || ''} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="capacityDetails" className="form-label">Details Capaciteit</label>
                    <textarea id="capacityDetails" name="capacityDetails" value={offerData.capacityDetails} onChange={handleChange} className={inputClasses} rows="4" required></textarea>
                </div>
                <div>
                    <label htmlFor="price" className="form-label">Prijsindicatie</label>
                    <input id="price" name="price" type="text" value={offerData.price} onChange={handleChange} className={inputClasses} required />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? 'Bezig met opslaan...' : 'Wijzigingen Opslaan'}
                </button>
            </form>
        </div>
    );
};

export default EditOffer;
