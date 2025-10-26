import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImpositionVisualizer from '@/components/ImpositionVisualizer';

const CalculationResultPanel = ({
  calculationResult,
  isCalculating,
  isSaving,
  handleRunCalculation,
  handleSaveQuote,
  isDisabled,
  savedQuoteId,
  isEditMode = false, 
}) => {
  const navigate = useNavigate();
  
  const [hasRecentCalculation, setHasRecentCalculation] = useState(!isEditMode);

  useEffect(() => {
    setHasRecentCalculation(!isEditMode);
  }, [calculationResult, isEditMode]);

  const lines = calculationResult?.lines || [];
  const grandTotals = calculationResult?.grandTotals;
  const grandTotal = grandTotals?.total || 0;
  
  const canSave = grandTotal > 0 && !isCalculating && (isEditMode ? hasRecentCalculation : true);

  const firstLine = lines[0];
  const firstLineImposition = firstLine?.calculationDetails?.imposition;
  const firstLineMaterial = firstLineImposition?.material;
  const productType = firstLine && Number(firstLine.length_mm) > 0 ? 'BOX' : 'FLAT_PRINT';
  const productDimensions = {
      L_mm: firstLine?.length_mm,
      W_mm: firstLine?.width_mm,
      H_mm: firstLine?.height_mm,
  };

  const handleRunCalculationWrapper = async () => {
    await handleRunCalculation();
    if (isEditMode) {
      setHasRecentCalculation(true); 
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl space-y-4 sticky top-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Totaalprijs</h2>
        <p className="text-4xl font-bold text-primary">
          {isCalculating ? '...' : `€ ${Number(grandTotal).toFixed(2)}`}
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">Specificatie</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
          {isCalculating && <p className="text-sm text-gray-500">Aan het berekenen...</p>}
          {!isCalculating && lines.length === 0 && <p className="text-sm text-gray-500">Nog geen berekening uitgevoerd.</p>}
          
          {lines.map((line, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center font-bold text-sm">
                    <span>Regel {index + 1}: {line.resolved?.template?.name || 'Product'}</span>
                    <span>€ {Number(line.pricing?.total || 0).toFixed(2)}</span>
                </div>
                {/* --- START WIJZIGING: Code voor stappen en specs teruggeplaatst --- */}
                <ul className="mt-1 space-y-1">
                    {line.calculationDetails?.steps.map((step, stepIndex) => (
                         <li key={stepIndex} className="flex justify-between items-start text-xs text-gray-600">
                            <div className="pr-2">
                                <p className="font-medium">{step.description}</p>
                                {step.specs && <p className="text-gray-500 italic">{step.specs}</p>}
                            </div>
                            <span className="font-medium whitespace-nowrap">€ {Number(step.cost).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                {/* --- EINDE WIJZIGING --- */}
            </div>
          ))}

          {!isCalculating && grandTotals && Number(grandTotals.shipping) > 0 && (
            <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex justify-between items-center font-bold text-sm text-blue-800">
                    <span>Verzendkosten</span>
                    <span>€ {Number(grandTotals.shipping).toFixed(2)}</span>
                </div>
            </div>
          )}

        </div>
      </div>
      
      {firstLineImposition && (
        <div className="space-y-2 pt-4 border-t">
            <h3 className="font-semibold text-gray-700">Visuele Uitslag (Regel 1)</h3>
            <ImpositionVisualizer 
                imposition={firstLineImposition} 
                material={firstLineMaterial}
                productType={productType}
                productDimensions={productDimensions}
            />
        </div>
      )}

      <div className="pt-4 border-t space-y-2">
        {(savedQuoteId && !isEditMode) ? (
            <div className="space-y-2">
                 <button onClick={() => navigate(`/direct-quote-details/${savedQuoteId}`)} className="btn btn-success w-full">
                    ✓ Opgeslagen! Bekijk Details
                </button>
                 <button onClick={() => window.location.reload()} className="btn btn-ghost w-full">
                    Nieuwe Offerte Maken
                </button>
            </div>
        ) : (
            <>
              <button 
                onClick={handleRunCalculationWrapper} 
                disabled={isDisabled || isCalculating} 
                className="btn btn-primary w-full"
              >
                {isCalculating ? 'Berekenen...' : (isEditMode ? 'Herbereken Offerte' : 'Prijs Berekenen')}
              </button>
              
              <button 
                onClick={handleSaveQuote} 
                disabled={!canSave || isSaving} 
                className={`btn w-full ${!canSave ? 'btn-disabled' : 'btn-secondary'}`}
              >
                {isSaving ? 'Opslaan...' : (isEditMode ? 'Wijzigingen Opslaan' : 'Offerte Opslaan')}
              </button>
            </>
        )}
      </div>
    </div>
  );
};

export default CalculationResultPanel;