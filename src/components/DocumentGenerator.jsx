// src/components/DocumentGenerator.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { getDirectQuoteById, getDefaultTemplateByType, getCompanyProfile } from '../api';

const generateQuoteLinesHtml = (quote, headerColor) => {
    if (!quote?.calculationResult) return '';

    const calculation = typeof quote.calculationResult === 'string' 
        ? JSON.parse(quote.calculationResult) 
        : quote.calculationResult || {};

    if (!calculation.lines || calculation.lines.length === 0) return '';

    let tableHtml = `
        <table width="100%" style="margin-top: 30px; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background-color: ${headerColor}; color: white;">
                    <th style="padding: 10px; text-align: left;">Omschrijving</th>
                    <th style="padding: 10px; text-align: right;">Aantal</th>
                    <th style="padding: 10px; text-align: right;">Stukprijs</th>
                    <th style="padding: 10px; text-align: right;">Totaal</th>
                </tr>
            </thead>
            <tbody>
    `;

    calculation.lines.forEach(line => {
        const totalCostNum = Number(line.totalCost) || 0;
        const quantityNum = Number(line.quantity) || 0;
        const unitPriceNum = quantityNum > 0 ? (totalCostNum / quantityNum) : 0;
        
        const material = line.calculationDetails?.imposition?.material?.name || 'N/A';
        const L = line.length_mm;
        const W = line.width_mm;
        const H = line.height_mm;
        const dimensions = L && W && H ? `${L}x${W}x${H} mm` : (W && H ? `${W}x${H} mm` : 'N/A');
        
        const description = line.description || `Drukwerk op ${material}`;
        
        const formattedUnitPrice = unitPriceNum.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        const formattedTotalCost = totalCostNum.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        tableHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <strong style="font-size: 14px;">${description}</strong>
                    <div style="font-size: 12px; color: #555;">
                        Materiaal: ${material}<br>
                        Formaat: ${dimensions}
                    </div>
                </td>
                <td style="padding: 10px; text-align: right; vertical-align: top;">${quantityNum}</td>
                <td style="padding: 10px; text-align: right; vertical-align: top;">€ ${formattedUnitPrice}</td>
                <td style="padding: 10px; text-align: right; vertical-align: top;">€ ${formattedTotalCost}</td>
            </tr>
        `;
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
};

const MASTER_TEMPLATE_LAYOUT = `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: auto; border: 1px solid #eee; padding: 40px;">
    <table width="100%" style="border-bottom: 2px solid {{template.headerColor}};">
        <tr>
            <td style="width: 50%;">
                <img src="{{company.logoUrl}}" alt="Bedrijfslogo" style="max-height: 70px;">
            </td>
            <td style="width: 50%; text-align: right;">
                <h1 style="font-size: 28px; margin: 0; color: {{template.headerColor}};">OFFERTE</h1>
                <p style="margin: 5px 0 0 0;">{{company.name}}</p>
                <p style="margin: 5px 0 0 0;">{{company.address}}</p>
                <p style="margin: 5px 0 0 0;">{{company.zipCode}} {{company.city}}</p>
            </td>
        </tr>
    </table>
    <table width="100%" style="margin-top: 30px;">
        <tr>
            <td style="width: 50%;">
                <h2 style="font-size: 16px; margin: 0 0 10px 0; color: #555;">GEADRESSEERDE</h2>
                <p style="margin: 0;"><strong>{{quote.customerName}}</strong></p>
            </td>
            <td style="width: 50%; text-align: right;">
                <p style="margin: 0;"><strong>Offertenummer:</strong> {{quote.quoteNumber}}</p>
                <p style="margin: 5px 0 0 0;"><strong>Datum:</strong> {{date.full}}</p>
                <p style="margin: 5px 0 0 0;"><strong>Opgesteld door:</strong> {{quote.creatorName}}</p>
            </td>
        </tr>
    </table>
    
    <div style="margin-top: 30px; font-size: 14px; line-height: 1.6;">
        {{template.termsHtml}}
    </div>

    {{quote.linesTable}}

    <div style="margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px;">
        {{template.footerHtml}}
    </div>
</div>
`;

const DocumentGenerator = ({ showNotification }) => {
    const editorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [documentContent, setDocumentContent] = useState('');
    const [sourceData, setSourceData] = useState(null);
    const [templateData, setTemplateData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const navigate = useNavigate(); // Hook gebruiken

    const { id: viewParam } = useParams();
    
    const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;
    const [documentType, sourceId] = viewParam ? viewParam.split('_') : [null, null];

    useEffect(() => {
        if (!documentType || !sourceId) { setIsLoading(false); return; }
        const fetchData = async () => {
            try {
                const [data, template, company] = await Promise.all([
                    getDirectQuoteById(sourceId),
                    getDefaultTemplateByType(documentType),
                    getCompanyProfile()
                ]);
                if (!template) {
                     showNotification(`Geen default template gevonden voor type '${documentType}'.`, 'error');
                     navigate(`/direct-quote-details/${sourceId}`); return;
                }
                setSourceData(data);
                setTemplateData(template);
                setCompanyData(company);
            } catch (error) {
                showNotification(`Fout bij laden van data: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [documentType, sourceId, showNotification, navigate]);

    const replacePlaceholders = (html, dataObject) => {
        if (!html) return '';
        let content = html;
        for (const [key, value] of Object.entries(dataObject)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        }
        return content;
    };

    useEffect(() => {
        if (sourceData && templateData && companyData) {
            
            const quoteLinesTable = generateQuoteLinesHtml(sourceData, templateData.headerColor);

            const fullDataObject = {
                'quote.quoteNumber': sourceData.quoteNumber,
                'quote.customerName': sourceData.customerName || sourceData.customerCompany || 'Klant',
                'quote.creatorName': sourceData.creator?.name || 'Onbekend',
                'date.full': new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }),
                'template.headerColor': templateData.headerColor || '#1E40AF',
                'company.logoUrl': companyData.logoUrl || '/logo.png',
                'company.name': companyData.name || 'Uw Bedrijfsnaam',
                'company.address': companyData.address || 'Straatnaam 123',
                'company.zipCode': companyData.zipCode || '1234 AB',
                'company.city': companyData.city || 'Stad',
                'quote.linesTable': quoteLinesTable,
                'template.termsHtml': templateData.termsHtml || '',
                'template.footerHtml': templateData.footerHtml || ''
            };

            const finalContent = replacePlaceholders(MASTER_TEMPLATE_LAYOUT, fullDataObject);

            setDocumentContent(finalContent);
            if (editorRef.current) {
                editorRef.current.setContent(finalContent);
            }
        }
    }, [sourceData, templateData, companyData]);

    if (isLoading) {
        return <div className="p-10 text-center">Document wordt gegenereerd...</div>;
    }
    
    return (
        <div className="page-container">
            <h1 className="page-title">Document Voor Offerte {sourceData?.quoteNumber}</h1>
            <p className="page-subtitle">Automatisch gegenereerd met template: "{templateData?.name}"</p>
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <Editor
                        apiKey={TINYMCE_API_KEY}
                        onInit={(evt, editor) => editorRef.current = editor}
                        initialValue={documentContent}
                        init={{
                            height: 800,
                            menubar: true,
                            plugins: 'preview print pagebreak',
                            toolbar: 'undo redo | blocks | bold italic | print preview',
                        }}
                    />
                    <div className="card-actions justify-end mt-6">
                        <button onClick={() => navigate(`/direct-quote-details/${sourceId}`)} className="btn btn-ghost">Annuleren</button>
                        <button onClick={() => editorRef.current?.execCommand('mcePrint')} className="btn btn-secondary">Print / PDF</button>
                        <button className="btn btn-primary">Verstuur Document</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentGenerator;