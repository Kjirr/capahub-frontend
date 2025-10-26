import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: useNavigate importeren ---
import { useNavigate } from 'react-router-dom';
import { getPurchaseOrders } from '@/api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const PurchaseOrderManagement = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPurchaseOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPurchaseOrders();
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
                {/* --- START WIJZIGING: Groepering van knoppen en 'Terug' knop toegevoegd --- */}
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                        ← Terug naar Instellingen
                    </button>
                    <button 
                        onClick={() => navigate('/create-purchase-order')} 
                        className="btn btn-primary"
                    >
                        Nieuwe Inkooporder
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
                                        <td 
                                            className="font-bold cursor-pointer text-primary hover:underline"
                                            // --- START WIJZIGING: 'navigate' gebruiken met correcte URL ---
                                            onClick={() => navigate(`/purchase-order-details/${po.id}`)}
                                            // --- EINDE WIJZIGING ---
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