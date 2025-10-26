import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, deleteOrder, apiRequest, getTemplates, createInvoiceForOrder } from '../api'; // createInvoiceForOrder toegevoegd
import StatusBadge from './StatusBadge';
import OrderFilesManager from './OrderFilesManager';

const formatDate = (dateString) => {
    if (!dateString) return "Nog niet gepland";
    return new Date(dateString).toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
        <dt className="text-sm text-gray-600">{label}</dt>
        <dd className="font-semibold text-gray-900 text-right">{value}</dd>
    </div>
);

const OrderDetails = ({ showNotification }) => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDownloading, setIsDownloading] = useState({});
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false); // <-- NIEUW

    const fetchData = useCallback(async () => {
        if (!orderId) {
            setError('Geen order ID gevonden.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Pas getOrderById aan om ook invoice op te halen
            const [orderData, templatesData] = await Promise.all([
                apiRequest('GET', `/api/orders/${orderId}?includeInvoice=true`), // Vraag expliciet om invoice data
                getTemplates()
            ]);
            setOrder(orderData);
            setTemplates(templatesData);
        } catch (err) {
            setError('Data kon niet worden geladen.');
            showNotification(err.message || 'Fout bij laden', 'error');
        } finally {
            setLoading(false);
        }
    }, [orderId, showNotification]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const productionData = useMemo(() => {
        if (!order?.productionDetails) return null;
        const calculation = order.productionDetails;
        const line = calculation.lines?.[0] ?? {};
        const imposition = line.calculationDetails?.imposition ?? {};
        const specs = {
            quantity: `${line.quantity || 'N/A'} stuks`,
            dimensions: line.length_mm ? `${line.length_mm}x${line.width_mm}x${line.height_mm} mm` : `${line.width_mm || 'N/A'}x${line.height_mm || 'N/A'} mm`,
            materialName: imposition.material?.name || 'N/A'
        };
        const productionSteps = line.calculationDetails?.steps ?? [];
        return { specs, productionSteps };
    }, [order]);

    const handleStatusChange = async (newStatus) => {
        const confirmText = {
            ON_HOLD: 'Weet je zeker dat je deze order wilt pauzeren?',
            PLANNED: 'Weet je zeker dat je deze order wilt hervatten?',
            CANCELLED: 'LET OP: Weet je zeker dat je deze order wilt annuleren?',
            ARCHIVED: 'Weet je zeker dat je deze order wilt archiveren?'
        };
        if (confirmText[newStatus] && !window.confirm(confirmText[newStatus])) {
            return;
        }
        setIsUpdatingStatus(true);
        try {
            await updateOrderStatus(order.id, newStatus);
            showNotification(`Orderstatus succesvol gewijzigd naar ${newStatus}`, 'success');
            fetchData();
        } catch (error) {
            showNotification(error.message || 'Status wijzigen mislukt', 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (window.confirm(`LET OP: Weet je zeker dat je order ${order.orderNumber} permanent wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`)) {
            setIsUpdatingStatus(true); // Gebruik dezelfde loading state
            try {
                await deleteOrder(order.id);
                showNotification(`Order ${order.orderNumber} is verwijderd.`, 'success');
                navigate('/orders-list');
            } catch (error) {
                showNotification(error.message || 'Verwijderen mislukt', 'error');
                setIsUpdatingStatus(false);
            }
        }
    };
    
    // --- START NIEUWE FUNCTIE ---
    const handleCreateInvoice = async () => {
        if (!window.confirm(`Weet je zeker dat je een factuur wilt aanmaken voor order ${order.orderNumber}?`)) {
            return;
        }
        setIsCreatingInvoice(true);
        try {
            const newInvoice = await createInvoiceForOrder(order.id);
            showNotification(`Factuur ${newInvoice.invoiceNumber} succesvol aangemaakt!`, 'success');
            // Herlaad de order data om de nieuwe factuurstatus te zien
            fetchData();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Kon factuur niet aanmaken', 'error');
        } finally {
            setIsCreatingInvoice(false);
        }
    };
    // --- EINDE NIEUWE FUNCTIE ---

    const handleGenerateDocument = async (docType, templateId = null) => {
        const docTypeSlug = docType.toLowerCase().replace('_', '-');
        let endpoint = `/api/document-templates/generate/${docTypeSlug}/${order.id}`;
        if (templateId) {
            endpoint += `/${templateId}`;
        }
        
        const downloadKey = templateId || `default_${docType}`;
        setIsDownloading(prev => ({ ...prev, [downloadKey]: true }));
        try {
            const pdfBlob = await apiRequest('GET', endpoint, null, {}, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            window.open(url);
        } catch (error) {
            let errorMessage = "Fout bij genereren document.";
            if (error.response?.data instanceof Blob) {
                try {
                    const errorJson = JSON.parse(await error.response.data.text());
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) { /* negeer */ }
            } else if(error.message) {
                errorMessage = error.message;
            }
            showNotification(errorMessage, 'error');
        } finally {
            setIsDownloading(prev => ({ ...prev, [downloadKey]: false }));
        }
    };
    
    const DocumentMenu = ({ docType, title }) => {
        const relevantTemplates = templates.filter(t => t.type === docType);
        const defaultTemplate = relevantTemplates.find(t => t.isDefault);

        if (relevantTemplates.length === 0) {
            return (
                <li>
                    <a onClick={() => showNotification(`Maak eerst een template van het type '${docType}' aan.`, 'info')}>
                        {title}
                    </a>
                </li>
            );
        }

        if (relevantTemplates.length === 1) {
            const singleTemplate = relevantTemplates[0];
            return (
                <li>
                    <a onClick={() => handleGenerateDocument(docType, singleTemplate.id)} disabled={isDownloading[singleTemplate.id]}>
                         {isDownloading[singleTemplate.id] ? 'Genereren...' : title}
                    </a>
                </li>
            );
        }

        return (
            <li tabIndex={0}>
                <a>{title} <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg></a>
                <ul className="p-2 bg-base-200 z-50 max-h-60 overflow-y-auto">
                    {defaultTemplate && (
                        <li>
                            <a onClick={() => handleGenerateDocument(docType, defaultTemplate.id)} disabled={isDownloading[defaultTemplate.id]}>
                                {isDownloading[defaultTemplate.id] ? 'Genereren...' : `${defaultTemplate.name} (Default)`}
                            </a>
                        </li>
                    )}
                    {relevantTemplates.filter(t => !t.isDefault).map(template => (
                         <li key={template.id}>
                            <a onClick={() => handleGenerateDocument(docType, template.id)} disabled={isDownloading[template.id]}>
                                {isDownloading[template.id] ? 'Genereren...' : template.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </li>
        );
    };

    if (loading) return <div className="text-center p-10">Data laden...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!order) return <div className="text-center p-10">Geen orderdata.</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-md mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Order {order.orderNumber}</h1>
                    <p className="text-gray-600 mt-1">Klant: {order.customerCompany || order.customerName}</p>
                    <div className="mt-2">
                        <StatusBadge status={order.status} />
                    </div>
                    {/* --- START AANGEPASTE SECTIE: Factuur knop/info --- */}
                    {(order.status === 'COMPLETED' || order.status === 'SHIPPED') && !order.invoice && (
                        <button
                            className={`btn btn-sm btn-accent mt-4 ${isCreatingInvoice ? 'loading' : ''}`}
                            onClick={handleCreateInvoice}
                            disabled={isCreatingInvoice || isUpdatingStatus} // Disable ook bij status update
                        >
                            Maak Factuur
                        </button>
                    )}
                    {/* Toon info als er WEL een factuur is (controleer of invoice bestaat) */}
                    {order.invoice && (
                         <p className="text-sm text-success mt-4 font-medium">Factuur: {order.invoice.invoiceNumber} ({order.invoice.status})</p>
                    )}
                     {/* --- EINDE AANGEPASTE SECTIE --- */}
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-right">
                        <p className="text-lg font-medium text-gray-500">Totaalprijs</p>
                        <p className="text-4xl font-extrabold text-primary">€ {Number(order.totalPrice).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle" disabled={isUpdatingStatus}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 z-50">
                            <li>
                                <details>
                                    <summary>Documenten</summary>
                                    <ul>
                                        <DocumentMenu docType="WORK_TICKET" title="Print Werkbon" />
                                        <DocumentMenu docType="PALLET_CARD" title="Print Palletkaart" />
                                        <DocumentMenu docType="OUTSOURCING_TICKET" title="Print Bon Uitbesteding" />
                                    </ul>
                                </details>
                            </li>
                            <li>
                                <details>
                                    <summary>Acties</summary>
                                    <ul>
                                        { (order.status === 'PLANNED' || order.status === 'IN_PRODUCTION') && (<li><a onClick={() => handleStatusChange('ON_HOLD')}>Pauzeer Order</a></li>)}
                                        { order.status === 'ON_HOLD' && (<li><a onClick={() => handleStatusChange('PLANNED')}>Hervat Order</a></li>)}
                                        { (order.status !== 'COMPLETED' && order.status !== 'SHIPPED' && order.status !== 'CANCELLED' && order.status !== 'ARCHIVED') && (<li><a onClick={() => handleStatusChange('CANCELLED')}>Annuleer Order</a></li>)}
                                        { (order.status === 'COMPLETED' || order.status === 'CANCELLED') && (<li><a onClick={() => handleStatusChange('ARCHIVED')}>Archiveer Order</a></li>)}
                                        <div className="divider my-1"></div>
                                        <li><a className="text-error" onClick={handleDeleteOrder}>Verwijder Order</a></li>
                                    </ul>
                                </details>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Orderinformatie</h2>
                            <dl className="space-y-1 text-sm">
                                <DetailRow label="Originele Offerte" value={order.originalQuote?.quoteNumber || 'N/A'} />
                                <DetailRow label="Aanmaakdatum" value={formatDate(order.createdAt)} />
                            </dl>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Planning</h2>
                            <dl className="space-y-1 text-sm">
                                <DetailRow label="Verzenddatum" value={formatDate(order.verzenddatum)} />
                                <DetailRow label="Uiterste Leverdatum" value={formatDate(order.verzenddatum)} /> {/* LET OP: Gebruik je leverdatum of verzenddatum hier? */}
                            </dl>
                        </div>
                    </div>
                    {productionData && (
                         <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title">Specificaties</h2>
                                <dl>
                                    <DetailRow label="Aantal" value={productionData.specs.quantity} />
                                    <DetailRow label="Formaat" value={productionData.specs.dimensions} />
                                    <DetailRow label="Materiaal" value={productionData.specs.materialName} />
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    <OrderFilesManager 
                        order={order} 
                        onUploadSuccess={fetchData} 
                        showNotification={showNotification} 
                    />
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Productie Stappenplan (Calculatie)</h2>
                            <ul className="space-y-1 mt-4 max-h-[36rem] overflow-y-auto pr-2">
                                {productionData?.productionSteps.length > 0 ? productionData.productionSteps.map((step, index) => (
                                    <li key={index} className="flex justify-between items-start text-sm p-3 bg-gray-50 rounded-md">
                                        <div>
                                            <p className="font-medium">{step.description}</p>
                                            <p className="text-xs text-gray-500">{step.specs}</p> {/* Zorg dat 'specs' bestaat */}
                                        </div>
                                    </li>
                                )) : (
                                    <li className="text-center italic text-gray-500 py-4">Geen stappenplan gevonden in calculatie.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
             <div className="text-center pt-6">
                <button onClick={() => navigate('/orders-list')} className="btn btn-ghost">← Terug naar orderoverzicht</button>
            </div>
        </div>
    );
};

export default OrderDetails;