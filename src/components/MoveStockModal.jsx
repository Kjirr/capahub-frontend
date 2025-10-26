import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const MoveStockModal = ({ isOpen, onClose, onSave, showNotification, stockItem }) => {
    const [quantity, setQuantity] = useState('');
    const [destinationLocationId, setDestinationLocationId] = useState('');
    const [reason, setReason] = useState('');
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLocations = useCallback(async () => {
        if (!isOpen || !stockItem) return;
        try {
            const allLocations = await apiRequest('/stock-locations', 'GET');
            // Filter de bronlocatie uit de lijst met bestemmingen
            const destinationOptions = allLocations.filter(loc => loc.id !== stockItem.location.id);
            setAvailableLocations(destinationOptions);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [isOpen, stockItem, showNotification]);

    useEffect(() => {
        fetchLocations();
        // Reset state when modal opens
        if (isOpen) {
            setQuantity('');
            setDestinationLocationId('');
            setReason('');
        }
    }, [isOpen, fetchLocations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                materialId: stockItem.material.id,
                sourceLocationId: stockItem.location.id,
                destinationLocationId,
                quantity: parseFloat(quantity),
                reason,
            };
            await apiRequest('/stock-locations/inventory/move', 'POST', payload);
            showNotification('Voorraad succesvol verplaatst!', 'success');
            onSave(); // Refresht de lijsten
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !stockItem) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg">
                <div className="card-body">
                    <h2 className="card-title-lg">Voorraad Verplaatsen</h2>
                    <p>Materiaal: <strong>{stockItem.material.name}</strong></p>
                    <p>Van locatie: <strong>{stockItem.location.name}</strong></p>
                    
                    <div className="form-control w-full mt-4">
                        <label className="label"><span className="label-text">Hoeveelheid te verplaatsen</span></label>
                        <input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input input-bordered" placeholder="bv. 50" required />
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Naar locatie</span></label>
                        <select value={destinationLocationId} onChange={(e) => setDestinationLocationId(e.target.value)} className="select select-bordered" required>
                            <option value="" disabled>Kies een doellocatie</option>
                            {availableLocations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                     <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Reden (optioneel)</span></label>
                        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="input input-bordered" placeholder="bv. Consolidatie pallets" />
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Verplaatsen...' : 'Voorraad Verplaatsen'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MoveStockModal;