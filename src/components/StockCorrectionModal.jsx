import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const StockCorrectionModal = ({ isOpen, onClose, onSave, showNotification, material }) => {
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [newQuantity, setNewQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLocations = useCallback(async () => {
        if (!isOpen) return;
        try {
            const data = await apiRequest('/stock-locations', 'GET');
            setLocations(data);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [isOpen, showNotification]);

    useEffect(() => {
        fetchLocations();
        // Reset state when modal opens or material changes
        setSelectedLocationId('');
        setNewQuantity('');
        setReason('');
    }, [isOpen, material, fetchLocations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                materialId: material.id,
                locationId: selectedLocationId,
                newQuantity: parseFloat(newQuantity),
                reason,
            };
            await apiRequest('/stock-locations/inventory/correct', 'POST', payload);
            showNotification('Voorraad succesvol bijgewerkt!', 'success');
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
                    <h2 className="card-title-lg">Voorraadcorrectie</h2>
                    <p className="mb-4">Voor materiaal: <strong>{material?.name}</strong></p>
                    
                    <div className="form-control w-full">
                        <label className="label"><span className="label-text">Kies Magazijnlocatie</span></label>
                        <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} className="select select-bordered" required>
                            <option value="" disabled>Selecteer een locatie</option>
                            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Nieuwe Totale Hoeveelheid</span></label>
                        <input type="number" step="0.01" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} className="input input-bordered" placeholder="bv. 1250" required />
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Reden van Correctie</span></label>
                        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="input input-bordered" placeholder="bv. Jaarlijkse telling, breuk, etc." required />
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Verwerken...' : 'Voorraad Bijwerken'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StockCorrectionModal;