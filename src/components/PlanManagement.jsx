// src/components/PlanManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getAdminPlans, getAllPermissions, updatePlan, deletePlan } from '@/api';
import PlanModal from './PlanModal';

const permissionDisplayMap = {
    'submit_marketplace_quotes': 'Marktplaats Offertes',
    'manage_offers': 'Mijn Aanbod',
    'view_archive': 'Archief',
    'manage_direct_quotes': 'Directe Offertes',
    'manage_production': 'Productie',
    'manage_team': 'Team Beheer',
    'manage_materials': 'Materiaal',
    'manage_warehouse': 'Magazijn',
    'manage_purchasing': 'Inkoop',
    'manage_admin': 'Instellingen',
    'manage_product_templates': 'Eigen Productbibliotheek',
    'view_orders': 'Orders Inzien',
    'manage_shipping': 'Expeditie Beheer',
};

const PlanManagement = ({ showNotification, navigateTo }) => {
    const [plans, setPlans] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingPlanId, setSavingPlanId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [plansData, permissionsData] = await Promise.all([
                getAdminPlans(),
                getAllPermissions()
            ]);
            setPlans(plansData);
            setPermissions(permissionsData.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePermissionChange = (planId, permissionId, isChecked) => {
        setPlans(currentPlans =>
            currentPlans.map(plan => {
                if (plan.id === planId) {
                    const permission = permissions.find(p => p.id === permissionId);
                    if (!permission) return plan;
                    
                    const currentPermissions = plan.permissions || [];
                    let updatedPermissions;
                    
                    if (isChecked) {
                        if (!currentPermissions.some(p => p.id === permissionId)) {
                            updatedPermissions = [...currentPermissions, permission];
                        } else {
                            updatedPermissions = currentPermissions;
                        }
                    } else {
                        updatedPermissions = currentPermissions.filter(p => p.id !== permissionId);
                    }
                    return { ...plan, permissions: updatedPermissions };
                }
                return plan;
            })
        );
    };

    // --- START WIJZIGING: Nieuwe functies voor alles selecteren/deselecteren ---
    const handleSelectAll = (planId) => {
        setPlans(currentPlans =>
            currentPlans.map(plan => {
                if (plan.id === planId) {
                    // Geef dit plan alle beschikbare permissies
                    return { ...plan, permissions: [...permissions] };
                }
                return plan;
            })
        );
    };

    const handleDeselectAll = (planId) => {
        setPlans(currentPlans =>
            currentPlans.map(plan => {
                if (plan.id === planId) {
                    // Maak de permissielijst voor dit plan leeg
                    return { ...plan, permissions: [] };
                }
                return plan;
            })
        );
    };
    // --- EINDE WIJZIGING ---

    const handleSponsorshipChange = (planId, isChecked) => {
        setPlans(currentPlans =>
            currentPlans.map(plan => 
                plan.id === planId ? { ...plan, isSponsored: isChecked } : plan
            )
        );
    };

    const handleSaveChanges = async (planId) => {
        setSavingPlanId(planId);
        const planToUpdate = plans.find(p => p.id === planId);
        
        if (!planToUpdate) {
            showNotification("Kon het abonnement niet vinden om op te slaan.", "error");
            setSavingPlanId(null);
            return;
        }

        const payload = {
            name: planToUpdate.name,
            description: planToUpdate.description,
            isSponsored: planToUpdate.isSponsored || false,
            permissionIds: (planToUpdate.permissions || []).map(p => p.id),
        };
        
        try {
            const serverResponse = await updatePlan(planId, payload);
            const updatedPlanFromServer = serverResponse.data || serverResponse;

            setPlans(currentPlans => 
                currentPlans.map(p => 
                    p.id === planId ? updatedPlanFromServer : p
                )
            );
            
            showNotification(`Instellingen voor '${planToUpdate.name}' succesvol opgeslagen.`, 'success');
        } catch (error) {
            showNotification(`Opslaan mislukt: ${error.message}`, 'error');
            await fetchData();
        } finally {
            setSavingPlanId(null);
        }
    };

    const handleDeletePlan = async (planId, planName) => {
        if (window.confirm(`Weet u zeker dat u het abonnement "${planName}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            try {
                await deletePlan(planId);
                showNotification(`Abonnement "${planName}" succesvol verwijderd.`, 'success');
                setPlans(currentPlans => currentPlans.filter(p => p.id !== planId));
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    if (isLoading) return <div className="loading-text">Abonnementen laden...</div>;

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Abonnementenbeheer</h1>
                        <p className="page-subtitle">Beheer hier welke modules (rechten) bij welk abonnement horen.</p>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => navigateTo('admin-dashboard')} className="btn btn-ghost">← Terug</button>
                        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                            Nieuw Plan Toevoegen
                        </button>
                    </div>
                </div>

                <div className="space-y-2 mt-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="collapse collapse-arrow bg-base-200 rounded-lg">
                            <input type="checkbox" name="my-accordion" /> 
                            <div className="collapse-title text-xl font-medium">
                                {plan.name} Abonnement
                            </div>
                            <div className="collapse-content bg-base-100">
                                <div className="p-4">
                                    <div className="mb-6 pb-6 border-b">
                                        <h3 className="font-bold mb-4">Marketing Opties</h3>
                                        <div className="form-control">
                                            <label className="label cursor-pointer p-4 border rounded-lg hover:bg-base-200">
                                                <div>
                                                    <span className="label-text font-bold text-base">Gesponsorde Plaatsing</span>
                                                    <p className="text-xs text-base-content/70 mt-1">Geeft opdrachten een 'Uitgelicht' status op de marktplaats.</p>
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="toggle toggle-success" 
                                                    checked={plan.isSponsored || false}
                                                    onChange={(e) => handleSponsorshipChange(plan.id, e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* --- START WIJZIGING: Knoppen toegevoegd --- */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold">Functionele Rechten</h3>
                                        <div className="space-x-2">
                                            <button onClick={() => handleSelectAll(plan.id)} className="btn btn-sm btn-ghost">Selecteer Alles</button>
                                            <button onClick={() => handleDeselectAll(plan.id)} className="btn btn-sm btn-ghost">Deselecteer Alles</button>
                                        </div>
                                    </div>
                                    {/* --- EINDE WIJZIGING --- */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {permissions.map(permission => (
                                            <div className="form-control" key={permission.id}>
                                                <label className="label cursor-pointer p-4 border rounded-lg hover:bg-base-200">
                                                    <div>
                                                        <span className="label-text font-bold text-base">
                                                            {permissionDisplayMap[permission.name] || permission.name}
                                                        </span>
                                                        <p className="text-xs text-base-content/70 mt-1">{permission.description}</p>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-primary"
                                                        checked={(plan.permissions || []).some(p => p.id === permission.id)}
                                                        onChange={(e) => handlePermissionChange(plan.id, permission.id, e.target.checked)}
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right mt-6 space-x-2">
                                        {!['FREE', 'PRO', 'PREMIUM'].includes(plan.name) && (
                                            <button
                                                className="btn btn-error btn-outline"
                                                onClick={() => handleDeletePlan(plan.id, plan.name)}
                                            >
                                                Verwijderen
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => handleSaveChanges(plan.id)}
                                            disabled={savingPlanId === plan.id}
                                        >
                                            {savingPlanId === plan.id ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <PlanModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchData}
                showNotification={showNotification}
                allPermissions={permissions}
            />
        </>
    );
};

export default PlanManagement;