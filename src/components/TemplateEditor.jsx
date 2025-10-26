import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { getTemplateById, createTemplate, updateTemplate } from '../api';

const basePlaceholderGroups = {
    "Bedrijfsgegevens": [
        { label: 'Bedrijfsnaam', value: '{{company.name}}' },
        { label: 'Bedrijfslogo', value: '{{company.logo}}' },
        { label: 'Bedrijfslogo (URL)', value: '{{company.logo_url}}' },
        // --- START WIJZIGING ---
        { label: 'Adres', value: '{{company.address}}' },
        { label: 'Postcode', value: '{{company.postcode}}' },
        { label: 'Plaats', value: '{{company.city}}' },
        { label: 'KVK', value: '{{company.kvk}}' },
        { label: 'IBAN', value: '{{company.iban}}' },
        // --- EINDE WIJZIGING ---
    ],
    "Klant & Order": [
        { label: 'Ordernummer', value: '{{order.orderNumber}}' },
        { label: 'Klantnaam', value: '{{customer.name}}' },
        { label: 'Klantbedrijf', value: '{{customer.company}}' },
        // --- START WIJZIGING ---
        { label: 'Klant E-mail', value: '{{customer.email}}' },
        // --- EINDE WIJZIGING ---
    ],
    "Datums": [
        { label: 'Aanmaakdatum', value: '{{date.created}}' },
        { label: 'Leverdatum', value: '{{date.delivery}}' },
        { label: 'Verzenddatum', value: '{{date.shipping}}' },
    ],
    "Verzending": [
        { label: 'Verzendpartner Naam', value: '{{shipping.partnerName}}' },
    ],
    "Productspecificaties": [
        { label: 'Product Omschrijving', value: '{{product.description}}' },
        { label: 'Aantal', value: '{{product.quantity}}' },
        { label: 'Formaat', value: '{{product.dimensions}}' },
        { label: 'Materiaal', value: '{{product.material}}' },
    ],
    "Financieel": [
        { label: 'Totaalprijs (incl. BTW)', value: '{{price.totalWithVat}}' },
        { label: 'Totaalprijs (excl. BTW)', value: '{{price.totalWithoutVat}}' },
        { label: 'BTW Bedrag', value: '{{price.vatAmount}}' },
    ],
    "Bestandsdetails (voor Kijkdoos)": [
        { label: 'Bestandsnaam', value: '{{file.name}}' },
        { label: 'Uploader', value: '{{file.uploaderName}}' },
        { label: 'Upload Datum', value: '{{file.createdAt}}' },
    ],
    "Tabellen & Lijsten": [
        { label: 'Productiestappen (Tabel)', value: '{{tables.productionSteps}}' },
        // --- START WIJZIGING ---
        { label: 'Factuurregels (Tabel)', value: '{{tables.lineItems}}' },
        // --- EINDE WIJZIGING ---
    ]
};

const fileProofPlaceholders = {
    "Kijkdoos Specifiek": [
        { label: 'Proef Voorbeeld', value: '{{proef_voorbeeld}}' },
        { label: 'Akkoord Knop', value: '{{akkoord_knop}}' },
        { label: 'Niet Akkoord Knop', value: '{{niet_akkoord_knop}}' },
    ],
};

const promotionalPlaceholders = {
    "Marketing": [
        { label: 'Reclameblok', value: '{{reclame}}' }
    ]
};

// --- START NIEUWE SECTIE ---
const invoicePlaceholders = {
    "Factuur Specifiek": [
        { label: 'Factuurnummer', value: '{{invoice.invoiceNumber}}' },
        { label: 'Factuurdatum', value: '{{invoice.creationDate}}' },
        { label: 'Factuurstatus', value: '{{invoice.status}}' },
    ]
};
// --- EINDE NIEUWE SECTIE ---

