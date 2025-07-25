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
        return <div className="text-center p-10">Aanbod laden...</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                 <div>
                    <h1 className="text-3xl font-bold">Mijn Aanbod</h1>
                    <p className="text-base-content/70 mt-2">Hier beheert u uw aanbod van vrije capaciteit.</p>
                </div>
                <button onClick={() => navigateTo('create-offer')} className="btn btn-primary">
                    Nieuw Aanbod Plaatsen
                </button>
            </div>
            {offers.length === 0 ? (
                 <div className="card bg-base-100 text-center p-10">
                    <p>U heeft nog geen aanbod van vrije capaciteit geplaatst.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map(offer => (
                        <div 
                            key={offer.id} 
                            onClick={() => navigateTo('offer-details', offer.id)} 
                            className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <div className="card-body">
                                <h2 className="card-title">{offer.machineType}</h2>
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
