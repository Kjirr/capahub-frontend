import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCompanyProfile, updateCompanyProfile, apiRequest } from '../api';
import { Editor } from '@tinymce/tinymce-react';

const PromotieBeheer = ({ showNotification }) => {
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [formData, setFormData] = useState({}); // Om de rest van de data vast te houden
    const [promotionalHtml, setPromotionalHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCompanyProfile();
            // Sla de niet-relevante data op voor de save-actie
            setFormData({
                name: data.name || '',
                kvk: data.kvk || '',
                adres: data.adres || '',
                postcode: data.postcode || '',
                plaats: data.plaats || '',
                telefoon: data.telefoon || '',
                iban: data.iban || '',
            });
            // Zet de HTML in de state voor de editor
            setPromotionalHtml(data.promotionalHtml || '');
        } catch (error) {
            showNotification('Kon promotionele content niet laden.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const data = new FormData();
        // Voeg de (verborgen) profielgegevens toe
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        // Voeg de (nieuwe) promotionele content toe
        if (editorRef.current) {
            data.append('promotionalHtml', editorRef.current.getContent());
        }

        try {
            // Gebruik dezelfde update functie, die nu alles opslaat
            await updateCompanyProfile(data);
            showNotification('Promotionele content succesvol opgeslagen!', 'success');
            fetchContent(); // Herlaad de data
        } catch (error) {
            showNotification(error.response?.data?.error || 'Kon content niet opslaan', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const imageUploadHandler = async (blobInfo, progress) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        try {
            const result = await apiRequest('POST', '/api/company/assets', formData);
            return result.location;
        } catch (error) {
            throw new Error(`Afbeelding uploaden mislukt: ${error.response?.data?.error || error.message}`);
        }
    };

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="page-container">
             <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">Promotie Content Beheer</h1>
                <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                    ← Terug naar Instellingen
                </button>
            </div>

            <form onSubmit={handleSave} className="card bg-base-100 shadow-xl">
                <div className="card-body space-y-8">
                    <div>
                        <h3 className="font-bold text-lg">
                            Content voor <code>{"{{reclame}}"}</code>
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            De inhoud van deze editor wordt ingevoegd op elke plek waar je de <code>{"{{reclame}}"}</code> placeholder gebruikt (bijv. de 'Bedankt'-pagina).
                        </p>
                        
                        <Editor
                            apiKey={TINYMCE_API_KEY}
                            onInit={(evt, editor) => editorRef.current = editor}
                            initialValue={promotionalHtml}
                            init={{
                                height: 500,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen', 
                                    'insertdatetime', 'media', 'table', 'textcolor', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | blocks | ' +
                                         'bold italic underline strikethrough | ' +
                                         'forecolor backcolor | alignleft aligncenter ' +
                                         'alignright alignjustify | bullist numlist outdent indent | ' +
                                         'link image media table | removeformat | code | preview | help',
                                
                                image_advtab: true, 
                                image_dimensions: true,
                                image_title: true, 
                                automatic_uploads: true,
                                images_upload_handler: imageUploadHandler,
                                file_picker_types: 'image',
                                
                                // --- START AANGEPASTE SECTIE (SLIMME REGEL) ---
                                // Deze regel past de 'auto' breedte/hoogte alleen toe als er
                                // GEEN inline 'style' attribuut is. Zodra je 'Save' klikt,
                                // wordt er een 'style' attribuut toegevoegd en geldt deze
                                // regel niet meer, waardoor jouw 1000px wel werkt.
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } img:not([style]) { width: auto !important; height: auto !important; max-width: 100% !important; }'
                                // --- EINDE AANGEPASTE SECTIE ---
                            }}
                        />

                    </div>
                    <div className="card-actions justify-end mt-4">
                        <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
                            Content Opslaan
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PromotieBeheer;