// src/components/AdminDashboard.jsx - Gecorrigeerde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import UserManagement from './UserManagement';

// Een kleine, herbruikbare component voor een statistiek-kaart
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
);

const AdminDashboard = ({ showNotification }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // DE AANPASSING ZIT HIER: '/api' is verwijderd
                const data = await apiRequest('/admin/stats');
                setStats(data);
            } catch (error) {
                showNotification('Kon dashboard statistieken niet laden', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [showNotification]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h2>

            {/* Sectie met statistieken */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    <p>Statistieken laden...</p>
                ) : stats ? (
                    <>
                        <StatCard title="Totaal Gebruikers" value={stats.userCount} />
                        <StatCard title="Totaal Opdrachten" value={stats.jobCount} />
                        <StatCard title="Totaal Aanbod" value={stats.offerCount} />
                        <StatCard title="Opdrachten in Productie" value={stats.jobsInProduction} />
                    </>
                ) : (
                    <p>Kon statistieken niet laden.</p>
                )}
            </div>

            {/* Sectie voor gebruikersbeheer */}
            <UserManagement showNotification={showNotification} />
        </div>
    );
};

export default AdminDashboard;