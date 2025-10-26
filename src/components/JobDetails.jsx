// src/components/JobDetails.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { apiRequest } from '../api';
import ConfirmationModal from './ConfirmationModal';
import StatusBadge from './StatusBadge';
import ConversationModal from './ConversationModal'; 
import JobFilesManager from './JobFilesManager';

const JobDetails = ({ showNotification }) => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [isConversationLoading, setIsConversationLoading] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const fetchJobDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiRequest('GET', `/api/jobs/${jobId}`);
            setJob(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        if (jobId && currentUser) {
            fetchJobDetails();
        }
    }, [jobId, currentUser, fetchJobDetails]);

    const handleConfirmAcceptance = async () => {
        setIsConfirming(true);
        try {
            await apiRequest('PUT', `/api/jobs/${job.id}/confirm-acceptance`);
            showNotification('Opdracht succesvol geaccepteerd!', 'success');
            fetchJobDetails();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsConfirming(false);
        }
    };

    const canSubmitQuote = () => {
        if (!currentUser || !currentUser.permissions) return false;
        return currentUser.permissions.includes('submit_marketplace_quotes');
    };

    const handleOpenConversation = async () => {
        setIsConversationLoading(true);
        try {
            const conversationData = await apiRequest('GET', `/api/conversations/job/${jobId}`);
            setCurrentConversation(conversationData);
            setIsConversationModalOpen(true);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsConversationLoading(false);
        }
    };

    const handleSendMessage = async (content) => {
        setIsSendingMessage(true);
        try {
            const newMessage = await apiRequest('POST', `/api/conversations`, {
                conversationId: currentConversation.id,
                content: content,
            });
            setCurrentConversation(prev => ({
                ...prev,
                messages: [...prev.messages, newMessage]
            }));
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSendingMessage(false);
        }
    };

    const handleConfirmDelete = async () => { /* Implementeer uw delete logica hier */ };

    const handleAcceptQuote = async (quoteId) => {
        setAcceptingQuoteId(quoteId);
        try {
            await apiRequest('PUT', `/api/quotes/${quoteId}/accept`);
            showNotification('Offerte geaccepteerd! De leverancier is op de hoogte gebracht.', 'success');
            fetchJobDetails();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setAcceptingQuoteId(null);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N.v.t.';
        return new Date(dateString).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (isLoading) return <div className="loading-text">Opdrachtdetails laden...</div>;
    if (!job) return <div className="loading-text">Opdracht niet gevonden.</div>;
    
    const isOwner = currentUser?.companyId === job.companyId;
    const isWinner = currentUser?.companyId === job.winnerProviderId;
    const canViewFiles = isOwner || (isWinner && ['WORK_PREPARATION', 'IN_PRODUCTION', 'COMPLETED', 'ARCHIVED'].includes(job.status));
    
    const properties = job.properties || {};
    const dimensions = [properties.length_mm, properties.width_mm, properties.height_mm, properties.depth_mm];
    const formatString = dimensions.filter(Boolean).join(' x ') + (dimensions.some(d => d) ? ' mm' : '');

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">{job.title}</h1>
                        <p className="page-subtitle">Opdrachtnummer: {job.jobNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isOwner && ['QUOTING', 'WORK_PREPARATION'].includes(job.status) && (
                            <button 
                                onClick={() => navigate(`/edit-job/${job.id}`)} 
                                className="btn btn-outline"
                            >
                                Bewerk Opdracht
                            </button>
                        )}
                        <button onClick={() => navigate(-1)} className="btn btn-ghost">← Terug</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title-lg">Opdrachtomschrijving</h2>
                                <p className="whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                        
                        {canViewFiles && (
                            <JobFilesManager
                                jobId={job.id}
                                currentUser={currentUser}
                                showNotification={showNotification}
                            />
                        )}
                        
                        {isOwner && (
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title-lg">Ingekomen Offertes ({job.quotes.length})</h2>
                                    <div className="mt-4 space-y-4">
                                        {job.quotes.length > 0 ? (
                                            job.quotes.map(quote => (
                                                <div key={quote.id} className="flex justify-between items-center p-4 rounded-lg bg-base-200">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="font-bold">{quote.company.name}</p>
                                                            <p className="text-lg">€ {parseFloat(quote.price).toFixed(2)}</p>
                                                        </div>
                                                        {quote.company.plan && quote.company.plan.isSponsored && (
                                                            <div className="badge badge-warning font-bold">Aanbevolen</div>
                                                        )}
                                                    </div>
                                                    {job.status === 'QUOTING' && (
                                                        <button 
                                                            className="btn btn-success"
                                                            onClick={() => handleAcceptQuote(quote.id)}
                                                            disabled={!!acceptingQuoteId}
                                                        >
                                                            {acceptingQuoteId === quote.id ? <span className="loading loading-spinner"></span> : 'Accepteer'}
                                                        </button>
                                                    )}
                                                     {quote.status === 'accepted' && <div className="badge badge-success">Geaccepteerd</div>}
                                                </div>
                                            ))
                                        ) : (
                                            <p>Er zijn nog geen offertes binnengekomen voor deze opdracht.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 self-start">
                        {isWinner && job.status === 'PENDING_SUPPLIER_CONFIRMATION' && (
                            <div className="card bg-success text-success-content shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title justify-center">U bent gekozen!</h2>
                                    <p className="text-center text-sm">De opdrachtgever heeft uw offerte geaccepteerd. Bevestig de opdracht om te beginnen.</p>
                                    <button 
                                        onClick={handleConfirmAcceptance} 
                                        className="btn btn-neutral w-full mt-2"
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? <span className="loading loading-spinner"></span> : 'Opdracht Accepteren'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isOwner && !isWinner && job.status === 'QUOTING' && (
                            <div className="card bg-primary-content text-primary-focus shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title justify-center">Acties</h2>
                                    {canSubmitQuote() && (
                                        <button onClick={() => navigate(`/create-quote/${job.id}`)} className="btn btn-primary w-full">
                                            Offerte Maken
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleOpenConversation} 
                                        className="btn btn-secondary w-full"
                                        disabled={isConversationLoading}
                                    >
                                        {isConversationLoading ? <span className="loading loading-spinner"></span> : 'Stel Privévraag'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="card bg-base-100 shadow-xl">
                             <div className="card-body">
                                <h2 className="card-title">Details</h2>
                                <ul className="list-none space-y-3 mt-4 text-sm">
                                    <li className='flex justify-between'><strong>Status:</strong> <StatusBadge status={job.status} /></li>
                                    <li className='flex justify-between border-t pt-3'><strong>Bedrijf:</strong> <span>{job.company.name}</span></li>
                                    <li className='flex justify-between'><strong>Geplaatst door:</strong> <span>{job.creator?.name || 'N/A'}</span></li>
                                    
                                    <li className='flex justify-between border-t pt-3'><strong>Aantal:</strong> <span>{job.quantity}</span></li>
                                    <li className='flex justify-between'><strong>Materiaal:</strong> <span>{properties.material || 'N/A'}</span></li>
                                    {formatString && <li className='flex justify-between'><strong>Formaat:</strong> <span>{formatString}</span></li>}
                                    
                                    <li className='flex justify-between border-t pt-3'><strong>Geplaatst op:</strong> <span>{formatDate(job.createdAt)}</span></li>
                                    <li className='flex justify-between'><strong>Deadline Offertes:</strong> <span>{formatDate(job.quotingDeadline)}</span></li>
                                    <li className='flex justify-between'><strong>Uiterlijke Deadline:</strong> <span className='font-bold'>{formatDate(job.deadline)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Opdracht Verwijderen"><p>Weet u zeker dat u deze opdracht permanent wilt verwijderen?</p></ConfirmationModal>
        
            <ConversationModal
                isOpen={isConversationModalOpen}
                onClose={() => setIsConversationModalOpen(false)}
                conversation={currentConversation}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                isSending={isSendingMessage}
            />
        </>
    );
};

export default JobDetails;