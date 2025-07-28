// src/components/ProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import { isValidDutchPostalCode, isValidDutchPhoneNumber, isValidIBAN } from '../utils/validation';

const ProfilePage = ({ showNotification, currentUser }) => {
    const [profileData, setProfileData] = useState(null);
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = useCallback((data) => {
        if (!data) return true;
        const newErrors = {};
        if (data.postcode && !isValidDutchPostalCode(data.postcode)) newErrors.postcode = 'Ongeldige postcode';
        if (data.telefoon && !isValidDutchPhoneNumber(data.telefoon)) newErrors.telefoon = 'Ongeldig telefoonnummer';
        if (data.iban && !isValidIBAN(data.iban)) newErrors.iban = 'Ongeldig IBAN-nummer';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest('/profile', 'GET');
                setProfileData(data);
                setOriginalProfileData(data);
                validate(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        // DE FIX: Voer de fetch alleen uit als we zeker weten wie de gebruiker is.
        if (currentUser) {
            fetchProfile();
        }
    }, [currentUser, showNotification, validate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...profileData, [name]: value };
        setProfileData(newData);
        validate(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate(profileData)) return;
        setIsSubmitting(true);
        try {
            const response = await apiRequest('/profile', 'PUT', profileData);
            showNotification('Profiel succesvol opgeslagen!');
            setOriginalProfileData(response.user);
            setProfileData(response.user);
            setErrors({});
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBorderClasses = (fieldName) => errors[fieldName] ? 'border-red-500' : 'border-gray-300';
    const inputClasses = "input input-bordered w-full";
    const disabledInputClasses = "input input-bordered w-full bg-base-200";
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
    const hasErrors = Object.keys(errors).length > 0;

    if (isLoading) return <div className="loading-text">Profiel laden...</div>;
    if (!profileData) return <div className="loading-text">Kon profielgegevens niet laden.</div>;

    return (
        <div className="form-container">
            <h1 className="page-title mb-6">Mijn Bedrijfsprofiel</h1>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="bedrijfsnaam" className="form-label"><span className="label-text">Bedrijfsnaam</span></label>
                        <input id="bedrijfsnaam" name="bedrijfsnaam" type="text" value={profileData.bedrijfsnaam || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="kvk" className="form-label"><span className="label-text">KvK-nummer</span></label>
                        <input id="kvk" name="kvk" type="text" value={profileData.kvk || ''} className={disabledInputClasses} disabled />
                    </div>
                    <div>
                        <label htmlFor="email" className="form-label"><span className="label-text">E-mailadres</span></label>
                        <input id="email" name="email" type="email" value={profileData.email || ''} className={disabledInputClasses} disabled />
                    </div>
                    <div>
                        <label htmlFor="telefoon" className="form-label"><span className="label-text">Telefoonnummer</span></label>
                        <input id="telefoon" name="telefoon" type="text" value={profileData.telefoon || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('telefoon')}`} />
                        {errors.telefoon && <p className="form-error-text">{errors.telefoon}</p>}
                    </div>
                    <div>
                        <label htmlFor="adres" className="form-label"><span className="label-text">Adres</span></label>
                        <input id="adres" name="adres" type="text" value={profileData.adres || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label htmlFor="postcode" className="form-label"><span className="label-text">Postcode</span></label>
                        <input id="postcode" name="postcode" type="text" value={profileData.postcode || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('postcode')}`} />
                        {errors.postcode && <p className="form-error-text">{errors.postcode}</p>}
                    </div>
                    <div>
                        <label htmlFor="plaats" className="form-label"><span className="label-text">Plaats</span></label>
                        <input id="plaats" name="plaats" type="text" value={profileData.plaats || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="iban" className="form-label"><span className="label-text">IBAN</span></label>
                        <input id="iban" name="iban" type="text" value={profileData.iban || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('iban')}`} />
                        {errors.iban && <p className="form-error-text">{errors.iban}</p>}
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <button type="submit" disabled={!hasChanges || isSubmitting || hasErrors} className="w-full btn-primary">
                        {isSubmitting ? <span className="loading-spinner"></span> : 'Wijzigingen Opslaan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
