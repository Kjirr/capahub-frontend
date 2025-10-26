// src/components/FinishingEquipmentModal.jsx

import React, { useState, useEffect } from 'react';
// --- ▼▼▼ GECORRIGEERD: Importeer de specifieke, veilige API functies ▼▼▼ ---
import { 
    createFinishingEquipment,
    updateFinishingEquipment 
} from '../api';

const TrashIcon = () => <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const initialEquipmentState = {
    name: '',
    costPerHour: '',
    setupMinutes: '',
    operations: [],
};

const FinishingEquipmentModal = ({ isOpen, onClose, onSave, showNotification, equipment }) => {
    const [equipmentData, setEquipmentData] = useState(initialEquipmentState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (equipment) {
                setEquipmentData({
                    ...equipment,
                    operations: Array.isArray(equipment.operations) ? equipment.operations : [],
                });
            } else {
                setEquipmentData(initialEquipmentState);
            }
        }
    }, [isOpen, equipment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEquipmentData(prev => ({ ...prev, [name]: value }));
    };

    const handleOperationChange = (index, field, value) => {
        const newOperations = [...equipmentData.operations];
        newOperations[index][field] = value;
        setEquipmentData(prev => ({ ...prev, operations: newOperations }));
    };

    const addOperation = () => {
        const newOperation = {
            id: `op-${Date.now()}`,
            name: '',
            speed: '',
            unit: 'meter_per_minuut',
        };
        setEquipmentData(prev => ({ ...prev, operations: [...prev.operations, newOperation] }));
    };

    const removeOperation = (index) => {
        setEquipmentData(prev => ({
            ...prev,
            operations: equipmentData.operations.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (equipment) {
                // --- ▼▼▼ GECORRIGEERD: Gebruik de juiste update functie ▼▼▼ ---
                await updateFinishingEquipment(equipment.id, equipmentData);
                showNotification('Apparaat succesvol bijgewerkt!', 'success');
            } else {
                // --- ▼▼▼ GECORRIGEERD: Gebruik de juiste create functie ▼▼▼ ---
                await createFinishingEquipment(equipmentData);
                showNotification('Apparaat succesvol aangemaakt!', 'success');
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

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg">{equipment ? 'Apparaat Bewerken' : 'Nieuw Apparaat'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Naam van het apparaat *</span></label>
                        <input name="name" value={equipmentData.name} onChange={handleChange} className="input input-bordered" required placeholder="bv. Zünd G3 Snijplotter"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Kosten per uur (€)</span></label>
                            <input name="costPerHour" value={equipmentData.costPerHour} onChange={handleChange} type="number" step="0.01" className="input input-bordered" placeholder="bv. 75"/>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Insteltijd (minuten)</span></label>
                            <input name="setupMinutes" value={equipmentData.setupMinutes} onChange={handleChange} type="number" className="input input-bordered" placeholder="bv. 10"/>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Operaties & Snelheden</h4>
                        {equipmentData.operations.map((op, index) => (
                            <div key={op.id} className="grid grid-cols-4 gap-2 items-end p-2 rounded bg-base-200">
                                <div className="form-control col-span-2"><label className="label-text text-xs">Naam Operatie</label><input type="text" value={op.name} onChange={(e) => handleOperationChange(index, 'name', e.target.value)} className="input input-bordered input-sm" placeholder="bv. Thru-cut" /></div>
                                <div className="form-control col-span-1"><label className="label-text text-xs">Snelheid</label><input type="number" step="0.1" value={op.speed} onChange={(e) => handleOperationChange(index, 'speed', e.target.value)} className="input input-bordered input-sm" placeholder="bv. 60" /></div>
                                <button type="button" onClick={() => removeOperation(index)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                                <div className="form-control col-span-3 -mt-2"><select value={op.unit} onChange={(e) => handleOperationChange(index, 'unit', e.target.value)} className="select select-bordered select-xs"><option value="meter_per_minuut">meter per minuut</option><option value="stuks_per_uur">stuks per uur</option></select></div>
                            </div>
                        ))}
                        <button type="button" onClick={addOperation} className="btn btn-sm btn-ghost mt-2">+ Operatie Toevoegen</button>
                    </div>

                    <div className="modal-action pt-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                        <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                            {equipment ? 'Opslaan' : 'Aanmaken'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinishingEquipmentModal;