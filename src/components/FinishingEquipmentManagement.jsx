import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../api';
import ConfirmationModal from './ConfirmationModal';

// Dit component is een combinatie van de moderne UI van ResourceManagement
// en de logica die specifiek is voor Afwerkapparatuur.

const SchemaBuilder = ({ schema, onChange }) => {
    const handleParamChange = (index, field, value) => {
        const newSchema = [...schema];
        newSchema[index] = { ...newSchema[index], [field]: value };
        if (field === 'type' && !['select', 'multiselect'].includes(value)) {
            delete newSchema[index].options;
        }
        onChange(newSchema);
    };
    const handleOptionsChange = (index, optionsString) => {
        const newSchema = [...schema];
        newSchema[index].options = optionsString.split(/,\s*/).map(opt => opt.trim());
        onChange(newSchema);
    };
    const addParam = () => onChange([...schema, { name: '', label: '', type: 'text' }]);
    const removeParam = (index) => onChange(schema.filter((_, i) => i !== index));

    return (
        <div className="space-y-3">
            {schema.map((param, index) => (
                <div key={index} className="p-3 bg-base-300 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="form-control"><label className="label-text text-xs">Variabele Naam</label><input type="text" value={param.name || ''} onChange={(e) => handleParamChange(index, 'name', e.target.value)} className="input input-bordered input-sm" placeholder="bv. wit_printen" /></div>
                        <div className="form-control"><label className="label-text text-xs">Label op Formulier</label><input type="text" value={param.label || ''} onChange={(e) => handleParamChange(index, 'label', e.target.value)} className="input input-bordered input-sm" placeholder="bv. Wit Printen" /></div>
                        <div className="form-control"><label className="label-text text-xs">Type Veld</label><select value={param.type || 'text'} onChange={(e) => handleParamChange(index, 'type', e.target.value)} className="select select-bordered select-sm"><option value="text">Tekst</option><option value="number">Getal</option><option value="boolean">Checkbox (Ja/Nee)</option><option value="select">Dropdown</option></select></div>
                    </div>
                    {param.type === 'select' && (<div className="form-control mt-2"><label className="label-text text-xs">Opties (komma-gescheiden)</label><input type="text" value={(param.options || []).join(', ')} onChange={(e) => handleOptionsChange(index, e.target.value)} className="input input-bordered input-sm" placeholder="bv. Optie 1, Optie 2" /></div>)}
                    <div className="text-right mt-2"><button onClick={() => removeParam(index)} className="btn btn-xs btn-ghost text-error">Verwijder Parameter</button></div>
                </div>
            ))}
            <button onClick={addParam} className="btn btn-sm btn-block btn-ghost mt-2">+ Parameter Toevoegen</button>
        </div>
    );
};

const EquipmentModal = ({ isOpen, equipment, onSave, onClose, showNotification, laborRates }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const isEditing = equipment && equipment.id;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                const capabilities = Array.isArray(equipment.capabilities) ? equipment.capabilities.join(', ') : '';
                const profile = equipment.costingProfile || {};
                const speedsArray = profile.speeds ? Object.entries(profile.speeds).map(([key, speedData]) => ({ quality: key, value: speedData.value || 0, unit: speedData.unit || 'items_per_hour' })) : [];
                const initialData = { ...equipment, capabilities, ...profile, speeds: speedsArray };
                setFormData(initialData);
            } else {
                setFormData({ name: '', capabilities: '', speeds: [], parameterSchema: [] });
            }
        }
    }, [isOpen, equipment, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSpeedChange = (index, field, value) => {
        const newSpeeds = JSON.parse(JSON.stringify(formData.speeds || []));
        newSpeeds[index][field] = value;
        setFormData(prev => ({ ...prev, speeds: newSpeeds }));
    };
    const addSpeed = () => setFormData(prev => ({ ...prev, speeds: [...(prev.speeds || []), { quality: '', value: '', unit: 'items_per_hour' }] }));
    const removeSpeed = (index) => setFormData(prev => ({ ...prev, speeds: (prev.speeds || []).filter((_, i) => i !== index) }));

    const handleSave = async () => {
        setIsSaving(true);
        const capabilitiesArray = (formData.capabilities || '').split(',').map(c => c.trim()).filter(Boolean);
        
        const speedsObject = (formData.speeds || []).reduce((acc, curr) => {
            if (curr.quality && curr.value) { acc[curr.quality] = { value: Number(curr.value), unit: curr.unit }; }
            return acc;
        }, {});

        const endpoint = isEditing ? `/api/finishing-equipment/${equipment.id}` : '/api/finishing-equipment';
        const method = isEditing ? 'PUT' : 'POST';
        const payload = { 
            name: formData.name, 
            capabilities: capabilitiesArray, 
            parameterSchema: formData.parameterSchema, 
            costingProfile: { 
                setupMinutes: Number(formData.setupMinutes) || 0, 
                costPerHour: Number(formData.costPerHour) || 0, 
                roleKey: formData.roleKey || null, 
                speeds: speedsObject 
            } 
        };

        try {
            await apiRequest(method, endpoint, payload);
            showNotification(`Apparaat succesvol ${isEditing ? 'bijgewerkt' : 'aangemaakt'}!`, 'success');
            onSave();
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open"><div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg">{isEditing ? `Apparaat Bewerken: ${equipment.name}` : 'Nieuw Apparaat Toevoegen'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                <div className="flex flex-col gap-2">
                    <div className="form-control"><label className="label"><span className="label-text">Naam Apparaat</span></label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input input-bordered" /></div>
                    <div className="form-control"><label className="label"><span className="label-text">Capabilities (komma-gescheiden)</span></label><textarea name="capabilities" value={formData.capabilities || ''} onChange={handleChange} className="textarea textarea-bordered h-24" placeholder="bv. snijden, rillen, stansen"></textarea></div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="form-control"><label className="label"><span className="label-text">Parameter Schema</span></label><div className="p-4 border rounded-lg bg-base-100 max-h-48 overflow-y-auto"><SchemaBuilder schema={Array.isArray(formData.parameterSchema) ? formData.parameterSchema : []} onChange={(s) => setFormData(prev => ({...prev, parameterSchema: s}))} /></div></div>
                    <div className="form-control"><label className="label"><span className="label-text">Kosten- & Snelheidsprofiel</span></label><div className="p-4 border rounded-lg bg-base-100 space-y-3">
                        <div className="grid grid-cols-2 gap-2"><div className="form-control"><label className="label-text text-xs">Opstarttijd (min)</label><div className="input-group"><input type="number" name="setupMinutes" value={formData.setupMinutes || ''} onChange={handleChange} className="input input-bordered input-sm w-full" /><span>min</span></div></div><div className="form-control"><label className="label-text text-xs">Kosten per Uur</label><div className="input-group"><input type="number" name="costPerHour" value={formData.costPerHour || ''} onChange={handleChange} className="input input-bordered input-sm w-full" /><span>€/uur</span></div></div></div>
                        <div className="form-control"><label className="label-text text-xs">Benodigde Arbeidsrol</label><select name="roleKey" value={formData.roleKey || ''} onChange={handleChange} className="select select-bordered select-sm"><option value="">-- Geen --</option>{laborRates.map(rate => (<option key={rate.id} value={rate.roleKey}>{rate.roleName}</option>))}</select></div>
                        <div><label className="label-text text-xs">Snelheden (per parameter)</label>
                            {(formData.speeds || []).map((s, i) => (<div key={i} className="flex items-center gap-2 mt-1"><input type="text" placeholder="Naam (bv. Standaard)" value={s.quality} onChange={(e) => handleSpeedChange(i, 'quality', e.target.value)} className="input input-bordered input-sm" style={{width: '120px'}} /><input type="number" placeholder="Snelheid" value={s.value} onChange={(e) => handleSpeedChange(i, 'value', e.target.value)} className="input input-bordered input-sm flex-grow" /><select value={s.unit} onChange={(e) => handleSpeedChange(i, 'unit', e.target.value)} className="select select-bordered select-sm"><option value="items_per_hour">st/u</option><option value="m2_per_hour">m²/u</option><option value="m_per_hour">m/u</option></select><button onClick={() => removeSpeed(i)} className="btn btn-xs btn-ghost text-error">✕</button></div>))}
                            <button onClick={addSpeed} className="btn btn-xs btn-ghost btn-block mt-2">+ Snelheid Toevoegen</button>
                        </div>
                    </div></div>
                </div>
            </div>
            <div className="modal-action mt-6"><button className="btn btn-ghost" onClick={onClose}>Annuleren</button><button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Opslaan'}</button></div>
        </div></div>
    );
};

const FinishingEquipmentManagement = ({ navigateTo, showNotification }) => {
    const [equipmentList, setEquipmentList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [laborRates, setLaborRates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [equipmentToDelete, setEquipmentToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [equipment, labor] = await Promise.all([apiRequest('GET', '/api/finishing-equipment'), apiRequest('GET', '/api/labor-rates')]);
            setEquipmentList(equipment || []);
            setLaborRates(labor || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (equipment = null) => {
        setEditingEquipment(equipment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingEquipment(null);
        setIsModalOpen(false);
    };
    
    const handleOpenDeleteModal = (equipment) => {
        setEquipmentToDelete(equipment);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!equipmentToDelete) return;
        try {
            await apiRequest('DELETE', `/api/finishing-equipment/${equipmentToDelete.id}`);
            showNotification('Apparaat succesvol verwijderd.', 'success');
            fetchData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setEquipmentToDelete(null);
        }
    };

    const filteredList = useMemo(() => {
        if (!searchTerm) return equipmentList;
        return equipmentList.filter(eq => 
            eq.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [equipmentList, searchTerm]);

    if (isLoading) return <div className="p-6">Afwerkapparatuur laden...</div>;

    return (
        <>
            <div className="page-container p-6">
                <div className="flex justify-between items-center mb-6">
                    <div><h1 className="page-title">Beheer Afwerkapparatuur</h1><p className="page-subtitle">Beheer hier alle afwerkingsmachines en hun kostenprofielen.</p></div>
                    <div className="space-x-2"><button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">← Terug naar Instellingen</button><button className="btn btn-primary" onClick={() => handleOpenModal(null)}>Nieuw Apparaat Toevoegen</button></div>
                </div>

                <div className="form-control mb-4">
                    <input type="text" placeholder="Zoek op naam..." className="input input-bordered w-full md:w-1/3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead><tr><th>Naam</th><th>Capabilities</th><th>Kostenprofiel</th><th></th></tr></thead>
                        <tbody>
                            {filteredList.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td><div className="flex flex-wrap gap-1">{(item.capabilities || []).map(cap => <span key={cap} className="badge badge-outline">{cap}</span>)}</div></td>
                                    <td className="text-xs">
                                        €{Number(item.costingProfile?.costPerHour || 0).toFixed(2)}/uur, {Number(item.costingProfile?.setupMinutes || 0)} min setup
                                    </td>
                                    <td className="text-right space-x-1">
                                        <button className="btn btn-sm btn-ghost" onClick={() => handleOpenModal(item)}>Bewerk</button>
                                        <button className="btn btn-sm btn-ghost text-error" onClick={() => handleOpenDeleteModal(item)}>Verwijder</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <EquipmentModal isOpen={isModalOpen} equipment={editingEquipment} onClose={handleCloseModal} onSave={fetchData} showNotification={showNotification} laborRates={laborRates} />
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Apparaat Verwijderen"
            >
                <p>Weet je zeker dat je <strong>{equipmentToDelete?.name}</strong> permanent wilt verwijderen?</p>
            </ConfirmationModal>
        </>
    );
};
export default FinishingEquipmentManagement;