import React, { useState, useEffect } from 'react';
// GEWIJZIGD: De ongebruikte imports zijn nu correct verwijderd
import { getAdminStats, getPendingUsers } from '@/api';

const DashboardTile = ({ title, count, children, onClick, className = '' }) => (
    <div 
        onClick={onClick}
        className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col ${className}`}
    >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">{title}</h2>
            {count !== undefined && (
                <span className="text-2xl font-bold text-primary">{count}</span>
            )}
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);


const AdminDashboard = ({ navigateTo }) => {
    const [data, setData] = useState({
        stats: null,
        pendingUsers: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // We halen alleen nog de data op die we daadwerkelijk tonen
                const [stats, pendingUsers] = await Promise.all([
                    getAdminStats(),
                    getPendingUsers(),
                ]);
                setData({ stats, pendingUsers });
            } catch (err) {
                setError("Dashboard data kon niet worden geladen.");
                console.error("Foutdetails:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className="container mx-auto p-4">Admin Dashboard wordt geladen...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-600">Fout: {error}</div>;
    }

    const { stats, pendingUsers } = data;

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardTile title="Totaal Bedrijven" count={stats?.companyCount || 0} onClick={() => navigateTo('company-management')} />
                <DashboardTile title="Totaal Gebruikers" count={stats?.userCount || 0} onClick={() => navigateTo('user-management')} />
                
                <DashboardTile title="Gebruikers in Wachtrij" count={pendingUsers.length} onClick={() => navigateTo('user-management')}>
                    {pendingUsers.length > 0 ? (
                        <ul className="text-sm space-y-2 mt-2">
                            {pendingUsers.slice(0, 3).map(user => (
                                <li key={user.id} className="truncate">
                                    {user.name} ({user.companyName})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm mt-2">Geen wachtende gebruikers.</p>
                    )}
                </DashboardTile>
                
                <DashboardTile title="Abonnementen Beheren" onClick={() => navigateTo('plan-management')} className="bg-primary text-primary-content hover:bg-primary-focus">
                    <p>Beheer de pakketten en permissies.</p>
                </DashboardTile>
                
                <DashboardTile title="Live Activiteit Feed" onClick={() => navigateTo('admin-activity-feed')} className="bg-info text-info-content hover:bg-info-focus lg:col-span-2">
                     <p>Bekijk alle recente activiteit.</p>
                </DashboardTile>
            </div>
        </div>
    );
};

export default AdminDashboard;