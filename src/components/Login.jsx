// src/components/Login.jsx

import React, { useState } from 'react';
import { apiRequest } from '../api';

const Login = ({ handleLogin, navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State om de specifieke foutmelding bij te houden
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset de foutmelding bij elke nieuwe poging
        setIsSubmitting(true);
        try {
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            handleLogin(data.token, data.user, true);
        } catch (err) {
            // Vang de fout op en zet de specifieke boodschap in de state
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="card-default p-8 space-y-4">
                <h2 className="form-title">Inloggen</h2>

                <input 
                    type="email" 
                    placeholder="E-mailadres" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="form-input" 
                    autoComplete="email" 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Wachtwoord" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="form-input" 
                    autoComplete="current-password" 
                    required 
                />
                
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? <span className="loading-spinner"></span> : 'Login'}
                </button>
                
                {/* De foutmelding is nu een strakke, rode tekst */}
                {error && (
                    <p className="text-center text-sm text-red-600 font-semibold pt-2">
                        {error}
                    </p>
                )}
                
                <p className="text-center text-sm text-gray-600 pt-2">
                    Nog geen account? <span onClick={() => navigateTo('register')} className="font-semibold link-default">Registreer hier</span>
                </p>
            </form>
        </div>
    );
};

export default Login;
