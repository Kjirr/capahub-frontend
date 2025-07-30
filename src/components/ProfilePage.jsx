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
    const [isUpgrading, setIsUpgrading] = useState(false);

    const validate = useCallback((data) => { /* ... ongewijzigde code ... */ if (!data?.company) return true; const newErrors = {}; const company = data.company; if (company.postcode && !isValidDutchPostalCode(company.postcode)) newErrors.postcode = 'Ongeldige postcode'; if (company.telefoon && !isValidDutchPhoneNumber(company.telefoon)) newErrors.telefoon = 'Ongeldig telefoonnummer'; if (company.iban && !isValidIBAN(company.iban)) newErrors.iban = 'Ongeldig IBAN-nummer'; setErrors(newErrors); return Object.keys(newErrors).length === 0; }, []);
    const fetchProfile = useCallback(async () => { /* ... ongewijzigde code ... */ setIsLoading(true); try { const data = await apiRequest('/profile', 'GET'); setProfileData(data); setOriginalProfileData(data); validate(data); } catch (error) { showNotification(error.message, 'error'); } finally { setIsLoading(false); } }, [showNotification, validate]);
    useEffect(() => { if (currentUser) { fetchProfile(); } }, [currentUser, fetchProfile]);
    const handleChange = (e) => { /* ... ongewijzigde code ... */ const { name, value } = e.target; if (['bedrijfsnaam', 'plaats', 'adres', 'postcode', 'telefoon', 'iban'].includes(name)) { setProfileData(prev => ({ ...prev, company: { ...prev.company, [name === 'bedrijfsnaam' ? 'name' : name]: value } })); } else { setProfileData(prev => ({ ...prev, [name]: value })); } };
    const handleSubmit = async (e) => { /* ... ongewijzigde code ... */ e.preventDefault(); const payload = { name: profileData.name, bedrijfsnaam: profileData.company.name, plaats: profileData.company.plaats, adres: profileData.company.adres, postcode: profileData.company.postcode, telefoon: profileData.company.telefoon, iban: profileData.company.iban }; if (!validate(profileData)) return; setIsSubmitting(true); try { await apiRequest('/profile', 'PUT', payload); showNotification('Profiel succesvol opgeslagen!'); fetchProfile(); } catch (error) { showNotification(error.message, 'error'); } finally { setIsSubmitting(false); } };
    
    // --- AANGEPASTE FUNCTIE VOOR DUMMY UPGRADE ---
    // Accepteert nu de naam van het plan ('PRO' of 'PREMIUM')
    const handleDummyUpgrade = async (planName) => {
        setIsUpgrading(true);
        try {
            await apiRequest('/subscriptions/start-dummy-plan', 'POST', { planName });
            showNotification(`Upgrade naar ${planName} succesvol! De pagina wordt herladen.`, 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUpgrading(false);
        }
    };

    if (isLoading) return <div className="loading-text">Profiel laden...</div>;
    if (!profileData) return <div className="loading-text">Kon profielgegevens niet laden.</div>;

    // Weergave voor een 'member' (blijft ongewijzigd)
    if (currentUser && currentUser.companyRole === 'member') {
        return ( <div className="page-container"><h1 className="page-title mb-6">Mijn Profiel</h1><div className="card bg-base-100 shadow-xl"><div className="card-body"><div className="space-y-4"><div><p className="text-sm text-gray-500">Naam</p><p className="text-lg font-semibold">{profileData.name}</p></div><div><p className="text-sm text-gray-500">Bedrijf</p><p className="text-lg font-semibold">{profileData.company?.name || 'Niet toegewezen'}</p></div><div><p className="text-sm text-gray-500">Rol binnen bedrijf</p><p className="text-lg font-semibold capitalize">{profileData.companyRole}</p></div><div><p className="text-sm text-gray-500">Status</p><p className="text-lg font-semibold"><span className={`badge ${profileData.status === 'active' ? 'badge-success' : profileData.status === 'suspended' ? 'badge-error' : 'badge-warning'}`}>{profileData.status}</span></p></div></div><p className="text-sm mt-6 text-gray-400">Voor het aanpassen van bedrijfsgegevens, neem contact op met de eigenaar van het account.</p></div></div></div> );
    }

    // Weergave voor een 'owner'
    const getBorderClasses = (fieldName) => errors[fieldName] ? 'border-red-500' : 'border-gray-300';
    const inputClasses = "input input-bordered w-full";
    const disabledInputClasses = "input input-bordered w-full bg-base-200";
    const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <div className="page-container space-y-8">
            <div>
                <h1 className="page-title">Mijn Bedrijfsprofiel</h1>
                <p className="page-subtitle">Beheer hier de gegevens van je bedrijf en je abonnement.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-6">
                {/* ... formulier blijft ongewijzigd ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><label htmlFor="bedrijfsnaam" className="form-label"><span className="label-text">Bedrijfsnaam</span></label><input id="bedrijfsnaam" name="bedrijfsnaam" type="text" value={profileData.company?.name || ''} onChange={handleChange} className={inputClasses} /></div><div><label htmlFor="kvk" className="form-label"><span className="label-text">KvK-nummer</span></label><input id="kvk" name="kvk" type="text" value={profileData.company?.kvk || ''} className={disabledInputClasses} disabled /></div><div><label htmlFor="email" className="form-label"><span className="label-text">E-mailadres</span></label><input id="email" name="email" type="email" value={profileData.email || ''} className={disabledInputClasses} disabled /></div><div><label htmlFor="telefoon" className="form-label"><span className="label-text">Telefoonnummer</span></label><input id="telefoon" name="telefoon" type="text" value={profileData.company?.telefoon || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('telefoon')}`} />{errors.telefoon && <p className="form-error-text">{errors.telefoon}</p>}</div><div><label htmlFor="adres" className="form-label"><span className="label-text">Adres</span></label><input id="adres" name="adres" type="text" value={profileData.company?.adres || ''} onChange={handleChange} className={inputClasses} /></div><div><label htmlFor="postcode" className="form-label"><span className="label-text">Postcode</span></label><input id="postcode" name="postcode" type="text" value={profileData.company?.postcode || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('postcode')}`} />{errors.postcode && <p className="form-error-text">{errors.postcode}</p>}</div><div><label htmlFor="plaats" className="form-label"><span className="label-text">Plaats</span></label><input id="plaats" name="plaats" type="text" value={profileData.company?.plaats || ''} onChange={handleChange} className={inputClasses} /></div><div><label htmlFor="iban" className="form-label"><span className="label-text">IBAN</span></label><input id="iban" name="iban" type="text" value={profileData.company?.iban || ''} onChange={handleChange} className={`${inputClasses} ${getBorderClasses('iban')}`} />{errors.iban && <p className="form-error-text">{errors.iban}</p>}</div></div>
                <div className="pt-4 border-t"><button type="submit" disabled={!hasChanges || isSubmitting || hasErrors} className="w-full btn-primary">{isSubmitting ? <span className="loading-spinner"></span> : 'Wijzigingen Opslaan'}</button></div>
            </form>

            {/* --- AANGEPASTE SECTIE VOOR ABONNEMENT --- */}
            <div className="card bg-base-100 shadow-xl p-8">
                <h2 className="card-title-lg">Mijn Abonnement</h2>
                <div className="mt-4">
                    <p>Huidig plan: <span className="badge badge-lg badge-secondary">{profileData.company?.plan?.name || 'FREE'}</span></p>
                    
                    {/* Toon de upgrade-opties alleen als het huidige plan FREE is */}
                    {profileData.company?.plan?.name === 'FREE' && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-lg">Upgrade uw abonnement</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                
                                {/* PRO Plan Optie */}
                                <div className="p-4 bg-base-200 rounded-lg flex flex-col">
                                    <p className="font-bold text-primary">PRO</p>
                                    <p className="text-sm mt-1 flex-grow">Toegang tot alle kernmodules zoals Inkoop, Magazijn en Team Beheer.</p>
                                    <button className="btn btn-primary mt-4" onClick={() => handleDummyUpgrade('PRO')} disabled={isUpgrading}>
                                        {isUpgrading ? "Bezig..." : "Upgrade naar PRO"}
                                    </button>
                                </div>

                                {/* PREMIUM Plan Optie */}
                                <div className="p-4 bg-base-200 rounded-lg flex flex-col">
                                    <p className="font-bold text-secondary">PREMIUM</p>
                                    <p className="text-sm mt-1 flex-grow">Volledige toegang tot alle modules, inclusief geavanceerde administratie en productieplanning.</p>
                                    <button className="btn btn-secondary mt-4" onClick={() => handleDummyUpgrade('PREMIUM')} disabled={isUpgrading}>
                                        {isUpgrading ? "Bezig..." : "Upgrade naar PREMIUM"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;