import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getProductTemplates, getMachines, getFinishingEquipment, getLaborRates, getMaterials,
  runTemplatedCalculation,
  saveDirectQuote,
} from '../api';
import CustomerInfoForm from '../features/quotes/CustomerInfoForm';
import CalculationResultPanel from '../features/quotes/CalculationResultPanel';

const AccordionSection = ({ title, nodeId, children, isOpen, onToggle }) => (
    <div className="collapse collapse-plus border border-base-300 bg-white rounded-lg">
        <input type="checkbox" checked={isOpen} onChange={onToggle} />
        <div className="collapse-title text-xl font-semibold">{title}</div>
        <div className="collapse-content bg-base-50"><div className="space-y-4 py-4">{children}</div></div>
    </div>
);

const TYPE_DEFAULT_INPUTS = {
  FLAT_PRINT: [
    { name: 'quantity', label: 'Aantal', type: 'number', defaultValue: 100 },
    { name: 'width_mm', label: 'Breedte (mm)', type: 'number', defaultValue: 297 },
    { name: 'height_mm', label: 'Hoogte (mm)', type: 'number', defaultValue: 420 },
    { name: 'material', label: 'Materiaal', type: 'db_material' },
  ],
  BOX: [
    { name: 'quantity', label: 'Aantal', type: 'number', defaultValue: 100 },
    { name: 'length_mm', label: 'Lengte (mm)', type: 'number', defaultValue: 150 },
    { name: 'width_mm', label: 'Breedte (mm)', type: 'number', defaultValue: 100 },
    { name: 'height_mm', label: 'Hoogte (mm)', type: 'number', defaultValue: 50 },
    { name: 'material', label: 'Materiaal', type: 'db_material' },
  ],
};

// LET OP: 'export' is hier weggehaald
const CreateTemplatedQuote = ({ showNotification, navigateTo }) => {
    const [productTemplates, setProductTemplates] = useState([]);
    const [resources, setResources] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [formValues, setFormValues] = useState({});
    const [openSections, setOpenSections] = useState(new Set());
    const [calculationResult, setCalculationResult] = useState(null);
    const [customerInfo, setCustomerInfo] = useState({});
    const [deliveryTime, setDeliveryTime] = useState('');
    const [marginPercentage, setMarginPercentage] = useState('30');
    const [savedQuoteId, setSavedQuoteId] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [tpls, machines, finishing, labor, mats] = await Promise.all([
                    getProductTemplates(), getMachines(), getFinishingEquipment(), getLaborRates(), getMaterials(),
                ]);
                setProductTemplates(tpls || []);
                setMaterials(mats || []);
                const combinedResources = [
                    ...(machines || []).map(r => ({ ...r, resourceType: 'Machine' })),
                    ...(finishing || []).map(r => ({ ...r, resourceType: 'Finishing' })),
                    ...(labor || []).map(r => ({ ...r, name: r.roleName, resourceType: 'Labor' }))
                ];
                setResources(combinedResources);
                if (tpls && tpls.length > 0) {
                    setSelectedTemplateId(tpls[0].id);
                }
            } catch (error) {
                showNotification(`Kon data niet laden: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [showNotification]);

    const selectedTemplate = useMemo(() => 
        productTemplates.find(t => t.id === selectedTemplateId) || null,
        [productTemplates, selectedTemplateId]
    );

    const enrichedNodes = useMemo(() => {
        if (!selectedTemplate || resources.length === 0) return [];
        const workflowNodes = selectedTemplate.workflowDefinition?.nodes || [];
        return workflowNodes.map(node => {
            let fullResource = {};
            if (node.data.type === 'Start') {
                fullResource = { parameterSchema: TYPE_DEFAULT_INPUTS[selectedTemplate.productType] || [] };
            } else if (node.data.type !== 'Einde') {
                fullResource = resources.find(r => r.id === node.data.resourceId) || { resourceNotFound: true };
            }
            return { ...node, fullResource };
        }).sort((a, b) => a.position.y - b.position.y);
    }, [selectedTemplate, resources]);

    useEffect(() => {
        if (enrichedNodes.length === 0) return;
        const initialValues = {};
        enrichedNodes.forEach(node => {
            initialValues[node.id] = {};
            (node.fullResource?.parameterSchema || []).forEach(param => {
                initialValues[node.id][param.name] = param.defaultValue || '';
            });
            if (node.data.params) Object.assign(initialValues[node.id], node.data.params);
        });
        setFormValues(initialValues);
        setOpenSections(new Set(enrichedNodes.map(n => n.id)));
        setCalculationResult(null);
        setSavedQuoteId(null);
    }, [enrichedNodes]);

    const handleFormChange = (nodeId, paramName, value) => setFormValues(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], [paramName]: value } }));
    const toggleSection = (nodeId) => setOpenSections(prev => { const newSet = new Set(prev); newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId); return newSet; });

    const handleRunCalculation = async () => {
        setIsCalculating(true);
        setCalculationResult(null);
        try {
            const result = await runTemplatedCalculation({
                templateId: selectedTemplateId,
                userInput: formValues,
                marginPercentage: Number(marginPercentage),
            });
            setCalculationResult(result);
        } catch (error) {
            showNotification(error.message || 'Berekening mislukt.', 'error');
        } finally {
            setIsCalculating(false);
        }
    };
    
    const handleSaveQuote = async () => {
        if (!calculationResult || (calculationResult.grandTotals?.total ?? 0) <= 0) {
            showNotification('Bereken eerst een geldige prijs voordat je opslaat.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
             const savedQuote = await saveDirectQuote({
                customerInfo,
                deliveryTime,
                calculationResult,
                productTemplateId: selectedTemplateId,
                userInput: formValues,
            });
            setSavedQuoteId(savedQuote.id);
            showNotification(`Offerte ${savedQuote.quoteNumber} succesvol opgeslagen!`, 'success');
        } catch (error) {
             showNotification(error.message || 'Opslaan van offerte mislukt.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const renderParameter = (node, paramSchema) => {
        const value = formValues[node.id]?.[paramSchema.name] ?? '';
        if (paramSchema.type === 'db_material') {
             return (
                <div className="form-control" key={paramSchema.name}>
                    <label className="label"><span className="label-text">{paramSchema.label}</span></label>
                    <select className="select select-bordered" value={value} onChange={(e) => handleFormChange(node.id, paramSchema.name, e.target.value)}>
                        <option value="" disabled>Kies materiaal...</option>
                        {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
            );
        }
        return (
            <div className="form-control" key={paramSchema.name}>
                <label className="label"><span className="label-text">{paramSchema.label}</span></label>
                <input type={paramSchema.type || 'text'} className="input input-bordered" value={value} onChange={(e) => handleFormChange(node.id, paramSchema.name, e.target.value)} placeholder={paramSchema.label} />
            </div>
        );
    };

    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Nieuwe Offerte via Sjabloon</h1>
        <div className="mt-6 bg-white p-6 rounded-lg shadow-xl border">
            <CustomerInfoForm {...{customerInfo, setCustomerInfo, deliveryTime, setDeliveryTime, marginPercentage, setMarginPercentage}} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="bg-white p-8 rounded-lg shadow-xl space-y-6 md:col-span-2">
                <div className="form-control">
                    <label className="label-text font-semibold">Kies een Product Workflow</label>
                    <select className="select select-bordered w-full" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={isLoading}>
                        {isLoading && <option>Laden...</option>}
                        {productTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div className="space-y-3 mt-6">
                    {enrichedNodes.map(node => {
                        if (node.data.type === 'Einde') return null;
                        return (
                            <AccordionSection key={node.id} title={`Stap: ${node.data.label}`} isOpen={openSections.has(node.id)} onToggle={() => toggleSection(node.id)}>
                               {node.fullResource?.resourceNotFound && <p className="text-red-500 font-semibold">Let op: De benodigde resource ('{node.data.label}') kon niet worden gevonden.</p>}
                               {(node.fullResource?.parameterSchema || []).map(param => renderParameter(node, param))}
                               {node.data.type === 'Labor' && !node.data.params?.linkedNodeId && (
                                   <div className="form-control">
                                       <label className="label"><span className="label-text font-semibold">Benodigde Tijd (uren)</span></label>
                                       <input type="number" step="0.1" className="input input-bordered" value={formValues[node.id]?.manualHours || ''} onChange={(e) => handleFormChange(node.id, 'manualHours', e.target.value)} placeholder="bv. 1.5" />
                                       <p className="text-xs text-gray-500 mt-1">Deze stap is niet gekoppeld, vul de tijd handmatig in.</p>
                                   </div>
                               )}
                            </AccordionSection>
                        );
                    })}
                </div>
            </div>
            <div className="space-y-6">
                <CalculationResultPanel {...{calculationResult, isCalculating, isSaving, handleRunCalculation, handleSaveQuote, savedQuoteId, navigateTo}} isDisabled={isLoading || isCalculating || isSaving} />
            </div>
        </div>
      </div>
    );
};

// --- DE FIX: Zorg voor een correcte default export ---
export default CreateTemplatedQuote;