// src/components/AutomationSettings.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, updateCompanyProfile } from '../api';

const AutomationSettings = ({ showNotification }) => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({ autoPlanFromPublicQuote: false });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCompanyProfile();
            setSettings({ autoPlanFromPublicQuote: data.autoPlanFromPublicQuote || false });
        } catch (error) {
            showNotification('Kon de huidige instellingen niet laden.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('autoPlanFromPublicQuote', settings.autoPlanFromPublicQuote);

            await updateCompanyProfile(data);
            showNotification('Instellingen succesvol opgeslagen!', 'success');
        } catch (error) {
            showNotification(error.message || 'Opslaan van instellingen mislukt.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div>Instellingen laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Automatisering</h1>
                    <p className="page-subtitle">Beheer hier automatische acties binnen je workflow.</p>
                </div>
                <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                    &larr; Terug naar Instellingen
                </button>
            </div>
            
            <div className="card bg-base-100 shadow-xl max-w-2xl">
                <div className="card-body">
                    {/* --- START WIJZIGING: Structuur van de label aangepast voor correcte weergave --- */}
                    <div className="form-control">
                        <label className="label cursor-pointer py-4">
                            <div>
                                <span className="label-text text-base font-bold">Automatisch Inplannen</span>
                                <div className="text-sm text-base-content/70 mt-1">
                                    Zet een door de klant geaccepteerde offerte direct door naar de productieplanning. <br/>
                                    Indien uitgeschakeld, komt de order op 'ON HOLD' te staan voor handmatige activatie.
                                </div>
                            </div> 
                            <input 
                                type="checkbox" 
                                name="autoPlanFromPublicQuote"
                                className="toggle toggle-primary toggle-lg" 
                                checked={settings.autoPlanFromPublicQuote}
                                onChange={handleChange} 
                            />
                        </label>
                    </div>
                    {/* --- EINDE WIJZIGING --- */}

                    <div className="card-actions justify-end mt-6 border-t pt-6">
                        <button 
                            className={`btn btn-primary ${isSaving ? 'loading' : ''}`}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            Instellingen Opslaan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomationSettings;