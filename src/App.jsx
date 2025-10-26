import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { initiateSocketConnection, disconnectSocket, subscribeToEvent } from './socket';
import { LoggerProvider } from './components/LoggerContext';

// Importeer alle componenten...
import FinishingEquipmentManagement from './components/FinishingEquipmentManagement';
import ProductionStepTemplateBuilder from './components/ProductionStepTemplateBuilder';
import ProductionStepTemplateEditor from './components/ProductionStepTemplateEditor';
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
import TeamManagement from './components/TeamManagement';
import MaterialManagement from './components/MaterialManagement';
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
import CreateQuote from './components/CreateQuote';
import ProductionStepTemplateManagement from './components/ProductionStepTemplateManagement';
import ProductionDashboard from './components/ProductionDashboard';
import MyProductionTasks from './components/MyProductionTasks';
import ProductTemplateManagement from './components/ProductTemplateManagement';
import { CreateDirectQuote } from './components/CreateDirectQuote';
import CreateTemplatedQuote from './components/CreateTemplatedQuote';
import DirectQuotesList from './components/DirectQuotesList';
import DirectQuoteDetails from './components/DirectQuoteDetails';
import EditDirectQuote from './components/EditDirectQuote';
import OrdersList from './components/OrdersList';
import OrderDetails from './components/OrderDetails';
import ProductionPlanning from './components/ProductionPlanning';
import InboxPage from './components/InboxPage';
import AdminActivityFeed from './components/AdminActivityFeed';
import UserDetails from './components/UserDetails';
import CompanyProfile from './components/CompanyProfile';
import PurchaseOrderReceipt from './components/PurchaseOrderReceipt';
import CompanyManagementDashboard from './components/CompanyManagementDashboard';
import ProductTemplateEditor from './components/ProductTemplateEditor';
import ResourceManagement from './components/ResourceManagement';
import ResourceTest from './components/ResourceTest';
import ContactManagementPage from './components/ContactManagementPage';
import QuoteSettingsPage from './components/QuoteSettingsPage';
import QuoteTemplateEditor from './components/QuoteTemplateEditor';
import DocumentTemplateManager from './components/DocumentTemplateManager';
import TemplateEditor from './components/TemplateEditor';
import DocumentGenerator from './components/DocumentGenerator';
import PublicQuotePage from './components/PublicQuotePage';
import { QuoteUploadPage, OrderConfirmedPage } from './components/QuoteUploadPage';
import FileReviewPage from './components/FileReviewPage';
import ProofThanksPage from './components/ProofThanksPage'; // Import van de bedankpagina
import Expeditie from './components/Expeditie';
import ShippingSettings from './components/ShippingSettings';
import PartnerManagement from './components/PartnerManagement';
import AutomationSettings from './components/AutomationSettings';
import AssetManager from './components/AssetManager';
import PromotieBeheer from './components/PromotieBeheer';
import FacturatieOverzicht from './components/FacturatieOverzicht';
import PublicInvoicePage from './components/PublicInvoicePage'; // <-- NIEUW

