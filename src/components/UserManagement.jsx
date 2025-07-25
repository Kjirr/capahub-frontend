
// src/components/UserManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const UserManagement = ({ currentUser, showNotification, navigateTo }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/admin/users', 'GET');
            setUsers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser, fetchUsers]);

    const handleApprove = async (userId) => {
        try {
            await apiRequest(`/admin/users/${userId}/approve`, 'PUT');
            showNotification('Gebruiker goedgekeurd!');
            fetchUsers(); // Herlaad de lijst om de nieuwe status te tonen
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div className="text-center p-10">Gebruikers laden...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gebruikersbeheer</h1>
                    <p className="text-base-content/70 mt-2">Bekijk en beheer alle gebruikersaccounts op het platform.</p>
                </div>
                <button onClick={() => navigateTo('admin-dashboard')} className="btn btn-ghost">
                    &larr; Terug naar Dashboard
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Bedrijfsnaam</th>
                            <th>Contactpersoon</th>
                            <th>Status</th>
                            <th>Geregistreerd op</th>
                            <th>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="hover">
                                <td>{user.company?.name || <span className="italic text-base-content/50">Admin Account</span>}</td>
                                <td>
                                    <div>{user.name}</div>
                                    <div className="text-xs text-base-content/60">{user.email}</div>
                                </td>
                                <td>
                                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                {/* DE FIX: Formatteer de datum naar een leesbaar formaat (datum en tijd) */}
                                <td>{new Date(user.createdAt).toLocaleString('nl-NL')}</td>
                                <td>
                                    {user.status !== 'active' && (
                                        <button onClick={() => handleApprove(user.id)} className="btn btn-primary btn-sm">
                                            Goedkeuren
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center p-10">
                        <p>Er zijn momenteel geen gebruikers gevonden.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
