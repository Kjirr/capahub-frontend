import React, { useState, useEffect } from 'react';
// GEWIJZIGD: Importeer de nieuwe, specifieke functies
import { createMachine, updateMachine } from '@/api';

const initialMachineState = {
  name: '',
  type: '', // Lege string als startwaarde voor de dropdown
  capabilities: '',
  specifications: {
    maxSheetW_mm: '',
    maxSheetH_mm: '',
    maxResolution_dpi: '',
  },
  costingProfile: {
    costPerHour: '',
    setupMinutes: '',
    runSpeedPerHour: '',
    costingMethod: 'PER_ITEM',
  },
};

const MachineModal = ({ isOpen, onClose, onSave, showNotification, machine }) => {
  const [machineData, setMachineData] = useState(initialMachineState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (machine) {
        setMachineData({
          name: machine.name || '',
          type: machine.type || '',
          capabilities: Array.isArray(machine.capabilities) ? machine.capabilities.join(', ') : '',
          specifications: {
            maxSheetW_mm: machine.specifications?.maxSheetW_mm || '',
            maxSheetH_mm: machine.specifications?.maxSheetH_mm || '',
            maxResolution_dpi: machine.specifications?.maxResolution_dpi || '',
          },
          costingProfile: {
            costPerHour: machine.costingProfile?.costPerHour || '',
            setupMinutes: machine.costingProfile?.setupMinutes || '',
            runSpeedPerHour: machine.costingProfile?.runSpeedPerHour || '',
            costingMethod: machine.costingProfile?.costingMethod || 'PER_ITEM',
          },
        });
      } else {
        setMachineData(initialMachineState);
      }
    }
  }, [isOpen, machine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.');
      setMachineData(prev => ({
        ...prev,
        [outerKey]: { ...prev[outerKey], [innerKey]: value },
      }));
    } else {
      setMachineData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      ...machineData,
      capabilities: machineData.capabilities.split(',').map(s => s.trim()).filter(Boolean),
      specifications: {
        maxSheetW_mm: Number(machineData.specifications.maxSheetW_mm) || null,
        maxSheetH_mm: Number(machineData.specifications.maxSheetH_mm) || null,
        maxResolution_dpi: Number(machineData.specifications.maxResolution_dpi) || null,
      },
      costingProfile: {
        costPerHour: Number(machineData.costingProfile.costPerHour) || null,
        setupMinutes: Number(machineData.costingProfile.setupMinutes) || null,
        runSpeedPerHour: Number(machineData.costingProfile.runSpeedPerHour) || null,
        costingMethod: machineData.costingProfile.costingMethod,
      },
    };

    try {
      if (machine?.id) {
        // GEWIJZIGD: Gebruik de update functie
        await updateMachine(machine.id, payload);
      } else {
        // GEWIJZIGD: Gebruik de create functie
        await createMachine(payload);
      }
      showNotification(`Machine succesvol ${machine?.id ? 'bijgewerkt' : 'aangemaakt'}.`, 'success');
      onSave?.();
      handleClose();
    } catch (err) {
      showNotification(err.message || 'Er ging iets mis bij opslaan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg">{machine ? 'Machine bewerken' : 'Nieuwe machine'}</h3>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Naam *</span></label>
              <input name="name" value={machineData.name} onChange={handleChange} required className="input input-bordered" placeholder="Bijv. HP Indigo 7900" />
            </div>
            
            <div className="form-control">
              <label className="label"><span className="label-text">Type *</span></label>
              <select name="type" value={machineData.type} onChange={handleChange} className="select select-bordered" required>
                <option value="" disabled>Kies een type...</option>
                <option value="DIGITAL_PRESS">Digitale Pers</option>
                <option value="OFFSET_PRESS">Offset Pers</option>
                <option value="WIDE_FORMAT_PRINTER">Grootformaat Printer</option>
                <option value="SCREEN_PRESS">Zeefdrukpers</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Capabilities (komma-gescheiden)</span></label>
            <input name="capabilities" value={machineData.capabilities} onChange={handleChange} className="input input-bordered" placeholder="duplex, neon-inkt, warmbuigen"/>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Technische Specificaties</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control"><label className="label"><span className="label-text">Max. velbreedte (mm)</span></label><input name="specifications.maxSheetW_mm" value={machineData.specifications.maxSheetW_mm} onChange={handleChange} type="number" className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Max. velhoogte (mm)</span></label><input name="specifications.maxSheetH_mm" value={machineData.specifications.maxSheetH_mm} onChange={handleChange} type="number" className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Max. resolutie (DPI)</span></label><input name="specifications.maxResolution_dpi" value={machineData.specifications.maxResolution_dpi} onChange={handleChange} type="number" className="input input-bordered" /></div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Kosten & Snelheid</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control"><label className="label"><span className="label-text">Kosten per uur (€)</span></label><input name="costingProfile.costPerHour" value={machineData.costingProfile.costPerHour} onChange={handleChange} type="number" step="0.01" className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Insteltijd (minuten)</span></label><input name="costingProfile.setupMinutes" value={machineData.costingProfile.setupMinutes} onChange={handleChange} type="number" className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Draaisnelheid (per uur)</span></label><input name="costingProfile.runSpeedPerHour" value={machineData.costingProfile.runSpeedPerHour} onChange={handleChange} type="number" className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Snelheid is gebaseerd op</span></label><select name="costingProfile.costingMethod" value={machineData.costingProfile.costingMethod} onChange={handleChange} className="select select-bordered"><option value="PER_ITEM">Aantal stuks (vellen/producten)</option><option value="PER_SQUARE_METER">Vierkante meters (m²)</option></select></div>
            </div>
          </div>

          <div className="modal-action pt-4">
            <button type="button" className="btn btn-ghost" onClick={handleClose} disabled={isSubmitting}>Annuleren</button>
            <button type="submit" className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>{machine ? 'Wijzigingen Opslaan' : 'Machine Aanmaken'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineModal;