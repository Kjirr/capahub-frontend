// src/components/SubmitQuote.jsx - Gecorrigeerde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const SubmitQuote = ({ jobId, navigateTo, showNotification }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quoteData, setQuoteData] = useState({ price: '', deliveryTime: '', comments: '' });

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                const data = await apiRequest(`/jobs/${jobId}`);
                setJob(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId, showNotification]);

    const handleChange = (e) => setQuoteData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest(`/jobs/${jobId}/quotes`, 'POST', quoteData);
            showNotification('Offerte succesvol ingediend!');
            navigateTo('my-submitted-quotes');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (loading) return <p>Opdrachtdetails laden...</p>;
    if (!job) return <p>Kon de opdracht niet vinden.</p>;

    return (
        <div>
            <button onClick={() => window.history.back()} className="btn btn-secondary mb-4">← Terug</button>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{job.description}</p>
                    <h3 className="font-semibold text-lg mb-2">Specificaties</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {/* DE AANPASSING ZIT HIER: geen .specifications meer */}
                        <li><strong>Oplage:</strong> {job.quantity}</li>
                        <li><strong>Materiaal:</strong> {job.material}</li>
                        <li><strong>Formaat:</strong> {job.format}</li>
                        {job.deadline && <li><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString('nl-NL')}</li>}
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">
                        Aangevraagd door: <span className="link" onClick={() => navigateTo('public-profile', job.customerId)}>{job.customer?.bedrijfsnaam || 'Onbekend'}</span>
                    </p>
                </div>
                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">Dien uw offerte in</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Prijs*</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">€</span>
                                <input type="number" step="0.01" name="price" value={quoteData.price} onChange={handleChange} placeholder="450.50" className="w-full p-2 border rounded-md pl-7" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Verwachte levertijd*</label>
                            <input type="text" name="deliveryTime" value={quoteData.deliveryTime} onChange={handleChange} placeholder="bv. 5 werkdagen" className="w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Opmerkingen</label>
                            <textarea name="comments" value={quoteData.comments} onChange={handleChange} placeholder="Eventuele opmerkingen." className="w-full p-2 border rounded-md"></textarea>
                        </div>
                        <div className="text-right"><button type="submit" className="btn btn-primary">Verstuur Offerte</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitQuote;