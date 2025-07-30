import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const PlanManagement = ({ showNotification }) => {
    const [plans, setPlans] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [plansData, permissionsData] = await Promise.all([
                apiRequest('/admin/plans', 'GET'),
                apiRequest('/admin/permissions', 'GET')
            ]);
            setPlans(plansData);
            setPermissions(permissionsData);
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
                    const currentPermissionIds = new Set(plan.permissions.map(p => p.id));
                    if (isChecked) {
                        currentPermissionIds.add(permissionId);
                    } else {
                        currentPermissionIds.delete(permissionId);
                    }
                    const updatedPermissions = Array.from(currentPermissionIds).map(id => 
                        permissions.find(p => p.id === id)
                    );
                    return { ...plan, permissions: updatedPermissions };
                }
                return plan;
            })
        );
    };

    const handleSaveChanges = async (planId) => {
        const planToUpdate = plans.find(p => p.id === planId);
        if (!planToUpdate) return;

        const permissionIds = planToUpdate.permissions.map(p => p.id);
        
        try {
            await apiRequest(`/admin/plans/${planId}/permissions`, 'PUT', { permissionIds });
            showNotification(`Rechten voor ${planToUpdate.name} succesvol opgeslagen.`, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div className="loading-text">Abonnementen laden...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Abonnementenbeheer</h1>
            <p className="page-subtitle">Beheer hier welke modules (rechten) bij welk abonnement horen.</p>

            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="w-1/4">Abonnement</th>
                                    {permissions.map(p => <th key={p.id} className="text-center">{p.name}</th>)}
                                    <th className="text-center">Acties</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map(plan => (
                                    <tr key={plan.id} className="hover">
                                        <td className="font-bold text-lg">{plan.name}</td>
                                        {permissions.map(p => (
                                            <td key={p.id} className="text-center">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={plan.permissions.some(planPerm => planPerm.id === p.id)}
                                                    onChange={(e) => handlePermissionChange(plan.id, p.id, e.target.checked)}
                                                    // --- DE AANPASSING ---
                                                    // Schakel de checkbox uit als het plan 'FREE' is
                                                    disabled={plan.name === 'FREE'}
                                                />
                                            </td>
                                        ))}
                                        <td className="text-center">
                                            <div title={plan.name === 'FREE' ? 'De inhoud van het FREE abonnement staat vast en kan niet worden gewijzigd.' : ''}>
                                                <button 
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleSaveChanges(plan.id)}
                                                    // --- DE AANPASSING ---
                                                    // Schakel de knop uit als het plan 'FREE' is
                                                    disabled={plan.name === 'FREE'}
                                                >
                                                    Opslaan
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanManagement;