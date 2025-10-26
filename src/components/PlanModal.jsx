// src/components/PlanModal.jsx

import React, { useState, useEffect } from 'react';
import { createPlan } from '@/api';

const permissionDisplayMap = {
    'submit_marketplace_quotes': 'Marktplaats Offertes',
    'manage_offers': 'Mijn Aanbod',
    'view_archive': 'Archief',
    'manage_direct_quotes': 'Directe Offertes',
    'manage_production': 'Productie',
    'manage_team': 'Team Beheer',
    'manage_materials': 'Materiaal',
    'manage_warehouse': 'Magazijn',
    'manage_purchasing': 'Inkoop',
    'manage_admin': 'Instellingen',
    'manage_product_templates': 'Eigen Productbibliotheek',
    'manage_shipping': 'Expeditie Beheer',
};

const PlanModal = ({ isOpen, onClose, onSave, showNotification, allPermissions }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens or closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', description: '' });
            setSelectedPermissionIds(new Set());
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                permissionIds: Array.from(selectedPermissionIds)
            };
            await createPlan(payload);
            showNotification('Nieuw abonnement succesvol aangemaakt!', 'success');
            onSave(); // This will trigger a refetch in the parent
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
            onClose(); 
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-3xl">
                <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <h3 className="font-bold text-lg">Nieuw Abonnement Aanmaken</h3>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Naam van het Abonnement</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" placeholder="bv. Premium" required />
                    </div>
                     <div className="form-control">
                        <label className="label"><span className="label-text">Omschrijving</span></label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="input input-bordered" placeholder="Korte omschrijving van het plan" />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text">Selecteer Permissies</span></label>
                        <div className="p-4 bg-base-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {allPermissions.map(permission => (
                                <label key={permission.id} className="label cursor-pointer">
                                    <span className="label-text">{permissionDisplayMap[permission.name] || permission.name}</span>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={selectedPermissionIds.has(permission.id)}
                                        onChange={() => handlePermissionChange(permission.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-action">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Opslaan...' : 'Abonnement Opslaan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanModal;