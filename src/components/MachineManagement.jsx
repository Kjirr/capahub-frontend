import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import MachineModal from './MachineModal';

const MachineManagement = ({ showNotification, navigateTo }) => {
    const [machines, setMachines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [machineToEdit, setMachineToEdit] = useState(null);

    const fetchMachines = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/calculation-settings/machines', 'GET');
            setMachines(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);
    
    const openCreateModal = () => {
        setMachineToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (machine) => {
        setMachineToEdit(machine);
        setIsModalOpen(true);
    };

    const handleDelete = async (machineId, machineName) => {
        if (!window.confirm(`Weet u zeker dat u machine '${machineName}' wilt verwijderen?`)) return;

        try {
            await apiRequest(`/calculation-settings/machines/${machineId}`, 'DELETE');
            showNotification(`Machine '${machineName}' succesvol verwijderd.`, 'success');
            fetchMachines();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading && machines.length === 0) {
        return <div className="loading-text">Machines laden...</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">Machinebeheer</h1>
                        <p className="page-subtitle">Beheer hier de machines en hun kosten voor de calculatie-engine.</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">← Terug naar Instellingen</button>
                         <button onClick={openCreateModal} className="btn btn-primary">Nieuwe Machine</button>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th className="text-right">Opstarttijd (min)</th>
                                        <th className="text-right">Snelheid (p/u)</th>
                                        <th className="text-right">Kosten (€/u)</th>
                                        <th className="text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {machines.length > 0 ? machines.map(machine => (
                                        <tr key={machine.id} className="hover">
                                            <td className="font-bold">{machine.name}</td>
                                            <td className="text-right">{machine.setupTimeMinutes}</td>
                                            <td className="text-right">{machine.runSpeedPerHour}</td>
                                            <td className="text-right">{machine.costPerHour.toFixed(2)}</td>
                                            <td className="text-right space-x-2">
                                                <button onClick={() => openEditModal(machine)} className="btn btn-outline btn-sm">Bewerken</button>
                                                <button onClick={() => handleDelete(machine.id, machine.name)} className="btn btn-error btn-sm">Verwijderen</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center">Nog geen machines aangemaakt.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <MachineModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchMachines}
                showNotification={showNotification}
                machineToEdit={machineToEdit}
            />
        </>
    );
};

export default MachineManagement;