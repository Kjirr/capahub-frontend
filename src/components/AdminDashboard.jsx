import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const AdminDashboard = ({ currentUser, navigateTo, showNotification }) => {
    const [stats, setStats] = useState(null);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [recentCompanies, setRecentCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Haal alle benodigde data voor het dashboard in één keer op
            const [statsData, pendingUsersData, recentCompaniesData] = await Promise.all([
                apiRequest('/admin/stats', 'GET'),
                apiRequest('/admin/dashboard/pending-users', 'GET'),
                apiRequest('/admin/dashboard/recent-companies', 'GET')
            ]);
            setStats(statsData);
            setPendingUsers(pendingUsersData);
            setRecentCompanies(recentCompaniesData);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser, fetchData]);

    const handleApproveUser = async (userId, userName) => {
        if (!window.confirm(`Weet u zeker dat u gebruiker '${userName}' wilt goedkeuren?`)) return;
        
        try {
            await apiRequest(`/admin/users/${userId}/approve`, 'PUT');
            showNotification(`Gebruiker ${userName} succesvol goedgekeurd.`, 'success');
            fetchData(); // Herlaad alle dashboard data
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title mb-6">Admin Dashboard</h1>
            
            {/* --- Statstieken (blijft hetzelfde) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-base-100 shadow-md p-4 text-center">
                    <p className="text-gray-500">Totaal Bedrijven</p>
                    <p className="page-title">{isLoading ? '...' : stats.companyCount}</p>
                </div>
                <div className="card bg-base-100 shadow-md p-4 text-center">
                    <p className="text-gray-500">Totaal Opdrachten</p>
                    <p className="page-title">{isLoading ? '...' : stats.jobCount}</p>
                </div>
                 <div className="card bg-base-100 shadow-md p-4 text-center">
                    <p className="text-gray-500">Wachtend op Goedkeuring</p>
                    <p className="text-3xl font-bold text-warning">{isLoading ? '...' : stats.pendingUsers}</p>
                </div>
            </div>

            {/* --- Nieuwe layout met tabellen --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Kolom 1: Acties Vereist --- */}
                <div className="space-y-8">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Goedkeuring Vereist</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <tbody>
                                        {pendingUsers.length > 0 ? pendingUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div>{user.name}</div>
                                                    <div className="text-xs text-base-content/60">{user.company.name}</div>
                                                </td>
                                                <td className="text-right">
                                                    <button onClick={() => handleApproveUser(user.id, user.name)} className="btn btn-success btn-sm">
                                                        Keur goed
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td>Geen gebruikers die wachten op goedkeuring.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button onClick={() => navigateTo('user-management')} className="btn btn-ghost btn-sm">Alle Gebruikers &rarr;</button>
                            </div>
                        </div>
                    </div>
                    {/* --- Navigatie naar instellingen --- */}
                     <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                           <h2 className="card-title">Instellingen</h2>
                           <div className="flex gap-4 mt-2">
                             <button onClick={() => navigateTo('plan-management')} className="btn btn-outline w-full">Abonnementen</button>
                             {/* Hier kunnen toekomstige instellingen komen */}
                           </div>
                        </div>
                    </div>
                </div>

                {/* --- Kolom 2: Recente Activiteit --- */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Recente Bedrijven</h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                 <tbody>
                                    {recentCompanies.length > 0 ? recentCompanies.map(company => (
                                        <tr key={company.id}>
                                            <td>
                                                <div>{company.name}</div>
                                                <div className="text-xs text-base-content/60">Geregistreerd op {new Date(company.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="text-right">
                                                <span className="badge badge-secondary badge-outline">{company.plan?.name || 'Geen'}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td>Geen recente registraties.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                         <div className="card-actions justify-end mt-4">
                            <button onClick={() => navigateTo('company-management')} className="btn btn-ghost btn-sm">Alle Bedrijven &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;