import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiRequest } from './api';

// --- Importeer al uw componenten ---
import Header from './components/Header';
import Notification from './components/Notification';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import MyJobs from './components/MyJobs';
import CreateJob from './components/CreateJob';
import JobDetails from './components/JobDetails';
import EditJob from './components/EditJob';
import MyOffers from './components/MyOffers';
import CreateOffer from './components/CreateOffer';
import OfferDetails from './components/OfferDetails';
import EditOffer from './components/EditOffer';
import MySubmittedQuotes from './components/MySubmittedQuotes';
import MyProductions from './components/MyProductions';
import ProductionJobDetails from './components/ProductionJobDetails';
import ProductionKanban from './components/ProductionKanban';
import ArchivePage from './components/ArchivePage';
import Marketplace from './components/Marketplace';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';
import AdminLogin from './components/AdminLogin';
import NotificationsPage from './components/NotificationsPage';
import SubmitQuote from './components/SubmitQuote';
import EditQuote from './components/EditQuote';
import QuoteRequests from './components/QuoteRequests';
import MyTasks from './components/MyTasks';
import TeamManagement from './components/TeamManagement';
import MaterialManagement from './components/MaterialManagement';
import SupplierManagement from './components/SupplierManagement';
import PurchaseOrderManagement from './components/PurchaseOrderManagement';
import CreatePurchaseOrder from './components/CreatePurchaseOrder';
import PurchaseOrderDetail from './components/PurchaseOrderDetail';
import WarehouseManagement from './components/WarehouseManagement';
import PlanManagement from './components/PlanManagement';
import JobsDashboard from './components/JobsDashboard';
import MarketplaceDashboard from './components/MarketplaceDashboard';
import OffersDashboard from './components/OffersDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import MachineManagement from './components/MachineManagement';
import LaborRateManagement from './components/LaborRateManagement'; 
import FinishingManagement from './components/FinishingManagement';
import CreateQuote from './components/CreateQuote'; // NIEUW

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentView, setCurrentView] = useState('home');
    const [viewParam, setViewParam] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const isLoggedIn = !!currentUser;
    const navigateTo = useCallback((view, param = null) => { const newHash = param ? `${view}/${param}` : view; if (window.location.hash !== `#${newHash}`) { window.location.hash = newHash; } }, []);
    const showNotification = useCallback((message, type = 'success', duration = 4000) => { setNotification({ message, type }); setTimeout(() => setNotification({ message: '', type: '' }), duration); }, []);
    const handleLogout = useCallback(() => { navigateTo('home'); localStorage.removeItem('capahub_token'); setCurrentUser(null); showNotification('U bent uitgelogd.', 'info'); }, [navigateTo, showNotification]);
    const handleLogin = useCallback((token, user, showWelcomeNotification = true) => { localStorage.setItem('capahub_token', token); setCurrentUser(user); const targetView = user.role === 'admin' ? 'admin-dashboard' : 'dashboard'; navigateTo(targetView); if (showWelcomeNotification) showNotification('Succesvol ingelogd!'); }, [navigateTo, showNotification]);

    useEffect(() => {
        const handleRouteChange = () => {
            const hash = window.location.hash.substring(1);
            const [path, param] = hash.split('/');
            const newView = path || 'home';
            let user = null;
            const token = localStorage.getItem('capahub_token');
            if (token) { try { const decoded = jwtDecode(token); if (decoded.exp * 1000 > Date.now()) user = decoded; } catch (e) {} }
            setCurrentUser(user);

            const protectedRoutes = [
                'dashboard', 'profile', 'my-jobs', 'create-job', 'job-details', 'edit-job',
                'my-offers', 'create-offer', 'offer-details', 'edit-offer',
                'my-submitted-quotes', 'submit-quote', 'edit-quote', 'quote-requests',
                'my-tasks', 'my-productions', 'production-details', 'production-kanban',
                'archive', 'marketplace', 'notifications', 'team-management',
                'material-management', 'supplier-management', 'purchase-order-management', 'create-purchase-order',
                'purchase-order-details', 'warehouse-management', 'jobs-dashboard', 'marketplace-dashboard',
                'offers-dashboard', 'settings-dashboard', 'machine-management', 'labor-rate-management', 'finishing-management', 
                'create-quote', // NIEUW
                'admin-dashboard', 'user-management', 'company-management', 'plan-management'
            ];
            const adminOnlyRoutes = ['admin-dashboard', 'user-management', 'company-management', 'plan-management'];
            const userOnlyRoutes = protectedRoutes.filter(r => !adminOnlyRoutes.includes(r));

            if (!user && protectedRoutes.includes(newView)) { if (newView !== 'home') { window.location.hash = '#login'; return; } }
            if (user) { const isAdmin = user.role === 'admin'; if (!isAdmin && adminOnlyRoutes.includes(newView)) { window.location.hash = '#dashboard'; return; } if (isAdmin && userOnlyRoutes.includes(newView)) { window.location.hash = '#admin-dashboard'; return; } }
            
            setCurrentView(newView);
            setViewParam(param || null);
            setAuthLoading(false);
        };
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange();
        return () => window.removeEventListener('hashchange', handleRouteChange);
    }, []);

    const renderView = () => {
        if (authLoading) return <div className="text-center p-10">Authenticatie controleren...</div>;
        const props = { navigateTo, showNotification, currentUser, handleLogout };
        
        switch (currentView) {
            case 'home': return <Home {...props} />;
            case 'login': return <Login handleLogin={handleLogin} {...props} />;
            case 'register': return <Register {...props} />;
            case 'admin-login': return <AdminLogin {...props} handleLogin={handleLogin} />;
            
            case 'dashboard': return <Dashboard {...props} />;
            case 'profile': return <ProfilePage {...props} />;
            case 'team-management': return <TeamManagement {...props} />;
            case 'material-management': return <MaterialManagement {...props} />;
            case 'supplier-management': return <SupplierManagement {...props} />;
            case 'purchase-order-management': return <PurchaseOrderManagement {...props} />;
            case 'create-purchase-order': return <CreatePurchaseOrder {...props} />;
            case 'purchase-order-details': return <PurchaseOrderDetail {...props} viewParam={viewParam} />;
            case 'warehouse-management': return <WarehouseManagement {...props} />;
            case 'jobs-dashboard': return <JobsDashboard {...props} />;
            case 'marketplace-dashboard': return <MarketplaceDashboard {...props} />;
            case 'offers-dashboard': return <OffersDashboard {...props} />;
            case 'settings-dashboard': return <SettingsDashboard {...props} />;
            case 'machine-management': return <MachineManagement {...props} />;
            case 'labor-rate-management': return <LaborRateManagement {...props} />;
            case 'finishing-management': return <FinishingManagement {...props} />;
            case 'create-quote': return <CreateQuote {...props} viewParam={viewParam}/>; // NIEUW

            // ... overige user-specifieke routes ...
            case 'my-jobs': return <MyJobs {...props} />;
            case 'create-job': return <CreateJob {...props} />;
            case 'job-details': return <JobDetails {...props} viewParam={viewParam} />;
            case 'edit-job': return <EditJob {...props} viewParam={viewParam} />;
            case 'my-offers': return <MyOffers {...props} />;
            case 'create-offer': return <CreateOffer {...props} />;
            case 'offer-details': return <OfferDetails {...props} viewParam={viewParam} />;
            case 'edit-offer': return <EditOffer {...props} viewParam={viewParam} />;
            case 'my-submitted-quotes': return <MySubmittedQuotes {...props} />;
            case 'submit-quote': return <SubmitQuote {...props} viewParam={viewParam} />;
            case 'edit-quote': return <EditQuote {...props} viewParam={viewParam} />;
            case 'quote-requests': return <QuoteRequests {...props} />;
            case 'my-tasks': return <MyTasks {...props} />;
            case 'my-productions': return <MyProductions {...props} />;
            case 'production-details': return <ProductionJobDetails {...props} viewParam={viewParam} />;
            case 'production-kanban': return <ProductionKanban {...props} />;
            case 'archive': return <ArchivePage {...props} />;
            case 'marketplace': return <Marketplace {...props} />;
            case 'notifications': return <NotificationsPage {...props} />;

            case 'admin-dashboard': return <AdminDashboard {...props} />;
            case 'user-management': return <UserManagement {...props} />;
            case 'company-management': return <CompanyManagement {...props} />;
            case 'plan-management': return <PlanManagement {...props} />;
            
            default: return <Home {...props} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header isLoggedIn={isLoggedIn} navigateTo={navigateTo} handleLogout={handleLogout} currentUser={currentUser} />
            {notification.message && <Notification message={notification.message} type={notification.type} />}
            <main className="container mx-auto p-4 md:p-6">{renderView()}</main>
        </div>
    );
};

export default App;