// src/components/TeamManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import PermissionsModal from './PermissionsModal'; // NIEUW: Importeer de modal

// InviteModal sub-component blijft ongewijzigd...
const InviteModal = ({ isOpen, onClose, onInvite, showNotification }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const handleSubmit = async () => { if (!name || !email) { showNotification('Naam en e-mail zijn verplicht.', 'warn'); return; } await onInvite({ name, email }); onClose(); setName(''); setEmail(''); };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    <h2 className="card-title-lg">Nieuw Teamlid Uitnodigen</h2>
                    <p className="text-sm mt-2">Het teamlid ontvangt een e-mail om een wachtwoord in te stellen en het account te activeren.</p>
                    <input type="text" placeholder="Volledige naam" value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-full mt-4" />
                    <input type="email" placeholder="E-mailadres" value={email} onChange={e => setEmail(e.target.value)} className="input input-bordered w-full mt-2" />
                    <div className="card-actions justify-end mt-6">
                        <button onClick={onClose} className="btn btn-ghost">Annuleren</button>
                        <button onClick={handleSubmit} className="btn btn-primary">Verstuur Uitnodiging</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Hoofdcomponent
const TeamManagement = ({ currentUser, showNotification }) => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    
    // --- NIEUWE STATE VOOR PERMISSIONS MODAL ---
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const [directAddName, setDirectAddName] = useState('');
    const [directAddPassword, setDirectAddPassword] = useState('');
    const [isAddingDirectly, setIsAddingDirectly] = useState(false);

    const fetchMembers = useCallback(async () => {
        if (!isLoading) setIsLoading(true);
        try {
            const data = await apiRequest('/team', 'GET');
            setMembers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, isLoading]);

    useEffect(() => {
        if (currentUser) {
            fetchMembers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const handleInvite = async (inviteData) => { /* ... ongewijzigd ... */ try { const data = await apiRequest('/team/invite', 'POST', inviteData); showNotification(data.message, 'success'); fetchMembers(); } catch (error) { showNotification(error.message, 'error'); }};
    const handleDirectAdd = async (e) => { /* ... ongewijzigd ... */ e.preventDefault(); if (!directAddName || !directAddPassword) { showNotification('Naam en wachtwoord zijn verplicht.', 'warn'); return; } setIsAddingDirectly(true); try { const data = await apiRequest('/team/add-direct', 'POST', { name: directAddName, password: directAddPassword }); showNotification(data.message, 'success'); fetchMembers(); setDirectAddName(''); setDirectAddPassword(''); } catch (error) { showNotification(error.message, 'error'); } finally { setIsAddingDirectly(false); }};
    const handleSuspend = async (memberId, memberName) => { /* ... ongewijzigd ... */ if (!window.confirm(`Weet u zeker dat u teamlid '${memberName}' wilt deactiveren?`)) { return; } try { const data = await apiRequest(`/team/${memberId}`, 'DELETE'); showNotification(data.message, 'success'); fetchMembers(); } catch (error) { showNotification(error.message, 'error'); }};

    // Functie om de permissions modal te openen
    const openPermissionsModal = (member) => {
        setSelectedMember(member);
        setIsPermissionsModalOpen(true);
    };

    if (isLoading && members.length === 0) return <div className="loading-text">Team laden...</div>;

    return (
        <>
            <div className="page-container">
                <h1 className="page-title mb-6">Team Beheer</h1>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="card-title-lg">Huidige Teamleden</h2>
                            <button onClick={() => setIsInviteModalOpen(true)} className="btn btn-primary btn-sm">Nieuw Lid Uitnodigen</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th>Naam</th>
                                        <th>E-mail</th>
                                        <th>Rol</th>
                                        <th>Status</th>
                                        {currentUser?.companyRole === 'owner' && <th>Acties</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(member => (
                                        <tr key={member.id} className="hover">
                                            <td>{member.name}</td>
                                            <td>{member.email}</td>
                                            <td><span className="badge badge-ghost">{member.companyRole}</span></td>
                                            <td><span className={`badge ${member.status === 'active' ? 'badge-success' : member.status === 'suspended' ? 'badge-error' : 'badge-warning'}`}>{member.status}</span></td>
                                            {currentUser?.companyRole === 'owner' && (
                                                <td className="space-x-2">
                                                    {/* KNOP VOOR RECHTENBEHEER */}
                                                    {currentUser.id !== member.id && member.companyRole === 'member' && (
                                                        <button
                                                            onClick={() => openPermissionsModal(member)}
                                                            className="btn btn-info btn-xs"
                                                        >
                                                            Rechten
                                                        </button>
                                                    )}
                                                    {currentUser.id !== member.id && member.status === 'active' && (
                                                        <button 
                                                            onClick={() => handleSuspend(member.id, member.name)}
                                                            className="btn btn-error btn-xs"
                                                        >
                                                            Deactiveren
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {currentUser?.companyRole === 'owner' && (
                    <div className="card bg-base-100 shadow-xl mt-8">
                        {/* ... formulier voor direct toevoegen blijft ongewijzigd ... */}
                         <div className="card-body"><h2 className="card-title-lg">Teamlid Direct Toevoegen</h2><p className="text-sm mt-2">Het teamlid kan direct inloggen met de opgegeven gegevens. Er wordt geen e-mail verstuurd.</p><form onSubmit={handleDirectAdd} className="mt-4"><div className="form-control w-full max-w-md"><label className="label"><span className="label-text">Naam</span></label><input type="text" placeholder="Volledige naam" className="input input-bordered w-full" value={directAddName} onChange={(e) => setDirectAddName(e.target.value)} required /></div><div className="form-control w-full max-w-md mt-2"><label className="label"><span className="label-text">Tijdelijk Wachtwoord</span></label><input type="password" placeholder="Kies een wachtwoord" className="input input-bordered w-full" value={directAddPassword} onChange={(e) => setDirectAddPassword(e.target.value)} required /></div><div className="card-actions justify-start mt-6"><button type="submit" className="btn btn-secondary" disabled={isAddingDirectly}>{isAddingDirectly ? 'Bezig...' : 'Direct Toevoegen'}</button></div></form></div>
                    </div>
                )}
            </div>
            
            <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onInvite={handleInvite} showNotification={showNotification} />
            
            {/* RENDER DE NIEUWE MODAL */}
            <PermissionsModal 
                member={selectedMember}
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
                showNotification={showNotification}
                onPermissionsUpdate={fetchMembers} // Geef de fetch functie mee om de lijst te vernieuwen
            />
        </>
    );
};

export default TeamManagement;