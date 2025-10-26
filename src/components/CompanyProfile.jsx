import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, updateCompanyProfile, deleteCompanyLogo } from '../api';

const CompanyProfile = ({ showNotification }) => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [formData, setFormData] = useState({ name: '', kvk: '', adres: '', postcode: '', plaats: '', telefoon: '', iban: '' });
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCompanyProfile();
            setCompany(data);
            setFormData({
                name: data.name || '',
                kvk: data.kvk || '',
                adres: data.adres || '',
                postcode: data.postcode || '',
                plaats: data.plaats || '',
                telefoon: data.telefoon || '',
                iban: data.iban || '',
            });
            if (data.logoUrl) {
                setLogoPreview(`${data.logoUrl}?v=${new Date().getTime()}`);
            } else {
                setLogoPreview(null);
            }
        } catch (error) {
            showNotification('Kon bedrijfsprofiel niet laden.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        // De 'promotionalHtml' wordt hier niet meer meegestuurd
        
        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            await updateCompanyProfile(data);
            showNotification('Bedrijfsprofiel succesvol opgeslagen!', 'success');
            setLogoFile(null);
            fetchProfile();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Kon profiel niet opslaan', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!window.confirm("Weet u zeker dat u het bedrijfslogo wilt verwijderen?")) {
            return;
        }
        try {
            await deleteCompanyLogo();
            showNotification('Logo succesvol verwijderd', 'success');
            fetchProfile();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="page-container">
             <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Bedrijfsprofiel</h1>
                <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                    ← Terug naar Instellingen
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                <div className="card-body space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="font-bold text-lg">Bedrijfslogo</h3>
                            <div className="mt-4 aspect-video w-full bg-base-200 rounded-lg flex items-center justify-center">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Bedrijfslogo" className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <span className="text-sm text-gray-500">Geen logo</span>
                                )}
                            </div>
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} className="file-input file-input-bordered w-full mt-4" />
                            <p className="text-xs text-gray-500 mt-2">Max. 5MB. Aanbevolen formaten: PNG, JPG, SVG.</p>
                            {company && company.logoUrl && (
                                <button type="button" onClick={handleDeleteLogo} className="btn btn-error btn-outline btn-sm w-full mt-2">
                                    Huidig logo verwijderen
                                </button>
                            )}
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Bedrijfsnaam</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered" required />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">KVK-nummer</span></label>
                                <input type="text" name="kvk" value={formData.kvk} onChange={handleChange} className="input input-bordered" required />
                            </div>
                             <div className="form-control">
                                <label className="label"><span className="label-text">Adres</span></label>
                                <input type="text" name="adres" value={formData.adres} onChange={handleChange} className="input input-bordered" />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Postcode</span></label>
                                <input type="text" name="postcode" value={formData.postcode} onChange={handleChange} className="input input-bordered" />
                            </div>
                             <div className="form-control">
                                <label className="label"><span className="label-text">Plaats</span></label>
                                <input type="text" name="plaats" value={formData.plaats} onChange={handleChange} className="input input-bordered" />
                            </div>
                             <div className="form-control">
                                <label className="label"><span className="label-text">Telefoonnummer</span></label>
                                <input type="tel" name="telefoon" value={formData.telefoon} onChange={handleChange} className="input input-bordered" />
                            </div>
                            <div className="form-control md:col-span-2">
                                <label className="label"><span className="label-text">IBAN</span></label>
                                <input type="text" name="iban" value={formData.iban} onChange={handleChange} className="input input-bordered" />
                            </div>
                        </div>
                    </div>
                    
                    {/* --- DE EDITOR IS HIER VERWIJDERD --- */}
                    
                    <div className="card-actions justify-end mt-4">
                        <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                            Profiel Opslaan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CompanyProfile;