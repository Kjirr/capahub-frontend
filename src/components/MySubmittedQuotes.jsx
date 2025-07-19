// src/components/MySubmittedQuotes.jsx - Verbeterde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const MySubmittedQuotes = ({ navigateTo, showNotification }) => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const data = await apiRequest('/quotes/my-submitted');
                setQuotes(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchQuotes();
    }, [showNotification]);

    if (loading) return <p>Ingediende offertes laden...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Mijn Ingediende Offertes</h2>
            {quotes.length === 0 ? (
                <p>U heeft nog geen offertes ingediend.</p>
            ) : (
                <div className="space-y-4">
                    {quotes.map(quote => (
                        <div 
                            key={quote.id} 
                            className="card card-clickable" 
                            onClick={() => navigateTo('job-details', quote.jobId)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-blue-600 hover:underline">{quote.job.title}</h3>
                                    <p className="text-lg font-semibold text-gray-800 mt-2">€ {parseFloat(quote.price).toFixed(2)}</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Offertenummer: #{quote.id.slice(-6).toUpperCase()}
                                        <span className="mx-2">·</span>
                                        Ingediend op: {new Date(quote.createdAt).toLocaleDateString('nl-NL')}
                                    </p>
                                </div>
                                
                                {/* DE AANPASSING ZIT HIER */}
                                <div className="text-right">
                                    <StatusBadge status={quote.status} />
                                    {(quote.status === 'accepted' || quote.status === 'rejected') && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            op {new Date(quote.statusUpdatedAt).toLocaleDateString('nl-NL')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MySubmittedQuotes;