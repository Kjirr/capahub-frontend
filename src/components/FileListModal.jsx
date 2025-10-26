import React, { useState } from 'react';
import { apiRequest } from '../api';

// --- Hulp-componenten voor de UI ---
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// Functie om bestandsgrootte netjes te formatteren
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileListModal = ({ isOpen, onClose, files, purpose, jobId, showNotification, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Reset state wanneer de modal sluit
    const handleClose = () => {
        setSelectedFile(null);
        setIsUploading(false);
        onClose();
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showNotification('Selecteer eerst een bestand.', 'warning');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('purpose', purpose); // Stuur het doel van het bestand mee

        try {
            await apiRequest(`/jobs/${jobId}/files`, 'POST', formData);
            showNotification('Bestand succesvol geüpload!', 'success');
            onUploadSuccess(); // Roep de functie aan om de bestandenlijst te vernieuwen
            handleClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    // Geef de modal een titel op basis van het 'purpose'
    const titleMap = {
        INCOMING: 'Aangeleverde Bestanden',
        PROOF: 'Drukproeven',
        PRODUCTION: 'Productiebestanden'
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-3xl">
                <h3 className="font-bold text-xl">{titleMap[purpose] || 'Bestanden'}</h3>
                
                <div className="py-4 space-y-2 max-h-96 overflow-y-auto">
                    {files.length > 0 ? files.map(file => (
                        <div key={file.id} className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <FileIcon />
                                <div>
                                    <p className="font-semibold">{file.originalFilename}</p>
                                    <p className="text-xs text-base-content/70">{formatBytes(file.size)} - {new Date(file.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <a href={file.path} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                                <DownloadIcon />
                                Download
                            </a>
                        </div>
                    )) : (
                        <p className="text-center text-base-content/60">Nog geen bestanden in deze categorie.</p>
                    )}
                </div>

                <div className="divider">Nieuw bestand uploaden</div>

                <div className="form-control">
                    <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
                </div>

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleClose}>Sluiten</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? <span className="loading loading-spinner"></span> : 'Uploaden'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileListModal;