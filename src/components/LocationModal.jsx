import React, { useState } from 'react';
import { apiRequest } from '../api';

const LocationModal = ({ isOpen, onClose, onLocationAdded, showNotification }) => {
    const initialState = { name: '', description: '' };
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newLocation = await apiRequest('/stock-locations', 'POST', formData);
            showNotification(`Locatie '${newLocation.name}' succesvol aangemaakt!`, 'success');
            onLocationAdded();
            onClose();
            setFormData(initialState);
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
                    <h2 className="card-title-lg">Nieuwe Magazijnlocatie</h2>
                    <div className="form-control w-full mt-4">
                        <label className="label"><span className="label-text">Naam Locatie</span></label>
                        <input type="text" name="name" placeholder="bv. Stelling A-01" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                    </div>
                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Omschrijving (optioneel)</span></label>
                        <input type="text" name="description" placeholder="bv. Voor grote vellen" value={formData.description} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Opslaan...' : 'Locatie Opslaan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default LocationModal;