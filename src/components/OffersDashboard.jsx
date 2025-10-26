import React from 'react';
// --- START WIJZIGING: useNavigate importeren ---
import { useNavigate } from 'react-router-dom';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const OffersDashboard = () => {
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---
    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Mijn Aanbod Dashboard</h1>
                <p className="page-subtitle">Beheer hier de capaciteit die u aanbiedt op de marktplaats.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* --- START WIJZIGING: 'navigate' gebruiken met correcte URL --- */}
                <div 
                    onClick={() => navigate('/create-offer')} 
                    className="card-interactive bg-teal-600 text-white"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Nieuw Aanbod Plaatsen</h2>
                        <p>Bied uw beschikbare machinecapaciteit aan.</p>
                    </div>
                </div>
                <div 
                    onClick={() => navigate('/my-offers')} 
                    className="card-interactive"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Geplaatste Aanbod</h2>
                        <p>Bekijk en beheer uw actieve aanbiedingen.</p>
                    </div>
                </div>
                {/* --- EINDE WIJZIGING --- */}
            </div>
        </div>
    );
};

export default OffersDashboard;