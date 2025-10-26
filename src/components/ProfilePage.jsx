import React, { useState, useEffect } from 'react';
// --- START WIJZIGING: useNavigate hook importeren ---
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, startDummySubscription, getPlans } from '../api';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'navigateTo' prop verwijderd ---
const ProfilePage = ({ showNotification }) => {
    const navigate = useNavigate(); // Hook initialiseren
    // --- EINDE WIJZIGING ---

    const [profile, setProfile] = useState(null);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profileData = await getProfile();
                const plansData = await getPlans();
                setProfile(profileData);
                setPlans(plansData.filter(p => p.name !== 'FREE'));
            } catch (error) {
                showNotification('Kon profielgegevens niet laden', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [showNotification]);

    const handleSubscription = async (planName) => {
        try {
            await startDummySubscription(planName);
            const updatedProfile = await getProfile();
            setProfile(updatedProfile);
            showNotification(`U bent nu geabonneerd op het ${planName} plan!`, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (isLoading) return <div>Profiel laden...</div>;
    if (!profile) return <div>Geen profiel gevonden.</div>;
    
    const currentPlan = profile.company.plan;

    return (
        <div className="page-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Mijn Gegevens</h2>
                            <div className="divider my-2"></div>
                            <div className="space-y-4">
                                <div><strong>Naam:</strong> {profile.name}</div>
                                <div><strong>Email:</strong> {profile.email}</div>
                                <div><strong>Rol binnen bedrijf:</strong> {profile.companyRole}</div>
                                <div className="mt-6">
                                    <h3 className="font-bold text-lg mb-2">Bedrijfsgegevens</h3>
                                    <p className="text-slate-600 mb-4">Beheer hier de algemene informatie en het logo van uw bedrijf.</p>
                                    {/* --- START WIJZIGING: 'navigate' gebruiken met correcte URL --- */}
                                    <button onClick={() => navigate('/company-profile')} className="btn btn-secondary">
                                        Beheer Bedrijfsgegevens & Logo
                                    </button>
                                    {/* --- EINDE WIJZIGING --- */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Abonnement</h2>
                            <div className="divider my-2"></div>
                            {currentPlan ? (
                                <div>
                                    <p className="mb-2"><strong>Huidig Plan:</strong> <span className="badge badge-primary">{currentPlan.name}</span></p>
                                    <p className="text-sm text-slate-500">{currentPlan.description}</p>
                                </div>
                            ) : (
                                <p>Geen actief abonnement.</p>
                            )}

                            <div className="mt-6">
                                <h3 className="font-bold">Upgrade uw abonnement</h3>
                                <div className="space-y-3 mt-3">
                                    {plans.map(plan => (
                                        <button 
                                            key={plan.id}
                                            onClick={() => handleSubscription(plan.name)} 
                                            className="btn btn-accent w-full"
                                            disabled={currentPlan?.name === plan.name}
                                        >
                                            Upgrade naar {plan.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;