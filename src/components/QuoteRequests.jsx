import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const QuoteRequests = ({ navigateTo, showNotification }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await apiRequest('/quote-requests');
                setRequests(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [showNotification]);

    if (loading) return <p>Offerteaanvragen laden...</p>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Inkomende Offerteaanvragen</h2>
            {requests.length === 0 ? (<p>Er zijn momenteel geen nieuwe offerteaanvragen voor u.</p>) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="card card-clickable" onClick={() => navigateTo('submit-quote', req.jobId)}>
                            <h3 className="text-xl font-bold">{req.jobTitle}</h3>
                            <p className="text-gray-600">Aanvraag geplaatst op: {new Date(req.createdAt).toLocaleDateString('nl-NL')}</p>
                            <div className="text-right mt-2"><span className="font-semibold text-gray-800">Bekijk en Dien Offerte In →</span></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuoteRequests;