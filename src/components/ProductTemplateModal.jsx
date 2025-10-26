// src/components/ProductTemplateModal.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
    getMaterials, 
    getMachines, 
    getFinishings, 
    getLaborRates, 
    getFinishingEquipment,
    updateProductTemplate,
    createProductTemplate
} from '@/api';
import { v4 as uuidv4 } from 'uuid';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// In-memory cache voor dependencies
const depsCache = {
  materials: null,
  machines: null,
  finishings: null,
  laborRates: null,
  equipment: null,
};

// Type-specifieke standaardvelden voor inputs per producttype
const TYPE_DEFAULT_INPUTS = {
  FLAT_PRINT: [
    { id: uuidv4(), name: 'width_mm',    label: 'Breedte (mm)',         type: 'number' },
    { id: uuidv4(), name: 'height_mm',   label: 'Hoogte (mm)',          type: 'number' },
    { id: uuidv4(), name: 'quantity',    label: 'Aantal',               type: 'number' },
    { id: uuidv4(), name: 'material',    label: 'Materiaal',            type: 'db_material' },
  ],
  BOX: [
    { id: uuidv4(), name: 'length_mm',   label: 'Lengte (mm)',          type: 'number' },
    { id: uuidv4(), name: 'width_mm',    label: 'Breedte (mm)',         type: 'number' },
    { id: uuidv4(), name: 'height_mm',   label: 'Hoogte (mm)',          type: 'number' },
    { id: uuidv4(), name: 'thickness_mm',label: 'Materiaal dikte (mm)', type: 'number' },
    { id: uuidv4(), name: 'quantity',    label: 'Aantal',               type: 'number' },
    { id: uuidv4(), name: 'material',    label: 'Materiaal',            type: 'db_material' },
  ],
  DISPLAY: [
    { id: uuidv4(), name: 'width_mm',    label: 'Breedte (mm)',         type: 'number' },
    { id: uuidv4(), name: 'height_mm',   label: 'Hoogte (mm)',          type: 'number' },
    { id: uuidv4(), name: 'depth_mm',    label: 'Diepte (mm)',          type: 'number' },
    { id: uuidv4(), name: 'quantity',    label: 'Aantal',               type: 'number' },
    { id: uuidv4(), name: 'material',    label: 'Materiaal',            type: 'db_material' },
  ],
  OTHER: [],
};

// Extra BOX-specifieke velden (config) in de formule
const DEFAULT_BOX_OPTIONS = {
  dieType: '',          // stansvorm (bijv. FEFCO code of vrije tekst)
  closureType: '',      // kleptype (bijv. tuck flap / crash lock / tape)
  scoreLines: [],       // rillijnen: [{id, position_mm}]
};

const ProductTemplateModal = ({ isOpen, template, onClose, onSave, showNotification }) => {
  const [name, setName] = useState('');
  const [productType, setProductType] = useState('FLAT_PRINT');
  const [formula, setFormula] = useState({
    inputs: [],
    rules: [],
    customerGroups: [],
    tiers: { quantity: [], area_m2: [] },
    finishingCosts: [],
    packaging: { type: 'per_order', value: 0 },
    transport: { type: 'per_order', value: 0 },
    vatRate: 21,
    boxOptions: DEFAULT_BOX_OPTIONS,
  });

  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [availableFinishings, setAvailableFinishings] = useState([]);
  const [availableLaborRates, setAvailableLaborRates] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const justOpenedRef = useRef(false);

  const resetState = () => {
    setName('');
    setProductType('FLAT_PRINT');
    setFormula({
      inputs: [],
      rules: [],
      customerGroups: [],
      tiers: { quantity: [], area_m2: [] },
      finishingCosts: [],
      packaging: { type: 'per_order', value: 0 },
      transport: { type: 'per_order', value: 0 },
      vatRate: 21,
      boxOptions: DEFAULT_BOX_OPTIONS,
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchDependencies = async () => {
      setIsLoadingData(true);
      try {
        let [materials, machines, finishings, laborRates, equipment] = [
          depsCache.materials,
          depsCache.machines,
          depsCache.finishings,
          depsCache.laborRates,
          depsCache.equipment,
        ];

        if (!materials || !machines || !finishings || !laborRates || !equipment) {
          const result = await Promise.all([
            getMaterials(),
            getMachines(),
            getFinishings(),
            getLaborRates(),
            getFinishingEquipment(),
          ]);
          [materials, machines, finishings, laborRates, equipment] = result;
          depsCache.materials = materials;
          depsCache.machines = machines;
          depsCache.finishings = finishings;
          depsCache.laborRates = laborRates;
          depsCache.equipment = equipment;
        }

        setAvailableMaterials(materials || []);
        setAvailableMachines(machines || []);
        setAvailableFinishings(finishings || []);
        setAvailableLaborRates(laborRates || []);
        setAvailableEquipment(equipment || []);

        if (template) {
          setName(template.name || '');
          setProductType(template.productType || 'FLAT_PRINT');
          const existingFormula = template.calculationFormula || {};
          setFormula({
            inputs: existingFormula.inputs || [],
            rules: existingFormula.rules || [],
            customerGroups: existingFormula.customerGroups || [],
            tiers: existingFormula.tiers || { quantity: [], area_m2: [] },
            finishingCosts: existingFormula.finishingCosts || [],
            packaging: existingFormula.packaging || { type: 'per_order', value: 0 },
            transport: existingFormula.transport || { type: 'per_order', value: 0 },
            vatRate: existingFormula.vatRate ?? 21,
            boxOptions: existingFormula.boxOptions || DEFAULT_BOX_OPTIONS,
          });
        } else {
          resetState();
        }
      } catch (error) {
        showNotification('Kon afhankelijkheden niet laden: ' + error.message, 'error');
      } finally {
        justOpenedRef.current = true;
        setIsLoadingData(false);
      }
    };

    fetchDependencies();
  }, [isOpen, template, showNotification]);

  // Seed standaard inputs bij nieuw sjabloon of bij typewissel
  useEffect(() => {
    if (!isOpen) return;
    if (template) return; // Bestaande sjablonen niet overschrijven
    setFormula((prev) => {
      const next = { ...prev };
      if (!prev.inputs || prev.inputs.length === 0) {
        next.inputs = TYPE_DEFAULT_INPUTS[productType] || [];
      }
      if (productType !== 'BOX') {
        next.boxOptions = DEFAULT_BOX_OPTIONS; // reset wanneer geen doos
      }
      return next;
    });
  }, [productType, isOpen, template]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Naam is verplicht';

    // Dubbele input-namen voorkomen
    const inputNames = (formula.inputs || [])
      .map((i) => i.name?.trim())
      .filter(Boolean);
    const dup = inputNames.find((n, idx) => inputNames.indexOf(n) !== idx);
    if (dup) newErrors.inputs = `Dubbele variabele naam: “${dup}”`;

    // Per-type vereisten (definitie-niveau)
    const REQUIRED_PER_TYPE = {
      FLAT_PRINT: ['width_mm', 'height_mm', 'quantity', 'material'],
      BOX: ['length_mm', 'width_mm', 'height_mm', 'thickness_mm', 'quantity', 'material'],
      DISPLAY: ['width_mm', 'height_mm', 'depth_mm', 'quantity', 'material'],
    };
    const required = REQUIRED_PER_TYPE[productType] || [];
    const missing = required.filter((r) => !inputNames.includes(r));
    if (missing.length > 0) {
      newErrors.inputs = (newErrors.inputs ? newErrors.inputs + ' — ' : '') +
        `Ontbrekende velden voor ${productType}: ${missing.join(', ')}`;
    }

    // BOX-specifieke config verplichten
    if (productType === 'BOX') {
      const { dieType, closureType, scoreLines } = formula.boxOptions || DEFAULT_BOX_OPTIONS;
      if (!dieType) newErrors.boxOptions = 'Stansvorm is verplicht';
      if (!closureType) newErrors.boxOptions = (newErrors.boxOptions ? newErrors.boxOptions + ' — ' : '') + 'Kleptype is verplicht';
      if (!scoreLines || scoreLines.length === 0) newErrors.boxOptions = (newErrors.boxOptions ? newErrors.boxOptions + ' — ' : '') + 'Minimaal 1 rillijn toevoegen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, formula.inputs, formula.boxOptions, productType]);

  const handleSave = async () => {
    if (!validate()) {
      showNotification('Controleer de invoer en probeer opnieuw.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const payload = { name, productType, calculationFormula: formula };
      if (template) {
        await updateProductTemplate(template.id, payload);
      } else {
        await createProductTemplate(payload);
      }
      showNotification('Sjabloon succesvol opgeslagen!', 'success');
      onClose();
      onSave();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormulaChange = (field, value) => setFormula((prev) => ({ ...prev, [field]: value }));

  const handleNestedChange = (path, value) => {
    setFormula((prev) => {
      const newFormula = structuredClone ? structuredClone(prev) : JSON.parse(JSON.stringify(prev));
      let current = newFormula;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      current[path[path.length - 1]] = value;
      return newFormula;
    });
  };

  // BOX: score lines helpers
  const addScoreLine = () => {
    const next = [...(formula.boxOptions?.scoreLines || []) , { id: uuidv4(), position_mm: 0 }];
    handleNestedChange(['boxOptions', 'scoreLines'], next);
  };
  const updateScoreLine = (idx, value) => {
    const next = [...(formula.boxOptions?.scoreLines || [])];
    next[idx] = { ...next[idx], position_mm: value };
    handleNestedChange(['boxOptions', 'scoreLines'], next);
  };
  const removeScoreLine = (idx) => {
    const next = (formula.boxOptions?.scoreLines || []).filter((_, i) => i !== idx);
    handleNestedChange(['boxOptions', 'scoreLines'], next);
  };

  const addRule = () => handleFormulaChange('rules', [
    ...(formula.rules || []),
    { id: uuidv4(), condition: { field: 'quantity', operator: '>=', value: '' }, action: { type: '' } }
  ]);
  const removeRule = (id) => handleFormulaChange('rules', (formula.rules || []).filter((r) => r.id !== id));
  const handleRuleChange = (index, part, field, value) => handleNestedChange(['rules', index, part, field], value);

  const addTier = (type) => handleNestedChange(['tiers', type], [...(formula.tiers?.[type] || []), { id: uuidv4(), min: 0, max: 0, discountPct: 0 }]);
  const removeTier = (type, id) => handleNestedChange(['tiers', type], (formula.tiers?.[type] || []).filter((t) => t.id !== id));

  const addFinishingCost = () => handleFormulaChange('finishingCosts', [...(formula.finishingCosts || []), { id: uuidv4(), finishingId: '', type: 'per_piece', value: 0, setup: 0, minCharge: 0 }]);
  const removeFinishingCost = (id) => handleFormulaChange('finishingCosts', (formula.finishingCosts || []).filter((f) => f.id !== id));

  const addCustomerGroup = () => handleFormulaChange('customerGroups', [...(formula.customerGroups || []), { id: uuidv4(), code: '', marginPercentage: 0 }]);
  const removeCustomerGroup = (id) => handleFormulaChange('customerGroups', (formula.customerGroups || []).filter((g) => g.id !== id));

  const addInputField = () => handleFormulaChange('inputs', [...(formula.inputs || []), { id: uuidv4(), name: '', label: '', type: 'number' }]);
  const handleInputFieldChange = (index, field, value) => handleNestedChange(['inputs', index, field], value);
  const removeInputField = (id) => handleFormulaChange('inputs', (formula.inputs || []).filter((i) => i.id !== id));

  const openRulesByDefault = useMemo(() => justOpenedRef.current && (formula.rules?.length || 0) > 0, [formula.rules?.length]);

  return (
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-5xl">
        <h3 className="font-bold text-2xl">{template ? 'Sjabloon Bewerken' : 'Nieuw Sjabloon Maken'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Sjabloon Naam</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`input input-bordered ${errors.name ? 'input-error' : ''}`} placeholder="bv. Standaard Flyer" />
            {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Product Type</span></label>
            <select value={productType} onChange={(e) => setProductType(e.target.value)} className="select select-bordered">
              <option value="FLAT_PRINT">Plat Drukwerk</option>
              <option value="BOX">Doos</option>
              <option value="DISPLAY">Display</option>
              <option value="OTHER">Overig</option>
            </select>
          </div>
        </div>

        {productType === 'BOX' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm">Stansvorm (dieType)</span></label>
              <input type="text" value={formula.boxOptions?.dieType || ''} onChange={(e) => handleNestedChange(['boxOptions', 'dieType'], e.target.value)} className="input input-bordered input-sm" placeholder="bv. FEFCO 0201" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm">Kleptype (closureType)</span></label>
              <select value={formula.boxOptions?.closureType || ''} onChange={(e) => handleNestedChange(['boxOptions', 'closureType'], e.target.value)} className="select select-bordered select-sm">
                <option value="">Kies...</option>
                <option value="tuck_flap">Tuck flap</option>
                <option value="crash_lock">Crash lock</option>
                <option value="tape">Tape</option>
                <option value="other">Overig</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text text-sm">Rillijnen</span></label>
              <div className="space-y-2">
                {(formula.boxOptions?.scoreLines || []).map((line, idx) => (
                  <div key={line.id} className="flex items-center gap-2">
                    <input type="number" step="0.1" value={line.position_mm} onChange={(e) => updateScoreLine(idx, parseFloat(e.target.value))} className="input input-bordered input-sm w-28" placeholder="positie (mm)" />
                    <button type="button" onClick={() => removeScoreLine(idx)} className="btn btn-ghost btn-xs text-error"><TrashIcon /></button>
                  </div>
                ))}
                <button type="button" onClick={addScoreLine} className="btn btn-ghost btn-xs">+ Rillijn</button>
              </div>
            </div>
            {errors.boxOptions && <div className="md:col-span-3 alert alert-warning text-sm">{errors.boxOptions}</div>}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="collapse collapse-plus border rounded-lg">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold">Benodigde Invoervelden</div>
            <div className="collapse-content">
              <p className="text-sm opacity-70 mb-4">Definieer hier welke velden de gebruiker moet invullen op de offertepagina.</p>
              {errors.inputs && <div className="alert alert-warning mb-2 text-sm">{errors.inputs}</div>}
              {(formula.inputs || []).map((input, index) => (
                <div key={input.id} className="grid grid-cols-4 gap-2 items-end p-2 rounded mb-2">
                  <div className="form-control"><label className="label-text text-xs">Variabele Naam</label><input type="text" value={input.name} onChange={(e) => handleInputFieldChange(index, 'name', e.target.value)} className="input input-bordered input-sm" placeholder="bv. width_mm" /></div>
                  <div className="form-control"><label className="label-text text-xs">Label op Formulier</label><input type="text" value={input.label} onChange={(e) => handleInputFieldChange(index, 'label', e.target.value)} className="input input-bordered input-sm" placeholder="bv. Breedte (mm)" /></div>
                  <div className="form-control"><label className="label-text text-xs">Type Veld</label><select value={input.type} onChange={(e) => handleInputFieldChange(index, 'type', e.target.value)} className="select select-bordered select-sm"><option value="number">Getal</option><option value="text">Tekst</option><option value="db_material">Materiaal (uit DB)</option></select></div>
                  <button type="button" onClick={() => removeInputField(input.id)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                </div>
              ))}
              <button type="button" onClick={addInputField} className="btn btn-ghost btn-sm mt-2">+ Veld Toevoegen</button>
            </div>
          </div>

          <div className="collapse collapse-plus border rounded-lg">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold">Klantgroepen & Marges</div>
            <div className="collapse-content">
              {(formula.customerGroups || []).map((group, index) => (
                <div key={group.id} className="grid grid-cols-3 gap-2 items-end p-2 rounded bg-base-200 mb-2">
                  <div className="form-control"><label className="label-text text-xs">Code</label><input type="text" value={group.code || ''} onChange={(e) => handleNestedChange(['customerGroups', index, 'code'], e.target.value.toUpperCase())} placeholder="bv. RESELLER" className="input input-bordered input-sm" /></div>
                  <div className="form-control"><label className="label-text text-xs">Marge (%)</label><input type="number" value={group.marginPercentage || ''} onChange={(e) => handleNestedChange(['customerGroups', index, 'marginPercentage'], parseFloat(e.target.value))} placeholder="bv. 25" className="input input-bordered input-sm" /></div>
                  <button type="button" onClick={() => removeCustomerGroup(group.id)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                </div>
              ))}
              <button type="button" onClick={addCustomerGroup} className="btn btn-ghost btn-sm mt-2">+ Klantgroep</button>
            </div>
          </div>

          <div className="collapse collapse-plus border rounded-lg">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold">Staffels (Kortingen)</div>
            <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-2">Per Aantal</h5>
                {(formula.tiers?.quantity || []).map((tier, index) => (
                  <div key={tier.id} className="grid grid-cols-4 gap-2 items-end p-2 rounded bg-base-200 mb-2">
                    <div className="form-control col-span-1"><label className="label-text text-xs">Min. Aantal</label><input type="number" value={tier.min || ''} onChange={(e) => handleNestedChange(['tiers', 'quantity', index, 'min'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <div className="form-control col-span-1"><label className="label-text text-xs">Max. Aantal</label><input type="number" value={tier.max || ''} onChange={(e) => handleNestedChange(['tiers', 'quantity', index, 'max'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <div className="form-control col-span-1"><label className="label-text text-xs">Korting (%)</label><input type="number" value={tier.discountPct || ''} onChange={(e) => handleNestedChange(['tiers', 'quantity', index, 'discountPct'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <button type="button" onClick={() => removeTier('quantity', tier.id)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addTier('quantity')} className="btn btn-ghost btn-xs mt-1">+ Aantal Staffel</button>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Per m²</h5>
                {(formula.tiers?.area_m2 || []).map((tier, index) => (
                  <div key={tier.id} className="grid grid-cols-4 gap-2 items-end p-2 rounded bg-base-200 mb-2">
                    <div className="form-control col-span-1"><label className="label-text text-xs">Min. m²</label><input type="number" step="0.01" value={tier.min || ''} onChange={(e) => handleNestedChange(['tiers', 'area_m2', index, 'min'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <div className="form-control col-span-1"><label className="label-text text-xs">Max. m²</label><input type="number" step="0.01" value={tier.max || ''} onChange={(e) => handleNestedChange(['tiers', 'area_m2', index, 'max'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <div className="form-control col-span-1"><label className="label-text text-xs">Korting (%)</label><input type="number" value={tier.discountPct || ''} onChange={(e) => handleNestedChange(['tiers', 'area_m2', index, 'discountPct'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                    <button type="button" onClick={() => removeTier('area_m2', tier.id)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addTier('area_m2')} className="btn btn-ghost btn-xs mt-1">+ m² Staffel</button>
              </div>
            </div>
          </div>

          <div className="collapse collapse-plus border rounded-lg">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold">Afwerkingskosten</div>
            <div className="collapse-content">
              {(formula.finishingCosts || []).map((cost, index) => (
                <div key={cost.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-2 rounded bg-base-200 mb-2">
                  <div className="form-control col-span-2 md:col-span-1"><label className="label-text text-xs">Afwerking</label><select value={cost.finishingId} onChange={(e) => handleNestedChange(['finishingCosts', index, 'finishingId'], e.target.value)} className="select select-bordered select-sm"><option value="">Kies...</option>{availableFinishings.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
                  <div className="form-control col-span-1"><label className="label-text text-xs">Methode</label><select value={cost.type} onChange={(e) => handleNestedChange(['finishingCosts', index, 'type'], e.target.value)} className="select select-bordered select-sm"><option value="per_piece">per stuk</option><option value="per_m2">per m²</option><option value="fixed">vast bedrag</option></select></div>
                  <div className="form-control col-span-1"><label className="label-text text-xs">{cost.type === 'fixed' ? 'Vaste Prijs (€)' : 'Prijs per Eenheid (€)'}</label><input type="number" step="0.01" value={cost.value || ''} onChange={(e) => handleNestedChange(['finishingCosts', index, 'value'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                  <div className="form-control col-span-1"><label className="label-text text-xs">Opstartkosten (€)</label><input type="number" step="0.01" value={cost.setup || ''} onChange={(e) => handleNestedChange(['finishingCosts', index, 'setup'], parseFloat(e.target.value))} className="input input-bordered input-sm" /></div>
                  <button type="button" onClick={() => removeFinishingCost(cost.id)} className="btn btn-ghost btn-sm text-error self-center"><TrashIcon /></button>
                </div>
              ))}
              <button type="button" onClick={addFinishingCost} className="btn btn-ghost btn-sm mt-2">+ Afwerkingskost</button>
            </div>
          </div>

          <div className="collapse collapse-plus border rounded-lg">
            <input type="checkbox" defaultChecked={openRulesByDefault} />
            <div className="collapse-title text-lg font-semibold">Dynamische Productieregels (ALS... DAN...)</div>
            <div className="collapse-content space-y-2">
              {(formula.rules || []).map((rule, index) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-2 p-2 bg-base-200 rounded-lg">
                  <span className="font-mono">ALS</span>
                  <select value={rule.condition.field} onChange={(e) => handleRuleChange(index, 'condition', 'field', e.target.value)} className="select select-bordered select-sm">
                    {(() => {
                      const base = ['quantity', 'width_mm', 'height_mm', 'length_mm', 'depth_mm', 'thickness_mm'];
                      const dynamic = (formula.inputs || []).map(i => i.name).filter(Boolean);
                      const fields = Array.from(new Set([...base, ...dynamic]));
                      return fields.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ));
                    })()}
                  </select>
                  <select value={rule.condition.operator} onChange={(e) => handleRuleChange(index, 'condition', 'operator', e.target.value)} className="select select-bordered select-sm">
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="==">==</option>
                  </select>
                  <input type="number" value={rule.condition.value} onChange={(e) => handleRuleChange(index, 'condition', 'value', e.target.value)} className="input input-bordered input-sm w-24" />
                  <span className="font-mono">DAN</span>
                  <select value={rule.action.type} onChange={(e) => handleRuleChange(index, 'action', 'type', e.target.value)} className="select select-bordered select-sm">
                    <option value="">Kies Actie</option>
                    <option value="SET_MATERIAL">Kies Materiaal</option>
                    <option value="ADD_MACHINE">Voeg Productiemachine toe</option>
                    <option value="ADD_FINISHING_EQUIPMENT">Voeg Afwerkapparaat toe</option>
                    <option value="ADD_FINISHING">Voeg Handafwerking toe</option>
                    <option value="ADD_LABOR">Voeg Arbeid toe</option>
                    <option value="SET_MARGIN">Stel Marge In</option>
                  </select>

                  {rule.action.type === 'SET_MATERIAL' && (
                    <select value={rule.action.materialId} onChange={(e) => handleRuleChange(index, 'action', 'materialId', e.target.value)} className="select select-bordered select-sm">
                      <option value="">Kies Materiaal</option>
                      {availableMaterials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  )}
                  {rule.action.type === 'ADD_MACHINE' && (
                    <select value={rule.action.machineId} onChange={(e) => handleRuleChange(index, 'action', 'machineId', e.target.value)} className="select select-bordered select-sm">
                      <option value="">Kies Machine</option>
                      {availableMachines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  )}
                  {rule.action.type === 'ADD_FINISHING_EQUIPMENT' && (
                    <select value={rule.action.equipmentId} onChange={(e) => handleRuleChange(index, 'action', 'equipmentId', e.target.value)} className="select select-bordered select-sm">
                      <option value="">Kies Apparaat</option>
                      {availableEquipment.map((eq) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                    </select>
                  )}
                  {rule.action.type === 'ADD_FINISHING' && (
                    <select value={rule.action.finishingId} onChange={(e) => handleRuleChange(index, 'action', 'finishingId', e.target.value)} className="select select-bordered select-sm">
                      <option value="">Kies Afwerking</option>
                      {availableFinishings.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  )}

                  <button type="button" onClick={() => removeRule(rule.id)} className="btn btn-ghost btn-sm text-error ml-auto"><TrashIcon /></button>
                </div>
              ))}
              <button type="button" onClick={addRule} className="btn btn-ghost btn-sm mt-2">+ Regel Toevoegen</button>
            </div>
          </div>
        </div>
        <div className="modal-action mt-8">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSaving || isLoadingData}>Annuleren</button>
          <button type="button" onClick={handleSave} className="btn btn-primary" disabled={isSaving || isLoadingData}>{isSaving ? 'Opslaan...' : 'Sjabloon Opslaan'}</button>
        </div>
        {isLoadingData && <div className="mt-4 text-sm opacity-70">Gegevens laden…</div>}
      </div>
    </div>
  );
};

export default ProductTemplateModal;