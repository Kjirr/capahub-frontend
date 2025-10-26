import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: useNavigate en useParams importeren ---
import { useNavigate, useParams } from 'react-router-dom';
import { getPartners, deletePartner } from '@/api';
import PartnerModal from './PartnerModal';
// --- EINDE WIJZIGING ---

// --- START WIJZIGING: 'partnerType' prop verwijderd ---
const PartnerManagement = ({ showNotification }) => {
    const navigate = useNavigate();
    const { type: partnerType } = useParams(); // Haal het type direct uit de URL
    // --- EINDE WIJZIGING ---
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);

    const config = partnerType === 'SUPPLIER' ? {
        type: 'SUPPLIER',
        title: 'Leveranciersbeheer',
        subtitle: 'Beheer hier alle leveranciers van uw bedrijf.',
        newItemButton: 'Nieuwe Leverancier',
        loadingText: 'Leveranciers laden...',
        deleteConfirm: (name) => `Weet u zeker dat u '${name}' wilt verwijderen?`,
        deleteSuccess: 'Leverancier succesvol verwijderd.',
        noItems: 'Nog geen leveranciers toegevoegd.',
        headers: ['Naam', 'Contactpersoon', 'E-mail', 'Telefoon', 'Acties'],
        fields: ['name', 'contactPerson', 'email', 'phone']
    } : {
        type: 'COURIER',
        title: 'Koeriersbeheer',
        subtitle: 'Beheer hier de koeriersdiensten die u gebruikt.',
        newItemButton: 'Nieuwe Koerier',
        loadingText: 'Koeriers laden...',
        deleteConfirm: (name) => `Weet u zeker dat u '${name}' wilt verwijderen?`,
        deleteSuccess: 'Koerier succesvol verwijderd.',
        noItems: 'Nog geen koeriers toegevoegd.',
        headers: ['Naam', 'Stad', 'Contactpersoon', 'Telefoon', 'Acties'],
        fields: ['name', 'city', 'contactPerson', 'phone']
    };

    const fetchPartners = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPartners(config.type);
            setPartners(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, config.type]);

    useEffect(() => {
        fetchPartners();
    }, [fetchPartners]);

    const handleOpenCreateModal = () => {
        setEditingPartner(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (partner) => {
        setEditingPartner(partner);
        setIsModalOpen(true);
    };

    const handleDelete = async (partner) => {
        if (window.confirm(config.deleteConfirm(partner.name))) {
            try {
                await deletePartner(partner.id);
                showNotification(config.deleteSuccess, 'success');
                fetchPartners();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    if (isLoading && partners.length === 0) {
        return <div className="loading-text">{config.loadingText}</div>;
    }

    return (
        <>
            <div className="page-container">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="page-title">{config.title}</h1>
                        <p className="page-subtitle">{config.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
                            ← Terug naar Instellingen
                        </button>
                        <button onClick={handleOpenCreateModal} className="btn btn-primary">
                            {config.newItemButton}
                        </button>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        {config.headers.map((header, index) => (
                                            <th key={index} className={header === 'Acties' ? 'text-right' : ''}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {partners.length > 0 ? partners.map(partner => (
                                        <tr key={partner.id} className="hover">
                                            {config.fields.map(field => <td key={field} className={field === 'name' ? 'font-bold' : ''}>{partner[field] || '-'}</td>)}
                                            <td className="text-right">
                                                <button onClick={() => handleOpenEditModal(partner)} className="btn btn-sm btn-ghost">Aanpassen</button>
                                                <button onClick={() => handleDelete(partner)} className="btn btn-sm btn-ghost text-red-500">Verwijderen</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={config.headers.length} className="text-center">{config.noItems}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <PartnerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchPartners}
                showNotification={showNotification}
                partner={editingPartner}
                partnerType={config.type}
            />
        </>
    );
};

export default PartnerManagement;