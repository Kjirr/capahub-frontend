// src/components/EditMaterialModal.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditMaterialModal = ({ isOpen, onClose, onMaterialUpdated, showNotification, material }) => {
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Vul het formulier met de data van het geselecteerde materiaal als de modal opent
        if (material) {
            setFormData({
                name: material.name || '',
                type: material.type || 'SHEET',
                unit: material.unit || '',
                thickness: material.thickness || '',
                pricingModel: material.pricingModel || 'PER_SHEET',
                price: material.price || '',
                sheetWidth_mm: material.sheetWidth_mm || '',
                sheetHeight_mm: material.sheetHeight_mm || '',
                rollWidth_mm: material.rollWidth_mm || '',
                rollLength_m: material.rollLength_m || '',
            });
        }
    }, [material]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiRequest(`/materials/${material.id}`, 'PUT', formData);
            showNotification(`Materiaal '${formData.name}' succesvol bijgewerkt!`, 'success');
            onMaterialUpdated();
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-2xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Materiaal Bewerken</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-4">
                            <input type="text" name="name" placeholder="Materiaalnaam" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                            <input type="text" name="thickness" placeholder="Dikte/Grammage" value={formData.thickness} onChange={handleChange} className="input input-bordered w-full" />
                            <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered w-full">
                                <option value="SHEET">Vel/Plaat</option>
                                <option value="ROLL">Rol</option>
                                <option value="LIQUID">Vloeistof</option>
                                <option value="OTHER">Overig</option>
                            </select>
                            <input type="text" name="unit" placeholder="Eenheid" value={formData.unit} onChange={handleChange} className="input input-bordered w-full" required />
                        </div>
                        <div className="space-y-4">
                            <select name="pricingModel" value={formData.pricingModel} onChange={handleChange} className="select select-bordered w-full">
                                <option value="PER_SQUARE_METER">Prijs per m²</option>
                                <option value="PER_SHEET">Prijs per vel</option>
                                <option value="PER_ROLL">Prijs per rol</option>
                                <option value="PER_UNIT">Prijs per eenheid</option>
                            </select>
                            <input type="number" step="0.01" name="price" placeholder="Prijs per eenheid" value={formData.price} onChange={handleChange} className="input input-bordered w-full" required />
                            {formData.type === 'SHEET' && (
                                <>
                                    <input type="number" name="sheetWidth_mm" placeholder="Vel breedte (mm)" value={formData.sheetWidth_mm} onChange={handleChange} className="input input-bordered w-full" />
                                    <input type="number" name="sheetHeight_mm" placeholder="Vel hoogte (mm)" value={formData.sheetHeight_mm} onChange={handleChange} className="input input-bordered w-full" />
                                </>
                            )}
                            {formData.type === 'ROLL' && (
                                <>
                                    <input type="number" name="rollWidth_mm" placeholder="Rol breedte (mm)" value={formData.rollWidth_mm} onChange={handleChange} className="input input-bordered w-full" />
                                    <input type="number" name="rollLength_m" placeholder="Rol lengte (m)" value={formData.rollLength_m} onChange={handleChange} className="input input-bordered w-full" />
                                </>
                            )}
                        </div>
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

export default EditMaterialModal;