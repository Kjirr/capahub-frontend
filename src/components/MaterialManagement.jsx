// src/components/MaterialManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import AddMaterialModal from './AddMaterialModal';
import StockCorrectionModal from './StockCorrectionModal';

const MaterialManagement = ({ showNotification }) => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const fetchMaterials = useCallback(async () => {
        try {
            const data = await apiRequest('/materials', 'GET');
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
        if (!inventoryItems || inventoryItems.length === 0) return 0;
        return inventoryItems.reduce((total, item) => total + item.quantity, 0);
    };

    const formatStockLocations = (inventoryItems) => {
        if (!inventoryItems || inventoryItems.length === 0) return 'Geen voorraad';
        return inventoryItems
            .map(item => `${item.quantity} op "${item.location.name}"`)
            .join('; ');
    };
    
    const openCorrectionModal = (material) => {
        setSelectedMaterial(material);
        setIsCorrectionModalOpen(true);
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
                    <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                        Nieuw Materiaal
                    </button>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Materiaal</th>
                                        <th>Totale Voorraad</th>
                                        <th>Locaties</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.length > 0 ? materials.map(material => (
                                        <tr key={material.id} className="hover">
                                            <td className="font-bold">
                                                {material.name}
                                                {/* Toon de dikte als die is ingevuld */}
                                                {material.thickness && <span className="text-base-content/60 ml-2">({material.thickness})</span>}
                                            </td>
                                            <td><strong>{calculateTotalStock(material.inventoryItems)} {material.unit}</strong></td>
                                            <td className="text-sm">{formatStockLocations(material.inventoryItems)}</td>
                                            <td className="text-right">
                                                <button 
                                                    onClick={() => openCorrectionModal(material)}
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    Voorraad Aanpassen
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center">Nog geen materialen toegevoegd.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AddMaterialModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onMaterialAdded={fetchMaterials}
                showNotification={showNotification}
            />
            <StockCorrectionModal
                isOpen={isCorrectionModalOpen}
                onClose={() => setIsCorrectionModalOpen(false)}
                onSave={fetchMaterials}
                showNotification={showNotification}
                material={selectedMaterial}
            />
        </>
    );
};

export default MaterialManagement;