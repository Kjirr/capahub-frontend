import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

// Modal
const FinishingModal = ({ isOpen, onClose, onSave, showNotification, finishingToEdit }) => {
    const initialState = { name: '', setupCost: '', costPerItem: '' };
    const [formData, setFormData] = useState(initialState);
    useEffect(() => { setFormData(finishingToEdit || initialState); }, [finishingToEdit, isOpen]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (finishingToEdit) {
                await apiRequest(`/calculation-settings/finishings/${finishingToEdit.id}`, 'PUT', formData);
                showNotification('Afwerking bijgewerkt!', 'success');
            } else {
                await apiRequest('/calculation-settings/finishings', 'POST', formData);
                showNotification('Afwerking aangemaakt!', 'success');
            }
            onSave();
            onClose();
        } catch (error) { showNotification(error.message, 'error'); }
    };

    if (!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"><form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl w-full max-w-lg"><div className="card-body"><h2 className="card-title-lg">{finishingToEdit ? 'Afwerking Bewerken' : 'Nieuwe Afwerking'}</h2><div className="form-control w-full mt-4"><label className="label"><span className="label-text">Naam Afwerking</span></label><input type="text" name="name" placeholder="bv. Mat lamineren" value={formData.name} onChange={handleChange} className="input input-bordered w-full" required /></div><div className="grid grid-cols-2 gap-4 mt-2"><div className="form-control w-full"><label className="label"><span className="label-text">Opstartkosten (€)</span></label><input type="number" step="0.01" name="setupCost" value={formData.setupCost} onChange={handleChange} className="input input-bordered w-full" required /></div><div className="form-control w-full"><label className="label"><span className="label-text">Kosten per stuk (€)</span></label><input type="number" step="0.01" name="costPerItem" value={formData.costPerItem} onChange={handleChange} className="input input-bordered w-full" required /></div></div><div className="card-actions justify-end mt-6"><button type="button" onClick={onClose} className="btn btn-ghost">Annuleren</button><button type="submit" className="btn btn-primary">Opslaan</button></div></div></form></div> );
};

// Hoofdcomponent
const FinishingManagement = ({ navigateTo, showNotification }) => {
    const [finishings, setFinishings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [finishingToEdit, setFinishingToEdit] = useState(null);

    const fetchData = useCallback(async () => {
        try { const data = await apiRequest('/calculation-settings/finishings', 'GET'); setFinishings(data); } catch (error) { showNotification(error.message, 'error'); } finally { setIsLoading(false); }
    }, [showNotification]);
    useEffect(() => { fetchData(); }, [fetchData]);

    const openCreateModal = () => { setFinishingToEdit(null); setIsModalOpen(true); };
    const openEditModal = (finishing) => { setFinishingToEdit(finishing); setIsModalOpen(true); };
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Zeker weten dat u '${name}' wilt verwijderen?`)) return;
        try { await apiRequest(`/calculation-settings/finishings/${id}`, 'DELETE'); showNotification('Afwerking verwijderd.', 'success'); fetchData(); } catch (error) { showNotification(error.message, 'error'); }
    };

    if (isLoading) return <div className="loading-text">Afwerkingen laden...</div>;

    return ( <> <div className="page-container"><div className="flex justify-between items-center mb-6"><div><h1 className="page-title">Afwerkingen Beheer</h1><p className="page-subtitle">Beheer hier de kosten voor afwerkingsprocessen.</p></div><div className="flex gap-2"><button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">← Terug</button><button onClick={openCreateModal} className="btn btn-primary">Nieuwe Afwerking</button></div></div><div className="card bg-base-100 shadow-xl"><div className="card-body"><div className="overflow-x-auto"><table className="table w-full"><thead><tr><th>Naam</th><th className="text-right">Opstartkosten (€)</th><th className="text-right">Kosten p/st (€)</th><th className="text-right">Acties</th></tr></thead><tbody>{finishings.length > 0 ? finishings.map(f => ( <tr key={f.id} className="hover"><td className="font-bold">{f.name}</td><td className="text-right">{parseFloat(f.setupCost).toFixed(2)}</td><td className="text-right">{parseFloat(f.costPerItem).toFixed(2)}</td><td className="text-right space-x-2"><button onClick={() => openEditModal(f)} className="btn btn-outline btn-sm">Bewerken</button><button onClick={() => handleDelete(f.id, f.name)} className="btn btn-error btn-sm">Verwijderen</button></td></tr> )) : ( <tr><td colSpan="4" className="text-center">Nog geen afwerkingen aangemaakt.</td></tr> )}</tbody></table></div></div></div></div> <FinishingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchData} showNotification={showNotification} finishingToEdit={finishingToEdit} /> </> );
};

export default FinishingManagement;