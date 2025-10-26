import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditLocationModal = ({ isOpen, onClose, onLocationUpdated, showNotification, location }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Vul het formulier met de data van de geselecteerde locatie
        if (location) {
            setFormData({
                name: location.name,
                description: location.description || '',
            });
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/stock-locations/${location.id}`, 'PUT', formData);
            showNotification('Locatie succesvol bijgewerkt!', 'success');
            onLocationUpdated(); // Ververs de lijst op de hoofdpagina
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg">
                <div className="card-body">
                    <h2 className="card-title-lg">Locatie Bewerken</h2>
                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Naam</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                    </div>
                    <div className="form-control mt-2">
                        <label className="label"><span className="label-text">Omschrijving (optioneel)</span></label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered w-full h-24" placeholder="Geef hier een omschrijving op..."></textarea>
                    </div>
                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditLocationModal;