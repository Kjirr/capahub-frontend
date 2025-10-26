import React, { useState, useEffect, useCallback } from 'react';
import { 
    getPurchaseOrderById, 
    getStockLocations,
    updatePurchaseOrderStatus,
    sendPurchaseOrder
} from '../api';

const PurchaseOrderDetail = ({ viewParam: poId, showNotification, navigateTo }) => {
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState('');

    const statuses = ["DRAFT", "ORDERED", "PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"];

    const fetchPageData = useCallback(async () => {
        if (!poId) return;
        setIsLoading(true);
        try {
            const [poData, locationsData] = await Promise.all([
                getPurchaseOrderById(poId),
                getStockLocations()
            ]);
            
            setPurchaseOrder(poData);
            setSelectedStatus(poData.status);
            setLocations(locationsData);

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [poId, showNotification]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        
        const payload = { status: selectedStatus };
        
        if (selectedStatus === 'RECEIVED') {
            if (!selectedLocationId) {
                showNotification('Selecteer een locatie om de goederen in te boeken.', 'warn');
                setIsUpdating(false);
                return;
            }
            payload.locationId = selectedLocationId;
        }

        try {
            const response = await updatePurchaseOrderStatus(poId, payload);
            showNotification(response.message, 'success');
            fetchPageData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendOrder = async () => {
        if (!window.confirm(`Weet u zeker dat u deze inkooporder wilt versturen naar ${purchaseOrder?.supplier.name}?`)) {
            return;
        }
        setIsSending(true);
        try {
            const response = await sendPurchaseOrder(poId);
            showNotification(response.message, 'success');
            fetchPageData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleViewReceipt = () => {
        navigateTo('purchase-order-receipt', poId);
    };

    const calculateTotal = () => {
        if (!purchaseOrder?.items) return { total: 0 };
        const total = purchaseOrder.items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
        return { total };
    };
    const { total } = calculateTotal();

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'RECEIVED': return 'badge-success';
            case 'ORDERED': return 'badge-info';
            case 'CANCELLED': return 'badge-error';
            case 'DRAFT': return 'badge-ghost';
            default: return 'badge-ghost';
        }
    };

    if (isLoading) return <div className="loading-text">Details van inkooporder laden...</div>;
    if (!purchaseOrder) return <div className="page-container"><h1 className="page-title">Inkooporder niet gevonden</h1></div>;

    return (
        <div className="page-container">
            {/* --- Header --- */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="page-title">Inkooporder #{purchaseOrder.poNumber}</h1>
                    <p className="page-subtitle">Besteld bij: <strong>{purchaseOrder.supplier.name}</strong> op {new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
                    <span className={`badge mt-2 ${getStatusBadgeClass(purchaseOrder.status)}`}>{purchaseOrder.status}</span>
                </div>
                <div>
                    <button onClick={() => navigateTo('purchase-order-management')} className="btn btn-ghost">← Terug naar overzicht</button>
                </div>
            </div>

            {/* --- Details --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Leverancier</h2>
                        <p><strong>{purchaseOrder.supplier.name}</strong></p>
                        <p>{purchaseOrder.supplier.address || ''}</p>
                        <p>{purchaseOrder.supplier.postcode} {purchaseOrder.supplier.city}</p>
                        <p className="mt-2"><strong>Contact:</strong> {purchaseOrder.supplier.contactPerson || '-'}</p>
                        <p><strong>E-mail:</strong> {purchaseOrder.supplier.email || '-'}</p>
                        <p><strong>Telefoon:</strong> {purchaseOrder.supplier.phone || '-'}</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Orderdetails</h2>
                        <p><strong>Orderdatum:</strong> {new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {purchaseOrder.status}</p>
                        <p><strong>Notities:</strong> {purchaseOrder.notes || 'Geen notities'}</p>
                    </div>
                </div>
                
                {/* --- Acties Kaart --- */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Acties</h2>
                        
                        {purchaseOrder.status === 'DRAFT' && (
                            <>
                                <button className="btn btn-success w-full" onClick={handleSendOrder} disabled={isSending}>
                                    {isSending ? 'Bezig...' : 'Verstuur naar Leverancier'}
                                </button>
                                <button className="btn btn-outline w-full mt-2" onClick={handleViewReceipt}>
                                    Bekijk Bon
                                </button>
                                <div className="divider">OF</div>
                            </>
                        )}

                        <div className="form-control w-full">
                            <label className="label"><span className="label-text">Wijzig status naar</span></label>
                            <select className="select select-bordered" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        
                        {selectedStatus === 'RECEIVED' && (
                            <div className="form-control w-full mt-2">
                                <label className="label"><span className="label-text">Boek in op locatie</span></label>
                                <select 
                                    className="select select-bordered"
                                    value={selectedLocationId}
                                    onChange={(e) => setSelectedLocationId(e.target.value)}
                                >
                                    <option value="" disabled>Kies een locatie...</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                        )}

                        <button className="btn btn-primary mt-4" onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === purchaseOrder.status}>
                            {isUpdating ? 'Bezig...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Orderregels --- */}
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <h2 className="card-title mb-4">Orderregels</h2>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            {/* --- ▼▼▼ HIER ZIT DE CORRECTIE ▼▼▼ --- */}
                            <thead>
                                <tr>
                                    <th>Materiaal</th>
                                    <th>Type</th>
                                    <th className="text-right">Aantal</th>
                                    <th className="text-right">Prijs p/st (€)</th>
                                    <th className="text-right">Subtotaal (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrder.items.map(item => (
                                    <tr key={item.id}>
                                        <td><strong>{item.material.name}</strong></td>
                                        <td><span className="badge badge-ghost">{item.material.type}</span></td>
                                        <td className="text-right">{item.quantity} {item.material.unit}</td>
                                        <td className="text-right">{item.purchasePrice.toFixed(2)}</td>
                                        <td className="text-right">{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-bold">
                                    <td colSpan="4" className="text-right">Totaal Excl. BTW</td>
                                    <td className="text-right">{total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                             {/* --- ▲▲▲ EINDE CORRECTIE ▲▲▲ --- */}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetail;