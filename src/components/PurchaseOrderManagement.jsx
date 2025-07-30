import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const PurchaseOrderManagement = ({ showNotification, navigateTo }) => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPurchaseOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/purchase-orders', 'GET');
            setPurchaseOrders(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    if (isLoading && purchaseOrders.length === 0) {
        return <div className="loading-text">Inkooporders laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Inkoopbeheer</h1>
                    <p className="page-subtitle">Beheer hier alle inkooporders van uw bedrijf.</p>
                </div>
                <button 
                    onClick={() => navigateTo('create-purchase-order')} 
                    className="btn btn-primary"
                >
                    Nieuwe Inkooporder
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Inkoopnr.</th>
                                    <th>Leverancier</th>
                                    <th>Orderdatum</th>
                                    <th>Status</th>
                                    <th>Aantal Regels</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.length > 0 ? purchaseOrders.map(po => (
                                    <tr key={po.id} className="hover">
                                        {/* --- AANGEPAST --- */}
                                        <td 
                                            className="font-bold cursor-pointer text-primary hover:underline"
                                            onClick={() => navigateTo('purchase-order-details', po.id)}
                                        >
                                            {po.poNumber}
                                        </td>
                                        <td>{po.supplier.name}</td>
                                        <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                                        <td><span className="badge badge-ghost">{po.status}</span></td>
                                        <td>{po.items.length}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center">Nog geen inkooporders gevonden.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderManagement;