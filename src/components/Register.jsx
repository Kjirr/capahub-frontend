// src/components/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '@/api';

const Register = ({ showNotification }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bedrijfsnaam: '',
        kvk: '',
        name: '',
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await registerUser(formData);
            setRegistrationSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Er is een onbekende fout opgetreden.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (registrationSuccess) {
        return (
            <div className="max-w-md mx-auto mt-10">
                <div className="card-default p-8 text-center">
                    <h2 className="form-title text-green-600">Registratie succesvol!</h2>
                    <p className="mt-4">Er is een verificatie-e-mail verzonden naar <strong>{formData.email}</strong>.</p>
                    <p className="mt-2">Klik op de link in de e-mail om je account te activeren. Controleer ook je spam-map.</p>
                    <button onClick={() => navigate('/login')} className="w-full btn btn-primary mt-6">
                        Terug naar Inloggen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="card-default p-8 space-y-4">
                <h2 className="form-title">Bedrijf Registreren</h2>
                {error && <div className="alert alert-error">{error}</div>}
                
                <h3 className="form-section-header">Bedrijfsgegevens</h3>
                <input name="bedrijfsnaam" type="text" placeholder="Bedrijfsnaam" value={formData.bedrijfsnaam} onChange={handleChange} className="form-input" required />
                <input name="kvk" type="text" placeholder="KvK-nummer" value={formData.kvk} onChange={handleChange} className="form-input" required />

                <h3 className="form-section-header">Uw Account (Eigenaar)</h3>
                <input name="name" type="text" placeholder="Uw volledige naam" value={formData.name} onChange={handleChange} className="form-input" required />
                <input name="email" type="email" placeholder="Uw e-mailadres" value={formData.email} onChange={handleChange} className="form-input" required />
                <input name="password" type="password" placeholder="Wachtwoord" value={formData.password} onChange={handleChange} className="form-input" required />
                
                <button type="submit" disabled={isSubmitting} className="w-full btn btn-primary">
                    {isSubmitting ? 'Bezig...' : 'Registreren'}
                </button>
            </form>
        </div>
    );
};

export default Register;