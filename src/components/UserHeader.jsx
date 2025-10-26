
// UserHeader.jsx
import React, { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { getNotifications } from '../api';

const UserHeader = ({ handleLogout }) => { // handleLogout komt nu van de parent Header
    const { currentUser } = useAuthStore();
    const navigate = useNavigate();

    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!currentUser?.id) return; 
            try {
                const notifications = await getNotifications();
                const unreadCount = notifications.filter(n => !n.isRead).length;
                setNotificationCount(unreadCount);
            } catch (error) {
                console.error("Kon notificaties niet laden:", error.message);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(intervalId);
    }, [currentUser?.id]);

    return (
        <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="link-default">Dashboard</button>
            
            <button onClick={() => navigate('/notifications')} className="btn btn-ghost btn-circle">
                <div className="indicator">
                    {notificationCount > 0 && <span className="indicator-item badge badge-secondary">{notificationCount}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
            </button>
            
            <div className="h-8 border-l border-gray-300 mx-2"></div>

            <button onClick={() => navigate('/profile')} className="btn btn-ghost normal-case">
                {currentUser?.company?.name || currentUser?.name}
            </button>
            
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Uitloggen
            </button>
        </div>
    );
};

export default UserHeader;