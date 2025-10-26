import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUserStatus } from '@/api';

const UserManagement = ({ currentUser, showNotification, navigateTo }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => { if (currentUser) { fetchUsers(); } }, [currentUser, fetchUsers]);

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await updateUserStatus(userId, newStatus);
            
            let feedbackMessage = 'Gebruikersstatus bijgewerkt.';
            if (newStatus === 'active') feedbackMessage = 'Gebruiker succesvol geactiveerd/goedgekeurd.';
            if (newStatus === 'suspended') feedbackMessage = 'Gebruiker succesvol geblokkeerd.';
            
            showNotification(feedbackMessage, 'success');
            fetchUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div className="loading-text">Gebruikers laden...</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Gebruikersbeheer</h1>
                    <p className="page-subtitle">Bekijk en beheer alle gebruikersaccounts op het platform.</p>
                </div>
                <button onClick={() => navigateTo('admin-dashboard')} className="btn-ghost">
                    &larr; Terug naar Dashboard
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Contactpersoon</th>
                            <th>Bedrijf</th>
                            <th>Rol (Bedrijf)</th>
                            <th>Status</th>
                            <th>Rechten (Individueel)</th>
                            <th>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="hover">
                                <td>
                                    {/* ▼▼▼ DEZE NAAM IS NU KLIKBAAR ▼▼▼ */}
                                    <a onClick={() => navigateTo('user-details', user.id)} className="link link-hover font-bold text-primary">
                                        {user.name}
                                    </a>
                                    <div className="text-xs text-base-content/60">{user.email}</div>
                                </td>
                                <td>{user.company?.name || <span className="italic text-base-content/50">Admin Account</span>}</td>
                                <td>
                                    <span className={`badge ${user.companyRole === 'owner' ? 'badge-primary' : 'badge-ghost'}`}>
                                        {user.companyRole}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${user.status === 'active' ? 'badge-success' : user.status === 'suspended' ? 'badge-error' : 'badge-warning'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="max-w-xs"><div className="flex flex-wrap gap-1">{user.permissions.length > 0 ? (user.permissions.map(p => (<span key={p.name} className="badge badge-outline badge-sm">{p.name}</span>))) : (<span className="text-xs text-base-content/50">Geen</span>)}</div></td>
                                <td className="space-x-1">
                                    {user.status === 'pending_approval' && (
                                        <button onClick={() => handleStatusUpdate(user.id, 'active')} className="btn btn-success btn-sm">Goedkeuren</button>
                                    )}
                                    {user.status === 'active' && user.role !== 'admin' && (
                                        <button onClick={() => handleStatusUpdate(user.id, 'suspended')} className="btn btn-warning btn-sm">Blokkeren</button>
                                    )}
                                    {user.status === 'suspended' && (
                                        <button onClick={() => handleStatusUpdate(user.id, 'active')} className="btn btn-info btn-sm">Activeren</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (<div className="loading-text"><p>Er zijn momenteel geen gebruikers gevonden.</p></div>)}
            </div>
        </div>
    );
};

export default UserManagement;