import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import LocationModal from './LocationModal';

const WarehouseManagement = ({ showNotification }) => {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchLocations = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/stock-locations', 'GET');
            setLocations(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    if (isLoading && locations.length === 0) {
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
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        Nieuwe Locatie
                    </button>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>Omschrijving</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.length > 0 ? locations.map(loc => (
                                        <tr key={loc.id} className="hover">
                                            <td className="font-bold">{loc.name}</td>
                                            <td>{loc.description || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="2" className="text-center">Nog geen locaties aangemaakt.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <LocationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLocationAdded={fetchLocations}
                showNotification={showNotification}
            />
        </>
    );
};

export default WarehouseManagement;