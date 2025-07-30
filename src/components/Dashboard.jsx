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

    // --- DE DEFINITIEVE, STRIKTE FUNCTIE ---
    const canAccessFeature = (permissionName) => {
        // Haal de permissies op die bij het abonnement van het bedrijf horen (uit de token).
        const planPermissions = currentUser.subscription?.permissions?.map(p => p.name) || [];
        
        // 1. Controleert het abonnement: Geeft het plan wel toegang tot deze module?
        const planHasPermission = planPermissions.includes(permissionName);

        // Als een module niet in het plan zit, heeft NIEMAND toegang.
        if (!planHasPermission) {
            return false;
        }

        // 2. Als het plan toegang geeft, is de 'owner' direct gemachtigd.
        if (currentUser.companyRole === 'owner') {
            return true;
        }

        // 3. Voor 'members' moet de permissie ook persoonlijk zijn toegewezen.
        const userHasPermission = currentUser.permissions?.some(p => p.name === permissionName);
        
        return userHasPermission;
    };

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">{getGreeting()}, {currentUser.company?.name || currentUser.name}</h1>
                <p className="page-subtitle">Hier is uw overzicht en de snelle acties voor vandaag.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* --- Basis Modules (FREE) --- */}
                <div onClick={() => navigateTo('jobs-dashboard')} className="card-interactive">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Opdrachten</h2>
                        <p>Beheer uw geplaatste opdrachten.</p>
                    </div>
                </div>
                <div onClick={() => navigateTo('marketplace-dashboard')} className="card-interactive">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Marktplaats</h2>
                        <p>Vind opdrachten en beheer uw offertes.</p>
                    </div>
                </div>
                <div onClick={() => navigateTo('offers-dashboard')} className="card-interactive">
                    <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Mijn Aanbod</h2>
                        <p>Beheer uw aangeboden capaciteit.</p>
                    </div>
                </div>
                 <div onClick={() => navigateTo('create-job')} className="card-interactive">
                     <div className="card-body items-center text-center">
                        <h2 className="card-title-lg">Nieuwe Opdracht</h2>
                        <p>Plaats een nieuwe opdracht op het platform.</p>
                    </div>
                </div>
                
                {/* --- 'Slimme' Kaarten (vereisen betaald plan + permissie) --- */}
                {canAccessFeature('manage_team') && ( <div onClick={() => navigateTo('team-management')} className="card-interactive bg-primary text-primary-content"><div className="card-body items-center text-center"><h2 className="card-title-lg">Team Beheren</h2><p>Beheer teamleden en hun rechten.</p></div></div> )}
                {canAccessFeature('manage_materials') && ( <div onClick={() => navigateTo('material-management')} className="card-interactive bg-secondary text-secondary-content"><div className="card-body items-center text-center"><h2 className="card-title-lg">Materiaalbeheer</h2><p>Beheer materialen en prijzen.</p></div></div> )}
                {canAccessFeature('manage_purchasing') && ( <> <div onClick={() => navigateTo('supplier-management')} className="card-interactive bg-accent text-accent-content"><div className="card-body items-center text-center"><h2 className="card-title-lg">Leveranciersbeheer</h2><p>Beheer de leveranciers van uw bedrijf.</p></div></div> <div onClick={() => navigateTo('purchase-order-management')} className="card-interactive bg-accent text-accent-content"><div className="card-body items-center text-center"><h2 className="card-title-lg">Inkoopbeheer</h2><p>Beheer alle inkooporders.</p></div></div> </> )}
                {canAccessFeature('manage_warehouse') && ( <div onClick={() => navigateTo('warehouse-management')} className="card-interactive bg-info text-info-content"><div className="card-body items-center text-center"><h2 className="card-title-lg">Magazijnbeheer</h2><p>Beheer magazijnlocaties en voorraad.</p></div></div> )}
            </div>
        </div>
    );
};

export default Dashboard;