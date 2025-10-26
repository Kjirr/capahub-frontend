import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Gebruik axios direct voor publieke routes

// Hulpfuncties voor formattering
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' });
};
const formatCurrency = (amount) => {
    const number = Number(amount);
    if (isNaN(number)) {
        return '€ NaN'; // Geef expliciet NaN terug als het geen getal is
    }
    return `€ ${number.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PublicInvoicePage = () => {
    const { token } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/public/invoices/${token}`);
                setInvoice(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Deze factuur kon niet worden geladen.');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [token]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100">Factuur laden...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 font-bold p-8 text-center">{error}</div>;
    }

    if (!invoice) {
        return null;
    }

    const lines = invoice.productionDetails?.lines || [];
    const grandTotals = invoice.productionDetails?.grandTotals || {};

    const vatRate = 0.21; // Ga uit van 21% BTW
    let calculatedSubtotal = grandTotals.subtotal;
    let calculatedVat = grandTotals.vat;
    const totalAmount = grandTotals.total || 0;

    if (isNaN(Number(calculatedSubtotal)) || isNaN(Number(calculatedVat)) || calculatedSubtotal === 0 || calculatedVat === 0) {
        calculatedSubtotal = totalAmount / (1 + vatRate);
        calculatedVat = totalAmount - calculatedSubtotal;
    }

    // --- START WIJZIGING: Haal API basis URL correct op ---
    // Gebruik import.meta.env voor Vite omgevingsvariabelen
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const logoUrl = invoice.company.logoUrl ? `${apiBaseUrl}${invoice.company.logoUrl}` : null;
    // --- EINDE WIJZIGING ---

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white shadow-lg rounded-lg">
                <header className="flex flex-col md:flex-row justify-between items-start mb-8">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-3xl font-bold text-gray-800">Factuur</h1>
                        <p className="text-gray-500 text-lg">{invoice.invoiceNumber}</p>
                    </div>
                    {/* --- START WIJZIGING: Gebruik de logoUrl variabele --- */}
                    {logoUrl && (
                         <img src={logoUrl} alt={invoice.company.name} className="max-h-20" />
                    )}
                    {/* --- EINDE WIJZIGING --- */}
                </header>

                {/* Rest van de component blijft hetzelfde... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Van</h3>
                        <p className="font-bold text-gray-900">{invoice.company.name}</p>
                        <p className="text-gray-700">{invoice.company.adres}</p>
                        <p className="text-gray-700">{invoice.company.postcode} {invoice.company.plaats}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Aan</h3>
                        <p className="font-bold text-gray-900">{invoice.customerCompany || invoice.customerName}</p>
                        {invoice.customerCompany && <p className="text-gray-700">{invoice.customerName}</p>}
                    </div>
                </div>

                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">Factuurgegevens</h3>
                    <div className="grid grid-cols-2 gap-x-4">
                        <p><strong>Order:</strong> {invoice.orderNumber}</p>
                        <p><strong>Status:</strong> <span className="font-medium">{invoice.status}</span></p>
                        <p><strong>Factuurdatum:</strong> {formatDate(invoice.createdAt)}</p>
                    </div>
                </div>

                {/* Factuurregels */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Omschrijving</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aantal</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prijs p/s</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Totaal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lines.map((line, index) => {
                                const lineSubtotal = (line.pricing?.total || 0);
                                const quantity = line.quantity || 1;
                                const pricePerUnit = quantity > 0 ? (lineSubtotal / quantity) : 0;
                                return (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-sm">{line.description || 'Product'}</td>
                                        <td className="px-4 py-3 text-sm text-right">{quantity}</td>
                                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(pricePerUnit)}</td>
                                        <td className="px-4 py-3 text-sm text-right">{formatCurrency(lineSubtotal)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Totalen */}
                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Subtotaal</span>
                            <span className="text-gray-800">{formatCurrency(calculatedSubtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">BTW ({vatRate * 100}%)</span>
                            <span className="text-gray-800">{formatCurrency(calculatedVat)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                            <span className="text-gray-900">Totaal te voldoen</span>
                            <span className="text-gray-900">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Acties */}
                <div className="mt-12 text-center border-t pt-8">
                    <p className="text-gray-600 mb-4">Hier kan later een betaalknop (Mollie/Stripe) komen.</p>
                    <button className="btn btn-primary btn-lg" disabled>
                        Betaal Nu (Nog niet actief)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicInvoicePage;