import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

import { apiRequest } from './api';

// Importeren van alle componenten
import Header from './components/Header';
import ArchivePage from './components/ArchivePage';
import ProductionKanban from './components/ProductionKanban';
import Notification from './components/Notification';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateJob from './components/Createjob';
import JobMarketplace from './components/JobMarketplace';
import MyJobs from './components/MyJobs';
import JobDetails from './components/JobDetails';
import OfferCapacity from './components/OfferCapacity';
import MyOffers from './components/MyOffers';
import OfferDetails from './components/OfferDetails';
import QuoteRequests from './components/QuoteRequests';
import MySubmittedQuotes from './components/MySubmittedQuotes';
import SubmitQuote from './components/SubmitQuote';
import MyProductions from './components/MyProductions';
import ProductionJobDetails from './components/ProductionJobDetails';
import ProfilePage from './components/ProfilePage';
import PublicProfilePage from './components/PublicProfilePage';
import VerifyEmailPage from './components/VerifyEmailPage';
import AdminAllJobs from './components/AdminAllJobs';
import EditJob from './components/EditJob';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [viewParam, setViewParam] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const navigateTo = (view, param = null) => {
        let newHash = view;
        if (param) newHash += `/${param}`;
        window.location.hash = newHash;
    };
    
    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), duration);
    }, []);

    const handleLogin = (token, user, showWelcomeNotification = true) => {
        localStorage.setItem('printcap_token', token);
        setIsLoggedIn(true);
        setCurrentUser(user);
        const targetView = user.role === 'admin' ? 'admin-dashboard' : 'dashboard';
        navigateTo(targetView);
        if (showWelcomeNotification) showNotification('Succesvol ingelogd!');
    };

    const handleLogout = () => {
        localStorage.removeItem('printcap_token');
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigateTo('home');
        showNotification('U bent uitgelogd.', 'info');
    };

    const parseRoute = useCallback(() => {
        const hash = window.location.hash.substring(1);
        const [path, param] = hash.split('/');
        
        setCurrentView(path || 'home');
        setViewParam(param || null);
    }, []);

    useEffect(() => {
        const checkAuthAndParseRoute = () => {
            const token = localStorage.getItem('printcap_token');
            if (token) {
                try {
                    const decodedUser = jwtDecode(token);
                    if (decodedUser.exp * 1000 > Date.now()) {
                        setIsLoggedIn(true);
                        setCurrentUser(decodedUser);
                    } else {
                        // Token is verlopen, log direct uit
                        localStorage.removeItem('printcap_token');
                        setIsLoggedIn(false);
                        setCurrentUser(null);
                    }
                } catch (e) {
                    // Token is ongeldig, log direct uit
                    localStorage.removeItem('printcap_token');
                    setIsLoggedIn(false);
                    setCurrentUser(null);
                }
            } else {
                setIsLoggedIn(false);
                setCurrentUser(null);
            }
            parseRoute();
        };

        window.addEventListener('hashchange', checkAuthAndParseRoute);
        checkAuthAndParseRoute(); // Voer direct uit bij het laden van de app

        return () => window.removeEventListener('hashchange', checkAuthAndParseRoute);
    }, [parseRoute]);

    const renderView = () => {
        const props = { navigateTo, showNotification, currentUser };

        const protectedRoutes = [
            'dashboard', 'admin-dashboard', 'profile', 'create-job', 'my-jobs',
            'job-details', 'my-productions', 'production-details', 'quote-requests',
            'submit-quote', 'my-submitted-quotes', 'offer-capacity', 'my-offers',
            'offer-details', 'edit-job', 'admin-all-jobs'
        ];

        // --- DE ROUTER GUARD ---
        if (!isLoggedIn && protectedRoutes.includes(currentView)) {
            return <Login handleLogin={handleLogin} showNotification={showNotification} navigateTo={navigateTo} />;
        }

        // --- DE NORMALE ROUTER ---
        switch (currentView) {
            case 'home': return <Home {...props} />;
            case 'production-kanban': return <ProductionKanban {...props} />;
            case 'login': return <Login handleLogin={handleLogin} {...props} />;
            case 'register': return <Register {...props} />;
            case 'verify': return <VerifyEmailPage token={viewParam} {...props} />;
            case 'dashboard': return <Dashboard {...props} />;
            case 'admin-dashboard': return <AdminDashboard {...props} />;
            case 'create-job': return <CreateJob {...props} />;
            case 'job-marketplace': return <JobMarketplace {...props} />;
            case 'my-jobs': return <MyJobs {...props} />;
            case 'job-details': return <JobDetails jobId={viewParam} {...props} />;
            case 'offer-capacity': return <OfferCapacity {...props} />;
            case 'my-offers': return <MyOffers {...props} />;
            case 'offer-details': return <OfferDetails offerId={viewParam} {...props} />;
            case 'quote-requests': return <QuoteRequests {...props} />;
            case 'my-submitted-quotes': return <MySubmittedQuotes {...props} />;
            case 'submit-quote': return <SubmitQuote jobId={viewParam} {...props} />;
            case 'my-productions': return <MyProductions {...props} />;
            case 'production-details': return <ProductionJobDetails jobId={viewParam} {...props} />;
            case 'profile': return <ProfilePage {...props} />;
            case 'public-profile': return <PublicProfilePage userId={viewParam} {...props} />;
            case 'admin-all-jobs': return <AdminAllJobs {...props} />;
            case 'edit-job': return <EditJob jobId={viewParam} {...props} />;
            case 'archive': return <ArchivePage {...props} />;
            default: return <Login handleLogin={handleLogin} showNotification={showNotification} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header isLoggedIn={isLoggedIn} navigateTo={navigateTo} handleLogout={handleLogout} currentUser={currentUser} />
            {notification.message && <Notification message={notification.message} type={notification.type} />}
            <main className="container mx-auto p-4 md:p-6">{renderView()}</main>
        </div>
    );
};

export default App;