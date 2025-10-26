import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: useNavigate importeren ---
import { useNavigate } from 'react-router-dom';
import { getMaterials, deleteMaterial } from '@/api';
import AddMaterialModal from './AddMaterialModal';
import EditMaterialModal from './EditMaterialModal';
import StockCorrectionModal from './StockCorrectionModal';
import StockCardModal from './StockCardModal';
import MoveStockModal from './MoveStockModal';
import ConfirmationModal from './ConfirmationModal';
// --- EINDE WIJZIGING ---

const MaterialManagement = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // States voor alle modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [isStockCardModalOpen, setIsStockCardModalOpen] = useState(false);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    
    // Geselecteerde items
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedStockItem, setSelectedStockItem] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchMaterials = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMaterials();
            setMaterials(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const calculateTotalStock = (inventoryItems) => {
        return inventoryItems.reduce((total, item) => total + item.quantity, 0);
    };
    
    const handleOpenEditModal = (material) => {
        setSelectedMaterial(material);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (material) => {
        setSelectedMaterial(material);
        setIsDeleteModalOpen(true);
    };

    const openStockCardModal = (material, inventoryItem) => {
        setSelectedStockItem({ 
            material: { id: material.id, name: material.name },
            location: { id: inventoryItem.location.id, name: inventoryItem.location.name }
        });
        setIsStockCardModalOpen(true);
    };

    const openCorrectionModal = (material, inventoryItem = null) => {
        setSelectedStockItem({
            material: { id: material.id, name: material.name },
            location: inventoryItem ? { id: inventoryItem.location.id, name: inventoryItem.location.name } : null
        });
        setIsCorrectionModalOpen(true);
    };

    const handleOpenMoveModal = () => {
        setIsMoveModalOpen(true);
    };
    
    const handleSaveAndRefresh = () => {
        setIsCorrectionModalOpen(false);
        setIsMoveModalOpen(false);
        setIsEditModalOpen(false);
        fetchMaterials();
    };

    const handleConfirmDelete = async () => {
        if (!selectedMaterial) return;
        setIsProcessing(true);
        try {
            await deleteMaterial(selectedMaterial.id);
            showNotification('Materiaal succesvol verwijderd.', 'success');
            fetchMaterials();
            setIsDeleteModalOpen(false);
            setSelectedMaterial(null);
        } catch (error) {
            showNotification(error.response?.data?.error || 'Verwijderen mislukt.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading && materials.length === 0) {
        return <div className="loading-text">Materialen laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Materiaal- & Voorraadbeheer</h1>
                        <p className="page-subtitle">Beheer materialen, prijzen en de actuele voorraad.</p>
                    </div>
                    {/* --- START WIJZIGING: Groepering van knoppen voor layout --- */}
                    <div className="flex items-center gap-2">
                         <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                            ← Terug naar Instellingen
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                            Nieuw Materiaal
                        </button>
                    </div>
                    {/* --- EINDE WIJZIGING --- */}
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Materiaal</th>
                                        <th>Totale Voorraad</th>
                                        <th>Voorraad per Locatie</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map(material => (
                                        <tr key={material.id} className="hover">
                                            <td className="font-bold">{material.name} <span className="text-base-content/60">({material.thickness})</span></td>
                                            <td><strong>{calculateTotalStock(material.inventoryItems)} {material.unit}</strong></td>
                                            <td>
                                                <div className="flex flex-wrap gap-2">
                                                    {material.inventoryItems.length > 0 ? material.inventoryItems.map(item => (
                                                        <div key={`${material.id}-${item.location.id}`} onClick={() => openStockCardModal(material, item)} className="badge badge-lg badge-outline hover:bg-base-200 cursor-pointer p-3">
                                                            {item.quantity} op "{item.location.name}"
                                                        </div>
                                                    )) : <span className="text-base-content/60">Geen voorraad</span>}
                                                </div>
                                            </td>
                                            <td className="text-right space-x-2">
                                                <button onClick={() => openCorrectionModal(material)} className="btn btn-sm btn-outline">Voorraad</button>
                                                <button onClick={() => handleOpenEditModal(material)} className="btn btn-sm btn-outline">Bewerk</button>
                                                <button onClick={() => handleOpenDeleteModal(material)} className="btn btn-sm btn-outline btn-error">Verwijder</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alle modals */}
            <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onMaterialAdded={fetchMaterials} showNotification={showNotification} />
            <EditMaterialModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onMaterialUpdated={handleSaveAndRefresh} showNotification={showNotification} material={selectedMaterial} />
            <StockCorrectionModal isOpen={isCorrectionModalOpen} onClose={() => setIsCorrectionModalOpen(false)} onSave={handleSaveAndRefresh} showNotification={showNotification} stockItem={selectedStockItem} />
            <StockCardModal isOpen={isStockCardModalOpen} onClose={() => setIsStockCardModalOpen(false)} showNotification={showNotification} stockItem={selectedStockItem} onCorrectStock={() => openCorrectionModal(selectedStockItem.material, { location: selectedStockItem.location })} onMoveStock={handleOpenMoveModal} />
            <MoveStockModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} onSave={handleSaveAndRefresh} showNotification={showNotification} stockItem={selectedStockItem} />
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Materiaal Verwijderen" isProcessing={isProcessing}>
                <p>Weet u zeker dat u <strong>{selectedMaterial?.name}</strong> wilt verwijderen?</p>
                <p className="text-sm text-error mt-2">Dit kan alleen als er geen voorraad meer van dit materiaal is.</p>
            </ConfirmationModal>
        </>
    );
};

export default MaterialManagement;