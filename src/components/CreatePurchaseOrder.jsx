import React, { useState, useEffect, useCallback } from 'react';
// --- START WIJZIGING: 'getSuppliers' vervangen door 'getPartners' ---
import { getPartners, getMaterials, createPurchaseOrder } from '@/api';
// --- EINDE WIJZIGING ---

const CreatePurchaseOrder = ({ showNotification, navigateTo }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [items, setItems] = useState([{ materialId: '', quantity: 1, purchasePrice: '' }]);
    const [notes, setNotes] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            // --- START WIJZIGING: Gebruik de nieuwe 'getPartners' functie met het juiste type ---
            const [suppliersData, materialsData] = await Promise.all([
                getPartners('SUPPLIER'), // Vraag specifiek om leveranciers
                getMaterials()
            ]);
            // --- EINDE WIJZIGING ---
            setSuppliers(suppliersData);
            setMaterials(materialsData);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'materialId') {
            const selectedMaterial = materials.find(m => m.id === value);
            if (selectedMaterial) {
                newItems[index]['purchasePrice'] = selectedMaterial.price;
            }
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { materialId: '', quantity: 1, purchasePrice: '' }]);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSupplier || items.some(item => !item.materialId || !item.quantity || !item.purchasePrice)) {
            showNotification('Selecteer een leverancier en vul alle orderregels correct in.', 'warn');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                supplierId: selectedSupplier,
                notes,
                items: items,
            };
            await createPurchaseOrder(payload);
            showNotification('Inkooporder succesvol aangemaakt!', 'success');
            navigateTo('purchase-order-management');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Aanmaken mislukt.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="loading-text">Gegevens laden...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Nieuwe Inkooporder</h1>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 mt-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Kies Leverancier</span></label>
                        <select 
                            className="select select-bordered" 
                            value={selectedSupplier} 
                            onChange={(e) => setSelectedSupplier(e.target.value)} 
                            required
                        >
                            <option value="" disabled>Selecteer een leverancier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Notities (optioneel)</span></label>
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="input input-bordered" />
                    </div>
                </div>

                <div className="divider mt-8">Orderregels</div>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <select value={item.materialId} onChange={(e) => handleItemChange(index, 'materialId', e.target.value)} className="select select-bordered col-span-5" required>
                                <option value="" disabled>Kies materiaal</option>
                                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Aantal" className="input input-bordered col-span-3" required />
                            <input type="number" step="0.01" value={item.purchasePrice} onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)} placeholder="Inkoopprijs (€)" className="input input-bordered col-span-3" required />
                            <button type="button" onClick={() => removeItem(index)} className="btn btn-error btn-sm col-span-1" disabled={items.length <= 1}>X</button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addItem} className="btn btn-secondary btn-sm mt-4">+ Regel Toevoegen</button>

                <div className="card-actions justify-end mt-8 border-t pt-6">
                    <button type="button" onClick={() => navigateTo('purchase-order-management')} className="btn btn-ghost" disabled={isSubmitting}>Annuleren</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Bezig...' : 'Inkooporder Aanmaken'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePurchaseOrder;