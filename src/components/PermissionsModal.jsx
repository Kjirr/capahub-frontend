// src/components/PermissionsModal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const PermissionsModal = ({ member, isOpen, onClose, showNotification, onPermissionsUpdate }) => {
    const [allPermissions, setAllPermissions] = useState([]);
    const [memberPermissionIds, setMemberPermissionIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const fetchPermissionsData = useCallback(async () => {
        if (!member) return;
        setIsLoading(true);
        try {
            // Haal alle mogelijke permissies op
            const allPermsData = await apiRequest('/team/permissions/all', 'GET');
            setAllPermissions(allPermsData);

            // Haal de huidige permissies van het geselecteerde lid op
            const memberPermsData = await apiRequest(`/team/${member.id}/permissions`, 'GET');
            // Sla de ID's op in een Set voor snelle lookups (voor de checkboxes)
            setMemberPermissionIds(new Set(memberPermsData.map(p => p.id)));

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [member, showNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchPermissionsData();
        }
    }, [isOpen, fetchPermissionsData]);

    const handleCheckboxChange = (permissionId) => {
        const newSet = new Set(memberPermissionIds);
        if (newSet.has(permissionId)) {
            newSet.delete(permissionId);
        } else {
            newSet.add(permissionId);
        }
        setMemberPermissionIds(newSet);
    };

    const handleSave = async () => {
        if (!member) return;
        setIsLoading(true);
        try {
            const permissionIdsArray = Array.from(memberPermissionIds);
            await apiRequest(`/team/${member.id}/permissions`, 'PUT', { permissionIds: permissionIdsArray });
            showNotification('Rechten succesvol opgeslagen.', 'success');
            onPermissionsUpdate(); // Callback om de hoofdlijst te vernieuwen
            onClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="card bg-base-100 shadow-xl w-full max-w-lg">
                <div className="card-body">
                    <h2 className="card-title-lg">Rechten Beheren</h2>
                    <p className="text-sm mt-2 mb-6">Wijs rechten toe aan teamlid: <strong>{member?.name}</strong></p>
                    
                    {isLoading ? <span className="loading loading-spinner"></span> : (
                        <div className="space-y-2">
                            {allPermissions.map(permission => (
                                <div className="form-control" key={permission.id}>
                                    <label className="label cursor-pointer">
                                        <div>
                                            <span className="label-text font-bold">{permission.name}</span>
                                            <p className="text-xs text-gray-500">{permission.description}</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="checkbox checkbox-primary"
                                            checked={memberPermissionIds.has(permission.id)}
                                            onChange={() => handleCheckboxChange(permission.id)}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="card-actions justify-end mt-6">
                        <button onClick={onClose} className="btn btn-ghost" disabled={isLoading}>Annuleren</button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsModal;