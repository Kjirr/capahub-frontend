// src/components/OrdersList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, activateOrder } from '@/api';
import StatusBadge from './StatusBadge';
import { subscribeToEvent, unsubscribeFromEvent } from '@/socket';

const OrdersList = ({ showNotification }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [planningOrderId, setPlanningOrderId] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getOrders();
            setOrders(data || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchOrders();

        const handlePlanningUpdate = () => {
            showNotification('De orderlijst wordt bijgewerkt...', 'info');
            fetchOrders();
        };

        subscribeToEvent('PLANNING_UPDATED', handlePlanningUpdate);

        return () => {
            unsubscribeFromEvent('PLANNING_UPDATED', handlePlanningUpdate);
        };
    }, [fetchOrders, showNotification]);

    const handlePlanOrder = async (orderId) => {
        setPlanningOrderId(orderId);
        try {
            await activateOrder(orderId);
            // De lijst wordt nu vanzelf bijgewerkt via het socket event.
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setPlanningOrderId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N.v.t.';
        // --- START WIJZIGING: Tikfout 'toLocaleDateDateString' gecorrigeerd ---
        return new Date(dateString).toLocaleDateString('nl-NL');
        // --- EINDE WIJZIGING ---
    };

    if (isLoading) {
        return <div className="p-6 text-center">Orders laden...</div>;
    }
    
    return (
        <div className="page-container p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Productieorders</h1>
                    <p className="page-subtitle">Een overzicht van alle geaccepteerde offertes en productieorders.</p>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Ordernummer</th>
                                    <th>Klant</th>
                                    <th>Bedrag</th>
                                    <th>Orderdatum</th>
                                    <th>Status</th>
                                    <th className="text-right">Acties</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? orders.map(order => (
                                    <tr key={order.id} className="hover">
                                        <td className="font-bold">{order.orderNumber}</td>
                                        <td>{order.customerCompany || order.customerName || 'N.v.t.'}</td>
                                        <td>€ {Number(order.totalPrice).toFixed(2)}</td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td><StatusBadge status={order.status} /></td>
                                        <td className="text-right space-x-2">
                                            {(order.status === 'ON_HOLD' || order.status === 'PENDING_PLANNING') && (
                                                <button
                                                    onClick={() => handlePlanOrder(order.id)}
                                                    className="btn btn-sm btn-warning"
                                                    disabled={planningOrderId === order.id}
                                                >
                                                    {planningOrderId === order.id ? 'Bezig...' : 'Plan Order'}
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => navigate(`/order-details/${order.id}`)}
                                                className="btn btn-sm btn-ghost"
                                            >
                                                Bekijken
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center">Er zijn nog geen productieorders.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersList;