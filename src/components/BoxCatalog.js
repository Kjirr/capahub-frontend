// src/components/BoxCatalog.js

export const BOX_MODELS = [
  { id: 'FEFCO_0201', label: 'FEFCO 0201 (RSC standaard)' },
];

const N = (v, d=0) => Math.max(0, Number(v ?? d) || 0);

export function computeBlank(model, { L, W, H, glue, topF, botF }) {
  const _L = N(L);
  const _W = N(W);
  const _H = N(H);
  const _glue = N(glue, 30);
  const _topF = N(topF, _W / 2);
  const _botF = N(botF, _W / 2);

  if (model === 'FEFCO_0201') {
    const panels = [
      { width: _glue, type: 'glue' }, { width: _L, type: 'L' },
      { width: _W, type: 'W' }, { width: _L, type: 'L' }, { width: _W, type: 'W' },
    ];
    const blankW = panels.reduce((acc, p) => acc + p.width, 0);
    const blankH = _H + _topF + _botF;
    const yCreaseTop = _topF;
    const yCreaseBottom = _topF + _H;
    
    return { blankW, blankH, panels, yCreaseTop, yCreaseBottom, topF: _topF, H: _H, botF: _botF };
  }
  
  return { blankW:0, blankH:0, panels:[], yCreaseTop:null, yCreaseBottom:null, topF:0, H:0, botF:0 };
}

export function panelCutsX(panels) {
  const xs = [];
  let acc = 0;
  for (let i = 0; i < panels.length - 1; i++){ 
    acc += panels[i].width; 
    xs.push(acc); 
  }
  return xs;
}

export const generateFefco0201Path = (data, padding = 0) => {
  const { panels, topF, H, botF } = data;
  if (!panels || panels.length < 5) return "";

  const p = padding;
  const y0 = p;
  const y1 = p + topF;
  const y2 = p + topF + H;
  const y3 = p + topF + H + botF;

  const x_coords = panels.reduce((acc, panel) => {
    acc.push(acc[acc.length - 1] + panel.width);
    return acc;
  }, [p]);
  
  const [x0, x1, x2, x3, x4, x5] = x_coords;

  const path = [
    `M ${x0} ${y1}`, // Start bij de lijmflap
    `L ${x1} ${y1}`, `L ${x1} ${y0}`, `L ${x2} ${y0}`, `L ${x2} ${y1}`,
    `L ${x3} ${y1}`, `L ${x3} ${y0}`, `L ${x4} ${y0}`, `L ${x4} ${y1}`,
    `L ${x5} ${y1}`, `L ${x5} ${y2}`, `L ${x4} ${y2}`, `L ${x4} ${y3}`,
    `L ${x3} ${y3}`, `L ${x3} ${y2}`, `L ${x2} ${y2}`, `L ${x2} ${y3}`,
    `L ${x1} ${y3}`, `L ${x1} ${y2}`, `L ${x0} ${y2}`,
    'Z'
  ];

  return path.join(" ");
};