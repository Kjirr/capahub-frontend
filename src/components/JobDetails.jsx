import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import StatusBadge from './StatusBadge';
import StarRating from './StarRating';
import ConfirmationModal from './ConfirmationModal';

const JobDetails = ({ jobId, navigateTo, showNotification, currentUser }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");

    const fetchDetails = useCallback(async () => {
        if (!jobId) {
            setLoading(false);
            return;
        }
        try {
            const data = await apiRequest(`/jobs/${jobId}`);
            setJob(data);
        } catch (error) {
            if (loading) {
                showNotification(error.message, 'error');
            }
            console.error("Fout bij ophalen details:", error);
        } finally {
            setLoading(false);
        }
    }, [jobId, showNotification, loading]);

    useEffect(() => {
        fetchDetails();
        const intervalId = setInterval(fetchDetails, 10000);
        return () => clearInterval(intervalId);
    }, [fetchDetails]);

    const handleArchive = async () => {
        if (window.confirm('Weet je zeker dat je deze opdracht wilt archiveren? Je kunt hem hierna niet meer direct aanpassen.')) {
            try {
                await apiRequest(`/jobs/${jobId}/archive`, 'PUT');
                showNotification('Opdracht succesvol gearchiveerd', 'success');
                navigateTo('my-jobs');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const openAcceptModal = (quoteId) => {
        setSelectedQuoteId(quoteId);
        setIsModalOpen(true);
    };

    const confirmAcceptQuote = async () => {
        if (!selectedQuoteId) return;
        try {
            await apiRequest(`/jobs/${jobId}/quotes/${selectedQuoteId}/accept`, 'POST', {});
            showNotification('Offerte geaccepteerd!', 'success');
            fetchDetails(); // Herlaad direct
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsModalOpen(false);
        }
    };
    
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest(`/jobs/${jobId}/reviews`, 'POST', { rating: reviewRating, comment: reviewComment });
            showNotification("Review succesvol ingediend!", "success");
            fetchDetails(); // Herlaad direct
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    if (loading) return <p>Details en offertes laden...</p>;
    if (!job) return <p>Kon opdracht niet vinden.</p>;

    const isOwner = currentUser?.userId === job.customerId;

    return (
        <div>
            <button onClick={() => window.history.back()} className="btn btn-secondary mb-4">← Terug</button>
            <div className="card mb-8">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
                    <StatusBadge status={job.status} />
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{job.description}</p>
                <h3 className="font-semibold text-lg mb-2">Specificaties</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Oplage:</strong> {job.quantity}</li>
                    <li><strong>Materiaal:</strong> {job.material}</li>
                    <li><strong>Formaat:</strong> {job.format}</li>
                    {job.deadline && <li><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString('nl-NL')}</li>}
                </ul>
                {isOwner && job.status === 'quoting' && (
                    <div className="mt-6 pt-6 border-t flex gap-4">
                        <button onClick={() => navigateTo('edit-job', job.id)} className="btn btn-secondary">Aanpassen</button>
                        <button onClick={handleArchive} className="btn btn-danger">Archiveer</button>
                    </div>
                )}
            </div>
            
            {isOwner && job.status === 'quoting' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Ontvangen Offertes ({job.quotes?.length || 0})</h2>
                    {job.quotes && job.quotes.length > 0 ? (
                        <div className="space-y-4">
                            {job.quotes.map(quote => (
                                <div key={quote.id} className={`card border-2 ${quote.status === 'accepted' ? 'border-green-500' : 'border-transparent'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold link" onClick={() => navigateTo('public-profile', quote.providerId)}>{quote.provider?.bedrijfsnaam || 'Laden...'}</h3>
                                            <p className="text-2xl font-bold text-gray-800">€ {parseFloat(quote.price).toFixed(2)}</p>
                                            <p className="text-gray-600">Levertijd: {quote.deliveryTime}</p>
                                        </div>
                                        <div>
                                            {job.status === 'quoting' && (<button onClick={() => openAcceptModal(quote.id)} className="btn btn-primary">Accepteer Offerte</button>)}
                                            {quote.status === 'accepted' && (<p className="font-bold text-green-600">GEACCEPTEERD</p>)}
                                            {quote.status === 'rejected' && (<p className="font-bold text-red-600">AFGEWEZEN</p>)}
                                        </div>
                                    </div>
                                    {quote.comments && <p className="mt-4 pt-4 border-t text-gray-700"><i>Opmerking: {quote.comments}</i></p>}
                                </div>
                            ))}
                        </div>
                    ) : (<p>Er zijn nog geen offertes ontvangen.</p>)}
                </div>
            )}

            {(job.status === 'in_production' || job.status === 'completed') && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Productie Status</h2>
                    <div className="card space-y-4">
                        {job.productionSteps && job.productionSteps.length > 0 ? job.productionSteps.map(step => (
                            <div key={step.id} className="flex items-center gap-4 p-2 rounded-md">
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center text-white transition-colors duration-300 ${step.status === 'completed' ? 'bg-green-500' : (step.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300')}`}>
                                    {step.status === 'completed' ? '✓' : '●'}
                                </span>
                                <div>
                                    <p className="font-semibold text-slate-800">{step.title}</p>
                                    <p className="text-sm text-slate-500 capitalize">{step.status.replace('_', ' ')}</p>
                                </div>
                            </div>
                        )) : <p>De planning wordt voorbereid door de drukkerij.</p>}
                    </div>
                </div>
            )}

            {isOwner && job.status === 'completed' && !job.reviewSubmitted && (
                <div className="card mt-8">
                    <h2 className="text-2xl font-bold mb-4">Laat een review achter</h2>
                    <form onSubmit={handleReviewSubmit}>
                        <div className="mb-4"><label className="block text-gray-700 mb-2">Score</label><StarRating rating={reviewRating} setRating={setReviewRating} /></div>
                        <div className="mb-4"><label className="block text-gray-700 mb-2">Opmerking</label><textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full p-2 border rounded-md"></textarea></div>
                        <button type="submit" className="btn btn-primary" disabled={reviewRating === 0}>Verstuur Review</button>
                    </form>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmAcceptQuote}
                title="Offerte Accepteren"
            >
                <p>Weet je zeker dat je deze offerte wilt accepteren? Alle andere offertes voor deze opdracht zullen automatisch worden afgewezen.</p>
            </ConfirmationModal>
        </div>
    );
};

export default JobDetails;