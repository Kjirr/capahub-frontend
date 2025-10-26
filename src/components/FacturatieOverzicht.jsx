import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// --- START WIJZIGING: reopenInvoice toegevoegd ---
import { getInvoices, getInvoicePdf, sendInvoiceByEmail, reopenInvoice } from '../api';
// --- EINDE WIJZIGING ---
import StatusBadge from './StatusBadge'; // Aanname dat deze component bestaat

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('nl-NL', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    // Zorg ervoor dat amount een nummer is of null/undefined
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        // console.warn("formatCurrency called with non-numeric value:", amount);
        // Geef een fallback waarde terug of een indicatie dat het ongeldig is
        return '€ Ongeldig';
    }
    return `€ ${numAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


const InvoiceStatusBadge = ({ status, sendCount }) => {
    const statusInfo = {
        DRAFT: { text: 'Concept', color: 'bg-gray-200 text-gray-800' },
        SENT: { text: 'Verzonden', color: 'bg-blue-200 text-blue-800' },
        PAID: { text: 'Betaald', color: 'bg-green-200 text-green-800' },
        VOID: { text: 'Geannuleerd', color: 'bg-red-200 text-red-800' },
    }[status] || { text: status, color: 'bg-gray-200 text-gray-800' };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
            {/* Toon alleen sendCount als status SENT is én sendCount groter dan 0 */}
            {status === 'SENT' && sendCount > 0 && ` (${sendCount}x)`}
        </span>
    );
};


const FacturatieOverzicht = ({ showNotification }) => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(null);
    const [isSending, setIsSending] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [recipientEmail, setRecipientEmail] = useState('');
    // --- START WIJZIGING: isReopening state toegevoegd ---
    const [isReopening, setIsReopening] = useState(null); // Voor laadstatus "Heropen"
    // --- EINDE WIJZIGING ---

    const fetchInvoices = useCallback(async () => {
        setLoading(true); setError('');
        try { const data = await getInvoices(); setInvoices(data); }
        catch (err) { setError('Kon facturen niet laden.'); showNotification(err.response?.data?.error || 'Laden mislukt', 'error'); }
        finally { setLoading(false); }
    }, [showNotification]);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const handleDownloadPdf = async (invoiceId) => {
        if (isDownloading === invoiceId) return; setIsDownloading(invoiceId);
        try { const blob = await getInvoicePdf(invoiceId); const fileURL = URL.createObjectURL(blob); window.open(fileURL, '_blank'); URL.revokeObjectURL(fileURL); }
        catch (error) { console.error("Kon PDF niet ophalen", error); showNotification(error.response?.data?.error || 'Kon de PDF niet genereren', 'error'); }
        finally { setIsDownloading(null); }
    };

    const handleOpenSendModal = (invoice) => {
        const email = invoice.order?.originalQuote?.customerEmail || '';
        setCurrentInvoice(invoice); setRecipientEmail(email); setShowSendModal(true);
    };

    const handleCloseSendModal = () => { setShowSendModal(false); setCurrentInvoice(null); setRecipientEmail(''); };

    const handleSendEmail = async () => {
        if (!currentInvoice || !recipientEmail) return; setIsSending(currentInvoice.id);
        try { await sendInvoiceByEmail(currentInvoice.id, recipientEmail); showNotification('Factuur succesvol verzonden (simulatie)!', 'success'); handleCloseSendModal(); fetchInvoices(); }
        catch (err) { console.error("Kon factuur niet verzenden", err); showNotification(err.response?.data?.error || 'Verzenden mislukt', 'error'); }
        finally { setIsSending(null); }
    };

    // --- START WIJZIGING: handleReopenInvoice functie toegevoegd ---
    const handleReopenInvoice = async (invoiceId) => {
        if (isReopening === invoiceId) return; // Voorkom dubbelklikken
        // Vraag bevestiging
        if (!window.confirm("Weet je zeker dat je deze verzonden factuur wilt heropenen? De status wordt teruggezet naar Concept.")) {
            return;
        }
        setIsReopening(invoiceId);
        try {
            await reopenInvoice(invoiceId);
            showNotification('Factuur succesvol heropend!', 'success');
            fetchInvoices(); // Herlaad de lijst om de nieuwe status te tonen
        } catch (err) {
            console.error("Kon factuur niet heropenen", err);
            showNotification(err.response?.data?.error || 'Heropenen mislukt', 'error');
        } finally {
            setIsReopening(null);
        }
    };
    // --- EINDE WIJZIGING ---


    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Facturatie Overzicht</h1>
                <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">&larr; Terug naar Dashboard</button>
            </div>
            {loading && <p>Facturen laden...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-0">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Factuurnr.</th><th>Ordernr.</th><th>Klant</th><th>Bedrag</th><th>Status</th><th>Datum</th><th>Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 && (<tr><td colSpan="7" className="text-center italic text-gray-500 py-4">Nog geen facturen aangemaakt.</td></tr>)}
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover">
                                            <td className="font-medium">{invoice.invoiceNumber}</td>
                                            <td>{invoice.order?.orderNumber || '-'}</td>
                                            <td>{invoice.order?.customerCompany || invoice.order?.customerName || '-'}</td>
                                            <td>{formatCurrency(invoice.amount)}</td>
                                            <td><InvoiceStatusBadge status={invoice.status} sendCount={invoice.sendCount} /></td>
                                            <td>{formatDate(invoice.createdAt)}</td>
                                            <td>
                                                <button className="btn btn-xs btn-ghost text-blue-600" onClick={() => handleDownloadPdf(invoice.id)} disabled={isDownloading === invoice.id} title="Bekijk PDF">
                                                    {isDownloading === invoice.id ? 'Laden...' : 'Bekijk PDF'}
                                                </button>
                                                <button className="btn btn-xs btn-ghost" onClick={() => navigate(`/order-details/${invoice.orderId}`)} title="Bekijk Order">Order</button>
                                                {/* Toon altijd 'Verstuur' of 'Opnieuw versturen' knop, behalve als status PAID of VOID is */}
                                                {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                                                    <button className="btn btn-xs btn-ghost text-green-600" onClick={() => handleOpenSendModal(invoice)} disabled={isSending === invoice.id} title="Verstuur Factuur">
                                                        {isSending === invoice.id ? '...' : (invoice.status === 'SENT' ? 'Opnieuw versturen' : 'Verstuur')}
                                                    </button>
                                                )}
                                                {/* --- START WIJZIGING: "Heropen" knop toegevoegd --- */}
                                                {invoice.status === 'SENT' && (
                                                    <button
                                                        className="btn btn-xs btn-ghost text-orange-600"
                                                        onClick={() => handleReopenInvoice(invoice.id)}
                                                        disabled={isReopening === invoice.id}
                                                        title="Heropen factuur (zet status naar Concept)"
                                                    >
                                                        {isReopening === invoice.id ? '...' : 'Heropen'}
                                                    </button>
                                                )}
                                                {/* --- EINDE WIJZIGING --- */}
                                                {/* Voeg hier later knoppen toe voor 'Markeer als Betaald' of 'Annuleer' */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal voor versturen */}
            {showSendModal && currentInvoice && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Factuur Versturen: {currentInvoice.invoiceNumber}</h3>
                        <p className="py-4">De factuur wordt per e-mail verstuurd met een link naar de online versie (simulatie).</p>
                        <div className="form-control w-full">
                            <label className="label"><span className="label-text">E-mailadres ontvanger</span></label>
                            <input type="email" placeholder="Email" className="input input-bordered w-full" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                        </div>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={handleCloseSendModal} disabled={isSending === currentInvoice.id}>Annuleren</button>
                            <button className="btn btn-primary" onClick={handleSendEmail} disabled={isSending === currentInvoice.id || !recipientEmail}>
                                {isSending === currentInvoice.id ? <span className="loading loading-spinner"></span> : 'Versturen'}
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop"><button onClick={handleCloseSendModal}>close</button></form>
                </div>
            )}
        </div>
    );
};

export default FacturatieOverzicht;