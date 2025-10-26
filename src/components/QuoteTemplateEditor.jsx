// src/components/QuoteTemplateEditor.jsx
import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-okaidia.css'; // Een donker thema
import { getQuoteTemplate, updateQuoteTemplate } from '../api';

const placeholders = `
  Beschikbare Velden:
  
  {{quote.number}}, {{quote.date}}
  
  {{company.name}}, {{company.address}}, {{company.zipcode}}, {{company.city}}
  <img src="{{company.logoBase64}}">
  
  {{customer.name}}, {{customer.contact}}, {{customer.email}}
  
  {{#each lines}}
    {{this.description}}, {{this.quantity}}, {{this.price}}
  {{/each}}
  
  {{totals.subtotal}}, {{totals.vat}}, {{totals.finalPrice}}
  
  {{#if company.terms}} {{{company.terms}}} {{/if}}
  {{#if company.footer}} {{company.footer}} {{/if}}
`;

const QuoteTemplateEditor = ({ showNotification, navigateTo }) => {
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getQuoteTemplate().then(data => {
            setCode(data.template || '');
        }).catch(err => showNotification(err.message, 'error'));
    }, [showNotification]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateQuoteTemplate(code);
            showNotification(result.message, 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="page-container">
            <h1 className="page-title">Offerte Template Bewerker</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <Editor
                            value={code}
                            onValueChange={setCode}
                            highlight={code => highlight(code, languages.markup, 'markup')}
                            padding={15}
                            className="editor"
                            style={{ fontFamily: '"Fira code", "Fira Mono", monospace', fontSize: 14, minHeight: '60vh' }}
                        />
                         <div className="card-actions justify-end mt-4">
                            <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost">Annuleren</button>
                            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'Opslaan...' : 'Template Opslaan'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Beschikbare Velden</h2>
                        <p className="text-sm">Gebruik deze placeholders in je template.</p>
                        <pre className="text-xs whitespace-pre-wrap p-4 bg-base-100 rounded-md mt-2">
                            <code>{placeholders}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteTemplateEditor;