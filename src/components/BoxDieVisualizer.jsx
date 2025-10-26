import React from 'react';

export default function BoxDieVisualizer({ 
  boxData, 
  colorCut = '#D62828', 
  colorCrease = '#003049', 
  colorSheet = '#F7F7F7' 
}) {
  const geometry = boxData?.geometry;
  const blank = boxData?.blank;

  if (!geometry || !blank) {
    return (
      <div className="w-full h-full border rounded p-4 text-center text-sm text-gray-500 bg-gray-50 flex items-center justify-center">
        <span>Wacht op berekening voor uitslag...</span>
      </div>
    );
  }

  // --- START VAN DE FIX ---
  // We lezen de 'width' en 'height' properties uit het 'blank' object
  // en hernoemen ze direct naar 'blankW' en 'blankH' voor de rest van de component.
  const { width: blankW, height: blankH } = blank;
  // --- EINDE VAN DE FIX ---
  
  const { cuts, creases } = geometry;
  const padding = 20;

  // Voorkom NaN fouten als de waardes nog niet correct zijn
  if (isNaN(blankW) || isNaN(blankH) || blankW <= 0 || blankH <= 0) {
      return (
          <div className="w-full h-full border rounded p-4 text-center text-sm text-red-500 bg-red-50 flex items-center justify-center">
              <span>Ongeldige afmetingen voor uitslag.</span>
          </div>
      );
  }

  return (
    <div className="w-full">
      <div className="text-xs mb-1 opacity-80">Uitslag • {Math.round(blankW)}×{Math.round(blankH)} mm</div>
      <div className="border rounded bg-white overflow-hidden">
        <svg viewBox={`${-padding} ${-padding} ${blankW + 2 * padding} ${blankH + 2 * padding}`} 
             style={{ width: '100%', height: 'auto', display: 'block' }}>
          
          <rect x={-padding} y={-padding} width={blankW + 2 * padding} height={blankH + 2 * padding} fill={colorSheet} />
          
          {creases && creases.map((line, i) => (
            <path key={`crease-${i}`} d={line.path} stroke={colorCrease} strokeWidth="1" strokeDasharray="5 3" fill="none" />
          ))}

          {cuts && cuts.map((line, i) => (
            <path key={`cut-${i}`} d={line.path} stroke={colorCut} strokeWidth="1.5" fill="none" />
          ))}
        </svg>
      </div>
    </div>
  );
}