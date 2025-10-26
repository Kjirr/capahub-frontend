// src/components/FinishingManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
// DE AANPASSING ZIT HIER: We importeren de specifieke functies
import { getFinishings, deleteFinishing } from '../api'; 
import FinishingModal from './FinishingModal';

const FinishingManagement = ({ showNotification, navigateTo }) => {
  const [finishings, setFinishings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFinishing, setSelectedFinishing] = useState(null);

  const fetchFinishings = useCallback(async () => {
    setIsLoading(true);
    try {
      // DE AANPASSING ZIT HIER: We gebruiken de gecentraliseerde functie
      const data = await getFinishings();
      setFinishings(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchFinishings();
  }, [fetchFinishings]);

  const handleOpenModal = (finishing = null) => {
    setSelectedFinishing(finishing);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Weet je zeker dat je deze afwerking wilt verwijderen?')) {
        try {
            // DE AANPASSING ZIT HIER: We gebruiken de gecentraliseerde functie
            await deleteFinishing(id);
            showNotification('Afwerking succesvol verwijderd.', 'success');
            fetchFinishings();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Afwerkingen laden...</div>;
  }

  return (
    <>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="page-title">Afwerkingenbeheer</h1>
            <p className="page-subtitle">Beheer hier de (hand)afwerkingen en hun kostenprofielen.</p>
          </div>
          <div>
            <button onClick={() => navigateTo('settings-dashboard')} className="btn btn-ghost mr-2">
              ← Terug naar Instellingen
            </button>
            <button onClick={() => handleOpenModal(null)} className="btn btn-primary">
              Nieuwe Afwerking
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Methode</th>
                    <th>Kosten per Eenheid</th>
                    <th>Opstartkosten</th>
                    <th className="text-right">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {finishings.length > 0 ? (
                    finishings.map((finishing) => (
                      <tr key={finishing.id} className="hover">
                        <td className="font-bold">{finishing.name}</td>
                        <td>{finishing.costingProfile?.costingMethod}</td>
                        <td>€ {Number(finishing.costingProfile?.costPerUnit || 0).toFixed(2)}</td>
                        <td>€ {Number(finishing.costingProfile?.setupCost || 0).toFixed(2)}</td>
                        <td className="text-right space-x-2">
                          <button onClick={() => handleOpenModal(finishing)} className="btn btn-sm btn-outline">Bewerken</button>
                          <button onClick={() => handleDelete(finishing.id)} className="btn btn-sm btn-error">Verwijderen</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="text-center py-4">Nog geen afwerkingen aangemaakt.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <FinishingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchFinishings}
        showNotification={showNotification}
        finishing={selectedFinishing}
      />
    </>
  );
};

export default FinishingManagement;