import React, { useState, useEffect, useCallback, useMemo } from 'react';
// --- START WIJZIGING: Importeer de navigate hook ---
import { useNavigate } from 'react-router-dom';
import { getDirectQuotes } from '@/api';
import StatusBadge from './StatusBadge';
// --- EINDE WIJZIGING ---

const FeedbackIcon = () => (
    <div className="tooltip tooltip-right" data-tip="Bevat feedback van de klant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.933 8.933 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 11.472a.75.75 0 00-.016 1.062l.016.016a.75.75 0 001.062 0l1.172-1.172a.75.75 0 00-1.062-1.062l-1.172 1.172zm3.062-3.062a.75.75 0 00-1.062 0l-1.172 1.172a.75.75 0 001.062 1.062l1.172-1.172a.75.75 0 000-1.062zm3.53.001a.75.75 0 00-1.062 0l-1.172 1.172a.75.75 0 101.062 1.062l1.172-1.172a.75.75 0 000-1.062z" clipRule="evenodd" />
        </svg>
    </div>
);

// --- START WIJZIGING: 'navigateTo' als prop verwijderd ---
const DirectQuotesList = ({ showNotification }) => {
    // Haal de navigate functie direct op uit de hook
    const navigate = useNavigate();
    // --- EINDE WIJZIGING ---

    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchQuotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getDirectQuotes();
            setQuotes(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    const filteredQuotes = useMemo(() => {
        let filtered = [...quotes];
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(quote => 
                quote.quoteNumber?.toLowerCase().includes(lowercasedTerm) ||
                quote.customerName?.toLowerCase().includes(lowercasedTerm) ||
                quote.customerCompany?.toLowerCase().includes(lowercasedTerm)
            );
        }
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(quote => new Date(quote.createdAt) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(quote => new Date(quote.createdAt) <= end);
        }
        return filtered;
    }, [quotes, searchTerm, startDate, endDate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N.v.t.';
        return new Date(dateString).toLocaleDateString('nl-NL');
    };

    if (isLoading) {
        return <div className="loading-text">Offertes laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Mijn Directe Offertes</h1>
                    <p className="page-subtitle">Een overzicht van alle offertes die u buiten de marktplaats om heeft gemaakt.</p>
                </div>
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-primary m-1">Nieuwe Offerte Maken</label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        {/* --- START WIJZIGING: Gebruik 'navigate' met de volledige URL --- */}
                        <li><a onClick={() => navigate('/create-direct-quote')}>Nieuwe Offerte (Standaard)</a></li>
                        {/* --- EINDE WIJZIGING --- */}
                    </ul>
                </div>
            </div>

            <div className="card bg-base-100 shadow-lg mb-6">
                <div className="card-body p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text">Zoek op nr/klant</span></label>
                            <input 
                                type="text" 
                                placeholder="Typ om te zoeken..." 
                                className="input input-bordered"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                         <div className="form-control">
                            <label className="label py-1"><span className="label-text">Vanaf Datum</span></label>
                            <input 
                                type="date"
                                className="input input-bordered"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text">Tot Datum</span></label>
                            <input 
                                type="date"
                                className="input input-bordered"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Offertenummer</th>
                                    <th>Klant</th>
                                    <th>Inhoud</th>
                                    <th>Bedrag</th>
                                    <th>Datum</th>
                                    <th>Gemaakt door</th>
                                    <th>Status</th>
                                    <th className="text-right">Acties</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuotes.length > 0 ? filteredQuotes.map(quote => (
                                    <tr key={quote.id} className="hover">
                                        <td className="font-bold">{quote.quoteNumber}</td>
                                        <td>{quote.customerCompany || quote.customerName || 'N.v.t.'}</td>
                                        <td>{quote.calculationResult?.lines?.length > 1 ? `${quote.calculationResult.lines.length} regels` : `1 regel`}</td>
                                        <td>€ {Number(quote.price).toFixed(2)}</td>
                                        <td>{formatDate(quote.createdAt)}</td>
                                        <td>{quote.creator?.name || 'Onbekend'}</td>
                                        <td className="flex items-center space-x-2">
                                            <StatusBadge status={quote.status} />
                                            {quote.status === 'DECLINED' && quote.rejectionReason && <FeedbackIcon />}
                                        </td>
                                        <td className="text-right space-x-2">
                                            {/* --- START WIJZIGING: Gebruik 'navigate' met de volledige URL --- */}
                                            <button onClick={() => navigate(`/direct-quote-details/${quote.id}`)} className="btn btn-sm btn-ghost">Bekijken</button>
                                            <button onClick={() => navigate(`/edit-direct-quote/${quote.id}`)} className="btn btn-sm btn-outline">Aanpassen</button>
                                            {/* --- EINDE WIJZIGING --- */}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="8" className="text-center">Geen offertes gevonden die aan uw criteria voldoen.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectQuotesList;