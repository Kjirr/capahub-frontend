// src/components/Register.jsx

import React, { useState } from 'react';
import { apiRequest } from '../api';

const Register = ({ showNotification, navigateTo }) => {
    const [formData, setFormData] = useState({ bedrijfsnaam: '', email: '', password: '', kvk: '' });
    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        switch(name) {
            case 'bedrijfsnaam': return value ? '' : 'Bedrijfsnaam is verplicht.';
            case 'email': return /\S+@\S+\.\S+/.test(value) ? '' : 'Voer een geldig e-mailadres in.';
            case 'password': return value.length >= 8 ? '' : 'Wachtwoord moet minimaal 8 tekens bevatten.';
            case 'kvk': return /^\d{8}$/.test(value) ? '' : 'KvK-nummer moet uit 8 cijfers bestaan.';
            default: return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = Object.keys(formData).reduce((acc, key) => {
            const error = validateField(key, formData[key]);
            if (error) acc[key] = error;
            return acc;
        }, {});

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const data = await apiRequest('/auth/register', 'POST', formData);
            showNotification(data.message, 'info', 8000);
            navigateTo('login');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <form onSubmit={handleSubmit} className="card" noValidate>
                <h2 className="text-2xl font-bold text-center mb-6">Account Registreren</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Bedrijfsnaam*</label>
                        <input type="text" name="bedrijfsnaam" value={formData.bedrijfsnaam} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-md ${errors.bedrijfsnaam ? 'border-red-500' : 'border-gray-300'}`} required />
                        {errors.bedrijfsnaam && <p className="text-red-500 text-xs mt-1">{errors.bedrijfsnaam}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">KvK-nummer*</label>
                        <input type="text" name="kvk" value={formData.kvk} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-md ${errors.kvk ? 'border-red-500' : 'border-gray-300'}`} required />
                        {errors.kvk && <p className="text-red-500 text-xs mt-1">{errors.kvk}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Emailadres*</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} required />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Wachtwoord*</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={`w-full p-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`} required />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                </div>
                <button type="submit" className="w-full btn btn-primary mt-6">Registreer</button>
                <p className="text-center mt-4 text-sm text-gray-600">
                    Heeft u al een account? <span onClick={() => navigateTo('login')} className="font-semibold link">Log hier in</span>
                </p>
            </form>
        </div>
    );
};

export default Register;