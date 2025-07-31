import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const MachineModal = ({ isOpen, onClose, onSave, showNotification, machineToEdit }) => {
    const initialState = { name: '', setupTimeMinutes: '', runSpeedPerHour: '', costPerHour: '' };
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (machineToEdit) {
            setFormData(machineToEdit);
        } else {
            setFormData(initialState);
        }
    }, [machineToEdit, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (machineToEdit) {
                await apiRequest(`/calculation-settings/machines/${machineToEdit.id}`, 'PUT', formData);
                showNotification(`Machine '${formData.name}' succesvol bijgewerkt!`, 'success');
            } else {
                await apiRequest('/calculation-settings/machines', 'POST', formData);
                showNotification(`Machine '${formData.name}' succesvol aangemaakt!`, 'success');
            }
            onSave();
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
                    <h2 className="card-title-lg">{machineToEdit ? 'Machine Bewerken' : 'Nieuwe Machine Toevoegen'}</h2>
                    
                    <div className="form-control w-full mt-4">
                        <label className="label"><span className="label-text">Naam Machine</span></label>
                        <input type="text" name="name" placeholder="bv. Heidelberg SM 102" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                         <div className="form-control w-full">
                            <label className="label"><span className="label-text">Opstarttijd (min)</span></label>
                            <input type="number" name="setupTimeMinutes" value={formData.setupTimeMinutes} onChange={handleChange} className="input input-bordered w-full" required />
                        </div>
                         <div className="form-control w-full">
                            <label className="label"><span className="label-text">Snelheid (p/u)</span></label>
                            <input type="number" name="runSpeedPerHour" value={formData.runSpeedPerHour} onChange={handleChange} className="input input-bordered w-full" required />
                        </div>
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text">Kosten (€ p/u)</span></label>
                            <input type="number" step="0.01" name="costPerHour" value={formData.costPerHour} onChange={handleChange} className="input input-bordered w-full" required />
                        </div>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MachineModal;