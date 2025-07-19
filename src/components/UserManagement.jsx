// src/components/UserManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const UserManagement = ({ showNotification }) => {
    const [users, setUsers] = useState([]);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await apiRequest('/admin/users');
            setUsers(data);
        } catch (error) {
            showNotification('Kon gebruikers niet ophalen', 'error');
        }
    }, [showNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleApprove = async (userId) => {
        try {
            const data = await apiRequest(`/admin/users/${userId}/approve`, 'POST');
            showNotification(data.message);
            fetchUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Weet u zeker dat u deze gebruiker wilt afwijzen?')) {
            try {
                const data = await apiRequest(`/admin/users/${userId}/reject`, 'DELETE');
                showNotification(data.message);
                fetchUsers();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const handleResetData = async () => {
        if (window.confirm('WEET U HET ABSOLUUT ZEKER? DIT VERWIJDERT ALLES BEHALVE UW ADMIN ACCOUNT.')) {
            if (window.confirm('TWEEDE BEVESTING: Dit is uw laatste kans.')) {
                try {
                    const data = await apiRequest('/admin/reset-data', 'DELETE');
                    showNotification(data.message, 'success', 5000);
                    fetchUsers();
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        }
    };

    const handleForceVerify = async (userId) => {
        try {
            const data = await apiRequest(`/admin/users/${userId}/force-verify`, 'POST');
            showNotification(data.message, 'success');
            fetchUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const pendingEmailUsers = users.filter(u => u.status === 'pending_email_verification');
    const pendingApprovalUsers = users.filter(u => u.status === 'pending_approval');
    const activeUsers = users.filter(u => u.status === 'active');

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Wachten op e-mailverificatie ({pendingEmailUsers.length})</h3>
                <div className="bg-white shadow rounded-lg border border-slate-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bedrijfsnaam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {pendingEmailUsers.length > 0 ? pendingEmailUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.bedrijfsnaam}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleForceVerify(user.id)} className="font-semibold text-indigo-600 hover:text-indigo-800">Handmatig Verifiëren</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="text-center py-4 text-sm text-slate-500">Geen gebruikers in deze categorie.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Wachten op goedkeuring ({pendingApprovalUsers.length})</h3>
                <div className="bg-white shadow rounded-lg border border-slate-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bedrijfsnaam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {pendingApprovalUsers.length > 0 ? pendingApprovalUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.bedrijfsnaam}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleApprove(user.id)} className="font-semibold text-blue-600 hover:text-blue-800">Goedkeuren</button>
                                        <button onClick={() => handleReject(user.id)} className="font-semibold text-red-600 hover:text-red-800">Afwijzen</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3" className="text-center py-4 text-sm text-slate-500">Geen gebruikers in deze categorie.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Actieve Gebruikers ({activeUsers.length})</h3>
                <div className="bg-white shadow rounded-lg border border-slate-200">
                    <ul className="divide-y divide-slate-200">
                        {activeUsers.length > 0 ? activeUsers.map(user => (
                            <li key={user.id} className="px-6 py-4">
                                <p className="text-sm font-medium text-slate-900">{user.bedrijfsnaam} <span className="text-slate-500 font-normal">({user.email})</span></p>
                            </li>
                        )) : (
                            <li className="text-center py-4 text-sm text-slate-500">Geen actieve gebruikers.</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="mt-12 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <h3 className="text-xl font-bold text-red-800 mb-2">Gevaarlijke Zone</h3>
                <p className="text-red-700 mb-4">Deze actie zal alle data op het platform permanent verwijderen, behalve uw eigen admin-account.</p>
                <button onClick={handleResetData} className="btn btn-danger">Reset Alle Platform Data</button>
            </div>
        </div>
    );
};

export default UserManagement;