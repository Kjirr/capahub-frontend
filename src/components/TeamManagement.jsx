// src/components/TeamManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

// Sub-component voor de uitnodigingsmodal
const InviteModal = ({ isOpen, onClose, onInvite, showNotification }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async () => {
        if (!name || !email) {
            showNotification('Naam en e-mail zijn verplicht.', 'warn');
            return;
        }
        await onInvite({ name, email });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    <h2 className="card-title">Nieuw Teamlid Uitnodigen</h2>
                    <input type="text" placeholder="Volledige naam" value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-full mt-4" />
                    <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)} className="input input-bordered w-full mt-4" />
                    <div className="card-actions justify-end mt-6">
                        <button onClick={onClose} className="btn btn-ghost">Annuleren</button>
                        <button onClick={handleSubmit} className="btn btn-primary">Verstuur Uitnodiging</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeamManagement = ({ currentUser, showNotification }) => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/team', 'GET');
            setMembers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchMembers();
        }
    }, [currentUser, fetchMembers]);

    const handleInvite = async (inviteData) => {
        try {
            const data = await apiRequest('/team/invite', 'POST', inviteData);
            showNotification(data.message, 'success');
            fetchMembers(); // Herlaad de lijst
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div className="text-center p-10">Team laden...</div>;

    return (
        <>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Team Beheer</h1>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title">Teamleden</h2>
                            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">Nieuw Lid Uitnodigen</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>E-mail</th>
                                        <th>Rol</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(member => (
                                        <tr key={member.id} className="hover">
                                            <td>{member.name}</td>
                                            <td>{member.email}</td>
                                            <td><span className="badge badge-ghost">{member.companyRole}</span></td>
                                            <td><span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{member.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <InviteModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onInvite={handleInvite}
                showNotification={showNotification}
            />
        </>
    );
};

export default TeamManagement;
