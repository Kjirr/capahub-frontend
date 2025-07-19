// src/components/OfferDetails.jsx - Gecorrigeerde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const OfferDetails = ({ offerId, showNotification, navigateTo }) => {
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffer = async () => {
            if (!offerId) return;
            try {
                const data = await apiRequest(`/offers/${offerId}`);
                setOffer(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, [offerId, showNotification]);

    if (loading) return <p>Aanbod laden...</p>;
    if (!offer) return <p>Aanbod niet gevonden.</p>;

    return (
        <div>
            <button onClick={() => window.history.back()} className="btn btn-secondary mb-6">← Terug</button>
            <div className="card">
                <h2 className="text-3xl font-bold mb-2">{offer.machineType}</h2>
                {/* DE AANPASSING ZIT HIER: offer.owner.bedrijfsnaam */}
                <p className="text-lg text-gray-700 mb-4">
                    Aangeboden door: <strong className="link" onClick={() => navigateTo('public-profile', offer.ownerId)}>{offer.owner?.bedrijfsnaam || 'Onbekend'}</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h3 className="font-semibold text-gray-800">Materiaal</h3>
                        <p>{offer.material}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Prijsindicatie</h3>
                        <p className="text-2xl font-bold text-gray-900">{offer.price}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-800">Details</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{offer.capacityDetails}</p>
                </div>
            </div>
        </div>
    );
};

export default OfferDetails;