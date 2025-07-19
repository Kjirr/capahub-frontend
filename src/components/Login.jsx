import React, { useState } from 'react';
import { apiRequest } from '../api';

const Login = ({ handleLogin, showNotification, navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            handleLogin(data.token, data.user, true);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-10">
            <form onSubmit={handleSubmit} className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Inloggen</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Emailadres</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Wachtwoord</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md" required />
                </div>
                <button type="submit" className="w-full btn btn-primary">Login</button>
                <p className="text-center mt-4 text-sm text-gray-600">
                    Nog geen account? <span onClick={() => navigateTo('register')} className="font-semibold link">Registreer hier</span>
                </p>
            </form>
        </div>
    );
};

export default Login;