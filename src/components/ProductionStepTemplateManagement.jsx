// De volledige, correcte versie van deze component, inclusief de fix
import React, { useState, useEffect, useCallback } from 'react';
import { getAllStepDefinitions, createStepDefinition, updateStepDefinition, deleteStepDefinition } from '../api';

const SYSTEM_PARAMS = [
    {
        key: 'calculationMode',
        name: 'calculationMode',
        label: 'Calculatie Methode',
        type: 'select',
        options: ['PERIMETER', 'ALONG_WIDTH', 'ALONG_HEIGHT', 'AREA', 'SHEETS', 'QUANTITY'],
        description: 'Bepaalt hoe de basiscalculatie van een afwerking wordt uitgevoerd.'
    },
];

const ProductionStepTemplateModal = ({ isOpen, step, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [volgorde, setVolgorde] = useState(0);
    const [params, setParams] = useState([]);

    useEffect(() => {
        if (step) {
            setName(step.name || '');
            setDescription(step.description || '');
            setVolgorde(step.defaultOrder || 0);
            setParams(step.parameterDefinition || []);
        } else {
            setName(''); setDescription(''); setVolgorde(0); setParams([]);
        }
    }, [step]);

    if (!isOpen) return null;

    const handleParamChange = (index, field, value) => {
        const newParams = [...params];
        newParams[index][field] = value;
        setParams(newParams);
    };
    
    const handleOptionChange = (paramIndex, optIndex, value) => {
        const newParams = [...params];
        newParams[paramIndex].options[optIndex] = value;
        setParams(newParams);
    };

    const addParam = (type = 'custom') => {
        if (type === 'custom') {
            setParams([...params, { name: '', label: '', type: 'text', options: [''] }]);
        } else {
            const systemParam = SYSTEM_PARAMS.find(p => p.key === type);
            if (systemParam && !params.some(p => p.name === systemParam.name)) {
                setParams([...params, { ...systemParam }]);
            }
        }
        // Forceer het sluiten van de dropdown na een keuze
        if (document.activeElement) {
            document.activeElement.blur();
        }
    };

    const removeParam = (index) => setParams(params.filter((_, i) => i !== index));
    const addOption = (paramIndex) => {
        const newParams = [...params];
        newParams[paramIndex].options.push('');
        setParams(newParams);
    };
    const removeOption = (paramIndex, optIndex) => {
        const newParams = [...params];
        newParams[paramIndex].options = newParams[paramIndex].options.filter((_, i) => i !== optIndex);
        setParams(newParams);
    };

    const handleSubmit = () => {
        onSave({ ...step, name, description, volgorde: parseInt(volgorde, 10) || 0, parameterDefinition: params });
    };

    return (
        <div className="modal modal-open"><div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">{step ? 'Stap Bewerken' : 'Nieuwe Stap Aanmaken'}</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="form-control"><label className="label"><span className="label-text">Naam van de stap</span></label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input input-bordered" /></div>
                <div className="form-control"><label className="label"><span className="label-text">Standaard Volgorde</span></label><input type="number" value={volgorde} onChange={e => setVolgorde(e.target.value)} className="input input-bordered" /></div>
            </div>
            <div className="form-control mt-2"><label className="label"><span className="label-text">Omschrijving</span></label><textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea textarea-bordered"></textarea></div>
            <div className="divider">Stap Variabelen</div>
            <div className="space-y-4">
                {params.map((param, pIndex) => (
                    <div key={pIndex} className="p-4 border rounded-md bg-base-200 relative">
                        <button onClick={() => removeParam(pIndex)} className="btn btn-xs btn-circle btn-ghost absolute top-2 right-2">✕</button>
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="Variabelenaam" value={param.name} onChange={e => handleParamChange(pIndex, 'name', e.target.value)} className="input input-sm input-bordered" disabled={!!param.key} />
                            <input type="text" placeholder="Label" value={param.label} onChange={e => handleParamChange(pIndex, 'label', e.target.value)} className="input input-sm input-bordered" />
                            <select value={param.type} onChange={e => handleParamChange(pIndex, 'type', e.target.value)} className="select select-sm select-bordered" disabled={!!param.key}>
                                <option value="select">Keuzelijst (enkele keuze)</option><option value="multiselect">Meerkeuze (checkboxes)</option><option value="boolean">Ja/Nee (checkbox)</option><option value="text">Tekstveld</option>
                            </select>
                        </div>
                        {(param.type === 'select' || param.type === 'multiselect') && (<div className="mt-2 pl-4"><label className="label-text text-xs">Opties:</label>{(param.options || []).map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2 mt-1"><input type="text" value={opt} onChange={e => handleOptionChange(pIndex, oIndex, e.target.value)} className="input input-sm input-bordered flex-grow" /><button onClick={() => removeOption(pIndex, oIndex)} className="btn btn-xs btn-ghost text-error">-</button></div>))}<button onClick={() => addOption(pIndex)} className="btn btn-xs btn-ghost mt-2">+ Optie toevoegen</button></div>)}
                    </div>
                ))}
            </div>
            <div className="dropdown mt-4">
                <label tabIndex={0} className="btn btn-sm btn-ghost">+ Variabele toevoegen</label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {SYSTEM_PARAMS.map(p => <li key={p.key}><a onClick={() => addParam(p.key)}>{p.label}</a></li>)}
                    <li><a onClick={() => addParam('custom')}>Aangepaste variabele</a></li>
                </ul>
            </div>
            <div className="modal-action"><button onClick={onCancel} className="btn btn-ghost">Annuleren</button><button onClick={handleSubmit} className="btn btn-primary">Opslaan</button></div>
        </div></div>
    );
};

const ProductionStepTemplateManagement = ({ showNotification, navigateTo }) => {
    const [steps, setSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const fetchSteps = useCallback(async () => { setIsLoading(true); try { const data = await getAllStepDefinitions(); setSteps(data); } catch (error) { showNotification('Kon de productiestappen niet laden.', 'error'); } finally { setIsLoading(false); } }, [showNotification]);
    useEffect(() => { fetchSteps(); }, [fetchSteps]);
    const handleOpenModal = (step = null) => { setEditingStep(step); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingStep(null); setIsModalOpen(false); };
    const handleSaveStep = async (stepData) => { const payload = { name: stepData.name, description: stepData.description, volgorde: stepData.volgorde, parameterDefinition: stepData.parameterDefinition }; try { if (stepData.id) { await updateStepDefinition(stepData.id, payload); showNotification('Stap succesvol bijgewerkt.'); } else { await createStepDefinition(payload); showNotification('Nieuwe stap succesvol aangemaakt.'); } fetchSteps(); } catch (error) { showNotification(`Fout bij opslaan: ${error.message}`, 'error'); } finally { handleCloseModal(); } };
    const handleDeleteStep = async (stepId) => { if (window.confirm('Weet je zeker dat je deze stap wilt verwijderen?')) { try { await deleteStepDefinition(stepId); showNotification('Stap succesvol verwijderd.'); fetchSteps(); } catch (error) { showNotification(`Fout bij verwijderen: ${error.message}`, 'error'); } } };
    if (isLoading) return <div className="text-center p-10">Productiestappen laden...</div>;
    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Beheer Productiestappen</h1>
                <div><button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost mr-2">← Terug naar Instellingen</button><button onClick={() => handleOpenModal(null)} className="btn btn-primary">Nieuwe Stap Toevoegen</button></div>
            </div>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead><tr><th style={{width: '10%'}}>Volgorde</th><th>Naam</th><th>Omschrijving</th><th className="text-right">Acties</th></tr></thead>
                            <tbody>{steps.map(step => (<tr key={step.id} className="hover"><td>{step.defaultOrder}</td><td>{step.name}</td><td>{step.description}</td><td className="text-right space-x-2"><button onClick={() => handleOpenModal(step)} className="btn btn-ghost btn-sm">Bewerken</button><button onClick={() => handleDeleteStep(step.id)} className="btn btn-ghost btn-sm text-error">Verwijderen</button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
            <ProductionStepTemplateModal isOpen={isModalOpen} step={editingStep} onSave={handleSaveStep} onCancel={handleCloseModal} />
        </div>
    );
};

export default ProductionStepTemplateManagement;