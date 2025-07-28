// src/components/AdminAllJobs.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const AdminAllJobs = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiRequest('/api/admin/jobs');
            setJobs(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleDelete = async (jobId) => {
        if (window.confirm('Weet je zeker dat je deze opdracht permanent wilt verwijderen?')) {
            try {
                await apiRequest(`/api/admin/jobs/${jobId}`, 'DELETE');
                showNotification('Opdracht succesvol verwijderd.', 'success');
                fetchJobs(); // Refresh the list
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    if (loading) return <p>Alle opdrachten worden geladen...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Alle Opdrachten Beheren</h2>
                <button onClick={() => navigateTo('admin-dashboard')} className="btn-secondary">← Terug naar Dashboard</button>
            </div>
            <div className="table-container">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Titel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Klant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {jobs.map(job => (
                            <tr key={job.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{job.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{job.customer.bedrijfsnaam}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><StatusBadge status={job.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => navigateTo('job-details', job.id)} className="btn-link">Bekijken</button>
                                    <button onClick={() => handleDelete(job.id)} className="btn-link-danger">Verwijderen</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAllJobs;