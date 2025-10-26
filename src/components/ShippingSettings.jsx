import React, { useState, useEffect } from 'react';
// --- START WIJZIGING: useNavigate hook importeren ---
import { useNavigate } from 'react-router-dom';
import { getShippingSettings, updateShippingSettings } from '../api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const ShippingSettings = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---
    const [settings, setSettings] = useState({ publicKey: '', secretKey: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getShippingSettings();
                setSettings({ publicKey: data.publicKey, secretKey: '' });
            } catch (error) {
                showNotification('Kon de huidige verzendinstellingen niet laden.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [showNotification]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateShippingSettings(settings);
            showNotification('Instellingen succesvol opgeslagen!', 'success');
            setSettings(prev => ({ ...prev, secretKey: '' }));
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
                    <h1 className="page-title">Verzendinstellingen</h1>
                    <p className="page-subtitle">Koppel hier uw Sendcloud account.</p>
                </div>
                {/* --- START WIJZIGING: 'navigate' gebruiken met correcte URL --- */}
                <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                    &larr; Terug naar Instellingen
                </button>
                {/* --- EINDE WIJZIGING --- */}
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl">
                <p className="mb-4">Voer hieronder de API-sleutels van uw eigen Sendcloud account in. Deze worden gebruikt om live verzendtarieven op te halen tijdens het maken van een offerte.</p>
                <div className="form-control w-full mb-4">
                    <label className="label"><span className="label-text">Sendcloud Public Key</span></label>
                    <input 
                        type="text" 
                        placeholder="Plak hier uw publieke sleutel" 
                        className="input input-bordered w-full" 
                        value={settings.publicKey}
                        onChange={(e) => setSettings({...settings, publicKey: e.target.value})}
                    />
                </div>
                <div className="form-control w-full">
                    <label className="label"><span className="label-text">Sendcloud Secret Key</span></label>
                    <input 
                        type="password" 
                        placeholder="Plak hier uw geheime sleutel (blijft leeg indien al opgeslagen)" 
                        className="input input-bordered w-full"
                        value={settings.secretKey}
                        onChange={(e) => setSettings({...settings, secretKey: e.target.value})}
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        className={`btn btn-primary ${isSaving ? 'loading' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        Opslaan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingSettings;