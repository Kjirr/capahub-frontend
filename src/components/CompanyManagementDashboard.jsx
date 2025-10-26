// src/components/CompanyManagementDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getSubCompanies } from '../api';
import SubCompanyModal from './SubCompanyModal';

const CompanyManagementDashboard = ({ showNotification, navigateTo }) => {
    const [subCompanies, setSubCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSubCompanies = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSubCompanies();
            setSubCompanies(data || []); // Zorg ervoor dat het altijd een array is
        } catch (error) {
            // We tonen geen notificatie meer, de 'empty state' is voldoende.
            // De fout wordt wel in de console gelogd voor de ontwikkelaar.
            console.error('Fout bij het laden van sub-bedrijven:', error);
            setSubCompanies([]); // Zet op een lege array bij een fout
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubCompanies();
    }, [fetchSubCompanies]);

    if (isLoading) {
        return <div className="text-center p-8">Sub-bedrijven laden...</div>;
    }

    // --- ▼▼▼ VERBETERDE 'EMPTY STATE' LOGICA ▼▼▼ ---
    if (!isLoading && subCompanies.length === 0) {
        return (
            <>
                <div className="page-container text-center">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold mb-2">Begin met het beheren van uw bedrijven</h2>
                        <p className="text-slate-600 mb-6">U heeft nog geen sub-bedrijven aangemaakt. Voeg uw eerste bedrijf toe om de multi-company functies te gebruiken.</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                            + Nieuw Sub-bedrijf
                        </button>
                         <button onClick={() => navigateTo('dashboard')} className="btn btn-ghost mt-4">
                            Terug naar Dashboard
                        </button>
                    </div>
                </div>
                <SubCompanyModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchSubCompanies}
                    showNotification={showNotification}
                />
            </>
        );
    }
    
    // --- BESTAANDE WEERGAVE MET DE TABEL ---
    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="page-title">Bedrijfsbeheer</h1>
                    <div>
                        <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost mr-2">
                            ← Terug naar Instellingen
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                            Nieuw Sub-bedrijf
                        </button>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>KVK</th>
                                        <th>Plaats</th>
                                        <th>Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subCompanies.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.name}</td>
                                            <td>{c.kvk}</td>
                                            <td>{c.plaats || '-'}</td>
                                            <td>{/* Toekomstige acties zoals 'Bewerken' */}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SubCompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchSubCompanies}
                showNotification={showNotification}
            />
        </>
    );
};

export default CompanyManagementDashboard;