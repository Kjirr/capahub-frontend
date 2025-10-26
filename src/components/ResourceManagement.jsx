import React, { useState, useEffect, useCallback, useMemo } from 'react';
// --- START WIJZIGING: useNavigate hook importeren ---
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import ConfirmationModal from './ConfirmationModal';
import ResourceCostProfileEditor from './ResourceCostProfileEditor';
// --- EINDE WIJZIGING ---

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
        <div className="space-y-3 p-4 border rounded-lg bg-base-100 max-h-64 overflow-y-auto">
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

const ResourceModal = ({ isOpen, resource, onSave, onClose, showNotification }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = resource && resource.id;

    useEffect(() => {
        if (isOpen) {
            let initialData;
            if (isEditing) {
                const capabilities = Array.isArray(resource.capabilities) ? resource.capabilities.join(', ') : '';
                initialData = { ...resource, capabilities, name: resource.resourceType === 'Labor' ? resource.roleName : resource.name, costingProfile: resource.costingProfile || {}, includeInPlanning: resource.includeInPlanning || false };
            } else {
                initialData = { resourceType: 'Machine', name: '', capabilities: '', parameterSchema: [], costingProfile: { productionModes: [] }, includeInPlanning: false };
            }
            setFormData(initialData);
        }
    }, [isOpen, isEditing, resource]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleCostProfileChange = (newProfile) => {
        setFormData(prev => ({ ...prev, costingProfile: newProfile }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const capabilitiesArray = (formData.capabilities || '').split(',').map(c => c.trim()).filter(Boolean);
        let payload = {};
        let endpoint = '';
        let method = isEditing ? 'PUT' : 'POST';
        const costingProfile = formData.costingProfile || {};
        const parameterSchema = formData.parameterSchema || [];

        switch (formData.resourceType) {
            case 'Machine':
                endpoint = isEditing ? `/api/machines/${resource.id}` : '/api/machines';
                payload = { name: formData.name, capabilities: capabilitiesArray, parameterSchema, costingProfile };
                break;
            case 'Finishing':
                endpoint = isEditing ? `/api/finishing-equipment/${resource.id}` : '/api/finishing-equipment';
                payload = { name: formData.name, capabilities: capabilitiesArray, parameterSchema, costingProfile, includeInPlanning: !!formData.includeInPlanning };
                break;
            case 'Labor':
                endpoint = isEditing ? `/api/labor-rates/${resource.id}` : '/api/labor-rates';
                payload = { 
                    roleName: formData.name, 
                    roleKey: formData.roleKey, 
                    capabilities: capabilitiesArray, 
                    costPerHour: Number(costingProfile.costPerHour) || 0,
                    costingProfile: costingProfile,
                    includeInPlanning: !!formData.includeInPlanning
                };
                break;
            default:
                showNotification('Onbekend resource type', 'error');
                setIsSaving(false);
                return;
        }

        try {
            await apiRequest(method, endpoint, payload);
            showNotification(`Resource succesvol ${isEditing ? 'bijgewerkt' : 'aangemaakt'}!`, 'success');
            onSave();
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const isMachineOrFinishing = formData.resourceType === 'Machine' || formData.resourceType === 'Finishing';
    const showCoPilot = formData.resourceType === 'Machine' || formData.resourceType === 'Finishing' || formData.resourceType === 'Labor';

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-6xl">
                <h3 className="font-bold text-lg">{isEditing ? `Resource Bewerken: ${resource.name}` : 'Nieuwe Resource Toevoegen'}</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 mt-4 items-start">
                    
                    <div className="flex flex-col gap-4">
                        <div className="form-control"><label className="label"><span className="label-text">Type Resource</span></label><select name="resourceType" value={formData.resourceType || 'Machine'} onChange={handleChange} className="select select-bordered" disabled={isEditing}><option value="Machine">Machine (Printer)</option><option value="Finishing">Afwerkingsapparaat</option><option value="Labor">Arbeidsrol</option></select></div>
                        <div className="form-control"><label className="label"><span className="label-text">{formData.resourceType === 'Labor' ? 'Naam Taak' : 'Naam Machine/Apparaat'}</span></label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input input-bordered" /></div>
                        {formData.resourceType === 'Labor' && (<div className="form-control"><label className="label"><span className="label-text">Role Key (interne code)</span></label><input type="text" name="roleKey" value={formData.roleKey || ''} onChange={handleChange} className="input input-bordered" placeholder="bv. prepress_operator"/></div>)}
                        <div className="form-control"><label className="label"><span className="label-text">Capabilities (komma-gescheiden)</span></label><textarea name="capabilities" value={formData.capabilities || ''} onChange={handleChange} className="textarea textarea-bordered h-24" placeholder="bv. uitbreken, verpakken"></textarea></div>

                        {(formData.resourceType === 'Finishing' || formData.resourceType === 'Labor') && (
                            <div className="form-control p-4 border rounded-lg bg-base-100">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input 
                                        type="checkbox" 
                                        name="includeInPlanning"
                                        checked={!!formData.includeInPlanning} 
                                        onChange={handleChange}
                                        className="checkbox checkbox-primary" 
                                    />
                                    <span className="label-text font-semibold">Opnemen in de productieplanning als planplaats</span> 
                                </label>
                                <p className="text-xs text-gray-500 mt-1 pl-10">Vink dit aan om deze resource eigen kolommen te geven op het planbord.</p>
                            </div>
                        )}

                        {isMachineOrFinishing && (
                            <div className="form-control mt-4">
                                <label className="label"><span className="label-text">Parameter Schema (voor offerte-formulier)</span></label>
                                <SchemaBuilder schema={Array.isArray(formData.parameterSchema) ? formData.parameterSchema : []} onChange={(s) => setFormData(prev => ({...prev, parameterSchema: s}))} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        {showCoPilot ? (
                            <ResourceCostProfileEditor 
                                costingProfile={formData.costingProfile}
                                setCostingProfile={handleCostProfileChange}
                                parameterSchema={formData.parameterSchema}
                            />
                        ) : null}
                    </div>
                </div>

                <div className="modal-action mt-6"><button className="btn btn-ghost" onClick={onClose}>Annuleren</button><button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Opslaan'}</button></div>
            </div>
        </div>
    );
};

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const ResourceManagement = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---

    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingResource, setEditingResource] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [machines, finishing, labor] = await Promise.all([apiRequest('GET', '/api/machines'), apiRequest('GET', '/api/finishing-equipment'), apiRequest('GET', '/api/labor-rates')]);
            const combined = [ ...machines.map(m => ({ ...m, resourceType: 'Machine' })), ...finishing.map(f => ({ ...f, resourceType: 'Finishing' })), ...labor.map(l => ({ ...l, name: l.roleName, resourceType: 'Labor' })) ];
            setResources(combined);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (resource = null) => {
        setEditingResource(resource);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingResource(null);
        setIsModalOpen(false);
    };
    
    const handleOpenDeleteModal = (resource) => {
        setResourceToDelete(resource);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!resourceToDelete) return;
        let endpoint = '';
        switch(resourceToDelete.resourceType) {
            case 'Machine': endpoint = `/api/machines/${resourceToDelete.id}`; break;
            case 'Finishing': endpoint = `/api/finishing-equipment/${resourceToDelete.id}`; break;
            case 'Labor': endpoint = `/api/labor-rates/${resourceToDelete.id}`; break;
            default: showNotification('Onbekend resource type voor verwijderen', 'error'); return;
        }
        try {
            await apiRequest('DELETE', endpoint);
            showNotification('Resource succesvol verwijderd.', 'success');
            fetchData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setResourceToDelete(null);
        }
    };

    const filteredResources = useMemo(() => {
        if (!searchTerm) return resources;
        return resources.filter(resource => resource.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [resources, searchTerm]);

    if (isLoading) return <div className="p-6">Resources laden...</div>;

    return (
        <>
            <div className="page-container p-6">
                <div className="flex justify-between items-center mb-6">
                    <div><h1 className="page-title">Resource Management (Versie 2)</h1><p className="page-subtitle">Beheer hier alle 'bouwblokken' van je fabriek: machines, afwerking en arbeid.</p></div>
                    <div className="space-x-2">
                        {/* --- START WIJZIGING: 'navigate' gebruiken met correcte URL --- */}
                        <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">← Terug naar Instellingen</button>
                        {/* --- EINDE WIJZIGING --- */}
                        <button className="btn btn-primary" onClick={() => handleOpenModal(null)}>Nieuwe Resource Toevoegen</button>
                    </div>
                </div>
                <div className="form-control mb-4"><input type="text" placeholder="Zoek op naam..." className="input input-bordered w-full md:w-1/3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead><tr><th>Naam</th><th>Type</th><th>Capabilities</th><th>Details</th><th></th></tr></thead>
                        <tbody>
                            {filteredResources.map(resource => (
                                <tr key={`${resource.resourceType}-${resource.id}`}>
                                    <td>{resource.name}</td>
                                    <td><span className="badge badge-neutral">{resource.resourceType}</span></td>
                                    <td><div className="flex flex-wrap gap-1">{(Array.isArray(resource.capabilities) ? resource.capabilities : []).map(cap => <span key={cap} className="badge badge-outline">{cap}</span>)}</div></td>
                                    <td className="text-xs">{`€${Number(resource.costingProfile?.costPerHour || resource.costPerHour || 0).toFixed(2)}/uur`}</td>
                                    <td className="text-right space-x-1"><button className="btn btn-sm btn-ghost" onClick={() => handleOpenModal(resource)}>Bewerk</button><button className="btn btn-sm btn-ghost text-error" onClick={() => handleOpenDeleteModal(resource)}>Verwijder</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ResourceModal isOpen={isModalOpen} resource={editingResource} onClose={handleCloseModal} onSave={fetchData} showNotification={showNotification} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Resource Verwijderen">
                <p>Weet je zeker dat je <strong>{resourceToDelete?.name}</strong> permanent wilt verwijderen?</p>
            </ConfirmationModal>
        </>
    );
};

export default ResourceManagement;