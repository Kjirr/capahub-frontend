import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const ProfilePage = ({ showNotification }) => {
    const [profile, setProfile] = useState(null);
    const [capabilities, setCapabilities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiRequest('/profile');
                setProfile(data);
                setCapabilities(data.capabilities || []);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [showNotification]);

    const handleProfileChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCapabilityChange = (index, field, value) => {
        const newCaps = [...capabilities];
        newCaps[index][field] = value;
        setCapabilities(newCaps);
    };

    const addCapability = () => setCapabilities([...capabilities, { machineType: '', materials: '', details: '' }]);
    const removeCapability = (index) => setCapabilities(capabilities.filter((_, i) => i !== index));

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/profile', 'PUT', profile);
            showNotification('Profiel succesvol bijgewerkt', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleCapabilitiesSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/profile/capabilities', 'PUT', { capabilities });
            showNotification('Capaciteiten succesvol opgeslagen', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (loading) return <p>Profiel laden...</p>;
    if (!profile) return <p>Kon profiel niet laden.</p>;

    return (
        <div className="max-w-4xl mx-auto mt-10 space-y-8">
            <form onSubmit={handleProfileSubmit} className="card">
                <h2 className="text-2xl font-bold mb-6">Mijn Bedrijfsprofiel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-gray-700 mb-2">Bedrijfsnaam</label><input type="text" name="bedrijfsnaam" value={profile.bedrijfsnaam || ''} onChange={handleProfileChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-gray-700 mb-2">Plaats</label><input type="text" name="plaats" value={profile.plaats || ''} onChange={handleProfileChange} className="w-full p-2 border rounded-md" /></div>
                </div>
                <div className="mt-6 text-right"><button type="submit" className="btn btn-primary">Bedrijfsgegevens Opslaan</button></div>
            </form>
            <form onSubmit={handleCapabilitiesSubmit} className="card">
                <h2 className="text-2xl font-bold mb-6">Mijn Productiecapaciteiten</h2>
                <p className="text-gray-600 mb-6">Voeg hier uw machines en specialisaties toe.</p>
                <div className="space-y-6">
                    {capabilities.map((cap, index) => (
                        <div key={index} className="p-4 border rounded-lg relative">
                            <button type="button" onClick={() => removeCapability(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">X</button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-gray-700 mb-2">Machinetype</label><input type="text" placeholder="bv. Heidelberg Speedmaster" value={cap.machineType} onChange={e => handleCapabilityChange(index, 'machineType', e.target.value)} className="w-full p-2 border rounded-md" required /></div>
                                <div><label className="block text-gray-700 mb-2">Materialen (komma's)</label><input type="text" placeholder="bv. papier, karton, vinyl" value={cap.materials} onChange={e => handleCapabilityChange(index, 'materials', e.target.value)} className="w-full p-2 border rounded-md" required /></div>
                                <div className="md:col-span-2"><label className="block text-gray-700 mb-2">Overige specificaties</label><textarea placeholder="bv. Max formaat: 70x100cm" value={cap.details} onChange={e => handleCapabilityChange(index, 'details', e.target.value)} className="w-full p-2 border rounded-md"></textarea></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-between">
                    <button type="button" onClick={addCapability} className="btn btn-secondary">Nieuwe Capaciteit Toevoegen</button>
                    <button type="submit" className="btn btn-primary">Capaciteiten Opslaan</button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;