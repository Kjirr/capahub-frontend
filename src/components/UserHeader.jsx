// src/components/UserHeader.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const UserHeader = ({ currentUser, navigateTo, handleLogout }) => {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!currentUser) return;
            try {
                const notifications = await apiRequest('/notifications', 'GET');
                const unreadCount = notifications.filter(n => !n.isRead).length;
                setNotificationCount(unreadCount);
            } catch (error) {
                console.error("Kon notificaties niet laden", error);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);
        return () => clearInterval(intervalId);
    }, [currentUser]);

    return (
        <div className="flex items-center space-x-4">
            <button onClick={() => navigateTo('dashboard')} className="link-default">Dashboard</button>
            <button onClick={() => navigateTo('marketplace-dashboard')} className="link-default">Marktplaats</button>
            
            <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn-ghost">Mijn Werk</label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                    <li><a onClick={() => navigateTo('quote-requests')}>Offerteaanvragen</a></li>
                    <li><a onClick={() => navigateTo('my-tasks')}>Mijn Taken</a></li>
                    <li className="menu-title"><span>Mijn Overzichten</span></li>
                    <li><a onClick={() => navigateTo('jobs-dashboard')}>Mijn Opdrachten</a></li>
                    <li><a onClick={() => navigateTo('offers-dashboard')}>Mijn Aanbod</a></li>
                    <li><a onClick={() => navigateTo('my-submitted-quotes')}>Ingediende Offertes</a></li>
                    <li><a onClick={() => navigateTo('my-productions')}>Mijn Producties</a></li>
                    <li><a onClick={() => navigateTo('archive')}>Archief</a></li>
                </ul>
            </div>
            
            <button onClick={() => navigateTo('notifications')} className="btn btn-ghost btn-circle">
                <div className="indicator">
                    {notificationCount > 0 && <span className="indicator-item badge badge-secondary">{notificationCount}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
            </button>
            
            <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost flex items-center space-x-2">
                    <span>{currentUser.bedrijfsnaam}</span>
                </label>
                 <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                    <li><a onClick={() => navigateTo('profile')}>Mijn Profiel</a></li>
                    {currentUser.companyRole === 'owner' && (
                        <li><a onClick={() => navigateTo('team-management')}>Team Beheer</a></li>
                    )}
                    <li><a onClick={handleLogout}>Uitloggen</a></li>
                </ul>
            </div>
        </div>
    );
};

export default UserHeader;