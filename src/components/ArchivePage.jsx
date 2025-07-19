import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';

const ArchivePage = ({ navigateTo, showNotification }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // useCallback zorgt ervoor dat de functie niet bij elke render opnieuw wordt gemaakt
    const fetchArchive = useCallback(async (currentSearchTerm) => {
        setLoading(true);
        try {
            // Bouw de URL met de zoekterm
            const url = `/archive?searchTerm=${currentSearchTerm}`;
            const data = await apiRequest(url);
            setJobs(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]); // showNotification is een stabiele functie dankzij useCallback in App.jsx

    useEffect(() => {
        // Haal de data op wanneer de pagina voor het eerst laadt
        fetchArchive(searchTerm);
    }, []); // Lege array betekent dat dit maar één keer draait

    const handleSearch = (e) => {
        e.preventDefault();
        fetchArchive(searchTerm); // Voer de zoekopdracht uit met de huidige zoekterm
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Mijn Archief</h2>
            <div className="bg-white shadow rounded-lg border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                    <form onSubmit={handleSearch} className="flex items-center gap-4">
                        <input 
                            type="text"
                            placeholder="Zoek op opdrachtnaam..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="btn btn-primary">Zoek</button>
                    </form>
                    {/* Hier kunnen we later datumfilters toevoegen */}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Opdracht</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Klant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Drukkerij</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Datum Archivering</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-10 text-sm text-slate-500">Archief wordt geladen...</td></tr>
                            ) : jobs.length > 0 ? jobs.map(job => (
                                <tr key={job.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigateTo('job-details', job.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        <p>{job.title}</p>
                                        <p className="text-xs text-slate-500">#{job.id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{job.customer.bedrijfsnaam}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{job.winner?.bedrijfsnaam || 'N.v.t.'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(job.updatedAt).toLocaleDateString('nl-NL')}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-10 text-sm text-slate-500">Je archief is nog leeg of er zijn geen zoekresultaten.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArchivePage;