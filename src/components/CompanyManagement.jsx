import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const CompanyManagement = ({ currentUser, showNotification, navigateTo }) => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/admin/companies', 'GET');
            setCompanies(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchCompanies();
        }
    }, [currentUser, fetchCompanies]);

    if (isLoading) return <div className="loading-text">Bedrijven laden...</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Bedrijvenbeheer</h1>
                    <p className="page-subtitle">Een overzicht van alle geregistreerde bedrijven op het platform.</p>
                </div>
                <button onClick={() => navigateTo('admin-dashboard')} className="btn-ghost">
                    &larr; Terug naar Dashboard
                </button>
            </div>

            <div className="card bg-base-100 shadow-xl overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Bedrijfsnaam</th>
                            <th>KvK</th>
                            <th>Contactgegevens</th>
                            <th>Activiteit</th>
                            <th>Geregistreerd op</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(company => (
                            <tr key={company.id} className="hover">
                                <td className="font-bold">{company.name}</td>
                                <td>{company.kvk}</td>
                                <td>
                                    <div>{company.adres || '-'}</div>
                                    <div className="text-xs text-base-content/60">{company.plaats || '-'}</div>
                                </td>
                                <td>
                                    <div>{company._count.users} Gebruiker(s)</div>
                                    <div>{company._count.jobs} Opdracht(en)</div>
                                </td>
                                <td>{new Date(company.createdAt).toLocaleDateString('nl-NL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {companies.length === 0 && (
                    <div className="loading-text">
                        <p>Er zijn momenteel geen bedrijven gevonden.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyManagement;