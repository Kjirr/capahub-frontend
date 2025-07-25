// src/components/NotificationsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const NotificationsPage = ({ showNotification, currentUser }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('/notifications', 'GET');
            setNotifications(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser, fetchNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await apiRequest(`/notifications/${notificationId}/read`, 'PUT');
            // Update de status lokaal voor een snelle UI-update
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div className="text-center p-10">Notificaties laden...</div>;

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Notificaties</h1>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-0">
                    {notifications.length === 0 ? (
                        <p className="p-8 text-center">U heeft geen notificaties.</p>
                    ) : (
                        <ul className="divide-y">
                            {notifications.map(notification => (
                                <li 
                                    key={notification.id} 
                                    className={`p-4 flex items-center justify-between ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                >
                                    <div>
                                        <p className={`${!notification.isRead ? 'font-semibold' : 'text-gray-500'}`}>
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
