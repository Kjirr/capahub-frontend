import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import SupplierModal from './SupplierModal';

const SupplierManagement = ({ showNotification }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/suppliers', 'GET');
            setSuppliers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    if (isLoading && suppliers.length === 0) {
        return <div className="loading-text">Leveranciers laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Leveranciersbeheer</h1>
                        <p className="page-subtitle">Beheer hier alle leveranciers van uw bedrijf.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        Nieuwe Leverancier
                    </button>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>Contactpersoon</th>
                                        <th>E-mail</th>
                                        <th>Telefoon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.length > 0 ? suppliers.map(supplier => (
                                        <tr key={supplier.id} className="hover">
                                            <td className="font-bold">{supplier.name}</td>
                                            <td>{supplier.contactPerson || '-'}</td>
                                            <td>{supplier.email || '-'}</td>
                                            <td>{supplier.phone || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center">Nog geen leveranciers toegevoegd.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SupplierModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSupplierAdded={fetchSuppliers}
                showNotification={showNotification}
            />
        </>
    );
};

export default SupplierManagement;