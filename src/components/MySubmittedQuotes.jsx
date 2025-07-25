// src/components/MySubmittedQuotes.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const MySubmittedQuotes = ({ showNotification, currentUser, navigateTo }) => {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/quotes/my-submitted', 'GET');
                setQuotes(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser) {
            fetchQuotes();
        }
    }, [currentUser, showNotification]);

    if (isLoading) {
        return <div className="text-center p-10">Ingediende offertes laden...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Mijn Ingediende Offertes</h1>
                <p className="text-base-content/70 mt-2">Hier vindt u een overzicht van al uw uitgebrachte offertes.</p>
            </div>
            
            {quotes.length === 0 ? (
                <div className="card bg-base-100 text-center p-10">
                    <p>U heeft nog geen offertes ingediend.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotes.map(quote => (
                        <div 
                            key={quote.id} 
                            onClick={() => navigateTo('edit-quote', quote.id)}
                            className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <h2 className="card-title">Offerte voor: {quote.job?.title || 'Onbekende opdracht'}</h2>
                                    <span className="badge badge-ghost">{quote.quoteNumber}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Uw Prijs:</strong> €{quote.price.toFixed(2)}</span>
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

// DE FIX: Deze regel was vergeten
export default MySubmittedQuotes;