const ProtectedRoute = ({ isLoggedIn, children }) => {
    const location = useLocation();
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

const App = () => {
    const { currentUser, clearCurrentUser, initializeUser } = useAuthStore();
    const [authLoading, setAuthLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = !!currentUser;

    const showNotification = useCallback((message, type = 'success', duration = 4000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), duration);
    }, []);

    const handleLogout = useCallback(() => {
        navigate('/home');
        setTimeout(() => {
            clearCurrentUser();
            disconnectSocket();
            showNotification('U bent uitgelogd.', 'info');
        }, 50);
    }, [navigate, clearCurrentUser, showNotification]);

    useEffect(() => {
        initializeUser();
        setAuthLoading(false);
    }, [initializeUser]);

    useEffect(() => {
        if (currentUser) {
            initiateSocketConnection();
            subscribeToEvent('newNotification', (newNotification) => showNotification(newNotification.message, 'info'));
            return () => disconnectSocket();
        }
    }, [currentUser, showNotification]);

    if (authLoading) {
        return <div className="text-center p-10">Authenticatie controleren...</div>;
    }

    const routeProps = { showNotification };

    return (
      <LoggerProvider>
        <div className="min-h-screen bg-slate-50">
            {/* Conditional Header Rendering */}
            { !location.pathname.startsWith('/public-quote') &&
              !location.pathname.startsWith('/quote-accepted') &&
              !location.pathname.startsWith('/order-confirmed') &&
              !location.pathname.startsWith('/file-review') &&
              !location.pathname.startsWith('/proof-feedback-received') &&
              !location.pathname.startsWith('/public-invoice') && // <-- NIEUW
              <Header handleLogout={handleLogout} />
            }

            {/* Notification Component */}
            {notification.message && <Notification message={notification.message} type={notification.type} />}

            {/* Main Content Area */}
            <main className="w-full max-w-none px-4 md:px-6">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register {...routeProps} />} />
                    <Route path="/admin-login" element={<Login />} /> {/* Assuming admin uses the same login */}
                    <Route path="/public-quote/:token" element={<PublicQuotePage />} />
                    <Route path="/quote-accepted/:token" element={<QuoteUploadPage showNotification={showNotification} />} />
                    <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
                    <Route path="/file-review/:token" element={<FileReviewPage />} />
                    <Route path="/proof-feedback-received/:token" element={<ProofThanksPage />} />
                    <Route path="/public-invoice/:token" element={<PublicInvoicePage />} /> {/* <-- NIEUW */}

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProfilePage {...routeProps} /></ProtectedRoute>} />
                    <Route path="/inbox" element={<ProtectedRoute isLoggedIn={isLoggedIn}><InboxPage {...routeProps} /></ProtectedRoute>} />

                    {/* Team & Company Management */}
                    <Route path="/team-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TeamManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/company-profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CompanyProfile {...routeProps} /></ProtectedRoute>} />
                    <Route path="/company-management-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CompanyManagementDashboard /></ProtectedRoute>} />

                    {/* Job & Offer Management */}
                    <Route path="/jobs-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><JobsDashboard /></ProtectedRoute>} />
                    <Route path="/my-jobs" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MyJobs {...routeProps} /></ProtectedRoute>} />
                    <Route path="/create-job" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreateJob {...routeProps} /></ProtectedRoute>} />
                    <Route path="/job-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><JobDetails {...routeProps} /></ProtectedRoute>} />
                    <Route path="/edit-job/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><EditJob {...routeProps} /></ProtectedRoute>} />
                    <Route path="/offers-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OffersDashboard /></ProtectedRoute>} />
                    <Route path="/my-offers" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MyOffers {...routeProps} /></ProtectedRoute>} />
                    <Route path="/create-offer" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreateOffer {...routeProps} /></ProtectedRoute>} />
                    <Route path="/offer-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OfferDetails {...routeProps} /></ProtectedRoute>} />
                    <Route path="/edit-offer/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><EditOffer {...routeProps} /></ProtectedRoute>} />

                    {/* Quote Management */}
                    <Route path="/my-submitted-quotes" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MySubmittedQuotes {...routeProps} /></ProtectedRoute>} />
                    <Route path="/submit-quote/:jobId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SubmitQuote {...routeProps} /></ProtectedRoute>} />
                    <Route path="/edit-quote/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><EditQuote {...routeProps} /></ProtectedRoute>} />
                    <Route path="/quote-requests" element={<ProtectedRoute isLoggedIn={isLoggedIn}><QuoteRequests {...routeProps} /></ProtectedRoute>} />
                    <Route path="/create-quote/:jobId" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreateQuote {...routeProps} /></ProtectedRoute>} /> {/* Likely legacy? */}
                    <Route path="/create-direct-quote" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreateDirectQuote {...routeProps} /></ProtectedRoute>} />
                    <Route path="/create-templated-quote" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreateTemplatedQuote {...routeProps} /></ProtectedRoute>} />
                    <Route path="/direct-quotes-list" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DirectQuotesList {...routeProps} /></ProtectedRoute>} />
                    <Route path="/direct-quote-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DirectQuoteDetails {...routeProps} /></ProtectedRoute>} />
                    <Route path="/edit-direct-quote/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><EditDirectQuote {...routeProps} /></ProtectedRoute>} />

                    {/* Production & Planning */}
                    <Route path="/my-productions" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MyProductions /></ProtectedRoute>} /> {/* High-level overview? */}
                    <Route path="/production-planning" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductionPlanning {...routeProps} /></ProtectedRoute>} />
                    <Route path="/production-kanban" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MyProductionTasks {...routeProps} /></ProtectedRoute>} /> {/* Alias for MyProductionTasks? */}
                    <Route path="/my-production-tasks" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MyProductionTasks {...routeProps} /></ProtectedRoute>} />

                    {/* Orders */}
                    <Route path="/orders-list" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrdersList {...routeProps} /></ProtectedRoute>} />
                    <Route path="/order-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrderDetails {...routeProps} /></ProtectedRoute>} />

                    {/* Warehouse & Purchasing */}
                    <Route path="/material-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MaterialManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/warehouse-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><WarehouseManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/purchase-order-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PurchaseOrderManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/create-purchase-order" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CreatePurchaseOrder {...routeProps} /></ProtectedRoute>} />
                    <Route path="/purchase-order-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PurchaseOrderDetail {...routeProps} /></ProtectedRoute>} />
                    <Route path="/purchase-order-receipt/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PurchaseOrderReceipt {...routeProps} /></ProtectedRoute>} />

                    {/* Resource & Template Management */}
                    <Route path="/resource-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ResourceManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/machine-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MachineManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/labor-rate-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><LaborRateManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/finishing-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FinishingManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/finishing-equipment-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FinishingEquipmentManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/production-step-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductionStepTemplateManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/production-step-template-builder" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductionStepTemplateBuilder {...routeProps} /></ProtectedRoute>} />
                    <Route path="/production-step-template-editor/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductionStepTemplateEditor {...routeProps} /></ProtectedRoute>} /> {/* Assuming this is correct editor */}
                    <Route path="/product-template-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductTemplateManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/product-template-editor/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProductTemplateEditor {...routeProps} /></ProtectedRoute>} />
                    <Route path="/document-templates" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DocumentTemplateManager {...routeProps} /></ProtectedRoute>} />
                    <Route path="/template-editor/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><TemplateEditor {...routeProps} /></ProtectedRoute>} />

                    {/* Settings & Other */}
                    <Route path="/settings-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SettingsDashboard /></ProtectedRoute>} />
                    <Route path="/archive" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ArchivePage {...routeProps} /></ProtectedRoute>} />
                    <Route path="/marketplace-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><MarketplaceDashboard /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Marketplace /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute isLoggedIn={isLoggedIn}><NotificationsPage {...routeProps} /></ProtectedRoute>} />
                    <Route path="/resource-test" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ResourceTest /></ProtectedRoute>} /> {/* For testing? */}
                    <Route path="/contact-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ContactManagementPage {...routeProps} /></ProtectedRoute>} />
                    <Route path="/quote-settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><QuoteSettingsPage {...routeProps} /></ProtectedRoute>} />
                    <Route path="/quote-template-editor" element={<ProtectedRoute isLoggedIn={isLoggedIn}><QuoteTemplateEditor {...routeProps} /></ProtectedRoute>} />
                    <Route path="/generate-document/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DocumentGenerator {...routeProps} /></ProtectedRoute>} />
                    <Route path="/expeditie" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Expeditie {...routeProps} /></ProtectedRoute>} />
                    <Route path="/shipping-settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ShippingSettings {...routeProps} /></ProtectedRoute>} />
                    <Route path="/partner-management/:type" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PartnerManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/automation-settings" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AutomationSettings {...routeProps} /></ProtectedRoute>} />
                    <Route path="/asset-manager" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AssetManager {...routeProps} /></ProtectedRoute>} />
                    <Route path="/promotie-beheer" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PromotieBeheer {...routeProps} /></ProtectedRoute>} />
                    <Route path="/facturatie" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FacturatieOverzicht {...routeProps} /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin-dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><UserManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/company-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CompanyManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/plan-management" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PlanManagement {...routeProps} /></ProtectedRoute>} />
                    <Route path="/admin-activity-feed" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AdminActivityFeed /></ProtectedRoute>} />
                    <Route path="/user-details/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><UserDetails {...routeProps} /></ProtectedRoute>} />

                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
      </LoggerProvider>
    );
};

export default App;