const PlaceholderSelector = ({ onInsert, templateType }) => {
    const [visibleGroups, setVisibleGroups] = useState(basePlaceholderGroups);

    useEffect(() => {
        let groups = { ...basePlaceholderGroups };
        if (templateType === 'FILE_PROOF') {
            groups = { ...groups, ...fileProofPlaceholders };
        }
        if (templateType === 'FILE_PROOF_THANKS') {
            groups = { ...groups, ...promotionalPlaceholders };
        }
        // --- START WIJZIGING ---
        if (templateType === 'INVOICE') {
            groups = { ...groups, ...invoicePlaceholders };
        }
        // --- EINDE WIJZIGING ---
        setVisibleGroups(groups);
    }, [templateType]);

    return (
        <div className="mb-4 p-3 bg-base-200 rounded-lg">
            <h3 className="font-bold mb-2">Placeholders Invoegen</h3>
            <div className="space-y-3">
                {Object.entries(visibleGroups).map(([groupName, placeholders]) => (
                    <div key={groupName}>
                        <p className="text-sm font-semibold text-gray-600 mb-1">{groupName}</p>
                        <div className="flex flex-wrap gap-2">
                            {placeholders.map(p => (
                                <button key={p.value} type="button" onClick={() => onInsert(p.value, p.label)} className="btn btn-xs btn-outline">
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TemplateEditor = ({ showNotification }) => {
    const { id: templateId } = useParams();
    const navigate = useNavigate();
    
    const mainEditorRef = useRef(null);
    const termsEditorRef = useRef(null);
    const footerEditorRef = useRef(null);
    
    const [template, setTemplate] = useState({ 
        name: '', type: 'QUOTE', html: '', headerColor: '#1E40AF',
        termsHtml: '', footerHtml: '', isDefault: false 
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    // --- START WIJZIGING: State voor de specifieke foutmelding ---
    const [nameError, setNameError] = useState('');
    // --- EINDE WIJZIGING ---
    
    const isNew = templateId === 'new';
    
    const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;

    useEffect(() => {
        if (isNew || !templateId) {
            setIsLoading(false);
        } else {
            setIsLoading(true);
            getTemplateById(templateId)
                .then(setTemplate)
                .catch(err => showNotification(err.message, 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [templateId, isNew, showNotification]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTemplate(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setIsDirty(true);
        // --- START WIJZIGING: Verwijder de foutmelding zodra de gebruiker typt ---
        if (name === 'name') {
            setNameError('');
        }
        // --- EINDE WIJZIGING ---
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNameError(''); // Reset foutmelding bij elke poging
        try {
            const payload = {
                ...template,
                html: mainEditorRef.current ? mainEditorRef.current.getContent() : template.html,
                termsHtml: termsEditorRef.current ? termsEditorRef.current.getContent() : template.termsHtml,
                footerHtml: footerEditorRef.current ? footerEditorRef.current.getContent() : template.footerHtml,
            };
            
            if (isNew) {
                const newTemplate = await createTemplate(payload);
                showNotification("Template succesvol aangemaakt!", "success");
                setIsDirty(false);
                navigate(`/template-editor/${newTemplate.id}`);
            } else {
                await updateTemplate(templateId, payload);
                showNotification("Template succesvol opgeslagen!", "success");
                setIsDirty(false);
            }
        } catch (err) {
            // --- START WIJZIGING: Vang de specifieke 409 fout af ---
            if (err.response && err.response.status === 409) {
                setNameError(err.response.data.error); // Toon de foutmelding van de server
                showNotification("Opslaan mislukt, de naam bestaat al.", "error");
            } else {
                // Voor alle andere fouten, toon een generieke melding
                showNotification(err.message || 'Kon de template niet opslaan.', 'error');
            }
            // --- EINDE WIJZIGING ---
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleInsertPlaceholder = (editorRef, value, label) => {
        if (editorRef.current) {
            const content = `&nbsp;<span class="placeholder-tag" contenteditable="false" data-placeholder="${value}">[${label}]</span>&nbsp;`;
            editorRef.current.insertContent(content);
        }
    };

    if (isLoading) return <div className="p-6">Editor laden...</div>;
    if (!TINYMCE_API_KEY) return <div className="p-6 text-red-500 font-bold">TinyMCE API Key ontbreekt.</div>;

    return (
        <div className="page-container">
            <div className="flex justify-between items-center mb-6">
                <h1 className="page-title">{isNew ? 'Nieuwe Template Aanmaken' : `Template Bewerken: ${template.name}`}</h1>
                <button onClick={() => {
                    if (isDirty && !window.confirm("Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?")) {
                        return;
                    }
                    navigate('/document-templates');
                }} className="btn btn-ghost">
                    &larr; Terug naar overzicht
                </button>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold">Template Naam</span></label>
                            {/* --- START WIJZIGING: Voeg 'input-error' class toe bij een fout --- */}
                            <input type="text" name="name" value={template.name} onChange={handleChange} className={`input input-bordered ${nameError ? 'input-error' : ''}`} placeholder="bv. Standaard Werkbon"/>
                            {/* --- Toon de foutmelding onder het veld --- */}
                            {nameError && <label className="label"><span className="label-text-alt text-error">{nameError}</span></label>}
                            {/* --- EINDE WIJZIGING --- */}
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold">Type</span></label>
                            <select name="type" value={template.type} onChange={handleChange} className="select select-bordered" disabled={!isNew}>
                                <option value="QUOTE">Offerte</option>
                                <option value="INVOICE">Factuur</option>
                                <option value="PURCHASE_ORDER">Inkoopbon</option>
                                <option value="WORK_TICKET">Productiebon (Werkbon)</option>
                                <option value="PALLET_CARD">Palletkaart</option>
                                <option value="OUTSOURCING_TICKET">Bon Uitbesteding</option>
                                <option value="FILE_PROOF">Proefbestand Klant (Kijkdoos)</option>
                                <option value="FILE_PROOF_THANKS">Bedankpagina Proef</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold">Themakleur (voor PDF header)</span></label>
                            <input type="color" name="headerColor" value={template.headerColor || '#1E40AF'} onChange={handleChange} className="input h-12 p-1 w-full" />
                        </div>
                         <div className="form-control self-end">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input type="checkbox" name="isDefault" checked={template.isDefault} onChange={handleChange} className="checkbox checkbox-primary" />
                                <span className="label-text">Stel in als default voor dit type</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="form-control mt-6">
                        <label className="label"><span className="label-text font-bold">Template Inhoud (HTML)</span></label>
                        <PlaceholderSelector onInsert={(value, label) => handleInsertPlaceholder(mainEditorRef, value, label)} templateType={template.type} />
                        <Editor
                            apiKey={TINYMCE_API_KEY}
                            onInit={(evt, editor) => mainEditorRef.current = editor}
                            initialValue={template.html}
                            onDirty={() => setIsDirty(true)}
                            init={{ 
                                height: 500, menubar: true, plugins: 'lists link image autolink code table', 
                                toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code', 
                                content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px } .placeholder-tag { background-color: #e0e0e0; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-weight: bold; cursor: default; }`,
                                extended_valid_elements: 'span[class|contenteditable|data-placeholder]',
                                setup: (editor) => {
                                    editor.on('GetContent', (e) => {
                                        let content = e.content;
                                        const doc = new DOMParser().parseFromString(content, 'text/html');
                                        doc.querySelectorAll('.placeholder-tag').forEach(span => {
                                            const placeholder = span.getAttribute('data-placeholder');
                                            if (placeholder) { span.replaceWith(doc.createTextNode(placeholder)); }
                                        });
                                        e.content = doc.body.innerHTML;
                                    });
                                }
                            }}
                        />
                    </div>

                    <div className="form-control mt-6">
                        <label className="label"><span className="label-text font-bold">Algemene Voorwaarden (indien van toepassing)</span></label>
                        <Editor
                            apiKey={TINYMCE_API_KEY}
                            onInit={(evt, editor) => termsEditorRef.current = editor}
                            initialValue={template.termsHtml}
                            onDirty={() => setIsDirty(true)}
                            init={{ height: 200, menubar: false, plugins: 'lists link autolink', toolbar: 'undo redo | bold italic underline | bullist numlist | link', content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }' }}
                        />
                    </div>
                    
                    <div className="form-control mt-6">
                        <label className="label"><span className="label-text font-bold">Footer Tekst (indien van toepassing)</span></label>
                        <Editor
                            apiKey={TINYMCE_API_KEY}
                            onInit={(evt, editor) => footerEditorRef.current = editor}
                            initialValue={template.footerHtml}
                            onDirty={() => setIsDirty(true)}
                            init={{ height: 150, menubar: false, plugins: 'lists link autolink', toolbar: 'undo redo | bold italic underline | bullist numlist | link', content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }' }}
                        />
                    </div>
                    
                    <div className="card-actions justify-end mt-8 border-t pt-6">
                        <button type="button" onClick={() => {
                            if (isDirty && !window.confirm("Er zijn niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?")) {
                                return;
                            }
                            navigate('/document-templates');
                        }} className="btn btn-ghost">Annuleren</button>
                        <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <span className="loading loading-spinner"></span> : 'Template Opslaan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TemplateEditor;