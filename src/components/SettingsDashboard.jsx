import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const SettingsDashboard = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();

    const canAccessSetting = (permissionName) => {
        if (!currentUser) return false;
        if (currentUser.companyRole === 'owner' || currentUser.role === 'admin') return true;
        return currentUser.permissions?.includes(permissionName);
    };

    // De gestandaardiseerde class voor alle interactieve kaarten
    const cardClasses = "card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer";

    return (
        <div className="page-container">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="page-title">Instellingen</h1>
                    <p className="page-subtitle">Beheer hier de kerncomponenten van uw bedrijfsvoering.</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                    &larr; Terug naar Dashboard
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Algemeen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/company-profile')} className={`${cardClasses} bg-primary text-primary-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Bedrijfsprofiel & Logo</h2>
                            <p>Beheer uw algemene gegevens en bedrijfsinfo.</p>
                        </div>
                    </div>
                )}
                 {canAccessSetting('manage_team') && (
                    <div onClick={() => navigate('/team-management')} className={`${cardClasses} bg-base-100`}>
                        <div className="card-body">
                            <h2 className="card-title">Teamleden & Rechten</h2>
                            <p>Beheer wie toegang heeft tot wat binnen uw bedrijf.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/automation-settings')} className={`${cardClasses} bg-neutral text-neutral-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Automatisering</h2>
                            <p>Beheer automatische workflows en acties.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/document-templates')} className={`${cardClasses} bg-base-300 text-base-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Document Templates</h2>
                            <p>Beheer de layout van je documenten.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/shipping-settings')} className={`${cardClasses} bg-blue-500 text-white`}>
                        <div className="card-body">
                            <h2 className="card-title">Verzendinstellingen</h2>
                            <p>Koppel uw Sendcloud account.</p>
                        </div>
                    </div>
                )}
                {/* --- START NIEUWE TEGEL (PROMOTIE) --- */}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/promotie-beheer')} className={`${cardClasses} bg-purple-600 text-white`}>
                        <div className="card-body">
                            <h2 className="card-title">Promotie Content</h2>
                            <p>Beheer de <code>{"{{reclame}}"}</code> inhoud.</p>
                        </div>
                    </div>
                )}
                {/* --- EINDE NIEUWE TEGEL --- */}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/asset-manager')} className={`${cardClasses} bg-base-200 text-base-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Asset Gallerij</h2>
                            <p>Beheer afbeeldingen geüpload via de editor.</p>
                        </div>
                    </div>
                )}
            </div>

            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Inkoop & Logistiek</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {canAccessSetting('manage_materials') && (
                    <div onClick={() => navigate('/material-management')} className={`${cardClasses} bg-info text-info-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Materiaalbeheer</h2>
                            <p>Beheer uw materialen en prijzen.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_warehouse') && (
                    <div onClick={() => navigate('/warehouse-management')} className={`${cardClasses} bg-secondary text-secondary-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Magazijnbeheer</h2>
                            <p>Beheer locaties en voorraad.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_purchasing') && (
                    <div onClick={() => navigate('/purchase-order-management')} className={`${cardClasses} bg-warning text-warning-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Inkoopbeheer</h2>
                            <p>Beheer alle inkooporders.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_purchasing') && (
                    <div onClick={() => navigate(`/partner-management/SUPPLIER`)} className={`${cardClasses} bg-warning text-warning-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Leveranciersbeheer</h2>
                            <p>Beheer uw leveranciers.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate(`/partner-management/COURIER`)} className={`${cardClasses} bg-warning text-warning-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Koeriersbeheer</h2>
                            <p>Beheer uw lijst met koeriers.</p>
                        </div>
                    </div>
                )}
            </div>

            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Visuele Calculator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {canAccessSetting('manage_company_settings') && (
                    <div onClick={() => navigate('/resource-management')} className={`${cardClasses} bg-info text-info-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Stap 1: Resource Management</h2>
                            <p>Beheer je 'bouwblokken': machines, arbeid en apparatuur.</p>
                        </div>
                    </div>
                )}
                {canAccessSetting('manage_product_templates') && (
                    <div onClick={() => navigate('/product-template-management')} className={`${cardClasses} bg-accent text-accent-content`}>
                        <div className="card-body">
                            <h2 className="card-title">Stap 2: Productbibliotheek</h2>
                            <p>Stel hier je product-recepten samen met de visuele bouwer.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsDashboard;