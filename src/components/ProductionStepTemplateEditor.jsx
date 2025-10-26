import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // <-- FIX: Correcte naam zonder typefout
import { apiRequest, getAllStepDefinitions, getMachines, getFinishingEquipment, getLaborRates } from '../api';

// --- Helper componenten ---

const DraggableStepInWorkflow = ({ step, index, moveStep, onEdit, onRemove }) => {
    const ref = React.useRef(null);
    const [, drop] = useDrop({
        accept: 'workflow-step',
        hover(item) {
            if (!ref.current || item.index === index) return;
            moveStep(item.index, index);
            item.index = index;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'workflow-step',
        item: () => ({ id: step.productStepTemplateId, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="flex items-center justify-between p-2 mb-2 bg-base-200 rounded-md shadow-sm">
            <span className="cursor-move">☰ {step.productStepTemplate.name}</span>
            <div>
                <button onClick={() => onEdit(index)} className="btn btn-ghost btn-xs">Configureren</button>
                <button onClick={() => onRemove(index)} className="btn btn-ghost btn-xs text-error">Verwijderen</button>
            </div>
        </div>
    );
};

const DraggableSourceStep = ({ step }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'source-step',
        item: { step },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));
    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="p-2 mb-2 bg-base-200 rounded-md shadow-sm cursor-grab">
            {step.name}
        </div>
    );
};

const EditStepModal = ({ isOpen, step, onSave, onCancel, allEquipment }) => {
    const [params, setParams] = useState({});

    useEffect(() => {
        if (isOpen && step) {
            setParams(step.overrides || {});
        }
    }, [isOpen, step]);
    
    if (!isOpen || !step) return null;
    
    const selectedEquipmentId = params.equipmentId || step.resourceId || step.productStepTemplate?.defaultResourceId;
    const selectedEquipment = allEquipment.find(e => e.id === selectedEquipmentId);
    const parameterDefinition = selectedEquipment?.parameterSchema || [];

    const handleParamChange = (paramName, value) => {
        setParams(current => ({ ...current, [paramName]: value }));
    };

    const handleSave = () => {
        onSave({ ...step, overrides: params });
    };

    const renderParameterInput = (param) => {
        const value = params[param.name];
        switch (param.type) {
            case 'select':
                return (<select value={value || ''} onChange={(e) => handleParamChange(param.name, e.target.value)} className="select select-bordered select-sm w-full max-w-xs"><option value="">-- Maak een keuze --</option>{(param.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>);
            case 'boolean':
                return (<input type="checkbox" checked={!!value} onChange={(e) => handleParamChange(param.name, e.target.checked)} className="checkbox checkbox-primary" />);
            case 'text':
                return (<input type="text" value={value || ''} onChange={(e) => handleParamChange(param.name, e.target.value)} className="input input-bordered input-sm w-full max-w-xs" />);
            default: 
                return <span className="text-xs text-error">Onbekend type: {param.type}</span>;
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">"{step.productStepTemplate.name}" Configureren</h3>
                <div className="py-4 space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Gekoppelde Machine</span></label>
                        <select value={selectedEquipmentId || ''} onChange={(e) => handleParamChange('equipmentId', e.target.value)} className="select select-bordered">
                            <option value="">-- Standaard Machine --</option>
                            {allEquipment.map(equip => (<option key={equip.id} value={equip.id}>{equip.name} ({equip.resourceType})</option>))}
                        </select>
                         <div className="label"><span className="label-text-alt">Kies een specifieke machine om diens parameters in te stellen.</span></div>
                    </div>
                    <div className="divider">Parameters</div>
                    {parameterDefinition.length > 0 ? (
                        parameterDefinition.map(param => (
                            <div className="form-control" key={param.name}>
                                <label className="label cursor-pointer">
                                    <span className="label-text">{param.label}</span> 
                                    {renderParameterInput(param)}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-base-content/60">De geselecteerde machine heeft geen configureerbare parameters.</p>
                    )}
                </div>
                <div className="modal-action">
                    <button onClick={onCancel} className="btn btn-ghost">Annuleren</button>
                    <button onClick={handleSave} className="btn btn-primary">Opslaan</button>
                </div>
            </div>
        </div>
    );
};


const TemplateEditorLayout = ({ viewParam: workflowTemplateId, navigateTo, showNotification }) => {
    const [templateDetails, setTemplateDetails] = useState({ name: '', description: '' });
    const [availableSteps, setAvailableSteps] = useState([]);
    const [stepsInTemplate, setStepsInTemplate] = useState([]);
    const [allEquipment, setAllEquipment] = useState([]);
    const [laborRates, setLaborRates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStepIndex, setEditingStepIndex] = useState(null);
    const isNew = workflowTemplateId === 'new';

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [stepsData, machinesData, finishingData, ratesData] = await Promise.all([
                getAllStepDefinitions(),
                getMachines(),
                getFinishingEquipment(),
                getLaborRates(),
            ]);
            setAvailableSteps(stepsData || []);
            const printers = (machinesData || []).map(m => ({ ...m, resourceType: 'Machine' }));
            const finishers = (finishingData || []).map(f => ({ ...f, resourceType: 'Finishing' }));
            setAllEquipment([...printers, ...finishers]);
            setLaborRates(ratesData || []);
            if (!isNew) {
                const templateData = await apiRequest('GET', `/api/workflow-templates/${workflowTemplateId}`);
                setTemplateDetails({ name: templateData.name, description: templateData.description || '' });
                setStepsInTemplate(templateData.steps.sort((a, b) => a.order - b.order));
            }
        } catch (error) {
            showNotification(`Fout bij laden: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [workflowTemplateId, isNew, showNotification]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
    
    const addStepToWorkflow = useCallback((sourceStep) => {
        const newWorkflowStep = { 
            productStepTemplate: sourceStep, 
            productStepTemplateId: sourceStep.id, 
            overrides: {}, 
            order: stepsInTemplate.length,
            resourceId: sourceStep.defaultResourceId 
        };
        setStepsInTemplate(currentSteps => [...currentSteps, newWorkflowStep]);
    }, [stepsInTemplate.length]);

    const [, drop] = useDrop(() => ({ accept: 'source-step', drop: (item) => addStepToWorkflow(item.step) }));
    const moveStepInWorkflow = useCallback((dragIndex, hoverIndex) => {
        setStepsInTemplate((prevSteps) => {
            const newSteps = [...prevSteps];
            const [draggedItem] = newSteps.splice(dragIndex, 1);
            newSteps.splice(hoverIndex, 0, draggedItem);
            return newSteps.map((step, index) => ({ ...step, order: index }));
        });
    }, []);
    const removeStepFromWorkflow = (indexToRemove) => setStepsInTemplate(current => current.filter((_, index) => index !== indexToRemove));
    const handleOpenModal = (index) => { setEditingStepIndex(index); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingStepIndex(null); };
    
    const handleSaveStepOverrides = (updatedStep) => { 
        setStepsInTemplate(currentSteps => currentSteps.map((step, index) => {
            if (index === editingStepIndex) {
                return updatedStep;
            }
            return step;
        })); 
        handleCloseModal(); 
    };
    
    const handleSaveChanges = async () => {
        try {
            const stepsPayload = stepsInTemplate.map((step, index) => ({
                productStepTemplateId: step.productStepTemplateId,
                order: index,
                overrides: step.overrides || {} 
            }));

            const payload = { 
                name: templateDetails.name, 
                description: templateDetails.description, 
                steps: stepsPayload
            };

            if (isNew) {
                await apiRequest('POST', '/api/workflow-templates', payload);
                showNotification('Sjabloon succesvol aangemaakt.', 'success');
            } else {
                await apiRequest('PUT', `/api/workflow-templates/${workflowTemplateId}`, payload);
                showNotification('Sjabloon succesvol bijgewerkt.', 'success');
            }
            navigateTo('production-step-template-builder');
        } catch (error) {
            showNotification(`Fout bij opslaan: ${error.message}`, 'error');
        }
    };

    if (isLoading) return <div className="p-6">Sjabloon-editor laden...</div>;
    const editingStep = editingStepIndex !== null ? stepsInTemplate[editingStepIndex] : null;

    return (
        <div className="page-container p-6">
            <div className="flex justify-between items-center mb-2"><h1 className="text-2xl font-bold">{isNew ? 'Nieuw Sjabloon Aanmaken' : `Sjabloon Bewerken`}</h1><button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">← Terug naar Instellingen</button></div>
            <p className="mb-6 text-base-content/70">Stel hier de volgorde en de details van de productiestappen in.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-base-100 shadow-xl"><div className="card-body"><h2 className="card-title">Sjabloon Details</h2><div className="form-control mt-4"><label className="label"><span className="label-text">Naam Sjabloon</span></label><input type="text" placeholder="bv. Dozen standaard" className="input input-bordered w-full" value={templateDetails.name} onChange={e => setTemplateDetails({...templateDetails, name: e.target.value})} /></div><div className="form-control mt-2"><label className="label"><span className="label-text">Omschrijving</span></label><textarea placeholder="Korte omschrijving van het sjabloon" className="textarea textarea-bordered w-full" value={templateDetails.description} onChange={e => setTemplateDetails({...templateDetails, description: e.target.value})} /></div><button onClick={handleSaveChanges} className="btn btn-primary mt-4">Opslaan</button></div></div>
                <div className="card bg-base-100 shadow-xl"><div className="card-body"><h2 className="card-title">Beschikbare Stappen</h2><p className="text-xs opacity-60 mb-4">Sleep een stap naar rechts om hem toe te voegen.</p><div className="overflow-y-auto pr-2" style={{height: 'calc(100vh - 24rem)'}}>{availableSteps.map((step) => <DraggableSourceStep key={step.id} step={step} />)}</div></div></div>
                <div ref={drop} className="card bg-base-100 shadow-xl"><div className="card-body"><h2 className="card-title">Stappen in dit Sjabloon</h2><div className="overflow-y-auto pr-2" style={{height: 'calc(100vh - 24rem)'}}>{stepsInTemplate.length === 0 ? (<div className="text-center h-full flex items-center justify-center p-8 border-2 border-dashed rounded-lg"><p>Sleep stappen hierheen</p></div>) : (<div>{stepsInTemplate.map((step, index) => (<DraggableStepInWorkflow key={step.id || step.productStepTemplateId} index={index} step={step} moveStep={moveStepInWorkflow} onEdit={handleOpenModal} onRemove={removeStepFromWorkflow} />))}</div>)}</div></div></div>
            </div>
            <EditStepModal isOpen={isModalOpen} step={editingStep} onSave={handleSaveStepOverrides} onCancel={handleCloseModal} allEquipment={allEquipment} />
        </div>
    );
};

const ProductionStepTemplateEditor = (props) => {
    return (<DndProvider backend={HTML5Backend}><TemplateEditorLayout {...props} /></DndProvider>);
};

export default ProductionStepTemplateEditor;