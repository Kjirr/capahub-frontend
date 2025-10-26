import React, { useState, useEffect, useCallback } from 'react';
// GEWIJZIGD: Importeer de nieuwe, specifieke functies
import { getStockLocations, postStockCorrection } from '@/api';

const StockCorrectionModal = ({ isOpen, onClose, onSave, showNotification, stockItem }) => {
    const [mode, setMode] = useState('ADD');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableLocations, setAvailableLocations] = useState([]);

    const isLocationFixed = stockItem?.location;

    const fetchLocations = useCallback(async () => {
        if (!isOpen) return;
        try {
            // GEWIJZIGD: Gebruik de nieuwe, veilige functie
            const data = await getStockLocations();
            setAvailableLocations(data);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [isOpen, showNotification]);

    useEffect(() => {
        fetchLocations();
        if (isOpen) {
            setMode('ADD');
            setAmount('');
            setReason('');
            setSelectedLocationId(stockItem?.location?.id || '');
        }
    }, [isOpen, stockItem, fetchLocations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const changeQuantity = parseFloat(amount) * (mode === 'ADD' ? 1 : -1);
            const payload = {
                materialId: stockItem.material.id,
                locationId: selectedLocationId,
                changeQuantity,
                reason,
            };
            // GEWIJZIGD: Gebruik de nieuwe, veilige functie
            await postStockCorrection(payload);
            showNotification('Voorraad succesvol gecorrigeerd!', 'success');
            onSave();
            onClose();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Correctie mislukt.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !stockItem) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg">
                <div className="card-body">
                    <h2 className="card-title-lg">Voorraad Correctie</h2>
                    <p>Voor: <strong>{stockItem.material.name}</strong> {isLocationFixed && <>op <strong>{stockItem.location.name}</strong></>}</p>
                    
                    {!isLocationFixed && (
                        <div className="form-control w-full mt-4">
                            <label className="label"><span className="label-text">Kies Magazijnlocatie</span></label>
                            <select value={selectedLocationId} onChange={(e) => setSelectedLocationId(e.target.value)} className="select select-bordered" required>
                                <option value="" disabled>Selecteer een locatie</option>
                                {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="join grid grid-cols-2 mt-4">
                        <button type="button" className={`join-item btn ${mode === 'ADD' ? 'btn-success' : ''}`} onClick={() => setMode('ADD')}>Bijboeken (+)</button>
                        <button type="button" className={`join-item btn ${mode === 'SUBTRACT' ? 'btn-error' : ''}`} onClick={() => setMode('SUBTRACT')}>Afboeken (-)</button>
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Hoeveelheid</span></label>
                        <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="input input-bordered" placeholder="bv. 10" required />
                    </div>

                    <div className="form-control w-full mt-2">
                        <label className="label"><span className="label-text">Reden van Correctie</span></label>
                        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="input input-bordered" placeholder="bv. Beginvoorraad, telfout, etc." required />
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Verwerken...' : 'Correctie Doorvoeren'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StockCorrectionModal;