import React, { useState } from 'react';
import { apiRequest } from '../api';

const CreateJob = ({ navigateTo, showNotification }) => {
    const [formData, setFormData] = useState({ title: '', description: '', format: '', quantity: '', material: '', deadline: '', location: '' });
    const [isPublic, setIsPublic] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiRequest('/jobs', 'POST', { ...formData, isPublic });
            showNotification('Opdracht succesvol geplaatst!');
            navigateTo('my-jobs');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Plaats een nieuwe drukwerkopdracht</h2>
                <div className="space-y-4">
                    <div><label className="block text-gray-700 mb-2">Titel van de opdracht*</label><input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="bv. Flyers voor evenement" className="w-full p-2 border rounded-md" required /></div>
                    <div><label className="block text-gray-700 mb-2">Omschrijving*</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Geef een duidelijke omschrijving..." className="w-full p-2 border rounded-md" required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-gray-700 mb-2">Oplage*</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="bv. 5000" className="w-full p-2 border rounded-md" required /></div>
                        <div><label className="block text-gray-700 mb-2">Materiaal*</label><input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="bv. karton" className="w-full p-2 border rounded-md" required /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-gray-700 mb-2">Formaat</label><input type="text" name="format" value={formData.format} onChange={handleChange} placeholder="bv. A4" className="w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-gray-700 mb-2">Gewenste deadline (optioneel)</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    </div>
                    <div><label className="block text-gray-700 mb-2">Gewenste plaats productie (optioneel)</label><input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="bv. Amsterdam" className="w-full p-2 border rounded-md" /></div>
                    <div className="mt-4 pt-4 border-t"><label className="flex items-center"><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 text-gray-600 border-gray-300 rounded" /><span className="ml-2 text-gray-700">Plaats deze opdracht ook openbaar op de Marktplaats</span></label><p className="text-sm text-gray-500 mt-1">Indien aangevinkt, is uw opdracht zichtbaar voor alle drukkerijen.</p></div>
                </div>
                <div className="flex justify-end gap-4 mt-6"><button type="button" onClick={() => navigateTo('dashboard')} className="btn btn-secondary">Annuleren</button><button type="submit" className="btn btn-primary">Plaats Opdracht</button></div>
            </form>
        </div>
    );
};

export default CreateJob;