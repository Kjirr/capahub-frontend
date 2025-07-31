import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

// Modal zit in hetzelfde bestand om het simpel te houden
const LaborRateModal = ({ isOpen, onClose, onSave, showNotification, rateToEdit }) => {
    const initialState = { roleName: '', costPerHour: '' };
    const [formData, setFormData] = useState(initialState);
    useEffect(() => { setFormData(rateToEdit || initialState); }, [rateToEdit, isOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (rateToEdit) {
                await apiRequest(`/calculation-settings/labor-rates/${rateToEdit.id}`, 'PUT', formData);
                showNotification('Tarief bijgewerkt!', 'success');
            } else {
                await apiRequest('/calculation-settings/labor-rates', 'POST', formData);
                showNotification('Tarief aangemaakt!', 'success');
            }
            onSave();
            onClose();
        } catch (error) { showNotification(error.message, 'error'); }
    };

    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"><form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg"><div className="card-body"><h2 className="card-title-lg">{rateToEdit ? 'Tarief Bewerken' : 'Nieuw Tarief'}</h2><div className="form-control w-full mt-4"><label className="label"><span className="label-text">Rolnaam</span></label><input type="text" name="roleName" placeholder="bv. Operator Drukpers" value={formData.roleName} onChange={handleChange} className="input input-bordered w-full" required /></div><div className="form-control w-full mt-2"><label className="label"><span className="label-text">Kosten per uur (€)</span></label><input type="number" step="0.01" name="costPerHour" value={formData.costPerHour} onChange={handleChange} className="input input-bordered w-full" required /></div><div className="card-actions justify-end mt-6"><button type="button" onClick={onClose} className="btn btn-ghost">Annuleren</button><button type="submit" className="btn btn-primary">Opslaan</button></div></div></form></div> );
};

// Hoofdcomponent
const LaborRateManagement = ({ navigateTo, showNotification }) => {
    const [rates, setRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rateToEdit, setRateToEdit] = useState(null);

    const fetchData = useCallback(async () => {
        try { const data = await apiRequest('/calculation-settings/labor-rates', 'GET'); setRates(data); } catch (error) { showNotification(error.message, 'error'); } finally { setIsLoading(false); }
    }, [showNotification]);
    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreateModal = () => { setRateToEdit(null); setIsModalOpen(true); };
    const openEditModal = (rate) => { setRateToEdit(rate); setIsModalOpen(true); };
    const handleDelete = async (rateId, rateName) => {
        if (!window.confirm(`Zeker weten dat u '${rateName}' wilt verwijderen?`)) return;
        try { await apiRequest(`/calculation-settings/labor-rates/${rateId}`, 'DELETE'); showNotification('Tarief verwijderd.', 'success'); fetchData(); } catch (error) { showNotification(error.message, 'error'); }
    };

    if (isLoading) return <div className="loading-text">Tarieven laden...</div>;

    return ( <> <div className="page-container"><div className="flex justify-between items-center mb-6"><div><h1 className="page-title">Arbeidskosten Beheer</h1><p className="page-subtitle">Beheer hier de uurtarieven voor verschillende rollen.</p></div><div className="flex gap-2"><button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">← Terug</button><button onClick={openCreateModal} className="btn btn-primary">Nieuw Tarief</button></div></div><div className="card bg-base-100 shadow-xl"><div className="card-body"><div className="overflow-x-auto"><table className="table w-full"><thead><tr><th>Rolnaam</th><th className="text-right">Kosten (€/u)</th><th className="text-right">Acties</th></tr></thead><tbody>{rates.length > 0 ? rates.map(rate => ( <tr key={rate.id} className="hover"><td className="font-bold">{rate.roleName}</td><td className="text-right">{parseFloat(rate.costPerHour).toFixed(2)}</td><td className="text-right space-x-2"><button onClick={() => openEditModal(rate)} className="btn btn-outline btn-sm">Bewerken</button><button onClick={() => handleDelete(rate.id, rate.roleName)} className="btn btn-error btn-sm">Verwijderen</button></td></tr> )) : ( <tr><td colSpan="3" className="text-center">Nog geen tarieven aangemaakt.</td></tr> )}</tbody></table></div></div></div></div> <LaborRateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} showNotification={showNotification} rateToEdit={rateToEdit} /> </> );
};

export default LaborRateManagement;