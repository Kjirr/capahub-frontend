// src/components/SubCompanyModal.jsx

import React, { useState } from 'react';
import { createSubCompany } from '../api';

const SubCompanyModal = ({ isOpen, onClose, onSave, showNotification }) => {
    const [formData, setFormData] = useState({ name: '', kvk: '', adres: '', postcode: '', plaats: '', telefoon: '', iban: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createSubCompany(formData);
            showNotification('Sub-bedrijf succesvol aangemaakt!', 'success');
            onSave(); // Refresh de lijst in de parent component
            onClose(); // Sluit de modal
            setFormData({ name: '', kvk: '', adres: '', postcode: '', plaats: '', telefoon: '', iban: '' }); // Reset formulier
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg">Nieuw Sub-bedrijf</h3>
                <form onSubmit={handleSubmit} className="py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Bedrijfsnaam *</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">KVK-nummer *</span></label>
                            <input type="text" name="kvk" value={formData.kvk} onChange={handleChange} className="input input-bordered" required />
                        </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text">Adres</span></label>
                            <input type="text" name="adres" value={formData.adres} onChange={handleChange} className="input input-bordered" />
                        </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text">Postcode</span></label>
                            <input type="text" name="postcode" value={formData.postcode} onChange={handleChange} className="input input-bordered" />
                        </div>
                         <div className="form-control">
                            <label className="label"><span className="label-text">Plaats</span></label>
                            <input type="text" name="plaats" value={formData.plaats} onChange={handleChange} className="input input-bordered" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Telefoonnummer</span></label>
                            <input type="tel" name="telefoon" value={formData.telefoon} onChange={handleChange} className="input input-bordered" />
                        </div>
                         <div className="form-control md:col-span-2">
                            <label className="label"><span className="label-text">IBAN</span></label>
                            <input type="text" name="iban" value={formData.iban} onChange={handleChange} className="input input-bordered" />
                        </div>
                    </div>
                    
                    <div className="modal-action mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                            {isSubmitting ? 'Aanmaken...' : 'Aanmaken'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubCompanyModal;