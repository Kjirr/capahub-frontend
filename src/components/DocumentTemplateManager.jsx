import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, deleteTemplate } from '../api';
// --- START WIJZIGING: Extra icoon voor de Bedankpagina toegevoegd ---
import { FaFileInvoice, FaFileSignature, FaShoppingBasket, FaClipboardList, FaPalette, FaTruckLoading, FaEye, FaRegThumbsUp } from 'react-icons/fa';
// --- EINDE WIJZIGING ---

const TemplateCard = ({ template, onEdit, onDelete }) => {
    // --- START WIJZIGING: Icoon voor het nieuwe type toegevoegd ---
    const ICONS = {
        QUOTE: <FaFileSignature className="w-6 h-6 text-blue-500" />,
        INVOICE: <FaFileInvoice className="w-6 h-6 text-green-500" />,
        PURCHASE_ORDER: <FaShoppingBasket className="w-6 h-6 text-orange-500" />,
        WORK_TICKET: <FaClipboardList className="w-6 h-6 text-purple-500" />,
        PALLET_CARD: <FaPalette className="w-6 h-6 text-indigo-500" />,
        OUTSOURCING_TICKET: <FaTruckLoading className="w-6 h-6 text-gray-500" />,
        FILE_PROOF: <FaEye className="w-6 h-6 text-teal-500" />,
        FILE_PROOF_THANKS: <FaRegThumbsUp className="w-6 h-6 text-green-500" />
    };
    // --- EINDE WIJZIGING ---

    return (
        <div className="card bg-base-100 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-base-200 rounded-full">{ICONS[template.type] || <FaFileSignature />}</div>
                        <div>
                            <h2 className="card-title text-base">{template.name}</h2>
                            <p className="text-xs text-gray-500 capitalize">{template.type.toLowerCase().replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    {template.isDefault && <div className="badge badge-success badge-sm font-semibold">Default</div>}
                </div>
                <div className="card-actions justify-end mt-4">
                    <button onClick={() => onEdit(template.id)} className="btn btn-sm btn-outline btn-primary">Bewerken</button>
                    <button onClick={() => onDelete(template.id, template.name)} className="btn btn-sm btn-ghost text-red-500">Verwijderen</button>
                </div>
            </div>
        </div>
    );
};

const DocumentTemplateManager = ({ showNotification }) => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTemplates = useCallback(async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        setIsLoading(true);
        fetchTemplates();
    }, [fetchTemplates]);
    
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Weet je zeker dat je de template "${name}" wilt verwijderen?`)) return;
        try {
            await deleteTemplate(id);
            showNotification("Template succesvol verwijderd.", "success");
            fetchTemplates();
        } catch (error) {
            showNotification(error.message, "error");
        }
    };
    
    const renderTemplatesByType = (type) => {
        const filtered = templates.filter(t => t.type === type);
        if (filtered.length === 0) {
            return (
                <div className="italic text-sm text-gray-400 p-4 border-2 border-dashed rounded-lg text-center col-span-full">
                    Nog geen templates voor dit type. Klik op 'Nieuwe Template' om er een aan te maken.
                </div>
            );
        }
        return filtered.map(template => (
            <TemplateCard key={template.id} template={template} onEdit={(id) => navigate(`/template-editor/${id}`)} onDelete={handleDelete} />
        ));
    };

    // --- START WIJZIGING: Nieuwe sectie voor de Bedankpagina toegevoegd ---
    const templateSections = [
        { title: 'Offertes', type: 'QUOTE' },
        { title: 'Proefbestanden Klant (Kijkdoos)', type: 'FILE_PROOF' },
        { title: 'Bedankpagina\'s na Feedback', type: 'FILE_PROOF_THANKS' },
        { title: 'Productiebonnen (Werkbonnen)', type: 'WORK_TICKET' },
        { title: 'Palletkaarten', type: 'PALLET_CARD' },
        { title: 'Bonnen voor Uitbesteding', type: 'OUTSOURCING_TICKET' },
        { title: 'Facturen', type: 'INVOICE' },
        { title: 'Inkoopbonnen', type: 'PURCHASE_ORDER' },
    ];
    // --- EINDE WIJZIGING ---

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Document Templates</h1>
                    <p className="page-subtitle">Beheer hier de layout van al je bedrijfsdocumenten.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                        ← Terug naar Instellingen
                    </button>
                    <button onClick={() => navigate('/template-editor/new')} className="btn btn-primary">
                        Nieuwe Template
                    </button>
                </div>
            </div>
            {isLoading ? <p className="text-center p-10">Templates laden...</p> : (
                <div className="space-y-8">
                    {templateSections.map(section => (
                        <div key={section.type}>
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">{section.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {renderTemplatesByType(section.type)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentTemplateManager;