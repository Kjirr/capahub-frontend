import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';
import FileListModal from './FileListModal'; 

// --- De tegel-component (onveranderd) ---
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);
const FileCategoryTile = ({ title, count, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-all duration-200 shadow"
        >
            <div className="card-body flex-row items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    <div className="text-primary"><FolderIcon /></div>
                    <h3 className="card-title text-base">{title}</h3>
                </div>
                <div className="stat-value text-primary">{count}</div>
            </div>
        </div>
    );
};


const JobFilesManager = ({ jobId, currentUser, showNotification }) => {
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, purpose: null });

    const fetchFiles = useCallback(async () => {
        try {
            // ▼▼▼ HIER ZAT DE FOUT - NU GECORRIGEERD ▼▼▼
            const fileData = await apiRequest('GET', `/api/jobs/${jobId}/files`);
            setFiles(fileData || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        if (jobId) {
            setIsLoading(true); // Zet loading op true aan het begin van de fetch
            fetchFiles();
        }
    }, [jobId, fetchFiles]);

    const getFilesByPurpose = (purpose) => {
        return files.filter(f => f.purpose === purpose);
    };
    
    const openModal = (purpose) => {
        setModalState({ isOpen: true, purpose: purpose });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, purpose: null });
    };

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Bestandsbeheer</h2>
                    <div className="p-4 text-center">Bestanden laden...</div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title-lg">Bestandsbeheer</h2>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FileCategoryTile 
                            title="Aangeleverd" 
                            count={getFilesByPurpose('INCOMING').length}
                            onClick={() => openModal('INCOMING')} 
                        />
                        <FileCategoryTile 
                            title="Drukproeven" 
                            count={getFilesByPurpose('PROOF').length}
                            onClick={() => openModal('PROOF')} 
                        />
                        <FileCategoryTile 
                            title="Productie" 
                            count={getFilesByPurpose('PRODUCTION').length}
                            onClick={() => openModal('PRODUCTION')}
                        />
                    </div>
                </div>
            </div>

            <FileListModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                purpose={modalState.purpose}
                files={getFilesByPurpose(modalState.purpose)}
                jobId={jobId}
                showNotification={showNotification}
                onUploadSuccess={fetchFiles}
            />
        </>
    );
};

export default JobFilesManager;