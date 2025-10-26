// src/components/ArchivePage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getUnifiedArchive } from '@/api';
import StatusBadge from './StatusBadge';

const ArchivePage = ({ showNotification }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const [archiveItems, setArchiveItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchArchive = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUnifiedArchive();
            setArchiveItems(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchArchive();
        }
    }, [currentUser, fetchArchive]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) {
            return archiveItems;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return archiveItems.filter(item => 
            (item.number && item.number.toLowerCase().includes(lowercasedTerm)) ||
            (item.description && item.description.toLowerCase().includes(lowercasedTerm)) ||
            (item.status && item.status.toLowerCase().includes(lowercasedTerm))
        );
    }, [archiveItems, searchTerm]);

    // --- START WIJZIGING: Diagnostische 'console.log' toegevoegd ---
    const handleCardClick = (item) => {
        console.log('Navigeren met item:', item); // TESTLIJN
        if (item.type === 'JOB') {
            navigate(`/job-details/${item.id}`);
        } else if (item.type === 'DIRECT_QUOTE') {
            navigate(`/direct-quote-details/${item.id}`);
        }
    };
    // --- EINDE WIJZIGING ---

    if (isLoading) {
        return <div className="loading-text">Archief laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Gecentraliseerd Archief</h1>
                    <p className="page-subtitle">Een overzicht van al uw afgehandelde opdrachten en directe offertes.</p>
                </div>
                <button onClick={() => navigate(-1)} className="btn btn-ghost">
                    &larr; Terug
                </button>
            </div>

            <div className="mb-6">
                <input 
                    type="text"
                    placeholder="Zoek op nummer, omschrijving of status..."
                    className="input input-bordered w-full md:w-1/2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {archiveItems.length === 0 ? (
                <div className="card-placeholder">
                    <p>Je hebt nog geen gearchiveerde items.</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="card-placeholder">
                    <p>Geen resultaten gevonden voor je zoekopdracht.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map(item => (
                        <div 
                            key={`${item.type}-${item.id}`} 
                            onClick={() => handleCardClick(item)}
                            className="card-interactive bg-base-100/60 hover:bg-base-100"
                        >
                            <div className="card-body flex-row justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <span className={`badge ${item.type === 'JOB' ? 'badge-info' : 'badge-accent'}`}>{item.type === 'JOB' ? 'Marktplaats' : 'Direct'}</span>
                                        <h2 className="card-title-lg">{item.description}</h2>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-2">
                                        <span><strong>Nummer:</strong> {item.number}</span>
                                        <span><strong>Afgerond op:</strong> {new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    {item.price && (
                                         <div className="text-right">
                                            <p className="font-bold text-lg">€ {Number(item.price).toFixed(2)}</p>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <StatusBadge status={item.status} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchivePage;