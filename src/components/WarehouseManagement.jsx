// src/components/WarehouseManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: useNavigate importeren ---
import { useNavigate } from 'react-router-dom';
import { getStockLocations, deleteStockLocation } from '@/api';
import LocationModal from './LocationModal';
import EditLocationModal from './EditLocationModal';
import ConfirmationModal from './ConfirmationModal';
// --- EINDE WIJZIGING ---

const WarehouseManagement = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchLocations = useCallback(async () => {
        if (locations.length === 0) setIsLoading(true);
        try {
            const data = await getStockLocations();
            setLocations(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, locations.length]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleOpenEditModal = (location) => {
        setSelectedLocation(location);
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (location) => {
        setSelectedLocation(location);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedLocation) return;
        setIsProcessing(true);
        try {
            await deleteStockLocation(selectedLocation.id);
            showNotification('Locatie succesvol verwijderd.', 'success');
            fetchLocations();
            setIsDeleteModalOpen(false);
            setSelectedLocation(null);
        } catch (error) {
            showNotification(error.response?.data?.error || 'Verwijderen mislukt.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return <div className="loading-text">Locaties laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Magazijnbeheer</h1>
                        <p className="page-subtitle">Beheer hier de fysieke locaties in uw magazijn.</p>
                    </div>
                    {/* --- START WIJZIGING: Groepering van knoppen voor layout --- */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                            ← Terug naar Instellingen
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                            Nieuwe Locatie
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
                                        <th>Naam</th>
                                        <th>Omschrijving</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.length > 0 ? locations.map(loc => (
                                        <tr key={loc.id} className="hover">
                                            <td className="font-bold">{loc.name}</td>
                                            <td>{loc.description || '-'}</td>
                                            <td className="text-right space-x-2">
                                                <button onClick={() => handleOpenEditModal(loc)} className="btn btn-sm btn-outline">Bewerk</button>
                                                <button onClick={() => handleOpenDeleteModal(loc)} className="btn btn-sm btn-outline btn-error">Verwijder</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" className="text-center">Nog geen locaties aangemaakt.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <LocationModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onLocationAdded={fetchLocations}
                showNotification={showNotification}
            />

            <EditLocationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onLocationUpdated={fetchLocations}
                showNotification={showNotification}
                location={selectedLocation}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Locatie Verwijderen"
                isProcessing={isProcessing}
            >
                <p>Weet je zeker dat je de locatie <strong>{selectedLocation?.name}</strong> wilt verwijderen?</p>
                <p className="text-sm text-error mt-2">Dit kan alleen als de locatie leeg is. Deze actie kan niet ongedaan worden gemaakt.</p>
            </ConfirmationModal>
        </>
    );
};

export default WarehouseManagement;