// src/components/MyOffers.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const MyOffers = ({ showNotification, navigateTo, currentUser }) => {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/offers/my-offers', 'GET');
                setOffers(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser) {
            fetchOffers();
        }
    }, [currentUser, showNotification]);

    if (isLoading) {
        return <div className="loading-text">Aanbod laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                 <div>
                    <h1 className="page-title">Mijn Aanbod</h1>
                    <p className="page-subtitle">Hier beheert u uw aanbod van vrije capaciteit.</p>
                </div>
                <button onClick={() => navigateTo('create-offer')} className="btn-primary">
                    Nieuw Aanbod Plaatsen
                </button>
            </div>
            {offers.length === 0 ? (
                 <div className="card-placeholder">
                    <p>U heeft nog geen aanbod van vrije capaciteit geplaatst.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map(offer => (
                        <div 
                            key={offer.id} 
                            onClick={() => navigateTo('offer-details', offer.id)} 
                            className="card-interactive"
                        >
                            <div className="card-body">
                                <h2 className="card-title-lg">{offer.machineType}</h2>
                                <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                    <span><strong>Materiaal:</strong> {offer.material}</span>
                                    <span><strong>Prijsindicatie:</strong> {offer.price}</span>
                                    <span><strong>Geplaatst op:</strong> {new Date(offer.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOffers;
