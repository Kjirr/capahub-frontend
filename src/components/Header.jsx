import React from 'react';
import useAuthStore from '@/store/authStore';
// --- START WIJZIGING: useLocation toegevoegd om actieve pagina te bepalen ---
import { useNavigate, useLocation } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import UserHeader from './UserHeader';
// --- EINDE WIJZIGING ---

const Header = ({ handleLogout }) => {
    const { currentUser } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation(); // Huidige URL ophalen
    const isLoggedIn = !!currentUser;

    const renderUserMenu = () => {
        if (!isLoggedIn) {
            // --- START WIJZIGING: Knoppen hebben nu de basis 'btn' class en een actieve staat ---
            const isLoginPage = location.pathname === '/login';
            const isRegisterPage = location.pathname === '/register';

            return (
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => navigate('/login')} 
                        className={`btn btn-ghost ${isLoginPage ? 'btn-active' : ''}`}
                    >
                        Inloggen
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        className={`btn btn-primary ${isRegisterPage ? 'btn-active' : ''}`}
                    >
                        Registreren
                    </button>
                </div>
            );
            // --- EINDE WIJZIGING ---
        }
        
        if (currentUser.role === 'admin') {
            return <AdminHeader handleLogout={handleLogout} />;
        }

        return <UserHeader handleLogout={handleLogout} />;
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div 
                    className="cursor-pointer" 
                    onClick={() => navigate(isLoggedIn ? (currentUser.role === 'admin' ? '/admin-dashboard' : '/dashboard') : '/home')}
                >
                    <img src="/logo.png" alt="prntgo logo" className="h-24 w-auto" />
                </div>
                {renderUserMenu()}
            </nav>
        </header>
    );
};

export default Header;