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

    if (isLoading) return <div className="text-center p-10">Mijn taken laden...</div>;

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Mijn Taken</h1>
                <p className="text-base-content/70 mt-2">Dit zijn de taken die momenteel aan u zijn toegewezen.</p>
            </div>

            {tasks.length === 0 ? (
                <div className="card bg-base-100 text-center p-10">
                    <p>U heeft momenteel geen toegewezen taken.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => navigateTo('submit-quote', job.id)}
                            className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <div className="card-body">
                                <h2 className="card-title">Offerte maken voor: {job.title}</h2>
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
