import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductTemplates, deleteProductTemplate } from '../api';
import ConfirmationModal from './ConfirmationModal';

const ProductTemplateManagement = ({ showNotification }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductTemplates();
      setTemplates(data || []);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleOpenDeleteModal = (template) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    setIsProcessing(true);
    try {
      await deleteProductTemplate(selectedTemplate.id);
      showNotification('Sjabloon succesvol verwijderd.', 'success');
      fetchTemplates();
      setIsDeleteModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!searchTerm) return templates;
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [templates, searchTerm]);

  if (isLoading) {
    return <div className="p-6 text-center">Product-sjablonen laden...</div>;
  }

  return (
    <>
      <div className="page-container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="page-title">Beheer Productbibliotheek</h1>
            <p className="page-subtitle">
              Beheer hier de herbruikbare product-sjablonen. Klik op 'Bewerk' om de visuele editor te openen.
            </p>
          </div>
          <div className="space-x-2">
            <button onClick={() => navigate('/settings-dashboard')} className="btn btn-ghost">
              ← Terug naar Instellingen
            </button>
            <button onClick={() => navigate('/product-template-editor/new')} className="btn btn-primary">
              Nieuw Sjabloon Toevoegen
            </button>
          </div>
        </div>

        <div className="form-control mb-6">
            <input 
                type="text" 
                placeholder="Zoek op naam of omschrijving..."
                className="input input-bordered w-full md:w-1/3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            // --- START WIJZIGING: Card-structuur aangepast ---
            <div key={template.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body">
                <h2 className="card-title text-xl font-bold">{template.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{template.description || "Geen omschrijving."}</p>
                <div className="card-actions justify-end mt-auto pt-4 border-t border-base-200"> {/* Added border-t */}
                  <button
                    onClick={() => navigate(`/product-template-editor/${template.id}`)}
                    className="btn btn-outline btn-sm"
                  >
                    Bewerk
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(template)}
                    className="btn btn-outline btn-error btn-sm"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            </div>
            // --- EINDE WIJZIGING ---
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center p-8 bg-white rounded-lg shadow">
                <p className="text-gray-500">Geen product-sjablonen gevonden.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Sjabloon Verwijderen"
        isProcessing={isProcessing}
      >
        <p>
          Weet je zeker dat je het sjabloon <strong>{selectedTemplate?.name}</strong>{' '}
          permanent wilt verwijderen?
        </p>
      </ConfirmationModal>
    </>
  );
};

export default ProductTemplateManagement;