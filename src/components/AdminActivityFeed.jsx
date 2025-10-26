// src/components/AdminActivityFeed.jsx

import React, { useState, useEffect } from 'react';
import { getActivityFeed } from '@/api';
import StatusBadge from './StatusBadge';

const AdminActivityFeed = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const feedData = await getActivityFeed();
                setData(feedData);
            } catch (err) {
                setError('Kon de activiteitsdata niet laden.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => new Date(dateString).toLocaleString('nl-NL');

    if (isLoading) return <div className="loading-text">Activiteit aan het laden...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'jobs':
                return data.jobs.map(item => (
                    <tr key={item.id}>
                        <td>{item.jobNumber}</td>
                        <td>{item.title}</td>
                        <td>{item.company.name}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{formatDate(item.createdAt)}</td>
                    </tr>
                ));
            case 'quotes':
                return data.quotes.map(item => (
                    <tr key={item.id}>
                        <td>{item.quoteNumber}</td>
                        <td>{item.customerCompany || item.customerName}</td>
                        <td>€ {item.price.toFixed(2)}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{formatDate(item.createdAt)}</td>
                    </tr>
                ));
            case 'offers':
                 return data.offers.map(item => (
                    <tr key={item.id}>
                        <td>{item.offerNumber}</td>
                        <td>{item.machineType}</td>
                        <td>{item.company.name}</td>
                        <td>{item.price}</td>
                        <td>{formatDate(item.createdAt)}</td>
                    </tr>
                ));
            case 'orders':
                return data.orders.map(item => (
                    <tr key={item.id}>
                        <td>{item.orderNumber}</td>
                        <td>{item.customerCompany || item.customerName}</td>
                        <td>€ {item.totalPrice.toFixed(2)}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{formatDate(item.createdAt)}</td>
                    </tr>
                ));
            default: return null;
        }
    };
    
    const getHeaders = () => {
         switch (activeTab) {
            case 'jobs': return ["Job Nummer", "Titel", "Bedrijf", "Status", "Datum"];
            case 'quotes': return ["Offerte Nr.", "Klant", "Bedrag", "Status", "Datum"];
            case 'offers': return ["Aanbod Nr.", "Machine", "Aanbieder", "Prijs", "Datum"];
            case 'orders': return ["Order Nr.", "Klant", "Bedrag", "Status", "Datum"];
            default: return [];
        }
    }

    return (
        <div className="page-container">
            <h1 className="page-title">Platform Activiteit</h1>
            <p className="page-subtitle">Een live overzicht van de meest recente activiteiten.</p>
            
            <div className="tabs tabs-boxed my-6">
                <a className={`tab ${activeTab === 'jobs' ? 'tab-active' : ''}`} onClick={() => setActiveTab('jobs')}>Opdrachten</a>
                <a className={`tab ${activeTab === 'quotes' ? 'tab-active' : ''}`} onClick={() => setActiveTab('quotes')}>Offertes</a>
                <a className={`tab ${activeTab === 'offers' ? 'tab-active' : ''}`} onClick={() => setActiveTab('offers')}>Aanbod</a>
                <a className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</a>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead><tr>{getHeaders().map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>{renderContent()}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminActivityFeed;