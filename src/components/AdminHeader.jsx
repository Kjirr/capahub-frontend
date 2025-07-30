// src/components/AdminHeader.jsx
import React from 'react';

const AdminHeader = ({ navigateTo, handleLogout }) => {
    return (
        <div className="flex items-center space-x-4">
            <span className="font-semibold">Admin Panel</span>
            <button onClick={() => navigateTo('admin-dashboard')} className="link-default">Dashboard</button>
            <button onClick={handleLogout} className="btn-ghost btn-sm">Uitloggen</button>
        </div>
    );
};

export default AdminHeader;