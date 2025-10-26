// components/Expeditie.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getShippableOrders, updateOrderStatus, updateOrder } from '../api';
import { format, startOfWeek, endOfWeek, subDays, addDays } from 'date-fns';
import { nl } from 'date-fns/locale';

const DateModal = ({ order, isOpen, onSave, onCancel }) => {
    const [verzenddatum, setVerzenddatum] = useState('');
    const [leverdatum, setLeverdatum] = useState('');

    useEffect(() => {
        if (order) {
            setVerzenddatum(order.verzenddatum ? format(new Date(order.verzenddatum), 'yyyy-MM-dd') : '');
            setLeverdatum(order.leverdatum ? format(new Date(order.leverdatum), 'yyyy-MM-dd') : '');
        }
    }, [order]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(order.id, {
            verzenddatum: verzenddatum ? new Date(verzenddatum).toISOString() : null,
            leverdatum: leverdatum ? new Date(leverdatum).toISOString() : null,
        });
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Datums Wijzigen voor Order {order.orderNumber}</h3>
                <div className="form-control mt-4">
                    <label className="label"><span className="label-text">Verzenddatum</span></label>
                    <input type="date" value={verzenddatum} onChange={(e) => setVerzenddatum(e.target.value)} className="input input-bordered" />
                </div>
                <div className="form-control mt-2">
                    <label className="label"><span className="label-text">Leverdatum</span></label>
                    <input type="date" value={leverdatum} onChange={(e) => setLeverdatum(e.target.value)} className="input input-bordered" />
                </div>
                <div className="modal-action">
                    <button onClick={onCancel} className="btn btn-ghost">Annuleren</button>
                    <button onClick={handleSave} className="btn btn-primary">Opslaan</button>
                </div>
            </div>
        </div>
    );
};

const Expeditie = ({ showNotification, navigateTo }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const { weekStart, weekEnd } = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return { weekStart: start, weekEnd: end };
    }, [currentDate]);


    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate = format(weekEnd, 'yyyy-MM-dd');
            const data = await getShippableOrders(startDate, endDate);
            setOrders(data || []);
        } catch (error) {
            showNotification(`Kon orders niet laden: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [weekStart, weekEnd, showNotification]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleMarkAsShipped = async (orderId) => {
        if (window.confirm('Weet je zeker dat je deze order als verzonden wilt markeren?')) {
            try {
                await updateOrderStatus(orderId, 'SHIPPED');
                showNotification('Order succesvol als verzonden gemarkeerd.');
                fetchOrders();
            } catch (error) {
                showNotification(`Fout bij bijwerken status: ${error.message}`, 'error');
            }
        }
    };

    // --- START WIJZIGING: Nieuwe functie om de verzendstatus terug te draaien ---
    const handleUndoShipped = async (orderId) => {
        if (window.confirm('Weet je zeker dat je de verzonden-status van deze order wilt terugdraaien? De status wordt teruggezet naar COMPLETED.')) {
            try {
                await updateOrderStatus(orderId, 'COMPLETED');
                showNotification('Orderstatus succesvol teruggedraaid.');
                fetchOrders();
            } catch (error) {
                showNotification(`Fout bij terugdraaien: ${error.message}`, 'error');
            }
        }
    };
    // --- EINDE WIJZIGING ---

    const handleOpenDateModal = (order) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleSaveDates = async (orderId, dates) => {
        try {
            await updateOrder(orderId, dates);
            showNotification('Datums succesvol bijgewerkt.');
            setIsModalOpen(false);
            setEditingOrder(null);
            fetchOrders();
        } catch (error) {
            showNotification(`Kon datums niet opslaan: ${error.message}`, 'error');
        }
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Expeditie Dashboard</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="btn btn-ghost">‹ Vorige Week</button>
                    <span className="font-bold text-center w-48">
                        {format(weekStart, 'd MMM')} - {format(weekEnd, 'd MMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="btn btn-ghost">Volgende Week ›</button>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <p className="text-center p-8">Orders laden...</p>
                        ) : (
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Order #</th>
                                        <th>Klant</th>
                                        <th>Verzenddatum</th>
                                        <th>Leverdatum</th>
                                        <th>Status</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover">
                                            <td className="font-bold">{order.orderNumber}</td>
                                            <td>{order.customerCompany || order.customerName}</td>
                                            <td>{format(new Date(order.verzenddatum), 'dd-MM-yyyy')}</td>
                                            <td>{format(new Date(order.leverdatum), 'dd-MM-yyyy')}</td>
                                            <td><span className={`badge ${order.status === 'SHIPPED' ? 'badge-success' : 'badge-ghost'}`}>{order.status}</span></td>
                                            <td className="text-right space-x-2">
                                                {/* --- START WIJZIGING: Logica voor de knop aangepast --- */}
                                                {order.status === 'SHIPPED' ? (
                                                    <button onClick={() => handleUndoShipped(order.id)} className="btn btn-warning btn-sm">
                                                        Verzending Terugdraaien
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleMarkAsShipped(order.id)} className="btn btn-primary btn-sm">
                                                        Markeer als Verzonden
                                                    </button>
                                                )}
                                                {/* --- EINDE WIJZIGING --- */}
                                                <button onClick={() => handleOpenDateModal(order)} className="btn btn-ghost btn-sm">
                                                    Datums Wijzigen
                                                </button>
                                                <button onClick={() => navigateTo('order-details', order.id)} className="btn btn-ghost btn-sm">
                                                    Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!isLoading && orders.length === 0 && (
                            <p className="text-center p-8">Geen orders om te verzenden in deze periode.</p>
                        )}
                    </div>
                </div>
            </div>
            <DateModal
                order={editingOrder}
                isOpen={isModalOpen}
                onSave={handleSaveDates}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Expeditie;