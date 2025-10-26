// src/components/MarketplaceDashboard.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPublicJobs } from '@/api';

const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const QuoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v4a1 1 0 001 1h12a1 1 0 001-1v-4a1 1 0 00-.293-.707L16 13.586V8a6 6 0 00-6-6zM8 8a2 2 0 114 0v3a2 2 0 11-4 0V8z" /></svg>;
const MaterialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>;

const JobCard = ({ job, navigateTo, isFeatured }) => {
    const timeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        if (seconds < 60) return `zojuist`;
        if (minutes < 60) return `${minutes} min. geleden`;
        if (hours < 24) return `${hours} uur geleden`;
        if (days === 1) return `1 dag geleden`;
        return `${days} dagen geleden`;
    };
    const quoteCount = job._count?.quotes || 0;
    return (
        <div 
            className={`card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 flex flex-col ${isFeatured ? 'border-2 border-accent' : ''}`}
            onClick={() => navigateTo('job-details', job.id)}
        >
            <div className="card-body p-6 flex-grow">
                <div className="flex justify-between items-start gap-2">
                    <h2 className="card-title text-lg font-bold pr-2">{job.title}</h2>
                    {job.company.plan?.isSponsored && (
                        <div className="badge badge-accent font-bold shrink-0">
                            {isFeatured ? 'Uitgelicht' : 'Premium'}
                        </div>
                    )}
                </div>
                <p className="text-sm text-base-content/70 mt-1">
                    Geplaatst door {job.company.name} &bull; <span className="font-semibold">{timeAgo(job.createdAt)}</span>
                </p>
                <div className="my-4 border-t border-base-300"></div>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center"><CalendarIcon /><span>Deadline Offertes:</span><span className="ml-auto font-semibold">{new Date(job.quotingDeadline).toLocaleDateString('nl-NL')}</span></div>
                    <div className="flex items-center"><QuoteIcon /><span>Aantal Offertes:</span><span className="ml-auto font-semibold">{quoteCount}</span></div>
                    <div className="flex items-center"><MaterialIcon /><span>Materiaal:</span><span className="ml-auto font-semibold truncate" title={job.material}>{job.material}</span></div>
                </div>
            </div>
            <div className="card-actions justify-end p-6 pt-0">
                <button className="btn btn-primary w-full">Bekijk & Offreer</button>
            </div>
        </div>
    );
};

const MarketplaceDashboard = ({ showNotification, navigateTo }) => {
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [mainJobs, setMainJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [productTypeFilter, setProductTypeFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');
    const [deliveryDateFilter, setDeliveryDateFilter] = useState('');

    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            // GEWIJZIGD: Gebruik de nieuwe, veilige functie
            const data = await getPublicJobs();
            setFeaturedJobs(data.featuredJobs || []);
            setMainJobs(data.mainJobs || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filteredAndSortedJobs = useMemo(() => {
        let processedJobs = [...mainJobs];
        if (searchTerm) { processedJobs = processedJobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase()));}
        if (productTypeFilter !== 'ALL') { processedJobs = processedJobs.filter(job => job.productType === productTypeFilter); }
        if (deliveryDateFilter) { const filterDate = new Date(deliveryDateFilter); filterDate.setHours(0, 0, 0, 0); processedJobs = processedJobs.filter(job => { if (!job.deadline) return true; const jobDeadline = new Date(job.deadline); return jobDeadline >= filterDate; }); }
        switch (sortBy) {
            case 'deadline': processedJobs.sort((a, b) => new Date(a.quotingDeadline) - new Date(b.quotingDeadline)); break;
            case 'newest': default: processedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        }
        return processedJobs;
    }, [mainJobs, searchTerm, productTypeFilter, sortBy, deliveryDateFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setProductTypeFilter('ALL');
        setSortBy('newest');
        setDeliveryDateFilter('');
    };

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="page-title">Marktplaats</h1>
                    <p className="page-subtitle">Vind nieuwe opdrachten en breng uw bedrijf onder de aandacht.</p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5 md:sticky top-24 self-start">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-base"><FilterIcon />Filters</h2>
                            <div className="form-control w-full space-y-4">
                                <input type="text" placeholder="Zoek op trefwoord..." className="input input-bordered w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <select className="select select-bordered w-full" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)}>
                                    <option value="ALL">Alle Productsoorten</option>
                                    <option value="FLAT_PRINT">Plat Drukwerk</option>
                                    <option value="BOX">Doos / Verpakking</option>
                                    <option value="DISPLAY">Display</option>
                                    <option value="OTHER">Overig</option>
                                </select>
                                <label className="form-control w-full">
                                    <div className="label pb-1"><span className="label-text">Leverdatum na:</span></div>
                                    <input type="date" className="input input-bordered w-full" value={deliveryDateFilter} onChange={(e) => setDeliveryDateFilter(e.target.value)} />
                                </label>
                                <select className="select select-bordered w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">Nieuwste Eerst</option>
                                    <option value="deadline">Deadline Dichtbij</option>
                                </select>
                                <button onClick={resetFilters} className="btn btn-ghost w-full">Reset Filters</button>
                            </div>
                        </div>
                    </div>
                </aside>
                <main className="flex-1 space-y-8">
                    {isLoading ? (
                        <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
                    ) : (
                        <>
                            {featuredJobs.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-bold text-accent mb-4">Uitgelichte Opdrachten</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {featuredJobs.map(job => (<JobCard key={job.id} job={job} navigateTo={navigateTo} isFeatured={true} />))}
                                    </div>
                                </section>
                            )}
                            <section>
                                {(featuredJobs.length > 0 && filteredAndSortedJobs.length > 0) && (<h2 className="text-xl font-bold mb-4">Alle Opdrachten</h2>)}
                                {filteredAndSortedJobs.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredAndSortedJobs.map(job => (<JobCard key={job.id} job={job} navigateTo={navigateTo} isFeatured={false} />))}
                                    </div>
                                ) : (
                                    featuredJobs.length === 0 && (
                                        <div className="text-center p-10 card bg-base-200">
                                            <h3 className="text-lg font-bold">Geen opdrachten gevonden</h3>
                                            <p className="mt-2">Probeer uw zoekopdracht aan te passen of de filters te resetten.</p>
                                        </div>
                                    )
                                )}
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MarketplaceDashboard;