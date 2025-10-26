import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProofThanks } from '../api';

const ProofThanksPage = () => {
    const { token } = useParams();
    const [pageHtml, setPageHtml] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            getPublicProofThanks(token)
                .then(response => {
                    setPageHtml(response.data);
                })
                .catch(err => {
                    setError(err.response?.data?.error || 'Kon de bedankpagina niet laden.');
                    setPageHtml('<h1>Bedankt voor je feedback!</h1><p>We hebben je reactie ontvangen. Je kunt dit venster nu sluiten.</p>');
                })
                .finally(() => setLoading(false));
        }
    }, [token]);

    const handleIframeLoad = (e) => {
        const iframe = e.currentTarget;
        if (iframe) {
            try {
                // We wachten een fractie van een seconde zodat alle afbeeldingen
                // de kans hebben om te laden voordat we de hoogte meten.
                setTimeout(() => {
                    const newHeight = iframe.contentWindow.document.body.scrollHeight;
                    iframe.style.height = `${newHeight}px`;
                }, 100); // 100ms vertraging
            } catch (err) {
                console.error("Kon iframe hoogte niet instellen:", err);
                iframe.style.height = '400px'; 
            }
        }
    };
    
    // --- START AANGEPASTE SECTIE (Injecteerbare CSS) ---
    // Dit stylesheet wordt IN de iframe geladen.
    const injectedStyles = `
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 0;
            }
            
            /* Zorg dat de tabel (voor logo/promo layout) de volle breedte pakt */
            table {
                width: 100% !important;
                border: none !important;
                border-collapse: collapse !important;
            }

            /* Verberg lelijke tabelranden */
            th, td {
                /* HIER ZAT DE TYPO. '!importa' is nu '!important;' */
                border: none !important; 
                border-collapse: collapse !important;
                /* Zorg dat cellen normaal (boven) uitlijnen */
                vertical-align: top !important; 
            }
            
            /* Zorg dat ALLE afbeeldingen (logo + promo) correct schalen EN centreren */
            img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important; 
                margin-left: auto !important; 
                margin-right: auto !important;
            }
        </style>
    `;
    // --- EINDE AANGEPASTE SECTIE ---


    // Gecentreerde layout voor Laden en Foutmelding
    if (loading || (error && !pageHtml)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                    <div className="card-body text-center p-12">
                        {loading ? (
                            <p>Pagina laden...</p>
                        ) : (
                            <p className="text-red-500">{error}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Professionele layout voor de geladen content
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
            <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-8 md:p-12">

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Bedankt voor je feedback!</h1>
                    <p className="text-gray-600 mt-2">We hebben je reactie in goede orde ontvangen.</p>
                </div>
                
                <div className="divider"></div> 
                
                <iframe
                    srcDoc={`${injectedStyles}${pageHtml}`}
                    onLoad={handleIframeLoad}
                    title="Promotionele Content"
                    style={{
                        width: '100%',
                        border: '0',
                        overflow: 'hidden',
                    }}
                    scrolling="no"
                />

            </div>
        </div>
    );
};

export default ProofThanksPage;