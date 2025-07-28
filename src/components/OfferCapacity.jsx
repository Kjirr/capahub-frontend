import React, { useState } from 'react';
import { apiRequest } from '../api';

const OfferCapacity = ({ navigateTo, showNotification }) => {
    const [machineType, setMachineType] = useState('');
    const [material, setMaterial] = useState('');
    const [capacityDetails, setCapacityDetails] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const offerData = { machineType, material, capacityDetails, price };
        try {
            await apiRequest('/offers', 'POST', offerData);
            showNotification('Aanbod succesvol geplaatst!');
            navigateTo('my-offers');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Bied Vrije Capaciteit Aan</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Machinetype</label>
                    <input type="text" placeholder="bv. Heidelberg Speedmaster" value={machineType} onChange={e => setMachineType(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Materiaal</label>
                    <input type="text" placeholder="bv. Papier, Karton, Vinyl" value={material} onChange={e => setMaterial(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Details Capaciteit</label>
                    <textarea placeholder="Beschrijf de beschikbare capaciteit..." value={capacityDetails} onChange={e => setCapacityDetails(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Prijsindicatie</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                        <input type="text" placeholder="bv. 500 per dag" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded-md pl-7" required />
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigateTo('dashboard')} className="btn-secondary">Annuleren</button>
                    <button type="submit" className="btn-primary">Plaats Aanbod</button>
                </div>
            </form>
        </div>
    );
};

export default OfferCapacity;