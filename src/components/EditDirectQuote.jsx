import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getDirectQuoteById, 
    getProductTemplates, 
    runDirectCalculation,
    updateDirectQuote,
    getMaterials,
    getBoxCatalog,
    getBoxGeometry,
    getPartners
} from '@/api';
import { v4 as uuidv4 } from 'uuid';
import CustomerInfoForm from '../features/quotes/CustomerInfoForm';
import CalculationResultPanel from '../features/quotes/CalculationResultPanel';
import BoxDieVisualizer from './BoxDieVisualizer';
import Box3DViewer from './Box3DViewer';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const QuoteLineForm = ({ line, index, updateLine, removeLine, templates, materials, boxCatalog, lineCount, showNotification }) => {
    const [boxData, setBoxData] = useState(null);
    const selectedTemplate = useMemo(() => templates.find(t => t.id === line.templateId), [line.templateId, templates]);
    const productType = selectedTemplate?.productType;

    const fetchGeometry = useCallback(async () => {
        if (productType !== 'BOX' || !line.boxModel || !line.length_mm || !line.width_mm || !line.height_mm) {
            setBoxData(null); return;
        }
        try {
            const params = { L: Number(line.length_mm), W: Number(line.width_mm), H: Number(line.height_mm) };
            const result = await getBoxGeometry({ model: line.boxModel, params });
            setBoxData(result);
        } catch (error) {
            showNotification('Kon uitslag niet berekenen.', 'error');
            setBoxData(null);
        }
    }, [productType, line.boxModel, line.length_mm, line.width_mm, line.height_mm, showNotification]);

    useEffect(() => {
        const handler = setTimeout(() => fetchGeometry(), 300);
        return () => clearTimeout(handler);
    }, [fetchGeometry]);
    
    return (
         <div className="p-4 border rounded-lg bg-base-100 relative shadow">
            <h3 className="font-bold mb-3 text-lg text-gray-700">Regel {index + 1}</h3>
            {lineCount > 1 && (<button onClick={() => removeLine(index)} className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 text-gray-500 hover:text-red-500"><TrashIcon /></button>)}
            <div className="space-y-3">
                <div className="form-control"><label className="label py-1"><span className="label-text">Omschrijving</span></label><input type="text" placeholder="bv. Full-color flyer A5" className="input input-bordered w-full" value={line.description || ''} onChange={(e) => updateLine(index, 'description', e.target.value)} /></div>
                <div className="form-control"><label className="label py-1"><span className="label-text">Product Type</span></label><select value={line.templateId} onChange={(e) => updateLine(index, 'templateId', e.target.value)} className="select select-bordered w-full"><option value="" disabled>Kies een type...</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                {productType === 'BOX' && (<div className="form-control"><label className="label py-1"><span className="label-text">Doos Model (FEFCO/ECMA)</span></label><select value={line.boxModel || ''} onChange={(e) => updateLine(index, 'boxModel', e.target.value)} className="select select-bordered w-full"><option value="" disabled>Kies een model...</option>{boxCatalog.map(m => <option key={m.model} value={m.model}>{m.model}: {m.name}</option>)}</select></div>)}
                <div className="grid grid-cols-2 gap-3"><div className="form-control"><label className="label py-1"><span className="label-text">Aantal</span></label><input type="number" placeholder="Aantal" className="input input-bordered w-full" value={line.quantity || ''} onChange={(e) => updateLine(index, 'quantity', e.target.value)} /></div><div className="form-control"><label className="label py-1"><span className="label-text">Materiaal</span></label><select className="select select-bordered w-full" value={line.materialId || ''} onChange={(e) => updateLine(index, 'materialId', e.target.value)}><option value="" disabled>Kies materiaal...</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div>
                {productType === 'BOX' ? (<div className="grid grid-cols-3 gap-2"><input type="number" placeholder="Lengte (mm)" className="input input-bordered w-full" value={line.length_mm || ''} onChange={(e) => updateLine(index, 'length_mm', e.target.value)} /><input type="number" placeholder="Breedte (mm)" className="input input-bordered w-full" value={line.width_mm || ''} onChange={(e) => updateLine(index, 'width_mm', e.target.value)} /><input type="number" placeholder="Hoogte (mm)" className="input input-bordered w-full" value={line.height_mm || ''} onChange={(e) => updateLine(index, 'height_mm', e.target.value)} /></div>
                ) : (<div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Breedte (mm)" className="input input-bordered w-full" value={line.width_mm || ''} onChange={(e) => updateLine(index, 'width_mm', e.target.value)} /><input type="number" placeholder="Hoogte (mm)" className="input input-bordered w-full" value={line.height_mm || ''} onChange={(e) => updateLine(index, 'height_mm', e.target.value)} /></div>)}
                <div className="grid grid-cols-2 gap-3 pt-2"><div className="form-control"><label className="label py-1"><span className="label-text">Gutter (mm)</span></label><input type="number" placeholder="bv. 3" className="input input-bordered w-full" value={line.gutter_mm || ''} onChange={(e) => updateLine(index, 'gutter_mm', e.target.value)} /></div><div className="form-control"><label className="label py-1"><span className="label-text">Marge (mm)</span></label><input type="number" placeholder="bv. 10" className="input input-bordered w-full" value={line.margin_mm || ''} onChange={(e) => updateLine(index, 'margin_mm', e.target.value)} /></div></div>
                {productType === 'BOX' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"><BoxDieVisualizer boxData={boxData} /><div className="border p-2 rounded-lg bg-white"><Box3DViewer L_mm={Number(line.length_mm) || 0} W_mm={Number(line.width_mm) || 0} H_mm={Number(line.height_mm) || 0} topFlapsOpen={!line.topFlapsClosed} bottomFlapsOpen={!line.bottomFlapsClosed} /><div className="flex gap-4 justify-center mt-2"><label className="label cursor-pointer"><span className="label-text mr-2">Bovenkant Flaps</span><input type="checkbox" className="toggle toggle-sm" checked={!!line.topFlapsClosed} onChange={(e) => updateLine(index, 'topFlapsClosed', e.target.checked)} /></label><label className="label cursor-pointer"><span className="label-text mr-2">Onderkant Flaps</span><input type="checkbox" className="toggle toggle-sm" checked={!!line.bottomFlapsClosed} onChange={(e) => updateLine(index, 'bottomFlapsClosed', e.target.checked)} /></label></div></div></div>)}
            </div>
        </div>
    );
};

// --- START WIJZIGING: Aparte component voor verzendinformatie voor de duidelijkheid ---
const ShippingInfoForm = ({ shippingInfo, setShippingInfo, couriers }) => {
    const handleShippingChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Verzendinformatie</h2>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Koerier</span>
                </label>
                <select 
                    className="select select-bordered w-full" 
                    value={shippingInfo.partnerId || ''} 
                    onChange={(e) => handleShippingChange('partnerId', e.target.value)}
                >
                    <option value="" disabled>Kies een koerier...</option>
                    {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">Verzendkosten (€)</span>
                </label>
                <input 
                    type="number" 
                    placeholder="bv. 15.50" 
                    className="input input-bordered w-full" 
                    value={shippingInfo.cost || ''} 
                    onChange={(e) => handleShippingChange('cost', e.target.value)} 
                />
            </div>
        </div>
    );
};
// --- EINDE WIJZIGING ---


const EditDirectQuote = ({ showNotification }) => {
    const { id: quoteId } = useParams();
    const navigate = useNavigate();

    const [templates, setTemplates] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [boxCatalog, setBoxCatalog] = useState([]);
    const [couriers, setCouriers] = useState([]);

    const [quoteLines, setQuoteLines] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({});
    const [deliveryTime, setDeliveryTime] = useState('');
    const [marginPercentage, setMarginPercentage] = useState('');
    
    // --- START WIJZIGING: State voor verzendinformatie uitgebreid ---
    const [shippingInfo, setShippingInfo] = useState({
        partnerId: null,
        cost: ''
    });
    // --- EINDE WIJZIGING ---
    
    const [calculationResult, setCalculationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const loadInitialData = useCallback(async () => {
        if (!quoteId) return;
        setIsLoading(true);
        try {
            const [quoteData, templatesData, materialsData, catalogData, couriersData] = await Promise.all([
                getDirectQuoteById(quoteId),
                getProductTemplates(),
                getMaterials(),
                getBoxCatalog(),
                getPartners('COURIER'),
            ]);
            
            setTemplates(templatesData || []);
            setMaterials(materialsData || []);
            setBoxCatalog(Array.isArray(catalogData) ? catalogData : []);
            setCouriers(couriersData || []);

            setCustomerInfo({ 
                name: quoteData.customerName || '', 
                email: quoteData.customerEmail || '', 
                company: quoteData.customerCompany || '' 
            });
            setDeliveryTime(quoteData.deliveryTime ? new Date(quoteData.deliveryTime).toISOString().split('T')[0] : '');

            // --- START WIJZIGING: shippingInfo state correct vullen met ID ---
            setShippingInfo({
                partnerId: quoteData.shippingPartnerId || null,
                cost: quoteData.shippingCost || ''
            });
            // --- EINDE WIJZIGING ---

            const parsedCalc = quoteData.calculationResult && typeof quoteData.calculationResult === 'string' 
                ? JSON.parse(quoteData.calculationResult) 
                : quoteData.calculationResult;
            
            const userInput = quoteData.userInput && typeof quoteData.userInput === 'string'
                ? JSON.parse(quoteData.userInput)
                : quoteData.userInput;

            if (userInput && userInput.lines && userInput.lines.length > 0) {
                setQuoteLines(userInput.lines);
            } else if (parsedCalc && parsedCalc.lines && parsedCalc.lines.length > 0) {
                setQuoteLines(parsedCalc.lines);
            } else {
                setQuoteLines([{ id: uuidv4(), description: '', quantity: 100, templateId: '', stepInputs: {}, gutter_mm: 3, margin_mm: 10 }]);
            }

            setCalculationResult(parsedCalc);
            if (parsedCalc && parsedCalc.marginPercentage) {
                setMarginPercentage(String(parsedCalc.marginPercentage));
            }
        } catch (error) {
            showNotification('Kon de offertegegevens niet laden: ' + error.message, 'error');
            navigate('/direct-quotes-list');
        } finally {
            setIsLoading(false);
        }
    }, [quoteId, showNotification, navigate]);

    useEffect(() => { loadInitialData(); }, [loadInitialData]);
    
    const updateQuoteLine = (index, field, value) => {
        const newLines = [...quoteLines];
        const fields = field.split('.');
        let current = newLines[index];
        for (let i = 0; i < fields.length - 1; i++) {
            if (!current[fields[i]]) {
                current[fields[i]] = {};
            }
            current = current[fields[i]];
        }
        current[fields[fields.length - 1]] = value;
        setQuoteLines(newLines);
        setCalculationResult(null);
    };

    const addQuoteLine = () => setQuoteLines([...quoteLines, { id: uuidv4(), description: '', quantity: 100, templateId: '', stepInputs: {}, gutter_mm: 3, margin_mm: 10, topFlapsClosed: false, bottomFlapsClosed: false }]);
    const removeQuoteLine = (index) => { if (quoteLines.length > 1) setQuoteLines(quoteLines.filter((_, i) => i !== index)); };

    const handleRunCalculation = async () => {
        setIsCalculating(true);
        setCalculationResult(null);
        try {
            const result = await runDirectCalculation({ lines: quoteLines, marginPercentage, shippingCost: shippingInfo.cost || 0 });
            setCalculationResult(result);
            showNotification('Hercalculatie succesvol!', 'success');
        } catch (error) { 
            showNotification(error.message, 'error');
        } finally { 
            setIsCalculating(false); 
        }
    };

    const handleUpdateQuote = async () => {
        if (!calculationResult) {
            showNotification('Voer eerst een berekening uit voordat je opslaat.', 'warning');
            return;
        }
        setIsSaving(true);

        // --- START WIJZIGING: Payload voor opslaan aangepast ---
        // Nu wordt de shippingPartnerId meegestuurd i.p.v. een object.
        const payload = {
            customerInfo: {
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerCompany: customerInfo.company
            },
            price: calculationResult.grandTotals.total,
            calculationResult,
            userInput: { lines: quoteLines },
            deliveryTime,
            shippingPartnerId: shippingInfo.partnerId,
            shippingCost: shippingInfo.cost
        };
        // --- EINDE WIJZIGING ---

        try {
            await updateDirectQuote(quoteId, payload);
            showNotification('Offerte succesvol bijgewerkt!', 'success');
            navigate(`/direct-quote-details/${quoteId}`);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <div className="text-center p-10">Offerte laden...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Offerte Aanpassen</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                <div className="bg-white p-8 rounded-lg shadow-xl space-y-4 md:col-span-2">
                    <CustomerInfoForm 
                        customerInfo={customerInfo} 
                        setCustomerInfo={setCustomerInfo} 
                        deliveryTime={deliveryTime}
                        setDeliveryTime={setDeliveryTime}
                        marginPercentage={marginPercentage} 
                        setMarginPercentage={setMarginPercentage}
                    />
                    <div className="space-y-4 pt-4 border-t"><h2 className="text-xl font-semibold text-gray-800">Productspecificaties</h2>
                        {quoteLines.map((line, index) => (
                            <QuoteLineForm
                                key={line.id || index}
                                line={line}
                                index={index}
                                updateLine={updateQuoteLine}
                                removeLine={removeQuoteLine}
                                templates={templates}
                                materials={materials}
                                boxCatalog={boxCatalog}
                                lineCount={quoteLines.length}
                                showNotification={showNotification}
                            />
                        ))}
                        <button onClick={addQuoteLine} className="btn btn-block btn-ghost mt-2">+ Regel Toevoegen</button>
                    </div>
                </div>
                <div className="space-y-6 self-start sticky top-24">
                    {/* --- START WIJZIGING: Nieuw formulier voor verzending toegevoegd --- */}
                    <ShippingInfoForm 
                        shippingInfo={shippingInfo}
                        setShippingInfo={setShippingInfo}
                        couriers={couriers}
                    />
                    {/* --- EINDE WIJZIGING --- */}
                     <CalculationResultPanel
                        calculationResult={calculationResult}
                        isCalculating={isCalculating}
                        isSaving={isSaving}
                        handleRunCalculation={handleRunCalculation}
                        handleSaveQuote={handleUpdateQuote}
                        savedQuoteId={quoteId}
                        navigateTo={(path, id) => navigate(`/${path}/${id}`)}
                        isDisabled={isLoading}
                        isEditMode={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditDirectQuote;