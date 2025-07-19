// src/api.js
export const API_BASE_URL = 'http://localhost:3001/api';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('printcap_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Er is een fout opgetreden.');
        return data;
    } catch (error) {
        console.error(`API Fout op ${endpoint}:`, error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Kon geen verbinding maken met de API server.');
        }
        throw error;
    }
};