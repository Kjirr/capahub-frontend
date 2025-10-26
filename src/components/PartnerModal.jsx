import React, { useState, useEffect } from 'react';
import { createPartner, updatePartner } from '@/api';

const PartnerModal = ({ isOpen, onClose, onSave, showNotification, partner, partnerType }) => {
    const [partnerData, setPartnerData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = partner && partner.id;

    // Dynamische configuratie voor tekst
    const config = partnerType === 'SUPPLIER' ? {
        title: 'Leverancier',
        updateSuccess: 'Leverancier succesvol bijgewerkt!',
        createSuccess: 'Leverancier succesvol aangemaakt!'
    } : {
        title: 'Koerier',
        updateSuccess: 'Koerier succesvol bijgewerkt!',
        createSuccess: 'Koerier succesvol aangemaakt!'
    };

    useEffect(() => {
        if (isOpen) {
            setPartnerData(isEditMode ? partner : {});
        }
    }, [partner, isOpen, isEditMode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setPartnerData({ ...partnerData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSend = { ...partnerData, type: partnerType };
            if (isEditMode) {
                await updatePartner(partner.id, dataToSend);
                showNotification(config.updateSuccess, 'success');
            } else {
                await createPartner(dataToSend);
                showNotification(config.createSuccess, 'success');
            }
            onSave();
            onClose();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Actie mislukt.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">{isEditMode ? `${config.title} Aanpassen` : `Nieuwe ${config.title}`}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <h4 className="font-semibold text-md border-b pb-2">Algemene Informatie</h4>
                    <input type="text" name="name" placeholder={`Naam van de ${config.title.toLowerCase()} *`} className="input input-bordered w-full" value={partnerData.name || ''} onChange={handleChange} required />
                    <input type="text" name="contactPerson" placeholder="Contactpersoon" className="input input-bordered w-full" value={partnerData.contactPerson || ''} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" name="email" placeholder="E-mailadres" className="input input-bordered w-full" value={partnerData.email || ''} onChange={handleChange} />
                        <input type="tel" name="phone" placeholder="Telefoonnummer" className="input input-bordered w-full" value={partnerData.phone || ''} onChange={handleChange} />
                    </div>
                    <input type="text" name="website" placeholder="Website" className="input input-bordered w-full" value={partnerData.website || ''} onChange={handleChange} />

                    <h4 className="font-semibold text-md border-b pb-2 mt-6">Bezoekadres</h4>
                    <input type="text" name="address" placeholder="Adres" className="input input-bordered w-full" value={partnerData.address || ''} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="postcode" placeholder="Postcode" className="input input-bordered w-full" value={partnerData.postcode || ''} onChange={handleChange} />
                        <input type="text" name="city" placeholder="Stad" className="input input-bordered w-full" value={partnerData.city || ''} onChange={handleChange} />
                    </div>
                    
                    <h4 className="font-semibold text-md border-b pb-2 mt-6">Factuuradres</h4>
                    <input type="text" name="invoiceAddress" placeholder="Factuuradres (indien afwijkend)" className="input input-bordered w-full" value={partnerData.invoiceAddress || ''} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="invoicePostcode" placeholder="Postcode" className="input input-bordered w-full" value={partnerData.invoicePostcode || ''} onChange={handleChange} />
                        <input type="text" name="invoiceCity" placeholder="Stad" className="input input-bordered w-full" value={partnerData.invoiceCity || ''} onChange={handleChange} />
                    </div>

                    <h4 className="font-semibold text-md border-b pb-2 mt-6">Financiële Gegevens</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="iban" placeholder="IBAN" className="input input-bordered w-full" value={partnerData.iban || ''} onChange={handleChange} />
                        <input type="text" name="kvk" placeholder="KVK-nummer" className="input input-bordered w-full" value={partnerData.kvk || ''} onChange={handleChange} />
                    </div>
                    <input type="text" name="btwNummer" placeholder="BTW-nummer" className="input input-bordered w-full" value={partnerData.btwNummer || ''} onChange={handleChange} />

                     <h4 className="font-semibold text-md border-b pb-2 mt-6">Notities</h4>
                    <textarea name="notes" className="textarea textarea-bordered w-full" placeholder="Interne notities..." value={partnerData.notes || ''} onChange={handleChange}></textarea>

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Annuleren</button>
                        <button type="submit" className={`btn btn-primary ${isSaving ? 'loading' : ''}`} disabled={isSaving}>Opslaan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartnerModal;