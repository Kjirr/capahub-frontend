import React, { useState, useEffect, useMemo } from 'react';
import { getProductTemplates, getMachines, getFinishingEquipment, getLaborRates } from '../api';

const ResourceTest = () => {
    const [productTemplates, setProductTemplates] = useState([]);
    const [resources, setResources] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            console.log("--- TEST: Data ophalen gestart ---");
            setIsLoading(true);
            setError('');
            try {
                const [tpls, machines, finishing, labor] = await Promise.all([
                    getProductTemplates(), getMachines(), getFinishingEquipment(), getLaborRates(),
                ]);
                
                const combinedResources = [
                    ...(machines || []).map(r => ({ ...r, resourceType: 'Machine' })),
                    ...(finishing || []).map(r => ({ ...r, resourceType: 'Finishing' })),
                    ...(labor || []).map(r => ({ ...r, name: r.roleName, resourceType: 'Labor' }))
                ];
                
                setProductTemplates(tpls || []);
                setResources(combinedResources);
                console.log("--- TEST: Data succesvol opgehaald ---", { templates: tpls, resources: combinedResources });

            } catch (err) {
                setError(err.message);
                console.error("--- TEST: Fout bij ophalen data ---", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const selectedTemplate = useMemo(() => {
        return productTemplates.find(t => t.id === selectedTemplateId) || null;
    }, [productTemplates, selectedTemplateId]);

    const enrichedNodes = useMemo(() => {
        if (!selectedTemplate || resources.length === 0) return null;

        console.log(`--- TEST: Start verrijking voor template: ${selectedTemplate.name} ---`);
        const workflowNodes = selectedTemplate.workflowDefinition?.nodes || [];
        
        return workflowNodes.map(node => {
            if (node.data.type === 'Start' || node.data.type === 'Einde') {
                return { nodeId: node.id, label: node.data.label, foundResource: 'N.v.t.' };
            }
            const resourceId = node.data.resourceId;
            const foundResource = resources.find(r => r.id === resourceId);
            
            console.log(`- Node '${node.data.label}': Zoeken naar resourceId '${resourceId}'... Gevonden: ${!!foundResource}`);

            return {
                nodeId: node.id,
                label: node.data.label,
                resourceIdToFind: resourceId,
                foundResource: foundResource || '!!! NIET GEVONDEN !!!'
            };
        });
    }, [selectedTemplate, resources]);

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4 border-b pb-2">Resource Verrijking Test</h1>
            
            {isLoading && <p>Data laden...</p>}
            {error && <p className="text-red-500">Fout: {error}</p>}

            {!isLoading && !error && (
                <div className="form-control">
                    <label className="label"><span className="label-text">Kies een Product Template</span></label>
                    <select 
                        value={selectedTemplateId} 
                        onChange={e => setSelectedTemplateId(e.target.value)}
                        className="select select-bordered"
                    >
                        <option value="">-- Selecteer --</option>
                        {productTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            )}

            {enrichedNodes && (
                <div className="mt-6 bg-gray-800 text-white p-4 rounded-lg font-mono">
                    <h2 className="text-lg font-semibold mb-2 text-yellow-300">Resultaat van de Verrijking:</h2>
                    <pre className="text-xs whitespace-pre-wrap break-all">
                        {JSON.stringify(enrichedNodes, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default ResourceTest;