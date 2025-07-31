import React from 'react';

const SettingsDashboard = ({ navigateTo, currentUser }) => {
    // Check of de gebruiker de 'manage_admin' permissie heeft
    const canManageAdmin = () => {
        if (currentUser.companyRole === 'owner') return true;
        const planPermissions = currentUser.subscription?.permissions?.map(p => p.name) || [];
        if (!planPermissions.includes('manage_admin')) return false;
        return currentUser.permissions?.some(p => p.name === 'manage_admin');
    };

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Instellingen</h1>
                <p className="page-subtitle">Beheer hier de kernvariabelen voor de calculatie-engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {canManageAdmin() && (
                    <>
                        <div onClick={() => navigateTo('machine-management')} className="card-interactive">
                            <div className="card-body items-center text-center">
                                <h2 className="card-title-lg">Machinebeheer</h2>
                                <p>Beheer uw machines en de bijbehorende kosten.</p>
                            </div>
                        </div>
                        <div onClick={() => navigateTo('labor-rate-management')} className="card-interactive">
                            <div className="card-body items-center text-center">
                                <h2 className="card-title-lg">Arbeidskosten</h2>
                                <p>Beheer de uurtarieven voor verschillende rollen.</p>
                            </div>
                        </div>
                        <div onClick={() => navigateTo('finishing-management')} className="card-interactive">
                            <div className="card-body items-center text-center">
                                <h2 className="card-title-lg">Afwerkingen</h2>
                                <p>Beheer de kosten voor afwerkingsprocessen.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SettingsDashboard;