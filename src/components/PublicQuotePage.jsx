import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicQuoteByToken, acceptPublicQuote, declinePublicQuote } from '../api';

const StatusDisplay = ({ status }) => {
    const statusInfo = {
        'ACCEPTED':      { text: 'Geaccepteerd', color: 'bg-green-100 text-green-800' },
        'ORDER_CREATED': { text: 'Geaccepteerd', color: 'bg-green-100 text-green-800' },
        'DECLINED':      { text: 'Afgewezen',    color: 'bg-red-100 text-red-800' },
    };
    const info = statusInfo[status] || { text: status, color: 'bg-gray-100 text-gray-800' };

    return (
        <div className={`text-center p-4 mt-6 rounded-lg ${info.color}`}>
            <h3 className="font-bold text-lg">Status: {info.text}</h3>
            {(status === 'ACCEPTED' || status === 'ORDER_CREATED') && <p>Bedankt voor je vertrouwen! We nemen contact met je op om de order te bevestigen.</p>}
            {status === 'DECLINED' && <p>Bedankt voor je reactie. Je kunt dit venster sluiten.</p>}
        </div>
    );
};

const PublicQuotePage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchQuote = async () => {
            if (!token) {
                setError('Geen offerte-token gevonden in de link.');
                setLoading(false);
                return;
            }
            try {
                // Let op: axios wikkelt de response in een .data object
                const response = await getPublicQuoteByToken(token);
                setQuote(response.data);
            } catch (err) {
                const errorMessage = err.response?.status === 410 
                    ? 'Deze offerte is niet meer geldig (al verwerkt of verlopen).'
                    : 'Deze offerte is niet gevonden of de link is ongeldig.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [token]);

    // --- START WIJZIGING: De acceptatie-logica is volledig herschreven ---
    const handleAccept = async () => {
        setIsProcessing(true);
        setError(''); // Reset eventuele eerdere fouten
        try {
            // Stap 1: Roep de backend aan om de order aan te maken en de status te updaten.
            await acceptPublicQuote(token);
            
            // Stap 2: Stuur de gebruiker pas NA een succesvolle aanroep door naar de upload-pagina.
            navigate(`/quote-accepted/${token}`);

        } catch (err) {
            const serverError = err.response?.data?.error || 'Er is een onbekende fout opgetreden.';
            setError(`Kon de offerte niet accepteren: ${serverError} Probeer de pagina te vernieuwen.`);
        } finally {
            setIsProcessing(false);
        }
    };
    // --- EINDE WIJZIGING ---
    
    const handleDeclineSubmit = async () => {
        setIsProcessing(true);
        setError('');
        try {
            await declinePublicQuote(token, rejectionReason);
            setQuote(prev => ({ ...prev, status: 'DECLINED' }));
            setIsDeclineModalOpen(false);
        } catch (err) {
            setError('Er is iets misgegaan bij het afwijzen. Probeer het later opnieuw.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-50"><p className="text-lg">Offerte laden...</p></div>;
    }

    if (error && !isDeclineModalOpen) { // Toon de algemene error niet als de modal open is
        return <div className="flex items-center justify-center min-h-screen bg-gray-50"><p className="text-lg text-red-600">{error}</p></div>;
    }

    if (!quote) return null;

    const calculation = typeof quote.calculationResult === 'string' ? JSON.parse(quote.calculationResult) : (quote.calculationResult || {});
    const hasBeenActioned = ['ACCEPTED', 'DECLINED', 'ORDER_CREATED'].includes(quote.status);
    
    const subtotal = Number(calculation.grandTotals?.subtotal || calculation.grandTotals?.total || 0);
    const shipping = Number(calculation.grandTotals?.shipping || 0);
    const totalExVat = subtotal + shipping;
    const vat = totalExVat * 0.21;
    const finalPrice = totalExVat + vat;

    const company = quote.company || {};

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden my-8">
                <header className="bg-gray-800 text-white p-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{company.name}</h1>
                        <div className="text-sm text-gray-300 mt-2">
                            {company.adres && <p>{company.adres}</p>}
                            {(company.postcode || company.plaats) && <p>{company.postcode} {company.plaats}</p>}
                        </div>
                    </div>
                    {company.logoUrl && <img src={company.logoUrl} alt="Bedrijfslogo" className="max-h-16 ml-4"/>}
                </header>

                <main className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-800">Offerte {quote.quoteNumber}</h2>
                            <p className="text-gray-500">Datum: {new Date(quote.createdAt).toLocaleDateString('nl-NL')}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">T.a.v.</p>
                            <p>{quote.customerName || quote.customerCompany}</p>
                        </div>
                    </div>

                    {quote.comments && (
                        <div className="prose prose-sm max-w-none p-4 bg-blue-50 border border-blue-200 rounded-lg">
                           <p className="italic">"{quote.comments}"</p>
                        </div>
                    )}

                    <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
                        {calculation?.lines?.map((line, index) => {
                             const linePrice = Number(line.pricing?.total || line.totalCost || 0);
                             const templateName = line.resolved?.template?.name || 'Product';
                             const quantity = line.quantity;
                             const steps = line.calculationDetails?.steps?.filter(s => s.type !== 'MARGE') || [];

                             return (
                                <div key={index} className="py-4">
                                    <div className="flex justify-between items-start font-semibold">
                                        <p className="text-gray-800">{quantity}x {templateName}</p>
                                        <p className="text-lg whitespace-nowrap pl-4">€ {linePrice.toFixed(2)}</p>
                                    </div>
                                    {steps.length > 0 && (
                                        <ul className="mt-2 pl-4 space-y-1">
                                            {steps.map((step, stepIndex) => (
                                                <li key={stepIndex} className="text-xs text-gray-500">
                                                    <span className="font-medium text-gray-600">{step.description}:</span> {step.specs}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotaal</span><span className="font-semibold">€ {subtotal.toFixed(2)}</span></div>
                            {shipping > 0 && <div className="flex justify-between"><span className="text-gray-600">Verzendkosten</span><span className="font-semibold">€ {shipping.toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-600">BTW (21%)</span><span className="font-semibold">€ {vat.toFixed(2)}</span></div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2"><span>TOTAAL</span><span>€ {finalPrice.toFixed(2)}</span></div>
                        </div>
                    </div>
                    
                    {hasBeenActioned ? (
                        <StatusDisplay status={quote.status} />
                    ) : (
                        <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-center gap-4 mt-6">
                            <p className="font-semibold">Ben je akkoord met deze offerte?</p>
                            <button onClick={handleAccept} disabled={isProcessing} className="btn btn-success">{isProcessing ? 'Verwerken...' : 'Ja, Accepteren'}</button>
                            <button onClick={() => setIsDeclineModalOpen(true)} disabled={isProcessing} className="btn btn-error">Nee, Afwijzen</button>
                        </div>
                    )}
                </main>

                <footer className="border-t border-gray-200 bg-gray-50 p-6 text-center text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">{company.name}</p>
                    {company.telefoon && <p>Telefoon: {company.telefoon}</p>}
                    {company.kvk && <p>KvK-nummer: {company.kvk}</p>}
                    <p className="mt-2">Vragen over deze offerte? Neem gerust contact met ons op.</p>
                </footer>
            </div>

            {isDeclineModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Offerte Afwijzen</h3>
                        <p className="py-4">We stellen je feedback zeer op prijs. Kun je kort aangeven waarom je de offerte afwijst? (optioneel)</p>
                        <textarea className="textarea textarea-bordered w-full" rows="4" placeholder="bv. te duur, levertijd te lang, elders besteld..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}></textarea>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setIsDeclineModalOpen(false)} disabled={isProcessing}>Annuleren</button>
                            <button className="btn btn-primary" onClick={handleDeclineSubmit} disabled={isProcessing}>{isProcessing ? 'Verwerken...' : 'Afwijzing Versturen'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicQuotePage;