import axios from 'axios';

const API_BASE_URL = ''; // Leeg laten voor relatieve paden (via proxy)

const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const apiRequest = async (method, endpoint, data = null, customHeaders = {}, axiosConfig = {}) => {
    const token = getAuthToken();
    
    const headers = { ...customHeaders };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }

    // Automatisch Content-Type instellen, behalve voor FormData
    if (!(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    } else {
        // Axios stelt dit correct in voor FormData, dus verwijder het hier
        delete headers['Content-Type'];
    }

    const config = {
        method,
        url: `${API_BASE_URL}${endpoint}`, // Gebruik relatief pad
        headers,
        ...axiosConfig,
    };

    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error("--- API Request Mislukt! ---");
        if (error.response) {
            console.error("Endpoint:", error.config.method.toUpperCase(), error.config.url);
            console.error("Status:", error.response.status);
            console.error("Server Data:", error.response.data);

            if (error.response.status === 401) {
                // Token is ongeldig of verlopen
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect naar login, met info over sessie verloop
                window.location.href = '/login?sessionExpired=true';
            }
        } else if (error.request) {
            // Request gemaakt, maar geen response ontvangen (netwerkfout?)
            console.error('Network Error:', error.message);
        } else {
            // Fout bij het opzetten van de request
            console.error('Error:', error.message);
        }
        // Gooi de error door zodat de component deze kan afhandelen (bv. loading state uitzetten)
        throw error;
    }
};

// ====================================================================
// ==                 ALLE API FUNCTIES VAN HET PLATFORM             ==
// ====================================================================

// --- AUTHENTICATION ---
export const loginUser = (credentials) => apiRequest('post', '/api/auth/login', credentials);
export const registerUser = (userData) => apiRequest('post', '/api/auth/register', userData);
export const verifyEmail = (token) => apiRequest('get', `/api/auth/verify-email/${token}`);

// --- ADMIN ---
export const checkAdminStatus = () => apiRequest('get', '/api/admin/status');
export const setupAdmin = (data) => apiRequest('post', '/api/admin/setup', data);
export const getAdminStats = () => apiRequest('get', '/api/admin/stats');
export const getPendingUsers = () => apiRequest('get', '/api/admin/dashboard/pending-users');
export const getCompanies = () => apiRequest('get', '/api/admin/companies');
export const getUsers = () => apiRequest('get', '/api/admin/users');
export const approveUser = (userId) => apiRequest('put', `/api/admin/users/${userId}/approve`);
export const updateUserStatus = (userId, status) => apiRequest('put', `/api/admin/users/${userId}/status`, { status });
export const getUserActivity = (userId) => apiRequest('get', `/api/admin/users/${userId}/activity`);
export const getActivityFeed = () => apiRequest('get', '/api/admin/activity-feed');

// --- PLANS ---
export const getAdminPlans = () => apiRequest('get', '/api/admin/plans');
export const createPlan = (payload) => apiRequest('post', '/api/admin/plans', payload);
export const updatePlan = (planId, payload) => apiRequest('put', `/api/admin/plans/${planId}`, payload);
export const deletePlan = (planId) => apiRequest('delete', `/api/admin/plans/${planId}`);
export const getPlans = () => apiRequest('get', '/api/plans');

// --- PERMISSIONS (ADMIN) ---
export const getAllPermissions = () => apiRequest('get', '/api/admin/permissions');

// --- JOBS ---
export const createJob = (jobData) => apiRequest('post', '/api/jobs', jobData);
export const getMyJobs = () => apiRequest('get', '/api/jobs/my-jobs');
export const getPublicJobs = () => apiRequest('get', '/api/jobs/public');
export const assignJobToSelf = (jobId) => apiRequest('put', `/api/jobs/${jobId}/assign`);

// --- ARCHIVE ---
export const getUnifiedArchive = () => apiRequest('get', '/api/archive/all');
export const getArchivedJobs = () => apiRequest('get', '/api/archive/jobs');

// --- OFFERS ---
export const createOffer = (offerData) => apiRequest('post', '/api/offers', offerData);
export const getMyOffers = () => apiRequest('get', '/api/offers/my-offers');

// --- QUOTES, PRODUCTS & MATERIALS ---
export const getProductTemplates = () => apiRequest('get', '/api/product-templates');
export const createProductTemplate = (data) => apiRequest('post', '/api/product-templates', data);
export const updateProductTemplate = (templateId, data) => apiRequest('put', `/api/product-templates/${templateId}`, data);
export const deleteProductTemplate = (templateId) => apiRequest('delete', `/api/product-templates/${templateId}`);
export const getMaterials = () => apiRequest('get', '/api/materials');
export const createMaterial = (data) => apiRequest('post', '/api/materials', data);
export const updateMaterial = (materialId, data) => apiRequest('put', `/api/materials/${materialId}`, data);
export const deleteMaterial = (materialId) => apiRequest('delete', `/api/materials/${materialId}`);
export const runDirectCalculation = (payload) => apiRequest('post', '/api/calculation/run-direct-multi', payload);
export const runTemplatedCalculation = (payload) => apiRequest('post', '/api/calculation/run-from-template', payload);
export const saveDirectQuote = (payload) => apiRequest('post', '/api/direct-quotes', payload);
export const getDirectQuotes = () => apiRequest('get', '/api/direct-quotes');
export const getDirectQuoteById = (quoteId) => apiRequest('get', `/api/direct-quotes/${quoteId}`);
export const acceptDirectQuote = (quoteId) => apiRequest('post', `/api/direct-quotes/${quoteId}/accept`);
export const updateDirectQuote = (quoteId, payload) => apiRequest('put', `/api/direct-quotes/${quoteId}`, payload);
export const getMySubmittedQuotes = () => apiRequest('get', '/api/quotes/my-submitted');
export const sendQuoteByEmail = (quoteId, email) => apiRequest('post', `/api/direct-quotes/${quoteId}/send`, { recipientEmail: email });
export const getQuotePreview = (quoteId) => apiRequest('get', `/api/direct-quotes/${quoteId}/preview`, null, {}, { responseType: 'blob' });
export const updateQuoteSettings = (settings) => apiRequest('put', '/api/company/profile/quote-settings', settings);
export const resetDirectQuote = (quoteId) => apiRequest('post', `/api/direct-quotes/${quoteId}/reset`);

// --- BOUWBLOKKEN / RESOURCES (OPGESCHOOND & GECONSOLIDEERD) ---
export const getMachines = () => apiRequest('get', '/api/machines');
export const createMachine = (data) => apiRequest('post', '/api/machines', data);
export const updateMachine = (machineId, data) => apiRequest('put', `/api/machines/${machineId}`, data);
export const deleteMachine = (machineId) => apiRequest('delete', `/api/machines/${machineId}`);
export const getLaborRates = () => apiRequest('get', '/api/labor-rates');
export const createLaborRate = (data) => apiRequest('post', '/api/labor-rates', data);
export const updateLaborRate = (rateId, data) => apiRequest('put', `/api/labor-rates/${rateId}`, data);
export const deleteLaborRate = (rateId) => apiRequest('delete', `/api/labor-rates/${rateId}`);
export const getFinishings = () => apiRequest('get', '/api/finishings');
export const createFinishing = (data) => apiRequest('post', '/api/finishings', data);
export const updateFinishing = (finishingId, data) => apiRequest('put', `/api/finishings/${finishingId}`, data);
export const deleteFinishing = (finishingId) => apiRequest('delete', `/api/finishings/${finishingId}`);
export const getFinishingEquipment = () => apiRequest('get', '/api/finishing-equipment');
export const getFinishingEquipmentById = (id) => apiRequest('get', `/api/finishing-equipment/${id}`);
export const createFinishingEquipment = (data) => apiRequest('post', '/api/finishing-equipment', data);
export const updateFinishingEquipment = (equipmentId, data) => apiRequest('put', `/api/finishing-equipment/${equipmentId}`, data);
export const deleteFinishingEquipment = (equipmentId) => apiRequest('delete', `/api/finishing-equipment/${equipmentId}`);

// --- NOTIFICATIONS ---
export const getNotifications = () => apiRequest('get', '/api/notifications');
export const markNotificationAsRead = (notificationId) => apiRequest('put', `/api/notifications/${notificationId}/read`);

// --- TASKS ---
export const getMyTasks = () => apiRequest('get', '/api/tasks/my-tasks');

// --- ORDERS ---
export const getOrderById = (orderId) => apiRequest('GET', `/api/orders/${orderId}`);
export const getOrders = () => apiRequest('get', '/api/orders');
export const getPendingOrders = () => apiRequest('get', '/api/orders/pending');
export const getShippableOrders = (startDate, endDate) => apiRequest('get', `/api/orders/shippable?shippingDateStart=${startDate}&shippingDateEnd=${endDate}`);
export const activateOrder = (orderId) => apiRequest('post', `/api/orders/${orderId}/activate`);
export const updateOrder = (orderId, data) => apiRequest('put', `/api/orders/${orderId}`, data);
export const updateOrderLineShippingStatus = (orderId, lineId, status) => apiRequest('put', `/api/orders/${orderId}/lines/${lineId}/shipping-status`, { status });
export const updateOrderStatus = (orderId, status) => apiRequest('put', `/api/orders/${orderId}/status`, { status });
export const deleteOrder = (orderId) => apiRequest('delete', `/api/orders/${orderId}`);

// --- PRODUCTION & PLANNING ---
export const getPlannableResources = () => apiRequest('get', '/api/production-board/plannable-resources');
export const getProductionBoard = (date) => apiRequest('get', `/api/production-board?date=${date}`);
export const getUnplannedSteps = () => apiRequest('get', '/api/production-board/unplanned');
export const updateProductionStep = (stepId, data) => apiRequest('put', `/api/production-steps/${stepId}`, data);
export const getAllStepDefinitions = () => apiRequest('get', '/api/production-steps/definitions');
export const createStepDefinition = (data) => apiRequest('post', '/api/production-steps/definitions', data);
export const updateStepDefinition = (id, data) => apiRequest('put', `/api/production-steps/definitions/${id}`, data);
export const deleteStepDefinition = (id) => apiRequest('delete', `/api/production-steps/definitions/${id}`);
export const getWorkflowTemplates = () => apiRequest('get', '/api/workflow-templates');
export const getWorkflowTemplateById = (templateId) => apiRequest('get', `/api/workflow-templates/${templateId}`);
export const createWorkflowTemplate = (data) => apiRequest('post', '/api/workflow-templates', data);
export const updateWorkflowTemplate = (templateId, data) => apiRequest('put', `/api/workflow-templates/${templateId}`, data);
export const deleteWorkflowTemplate = (templateId) => apiRequest('delete', `/api/workflow-templates/${templateId}`);

// --- CONVERSATIONS / INBOX ---
export const getConversations = () => apiRequest('get', '/api/conversations');
export const getConversationByJobId = (jobId) => apiRequest('get', `/api/conversations/job/${jobId}`);

// --- MARKETPLACE ---
export const getMarketplaceJobs = () => apiRequest('get', '/api/marketplace/jobs');

// --- TEAM MANAGEMENT ---
export const getTeamMembers = () => apiRequest('get', '/api/team');
export const inviteTeamMember = (inviteData) => apiRequest('post', '/api/team/invite', inviteData);
export const addTeamMemberDirectly = (memberData) => apiRequest('post', '/api/team/add-direct', memberData);
export const suspendTeamMember = (memberId) => apiRequest('delete', `/api/team/${memberId}`);

// --- STOCK & WAREHOUSE ---
export const getStockLocations = () => apiRequest('get', '/api/stock-locations');
export const createStockLocation = (data) => apiRequest('post', '/api/stock-locations', data);
export const updateStockLocation = (locationId, data) => apiRequest('put', `/api/stock-locations/${locationId}`, data);
export const deleteStockLocation = (locationId) => apiRequest('delete', `/api/stock-locations/${locationId}`);
export const postStockCorrection = (data) => apiRequest('post', '/api/stock-movements/correction', data);
export const getStockHistory = (materialId, locationId) =>
  apiRequest('get', `/api/stock-movements/history?materialId=${materialId}&locationId=${locationId}`);

// --- PARTNERS ---
export const getPartners = (type) => apiRequest('get', `/api/partners?type=${type}`);
export const createPartner = (data) => apiRequest('post', '/api/partners', data);
export const updatePartner = (id, data) => apiRequest('put', `/api/partners/${id}`, data);
export const deletePartner = (id) => apiRequest('delete', `/api/partners/${id}`);

// --- PURCHASING ---
export const getPurchaseOrders = () => apiRequest('get', '/api/purchase-orders');
export const createPurchaseOrder = (data) => apiRequest('post', '/api/purchase-orders', data);
export const getPurchaseOrderById = (id) => apiRequest('get', `/api/purchase-orders/${id}`);
export const updatePurchaseOrderStatus = (id, payload) => apiRequest('put', `/api/purchase-orders/${id}/status`, payload);
export const sendPurchaseOrder = (id) => apiRequest('post', `/api/purchase-orders/${id}/send`);

// --- USER PROFILE ---
export const getProfile = () => apiRequest('get', '/api/profile');
export const updateProfile = (data) => apiRequest('put', '/api/profile', data);
export const startDummySubscription = (planName) => apiRequest('post', '/api/subscriptions/start-dummy-plan', { planName });

// --- COMPANY PROFILE ---
export const getCompanyProfile = () => apiRequest('get', '/api/company/profile');
export const updateCompanyProfile = (formData) => apiRequest('put', '/api/company/profile', formData);
export const deleteCompanyLogo = () => apiRequest('delete', '/api/company/profile/logo');
export const getQuoteTemplate = () => apiRequest('get', '/api/company/profile/quote-template');
export const updateQuoteTemplate = (template) => apiRequest('put', '/api/company/profile/quote-template', { template });

// --- SUB-COMPANY MANAGEMENT ---
export const getSubCompanies = () => apiRequest('get', '/api/company/sub-companies');
export const createSubCompany = (data) => apiRequest('post', '/api/company/sub-companies', data);

// --- BOX CATALOG ---
export const getBoxCatalog = () => apiRequest('get', '/api/catalog');
export const getBoxGeometry = (payload) => apiRequest('post', '/api/catalog/geometry', payload);

// --- BEDRIJFSCONTACTEN ---
export const getCompanyContacts = () => apiRequest('get', '/api/contacts');
export const addCompanyContact = (contactCompanyId) => apiRequest('post', '/api/contacts', { contactCompanyId });
export const removeCompanyContact = (contactCompanyId) => apiRequest('delete', `/api/contacts/${contactCompanyId}`);
export const searchCompanies = (query) => apiRequest('get', `/api/company/search?q=${query}`);
export const getCompanyDetails = (companyId) => apiRequest('get', `/api/company/${companyId}`);

// --- DOCUMENT TEMPLATES ---
export const getTemplates = () => apiRequest('get', '/api/document-templates');
export const getTemplateById = (id) => apiRequest('get', `/api/document-templates/${id}`);
export const getDefaultTemplateByType = (type) => apiRequest('get', `/api/document-templates/default/${type}`);
export const createTemplate = (data) => apiRequest('post', '/api/document-templates', data);
export const updateTemplate = (id, data) => apiRequest('put', `/api/document-templates/${id}`, data);
export const deleteTemplate = (id) => apiRequest('delete', `/api/document-templates/${id}`);
// --- DOCUMENT GENERATION ---
export const generateDocument = (docType, orderId, templateId = null) => {
    let endpoint = `/api/document-templates/generate/${docType.toLowerCase().replace('_', '-')}/${orderId}`;
    if (templateId) {
        endpoint += `/${templateId}`;
    }
    return apiRequest('GET', endpoint, null, {}, { responseType: 'blob' });
}

// --- FILES ---
export const uploadInternalFile = (orderId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('POST', `/api/files/order/${orderId}`, formData);
};
export const createShareLink = (fileId) => apiRequest('POST', `/api/files/${fileId}/share`);

// --- PROOFS ---
export const createProof = (payload) => apiRequest('post', '/api/proofs', payload);

// --- PUBLIC (NO AUTH) ---
export const getPublicProof = (token) => axios.get(`/api/public/proofs/${token}`);
export const getPublicProofPreviewBlob = (token, fileId) => {
    return axios.get(`/api/public/proofs/${token}/preview/${fileId}`, {
        responseType: 'blob'
    });
};
export const submitProofFeedback = (token, feedback) => {
    return axios.post(`/api/public/proofs/${token}/feedback`, { feedback });
};
export const getPublicProofThanks = (token) => {
    return axios.get(`/api/public/proofs/${token}/thanks`);
};

// --- PUBLIC QUOTES (NO AUTH) ---
export const getPublicQuoteByToken = (token) => axios.get(`/api/public/quotes/${token}`);
export const acceptPublicQuote = (token) => axios.post(`/api/public/quotes/${token}/accept`);
export const declinePublicQuote = (token, reason) => axios.post(`/api/public/quotes/${token}/decline`, { reason });

// --- TIJDSREGISTRATIE ---
export const startProductionTimer = (stepId) => apiRequest('post', `/api/timelogs/production-steps/${stepId}/start`);
export const stopProductionTimer = (stepId) => apiRequest('post', `/api/timelogs/production-steps/${stepId}/stop`);
export const completeProductionStep = (stepId) => apiRequest('post', `/api/timelogs/production-steps/${stepId}/complete`);

// --- SHIPPING ---
export const getShippingRates = (payload) => apiRequest('post', '/api/shipping/get-rates', payload);
export const getShippingSettings = () => apiRequest('get', '/api/company/shipping-settings');
export const updateShippingSettings = (settings) => apiRequest('put', '/api/company/shipping-settings', settings);

// --- ASSET MANAGEMENT ---
export const getAssets = () => apiRequest('get', '/api/company/assets'); // Aangepast naar /api/company/assets
export const deleteAsset = (filename) => apiRequest('delete', `/api/company/assets/${filename}`); // Aangepast naar /api/company/assets

// --- START NIEUWE SECTIE ---
// --- FACTURATIE ---
export const createInvoiceForOrder = (orderId) => apiRequest('post', `/api/invoices/order/${orderId}`);
export const getInvoices = () => apiRequest('get', '/api/invoices');
/**
 * Haalt de PDF-blob op voor een specifieke factuur.
 * @param {string} invoiceId - Het ID van de factuur.
 */
export const getInvoicePdf = (invoiceId) => { // <-- STAAT DEZE REGEL ER PRECIES ZO?
    // We verwachten een 'blob' (binary data) terug, geen JSON
    return apiRequest('get', `/api/invoices/${invoiceId}/pdf`, null, {}, { responseType: 'blob' });
};
export const sendInvoiceByEmail = (invoiceId, email) => apiRequest('post', `/api/invoices/${invoiceId}/send`, { recipientEmail: email });
/**
 * Zet de status van een verzonden factuur terug naar concept.
 * @param {string} invoiceId - Het ID van de factuur.
 */
export const reopenInvoice = (invoiceId) => {
    return apiRequest('put', `/api/invoices/${invoiceId}/reopen`);
};
// --- EINDE NIEUWE FUNCTIE ---
// --- EINDE NIEUWE SECTIE ---