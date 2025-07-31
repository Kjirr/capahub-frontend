import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

const CreateQuote = ({ showNotification, navigateTo, viewParam: jobId }) => {
    // State voor de data die we ophalen
    const [materials, setMaterials] = useState([]);
    const [machines, setMachines] = useState([]);
    const [finishings, setFinishings] = useState([]);
    const [job, setJob] = useState(null);
    
    // State voor de input van de gebruiker
    const [formState, setFormState] = useState({
        materialId: '',
        machineId: '',
        finishingIds: new Set(),
        marginPercentage: 40,
        // --- DE CRUCIALE NIEUWE VELDEN ---
        productWidth_mm: '',
        productHeight_mm: ''
    });
    
    const [calculationResult, setCalculationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [jobData, materialsData, machinesData, finishingsData] = await Promise.all([
                apiRequest(`/jobs/${jobId}`, 'GET'),
                apiRequest('/materials', 'GET'),
                apiRequest('/calculation-settings/machines', 'GET'),
                apiRequest('/calculation-settings/finishings', 'GET'),
            ]);
            setJob(jobData);
            setMaterials(materialsData);
            setMachines(machinesData);
            setFinishings(finishingsData);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobId, showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleFinishingChange = (finishingId) => {
        const newSet = new Set(formState.finishingIds);
        if (newSet.has(finishingId)) newSet.delete(finishingId);
        else newSet.add(finishingId);
        setFormState(prev => ({ ...prev, finishingIds: newSet }));
    };

    const handleRunCalculation = async () => {
        setIsCalculating(true);
        setCalculationResult(null);
        try {
            const payload = {
                ...formState,
                finishingIds: Array.from(formState.finishingIds),
                quantity: job.quantity,
            };
            const result = await apiRequest('/calculations/run', 'POST', payload);
            setCalculationResult(result);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsCalculating(false);
        }
    };
    
    const handleSaveQuote = async () => {
        if (!calculationResult) {
            showNotification("Voer eerst een calculatie uit.", 'warn');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                price: calculationResult.finalPrice,
                deliveryTime: "5-7 werkdagen", // Voorbeeld
                comments: "Offerte berekend via de calculatie-engine.",
                calculation: calculationResult,
            };
            await apiRequest(`/quotes/${jobId}`, 'POST', payload);
            showNotification('Offerte succesvol opgeslagen!', 'success');
            navigateTo('quote-requests');
        } catch(e) {
            showNotification(e.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <div className="loading-text">Calculator laden...</div>;
    if (!job) return <div className="page-container"><h1 className="page-title">Opdracht niet gevonden</h1></div>;
    
    return (
        <div className="page-container">
            <h1 className="page-title">Offerte Calculeren</h1>
            <p className="page-subtitle">Voor opdracht: <strong>{job.title}</strong> (Aantal: {job.quantity})</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Input Sectie */}
                <div className="card bg-base-100 shadow-xl p-8 space-y-4">
                    <h2 className="card-title">1. Stel de productie samen</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                             <label className="label"><span className="label-text">Product Breedte (mm)</span></label>
                            <input type="number" name="productWidth_mm" value={formState.productWidth_mm} onChange={handleChange} className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Product Hoogte (mm)</span></label>
                            <input type="number" name="productHeight_mm" value={formState.productHeight_mm} onChange={handleChange} className="input input-bordered" required />
                        </div>
                    </div>
                    
                    <select name="materialId" value={formState.materialId} onChange={handleChange} className="select select-bordered" required><option value="" disabled>Kies materiaal</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sheetWidth_mm}x{m.sheetHeight_mm}mm)</option>)}</select>
                    <select name="machineId" value={formState.machineId} onChange={handleChange} className="select select-bordered" required><option value="" disabled>Kies machine</option>{machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                    <div><label className="label"><span className="label-text">Afwerkingen</span></label><div className="flex flex-wrap gap-2">{finishings.map(f => <div key={f.id} className="form-control"><label className="label cursor-pointer"><input type="checkbox" className="checkbox" onChange={() => handleFinishingChange(f.id)} /><span className="label-text ml-2">{f.name}</span></label></div>)}</div></div>
                    <div><label className="label"><span className="label-text">Winstmarge (%)</span></label><input type="number" name="marginPercentage" value={formState.marginPercentage} onChange={handleChange} className="input input-bordered" /></div>
                    <button className="btn btn-primary w-full" onClick={handleRunCalculation} disabled={isCalculating}>{isCalculating ? 'Berekenen...' : 'Bereken Prijs'}</button>
                </div>
                {/* Resultaat Sectie */}
                <div className="card bg-base-200 shadow-xl p-8">
                    <h2 className="card-title">2. Calculatie Resultaat</h2>
                    {isCalculating && <div className="text-center p-8"><span className="loading loading-lg loading-spinner"></span></div>}
                    {!isCalculating && !calculationResult && <div className="text-center p-8 text-base-content/60">Voer de gegevens in en klik op 'Bereken Prijs' om het resultaat te zien.</div>}
                    {calculationResult && (
                        <div className="space-y-4">
                            <table className="table w-full"><tbody>{calculationResult.items.map((item, i) => <tr key={i}><td>{item.description}</td><td className="text-right">€{item.totalCost.toFixed(2)}</td></tr>)}</tbody><tfoot><tr className="font-bold border-t"><td>Kostprijs</td><td className="text-right">€{calculationResult.totalCost.toFixed(2)}</td></tr><tr className="font-bold"><td>Marge ({calculationResult.marginPercentage}%)</td><td className="text-right">€{(calculationResult.finalPrice - calculationResult.totalCost).toFixed(2)}</td></tr><tr className="text-xl font-bold border-t"><td>Offerteprijs</td><td className="text-right">€{calculationResult.finalPrice.toFixed(2)}</td></tr></tfoot></table>
                            <button className="btn btn-success w-full" onClick={handleSaveQuote} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Offerte Aanmaken en Opslaan'}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateQuote;