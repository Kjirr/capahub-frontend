import React, { useState, useEffect } from 'react';
// --- ▼▼▼ AANGEPAST: Importeert nu de correcte functienamen ▼▼▼ ---
import { createStepDefinition, updateStepDefinition } from '../api';

const ProductionStepTemplateModal = ({ isOpen, onClose, onSave, showNotification, template }) => {
    const getInitialState = () => ({
        name: template?.name || '',
        description: template?.description || '',
        defaultOrder: template?.defaultOrder || 0,
    });

    const [formData, setFormData] = useState(getInitialState());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, template]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                defaultOrder: parseInt(formData.defaultOrder, 10) || 0,
            };

            // --- ▼▼▼ AANGEPAST: Roept nu de correcte functies aan ▼▼▼ ---
            if (template) {
                // Update bestaande stap ('bouwsteen')
                await updateStepDefinition(template.id, payload);
                showNotification('Stap succesvol bijgewerkt!', 'success');
            } else {
                // Maak nieuwe stap ('bouwsteen') aan
                await createStepDefinition(payload);
                showNotification('Nieuwe stap succesvol aangemaakt!', 'success');
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg">
                <div className="card-body">
                    <h2 className="card-title-lg">{template ? 'Stap Bewerken' : 'Nieuwe Stap Toevoegen'}</h2>
                    
                    <div className="form-control w-full mt-4">
                        <label className="label"><span className="label-text">Naam van de stap</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" placeholder="bv. Snijden" required />
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Standaard Volgorde</span></label>
                        <input type="number" name="defaultOrder" value={formData.defaultOrder} onChange={handleChange} className="input input-bordered" placeholder="bv. 10" required />
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Omschrijving (optioneel)</span></label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-24" placeholder="Korte omschrijving van wat deze stap inhoudt..."></textarea>
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

export default ProductionStepTemplateModal;