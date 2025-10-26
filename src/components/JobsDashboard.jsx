import React from 'react';
import { useNavigate } from 'react-router-dom';

const JobsDashboard = () => {
    const navigate = useNavigate();
    
    // De gestandaardiseerde class voor alle interactieve kaarten
    const cardClasses = "card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer";

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Opdrachten Dashboard</h1>
                <p className="page-subtitle">Beheer hier alles wat met uw opdrachten te maken heeft.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    onClick={() => navigate('/create-job')} 
                    className={`${cardClasses} bg-success text-success-content`}
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Nieuwe Opdracht</h2>
                        <p>Plaats een nieuwe opdracht op het platform.</p>
                    </div>
                </div>
                <div 
                    onClick={() => navigate('/my-jobs')} 
                    className={cardClasses}
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Actieve Opdrachten</h2>
                        <p>Bekijk en beheer uw lopende opdrachten.</p>
                    </div>
                </div>
                <div 
                    onClick={() => navigate('/archive')} 
                    className={cardClasses}
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Gearchiveerde Opdrachten</h2>
                        <p>Bekijk uw voltooide of geannuleerde opdrachten.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsDashboard;