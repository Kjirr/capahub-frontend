import React from 'react';

const StatusBadge = ({ status }) => {
    const statusClasses = {
        quoting: 'status-quoting',
        in_production: 'status-in_production',
        completed: 'status-completed',
        offered: 'status-quoting', // Hergebruik van stijl
        accepted: 'status-completed', // Hergebruik van stijl
        rejected: 'status-rejected'
    };
    const statusText = {
        quoting: 'Offertes Verzamelen',
        in_production: 'In Productie',
        completed: 'Voltooid',
        offered: 'In behandeling',
        accepted: 'Geaccepteerd',
        rejected: 'Afgewezen'
    };
    return <span className={`status-badge ${statusClasses[status] || 'bg-gray-400'}`}>{statusText[status] || status}</span>;
};

export default StatusBadge;