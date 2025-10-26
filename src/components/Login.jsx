import React, { useState } from 'react';
import { loginUser } from '@/api';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { setCurrentUser } = useAuthStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await loginUser({ email, password });

            if (data && data.token) {
                setCurrentUser(data.token);
                const user = data.user;
                const targetView = user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
                navigate(targetView);
            } else {
                setError('Login succesvol, maar ongeldige response van server.');
            }
        } catch (err) {
            setError('Inloggen mislukt. Controleer je e-mail en wachtwoord.');
            console.error("Login API Fout:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="card-default p-8 space-y-4 max-w-md w-full">
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
                <button 
                    type="submit"
                    disabled={isLoading} 
                    className="w-full btn btn-primary"
                >
                    {isLoading ? 'Bezig...' : 'Login'}
                </button>
                {error && (
                    <p className="text-center text-sm text-red-600 font-semibold pt-2">
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
};

export default Login;