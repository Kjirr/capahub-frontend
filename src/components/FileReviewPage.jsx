import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigate importeren
import { getPublicProof, submitProofFeedback, getPublicProofPreviewBlob } from '../api';

const FileReviewItem = ({ item, token, onFeedbackChange, feedback }) => {
    // ... Dit sub-component blijft 100% ongewijzigd ...
    const [previewSrc, setPreviewSrc] = useState('');
    const [previewError, setPreviewError] = useState('');

    useEffect(() => {
        let objectUrl;
        setPreviewError('');

        getPublicProofPreviewBlob(token, item.file.id)
            .then(response => {
                const blob = new Blob([response.data], { type: item.file.mimetype });
                objectUrl = URL.createObjectURL(blob);
                setPreviewSrc(objectUrl);
            })
            .catch(() => {
                setPreviewError('Voorbeeld kon niet worden geladen.');
            });

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [token, item.file.id, item.file.mimetype]);
    
    return (
        <div className="border rounded-lg p-4 space-y-3 bg-white">
            <h3 className="font-bold text-lg">{item.file.originalFilename}</h3>
            
            {previewError ? (
                 <div className="w-full h-[600px] border bg-gray-50 rounded flex items-center justify-center text-red-500">{previewError}</div>
            ) : previewSrc ? (
                <>
                    {item.file.mimetype.startsWith('image/') && (
                        <img src={previewSrc} alt={`Proefdruk van ${item.file.originalFilename}`} className="w-full border bg-gray-50 rounded" loading="lazy" />
                    )}
                    {item.file.mimetype === 'application/pdf' && (
                        <iframe src={previewSrc} className="w-full h-[600px] border bg-gray-50 rounded" title={item.file.originalFilename}></iframe>
                    )}
                </>
            ) : (
                <div className="w-full h-[600px] border bg-gray-50 rounded flex items-center justify-center">
                    <span className="loading loading-spinner"></span> Preview laden...
                </div>
            )}

            <div className="text-right text-sm">
                <a className="link link-primary" href={`/api/public/proofs/${token}/download/${item.file.id}`} download={item.file.originalFilename}>Download origineel</a>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
                <button 
                    onClick={() => onFeedbackChange(item.id, { status: 'APPROVED', comment: '' })}
                    className={`btn ${feedback?.status === 'APPROVED' ? 'btn-success' : 'btn-outline'}`}
                    aria-label={`Keur ${item.file.originalFilename} goed`}
                >
                    👍 Akkoord
                </button>
                <button 
                    onClick={() => onFeedbackChange(item.id, { status: 'REJECTED', comment: feedback?.comment || '' })}
                    className={`btn ${feedback?.status === 'REJECTED' ? 'btn-error' : 'btn-outline'}`}
                    aria-label={`Keur ${item.file.originalFilename} af`}
                >
                    👎 Niet Akkoord
                </button>
            </div>

            {feedback?.status === 'REJECTED' && (
                <div className="form-control mt-2">
                    <label htmlFor={`comment-${item.id}`} className="label">
                        <span className="label-text">Opmerkingen (verplicht bij afkeuring):</span>
                    </label>
                    <textarea 
                        id={`comment-${item.id}`}
                        className="textarea textarea-bordered w-full"
                        placeholder="Licht kort toe wat er aangepast moet worden..."
                        value={feedback.comment || ''}
                        onChange={(e) => onFeedbackChange(item.id, { status: 'REJECTED', comment: e.target.value })}
                        aria-describedby={`hint-${item.id}`}
                    ></textarea>
                    <p id={`hint-${item.id}`} className="text-xs text-gray-500 mt-1 pl-1">Deze opmerking is zichtbaar voor de orderbehandelaar.</p>
                </div>
            )}
        </div>
    );
};

const FileReviewPage = () => {
    const { token } = useParams();
    const navigate = useNavigate(); // <-- useNavigate hook
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // De 'submitted' state is niet meer nodig hier
    // const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        getPublicProof(token)
            .then(response => {
                if (!response.data || !response.data.items || response.data.items.length === 0) {
                    setError('Deze proef bevat geen bestanden om te beoordelen.');
                    setProof(null);
                    return;
                }
                setProof(response.data);
                const initialFeedback = {};
                response.data.items.forEach(item => {
                    initialFeedback[item.id] = { status: 'PENDING', comment: '' };
                });
                setFeedback(initialFeedback);
            })
            .catch(err => setError(err.response?.data?.error || 'Kon de proef niet laden.'))
            .finally(() => setLoading(false));
    }, [token]);

    // De 'beforeunload' hook is niet meer nodig, want we redirecten
    // en de 'submitted' state is weg.

    const handleFeedbackChange = (proofItemId, newFeedback) => {
        setFeedback(prev => ({
            ...prev,
            [proofItemId]: { ...prev[proofItemId], ...newFeedback }
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const feedbackToSend = Object.fromEntries(
            Object.entries(feedback).filter(([, v]) => v?.status && v.status !== 'PENDING')
        );

        if (Object.keys(feedbackToSend).length === 0) {
            setError('Geen feedback gegeven om te versturen.');
            setIsSubmitting(false);
            return;
        }

        try {
            await submitProofFeedback(token, feedbackToSend);
            // --- HIER IS DE WIJZIGING ---
            // In plaats van state te setten, navigeren we naar de nieuwe pagina.
            navigate(`/proof-feedback-received/${token}`);
        } catch (err) {
            setError('Kon de feedback niet versturen. Probeer het opnieuw.');
            setIsSubmitting(false);
        }
    };

    const allFeedbackGiven = !!proof?.items?.length && proof.items.every((item) => {
        const itemFeedback = feedback[item.id];
        if (!itemFeedback || itemFeedback.status === 'PENDING') return false;
        if (itemFeedback.status === 'REJECTED' && (!itemFeedback.comment || itemFeedback.comment.trim() === '')) return false;
        return true;
    });

    if (loading) return <div className="flex items-center justify-center min-h-screen">Laden...</div>;
    
    // --- DE 'if (submitted)' BLOK IS HIER VOLLEDIG VERWIJDERD ---
    
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold text-xl p-8">{error}</div>;
    if (!proof) return null;

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="bg-white p-6 rounded-t-lg shadow-md flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{proof.order.company.name}</h1>
                        <p className="text-gray-600">Proef voor order: {proof.order.orderNumber}</p>
                    </div>
                    {proof.order.company.logoUrl && <img src={proof.order.company.logoUrl} alt="Bedrijfslogo" className="max-h-16" loading="lazy" />}
                </header>

                <main className="space-y-6 mt-1">
                    {proof.items.map(item => (
                        <FileReviewItem 
                            key={item.id}
                            item={item}
                            token={token}
                            onFeedbackChange={handleFeedbackChange}
                            feedback={feedback[item.id]}
                        />
                    ))}

                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <button 
                            className="btn btn-primary btn-lg" 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !allFeedbackGiven}
                        >
                            {isSubmitting ? 'Versturen...' : 'Definitieve Feedback Versturen'}
                        </button>
                        {!allFeedbackGiven && (
                            <p className="text-xs text-gray-500 mt-2">
                                Geef voor alle bestanden een akkoord of afwijzing (met opmerking) voordat je verstuurt.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FileReviewPage;