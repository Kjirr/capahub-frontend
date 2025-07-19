// src/components/MyOffers.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const MyOffers = ({ currentUser, navigateTo, showNotification }) => {
    const [myOffers, setMyOffers] = useState([]);
    const [loading, setLoading] = useState(true); // Voeg loading state toe

    const fetchMyOffers = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // GEBRUIK DE NIEUWE, CORRECTE ROUTE
            const data = await apiRequest(`/offers/my-offers`);
            setMyOffers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [currentUser, showNotification]);

    useEffect(() => {
        fetchMyOffers();
    }, [fetchMyOffers]);

    if (loading) {
        return <p>Mijn aanbod wordt geladen...</p>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Mijn Geplaatste Aanbod</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myOffers.length > 0 ? myOffers.map(offer => (
                    <div key={offer.id} className="card card-clickable" onClick={() => navigateTo('offer-details', offer.id)}>
                        <h3 className="text-xl font-bold mb-2">{offer.machineType}</h3>
                        <p className="text-gray-600 mb-1"><strong>Materiaal:</strong> {offer.material}</p>
                        <p className="text-gray-600 mb-4 truncate"><strong>Details:</strong> {offer.capacityDetails}</p>
                        <div className="text-right text-lg font-bold text-gray-800">{offer.price}</div>
                    </div>
                )) : (
                    <p>U heeft nog geen aanbod geplaatst. <span className="link" onClick={() => navigateTo('offer-capacity')}>Bied nu capaciteit aan.</span></p>
                )}
            </div>
        </div>
    );
};

export default MyOffers;