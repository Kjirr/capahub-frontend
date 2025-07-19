// src/components/Header.jsx - Gecorrigeerde versie

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const Header = ({ isLoggedIn, navigateTo, handleLogout, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            const fetchNotifications = async () => {
                try {
                    // DE FIX ZIT HIER: '/api' is verwijderd
                    const data = await apiRequest('/notifications');
                    setNotifications(data);
                } catch (error) {
                    console.error("Kon notificaties niet laden", error);
                }
            };

            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);

            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        
        if (unreadCount > 0 && !showNotifications) {
            notifications.forEach(n => {
                if (!n.isRead) {
                    // DE FIX ZIT HIER OOK: '/api' is verwijderd
                    apiRequest(`/notifications/${n.id}/read`, 'PUT', {});
                }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        }
    };

    const isAdmin = currentUser?.role === 'admin';

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 
                    className="text-2xl font-bold text-blue-600 cursor-pointer" 
                    onClick={() => navigateTo(isLoggedIn ? (isAdmin ? 'admin-dashboard' : 'dashboard') : 'home')}
                >
                    CapaHub
                </h1>
                <nav className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            {isAdmin ? (
                                <a href="#admin-dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md">Admin Dashboard</a>
                            ) : (
                                <>
                                    <a href="#dashboard" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md">Dashboard</a>
                                    <a href="#job-marketplace" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md">Marktplaats</a>
                                    <div className="relative group">
                                        <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md">Mijn Werk</button>
                                        <div className="absolute right-0 pt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block border border-slate-200">
                                            <a href="#my-jobs" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Mijn Opdrachten</a>
                                            <a href="#my-offers" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Mijn Aanbod</a>
                                            <a href="#quote-requests" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Offerteaanvragen</a>
                                            <a href="#my-submitted-quotes" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Ingediende Offertes</a>
                                            <a href="#my-productions" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Mijn Producties</a>
                                            
                                            <div className="border-t border-slate-100 my-1"></div>
                                            <a href="#archive" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Archief</a>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="relative">
                                <button 
                                    onClick={handleBellClick} 
                                    className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    
                                    {unreadCount > 0 && (
                                        <div className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                            {unreadCount}
                                        </div>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border border-slate-200">
                                        <div className="p-3 font-semibold border-b border-slate-200">Notificaties</div>
                                        <ul className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map(n => (
                                                <li key={n.id} className={`p-3 border-b border-slate-100 text-sm ${!n.isRead ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>{n.message}</li>
                                            )) : <li className="p-3 text-sm text-slate-500">Geen notificaties.</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md">
                                    <span>{currentUser?.bedrijfsnaam}</span>
                                </button>
                                <div className="absolute right-0 pt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block border border-slate-200">
                                    <a href="#profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Mijn Profiel</a>
                                    <a href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100">Uitloggen</a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <button onClick={() => navigateTo('login')} className="btn btn-primary">Inloggen</button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;