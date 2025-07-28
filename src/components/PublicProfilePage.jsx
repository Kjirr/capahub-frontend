import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import StarRating from './StarRating';

const PublicProfilePage = ({ userId, showNotification, navigateTo }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!userId) return;
            try {
                const data = await apiRequest(`/users/${userId}`);
                setProfile(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchPublicProfile();
    }, [userId, showNotification]);

    if (loading) return <p>Profiel wordt geladen...</p>;
    if (!profile) return <p>Kon dit bedrijfsprofiel niet vinden.</p>;

    return (
        <div>
            <button onClick={() => window.history.back()} className="btn btn-secondary mb-6">← Terug</button>
            <div className="card">
                <h2 className="page-title">{profile.bedrijfsnaam}</h2>
                <p className="text-lg text-gray-600 mb-6">{profile.plaats}</p>
                <div className="flex items-center gap-2 mb-6">
                    <StarRating rating={Math.round(profile.averageRating)} /> 
                    <span className="text-gray-600">({profile.reviewCount} reviews)</span>
                </div>
                <h3 className="text-2xl font-semibold border-t pt-6 mt-6">Productiecapaciteiten</h3>
                {profile.capabilities && profile.capabilities.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {profile.capabilities.map((cap, index) => (
                            <div key={index} className="p-4 border rounded-md">
                                <h4 className="font-bold text-lg">{cap.machineType}</h4>
                                <p><strong>Materialen:</strong> {cap.materials}</p>
                                {cap.details && <p><strong>Details:</strong> {cap.details}</p>}
                            </div>
                        ))}
                    </div>
                ) : (<p className="mt-4">Dit bedrijf heeft nog geen specifieke capaciteiten opgegeven.</p>)}
                <h3 className="text-2xl font-semibold border-t pt-6 mt-6">Reviews</h3>
                {profile.reviews && profile.reviews.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {profile.reviews.map((review, index) => (
                            <div key={index} className="p-4 border-b">
                                <StarRating rating={review.rating} />
                                <p className="text-gray-800 mt-2">{review.comment}</p>
                                <p className="text-sm text-gray-500 mt-2">- {review.customerName}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4">Dit bedrijf heeft nog geen reviews ontvangen.</p>
                )}
            </div>
        </div>
    );
};

export default PublicProfilePage;