// VisualizerCard.jsx
import React, { useMemo } from 'react';
import Box3DViewer from '../../components/Box3DViewer';
import ImpositionVisualizer from '../../components/ImpositionVisualizer';
import { computeBlank, generateFefco0201Path } from '../../components/BoxCatalog';

/* ========= Helpers ========= */
// Robuust getal: accepteert "2150mm", "2.150,5" etc.
const asNum = (v, d = 0) => {
  if (typeof v === 'string') {
    v = v.replace(',', '.').replace(/[^0-9.+-]/g, '');
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// Normaliseer waar de impositie in de response staat
// Ondersteunt: lines[0].calculationDetails.imposition  of  lines[0].impositions[0]  of  calculationResult.imposition
const normalizeImposition = (calculationResult) => {
  const firstLine = calculationResult?.lines?.[0];
  return (
    firstLine?.calculationDetails?.imposition ||
    firstLine?.impositions?.[0] ||
    calculationResult?.imposition ||
    null
  );
};

// Normaliseer lijst van plaatsingen (optioneel)
const getPlacements = (imp) => {
  if (!imp) return null;
  if (Array.isArray(imp.placements) && imp.placements.length) return imp.placements;
  if (Array.isArray(imp.positions) && imp.positions.length) return imp.positions;
  if (Array.isArray(imp.layout?.placements) && imp.layout.placements.length) return imp.layout.placements;
  return null;
};

/* ========= 2D op-vel weergave voor BOX ========= */
const PlaatsingOpVel = ({ line, imposition }) => {
  const material = imposition?.material;

  // ❗️Belangrijk: accepteer beide veldnamen voor velformaat
  const sheetW = asNum(material?.sheetWidth_mm ?? material?.width_mm);
  const sheetH = asNum(material?.sheetHeight_mm ?? material?.height_mm);

  if (!sheetW || !sheetH) {
    return (
      <div className="text-sm text-gray-700 p-4 border rounded-lg bg-yellow-50">
        Geen geldig vel-formaat in impositie. Zet <code>imposition.material.sheetWidth_mm</code> en <code>.sheetHeight_mm</code>
        {' '}of gebruik <code>width_mm/height_mm</code>.
      </div>
    );
  }

  // Placements indien aanwezig (server side posities)
  const placements = getPlacements(imposition);

  // Bepaal blank uit: imposition.blank -> placements[0] -> computeBlank(0201)
  const blankFromImpW = asNum(imposition?.blank?.blankW);
  const blankFromImpH = asNum(imposition?.blank?.blankH);
  const firstPlacementW = asNum(placements?.[0]?.w);
  const firstPlacementH = asNum(placements?.[0]?.h);

  const computedBlank = computeBlank('FEFCO_0201', {
    L: asNum(line?.width_mm),
    W: asNum(line?.depth_mm),
    H: asNum(line?.height_mm),
  });

  // Kies de beste bron per maat
  const baseBlankW0 = blankFromImpW || firstPlacementW || asNum(computedBlank?.blankW);
  const baseBlankH0 = blankFromImpH || firstPlacementH || asNum(computedBlank?.blankH);

  // Als we nog steeds niets hebben, toon duidelijke melding
  if (!baseBlankW0 || !baseBlankH0) {
    return (
      <div className="text-sm text-gray-700 p-4 border rounded-lg bg-yellow-50 space-y-1">
        <div><strong>Geen productuitslag gevonden.</strong></div>
        <div>Lever één van onderstaande aan:</div>
        <ul className="list-disc list-inside text-xs">
          <li><code>imposition.blank.blankW</code> en <code>blankH</code> (mm)</li>
          <li>of plaatsingen met <code>w/h</code> in <code>imposition.placements</code>/<code>positions</code></li>
          <li>of (voor BOX) vul <code>width_mm</code>, <code>depth_mm</code>, <code>height_mm</code> in</li>
        </ul>
      </div>
    );
  }

  const sheetRotatedFlag = !!imposition?.rotated;
  const baseBlankW = sheetRotatedFlag ? baseBlankH0 : baseBlankW0;
  const baseBlankH = sheetRotatedFlag ? baseBlankW0 : baseBlankH0;

  // Cells samenstellen
  let cells = [];
  if (placements && placements.length) {
    cells = placements.map((p) => ({
      x: asNum(p.x, 0),
      y: asNum(p.y, 0),
      w: asNum(p.w, baseBlankW),
      h: asNum(p.h, baseBlankH),
      rotated: !!p.rotated,
    }));
  } else {
    const across = asNum(imposition?.across);
    const down = asNum(imposition?.down);
    const up = asNum(imposition?.up);

    // === Auto-rotate fallback vóór we een fout tonen ===
    let bW = baseBlankW;
    let bH = baseBlankH;
    let sheetRotated = sheetRotatedFlag;

    const fitsNow = bW > 0 && bH > 0 && bW <= sheetW && bH <= sheetH;
    const altBW = baseBlankH0; // 90°
    const altBH = baseBlankW0;
    const fitsRot = altBW > 0 && altBH > 0 && altBW <= sheetW && altBH <= sheetH;

    if (!fitsNow && fitsRot) {
      // probeer 90° draaien
      bW = altBW;
      bH = altBH;
      sheetRotated = !sheetRotated;
    }

    // Guards
    if (bW <= 0 || bH <= 0 || bW > sheetW || bH > sheetH) {
      return (
        <div className="text-sm text-error p-4 border rounded-lg bg-red-50">
          Product/uitslag ({Math.round(bW)}×{Math.round(bH)} mm) past niet op het geselecteerde vel {Math.round(sheetW)}×{Math.round(sheetH)} mm.
          Kies een groter vel of pas de doos/kleppen aan.
        </div>
      );
    }

    const cols = across > 0 ? across : Math.max(1, Math.floor(sheetW / bW));
    const targetUp = up > 0 ? up : cols; // minstens 1 rij
    const rows = down > 0 ? down : Math.max(1, Math.ceil(targetUp / cols));
    const gap = 0; // TODO: marges/gutters

    const gridW = cols * bW + Math.max(0, cols - 1) * gap;
    const gridH = rows * bH + Math.max(0, rows - 1) * gap;
    const offsetX = Math.max(0, (sheetW - gridW) / 2);
    const offsetY = Math.max(0, (sheetH - gridH) / 2);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const placedCount = r * cols + c;
        if (up > 0 && placedCount >= up) break;
        cells.push({ x: offsetX + c * (bW + gap), y: offsetY + r * (bH + gap), w: bW, h: bH, rotated: false });
      }
    }
  }

  // We proberen altijd de echte 0201-vorm te tekenen als we die kunnen berekenen; anders rechthoek.
  const canDrawShape = asNum(computedBlank?.blankW) > 0 && asNum(computedBlank?.blankH) > 0;
  const boxPath = canDrawShape ? generateFefco0201Path(computedBlank, 0) : null;

  return (
    <div className="space-y-2 w-full">
      <div className="text-sm">
        <div><strong>Vel:</strong> {Math.round(sheetW)} × {Math.round(sheetH)} mm</div>
        <div><strong>Uitslag:</strong> {Math.round(baseBlankW0)} × {Math.round(baseBlankH0)} mm {sheetRotatedFlag ? '(90° gedraaid)' : ''}</div>
        <div><strong>Aantal p/vel (preview):</strong> {cells.length}</div>
      </div>

      <svg viewBox={`0 0 ${sheetW} ${sheetH}`} className="w-full h-auto border bg-white block" aria-label="2D impositie">
        {/* velkader */}
        <rect x={0} y={0} width={sheetW} height={sheetH} fill="none" stroke="#cbd5e1"
              strokeWidth={Math.max(0.3, Math.min(sheetW, sheetH) * 0.002)} />

        {cells.map((p, i) => {
          const cx = p.x + p.w / 2;
          const cy = p.y + p.h / 2;
          const rot = p.rotated ? 90 : 0;

          if (canDrawShape && boxPath) {
            const sx = p.w / baseBlankW0;
            const sy = p.h / baseBlankH0;
            const tx = p.x;
            const ty = p.y;
            return (
              <g key={i}
                 transform={`translate(${tx} ${ty}) ${rot ? `rotate(${rot} ${p.w / 2} ${p.h / 2})` : ''} scale(${sx} ${sy})`}>
                <path d={boxPath} fill="#e6f2ff" stroke="#4a90e2" strokeWidth={0.6 / Math.max(sx, sy)} />
                <text x={(baseBlankW0 * 0.01)} y={(baseBlankH0 * 0.06)}
                      fontSize={Math.max(6 / Math.max(sx, sy), 6)} fill="#334155">{i + 1}</text>
              </g>
            );
          }

          return (
            <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="#f1f5f9" stroke="#334155"
                    strokeWidth={0.6} rx={Math.min(p.w, p.h) * 0.02} ry={Math.min(p.w, p.h) * 0.02} />
              <text x={p.x + 2} y={p.y + 8}
                    fontSize={Math.max(6, Math.min(p.w, p.h) * 0.12)} fill="#334155">{i + 1}</text>
            </g>
          );
        })}
      </svg>

      <div className="text-[11px] text-gray-500">
        {placements && placements.length
          ? 'Weergave op aangeleverde posities.'
          : 'Auto-grid préview. Lever placements voor exact beeld.'}
      </div>
    </div>
  );
};

/* ========= Hoofdcomponent ========= */
const VisualizerCard = ({ selectedTemplate, calculationResult, formValues }) => {
  const isBox = selectedTemplate?.productType === 'BOX';
  const imposition = normalizeImposition(calculationResult);

  const boxMetrics = useMemo(() => {
    const w = asNum(formValues?.width_mm);
    const h = asNum(formValues?.height_mm);
    const d = asNum(formValues?.depth_mm);
    const surface_m2 = w > 0 && h > 0 && d > 0 ? (2 * (w * h + w * d + h * d)) / 1e6 : 0;
    const volume_m3 = w > 0 && h > 0 && d > 0 ? (w * h * d) / 1e9 : 0;
    return { surface_m2, volume_m3 };
  }, [formValues?.width_mm, formValues?.height_mm, formValues?.depth_mm]);

  const renderContent = () => {
    if (!selectedTemplate) {
      return <div className="text-sm text-gray-500">Kies een product om de visualisatie te zien.</div>;
    }

    if (!calculationResult || calculationResult?.error) {
      return <div className="text-sm text-gray-500">Klik op 'Berekenen' voor een visuele weergave.</div>;
    }

    if (!imposition) {
      return (
        <div className="text-sm text-gray-500 p-4 border rounded-lg bg-gray-50">
          Geen impositie ontvangen. Controleer of de backend <code>calculationDetails.imposition</code> of <code>impositions[0]</code> meestuurt.
        </div>
      );
    }

    // BOX => interne 2D uitslag op vel (dus níet ImpositionVisualizer)
    if (isBox) {
      return <PlaatsingOpVel line={formValues} imposition={imposition} />;
    }

    // Niet-BOX => algemene ImpositionVisualizer
    return (
      <ImpositionVisualizer
        imposition={imposition}
        material={imposition?.material}
        totalQuantity={asNum(formValues?.quantity)}
      />
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full space-y-4">
      <h3 className="font-semibold">Visualisatie</h3>

      {isBox && (
        <>
          <Box3DViewer
            L_mm={asNum(formValues?.width_mm)}
            W_mm={asNum(formValues?.depth_mm)}
            H_mm={asNum(formValues?.height_mm)}
          />
          <div className="mt-2 p-2 rounded bg-base-100 border text-xs grid grid-cols-2 gap-2">
            <div>Doos-oppervlak: <span className="badge badge-ghost">{boxMetrics.surface_m2.toFixed(4)} m²</span></div>
            <div>Volume: <span className="badge badge-ghost">{boxMetrics.volume_m3.toFixed(6)} m³</span></div>
          </div>
          <div className="divider my-2" />
        </>
      )}

      <div className="pt-2">
        <h4 className="font-semibold mb-3">{isBox ? '2D Uitslag op Vel' : 'Visuele Velindeling'}</h4>
        {renderContent()}
      </div>
    </div>
  );
};

export default VisualizerCard;
