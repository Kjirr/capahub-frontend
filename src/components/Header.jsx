// src/components/Header.jsx

import React from 'react';
import AdminHeader from './AdminHeader'; // Nieuwe import
import UserHeader from './UserHeader'; // Nieuwe import

const Header = ({ isLoggedIn, currentUser, navigateTo, handleLogout }) => {

    const renderUserMenu = () => {
        if (!isLoggedIn) {
            return (
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigateTo('login')} className="btn-ghost">Inloggen</button>
                    <button onClick={() => navigateTo('register')} className="btn-primary">Registreren</button>
                </div>
            );
        }

        // De logica is nu heel simpel: laad het juiste component.
        if (currentUser.role === 'admin') {
            return <AdminHeader navigateTo={navigateTo} handleLogout={handleLogout} />;
        }

        return <UserHeader currentUser={currentUser} navigateTo={navigateTo} handleLogout={handleLogout} />;
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div 
                    className="cursor-pointer" 
                    onClick={() => navigateTo(isLoggedIn ? (currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard') : 'home')}
                >
                    <img src="/logo.png" alt="prntgo logo" className="h-24 w-auto" />
                </div>
                {renderUserMenu()}
            </nav>
        </header>
    );
};

export default Header;