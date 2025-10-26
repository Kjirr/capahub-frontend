import React, { useMemo } from 'react';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import ProductionDashboard from './ProductionDashboard';

// De 'DashboardSummary' component en de bijbehorende data-fetching zijn volledig verwijderd.

const Dashboard = () => {
    const { currentUser } = useAuthStore();
    const navigate = useNavigate();

    const navigateTo = (path, param = null) => {
        const url = param ? `/${path}/${param}` : `/${path}`;
        navigate(url);
    };

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
        // Owner/Admin always has access
        if (currentUser?.companyRole === 'owner' || currentUser?.role === 'admin') {
            return true;
        }
        // Check specific permission otherwise
        return currentUser?.permissions?.includes(permissionName) || false;
    };

    const isProductionUser = useMemo(() => {
        if (!currentUser) return false;
        // Don't show production dashboard for owner/admin, show main dashboard
        if (currentUser.companyRole === 'owner' || currentUser.role === 'admin') return false;
        // Show production dashboard if user has production permission
        return canAccessFeature('manage_production');
    }, [currentUser]);


    // If user is specifically a production user (and not owner/admin), show production dashboard
    if (isProductionUser) {
        return <ProductionDashboard navigateTo={navigateTo} currentUser={currentUser} />;
    }

    // Otherwise, show the main dashboard
    const cardClasses = "card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer";
    const neutralCardClasses = `${cardClasses} bg-base-100 border border-base-200 hover:bg-base-200`;

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">{getGreeting()}, {currentUser.company?.name || currentUser.name}</h1>
                <p className="page-subtitle">Hier is uw overzicht en de snelle acties voor vandaag.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Direct Quotes */}
                {canAccessFeature('manage_direct_quotes') && (
                    <>
                        <div onClick={() => navigateTo('create-direct-quote')} className={`${cardClasses} bg-primary text-primary-content`}>
                            <div className="card-body items-center text-center"><h2 className="card-title">Nieuwe Directe Offerte</h2><p>Maak een losstaande offerte.</p></div>
                        </div>
                        <div onClick={() => navigateTo('direct-quotes-list')} className={`${cardClasses} bg-secondary text-secondary-content`}>
                            <div className="card-body items-center text-center"><h2 className="card-title">Mijn Directe Offertes</h2><p>Overzicht van uw losstaande offertes.</p></div>
                        </div>
                    </>
                )}

                {/* Core Modules */}
                <div onClick={() => navigateTo('inbox')} className={neutralCardClasses}>
                    <div className="card-body items-center text-center"><h2 className="card-title">Mijn Berichten</h2><p>Bekijk hier al uw gesprekken.</p></div>
                </div>
                <div onClick={() => navigateTo('jobs-dashboard')} className={neutralCardClasses}>
                    <div className="card-body items-center text-center"><h2 className="card-title">Mijn Opdrachten</h2><p>Beheer uw geplaatste opdrachten.</p></div>
                </div>
                <div onClick={() => navigateTo('marketplace-dashboard')} className={neutralCardClasses}>
                    <div className="card-body items-center text-center"><h2 className="card-title">Marktplaats</h2><p>Overzicht van alle openbare opdrachten.</p></div>
                </div>

                {/* Marketplace Participation */}
                {canAccessFeature('submit_marketplace_quotes') && (
                    <>
                        <div onClick={() => navigateTo('quote-requests')} className={`${cardClasses} bg-accent text-accent-content`}>
                            <div className="card-body items-center text-center"><h2 className="card-title">Offerteaanvragen</h2><p>Vind opdrachten om op te reageren.</p></div>
                        </div>
                        <div onClick={() => navigateTo('my-submitted-quotes')} className={neutralCardClasses}>
                            <div className="card-body items-center text-center"><h2 className="card-title">Ingediende Offertes</h2><p>Bekijk de offertes die u heeft verstuurd.</p></div>
                        </div>
                    </>
                )}

                {/* Offer Management */}
                {canAccessFeature('manage_offers') && (
                    <div onClick={() => navigateTo('offers-dashboard')} className={neutralCardClasses}>
                        <div className="card-body items-center text-center"><h2 className="card-title">Mijn Aanbod</h2><p>Beheer aangeboden capaciteit.</p></div>
                    </div>
                )}

                {/* Archive */}
                {canAccessFeature('view_archive') && (
                    <div onClick={() => navigateTo('archive')} className={neutralCardClasses}>
                        <div className="card-body items-center text-center"><h2 className="card-title">Archief</h2><p>Bekijk afgeronde opdrachten.</p></div>
                    </div>
                )}

                {/* Production */}
                {canAccessFeature('manage_production') && (
                    <>
                        <div onClick={() => navigateTo('orders-list')} className={`${cardClasses} bg-success text-success-content`}>
                            <div className="card-body items-center text-center">
                                <h2 className="card-title">Productieorders</h2>
                                <p>Overzicht van al uw productieorders.</p>
                            </div>
                        </div>
                        <div onClick={() => navigateTo('my-production-tasks')} className={neutralCardClasses}><div className="card-body items-center text-center"><h2 className="card-title">Mijn Taken</h2><p>Jouw persoonlijke takenlijst.</p></div></div>
                        <div onClick={() => navigateTo('production-planning')} className={neutralCardClasses}><div className="card-body items-center text-center"><h2 className="card-title">Productieplanning</h2><p>Bekijk het visuele planbord.</p></div></div>
                    </>
                )}

                {/* Shipping */}
                {canAccessFeature('manage_shipping') && (
                    <div onClick={() => navigateTo('expeditie')} className={neutralCardClasses}>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Expeditie</h2>
                            <p>Beheer uitgaande zendingen.</p>
                        </div>
                    </div>
                )}

                {/* --- START NIEUWE TEGEL --- */}
                {/* Assuming billing is related to owner/admin or a specific permission */}
                {canAccessFeature('manage_billing') && ( // Gebruik 'manage_billing' of pas aan indien nodig
                    <div onClick={() => navigateTo('facturatie')} className={`${cardClasses} bg-info text-info-content`}>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Facturatie</h2>
                            <p>Beheer uw facturen.</p>
                        </div>
                    </div>
                )}
                {/* --- EINDE NIEUWE TEGEL --- */}

                {/* Settings */}
                {canAccessFeature('manage_company_settings') && (
                    <div onClick={() => navigateTo('settings-dashboard')} className={neutralCardClasses}>
                        <div className="card-body items-center text-center"><h2 className="card-title">Instellingen</h2><p>Beheer de motor van uw bedrijf.</p></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
