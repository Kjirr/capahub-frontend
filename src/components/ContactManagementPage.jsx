// ContactManagementPage.jsx
console.log("--- TEST: ContactManagementPage.jsx IS GELADEN ---");

import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyContacts, addCompanyContact, removeCompanyContact, searchCompanies, getCompanyDetails } from '../api';
import useDebounce from '../hooks/useDebounce';
import CompanyDetailsModal from './CompanyDetailsModal';

const ContactManagementPage = ({ showNotification, navigateTo }) => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // State logica voor de modal
    const [selectedContact, setSelectedContact] = useState(null); 
    const [openingContactId, setOpeningContactId] = useState(null); 
    const [modalIsLoading, setModalIsLoading] = useState(false);

    const fetchContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCompanyContacts();
            setContacts(data || []);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchCompanies(debouncedSearchTerm);
                const currentContactIds = new Set(contacts.map(c => c.id));
                setSearchResults(results.filter(r => !currentContactIds.has(r.id)));
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedSearchTerm, contacts, showNotification]);

    const handleAddContact = useCallback(async (contactCompanyId) => {
        try {
            const newContact = await addCompanyContact(contactCompanyId);
            setContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
            setSearchResults(prev => prev.filter(r => r.id !== contactCompanyId));
            showNotification(`${newContact.name} is toegevoegd aan uw contacten.`, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }, [showNotification]);

    const handleRemoveContact = useCallback(async (contactCompanyId, contactName) => {
        if (!window.confirm(`Weet u zeker dat u ${contactName} wilt verwijderen uit uw contacten?`)) return;
        try {
            await removeCompanyContact(contactCompanyId);
            setContacts(prev => prev.filter(c => c.id !== contactCompanyId));
            showNotification(`${contactName} is verwijderd uit uw contacten.`, 'info');
        } catch (error)
{
            showNotification(error.message, 'error');
        }
    }, [showNotification]);

    const handleContactDoubleClick = useCallback(async (contactId) => {
        setOpeningContactId(contactId);
        setModalIsLoading(true);
        setSelectedContact(null); 
        try {
            const companyDetails = await getCompanyDetails(contactId);
            setSelectedContact(companyDetails);
        } catch (error) {
            showNotification(error.message, 'error');
            setOpeningContactId(null);
        } finally {
            setModalIsLoading(false);
        }
    }, [showNotification]);
    
    const closeModal = () => {
        setOpeningContactId(null);
        setSelectedContact(null);
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Bedrijfscontacten</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Kolom voor het toevoegen van contacten */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Nieuw Contact Toevoegen</h2>
                        <input 
                            type="text" 
                            placeholder="Zoek bedrijf op naam..." 
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="mt-4 space-y-2 h-64 overflow-y-auto">
                            {isSearching && <p>Zoeken...</p>}
                            {searchResults.map(company => (
                                <div key={company.id} className="flex justify-between items-center p-2 bg-base-200 rounded-lg">
                                    <div>
                                        <p className="font-bold">{company.name}</p>
                                        <p className="text-sm">{company.plaats}</p>
                                    </div>
                                    <button onClick={() => handleAddContact(company.id)} className="btn btn-sm btn-success">+</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kolom voor de huidige contactenlijst */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Mijn Contacten ({contacts.length})</h2>
                        <div className="mt-4 space-y-2 h-80 overflow-y-auto">
                            {isLoading && <p>Contacten laden...</p>}
                            {contacts.map(contact => (
                                <div 
                                    key={contact.id} 
                                    className="flex justify-between items-center p-2 bg-base-200 rounded-lg hover:bg-base-300 cursor-pointer"
                                    onDoubleClick={() => handleContactDoubleClick(contact.id)}
                                >
                                    <div>
                                        <p className="font-bold">{contact.name}</p>
                                        <p className="text-sm">{contact.plaats}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveContact(contact.id, contact.name);
                                        }} 
                                        className="btn btn-sm btn-error btn-outline"
                                    >
                                        Verwijder
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DE MODAL WORDT HIER AANGEROEPEN */}
            <CompanyDetailsModal
                isOpen={!!openingContactId}
                onClose={closeModal}
                company={selectedContact}
                isLoading={modalIsLoading}
            />
        </div>
    );
};

export default ContactManagementPage;