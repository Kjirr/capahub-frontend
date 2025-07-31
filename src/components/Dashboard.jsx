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

    const canAccessFeature = (permissionName) => {
        const planPermissions = currentUser.subscription?.permissions?.map(p => p.name) || [];
        const planHasPermission = planPermissions.includes(permissionName);
        if (!planHasPermission) return false;
        if (currentUser.companyRole === 'owner') return true;
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
                {canAccessFeature('manage_production') && ( <div onClick={() => navigateTo('production-kanban')} className="card-interactive" style={{backgroundColor: '#4a00e0', color: 'white'}}><div className="card-body items-center text-center"><h2 className="card-title-lg">Productieplanning</h2><p>Bekijk het visuele planbord.</p></div></div> )}
                
                {/* --- NIEUWE KAART VOOR INSTELLINGEN --- */}
                {canAccessFeature('manage_admin') && (
                     <div onClick={() => navigateTo('settings-dashboard')} className="card-interactive border-2 border-gray-300">
                        <div className="card-body items-center text-center">
                            <h2 className="card-title-lg">Instellingen</h2>
                            <p>Beheer de calculatie-engine en meer.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;