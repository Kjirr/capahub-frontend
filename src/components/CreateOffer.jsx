// src/components/CreateOffer.jsx

import React, { useState } from 'react';
import { apiRequest } from '../api';

const CreateOffer = ({ showNotification, navigateTo }) => {
    const [formData, setFormData] = useState({
        machineType: '',
        material: '',
        capacityDetails: '',
        price: '',
        location: '' // <-- Nieuw veld
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest('/offers', 'POST', formData);
            showNotification('Aanbod succesvol geplaatst!');
            navigateTo('my-offers');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md";

    return (
        <div className="form-container">
            <h1 className="page-title mb-6">Nieuw Aanbod Plaatsen</h1>
            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                <div>
                    <label htmlFor="machineType" className="form-label">Machinetype</label>
                    <input id="machineType" name="machineType" type="text" value={formData.machineType} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="material" className="form-label">Materiaal</label>
                    <input id="material" name="material" type="text" value={formData.material} onChange={handleChange} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="location" className="form-label">Locatie (optioneel)</label>
                    <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="capacityDetails" className="form-label">Details Capaciteit</label>
                    <textarea id="capacityDetails" name="capacityDetails" value={formData.capacityDetails} onChange={handleChange} className={inputClasses} rows="4" required></textarea>
                </div>
                <div>
                    <label htmlFor="price" className="form-label">Prijsindicatie</label>
                    <input id="price" name="price" type="text" value={formData.price} onChange={handleChange} className={inputClasses} required />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? 'Bezig met plaatsen...' : 'Aanbod Plaatsen'}
                </button>
            </form>
        </div>
    );
};

export default CreateOffer;
