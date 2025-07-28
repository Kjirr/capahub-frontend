// src/components/ProductionJobDetails.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const ProductionJobDetails = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Nieuwe state voor het toevoegen van een stap
    const [newStepTitle, setNewStepTitle] = useState('');

    const fetchDetails = useCallback(async () => {
        // We zetten de loading state niet opnieuw, om flikkeren te voorkomen bij updates
        try {
            const data = await apiRequest(`/jobs/${jobId}`, 'GET');
            setJob(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        if (currentUser && jobId) {
            fetchDetails();
        }
    }, [currentUser, jobId, fetchDetails]);

    const handleStatusChange = async (stepId, newStatus) => {
        try {
            await apiRequest(`/productions/steps/${stepId}`, 'PUT', { status: newStatus });
            showNotification('Status succesvol bijgewerkt.');
            fetchDetails(); // Herlaad de details om de wijziging te zien
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    // NIEUWE FUNCTIE: Voegt een nieuwe stap toe
    const handleAddStep = async (e) => {
        e.preventDefault();
        if (!newStepTitle.trim()) {
            showNotification('Vul een titel in voor de stap.', 'warn');
            return;
        }
        try {
            const newOrder = job.productionSteps.length + 1;
            await apiRequest(`/productions/${jobId}/steps`, 'POST', { title: newStepTitle, order: newOrder });
            showNotification('Productiestap succesvol toegevoegd.');
            setNewStepTitle(''); // Maak het invoerveld leeg
            fetchDetails(); // Herlaad de details
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    if (isLoading) return <div className="loading-text">Productiedetails laden...</div>;
    if (!job) return <div className="loading-text">Productie niet gevonden.</div>;

    return (
        <div className="page-container">
            <h1 className="text-3xl font-bold mb-2">Productieplanning: {job.title}</h1>
            <p className="text-base-content/70 mb-6">Klant: {job.customer.bedrijfsnaam}</p>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Productiestappen</h2>
                    <div className="space-y-4">
                        {job.productionSteps.length > 0 ? (
                            job.productionSteps.map(step => (
                                <div key={step.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <span>{step.title}</span>
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex={0} className="btn btn-sm m-1">{step.status}</label>
                                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                            <li><a onClick={() => handleStatusChange(step.id, 'pending')}>Wachtend</a></li>
                                            <li><a onClick={() => handleStatusChange(step.id, 'in_progress')}>In Uitvoering</a></li>
                                            <li><a onClick={() => handleStatusChange(step.id, 'completed')}>Voltooid</a></li>
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-base-content/50">Er zijn nog geen productiestappen aangemaakt voor deze opdracht.</p>
                        )}
                    </div>

                    {/* --- NIEUW FORMULIER OM STAPPEN TOE TE VOEGEN --- */}
                    <div className="border-t pt-6 mt-6">
                        <h3 className="font-semibold mb-2">Nieuwe Stap Toevoegen</h3>
                        <form onSubmit={handleAddStep} className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder="bv. Drukken, Afwerking, Transport" 
                                className="form-input"
                                value={newStepTitle}
                                onChange={(e) => setNewStepTitle(e.target.value)}
                            />
                            <button type="submit" className="btn-primary">Toevoegen</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionJobDetails;
