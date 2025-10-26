// src/components/MySubmittedQuotes.jsx

import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: Importeer de store ---
import useAuthStore from '@/store/authStore';
import { getMySubmittedQuotes } from '@/api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'currentUser' als prop verwijderd ---
const MySubmittedQuotes = ({ showNotification, navigateTo }) => {
    // Haal de gebruiker direct uit de store
    const { currentUser } = useAuthStore();
    // --- EINDE WIJZIGING ---

    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMySubmittedQuotes();
            setQuotes(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        // De logica blijft hetzelfde, maar 'currentUser' komt nu uit de store
        if (currentUser) {
            fetchQuotes();
        }
    }, [currentUser, fetchQuotes]);

    if (isLoading) {
        return <div className="loading-text">Ingediende offertes laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Mijn Ingediende Offertes</h1>
                <p className="page-subtitle">Hier vindt u een overzicht van al uw uitgebrachte offertes.</p>
            </div>
            
            {quotes.length === 0 ? (
                <div className="card-placeholder">
                    <p>U heeft nog geen offertes ingediend.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotes.map(quote => (
                        <div 
                            key={quote.id} 
                            onClick={() => navigateTo('edit-quote', quote.id)}
                            className="card-interactive"
                        >
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <h2 className="card-title-lg">Offerte voor: {quote.job?.title || 'Onbekende opdracht'}</h2>
                                    <span className="badge-ghost">{quote.quoteNumber}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Uw Prijs:</strong> €{Number(quote.price).toFixed(2)}</span>
                                    <span><strong>Status:</strong> {quote.status}</span>
                                    <span><strong>Offertedatum:</strong> {new Date(quote.createdAt).toLocaleDateString()}</span>
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