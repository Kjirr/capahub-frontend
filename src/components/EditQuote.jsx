// src/components/EditQuote.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../api';
import ImpositionVisualizer from './ImpositionVisualizer';

// --- De Volledige Calculator voor het Bewerken ---
const EditCalculator = ({ quote, showNotification, navigateTo }) => {
    const [materials, setMaterials] = useState([]);
    const [machines, setMachines] = useState([]);
    const [formState, setFormState] = useState({ materialId: '', machineId: '', marginPercentage: 40 });
    const [calculationResult, setCalculationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const selectedMaterial = materials.find(m => m.id === formState.materialId);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [materialsData, machinesData] = await Promise.all([
                apiRequest('/materials', 'GET'),
                apiRequest('/calculation-settings/machines', 'GET'),
            ]);
            setMaterials(materialsData);
            setMachines(machinesData);
            
            if (quote.calculation) {
                setFormState({
                    materialId: quote.calculation.materialId || '',
                    machineId: quote.calculation.machineId || '',
                    marginPercentage: quote.calculation.marginPercentage || 40,
                });
                setCalculationResult(quote.calculation);
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [quote, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleRunCalculation = async () => {
        setIsCalculating(true);
        setCalculationResult(null);
        try {
            const payload = { ...formState, productType: quote.job.productType, quantity: quote.job.quantity, jobId: quote.job.id };
            const result = await apiRequest('/calculations/run', 'POST', payload);
            setCalculationResult(result);
        } catch (error) { showNotification(error.message, 'error'); } 
        finally { setIsCalculating(false); }
    };
    
    const handleSaveQuote = async () => {
        if (!calculationResult) return;
        setIsSaving(true);
        try {
            const completeCalculation = { ...calculationResult, materialId: formState.materialId, machineId: formState.machineId };
            const payload = { 
                price: completeCalculation.finalPrice, 
                deliveryTime: quote.deliveryTime,
                comments: quote.comments,
                calculation: completeCalculation
            };
            await apiRequest(`/quotes/${quote.id}`, 'PUT', payload);
            showNotification('Offerte succesvol bijgewerkt!', 'success');
            navigateTo('my-submitted-quotes');
        } catch(e) { showNotification(e.message, 'error'); } 
        finally { setIsSaving(false); }
    };
    
    if (isLoading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="card bg-base-100 shadow-xl p-8 space-y-4">
                <h2 className="card-title">Herbereken Offerte</h2>
                <select name="materialId" value={formState.materialId} onChange={handleChange} className="select select-bordered w-full" required><option value="" disabled>Kies materiaal</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                <select name="machineId" value={formState.machineId} onChange={handleChange} className="select select-bordered w-full" required><option value="" disabled>Kies machine</option>{machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                <div><label className="label"><span className="label-text">Winstmarge (%)</span></label><input type="number" name="marginPercentage" value={formState.marginPercentage} onChange={handleChange} className="input input-bordered" /></div>
                <button className="btn btn-primary w-full" onClick={handleRunCalculation} disabled={isCalculating}>{isCalculating ? 'Herberekenen...' : 'Herbereken Prijs'}</button>
            </div>
            <div className="card bg-base-200 shadow-xl p-8">
                <h2 className="card-title">Nieuw Resultaat</h2>
                {isCalculating && <div className="text-center p-8"><span className="loading loading-lg loading-spinner"></span></div>}
                {!calculationResult && <div className="text-center p-8 text-base-content/60">Klik op 'Herbereken Prijs'.</div>}
                {calculationResult && (
                    <div className="space-y-4">
                        <table className="table w-full"><tbody>{calculationResult.items.map((item, i) => <tr key={i}><td>{item.description}</td><td className="text-right">€{item.totalCost.toFixed(2)}</td></tr>)}</tbody><tfoot><tr className="font-bold border-t"><td>Kostprijs</td><td className="text-right">€{calculationResult.totalCost.toFixed(2)}</td></tr><tr className="font-bold"><td>Marge ({calculationResult.marginPercentage}%)</td><td className="text-right">€{(calculationResult.finalPrice - calculationResult.totalCost).toFixed(2)}</td></tr><tr className="text-xl font-bold border-t"><td>Offerteprijs</td><td className="text-right">€{calculationResult.finalPrice.toFixed(2)}</td></tr></tfoot></table>
                        <button className="btn btn-success w-full" onClick={handleSaveQuote} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Simpel formulier voor gratis gebruikers ---
const SimpleEditForm = ({ quote, showNotification, navigateTo }) => {
    const [formData, setFormData] = useState({ price: '', deliveryTime: '', comments: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (quote) {
            setFormData({ price: quote.price, deliveryTime: quote.deliveryTime, comments: quote.comments || '' });
        }
    }, [quote]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await apiRequest(`/quotes/${quote.id}`, 'PUT', { price: parseFloat(formData.price), deliveryTime: formData.deliveryTime, comments: formData.comments });
            showNotification('Offerte succesvol bijgewerkt!');
            navigateTo('my-submitted-quotes');
        } catch (error) { showNotification(error.message, 'error'); } 
        finally { setIsSaving(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 mt-6 space-y-4 max-w-2xl mx-auto">
            <div className="form-control">
                <label className="label"><span className="label-text">Offerteprijs (€)</span></label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">Levertijd</span></label>
                <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} className="input input-bordered" required />
            </div>
            <div className="form-control">
                <label className="label"><span className="label-text">Opmerkingen</span></label>
                <textarea name="comments" value={formData.comments} onChange={handleChange} className="textarea textarea-bordered" rows="3"></textarea>
            </div>
            <div className="card-actions justify-end pt-4">
                <button type="button" onClick={() => navigateTo('my-submitted-quotes')} className="btn btn-ghost">Annuleren</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}</button>
            </div>
        </form>
    );
};

// --- Hoofdcomponent die de juiste versie kiest ---
const EditQuote = ({ showNotification, navigateTo, viewParam: quoteId, currentUser }) => {
    const [quote, setQuote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const hasCalculatorAccess = useMemo(() => {
        if (!currentUser || !currentUser.permissions) return false;
        return currentUser.permissions.includes('manage_materials');
    }, [currentUser]);

    useEffect(() => {
        const fetchQuoteData = async () => {
            setIsLoading(true);
            try {
                const data = await apiRequest(`/quotes/${quoteId}`, 'GET');
                setQuote(data);
            } catch (error) {
                showNotification(error.message, 'error');
                navigateTo('my-submitted-quotes');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuoteData();
    }, [quoteId, showNotification, navigateTo]);

    if (isLoading) return <div className="loading-text">Offerte laden...</div>;
    if (!quote) return <div className="text-center p-8">Offerte niet gevonden.</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Offerte Bewerken ({quote.quoteNumber})</h1>
            <p className="page-subtitle">Voor opdracht: {quote.job.title}</p>
            
            {hasCalculatorAccess ? 
                <EditCalculator quote={quote} showNotification={showNotification} navigateTo={navigateTo} /> :
                <SimpleEditForm quote={quote} showNotification={showNotification} navigateTo={navigateTo} />
            }
        </div>
    );
};

export default EditQuote;
