import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const CompleteTaskModal = ({ isOpen, onClose, onSave, showNotification, task, currentUser }) => {
    const [actualHours, setActualHours] = useState('');
    const [notes, setNotes] = useState('');
    // State voor materiaalverbruik
    const [materialsUsed, setMaterialsUsed] = useState([{ materialId: '', locationId: '', quantity: '' }]);
    // State om de beschikbare materialen en locaties op te slaan
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (isOpen) {
                try {
                    // Haal alle materialen en locaties op voor de dropdowns
                    const [materialsData, locationsData] = await Promise.all([
                        apiRequest('/materials', 'GET'),
                        apiRequest('/stock-locations', 'GET')
                    ]);
                    setAvailableMaterials(materialsData);
                    setAvailableLocations(locationsData);
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        };
        fetchData();
        // Reset state als de modal opent
        setActualHours('');
        setNotes('');
        setMaterialsUsed([{ materialId: '', locationId: '', quantity: '' }]);
    }, [isOpen, showNotification]);

    const handleMaterialChange = (index, field, value) => {
        const newMaterials = [...materialsUsed];
        newMaterials[index][field] = value;
        setMaterialsUsed(newMaterials);
    };

    const addMaterialRow = () => {
        setMaterialsUsed([...materialsUsed, { materialId: '', locationId: '', quantity: '' }]);
    };

    const removeMaterialRow = (index) => {
        const newMaterials = materialsUsed.filter((_, i) => i !== index);
        setMaterialsUsed(newMaterials);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                actualHours: parseFloat(actualHours) || 0,
                notes,
                materialsUsed: materialsUsed.filter(m => m.materialId && m.locationId && m.quantity).map(m => ({
                    ...m,
                    quantity: parseFloat(m.quantity)
                })),
            };
            await apiRequest(`/productions/steps/${task.id}/complete`, 'POST', payload);
            showNotification('Taak succesvol voltooid!', 'success');
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
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-3xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Taak Voltooien: {task?.title}</h2>
                    
                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Geklokte tijd (uren)</span></label>
                        <input type="number" step="0.1" value={actualHours} onChange={(e) => setActualHours(e.target.value)} className="input input-bordered" placeholder="bv. 1.5" />
                    </div>
                    
                    <div className="mt-4">
                        <h3 className="font-bold mb-2">Werkelijk Materiaalverbruik</h3>
                        {materialsUsed.map((mat, index) => (
                            <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                                <select value={mat.materialId} onChange={(e) => handleMaterialChange(index, 'materialId', e.target.value)} className="select select-bordered col-span-2">
                                    <option value="" disabled>Kies materiaal</option>
                                    {availableMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <select value={mat.locationId} onChange={(e) => handleMaterialChange(index, 'locationId', e.target.value)} className="select select-bordered">
                                    <option value="" disabled>Kies locatie</option>
                                    {availableLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                                <div className="flex items-center gap-2">
                                    <input type="number" step="any" value={mat.quantity} onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)} className="input input-bordered w-full" placeholder="Aantal" />
                                    {materialsUsed.length > 1 && <button type="button" onClick={() => removeMaterialRow(index)} className="btn btn-sm btn-circle btn-outline btn-error">✕</button>}
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addMaterialRow} className="btn btn-sm btn-outline mt-2">+ Materiaalregel toevoegen</button>
                    </div>

                    <div className="form-control mt-4">
                        <label className="label"><span className="label-text">Notities (optioneel)</span></label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="textarea textarea-bordered h-24" placeholder="Eventuele opmerkingen over de taak..."></textarea>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Verwerken...' : 'Taak Afronden'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CompleteTaskModal;