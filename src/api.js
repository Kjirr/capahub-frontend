// src/api.js

// DE FIX: Lees de backend URL uit het "adresboek" (omgevingsvariabelen).
// Als het niet is ingesteld, gebruik dan de lokale URL als fallback.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    let response; 

    try {
        const token = localStorage.getItem('capahub_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = {
            method: method,
            headers: headers,
        };
        if (body) {
            headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        }

        console.log(`[API VERZOEK] Start ${method} naar ${API_URL}${endpoint}`);
        response = await fetch(`${API_URL}${endpoint}`, config);

        console.log(`[API ANTWOORD] Reactie ontvangen van ${endpoint}`);
        console.log(`[API ANTWOORD] Status Code: ${response.status}`);
        console.log(`[API ANTWOORD] Status Tekst: ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API FOUT] Server gaf een foutstatus. Ruwe response:', errorText);
            throw new Error(`Serverfout: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`[API FOUT] De 'apiRequest' functie is gecrasht.`, error);
        
        if (response) {
            console.error(`[API FOUT] De server-response was niet wat we verwachtten (status ${response.status}).`);
        }
        
        throw error;
    }
};
