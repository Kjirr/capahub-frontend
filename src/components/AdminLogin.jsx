// src/components/AdminLogin.jsx

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const AdminLogin = ({ handleLogin, showNotification }) => {
    const [needsSetup, setNeedsSetup] = useState(null); // null = loading
    const [formData, setFormData] = useState({ email: '', password: '', secret: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const { adminExists } = await apiRequest('/admin/status', 'GET');
                setNeedsSetup(!adminExists);
            } catch (err) {
                setError('Kon serverstatus niet controleren. Is de backend online?');
            }
        };
        checkAdminStatus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSetup = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            await apiRequest('/admin/setup', 'POST', formData);
            showNotification('Admin account succesvol aangemaakt! U kunt nu inloggen.', 'success');
            setNeedsSetup(false); // Schakel over naar login-modus
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLoginSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const data = await apiRequest('/auth/login', 'POST', { email: formData.email, password: formData.password });
            handleLogin(data.token, data.user, true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (needsSetup) {
            handleSetup();
        } else {
            handleLoginSubmit();
        }
    };
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";

    if (needsSetup === null) {
        return <div className="loading-text">Status controleren...</div>;
    }

    return (
        <div className="max-w-sm mx-auto mt-20">
            <form onSubmit={handleSubmit} className="card p-8 space-y-4">
                <h2 className="form-title">
                    {needsSetup ? 'Admin Installatie' : 'Admin Login'}
                </h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">{error}</div>}
                
                <input name="email" type="email" placeholder="Admin E-mailadres" value={formData.email} onChange={handleChange} className={inputClasses} required />
                <input name="password" type="password" placeholder="Wachtwoord" value={formData.password} onChange={handleChange} className={inputClasses} required />
                
                {needsSetup && (
                    <input name="secret" type="password" placeholder="Setup Sleutel" value={formData.secret} onChange={handleChange} className={inputClasses} required />
                )}

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? 'Bezig...' : (needsSetup ? 'Installeren' : 'Inloggen')}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
