import React, { useEffect, useRef } from 'react';
import { computeBlank, generateFefco0201Path } from '../components/BoxCatalog';
import ImpositionVisualizer from '../components/ImpositionVisualizer';

export const fmtEUR = (n) => (Number(n) || 0).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
export const isStaffelItem = (desc = '') => desc.toLowerCase().includes('staffelkorting');

export const InfoTip = ({ title, children }) => (
  <span className="inline-flex items-center gap-1">
    {children}
    <span className="tooltip tooltip-top" data-tip={title}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </span>
  </span>
);

export const PlaatsingOpVel = ({ line, calculationResult }) => {
  const material = calculationResult?.imposition?.material;
  if (!line || !material || !(material.width_mm || material.rollWidth_mm) ) { return ( <div className="text-sm text-gray-500 p-4 border rounded-lg bg-gray-50"> Selecteer een preset met een automatisch materiaal om een voorbeeld van de plaatsing te zien. </div> ); }
  const wrapRef = useRef(null);
  useEffect(() => { if (!wrapRef.current) return; const ro = new ResizeObserver(() => {}); ro.observe(wrapRef.current); return () => ro.disconnect(); }, []);
  const blankData = computeBlank('FEFCO_0201', { L: line.width_mm, W: line.depth_mm, H: line.height_mm, glue: line.glueFlap_mm, topF: line.topFlap_mm === '' ? null : line.topFlap_mm, botF: line.bottomFlap_mm === '' ? null : line.bottomFlap_mm, });
  const boxPath = generateFefco0201Path(blankData, 0);
  const blankW = blankData.blankW; const blankH = blankData.blankH;
  const sheetW = Number(material.width_mm || 0); const sheetH = Number(material.height_mm || 0);
  const gap = Number(line.gutter_mm) || 0; const margin = Number(line.margin_mm) || 0;
  const serverAcross = Number(calculationResult?.imposition?.across || 0); const serverDown   = Number(calculationResult?.imposition?.down   || 0);
  const useServerGrid = serverAcross > 0 && serverDown > 0;
  const slots = (total, item) => { const usable = Math.max(0, total - 2 * Math.max(0, margin) + Math.max(0, gap)); const step = item + Math.max(0, gap); return step > 0 ? Math.max(0, Math.floor(usable / step)) : 0; };
  let cols, rows, rotated;
  if (useServerGrid) { cols = serverAcross; rows = serverDown; rotated = !!calculationResult?.imposition?.rotated; } 
  else { const aCols = slots(sheetW, blankW); const aRows = slots(sheetH, blankH); const aCnt  = aCols * aRows; const bCols = slots(sheetW, blankH); const bRows = slots(sheetH, blankW); const bCnt  = bCols * bRows; if (bCnt > aCnt) { cols = bCols; rows = bRows; rotated = true; } else { cols = aCols; rows = aRows; rotated = false; } }
  const rectW = rotated ? blankH : blankW; const rectH = rotated ? blankW : blankH;
  const gridW = cols * rectW + Math.max(0, cols - 1) * gap; const gridH = rows * rectH + Math.max(0, rows - 1) * gap;
  const innerX = Math.max(0, margin); const innerY = Math.max(0, margin);
  const innerW = Math.max(0, sheetW - 2 * margin); const innerH = Math.max(0, sheetH - 2 * margin);
  const offsetX = innerX + (innerW - gridW) / 2; const offsetY = innerY + (innerH - gridH) / 2;
  const cells = [];
  for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { const x = offsetX + c * (rectW + gap); const y = offsetY + r * (rectH + gap); cells.push({ x, y }); } }
  return ( <div ref={wrapRef} className="space-y-2 w-full"><div className="text-sm"><div><strong>Vel:</strong> {sheetW} × {sheetH} mm</div><div><strong>Uitslag:</strong> {Math.round(blankW)} × {Math.round(blankH)} mm {rotated ? '(gedraaid 90°)' : ''}</div><div><strong>Aantal per vel:</strong> {cols * rows} (grid {cols} × {rows})</div></div><svg viewBox={`0 0 ${sheetW} ${sheetH}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', border: '1px solid #ccc', background: '#fff', display: 'block' }}><rect x="0" y="0" width={sheetW} height={sheetH} fill="none" stroke="#d1d5db" strokeDasharray="4 3" />{margin > 0 && ( <rect x={innerX} y={innerY} width={innerW} height={innerH} fill="none" stroke="#9ca3af" strokeDasharray="6 4" />)}{cells.map((p, i) => ( rotated ? ( <g key={i} transform={`translate(${p.x}, ${p.y}) rotate(90) translate(0 ${-blankW})`}><path d={boxPath} fill="#e6f2ff" stroke="#4a90e2" strokeWidth={0.6} /></g>) : ( <g key={i} transform={`translate(${p.x}, ${p.y})`}><path d={boxPath} fill="#e6f2ff" stroke="#4a90e2" strokeWidth={0.6} /></g>) ))}</svg></div>);
};

export const computeBoxMetrics = ({ width_mm, height_mm, depth_mm }) => { const w = Number(width_mm || 0); const h = Number(height_mm || 0); const d = Number(depth_mm || 0); const area2D_m2 = (w/1000) * (h/1000); const surface_m2 = (w>0 && h>0 && d>0) ? (2*(w*h + w*d + h*d))/1e6 : 0; const volume_m3  = (w>0 && h>0 && d>0) ? (w*h*d)/1e9 : 0; return { area2D_m2, surface_m2, volume_m3 }; };