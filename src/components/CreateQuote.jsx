import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../api';
import ImpositionVisualizer from './ImpositionVisualizer';

// --- De Volledige Calculator voor Betalende Gebruikers ---
const FullCalculator = ({ job, showNotification, navigateTo }) => {
    const [materials, setMaterials] = useState([]);
    const [machines, setMachines] = useState([]);
    const [finishings, setFinishings] = useState([]);
    const [formState, setFormState] = useState({ materialId: '', machineId: '', finishingIds: new Set(), marginPercentage: 40, productWidth_mm: '', productHeight_mm: '', productLength_mm: '', productDepth_mm: '' });
    const [calculationResult, setCalculationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const jobProperties = job.properties || {};
    const selectedMaterial = materials.find(m => m.id === formState.materialId);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [materialsData, machinesData, finishingsData] = await Promise.all([
                apiRequest('GET', '/api/materials'),
                apiRequest('GET', '/api/calculation-settings/machines'),
                apiRequest('GET', '/api/calculation-settings/finishings'),
            ]);
            setMaterials(materialsData);
            setMachines(machinesData);
            setFinishings(finishingsData);
            setFormState(prev => ({ ...prev, productWidth_mm: jobProperties.width_mm || '', productHeight_mm: jobProperties.height_mm || '', productLength_mm: jobProperties.length_mm || '', productDepth_mm: jobProperties.depth_mm || '' }));
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [jobProperties, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFinishingChange = (finishingId) => {
        const newSet = new Set(formState.finishingIds);
        newSet.has(finishingId) ? newSet.delete(finishingId) : newSet.add(finishingId);
        setFormState(prev => ({ ...prev, finishingIds: newSet }));
    };

    const handleRunCalculation = async () => {
        setIsCalculating(true);
        setCalculationResult(null);
        try {
            const payload = { ...formState, productType: jobProperties.productType, finishingIds: Array.from(formState.finishingIds), quantity: job.quantity, jobId: job.id };
            const result = await apiRequest('POST', '/api/calculations/run', payload);
            setCalculationResult(result);
        } catch (error) { showNotification(error.message, 'error'); } 
        finally { setIsCalculating(false); }
    };
    
    const handleSaveQuote = async () => {
        if (!calculationResult) return;
        setIsSaving(true);
        try {
            const completeCalculation = {
                ...calculationResult,
                productType: jobProperties.productType, quantity: job.quantity,
                width_mm: jobProperties.width_mm, height_mm: jobProperties.height_mm, length_mm: jobProperties.length_mm, depth_mm: jobProperties.depth_mm,
                materialId: formState.materialId, machineId: formState.machineId,
            };
            const payload = { 
                price: completeCalculation.finalPrice, deliveryTime: "5-7 werkdagen", 
                comments: "Offerte berekend via de calculatie-engine.", calculation: completeCalculation
            };
            await apiRequest('POST', `/api/quotes/${job.id}`, payload);
            showNotification('Offerte succesvol opgeslagen!', 'success');
            navigateTo('my-submitted-quotes');
        } catch(e) { showNotification(e.message, 'error'); } 
        finally { setIsSaving(false); }
    };
    
    const renderDimensionFields = () => {
        switch (jobProperties.productType) {
            case 'BOX':
                return (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-control"><label className="label"><span className="label-text">Lengte (mm)</span></label><input type="number" name="productLength_mm" value={formState.productLength_mm} onChange={handleChange} className="input input-bordered" required /></div>
                        <div className="form-control"><label className="label"><span className="label-text">Breedte (mm)</span></label><input type="number" name="productWidth_mm" value={formState.productWidth_mm} onChange={handleChange} className="input input-bordered" required /></div>
                        <div className="form-control"><label className="label"><span className="label-text">Hoogte (mm)</span></label><input type="number" name="productHeight_mm" value={formState.productHeight_mm} onChange={handleChange} className="input input-bordered" required /></div>
                    </div>
                );
            case 'FLAT_PRINT':
            default:
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control"><label className="label"><span className="label-text">Breedte (mm)</span></label><input type="number" name="productWidth_mm" value={formState.productWidth_mm} onChange={handleChange} className="input input-bordered" required /></div>
                        <div className="form-control"><label className="label"><span className="label-text">Hoogte (mm)</span></label><input type="number" name="productHeight_mm" value={formState.productHeight_mm} onChange={handleChange} className="input input-bordered" required /></div>
                    </div>
                );
        }
    };

    if (isLoading) return <div className="text-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <div className="card bg-base-100 shadow-xl p-8 space-y-4">
                <h2 className="card-title">1. Stel de productie samen</h2>
                {renderDimensionFields()}
                <select name="materialId" value={formState.materialId} onChange={handleChange} className="select select-bordered w-full" required><option value="" disabled>Kies materiaal</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.sheetWidth_mm}x{m.sheetHeight_mm}mm)</option>)}</select>
                <select name="machineId" value={formState.machineId} onChange={handleChange} className="select select-bordered w-full" required><option value="" disabled>Kies machine</option>{machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
                <div><label className="label"><span className="label-text">Winstmarge (%)</span></label><input type="number" name="marginPercentage" value={formState.marginPercentage} onChange={handleChange} className="input input-bordered" /></div>
                <button className="btn btn-primary w-full" onClick={handleRunCalculation} disabled={isCalculating}>{isCalculating ? 'Berekenen...' : 'Bereken Prijs'}</button>
            </div>
            <div className="card bg-base-200 shadow-xl p-8">
                <h2 className="card-title">2. Calculatie Resultaat</h2>
                {isCalculating && <div className="text-center p-8"><span className="loading loading-lg loading-spinner"></span></div>}
                {!calculationResult && <div className="text-center p-8 text-base-content/60">Klik op 'Bereken Prijs'.</div>}
                {calculationResult && (
                    <div className="space-y-4">
                        <table className="table w-full"><tbody>{calculationResult.items.map((item, i) => <tr key={i}><td>{item.description}</td><td className="text-right">€{item.totalCost.toFixed(2)}</td></tr>)}</tbody><tfoot><tr className="font-bold border-t"><td>Kostprijs</td><td className="text-right">€{calculationResult.totalCost.toFixed(2)}</td></tr><tr className="font-bold"><td>Marge ({calculationResult.marginPercentage}%)</td><td className="text-right">€{(calculationResult.finalPrice - calculationResult.totalCost).toFixed(2)}</td></tr><tr className="text-xl font-bold border-t"><td>Offerteprijs</td><td className="text-right">€{calculationResult.finalPrice.toFixed(2)}</td></tr></tfoot></table>
                        <ImpositionVisualizer imposition={calculationResult.imposition} material={selectedMaterial} productType={jobProperties.productType} />
                        <button className="btn btn-success w-full" onClick={handleSaveQuote} disabled={isSaving}>{isSaving ? 'Opslaan...' : 'Offerte Indienen'}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Het Simpele Formulier voor Gratis Gebruikers ---
const SimpleQuoteForm = ({ job, showNotification, navigateTo }) => {
    const [formData, setFormData] = useState({ price: '', deliveryTime: '', comments: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    const jobProperties = job.properties || {};

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.price || !formData.deliveryTime) {
            showNotification('Vul a.u.b. een prijs en levertijd in.', 'warning');
            return;
        }
        setIsSaving(true);
        try {
            const price = parseFloat(formData.price);
            const manualCalculation = {
                totalCost: price, marginPercentage: 0, finalPrice: price,
                items: [{ type: 'EXTERNAL', description: 'Handmatig ingevoerde offerteprijs', quantity: 1, unitCost: price, totalCost: price }],
                productType: jobProperties.productType, quantity: job.quantity, width_mm: jobProperties.width_mm, height_mm: jobProperties.height_mm, length_mm: jobProperties.length_mm, depth_mm: jobProperties.depth_mm,
            };
            const payload = { price: price, deliveryTime: formData.deliveryTime, comments: formData.comments, calculation: manualCalculation };
            await apiRequest('POST', `/api/quotes/${job.id}`, payload);
            showNotification('Offerte succesvol ingediend!', 'success');
            navigateTo('my-submitted-quotes');
        } catch(e) { showNotification(e.message, 'error'); } 
        finally { setIsSaving(false); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <form onSubmit={handleSubmit} className="lg:col-span-2 card bg-base-100 shadow-xl p-8 space-y-4">
                <h2 className="card-title">Dien uw offerte in</h2>
                <div className="form-control">
                    <label className="label"><span className="label-text">Uw Offerteprijs (€)</span></label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="input input-bordered" placeholder="bv. 1250.50" required />
                </div>
                <div className="form-control">
                    <label className="label"><span className="label-text">Levertijd</span></label>
                    <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} className="input input-bordered" placeholder="bv. 5-7 werkdagen" required />
                </div>
                <div className="form-control">
                    <label className="label"><span className="label-text">Opmerkingen (optioneel)</span></label>
                    <textarea name="comments" value={formData.comments} onChange={handleChange} className="textarea textarea-bordered" rows="3"></textarea>
                </div>
                <button type="submit" className="btn btn-success w-full" disabled={isSaving}>
                    {isSaving ? 'Indienen...' : 'Offerte Indienen'}
                </button>
            </form>
            <div className="alert shadow-lg bg-primary text-primary-content lg:sticky top-24 self-start">
                <div className="flex-col items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="font-bold text-lg">Sneller en slimmer offreren?</h3>
                    <div className="text-sm opacity-90">Upgrade naar een PRO-abonnement en krijg toegang tot de geavanceerde calculatie-engine. Beheer uw eigen materialen, machines en prijzen en maak foutloze offertes in seconden.</div>
                    <div className="mt-4">
                        <button className="btn btn-sm btn-neutral" onClick={() => alert('Navigeer naar upgrade pagina!')}>Meer Informatie</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- De Hoofdcomponent die kiest welke versie getoond wordt ---
const CreateQuote = ({ showNotification, navigateTo, viewParam: jobId, currentUser }) => {
    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const hasCalculatorAccess = useMemo(() => {
        if (!currentUser || !currentUser.permissions) return false;
        return currentUser.permissions.includes('manage_materials');
    }, [currentUser]);

    useEffect(() => {
        const fetchJobData = async () => {
            setIsLoading(true);
            try {
                const jobData = await apiRequest('GET', `/api/jobs/${jobId}`);
                setJob(jobData);
            } catch (error) { showNotification(error.message, 'error'); } 
            finally { setIsLoading(false); }
        };
        if (jobId && currentUser) fetchJobData();
    }, [jobId, currentUser, showNotification]);

    if (isLoading) return <div className="loading-text">Offertepagina laden...</div>;
    if (!job) return <div className="page-container"><h1 className="page-title">Opdracht niet gevonden</h1></div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Offerte Maken</h1>
            <p className="page-subtitle">Voor opdracht: <strong>{job.title}</strong> (Aantal: {job.quantity.toLocaleString('nl-NL')})</p>
            
            {hasCalculatorAccess ? 
                <FullCalculator job={job} showNotification={showNotification} navigateTo={navigateTo} /> : 
                <SimpleQuoteForm job={job} showNotification={showNotification} navigateTo={navigateTo} />
            }
        </div>
    );
};

export default CreateQuote;