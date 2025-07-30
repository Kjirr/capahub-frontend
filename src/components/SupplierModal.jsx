import React, { useState } from 'react';
import { apiRequest } from '../api';

const SupplierModal = ({ isOpen, onClose, onSupplierAdded, showNotification }) => {
    const initialState = { name: '', contactPerson: '', email: '', phone: '', address: '', postcode: '', city: '' };
    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newSupplier = await apiRequest('/suppliers', 'POST', formData);
            showNotification(`Leverancier '${newSupplier.name}' succesvol aangemaakt!`, 'success');
            onSupplierAdded();
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
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-2xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Nieuwe Leverancier Toevoegen</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input type="text" name="name" placeholder="Naam Leverancier" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required />
                        <input type="text" name="contactPerson" placeholder="Contactpersoon" value={formData.contactPerson} onChange={handleChange} className="input input-bordered w-full" />
                        <input type="email" name="email" placeholder="E-mailadres" value={formData.email} onChange={handleChange} className="input input-bordered w-full" />
                        <input type="text" name="phone" placeholder="Telefoonnummer" value={formData.phone} onChange={handleChange} className="input input-bordered w-full" />
                        <input type="text" name="address" placeholder="Adres" value={formData.address} onChange={handleChange} className="input input-bordered w-full" />
                        <input type="text" name="postcode" placeholder="Postcode" value={formData.postcode} onChange={handleChange} className="input input-bordered w-full" />
                        <input type="text" name="city" placeholder="Plaats" value={formData.city} onChange={handleChange} className="input input-bordered w-full" />
                    </div>
                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Opslaan...' : 'Leverancier Opslaan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierModal;