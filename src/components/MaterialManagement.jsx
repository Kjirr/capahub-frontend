// src/components/MaterialManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import AddMaterialModal from './AddMaterialModal';

const MaterialManagement = ({ showNotification }) => {
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMaterials = useCallback(async () => {
        setIsLoading(true);
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

    // --- HELPER FUNCTIES VOOR VOORRAADWEERGAVE ---
    
    // Berekent de totale voorraad voor een materiaal door alle locaties op te tellen
    const calculateTotalStock = (inventoryItems) => {
        if (!inventoryItems || inventoryItems.length === 0) return 0;
        return inventoryItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Maakt een leesbare tekst van de voorraad per locatie
    const formatStockLocations = (inventoryItems) => {
        if (!inventoryItems || inventoryItems.length === 0) return 'Geen voorraad';
        return inventoryItems
            .map(item => `${item.quantity} op "${item.location.name}"`)
            .join(', ');
    };


    if (isLoading && materials.length === 0) {
        return <div className="loading-text">Materialen laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Materiaalbeheer</h1>
                        <p className="page-subtitle">Beheer hier de materialen en prijzen voor uw bedrijf.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        Nieuw Materiaal
                    </button>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>Type</th>
                                        <th>Prijs (€)</th>
                                        <th>Totale Voorraad</th>
                                        <th>Locaties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.length > 0 ? materials.map(material => (
                                        <tr key={material.id} className="hover">
                                            <td className="font-bold">{material.name}</td>
                                            <td>{material.type}</td>
                                            <td>{material.price.toFixed(2)} ({material.pricingModel})</td>
                                            {/* Gebruik de nieuwe helper functie voor de totale voorraad */}
                                            <td><strong>{calculateTotalStock(material.inventoryItems)}</strong></td>
                                            {/* Toon de gedetailleerde locatie-informatie */}
                                            <td className="text-sm">{formatStockLocations(material.inventoryItems)}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center">Nog geen materialen toegevoegd.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AddMaterialModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMaterialAdded={fetchMaterials}
                showNotification={showNotification}
            />
        </>
    );
};

export default MaterialManagement;