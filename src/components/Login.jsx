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
        <div className="max-w-sm mx-auto mt-10">
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">Inloggen</h2>

                <input 
                    type="email" 
                    placeholder="E-mailadres" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="input input-bordered w-full" 
                    autoComplete="email" 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Wachtwoord" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="input input-bordered w-full" 
                    autoComplete="current-password" 
                    required 
                />
                
                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary">
                    {isSubmitting ? <span className="loading loading-spinner"></span> : 'Login'}
                </button>
                
                {/* De foutmelding is nu een strakke, rode tekst */}
                {error && (
                    <p className="text-center text-sm text-red-600 font-semibold pt-2">
                        {error}
                    </p>
                )}
                
                <p className="text-center text-sm text-gray-600 pt-2">
                    Nog geen account? <span onClick={() => navigateTo('register')} className="font-semibold link link-primary">Registreer hier</span>
                </p>
            </form>
        </div>
    );
};

export default Login;
