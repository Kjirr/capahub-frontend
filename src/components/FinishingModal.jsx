// src/components/FinishingModal.jsx

import React, { useState, useEffect } from 'react';
import { createFinishing, updateFinishing } from '../api';

const FinishingModal = ({ isOpen, onClose, onSave, showNotification, finishing }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [costingProfile, setCostingProfile] = useState({
        costingMethod: 'PER_ITEM',
        costPerUnit: 0,
        setupCost: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (finishing) {
                setName(finishing.name || '');
                setDescription(finishing.description || '');
                // Zorg voor een default als costingProfile leeg is
                setCostingProfile(finishing.costingProfile && Object.keys(finishing.costingProfile).length > 0
                    ? finishing.costingProfile
                    : { costingMethod: 'PER_ITEM', costPerUnit: 0, setupCost: 0 }
                );
            } else {
                setName('');
                setDescription('');
                setCostingProfile({ costingMethod: 'PER_ITEM', costPerUnit: 0, setupCost: 0 });
            }
        }
    }, [isOpen, finishing]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        const isNumeric = ['costPerUnit', 'setupCost'].includes(name);
        setCostingProfile(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = { name, description, costingProfile };
        try {
            if (finishing) {
                await updateFinishing(finishing.id, payload);
                showNotification('Afwerking succesvol bijgewerkt!', 'success');
            } else {
                await createFinishing(payload);
                showNotification('Afwerking succesvol aangemaakt!', 'success');
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

    const getCostLabel = () => {
        switch (costingProfile.costingMethod) {
            case 'PER_SQUARE_METER': return 'Kosten per m² (€)';
            case 'PER_METER': return 'Kosten per meter (€)';
            default: return 'Kosten per stuk (€)';
        }
    };

    return (
        <div className="modal modal-open">
            <form onSubmit={handleSubmit} className="modal-box">
                <h3 className="font-bold text-lg">{finishing ? 'Afwerking Bewerken' : 'Nieuwe Afwerking'}</h3>
                
                <div className="form-control mt-4">
                    <label className="label"><span className="label-text">Naam Afwerking *</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered" required placeholder="bv. Tape plakken, Uitbreken" />
                </div>
                
                <div className="form-control mt-2">
                    <label className="label"><span className="label-text">Omschrijving</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered h-20" placeholder="Optionele interne notitie"></textarea>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-base-200 space-y-4">
                    <h4 className="font-bold">Kosten Profiel</h4>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Kostenmethode</span></label>
                        <select name="costingMethod" value={costingProfile.costingMethod} onChange={handleProfileChange} className="select select-bordered">
                            <option value="PER_ITEM">Per Stuk</option>
                            <option value="PER_SQUARE_METER">Per Vierkante Meter</option>
                            <option value="PER_METER">Per Strekkende Meter</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">{getCostLabel()}</span></label>
                            <input type="number" step="0.01" name="costPerUnit" value={costingProfile.costPerUnit || ''} onChange={handleProfileChange} className="input input-bordered" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Opstartkosten (€)</span></label>
                            <input type="number" step="0.01" name="setupCost" value={costingProfile.setupCost || ''} onChange={handleProfileChange} className="input input-bordered" />
                        </div>
                    </div>
                </div>

                <div className="modal-action mt-6">
                    <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Opslaan...' : 'Opslaan'}</button>
                </div>
            </form>
        </div>
    );
};

export default FinishingModal;