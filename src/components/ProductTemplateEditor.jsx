import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// --- START WIJZIGING: useNavigate importeren ---
import { useParams, useNavigate } from 'react-router-dom';
// --- EINDE WIJZIGING ---
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Handle, Position } from 'reactflow';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';
import jsYaml from 'js-yaml';
import { 
    getProductTemplates, 
    createProductTemplate, 
    updateProductTemplate, 
    getMachines, 
    getFinishingEquipment, 
    getLaborRates,
    getMaterials 
} from '../api';
import { FlagIcon, CheckCircleIcon, CpuChipIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline';

const nodeTypeStyles = {
    Machine:   { icon: CpuChipIcon, color: 'bg-blue-600', border: 'border-blue-700' },
    Finishing: { icon: SparklesIcon, color: 'bg-purple-600', border: 'border-purple-700' },
    Labor:     { icon: UserIcon, color: 'bg-yellow-500', border: 'border-yellow-600' },
    Start:     { icon: FlagIcon, color: 'bg-green-600', border: 'border-green-700' },
    Einde:     { icon: CheckCircleIcon, color: 'bg-gray-700', border: 'border-gray-800' },
};

const CustomNode = ({ data, selected }) => {
    const { label, type, params } = data;
    const style = nodeTypeStyles[type] || { icon: 'div', color: 'bg-gray-500', border: 'border-gray-600' };
    const IconComponent = style.icon;
    
    return (
        <div className={`
            ${style.color} 
            ${selected ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}
            text-white rounded-md shadow-md w-56 border-b-2 ${style.border} transition-all duration-150
        `}>
            <Handle type="target" position={Position.Top} className="!bg-gray-400" style={{ opacity: type === 'Start' ? 0 : 1 }} />
            <div className="p-3">
                <div className="font-bold text-md flex items-center">
                    <IconComponent className="w-6 h-6 mr-3" />
                    {label}
                </div>
                {params?.modeName && (
                    <div className="text-xs font-mono bg-black/20 rounded px-1.5 py-0.5 mt-2 ml-9">
                        {params.modeName}
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-gray-400" style={{ opacity: type === 'Einde' ? 0 : 1 }} />
        </div>
    );
};

const NodeConfigModal = ({ isOpen, node, allNodes, resource, onClose, onSave }) => {
    const [params, setParams] = useState({});

    useEffect(() => {
        if (node) {
            setParams(node.data.params || {});
        }
    }, [node]);

    if (!isOpen) return null;
    
    const handleSave = () => {
        onSave(node.id, params);
        onClose();
    };
    
    const handleParamChange = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };
    
    const linkableNodes = allNodes.filter(n => n.data.type === 'Machine' || n.data.type === 'Finishing');
    const modes = resource?.costingProfile?.productionModes || [];

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Configureer "{node.data.label}"</h3>
                <div className="py-4 space-y-4">
                    { (resource.resourceType === 'Machine' || resource.resourceType === 'Finishing') && (
                        modes.length > 0 ? (
                            <div className="form-control">
                                <label className="label"><span className="label-text">Kies een Productie Modus</span></label>
                                <select value={params.modeId || ''} onChange={(e) => handleParamChange('modeId', e.target.value)} className="select select-bordered w-full">
                                    <option value="">-- Geen / Standaard --</option>
                                    {modes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        ) : ( <p>Deze resource heeft nog geen Productie Modi.</p> )
                    )}
                    
                    {resource.resourceType === 'Labor' && (
                        <div className="form-control">
                            <label className="label"><span className="label-text">Koppel aan Machinestap (Optioneel)</span></label>
                            <select value={params.linkedNodeId || ''} onChange={(e) => handleParamChange('linkedNodeId', e.target.value)} className="select select-bordered w-full">
                                <option value="">Niet gekoppeld (gebruik handmatige invoer)</option>
                                {linkableNodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Indien gekoppeld, wordt de tijd van de machine automatisch overgenomen.</p>
                        </div>
                    )}
                </div>
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Annuleren</button>
                    <button className="btn btn-primary" onClick={handleSave}>Opslaan</button>
                </div>
            </div>
        </div>
    );
};

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const HybrideEditor = ({ showNotification }) => {
    const { id: viewParam } = useParams();
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---

    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [resources, setResources] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [yamlText, setYamlText] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [productType, setProductType] = useState('FLAT_PRINT');
    const [description, setDescription] = useState('');
    const [defaultMaterialId, setDefaultMaterialId] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [editingNode, setEditingNode] = useState(null);
    const isNew = viewParam === 'new';
    const reactFlowWrapper = useRef(null);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const loadTemplate = useCallback((template) => {
        if (!template) {
            setTemplateName('Nieuw Sjabloon'); setProductType('FLAT_PRINT'); setDescription(''); setDefaultMaterialId('');
            setNodes([{ id: 'start', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Start', type: 'Start' } }, { id: 'end', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Einde', type: 'Einde' } }]);
            setEdges([]); return;
        }
        setSelectedTemplate(template); setTemplateName(template.name); setProductType(template.productType || 'FLAT_PRINT'); setDescription(template.description || ''); setDefaultMaterialId(template.defaultMaterialId || '');
        const wf = template.workflowDefinition || {};
        const reactFlowNodes = (wf.nodes || []).map(n => ({ id: n.id, type: 'custom', position: n.position, data: n.data }));
        if (reactFlowNodes.length === 0) {
             reactFlowNodes.push({ id: 'start', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Start', type: 'Start' } }, { id: 'end', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Einde', type: 'Einde' } });
        }
        setNodes(reactFlowNodes); setEdges(wf.edges || []);
    }, [setNodes, setEdges]);
    
    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tpls, machines, finishing, labor, mats] = await Promise.all([ getProductTemplates(), getMachines(), getFinishingEquipment(), getLaborRates(), getMaterials() ]);
            const allTemplates = tpls || []; const allMaterials = mats || [];
            const combinedResources = [
                ...(machines || []).map(m => ({ ...m, resourceType: 'Machine' })),
                ...(finishing || []).map(f => ({ ...f, resourceType: 'Finishing' })),
                ...(labor || []).map(l => ({ ...l, name: l.roleName, resourceType: 'Labor' }))
            ];
            setTemplates(allTemplates); setMaterials(allMaterials); setResources(combinedResources);
            if (!isNew && viewParam) {
                const template = allTemplates.find(t => t.id === viewParam);
                loadTemplate(template);
            } else { loadTemplate(null); }
        } catch (error) { showNotification(error.message, 'error'); }
        finally { setIsLoading(false); }
    }, [viewParam, isNew, showNotification, loadTemplate]);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    useEffect(() => {
        const workflowData = { nodes: nodes.map(n => ({ id: n.id, position: n.position, data: n.data })), edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })) };
        const yamlString = jsYaml.dump(workflowData, { indent: 2 });
        setYamlText(yamlString);
    }, [nodes, edges]);

    const handleSave = async () => {
        if (!templateName.trim()) {
            showNotification('Geef het sjabloon een naam.', 'error');
            return;
        }
        const workflowDefinition = jsYaml.load(yamlText);
        const payload = {
            name: templateName.trim(),
            productType: productType,
            description: description,
            defaultMaterialId: defaultMaterialId || null,
            workflowDefinition: { ...workflowDefinition, yaml: yamlText },
            defaults: selectedTemplate?.defaults || null, 
            settings: selectedTemplate?.settings || null,
        };
        try {
            if (!isNew && selectedTemplate) {
                await updateProductTemplate(selectedTemplate.id, payload);
                showNotification('Workflow succesvol opgeslagen!', 'success');
            } else {
                const newTemplate = await createProductTemplate(payload);
                showNotification('Nieuw sjabloon succesvol aangemaakt!', 'success');
                // --- START WIJZIGING: 'navigate' gebruiken met correcte URL ---
                navigate(`/product-template-editor/${newTemplate.id}`);
                // --- EINDE WIJZIGING ---
            }
        } catch (error) {
            showNotification(`Opslaan mislukt: ${error.message}`, 'error');
        }
    };
    
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (!reactFlowWrapper.current) return;
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const resource = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const position = { 
            x: event.clientX - reactFlowBounds.left, 
            y: event.clientY - reactFlowBounds.top
        };
        const newNode = {
            id: `${resource.resourceType}_${Date.now()}`,
            type: 'custom',
            position,
            data: { 
                label: resource.name, 
                type: resource.resourceType, 
                resourceId: resource.id,
                params: {}
            },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [setNodes]);

    const handleNodeConfigSave = (nodeId, params) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    node.data.params = params;
                    if (params.modeId) {
                        const resource = resources.find(r => r.id === node.data.resourceId);
                        const selectedMode = (resource?.costingProfile?.productionModes || []).find(p => p.id === params.modeId);
                        node.data.params.modeName = selectedMode?.name || null;
                    }
                }
                return node;
            })
        );
    };

    const onNodeClick = useCallback((event, node) => { setSelectedNodeId(node.id); }, []);
    const onNodeDoubleClick = useCallback((event, node) => { if (['Start', 'Einde'].includes(node.data.type)) return; setEditingNode(node); }, []);
    
    const onKeyDown = useCallback((event) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
            const selectedNodes = nodes.filter(n => n.selected);
            if (selectedNodes.length > 0) {
                const deletableNodes = selectedNodes.filter(n => n.id !== 'start' && n.id !== 'end');
                const deletableNodeIds = deletableNodes.map(n => n.id);
                setNodes((nds) => nds.filter((node) => !deletableNodeIds.includes(node.id)));
                setEdges((eds) => eds.filter((edge) => !deletableNodeIds.includes(edge.source) && !deletableNodeIds.includes(edge.target)));
            }
        }
    }, [nodes, setNodes, setEdges]);

    const editingResource = useMemo(() => { if (!editingNode) return null; return resources.find(r => r.id === editingNode.data.resourceId); }, [editingNode, resources]);
    
    if (isLoading) return <div className="p-6 text-center">Workflow Editor laden...</div>;

    return (
        <div className="h-screen flex flex-col bg-white" onKeyDown={onKeyDown} tabIndex={0}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-800">Hybride Workflow Editor</h1>
                <div>
                    {/* --- START WIJZIGING: 'navigate' gebruiken met correcte URL --- */}
                    <button onClick={() => navigate('/product-template-management')} className="btn btn-sm btn-ghost mr-2">← Terug</button>
                    {/* --- EINDE WIJZIGING --- */}
                    <button onClick={handleSave} className="btn btn-sm btn-primary">Opslaan</button>
                </div>
            </div>
            <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="form-control"><label className="label-text text-xs font-semibold">Naam van het Sjabloon</label><input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="input input-bordered input-sm" placeholder="bv. Luxe Visitekaartjes"/></div>
                    <div className="form-control"><label className="label-text text-xs font-semibold">Producttype</label><select className="select select-bordered select-sm" value={productType} onChange={(e) => setProductType(e.target.value)}><option value="FLAT_PRINT">Plat product</option><option value="BOX">Doos</option><option value="DISPLAY">Display</option><option value="OTHER">Overig</option></select></div>
                    <div className="form-control"><label className="label-text text-xs font-semibold">Standaard Materiaal (Optioneel)</label><select className="select select-bordered select-sm" value={defaultMaterialId} onChange={(e) => setDefaultMaterialId(e.target.value)}><option value="">-- Geen --</option>{materials.map(mat => ( <option key={mat.id} value={mat.id}>{mat.name}</option>))} </select></div>
                    <div className="form-control"><label className="label-text text-xs font-semibold">Omschrijving</label><input type="text" className="input input-bordered input-sm" placeholder="Korte omschrijving..." value={description} onChange={(e) => setDescription(e.target.value)}/></div>
                </div>
            </div>
            <div className="flex-grow flex min-h-0">
                <div className="w-56 bg-gray-50 border-r p-3 flex flex-col">
                    <h3 className="font-bold text-md mb-3 flex-shrink-0">Bouwblokken</h3>
                    <div className="overflow-y-auto flex-grow -mr-3 pr-3">
                        {resources.map(res => (
                            <div key={res.id} className="p-2 mb-2 bg-white border rounded-md cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow" draggable onDragStart={(e) => e.dataTransfer.setData('application/reactflow', JSON.stringify(res))}>
                               {res.name} <span className="text-xs text-gray-500 block">({res.resourceType})</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-2">
                    <div className="relative border-r" ref={reactFlowWrapper}>
                        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onNodeClick={onNodeClick} fitView onDrop={onDrop} onDragOver={onDragOver} onNodeDoubleClick={onNodeDoubleClick} className="react-flow">
                            <Background variant="dots" gap={16} size={1} />
                            <Controls className="!left-auto !right-2" />
                        </ReactFlow>
                    </div>
                    <div className="relative overflow-hidden">
                        <Editor value={yamlText} onValueChange={setYamlText} highlight={code => highlight(code, languages.yaml, 'yaml')} padding={10} className="font-mono text-xs h-full w-full bg-gray-800 text-white" style={{ fontFamily: '"Fira Code", "Fira Mono", monospace' }} />
                    </div>
                </div>
            </div>
            <NodeConfigModal isOpen={!!editingNode} node={editingNode} allNodes={nodes} resource={editingResource} onClose={() => setEditingNode(null)} onSave={handleNodeConfigSave} />
        </div>
    );
};

const ProductTemplateEditor = (props) => (
    <ReactFlowProvider>
        <HybrideEditor {...props} />
    </ReactFlowProvider>
);

export default ProductTemplateEditor;