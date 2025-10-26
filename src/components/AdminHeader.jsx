
// AdminHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ handleLogout }) => { // handleLogout komt nu van de parent Header
    const navigate = useNavigate();

    return (
        <div className="flex items-center space-x-4">
            <span className="font-semibold">Admin Panel</span>
            <button onClick={() => navigate('/admin-dashboard')} className="link-default">Dashboard</button>
            <button onClick={handleLogout} className="btn-ghost btn-sm">Uitloggen</button>
        </div>
    );
};

export default AdminHeader;