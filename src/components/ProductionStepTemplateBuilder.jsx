import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getWorkflowTemplates, deleteWorkflowTemplate } from '../api'; 
import ConfirmationModal from './ConfirmationModal';

const ProductionStepTemplateBuilder = ({ showNotification, navigateTo }) => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // === NIEUW: State voor de zoekterm ===
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getWorkflowTemplates();
            setTemplates(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleOpenDeleteModal = (template) => {
        setTemplateToDelete(template);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;
        setIsProcessing(true);
        try {
            await deleteWorkflowTemplate(templateToDelete.id);
            showNotification('Sjabloon succesvol verwijderd.', 'success');
            fetchTemplates(); // Herlaad de lijst na verwijderen
            setIsDeleteModalOpen(false);
            setTemplateToDelete(null);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // === NIEUW: Filter logica voor de zoekbalk ===
    const filteredTemplates = useMemo(() => {
        if (!searchTerm) return templates;
        return templates.filter(template => 
            template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [templates, searchTerm]);

    if (isLoading) {
        return <div className="loading-text">Sjablonen laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Beheer Productie Sjablonen</h1>
                        <p className="page-subtitle">Stel hier je complete productieworkflows samen.</p>
                    </div>
                    <div>
                        <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost mr-2">
                            ← Terug naar Instellingen
                        </button>
                        <button 
                            onClick={() => navigateTo('production-step-template-editor', 'new')} 
                            className="btn btn-primary"
                        >
                            Nieuw Sjabloon
                        </button>
                    </div>
                </div>

                {/* === NIEUW: Zoekbalk === */}
                <div className="form-control mb-4">
                    <input 
                        type="text" 
                        placeholder="Zoek op naam of omschrijving..."
                        className="input input-bordered w-full md:w-1/3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam Sjabloon</th>
                                        <th>Omschrijving</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* === AANGEPAST: Gebruik de gefilterde lijst === */}
                                    {filteredTemplates.length > 0 ? (
                                        filteredTemplates.map(template => (
                                            <tr key={template.id} className="hover">
                                                <td className="font-bold">{template.name}</td>
                                                <td>{template.description}</td>
                                                <td className="text-right space-x-2">
                                                    <button 
                                                        onClick={() => navigateTo('production-step-template-editor', template.id)} 
                                                        className="btn btn-sm btn-outline"
                                                    >
                                                        Bewerken
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenDeleteModal(template)}
                                                        className="btn btn-sm btn-error"
                                                    >
                                                        Verwijderen
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4">
                                                Geen sjablonen gevonden.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Sjabloon Verwijderen"
                isProcessing={isProcessing}
            >
                <p>Weet je zeker dat je het sjabloon <strong>{templateToDelete?.name}</strong> permanent wilt verwijderen?</p>
            </ConfirmationModal>
        </>
    );
};

export default ProductionStepTemplateBuilder;