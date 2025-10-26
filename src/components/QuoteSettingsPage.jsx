// src/components/QuoteSettingsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyProfile, updateQuoteSettings } from '../api';

const QuoteSettingsPage = ({ showNotification, navigateTo }) => {
    const [settings, setSettings] = useState({
        quoteHeaderColor: '#1E40AF',
        quoteTerms: '',
        quoteFooter: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCompanyProfile();
            setSettings({
                quoteHeaderColor: data.quoteHeaderColor || '#1E40AF',
                quoteTerms: data.quoteTerms || '',
                quoteFooter: data.quoteFooter || ''
            });
        } catch (error) {
            showNotification('Kon instellingen niet laden.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const result = await updateQuoteSettings(settings);
            showNotification(result.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <p>Instellingen laden...</p>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Offerte-instellingen</h1>
                <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">
                    ← Terug naar Instellingen
                </button>
            </div>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                <div className="card-body space-y-6">
                    <div>
                        <label className="label"><span className="label-text font-bold">Themakleur Offerte (kopjes)</span></label>
                        <input type="color" name="quoteHeaderColor" value={settings.quoteHeaderColor} onChange={handleChange} className="input h-10 p-1" />
                    </div>
                    <div>
                        <label className="label"><span className="label-text font-bold">Algemene Voorwaarden</span></label>
                        <textarea name="quoteTerms" value={settings.quoteTerms} onChange={handleChange} className="textarea textarea-bordered w-full h-48" placeholder="Plaats hier uw algemene voorwaarden..."></textarea>
                    </div>
                    <div>
                        <label className="label"><span className="label-text font-bold">Footer Tekst</span></label>
                        <input type="text" name="quoteFooter" value={settings.quoteFooter} onChange={handleChange} className="input input-bordered w-full" placeholder="Bijv. Bedrijfsnaam | KVK | IBAN" />
                    </div>
                    <div className="card-actions justify-end">
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? 'Opslaan...' : 'Instellingen Opslaan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QuoteSettingsPage;