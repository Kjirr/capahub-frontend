import React, { useState, useEffect } from 'react';
// GEWIJZIGD: We importeren de nieuwe, specifieke functie
import { verifyEmail } from '@/api';

// De componentnaam is nu consistent met App.jsx
const VerifyEmail = ({ viewParam: token, showNotification, navigateTo }) => {
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Uw e-mailadres wordt geverifieerd...');

    useEffect(() => {
        const doVerification = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Geen verificatie-token gevonden in de URL.');
                return;
            }
            try {
                // GEWIJZIGD: Gebruik de nieuwe, veilige functie
                const data = await verifyEmail(token);
                setStatus('success');
                setMessage(data.message);
                
                // Toon een extra melding en stuur na een paar seconden door
                showNotification('Je wordt nu doorgestuurd naar de login pagina.', 'info');
                setTimeout(() => navigateTo('login'), 4000);

            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'De verificatie is mislukt.');
            }
        };
        doVerification();
    }, [token, showNotification, navigateTo]);

    const getStatusColor = () => {
        if (status === 'success') return 'text-green-600';
        if (status === 'error') return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <div className="page-container flex items-center justify-center">
            <div className="card bg-base-100 shadow-xl text-center max-w-lg">
                <div className="card-body">
                    <h1 className={`card-title text-2xl ${getStatusColor()}`}>
                        {status === 'success' && 'Verificatie Gelukt!'}
                        {status === 'error' && 'Verificatie Mislukt'}
                        {status === 'loading' && 'Bezig met Verifiëren'}
                    </h1>
                    <p className="mt-4">{message}</p>
                    <div className="card-actions justify-center mt-6">
                        <button onClick={() => navigateTo('login')} className="btn btn-primary">
                            Ga naar Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;