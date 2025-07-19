import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const VerifyEmailPage = ({ token, showNotification, navigateTo }) => {
    const [message, setMessage] = useState('Uw e-mailadres wordt geverifieerd...');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setMessage('Geen verificatie token gevonden.');
                return;
            }
            try {
                const data = await apiRequest(`/auth/verify-email/${token}`);
                setMessage(`${data.message} U wordt doorgestuurd...`);
                showNotification('Uw account wordt nu beoordeeld door een beheerder.', 'info', 8000);
                setTimeout(() => navigateTo('login'), 4000);
            } catch (error) {
                setMessage(error.message);
            }
        };
        verify();
    }, [token, showNotification, navigateTo]);

    return (
        <div className="text-center p-10 bg-white rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-4">E-mail Verificatie</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmailPage;