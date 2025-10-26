// src/components/Marketplace.jsx

import React, { useState, useEffect } from 'react';
import { getPublicJobs } from '@/api';

const Marketplace = ({ showNotification, navigateTo, currentUser }) => {
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [mainJobs, setMainJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicJobs = async () => {
            setIsLoading(true);
            try {
                const data = await getPublicJobs();
                setFeaturedJobs(data.featuredJobs || []);
                setMainJobs(data.mainJobs || []);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchPublicJobs();
        }
    }, [currentUser, showNotification]);

    // Deze functie blijft hetzelfde, de aanroep wordt aangepast in de JSX
    const formatProductType = (type) => {
        switch (type) {
            case 'FLAT_PRINT': return 'Plat Drukwerk';
            case 'BOX': return 'Doos / Verpakking';
            case 'DISPLAY': return 'Display';
            default: return 'Overig';
        }
    };

    // --- ▼▼▼ AANGEPAST OM 'PROPERTIES' TE GEBRUIKEN ▼▼▼ ---
    const formatDimensions = (job) => {
        // Haal properties op met een fallback voor de zekerheid
        const props = job.properties || {};
        const dims = [props.length_mm, props.width_mm, props.height_mm, props.depth_mm].filter(Boolean);
        if (dims.length === 0) return null;
        return dims.join(' x ') + ' mm';
    };

    const JobCard = ({ job }) => (
        <div 
            key={job.id} 
            onClick={() => navigateTo('job-details', job.id)}
            className={`card-interactive ${featuredJobs.some(f => f.id === job.id) ? 'border-2 border-accent' : ''}`}
        >
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <h2 className="card-title-lg">{job.title}</h2>
                        {job.company.plan?.isSponsored && (
                            <div className="badge badge-accent font-bold">
                                {featuredJobs.some(f => f.id === job.id) ? 'Uitgelicht' : 'Premium'}
                            </div>
                        )}
                    </div>
                    {/* --- ▼▼▼ AANGEPAST OM 'PROPERTIES' TE GEBRUIKEN ▼▼▼ --- */}
                    <div className="badge badge-neutral">{formatProductType(job.properties?.productType)}</div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/70 mt-2">
                    <span><strong>Oplage:</strong> {job.quantity}</span>
                    {/* --- ▼▼▼ AANGEPAST OM 'PROPERTIES' TE GEBRUIKEN ▼▼▼ --- */}
                    <span><strong>Materiaal:</strong> {job.properties?.material || 'N/A'}</span>
                    {/* De aanroep van formatDimensions() hoeft niet te veranderen, omdat we de functie zelf hebben aangepast */}
                    {formatDimensions(job) && <span><strong>Formaat:</strong> {formatDimensions(job)}</span>}
                    <span><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString('nl-NL') : 'N.v.t.'}</span>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="loading-text">Marktplaats laden...</div>;
    }

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="page-title">Marktplaats</h1>
                <p className="page-subtitle">Hier vindt u alle openbare opdrachten waar u een offerte voor kunt indienen.</p>
            </div>
            
            {(featuredJobs.length === 0 && mainJobs.length === 0) ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <p>Er zijn momenteel geen openbare opdrachten beschikbaar.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {featuredJobs.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-accent">Uitgelichte Opdrachten</h2>
                            {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
                        </div>
                    )}
                    <div className="space-y-4">
                        {featuredJobs.length > 0 && mainJobs.length > 0 && <h2 className="text-xl font-bold">Alle Opdrachten</h2>}
                        {mainJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;