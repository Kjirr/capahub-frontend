// src/api.js (Debug-versie)

const API_URL = 'http://localhost:3001/api';

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    let response; // We definiëren 'response' hier zodat we hem ook in de catch kunnen gebruiken

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

        // --- DIT IS DE NIEUWE DEBUG-INFORMATIE ---
        console.log(`[API ANTWOORD] Reactie ontvangen van ${endpoint}`);
        console.log(`[API ANTWOORD] Status Code: ${response.status}`);
        console.log(`[API ANTWOORD] Status Tekst: ${response.statusText}`);
        // -----------------------------------------

        if (!response.ok) {
            // Als de status geen 2xx is, gooi een fout.
            const errorText = await response.text(); // Lees de response als tekst
            console.error('[API FOUT] Server gaf een foutstatus. Ruwe response:', errorText);
            throw new Error(`Serverfout: ${response.status}`);
        }

        // Als de status wel ok is, probeer het als JSON te lezen.
        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`[API FOUT] De 'apiRequest' functie is gecrasht.`, error);
        
        // Als we de response hadden, maar hij niet geldig was (bv. geen JSON), log dat dan.
        if (response) {
            console.error(`[API FOUT] De server-response was niet wat we verwachtten (status ${response.status}).`);
        }
        
        throw error;
    }
};