import React, { useMemo } from "react";
import { computeBlank, generateFefco0201Path } from './BoxUtils';

const toNum = (v, d = 0) => {
  if (typeof v === "string") v = v.replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);

const Badge = ({ children }) => (
  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
    {children}
  </span>
);

export default function ImpositionVisualizer({
  imposition = {},
  material = {},
  productType,
  productDimensions = {},
}) {
  const across = Math.max(1, toNum(pick(imposition.layout?.across, 1)));
  const down = Math.max(1, toNum(pick(imposition.layout?.down, 1)));
  const gutterMM = Math.max(0, toNum(pick(imposition.gutter_mm, 0)));
  const marginMM = Math.max(0, toNum(pick(imposition.margin_mm, 0)));

  const itemW = imposition.rotated ? imposition.blank?.height : imposition.blank?.width;
  const itemH = imposition.rotated ? imposition.blank?.width : imposition.blank?.height;

  const isSheet = material.type === 'SHEET';
  const sheetWmm = toNum(pick(material.sheetWidth_mm, material.rollWidth_mm), 0);
  const sheetHmm = isSheet ? toNum(material.sheetHeight_mm, 0) : Math.max(sheetWmm * 1.5, toNum(itemH) * 2);

  const boxGeometry = useMemo(() => {
    if (productType !== 'BOX' || !productDimensions.L_mm) return null;
    try {
      const blankData = computeBlank('FEFCO_0201', {
        L: productDimensions.L_mm,
        W: productDimensions.W_mm,
        H: productDimensions.H_mm
      });
      return {
        path: generateFefco0201Path(blankData),
        blank: blankData
      };
    } catch { return null; }
  }, [productType, productDimensions.L_mm, productDimensions.W_mm, productDimensions.H_mm]);

  if (sheetWmm <= 0) {
    return <div className="text-center text-xs text-gray-400 p-2">Wacht op selectie van materiaal...</div>;
  }
  
  const gridW = (across * itemW) + Math.max(0, across - 1) * gutterMM;
  const gridH = (down * itemH) + Math.max(0, down - 1) * gutterMM;
  
  const availableW = sheetWmm - 2 * marginMM;
  const availableH = sheetHmm - 2 * marginMM;
  
  const offsetX = marginMM + (availableW - gridW) / 2;
  const offsetY = marginMM + (availableH - gridH) / 2;

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="text-sm text-slate-700">
          Uitslag: <span className="font-semibold">{across} × {down}</span> op {isSheet ? `Vel ${Math.round(sheetWmm)} × ${Math.round(sheetHmm)} mm` : `Rol ${Math.round(sheetWmm)} mm`}
        </div>
        {imposition.sheets && <Badge>Totaal: {imposition.sheets} vellen</Badge>}
        <Badge>Margin {marginMM} mm</Badge>
        <Badge>Gutter {gutterMM} mm</Badge>
      </div>
      
      <div className="w-full bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <svg viewBox={`0 0 ${sheetWmm} ${sheetHmm}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="0.5" y="0.5" width={sheetWmm-1} height={sheetHmm-1} fill="white" stroke="#E2E8F0" />
          {marginMM > 0 && <rect x={marginMM} y={marginMM} width={availableW} height={availableH} fill="none" stroke="#E2E8F0" strokeDasharray="4 2" />}
          
          {Array.from({ length: down }).map((_, r) =>
            Array.from({ length: across }).map((__, c) => {
              const x = offsetX + c * (itemW + gutterMM);
              const y = offsetY + r * (itemH + gutterMM);

              return (
                <g key={`cell-${r}-${c}`} transform={`translate(${x}, ${y})`}>
                  {productType === 'BOX' && boxGeometry ? (
                     <g transform={`scale(${itemW / boxGeometry.blank.blankW}, ${itemH / boxGeometry.blank.blankH})`}>
                        <path d={boxGeometry.path.cuts} stroke="#D62828" strokeWidth="2" fill="#FEFBF6" />
                        <path d={boxGeometry.path.creases} stroke="#003049" strokeWidth="1" strokeDasharray="4 2" fill="none" />
                     </g>
                  ) : (
                    <>
                      <rect x="0" y="0" width={itemW} height={itemH} fill="#F8FAFC" stroke="#CBD5E1" rx="2" />
                      <line x1="2" y1="2" x2={itemW - 2} y2={itemH - 2} stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="2" y1={itemH - 2} x2={itemW - 2} y2="2" stroke="#E2E8F0" strokeWidth="1" />
                    </>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}