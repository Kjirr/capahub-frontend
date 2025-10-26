// src/components/QuoteUploadPage.jsx

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { apiRequest } from '../api';

const QuoteUploadPage = ({ showNotification }) => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles.filter(
            // Voorkom dubbele bestanden
            newFile => !prevFiles.some(existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size)
        )]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const handleUploadAndComplete = async () => {
        if (files.length === 0) {
            showNotification('Selecteer alstublieft ten minste één bestand om te uploaden.', 'warning');
            return;
        }
        setIsProcessing(true);
        
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            // --- START WIJZIGING: De API URL is hier gecorrigeerd ---
            await apiRequest(
                'POST',
                `/api/public/quotes/${token}/upload`,
                formData
            );
            // --- EINDE WIJZIGING ---
            
            // Stuur de gebruiker naar een definitieve bedankpagina
            navigate('/order-confirmed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Er is een onbekende fout opgetreden bij het uploaden.';
            showNotification(errorMessage, 'error');
            setIsProcessing(false);
        }
    };

    // --- START NIEUWE FUNCTIE: Logica voor de "Overslaan" knop ---
    const handleSkip = () => {
        // Navigeer direct naar de bevestigingspagina zonder te uploaden
        navigate('/order-confirmed');
    };
    // --- EINDE NIEUWE FUNCTIE ---

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Offerte Geaccepteerd!</h1>
                    <p className="mt-2 text-gray-600">Bijna klaar. Upload hier de benodigde bestanden voor uw order.</p>
                </div>

                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                    <input {...getInputProps()} />
                    {isDragActive ?
                        <p className="text-blue-600 font-semibold">Laat de bestanden nu los...</p> :
                        <p className="text-gray-500">Sleep bestanden hierheen, of klik om te selecteren</p>
                    }
                </div>

                {files.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Geselecteerde bestanden:</h3>
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {files.map((file, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                    <span className="text-sm truncate pr-2">{file.name}</span>
                                    <button onClick={() => removeFile(file)} className="btn btn-xs btn-ghost text-red-500 flex-shrink-0">Verwijder</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="text-center pt-4">
                    <button 
                        onClick={handleUploadAndComplete} 
                        disabled={isProcessing || files.length === 0}
                        className="btn btn-primary btn-lg w-full"
                    >
                        {isProcessing ? 'Bestanden verwerken...' : 'Order Afronden & Bestanden Versturen'}
                    </button>
                     <button 
                        // --- START WIJZIGING: onClick event aangepast ---
                        onClick={handleSkip} 
                        // --- EINDE WIJZIGING ---
                        disabled={isProcessing}
                        className="btn btn-link mt-2 text-sm"
                    >
                        Overslaan, ik stuur de bestanden later
                    </button>
                </div>
            </div>
        </div>
    );
};

// Een simpele bedankpagina
const OrderConfirmedPage = () => (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8 text-center space-y-4">
            <h1 className="text-3xl font-bold text-green-600">Bedankt!</h1>
            <p className="text-gray-700">Uw order is succesvol geplaatst. Indien u bestanden heeft geüpload, zijn deze in goede orde ontvangen. We nemen zo snel mogelijk contact met u op.</p>
            <p className="text-sm text-gray-500">U kunt dit venster nu sluiten.</p>
        </div>
    </div>
);

export { QuoteUploadPage, OrderConfirmedPage };