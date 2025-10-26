import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api'; // Gebruik apiRequest voor authenticatie
import { FaTrashAlt, FaClipboard } from 'react-icons/fa'; // FaClipboard icoon toegevoegd

const AssetManager = ({ showNotification }) => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAssets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await apiRequest('GET', '/api/company/assets');
            setAssets(data);
        } catch (err) {
            setError('Kon de afbeeldingen niet laden.');
            showNotification(err.response?.data?.error || 'Laden mislukt', 'error');
            setAssets([]); // Zorg dat de lijst leeg is bij een fout
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleDelete = async (filename) => {
        if (!window.confirm(`Weet je zeker dat je de afbeelding "${filename}" permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            return;
        }
        try {
            await apiRequest('DELETE', `/api/company/assets/${filename}`);
            showNotification('Afbeelding succesvol verwijderd.', 'success');
            fetchAssets(); // Herlaad de lijst na verwijderen
        } catch (err) {
            showNotification(err.response?.data?.error || 'Verwijderen mislukt', 'error');
        }
    };

    // --- START NIEUWE FUNCTIE ---
    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url)
            .then(() => {
                showNotification('Afbeeldings-URL gekopieerd!', 'success');
            })
            .catch(err => {
                console.error('Kopiëren mislukt:', err);
                showNotification('Kopiëren mislukt. Controleer console.', 'error');
            });
    };
    // --- EINDE NIEUWE FUNCTIE ---

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Asset Gallerij</h1>
                    <p className="page-subtitle">Beheer hier de afbeeldingen die via de teksteditor zijn geüpload.</p>
                </div>
                <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                    ← Terug naar Instellingen
                </button>
            </div>

            {isLoading && <p>Afbeeldingen laden...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!isLoading && !error && (
                <>
                    {assets.length === 0 ? (
                        <p className="text-center italic text-gray-500 mt-10">
                            Er zijn nog geen afbeeldingen geüpload via de teksteditor.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {assets.map((asset) => (
                                <div key={asset.name} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                                    <figure className="aspect-square bg-gray-100 p-2">
                                        <img src={asset.url} alt={asset.name} className="object-contain max-h-full max-w-full" loading="lazy" />
                                    </figure>
                                    <div className="card-body p-3">
                                        <p className="text-xs truncate" title={asset.name}>{asset.name}</p>
                                        
                                        {/* --- START AANGEPASTE SECTIE (KNOPPEN) --- */}
                                        <div className="card-actions justify-end mt-2">
                                            <button
                                                onClick={() => handleCopyUrl(asset.url)}
                                                className="btn btn-xs btn-ghost text-blue-600"
                                                aria-label={`Kopieer URL voor ${asset.name}`}
                                                title="Kopieer URL"
                                            >
                                                <FaClipboard />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset.name)}
                                                className="btn btn-xs btn-ghost text-red-500"
                                                aria-label={`Verwijder ${asset.name}`}
                                                title="Verwijder"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                        {/* --- EINDE AANGEPASTE SECTIE --- */}

                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AssetManager;