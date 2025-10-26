// src/components/NotificationsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from '@/api';
// --- START WIJZIGING: useAuthStore importeren om zelf de user op te halen ---
import useAuthStore from '@/store/authStore';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'currentUser' prop verwijderd, die halen we nu zelf op ---
const NotificationsPage = ({ showNotification }) => {
    const { currentUser } = useAuthStore(); // Zelf de user ophalen
    // --- EINDE WIJZIGING ---
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        // We zetten isLoading hier niet meer op true, dat is al de default state
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            // Zorg ervoor dat showNotification bestaat voordat we het aanroepen
            if (showNotification) {
                showNotification(error.message, 'error');
            } else {
                console.error("showNotification functie niet beschikbaar:", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]); // Dependency array is nu correcter

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        } else {
            // Als er om een of andere reden geen user is, stop met laden
            setIsLoading(false);
        }
    }, [currentUser, fetchNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            if (showNotification) {
                showNotification(error.message, 'error');
            } else {
                console.error("showNotification functie niet beschikbaar:", error.message);
            }
        }
    };

    if (isLoading) return <div className="loading-text">Notificaties laden...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title mb-6">Notificaties</h1>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-0">
                    {notifications.length === 0 ? (
                        <p className="p-8 text-center">U heeft geen notificaties.</p>
                    ) : (
                        <ul className="divide-y divide-base-200">
                            {notifications.map(notification => (
                                <li 
                                    key={notification.id} 
                                    className={`p-4 flex items-center justify-between transition-colors ${!notification.isRead ? 'bg-blue-50' : 'bg-base-100'}`}
                                >
                                    <div>
                                        <p className={`${!notification.isRead ? 'font-semibold text-base-content' : 'text-gray-500'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="btn btn-ghost btn-sm"
                                        >
                                            Markeer als gelezen
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;