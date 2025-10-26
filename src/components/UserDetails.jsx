// src/components/UserDetails.jsx

import React, { useState, useEffect } from 'react';
import { getUserActivity } from '@/api';

const UserDetails = ({ viewParam: userId, showNotification, navigateTo }) => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getUserActivity(userId);
                setUserData(data);
            } catch (err) {
                setError('Kon gebruikersdossier niet laden.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    if (isLoading) return <div className="loading-text">Dossier aan het laden...</div>;
    if (error) return <div className="text-red-600 p-4">{error}</div>;
    if (!userData) return <div className="p-4">Geen data gevonden.</div>;

    const { user, activity } = userData;

    return (
        <div className="page-container">
            <div className="mb-8">
                <button onClick={() => navigateTo('user-management')} className="btn btn-ghost mb-4">
                    &larr; Terug naar Gebruikersbeheer
                </button>
                <h1 className="page-title">Dossier: {user.name}</h1>
                <p className="page-subtitle">Bedrijf: {user.company.name}</p>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Recente Activiteit</h2>
                    <ul className="divide-y mt-4">
                        {activity.map((act, index) => (
                            <li key={index} className="py-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className={`badge ${act.type.includes('Opdracht') ? 'badge-info' : act.type.includes('Offerte') ? 'badge-warning' : 'badge-success'}`}>{act.type}</span>
                                        <p className="font-semibold mt-1">{act.item.title || act.item.quoteNumber || act.item.orderNumber || 'N/B'}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{new Date(act.date).toLocaleString('nl-NL')}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {activity.length === 0 && <p className="text-center text-gray-500 py-4">Geen recente activiteit gevonden.</p>}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;