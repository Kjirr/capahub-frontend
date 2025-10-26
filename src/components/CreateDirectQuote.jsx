import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProductTemplates, 
  getMaterials,
  getPartners,
  getShippingRates,
  runDirectCalculation,
  saveDirectQuote,
  getBoxCatalog,
  getBoxGeometry,
} from '../api';
import CustomerInfoForm from '../features/quotes/CustomerInfoForm';
import CalculationResultPanel from '../features/quotes/CalculationResultPanel';
import BoxDieVisualizer from './BoxDieVisualizer';
import Box3DViewer from './Box3DViewer';

const ShippingRatesModal = ({ rates, isOpen, onClose, onSelectRate }) => {
    const [selectedRateId, setSelectedRateId] = useState(null);
    if (!isOpen) return null;
    const selectedRate = rates.find(r => r.id === selectedRateId);
    const handleSelect = () => { if (selectedRate) { onSelectRate(selectedRate); } };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">Kies een Verzendoptie</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">{rates.length > 0 ? rates.map(rate => (<label key={rate.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="radio" name="shippingRate" className="radio radio-primary" checked={selectedRateId === rate.id} onChange={() => setSelectedRateId(rate.id)} /><span className="ml-4 flex-grow font-medium">{rate.name}</span><span className="font-semibold">€ {rate.price}</span></label>)) : <p>Geen verzendopties gevonden.</p>}</div>
                <div className="mt-6 flex justify-end space-x-3"><button onClick={onClose} className="btn btn-ghost">Annuleren</button><button onClick={handleSelect} className="btn btn-primary" disabled={!selectedRate}>Selecteer</button></div>
            </div>
        </div>
    );
};

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const QuoteLineForm = ({ line, index, updateLine, removeLine, templates, materials, boxCatalog, lineCount, showNotification }) => {
    const [boxData, setBoxData] = useState(null);
    const selectedTemplate = useMemo(() => templates.find(t => t.id === line.templateId), [line.templateId, templates]);
    const productType = selectedTemplate?.productType;
    const fetchGeometry = useCallback(async () => { if (productType !== 'BOX' || !line.boxModel || !line.length_mm || !line.width_mm || !line.height_mm) { setBoxData(null); return; } try { const params = { L: Number(line.length_mm), W: Number(line.width_mm), H: Number(line.height_mm) }; const result = await getBoxGeometry({ model: line.boxModel, params }); setBoxData(result); } catch (error) { showNotification('Kon uitslag niet berekenen.', 'error'); setBoxData(null); } }, [productType, line.boxModel, line.length_mm, line.width_mm, line.height_mm, showNotification]);
    useEffect(() => { const handler = setTimeout(() => fetchGeometry(), 300); return () => clearTimeout(handler); }, [fetchGeometry]);
    const manualLaborNodes = useMemo(() => selectedTemplate?.workflowDefinition?.nodes?.filter( node => node.data.type === 'Labor' && !node.data.params?.linkedNodeId) || [],[selectedTemplate]);
    
    return (
        <div className="p-4 border rounded-lg bg-base-100 relative shadow">
            <h3 className="font-bold mb-3 text-lg text-gray-700">Regel {index + 1}</h3>
            {lineCount > 1 && (<button onClick={() => removeLine(index)} className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 text-gray-500 hover:text-red-500"><TrashIcon /></button>)}
            <div className="space-y-3">
                <div className="form-control"><label className="label py-1"><span className="label-text">Omschrijving</span></label><input type="text" placeholder="bv. Full-color flyer A5" className="input input-bordered w-full" value={line.description || ''} onChange={(e) => updateLine(index, 'description', e.target.value)} /></div>
                <div className="form-control"><label className="label py-1"><span className="label-text">Product Type</span></label><select value={line.templateId} onChange={(e) => updateLine(index, 'templateId', e.target.value)} className="select select-bordered w-full"><option value="" disabled>Kies een type...</option>{templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                {productType === 'BOX' && (<div className="form-control"><label className="label py-1"><span className="label-text">Doos Model (FEFCO/ECMA)</span></label><select value={line.boxModel || ''} onChange={(e) => updateLine(index, 'boxModel', e.target.value)} className="select select-bordered w-full"><option value="" disabled>Kies een model...</option>{boxCatalog.map(m => <option key={m.model} value={m.model}>{m.model}: {m.name}</option>)}</select></div>)}
                <div className="grid grid-cols-2 gap-3"><div className="form-control"><label className="label py-1"><span className="label-text">Aantal</span></label><input type="number" placeholder="Aantal" className="input input-bordered w-full" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} /></div><div className="form-control"><label className="label py-1"><span className="label-text">Materiaal</span></label><select className="select select-bordered w-full" value={line.materialId || ''} onChange={(e) => updateLine(index, 'materialId', e.target.value)}><option value="" disabled>Kies materiaal...</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div>
                {productType === 'BOX' ? (<div className="grid grid-cols-3 gap-2"><input type="number" placeholder="Lengte (mm)" className="input input-bordered w-full" value={line.length_mm || ''} onChange={(e) => updateLine(index, 'length_mm', e.target.value)} /><input type="number" placeholder="Breedte (mm)" className="input input-bordered w-full" value={line.width_mm || ''} onChange={(e) => updateLine(index, 'width_mm', e.target.value)} /><input type="number" placeholder="Hoogte (mm)" className="input input-bordered w-full" value={line.height_mm || ''} onChange={(e) => updateLine(index, 'height_mm', e.target.value)} /></div>) : (<div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Breedte (mm)" className="input input-bordered w-full" value={line.width_mm || ''} onChange={(e) => updateLine(index, 'width_mm', e.target.value)} /><input type="number" placeholder="Hoogte (mm)" className="input input-bordered w-full" value={line.height_mm || ''} onChange={(e) => updateLine(index, 'height_mm', e.target.value)} /></div>)}
                <div className="grid grid-cols-2 gap-3 pt-2"><div className="form-control"><label className="label py-1"><span className="label-text">Gutter (mm)</span></label><input type="number" placeholder="bv. 3" className="input input-bordered w-full" value={line.gutter_mm || ''} onChange={(e) => updateLine(index, 'gutter_mm', e.target.value)} /></div><div className="form-control"><label className="label py-1"><span className="label-text">Marge (mm)</span></label><input type="number" placeholder="bv. 10" className="input input-bordered w-full" value={line.margin_mm || ''} onChange={(e) => updateLine(index, 'margin_mm', e.target.value)} /></div></div>
                {manualLaborNodes.map(node => (<div key={node.id} className="form-control"><label className="label py-1"><span className="label-text">{node.data.label} (uren)</span></label><input type="number" step="0.1" placeholder="bv. 1.5" className="input input-bordered w-full" value={line.stepInputs?.[node.id]?.manualHours || ''} onChange={(e) => updateLine(index, `stepInputs.${node.id}.manualHours`, e.target.value)} /></div>))}
                {productType === 'BOX' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"><BoxDieVisualizer boxData={boxData} /><div className="border p-2 rounded-lg bg-white"><Box3DViewer L_mm={Number(line.length_mm) || 0} W_mm={Number(line.width_mm) || 0} H_mm={Number(line.height_mm) || 0} topFlapsOpen={!line.topFlapsClosed} bottomFlapsOpen={!line.bottomFlapsClosed} /><div className="flex gap-4 justify-center mt-2"><label className="label cursor-pointer"><span className="label-text mr-2">Bovenkant Flaps</span><input type="checkbox" className="toggle toggle-sm" checked={!!line.topFlapsClosed} onChange={(e) => updateLine(index, 'topFlapsClosed', e.target.checked)} /></label><label className="label cursor-pointer"><span className="label-text mr-2">Onderkant Flaps</span><input type="checkbox" className="toggle toggle-sm" checked={!!line.bottomFlapsClosed} onChange={(e) => updateLine(index, 'bottomFlapsClosed', e.target.checked)} /></label></div></div></div>)}
            </div>
        </div>
    );
};

export const CreateDirectQuote = ({ showNotification, navigateTo }) => {
    const [productTemplates, setProductTemplates] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [boxCatalog, setBoxCatalog] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quoteLines, setQuoteLines] = useState([{ id: uuidv4(), description: '', quantity: 100, templateId: '', stepInputs: {}, gutter_mm: 3, margin_mm: 10, topFlapsClosed: false, bottomFlapsClosed: false }]);
    const [customerInfo, setCustomerInfo] = useState({});
    const [deliveryTime, setDeliveryTime] = useState('');
    const [marginPercentage, setMarginPercentage] = useState('30');
    const [comments, setComments] = useState('');
    const [onAcceptanceAction, setOnAcceptanceAction] = useState('SHOW_MESSAGE');
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [calculationResult, setCalculationResult] = useState(null);
    const [savedQuoteId, setSavedQuoteId] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({ courierName: '', cost: '' });
    const [parcelInfo, setParcelInfo] = useState({ weight: '', length: '', width: '', height: '' });
    const [shippingRates, setShippingRates] = useState([]);
    const [isFetchingRates, setIsFetchingRates] = useState(false);
    const [showRatesModal, setShowRatesModal] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [tpls, mats, catalog, crs] = await Promise.all([ 
                    getProductTemplates(), 
                    getMaterials(), 
                    getBoxCatalog(),
                    getPartners('COURIER'),
                ]);
                setProductTemplates(tpls || []);
                setMaterials(mats || []);
                setBoxCatalog(Array.isArray(catalog) ? catalog : []);
                setCouriers(crs || []);
            } catch (error) {
                showNotification(error.message || 'Kon de benodigde data niet laden.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [showNotification]);

    const addQuoteLine = () => setQuoteLines([...quoteLines, { id: uuidv4(), description: '', quantity: 100, templateId: '', stepInputs: {}, gutter_mm: 3, margin_mm: 10, topFlapsClosed: false, bottomFlapsClosed: false }]);
    
    // --- START WIJZIGING: Ontbrekende 'removeLine' functie toegevoegd ---
    const removeLine = (index) => {
        if (quoteLines.length > 1) {
            const newLines = quoteLines.filter((_, i) => i !== index);
            setQuoteLines(newLines);
            setCalculationResult(null);
        }
    };
    // --- EINDE WIJZIGING ---

    const updateQuoteLine = (index, field, value) => { const newLines = JSON.parse(JSON.stringify(quoteLines)); const fields = field.split('.'); let current = newLines[index]; for (let i = 0; i < fields.length - 1; i++) { if (!current[fields[i]]) { current[fields[i]] = {}; } current = current[fields[i]]; } current[fields[fields.length - 1]] = value; setQuoteLines(newLines); setCalculationResult(null); };
    const handleParcelChange = (field, value) => { setParcelInfo(prev => ({ ...prev, [field]: value })); };
    const handleManualShippingChange = (field, value) => { setShippingInfo(prev => ({ ...prev, [field]: value })); setCalculationResult(null); };

    const handleFetchRates = async () => {
        const { address, postal_code, city, country, name, company } = customerInfo;
        const { weight, length, width, height } = parcelInfo;
        if (!address || !postal_code || !city || !weight) {
            showNotification('Vul alle adresgegevens en het gewicht in om tarieven te berekenen.', 'warning');
            return;
        }
        setIsFetchingRates(true);
        try {
            const payload = { recipient: { name, company, address, postal_code, city, country }, parcel: { weight, length, width, height } };
            const rates = await getShippingRates(payload);
            setShippingRates(rates);
            setShowRatesModal(true);
        } catch (error) {
            showNotification(error.message || 'Kon verzendtarieven niet ophalen.', 'error');
        } finally {
            setIsFetchingRates(false);
        }
    };
    
    const handleSelectRate = (rate) => {
        setShippingInfo({ courierName: rate.name, cost: rate.price });
        setShowRatesModal(false);
        handleRunCalculation(rate.price); 
    };
    
    const handleRunCalculation = async (currentShippingCost) => {
        setIsCalculating(true);
        setCalculationResult(null);
        const calculationPayloads = quoteLines.map(line => ({...line})).filter(line => line.templateId);
        if (calculationPayloads.length !== quoteLines.length) { showNotification('Kies voor elke regel een product.', 'error'); setIsCalculating(false); return; }
        try {
            const finalShippingCost = currentShippingCost !== undefined ? currentShippingCost : (shippingInfo.cost || 0);
            const result = await runDirectCalculation({ lines: calculationPayloads, marginPercentage, shippingCost: finalShippingCost });
            setCalculationResult(result);
            showNotification('Calculatie succesvol!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleSaveQuote = async () => {
        if (!calculationResult) { showNotification('Voer eerst een berekening uit.', 'warning'); return; }
        setIsSaving(true);
        try {
            const payload = {
                customerInfo: {
                    customerName: customerInfo.name,
                    customerEmail: customerInfo.email,
                    customerCompany: customerInfo.company,
                    address: customerInfo.address,
                    postal_code: customerInfo.postal_code,
                    city: customerInfo.city,
                    country: customerInfo.country
                },
                deliveryTime,
                comments,
                onAcceptanceAction,
                price: calculationResult.grandTotals.total,
                calculationResult,
                userInput: { lines: quoteLines },
                shippingInfo
            };
            const savedQuote = await saveDirectQuote(payload);
            setSavedQuoteId(savedQuote.id);
            showNotification(`Offerte ${savedQuote.quoteNumber} succesvol opgeslagen!`, 'success');
        } catch (error) {
            showNotification(error.message || 'Opslaan van offerte mislukt.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <ShippingRatesModal isOpen={showRatesModal} rates={shippingRates} onClose={() => setShowRatesModal(false)} onSelectRate={handleSelectRate} />
            
            <h1 className="text-3xl font-bold">Nieuwe Offerte</h1>
            <div className="mt-4 bg-white p-6 rounded-lg shadow-xl border space-y-4">
                 <CustomerInfoForm customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} deliveryTime={deliveryTime} setDeliveryTime={setDeliveryTime} marginPercentage={marginPercentage} setMarginPercentage={setMarginPercentage} />
                 
                <div className="form-control">
                    <label className="label py-1"><span className="label-text font-semibold">Persoonlijke Opmerkingen</span></label>
                    <textarea className="textarea textarea-bordered w-full" rows="2" placeholder="Voeg hier een persoonlijk bericht..." value={comments} onChange={(e) => setComments(e.target.value)}></textarea>
                </div>
                
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Verzending</h2>
                        <button className={`btn btn-primary btn-sm ${isFetchingRates ? 'loading' : ''}`} onClick={handleFetchRates}>Bereken Verzendopties</button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Vul adres- en pakketdetails in en klik op de knop voor live tarieven, of vul de velden hieronder handmatig in.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-control"><label className="label py-1"><span className="label-text">Gewicht (kg)</span></label><input type="number" placeholder="bv. 15.5" className="input input-bordered w-full" value={parcelInfo.weight} onChange={(e) => handleParcelChange('weight', e.target.value)} /></div>
                        <div className="form-control"><label className="label py-1"><span className="label-text">Lengte (cm)</span></label><input type="number" placeholder="Optioneel" className="input input-bordered w-full" value={parcelInfo.length} onChange={(e) => handleParcelChange('length', e.target.value)} /></div>
                        <div className="form-control"><label className="label py-1"><span className="label-text">Breedte (cm)</span></label><input type="number" placeholder="Optioneel" className="input input-bordered w-full" value={parcelInfo.width} onChange={(e) => handleParcelChange('width', e.target.value)} /></div>
                        <div className="form-control"><label className="label py-1"><span className="label-text">Hoogte (cm)</span></label><input type="number" placeholder="Optioneel" className="input input-bordered w-full" value={parcelInfo.height} onChange={(e) => handleParcelChange('height', e.target.value)} /></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="form-control"><label className="label py-1"><span className="label-text">Gekozen Vervoerder</span></label><select className="select select-bordered w-full" value={shippingInfo.courierName || ''} onChange={(e) => handleManualShippingChange('courierName', e.target.value)}><option value="">Kies een vervoerder...</option>{couriers.map(c => (<option key={c.id} value={c.name}>{c.name}</option>))}<option value="Anders">Anders (handmatig invullen)</option></select></div>
                        <div className="form-control"><label className="label py-1"><span className="label-text">Verzendkosten</span></label><input type="number" className="input input-bordered w-full" placeholder="bv. 15.00" value={shippingInfo.cost || ''} onChange={(e) => handleManualShippingChange('cost', e.target.value)} /></div>
                     </div>
                </div>

                 <div className="form-control border-t pt-4"><label className="label"><span className="label-text font-semibold">Actie na Acceptatie Klant</span></label><select className="select select-bordered w-full" value={onAcceptanceAction} onChange={(e) => setOnAcceptanceAction(e.target.value)}><option value="SHOW_MESSAGE">Toon standaard dankbericht</option><option value="CREATE_ORDER">Automatisch order aanmaken</option></select><label className="label"><span className="label-text-alt">Kies wat er gebeurt nadat de klant de offerte online accepteert.</span></label></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                <div className="bg-white p-8 rounded-lg shadow-xl space-y-4 md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800">Productspecificaties</h2>
                    {quoteLines.map((line, index) => (
                        <QuoteLineForm key={line.id} line={line} index={index} updateLine={updateQuoteLine} removeLine={removeLine} templates={productTemplates} materials={materials} boxCatalog={boxCatalog} lineCount={quoteLines.length} showNotification={showNotification} />
                    ))}
                    <button onClick={addQuoteLine} className="btn btn-block btn-ghost mt-2">+ Regel Toevoegen</button>
                </div>
                <div className="space-y-6">
                    <CalculationResultPanel calculationResult={calculationResult} isCalculating={isCalculating} isSaving={isSaving} handleRunCalculation={() => handleRunCalculation()} handleSaveQuote={handleSaveQuote} savedQuoteId={savedQuoteId} navigateTo={navigateTo} isDisabled={isLoading} />
                </div>
            </div>
        </div>
    );
};