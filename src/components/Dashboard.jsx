// src/components/Dashboard.jsx

import React from 'react';

const Dashboard = ({ currentUser, navigateTo }) => {

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return 'Goedemorgen';
        if (currentHour < 18) return 'Goedemiddag';
        return 'Goedenavond';
    };

    if (!currentUser) {
        return <div className="loading-text">Dashboard laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">{getGreeting()}, {currentUser.bedrijfsnaam}</h1>
                <p className="page-subtitle">Hier is uw overzicht en de snelle acties voor vandaag.</p>
            </div>

            {/* De kaarten hebben nu de correcte DaisyUI styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    onClick={() => navigateTo('my-jobs')} 
                    className="card-interactive"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Opdrachten</h2>
                        <p>Bekijk en beheer uw geplaatste opdrachten.</p>
                    </div>
                </div>
                 <div 
                    onClick={() => navigateTo('create-job')} 
                    className="card-interactive"
                >
                     <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Nieuwe Opdracht</h2>
                        <p>Plaats een nieuwe opdracht op het platform.</p>
                    </div>
                </div>
                 <div 
                    onClick={() => navigateTo('marketplace')} 
                    className="card-interactive"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Marktplaats</h2>
                        <p>Bekijk openbare opdrachten van anderen.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
