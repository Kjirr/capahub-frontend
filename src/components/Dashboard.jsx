// src/components/Dashboard.jsx - Verbeterde versie

import React from 'react';

const Dashboard = ({ currentUser, navigateTo }) => {
    // VOEG DEZE CONTROLE TOE AAN HET BEGIN
    if (!currentUser) {
        // Toon een laadstatus of niets terwijl de app navigeert
        return <p>Laden...</p>; 
    }

    // De rest van de code wordt alleen uitgevoerd als currentUser bestaat
    return (
        <div>
            <div className="mb-8 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                <h2 className="text-3xl font-bold text-slate-800">
                    Goedemorgen, {currentUser.bedrijfsnaam}
                </h2>
                <p className="text-slate-500 mt-1">
                    Hier is je overzicht en de snelle acties voor vandaag.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="card card-clickable" onClick={() => navigateTo('create-job')}>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Ik heb een opdracht</h3>
                    <p className="text-gray-600 mb-4">Plaats een nieuwe drukwerkopdracht en ontvang snel offertes.</p>
                    <span className="font-semibold text-blue-600">Plaats Opdracht →</span>
                </div>
                <div className="card card-clickable" onClick={() => navigateTo('offer-capacity')}>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Ik bied capaciteit aan</h3>
                    <p className="text-gray-600 mb-4">Heeft u overcapaciteit? Bied deze hier aan andere partijen aan.</p>
                    <span className="font-semibold text-blue-600">Bied Capaciteit Aan →</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;