import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadInternalFile, createProof } from '../api';

const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FeedbackBadge = ({ proofItems }) => {
    if (!proofItems || proofItems.length === 0) return null;

    // Sorteer om de meest recente feedback te vinden
    const latestFeedback = [...proofItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    
    const STATUS_MAP = {
        PENDING: { text: 'Wacht op feedback', className: 'badge-warning' },
        APPROVED: { text: 'Goedgekeurd', className: 'badge-success' },
        REJECTED: { text: 'Afgekeurd', className: 'badge-error' },
    };

    const statusInfo = STATUS_MAP[latestFeedback.status] || { text: 'Onbekend', className: 'badge-ghost' };

    return (
        <div className="tooltip" data-tip={latestFeedback.comment || 'Geen commentaar'}>
            <span className={`badge ${statusInfo.className} badge-sm font-semibold`}>{statusInfo.text}</span>
        </div>
    );
};


const OrderFilesManager = ({ order, onUploadSuccess, showNotification }) => {
    const [activeTab, setActiveTab] = useState('internal');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState({});
    const [selectedFiles, setSelectedFiles] = useState(new Set());

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setIsUploading(true);
        try {
            await uploadInternalFile(order.id, file);
            showNotification(`'${file.name}' succesvol geüpload.`, 'success');
            onUploadSuccess();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Uploaden mislukt.', 'error');
        } finally {
            setIsUploading(false);
        }
    }, [order.id, onUploadSuccess, showNotification]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        disabled: isUploading,
    });

    const handleDownload = async (fileId, originalFilename) => {
        const key = `download_${fileId}`;
        setIsProcessing(prev => ({ ...prev, [key]: true }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/files/${fileId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Downloaden mislukt.');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = originalFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsProcessing(prev => ({ ...prev, [key]: false }));
        }
    };
    
    const handleFileSelection = (fileId) => {
        setSelectedFiles(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(fileId)) {
                newSelection.delete(fileId);
            } else {
                newSelection.add(fileId);
            }
            return newSelection;
        });
    };

    const handleCreateProof = async () => {
        if (selectedFiles.size === 0) return;
        const key = 'create_proof';
        setIsProcessing(prev => ({ ...prev, [key]: true }));
        try {
            const payload = {
                orderId: order.id,
                fileIds: Array.from(selectedFiles),
                title: `Proef voor order ${order.orderNumber}`
            };
            const result = await createProof(payload);
            navigator.clipboard.writeText(result.shareableLink);
            showNotification('Proefmap succesvol aangemaakt! Deellink is naar het klembord gekopieerd.', 'success');
            setSelectedFiles(new Set());
            onUploadSuccess();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Kon proefmap niet aanmaken.', 'error');
        } finally {
            setIsProcessing(prev => ({ ...prev, [key]: false }));
        }
    };

    const customerFiles = order.files.filter(f => f.purpose === 'INCOMING');
    const internalFiles = order.files.filter(f => ['PRODUCTION', 'PROOF'].includes(f.purpose));

    const FileRow = ({ file, isSelectable }) => (
        <div className={`flex items-center justify-between p-3 rounded-lg group ${selectedFiles.has(file.id) ? 'bg-blue-100' : 'hover:bg-gray-100'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {isSelectable && (
                    <input 
                        type="checkbox" 
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleFileSelection(file.id)}
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 truncate" title={file.originalFilename}>{file.originalFilename}</p>
                        <FeedbackBadge proofItems={file.proofItems} />
                    </div>
                    <span className="text-sm text-gray-500">{formatBytes(file.size)}</span>
                </div>
            </div>
            <div className="flex items-center gap-2 pl-4">
                <button className="btn btn-xs btn-primary" onClick={() => handleDownload(file.id, file.originalFilename)} disabled={isProcessing[`download_${file.id}`]}>
                    {isProcessing[`download_${file.id}`] ? '...' : 'Download'}
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
                <div className="flex justify-between items-start">
                    <h2 className="card-title">Digitale Werkmap</h2>
                    <button 
                        className="btn btn-primary" 
                        disabled={selectedFiles.size === 0 || isProcessing['create_proof']}
                        onClick={handleCreateProof}
                    >
                        {isProcessing['create_proof'] ? <span className="loading loading-spinner"></span> : `Maak Proef (${selectedFiles.size})`}
                    </button>
                </div>

                <div className="tabs tabs-boxed mt-2">
                    <a className={`tab ${activeTab === 'customer' ? 'tab-active' : ''}`} onClick={() => setActiveTab('customer')}>Bestanden van Klant ({customerFiles.length})</a>
                    <a className={`tab ${activeTab === 'internal' ? 'tab-active' : ''}`} onClick={() => setActiveTab('internal')}>Interne Productiebestanden ({internalFiles.length})</a>
                </div>

                <div className="py-4 max-h-96 overflow-y-auto">
                    {activeTab === 'customer' && (
                        customerFiles.length > 0 ? (
                            <div className="space-y-2 pr-2">{customerFiles.map(file => <FileRow key={file.id} file={file} isSelectable={false} />)}</div>
                        ) : (<p className="text-center text-gray-500 italic py-8">De klant heeft nog geen bestanden geüpload.</p>)
                    )}
                    {activeTab === 'internal' && (
                        <div>
                            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors mb-4 ${isDragActive ? 'border-primary bg-primary-content' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input {...getInputProps()} />
                                {isUploading ? <span className="loading loading-spinner"></span> : isDragActive ? <p>Laat het bestand los om te uploaden...</p> : <p>Sleep een bestand hierheen, of klik om te selecteren</p>}
                            </div>
                            {internalFiles.length > 0 ? (
                                <div className="space-y-2 pr-2">{internalFiles.map(file => <FileRow key={file.id} file={file} isSelectable={true} />)}</div>
                            ) : (!isUploading && <p className="text-center text-gray-500 italic py-8">Er zijn nog geen interne productiebestanden.</p>)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderFilesManager;