// src/components/OfferMarketplace.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const OfferMarketplace = ({ navigateTo, showNotification }) => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest(`/offers/search?material=${searchTerm}`);
            setOffers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification, searchTerm]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    if (loading) return <p>Marktplaats voor capaciteit wordt geladen...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Capaciteit Marktplaats</h2>
            <div className="mb-6">
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Zoek op materiaal (bv. papier, vinyl...)"
                    className="w-full p-3 border rounded-lg"
                />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.length > 0 ? offers.map(offer => (
                    <div key={offer.id} className="card">
                        <h3 className="text-xl font-bold mb-2">{offer.machineType}</h3>
                        <p className="text-sm text-slate-500 mb-2">Aangeboden door: <strong>{offer.owner.bedrijfsnaam}</strong></p>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Materiaal:</span> {offer.material}</p>
                            <p><span className="font-semibold">Locatie:</span> {offer.location || 'N.v.t.'}</p>
                            <p><span className="font-semibold">Beschikbaar:</span> {new Date(offer.availableFrom).toLocaleDateString('nl-NL')} - {new Date(offer.availableTo).toLocaleDateString('nl-NL')}</p>
                        </div>
                        <div className="text-right text-lg font-bold text-gray-800 mt-4">{offer.price}</div>
                    </div>
                )) : <p>Geen aanbod gevonden voor je zoekopdracht.</p>}
            </div>
        </div>
    );
};

export default OfferMarketplace;