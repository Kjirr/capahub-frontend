import React from 'react';

export default function ImpositionViewer({ imposition }) {
  if (!imposition || !imposition.material || !imposition.blank || !imposition.geometry) {
    return (
      <div className="w-full border rounded p-4 text-center text-sm text-gray-500 bg-gray-50">
        Wacht op berekening voor velindeling...
      </div>
    );
  }

  const { material, blank, geometry, across, down, rotated } = imposition;
  const { cuts, creases } = geometry;
  
  const sheetW = material.sheetWidth_mm;
  const sheetH = material.sheetHeight_mm;
  
  const itemW = rotated ? blank.blankH : blank.blankW;
  const itemH = rotated ? blank.blankW : blank.blankH;

  const cells = [];
  // Bereken de positie van elke uitslag in het raster
  for (let r = 0; r < down; r++) {
    for (let c = 0; c < across; c++) {
      cells.push({ x: c * itemW, y: r * itemH });
    }
  }

  // Creëer een herbruikbaar SVG-symbool van de uitslag
  const DieLineSymbol = (
    <g id="dielineSymbol">
      {creases.map((line, i) => (
        <path key={`crease-${i}`} d={line.path} stroke="#0047ff" strokeWidth="0.5" strokeDasharray="3 2" fill="none" />
      ))}
      {cuts.map((line, i) => (
        <path key={`cut-${i}`} d={line.path} stroke="#D62828" strokeWidth="1" fill="none" />
      ))}
    </g>
  );

  return (
    <div className="w-full">
      <div className="border rounded bg-white overflow-hidden">
        <svg viewBox={`0 0 ${sheetW} ${sheetH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <rect x="0" y="0" width={sheetW} height={sheetH} fill="#F7F7F7" stroke="#E5E7EB" strokeWidth="1"/>
          <defs>{DieLineSymbol}</defs>

          {/* Teken voor elke cel-positie een kopie van de uitslag */}
          {cells.map((cell, i) => (
            <use 
              key={i} 
              href="#dielineSymbol" 
              x={cell.x} 
              y={cell.y}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};