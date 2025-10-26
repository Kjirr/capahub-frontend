import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ResourceCostProfileEditor = ({ costingProfile = {}, setCostingProfile, parameterSchema = [] }) => {
    const [activeTab, setActiveTab] = useState('modi');

    const handleProfileChange = (field, value) => {
        setCostingProfile({ ...costingProfile, [field]: value });
    };

    const handleModeChange = (index, field, value) => {
        const newModes = [...(costingProfile.productionModes || [])];
        newModes[index] = { ...newModes[index], [field]: value };
        setCostingProfile({ ...costingProfile, productionModes: newModes });
    };

    const handleModeParamChange = (index, paramName, value) => {
        const newModes = [...(costingProfile.productionModes || [])];
        const newParams = { ...(newModes[index].params || {}), [paramName]: value };
        newModes[index] = { ...newModes[index], params: newParams };
        setCostingProfile({ ...costingProfile, productionModes: newModes });
    };

    const addMode = () => {
        const newMode = {
            id: uuidv4(),
            name: 'Nieuwe Modus',
            params: {},
            speed: 10,
            unit: 'seconds_per_piece',
        };
        const newModes = [...(costingProfile.productionModes || []), newMode];
        setCostingProfile({ ...costingProfile, productionModes: newModes });
    };

    const removeMode = (id) => {
        const newModes = (costingProfile.productionModes || []).filter(p => p.id !== id);
        setCostingProfile({ ...costingProfile, productionModes: newModes });
    };

    return (
        <div className="p-4 border rounded-xl bg-base-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Co-Pilot</h3>
            
            <div role="tablist" className="tabs tabs-lifted">
                <a role="tab" className={`tab ${activeTab === 'modi' ? 'tab-active' : ''}`} onClick={() => setActiveTab('modi')}>Productie Modi</a>
                <a role="tab" className={`tab ${activeTab === 'config' ? 'tab-active' : ''}`} onClick={() => setActiveTab('config')}>Configuratie</a>
            </div>

            {activeTab === 'modi' && (
                <div className="bg-white p-4 rounded-b-lg border-x border-b border-base-300">
                    <p className="text-sm text-gray-500 mb-4">Definieer hier de alles-in-één configuraties voor deze resource.</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {(costingProfile.productionModes || []).map((mode, index) => (
                            <div key={mode.id} className="p-4 bg-base-100 border rounded-lg flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <input type="text" value={mode.name} onChange={(e) => handleModeChange(index, 'name', e.target.value)} className="input input-bordered input-sm font-semibold w-2/3" placeholder="Naam van de modus"/>
                                    <button onClick={() => removeMode(mode.id)} className="btn btn-sm btn-ghost text-error"><TrashIcon /></button>
                                </div>
                                
                                {parameterSchema && parameterSchema.length > 0 ? (
                                    <div className="flex flex-col md:flex-row gap-6 flex-grow">
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider">Parameters</h4>
                                            {parameterSchema.map(param => (
                                                <div key={param.name} className="form-control">
                                                    <label className="label-text text-sm mb-1">{param.label}</label>
                                                    <select className="select select-bordered select-sm w-full" value={mode.params?.[param.name] || ''} onChange={(e) => handleModeParamChange(index, param.name, e.target.value)}>
                                                        <option value="">-- Kies --</option>
                                                        {(param.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider">Snelheid</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="form-control"><label className="label-text text-sm mb-1">Snelheid</label><input type="number" value={mode.speed || ''} onChange={(e) => handleModeChange(index, 'speed', parseFloat(e.target.value) || 0)} className="input input-bordered input-sm w-full" /></div>
                                                <div className="form-control"><label className="label-text text-sm mb-1">Eenheid</label><select className="select select-bordered select-sm w-full" value={mode.unit || 'items_per_hour'} onChange={(e) => handleModeChange(index, 'unit', e.target.value)}><option value="items_per_hour">stuks per uur</option><option value="m2_per_hour">m² per uur</option><option value="seconds_per_piece">seconden per stuk</option><option value="minutes_per_m2">minuten per m²</option></select></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider">Snelheid</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="form-control"><label className="label-text text-sm mb-1">Snelheid</label><input type="number" value={mode.speed || ''} onChange={(e) => handleModeChange(index, 'speed', parseFloat(e.target.value) || 0)} className="input input-bordered input-sm w-full" /></div>
                                            <div className="form-control"><label className="label-text text-sm mb-1">Eenheid</label><select className="select select-bordered select-sm w-full" value={mode.unit || 'seconds_per_piece'} onChange={(e) => handleModeChange(index, 'unit', e.target.value)}><option value="items_per_hour">stuks per uur</option><option value="m2_per_hour">m² per uur</option><option value="seconds_per_piece">seconden per stuk</option><option value="minutes_per_m2">minuten per m²</option></select></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={addMode} className="btn btn-sm btn-primary mt-4">+ Productie Modus Toevoegen</button>
                </div>
            )}

            {activeTab === 'config' && (
                 <div className="bg-white p-4 rounded-b-lg border-x border-b border-base-300 space-y-4">
                    <div>
                        <h3 className="text-md font-semibold text-gray-700">Globale Kosten</h3>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Uurtarief (€)</span></label>
                                <input type="number" className="input input-bordered" value={costingProfile.costPerHour || ''} onChange={(e) => handleProfileChange('costPerHour', parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Standaard Insteltijd (minuten)</span></label>
                                <input type="number" className="input input-bordered" value={costingProfile.setupMinutes || ''} onChange={(e) => handleProfileChange('setupMinutes', parseFloat(e.target.value) || 0)} />
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ResourceCostProfileEditor;