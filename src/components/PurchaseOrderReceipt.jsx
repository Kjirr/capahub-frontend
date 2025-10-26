// src/components/PurchaseOrderReceipt.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getPurchaseOrderById, getCompanyProfile } from '../api';
import { format } from 'date-fns';

const PurchaseOrderReceipt = ({ viewParam: poId, showNotification, navigateTo }) => {
    const [order, setOrder] = useState(null);
    const [company, setCompany] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!poId) {
            showNotification('Geen inkooporder ID gevonden.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const [orderData, companyData] = await Promise.all([
                getPurchaseOrderById(poId),
                getCompanyProfile()
            ]);
            setOrder(orderData);
            setCompany(companyData);
        } catch (error) {
            showNotification('Kon de bon-gegevens niet ophalen.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [poId, showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <div className="p-8 text-center">Bon wordt gegenereerd...</div>;
    if (!order || !company) return <div className="p-8 text-center">Kon data niet laden.</div>;

    const total = order.items.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);

    return (
        <div className="receipt-container">
            <div className="flex justify-between items-center mb-4 no-print p-4">
                 <button onClick={() => navigateTo('purchase-order-details', poId)} className="btn btn-ghost">
                    ← Terug naar Details
                </button>
                <button onClick={() => window.print()} className="btn btn-primary">
                    🖨️ Afdrukken / Opslaan als PDF
                </button>
            </div>

            <div className="receipt-page">
                {/* --- Header --- */}
                <header className="receipt-header">
                    <div className="company-info">
                        <div className="company-logo mb-4">
                            {company.logoUrl ? (
                                <img src={company.logoUrl} alt="Bedrijfslogo" />
                            ) : (
                                <h2 className="text-2xl font-bold">{company.name}</h2>
                            )}
                        </div>
                        <p>{company.adres}</p>
                        <p>{company.postcode} {company.plaats}</p>
                        <p>KVK: {company.kvk}</p>
                    </div>
                    <div className="order-title">
                        <h1>INKOOPORDER</h1>
                        <p><strong>Nummer:</strong> #{order.poNumber}</p>
                        <p><strong>Datum:</strong> {format(new Date(order.orderDate), 'dd-MM-yyyy')}</p>
                    </div>
                </header>

                {/* --- Adressen --- */}
                <section className="receipt-addresses">
                    <div>
                        <h3>Leverancier</h3>
                        <p><strong>{order.supplier.name}</strong></p>
                        <p>{order.supplier.address}</p>
                        <p>{order.supplier.postcode} {order.supplier.city}</p>
                        <p>{order.supplier.email}</p>
                    </div>
                     <div>
                        <h3>Afleveradres</h3>
                        <p><strong>{company.name}</strong></p>
                        <p>{company.adres}</p>
                        <p>{company.postcode} {company.plaats}</p>
                        <p>T.a.v. Inkoop</p>
                    </div>
                </section>
                
                {/* --- Orderregels --- */}
                <table className="receipt-table">
                    <thead>
                        <tr>
                            <th>Materiaal</th>
                            <th>Type</th>
                            <th className="text-right">Aantal</th>
                            <th className="text-right">Prijs p/eenheid (€)</th>
                            <th className="text-right">Subtotaal (€)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td><strong>{item.material.name}</strong></td>
                                <td>{item.material.type}</td>
                                <td className="text-right">{item.quantity} {item.material.unit}</td>
                                <td className="text-right">{item.purchasePrice.toFixed(2)}</td>
                                <td className="text-right">{(item.quantity * item.purchasePrice).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* --- Totalen --- */}
                <div className="receipt-totals">
                    <table>
                        <tbody>
                            <tr>
                                <td>Totaal Excl. BTW</td>
                                <td className="text-right font-bold">€ {total.toFixed(2)}</td>
                            </tr>
                            {/* Voeg hier eventueel BTW en Totaal Incl. BTW toe */}
                        </tbody>
                    </table>
                </div>

                {/* --- Footer --- */}
                <footer className="receipt-footer">
                    <p>Bij vragen over deze inkooporder, graag refereren aan bovenstaand ordernummer.</p>
                    <p>{company.name} | {company.telefoon} | {company.iban}</p>
                </footer>
            </div>
        </div>
    );
};

export default PurchaseOrderReceipt;