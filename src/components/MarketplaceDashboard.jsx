import React from 'react';

const MarketplaceDashboard = ({ navigateTo }) => {
    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Marktplaats Dashboard</h1>
                <p className="page-subtitle">Vind nieuwe opdrachten en beheer uw offertes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    onClick={() => navigateTo('marketplace')} 
                    className="card-interactive bg-info text-info-content"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Bekijk Marktplaats</h2>
                        <p>Zoek naar openbare opdrachten van andere bedrijven.</p>
                    </div>
                </div>
                <div 
                    onClick={() => navigateTo('my-submitted-quotes')} 
                    className="card-interactive"
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Ingediende Offertes</h2>
                        <p>Bekijk het overzicht van al uw uitgebrachte offertes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceDashboard;