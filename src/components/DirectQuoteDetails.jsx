// src/components/DirectQuoteDetails.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDirectQuoteById, sendQuoteByEmail, getQuotePreview, acceptDirectQuote } from '../api';
import ImpositionVisualizer from './ImpositionVisualizer';
import StatusBadge from './StatusBadge';

const formatDate = (dateString) => {
    if (!dateString) return "Niet opgegeven";
    return new Date(dateString).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
};

const DetailRow = ({ label, value, subValue }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
        <dt className="text-sm text-gray-600">{label}</dt>
        <dd className="text-sm font-semibold text-gray-900 text-right">
            {value}
            {subValue && <span className="block text-xs text-gray-500 font-normal">{subValue}</span>}
        </dd>
    </div>
);

const DirectQuoteDetails = ({ showNotification }) => {
    const { id: quoteId } = useParams();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const fetchQuote = useCallback(async () => {
        if (!quoteId) return;
        setIsLoading(true);
        try {
            const data = await getDirectQuoteById(quoteId);
            setQuote(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [quoteId, showNotification]);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    const displayData = useMemo(() => {
        if (!quote) return null;
        const getParsedJson = (data) => { try { return typeof data === 'string' ? JSON.parse(data) : data || {}; } catch { return {}; } };
        const calculation = getParsedJson(quote.calculationResult);
        const line = calculation.lines?.[0] ?? {};
        const imposition = line.calculationDetails?.imposition ?? {};
        
        let steps = calculation.lines?.flatMap(l => l.calculationDetails?.steps) ?? [];
        if (quote.shippingCost && Number(quote.shippingCost) > 0) {
            steps.push({
                type: "VERZENDING",
                description: "Verzendkosten",
                specs: quote.shippingPartner?.name || 'Onbekende vervoerder',
                cost: Number(quote.shippingCost)
            });
        }

        const dimensions = line.length_mm ? `${line.length_mm}x${line.width_mm}x${line.height_mm} mm` : (line.width_mm && line.height_mm ? `${line.width_mm}x${line.height_mm} mm` : 'N/A');
        let uitslagLabel = 'Benodigde vellen';
        let uitslagValue = 'N/A';
        if (imposition.sheets) {
            uitslagValue = `${imposition.sheets} vellen`;
        } else if (imposition.material?.type === 'ROLL') {
            uitslagLabel = 'Benodigde rol';
            const match = imposition.specs?.match(/\(([^)]+)m\)/);
            uitslagValue = match ? `${match[1]} strekkende meters` : 'N/A';
        }
        return {
            quoteNumber: quote.quoteNumber,
            status: quote.status,
            customer: quote.customerCompany || quote.customerName || 'N/A',
            creatorName: quote.creator?.name || 'Onbekend',
            finalPrice: quote.price ?? 0,
            rejectionReason: quote.rejectionReason,
            specificaties: { quantity: `${line.quantity || 'N/A'} stuks`, dimensions: dimensions, materialName: imposition.material?.name || 'N/A', levertijd: formatDate(quote.deliveryTime) },
            uitslag: { label: uitslagLabel, value: uitslagValue, perSheet: imposition.up ?? 'N/A', specs: imposition.specs || "Niet berekend", imposition, material: imposition.material ?? {} },
            prijsopbouw: { steps },
        };
    }, [quote]);

    const handleSendEmail = async () => {
        setIsSending(true);
        try {
            await sendQuoteByEmail(quote.id, recipientEmail);
            showNotification('Offerte succesvol verzonden!', 'success');
            setIsModalOpen(false);
            fetchQuote(); 
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSending(false);
        }
    };
    
    const handlePreviewPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdfBlob = await getQuotePreview(quote.id);
            const file = new Blob([pdfBlob], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (error) {
            showNotification(error.message || 'Kon PDF niet genereren.', 'error');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleAcceptAndCreateOrder = async () => {
        setIsCreatingOrder(true);
        try {
            const newOrder = await acceptDirectQuote(quote.id);
            showNotification(`Order ${newOrder.orderNumber} succesvol aangemaakt!`, 'success');
            fetchQuote();
        } catch (error) {
            showNotification(error.message || 'Kon order niet aanmaken.', 'error');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const renderActionButtons = () => {
        const { status } = displayData || {};
    
        switch (status) {
            case 'DRAFT':
                return (
                    <>
                        <button onClick={handlePreviewPdf} className="btn btn-outline" disabled={isGeneratingPdf}>{isGeneratingPdf ? 'Genereren...' : 'Snelle PDF Preview'}</button>
                        <button onClick={() => navigate(`/generate-document/QUOTE_${quote.id}`)} className="btn btn-accent">Genereer Document</button>
                        <button onClick={() => { setRecipientEmail(quote.customerEmail || ''); setIsModalOpen(true); }} className="btn btn-primary">Verstuur Offerte per E-mail</button>
                    </>
                );
            case 'SENT':
            case 'ACCEPTED':
                 return (
                    <>
                        <button onClick={handlePreviewPdf} className="btn btn-outline" disabled={isGeneratingPdf}>{isGeneratingPdf ? 'Genereren...' : 'Snelle PDF Preview'}</button>
                        <button onClick={() => navigate(`/generate-document/QUOTE_${quote.id}`)} className="btn btn-accent">Genereer Document</button>
                        <button onClick={handleAcceptAndCreateOrder} className="btn btn-success" disabled={isCreatingOrder}>{isCreatingOrder ? 'Verwerken...' : 'Order Aanmaken'}</button>
                    </>
                );
            case 'ORDER_CREATED':
                return <p className="text-success font-semibold">✓ Order is succesvol aangemaakt op basis van deze offerte.</p>;
            case 'DECLINED':
                 return <p className="text-error font-semibold">Offerte is afgewezen door de klant.</p>;
            default:
                return null;
        }
    };

    if (isLoading) return <div className="p-10 text-center">Offerte details laden...</div>;
    if (!displayData) return <div className="p-10 text-center">Kon offerte-data niet verwerken.</div>;

    const { quoteNumber, customer, finalPrice, specificaties, uitslag, prijsopbouw, creatorName, status, rejectionReason } = displayData;

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-start bg-white p-4 rounded-xl shadow-md">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Offerte {quoteNumber} <StatusBadge status={status} /></h1>
                    <p className="text-gray-600 mt-1">Voor: {customer}</p>
                    <p className="text-sm text-gray-500 mt-2">Gemaakt door: <span className="font-medium">{creatorName}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-medium text-gray-500">Totaalprijs</p>
                    <p className="text-4xl font-extrabold text-primary">€ {Number(finalPrice).toFixed(2)}</p>
                </div>
            </div>

            {status === 'DECLINED' && rejectionReason && ( <div role="alert" className="alert alert-warning"> <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> <div><h3 className="font-bold">Reden van Afwijzing</h3><div className="text-xs">{rejectionReason}</div></div> </div> )}
            
            <div className="card bg-white shadow-md">
                <div className="card-body flex-row justify-center items-center gap-4">
                    {renderActionButtons()}
                </div>
            </div>
            
            {isModalOpen && (<div className="modal modal-open"><div className="modal-box"><h3 className="font-bold text-lg">Offerte versturen</h3><p className="py-4">De offerte wordt verzonden naar het onderstaande e-mailadres.</p><div className="form-control"><input type="email" placeholder="E-mailadres ontvanger" className="input input-bordered w-full" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div><div className="modal-action"><button className="btn btn-ghost" onClick={() => setIsModalOpen(false)} disabled={isSending}>Annuleren</button><button className="btn btn-primary" onClick={handleSendEmail} disabled={isSending}>{isSending ? 'Verzenden...' : 'Verstuur'}</button></div></div></div>)}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-6"><div className="card bg-white shadow-md"><div className="card-body"><h2 className="card-title">Specificaties</h2><dl><DetailRow label="Aantal" value={specificaties.quantity} /><DetailRow label="Formaat" value={specificaties.dimensions} /><DetailRow label="Materiaal" value={specificaties.materialName} /><DetailRow label="Levertijd" value={specificaties.levertijd} /></dl></div></div><div className="card bg-white shadow-md"><div className="card-body"><h2 className="card-title">Uitslag Details</h2><dl><DetailRow label={uitslag.label} value={uitslag.value} /><DetailRow label="Producten per vel/uitslag" value={`${uitslag.perSheet} stuks`} /><DetailRow label="Technische uitslag" value={uitslag.specs} /></dl><div className="mt-4 bg-gray-50 p-2 rounded">{(uitslag.imposition && (uitslag.material.sheetWidth_mm || uitslag.material.rollWidth_mm)) ? (<ImpositionVisualizer imposition={uitslag.imposition} material={uitslag.material} />) : (<p className="text-center text-gray-500 text-sm">Geen visualisatie beschikbaar.</p>)}</div></div></div></div>
                <div className="card bg-white shadow-md"><div className="card-body"><h2 className="card-title">Prijsopbouw</h2><ul className="space-y-1 mt-4 max-h-[26rem] overflow-y-auto pr-2">{prijsopbouw.steps.map((step, index) => (<li key={index} className="flex justify-between items-start text-sm p-2 bg-gray-50 rounded-md"><div><p className="font-medium">{step.description}</p><p className="text-xs text-gray-500">{step.specs}</p></div><span className="font-bold whitespace-nowrap pl-4">€ {Number(step.cost || 0).toFixed(2)}</span></li>))}</ul></div></div>
            </div>
            <div className="text-center pt-4"><button onClick={() => navigate(-1)} className="btn btn-ghost">← Terug</button></div>
        </div>
    );
};

export default DirectQuoteDetails;