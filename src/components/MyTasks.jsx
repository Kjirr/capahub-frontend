// src/components/MyTasks.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const MyTasks = ({ showNotification, navigateTo, currentUser }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/tasks/my-tasks', 'GET');
            setTasks(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchTasks();
        }
    }, [currentUser, fetchTasks]);

    if (isLoading) return <div className="loading-text">Mijn taken laden...</div>;

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Mijn Taken</h1>
                <p className="page-subtitle">Dit zijn de taken die momenteel aan u zijn toegewezen.</p>
            </div>

            {tasks.length === 0 ? (
                <div className="card-placeholder">
                    <p>U heeft momenteel geen toegewezen taken.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('submit-quote', job.id)}
                            className="card-interactive"
                        >
                            <div className="card-body">
                                <h2 className="card-title-lg">Offerte maken voor: {job.title}</h2>
                                <p className="text-sm text-base-content/70">Klant: {job.company.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTasks;
