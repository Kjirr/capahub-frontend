import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';

const EditJob = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest(`/jobs/${jobId}`, 'GET');
                
                // Formatteer datums voor de input-velden
                data.deadline = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';
                data.quotingDeadline = data.quotingDeadline ? new Date(data.quotingDeadline).toISOString().split('T')[0] : '';

                // Zorg ervoor dat 'properties' altijd een object is om fouten te voorkomen
                data.properties = data.properties || {};

                setFormData(data);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (currentUser && jobId) {
            fetchJob();
        }
    }, [currentUser, jobId, showNotification]);

    // --- ▼▼▼ AANGEPASTE HANDLECHANGE FUNCTIE (ZOALS IN CREATEJOB) ▼▼▼ ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        const isPropertyField = ['productType', 'material', 'width_mm', 'height_mm', 'depth_mm', 'length_mm'].includes(name);

        if (isPropertyField) {
            setFormData(prev => ({
                ...prev,
                properties: {
                    ...prev.properties,
                    [name]: val
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: val,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // De 'formData' heeft nu de juiste structuur voor de PUT request
            await apiRequest(`/jobs/${jobId}`, 'PUT', formData);
            showNotification('Opdracht succesvol bijgewerkt!');
            navigateTo('job-details', jobId);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputClasses = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    if (isLoading) return <div className="loading-text">Opdracht laden...</div>;
    if (!formData) return <div className="loading-text">Kon opdracht niet laden.</div>;

    // We hebben nu een aparte variabele voor properties om de JSX leesbaarder te maken
    const properties = formData.properties || {};

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Opdracht Bewerken</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
                
                {/* Basis Informatie */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className={labelClasses}>Titel</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClasses}>Omschrijving</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} className={inputClasses} rows="5" required></textarea>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    {/* Specificaties - Lezen nu uit formData.properties */}
                    <div>
                        <label htmlFor="quantity" className={labelClasses}>Oplage</label>
                        <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="material" className={labelClasses}>Materiaal</label>
                        <input id="material" name="material" type="text" value={properties.material || ''} onChange={handleChange} className={inputClasses} required />
                    </div>
                     <div>
                        <label htmlFor="deadline" className={labelClasses}>Deadline</label>
                        <input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="productType" className={labelClasses}>Producttype</label>
                        <select id="productType" name="productType" value={properties.productType} onChange={handleChange} className={inputClasses}>
                            <option value="FLAT_PRINT">Plat Drukwerk (bv. Flyer)</option>
                            <option value="BOX">Doos / Verpakking</option>
                            <option value="DISPLAY">Display</option>
                            <option value="OTHER">Overig</option>
                        </select>
                    </div>
                </div>

                {/* Dynamische Afmetingen - Lezen nu uit formData.properties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
                    {properties.productType === 'FLAT_PRINT' && (
                        <>
                            <div>
                                <label htmlFor="width_mm" className={labelClasses}>Breedte (mm)</label>
                                <input id="width_mm" name="width_mm" type="number" value={properties.width_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="height_mm" className={labelClasses}>Hoogte (mm)</label>
                                <input id="height_mm" name="height_mm" type="number" value={properties.height_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </>
                    )}
                    {properties.productType === 'BOX' && (
                        <>
                            <div>
                                <label htmlFor="length_mm" className={labelClasses}>Lengte (mm)</label>
                                <input id="length_mm" name="length_mm" type="number" value={properties.length_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="width_mm" className={labelClasses}>Breedte (mm)</label>
                                <input id="width_mm" name="width_mm" type="number" value={properties.width_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="height_mm" className={labelClasses}>Hoogte (mm)</label>
                                <input id="height_mm" name="height_mm" type="number" value={properties.height_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </>
                    )}
                     {properties.productType === 'DISPLAY' && (
                        <>
                            <div>
                                <label htmlFor="length_mm" className={labelClasses}>Lengte (mm)</label>
                                <input id="length_mm" name="length_mm" type="number" value={properties.length_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="width_mm" className={labelClasses}>Breedte (mm)</label>
                                <input id="width_mm" name="width_mm" type="number" value={properties.width_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                             <div>
                                <label htmlFor="height_mm" className={labelClasses}>Hoogte (mm)</label>
                                <input id="height_mm" name="height_mm" type="number" value={properties.height_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="depth_mm" className={labelClasses}>Diepte (mm)</label>
                                <input id="depth_mm" name="depth_mm" type="number" value={properties.depth_mm || ''} onChange={handleChange} className={inputClasses} required />
                            </div>
                        </>
                    )}
                </div>
                
                <div className="pt-4 border-t">
                    <div className="flex items-center">
                        <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} id="isPublic" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="isPublic" className="ml-3 block text-sm text-gray-900">Plaats deze opdracht ook openbaar op de Marktplaats</label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => navigateTo('job-details', jobId)} className="btn btn-ghost">Annuleren</button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      {isSubmitting ? 'Bezig met opslaan...' : 'Wijzigingen Opslaan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditJob;