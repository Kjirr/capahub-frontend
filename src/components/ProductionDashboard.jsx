import React from 'react';

const ProductionDashboard = ({ navigateTo, currentUser }) => {
    // De gestandaardiseerde class voor alle interactieve kaarten
    const cardClasses = "card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer";

    // Definiëer de tegels voor het productie dashboard
    const tiles = [
        {
            title: 'Mijn Taken',
            description: 'Bekijk en werk aan de taken die aan jou zijn toegewezen.',
            navigateTo: 'my-production-tasks',
            permission: 'view_production_dashboard',
            colorClasses: 'bg-primary text-primary-content'
        },
        {
            title: 'Productie Planbord',
            description: 'Bekijk de status van alle opdrachten in de productie.',
            navigateTo: 'production-kanban',
            permission: 'view_production_dashboard',
            colorClasses: 'bg-secondary text-secondary-content'
        },
        // Toekomstige tegels kunnen hier worden toegevoegd
        // {
        //     title: 'Uren Registratie',
        //     description: 'Bekijk je geklokte uren en rapportages.',
        //     navigateTo: 'time-tracking',
        //     permission: 'view_production_dashboard'
        // }
    ];
    
    // Filter tegels op basis van permissies van de gebruiker (toekomstbestendig)
    const canAccess = (permissionName) => {
        // Voor nu geven we toegang, later kunnen we dit koppelen aan permissies
        return true; 
    };

    const accessibleTiles = tiles.filter(tile => canAccess(tile.permission));

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Productie Dashboard</h1>
                <p className="page-subtitle">Welkom, {currentUser?.name}. Kies hieronder wat je wilt doen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleTiles.map(tile => (
                    <div 
                        key={tile.navigateTo}
                        onClick={() => navigateTo(tile.navigateTo)} 
                        className={`${cardClasses} ${tile.colorClasses} h-full`}
                    >
                        <div className="card-body items-center text-center">
                            <h2 className="card-title-lg">{tile.title}</h2>
                            <p>{tile.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductionDashboard;