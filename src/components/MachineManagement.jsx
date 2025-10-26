import React, { useState, useEffect, useCallback } from 'react';
import { getMachines, createMachine, updateMachine, deleteMachine, getLaborRates } from '../api';

// Dit is dezelfde ParameterEditor als in de andere component
const ParameterEditor = ({ params, setParams }) => {
    const handleParamChange = (index, field, value) => {
        const newParams = [...params];
        newParams[index][field] = value;
        setParams(newParams);
    };
    const handleOptionChange = (paramIndex, optIndex, value) => {
        const newParams = [...params];
        if (!newParams[paramIndex].options) newParams[paramIndex].options = [];
        newParams[paramIndex].options[optIndex] = value;
        setParams(newParams);
    };
    const addParam = () => setParams([...params, { name: '', label: '', type: 'select', options: [''] }]);
    const removeParam = (index) => setParams(params.filter((_, i) => i !== index));
    const addOption = (paramIndex) => {
        const newParams = [...params];
        if (!newParams[paramIndex].options) newParams[paramIndex].options = [];
        newParams[paramIndex].options.push('');
        setParams(newParams);
    };
    const removeOption = (paramIndex, optIndex) => {
        const newParams = [...params];
        newParams[paramIndex].options = newParams[paramIndex].options.filter((_, i) => i !== optIndex);
        setParams(newParams);
    };

    return (
        <div className="space-y-4">
            {params.map((param, pIndex) => (
                <div key={pIndex} className="p-4 border rounded-md bg-base-200 relative">
                    <button onClick={() => removeParam(pIndex)} className="btn btn-xs btn-circle btn-ghost absolute top-2 right-2">✕</button>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Variabelenaam (bv. print_quality)" value={param.name} onChange={e => handleParamChange(pIndex, 'name', e.target.value)} className="input input-sm input-bordered" />
                        <input type="text" placeholder="Label (bv. Printkwaliteit)" value={param.label} onChange={e => handleParamChange(pIndex, 'label', e.target.value)} className="input input-sm input-bordered" />
                        <select value={param.type} onChange={e => handleParamChange(pIndex, 'type', e.target.value)} className="select select-sm select-bordered">
                            <option value="select">Keuzelijst (enkele keuze)</option>
                            <option value="multiselect">Meerkeuze (checkboxes)</option>
                            <option value="boolean">Ja/Nee (checkbox)</option>
                            <option value="text">Tekstveld</option>
                        </select>
                    </div>
                    {(param.type === 'select' || param.type === 'multiselect') && (
                        <div className="mt-2 pl-4">
                            <label className="label-text text-xs">Opties:</label>
                            {(param.options || []).map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2 mt-1">
                                    <input type="text" value={opt} onChange={e => handleOptionChange(pIndex, oIndex, e.target.value)} className="input input-sm input-bordered flex-grow" />
                                    <button onClick={() => removeOption(pIndex, oIndex)} className="btn btn-xs btn-ghost text-error">-</button>
                                </div>
                            ))}
                            <button onClick={() => addOption(pIndex)} className="btn btn-xs btn-ghost mt-2">+ Optie toevoegen</button>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={addParam} className="btn btn-sm btn-ghost mt-4">+ Variabele toevoegen</button>
        </div>
    );
};

const MachineModal = ({ isOpen, machine, onSave, onCancel, laborRates }) => {
    const [formData, setFormData] = useState({});
    const [params, setParams] = useState([]);

    useEffect(() => {
        if (machine) {
            setFormData({
                name: machine.name || '',
                costPerHour: machine.costingProfile?.costPerHour || 0,
                setupMinutes: machine.costingProfile?.setupMinutes || 0,
                runSpeedPerHour: machine.costingProfile?.runSpeedPerHour || 0,
                roleKey: machine.costingProfile?.roleKey || '',
            });
            setParams(machine.parameterSchema || []);
        } else {
            setFormData({ name: '', costPerHour: 0, setupMinutes: 0, runSpeedPerHour: 0, roleKey: '' });
            setParams([]);
        }
    }, [machine]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const finalData = {
            ...machine,
            name: formData.name,
            parameterSchema: params,
            costingProfile: {
                costPerHour: parseFloat(formData.costPerHour),
                setupMinutes: parseInt(formData.setupMinutes, 10),
                runSpeedPerHour: parseFloat(formData.runSpeedPerHour),
                roleKey: formData.roleKey,
            }
        };
        onSave(finalData);
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-lg">{machine ? 'Machine Bewerken' : 'Nieuwe Machine Toevoegen'}</h3>
                <div className="form-control mt-4">
                    <label className="label"><span className="label-text">Naam</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" />
                </div>
                <div className="divider">Kosten & Snelheid</div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-control"><label className="label"><span className="label-text">Kosten per Uur (€)</span></label><input type="number" name="costPerHour" value={formData.costPerHour} onChange={handleChange} className="input input-bordered" /></div>
                    <div className="form-control"><label className="label"><span className="label-text">Insteltijd (minuten)</span></label><input type="number" name="setupMinutes" value={formData.setupMinutes} onChange={handleChange} className="input input-bordered" /></div>
                    <div className="form-control"><label className="label"><span className="label-text">Draaisnelheid (per uur)</span></label><input type="number" name="runSpeedPerHour" value={formData.runSpeedPerHour} onChange={handleChange} className="input input-bordered" /></div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Operator Rol (Role Key)</span></label>
                        <select name="roleKey" value={formData.roleKey} onChange={handleChange} className="select select-bordered">
                            <option value="">-- Kies een rol --</option>
                            {(laborRates || []).map(rate => (<option key={rate.id} value={rate.roleName}>{rate.roleName}</option>))}
                        </select>
                    </div>
                </div>
                <div className="divider">Machine Variabelen</div>
                <ParameterEditor params={params} setParams={setParams} />
                <div className="modal-action">
                    <button onClick={onCancel} className="btn btn-ghost">Annuleren</button>
                    <button onClick={handleSubmit} className="btn btn-primary">Opslaan</button>
                </div>
            </div>
        </div>
    );
};


const MachineManagement = ({ showNotification, navigateTo }) => {
    const [machines, setMachines] = useState([]);
    const [laborRates, setLaborRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [machineData, ratesData] = await Promise.all([
                getMachines(),
                getLaborRates()
            ]);
            setMachines(machineData || []);
            setLaborRates(ratesData || []);
        } catch (error) {
            showNotification('Kon de benodigde data niet laden.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (machine = null) => {
        setEditingMachine(machine);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingMachine(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                await updateMachine(data.id, data);
                showNotification('Machine succesvol bijgewerkt.');
            } else {
                await createMachine(data);
                showNotification('Nieuwe machine succesvol aangemaakt.');
            }
            fetchData();
        } catch (error) {
            showNotification(`Fout bij opslaan: ${error.message}`, 'error');
        } finally {
            handleCloseModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Weet je zeker dat je deze machine wilt verwijderen?')) {
            try {
                await deleteMachine(id);
                showNotification('Machine succesvol verwijderd.');
                fetchData();
            } catch (error) {
                showNotification(`Fout bij verwijderen: ${error.message}`, 'error');
            }
        }
    };

    if (isLoading) return <div className="text-center p-10">Machines laden...</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Machinebeheer</h1>
                <div>
                    <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost mr-2">← Terug naar Instellingen</button>
                    <button onClick={() => handleOpenModal(null)} className="btn btn-primary">Nieuwe Machine</button>
                </div>
            </div>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr><th>Naam</th><th>Kosten/uur</th><th>Insteltijd</th><th>Snelheid/uur</th><th className="text-right">Acties</th></tr>
                            </thead>
                            <tbody>
                                {machines.map(item => (
                                    <tr key={item.id} className="hover">
                                        <td className="font-bold">{item.name}</td>
                                        <td>€ {(item.costingProfile?.costPerHour || 0).toFixed(2)}</td>
                                        <td>{item.costingProfile?.setupMinutes || 0} min</td>
                                        <td>{item.costingProfile?.runSpeedPerHour || 0}</td>
                                        <td className="text-right space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="btn btn-ghost btn-sm">Bewerken</button>
                                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm text-error">Verwijderen</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {machines.length === 0 && <p className="text-center p-4">Geen machines gevonden.</p>}
                    </div>
                </div>
            </div>
            <MachineModal 
                isOpen={isModalOpen} 
                machine={editingMachine} 
                onSave={handleSave} 
                onCancel={handleCloseModal}
                laborRates={laborRates}
            />
        </div>
    );
};

export default MachineManagement;