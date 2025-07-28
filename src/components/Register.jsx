// src/components/Register.jsx

import React, { useState } from 'react';
import { apiRequest } from '../api';

const Register = ({ showNotification, navigateTo }) => {
    const [formData, setFormData] = useState({
        bedrijfsnaam: '',
        kvk: '',
        name: '', // Naam van de ordermanager
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            // Het 'formData' object bevat nu alle benodigde velden, inclusief 'name'
            const data = await apiRequest('/auth/register', 'POST', formData);
            showNotification(data.message, 'success');
            navigateTo('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <form onSubmit={handleSubmit} className="card-default p-8 space-y-4">
                <h2 className="form-title">Bedrijf Registreren</h2>
                {error && <div className="alert alert-error">{error}</div>}
                
                <h3 className="form-section-header">Bedrijfsgegevens</h3>
                <input name="bedrijfsnaam" type="text" placeholder="Bedrijfsnaam" value={formData.bedrijfsnaam} onChange={handleChange} className="form-input" required />
                <input name="kvk" type="text" placeholder="KvK-nummer" value={formData.kvk} onChange={handleChange} className="form-input" required />

                <h3 className="form-section-header">Uw Account (Eigenaar)</h3>
                {/* DE FIX: Het veld voor de naam van de gebruiker is hier toegevoegd */}
                <input name="name" type="text" placeholder="Uw volledige naam" value={formData.name} onChange={handleChange} className="form-input" required />
                <input name="email" type="email" placeholder="Uw e-mailadres" value={formData.email} onChange={handleChange} className="form-input" required />
                <input name="password" type="password" placeholder="Wachtwoord" value={formData.password} onChange={handleChange} className="form-input" required />
                
                <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                    {isSubmitting ? <span className="loading-spinner"></span> : 'Registreren'}
                </button>
            </form>
        </div>
    );
};

export default Register;
