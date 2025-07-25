import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const AdminDashboard = ({ currentUser, navigateTo, showNotification, handleLogout }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiRequest('/admin/stats', 'GET');
                setStats(data);
            } catch (error) {
                showNotification(error.message, 'error');
            }
        };
        if (currentUser) {
            fetchStats();
        }
    }, [currentUser, showNotification]);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card p-4 text-center">
                    <p className="text-gray-500">Totaal Bedrijven</p>
                    <p className="text-3xl font-bold">{stats ? stats.companyCount : '...'}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-gray-500">Totaal Opdrachten</p>
                    <p className="text-3xl font-bold">{stats ? stats.jobCount : '...'}</p>
                </div>
                <div className="card p-4 text-center bg-yellow-100 border border-yellow-300">
                    <p className="text-yellow-800">Wachtend op Goedkeuring</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats ? stats.pendingUsers : '...'}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div onClick={() => navigateTo('user-management')} className="card p-6 text-center hover:bg-gray-100 cursor-pointer">
                    <h2 className="font-bold text-xl">Gebruikersbeheer</h2>
                    <p className="text-sm mt-2">Bekijk en keur individuele gebruikersaccounts goed.</p>
                </div>
                 <div onClick={() => navigateTo('company-management')} className="card p-6 text-center hover:bg-gray-100 cursor-pointer">
                    <h2 className="font-bold text-xl">Bedrijvenbeheer</h2>
                    <p className="text-sm mt-2">Bekijk de details van alle geregistreerde bedrijven.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;