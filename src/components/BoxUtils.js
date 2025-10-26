// src/components/BoxUtils.js

const N = (v, d = 0) => Math.max(0, Number(v ?? d) || 0);

export function computeBlank(model, { L, W, H, glue }) {
  const _L = N(L);
  const _W = N(W);
  const _H = N(H);
  
  if (model === 'FEFCO_0201') {
    const _glue = N(glue, 30);
    const _topF = N(null, _W / 2);
    const _botF = N(null, _W / 2);
    const blankW = (2 * _L) + (2 * _W) + _glue;
    const blankH = _H + _W; // Vereenvoudigd: H + 2 * (W/2)
    return { blankW, blankH, L: _L, W: _W, H: _H, glueFlap: _glue, topFlap: _topF, bottomFlap: _botF };
  }
  
  // Fallback voor andere modellen
  return { blankW: _L, blankH: _H, L: _L, W: _W, H: _H };
}

export function generateFefco0201Path(data) {
    const { L, W, H, glueFlap, topFlap, bottomFlap } = data;
    if (!L || !W || !H) return "";

    const y0 = 0;
    const y1 = topFlap;
    const y2 = topFlap + H;
    const y3 = topFlap + H + bottomFlap;

    const x0 = 0;
    const x1 = glueFlap;
    const x2 = glueFlap + W;
    const x3 = glueFlap + W + L;
    const x4 = glueFlap + W + L + W;
    const x5 = glueFlap + W + L + W + L;

    // Snijlijnen (buitenkant)
    const cuts = [
      `M ${x0} ${y1}`, `L ${x1} ${y1}`, `L ${x1} ${y0}`, `L ${x3} ${y0}`, `L ${x3} ${y1}`, `L ${x5} ${y1}`,
      `L ${x5} ${y2}`, `L ${x3} ${y2}`, `L ${x3} ${y3}`, `L ${x1} ${y3}`, `L ${x1} ${y2}`, `L ${x0} ${y2}`, `Z`
    ].join(" ");
    
    // Rillijnen (binnenkant)
    const creases = [
      `M ${x1} ${y1} L ${x5} ${y1}`, // Bovenste flap vouw
      `M ${x1} ${y2} L ${x5} ${y2}`, // Onderste flap vouw
      `M ${x1} ${y0} L ${x1} ${y3}`, // 1e verticale vouw
      `M ${x2} ${y0} L ${x2} ${y3}`, // 2e verticale vouw
      `M ${x3} ${y0} L ${x3} ${y3}`, // 3e verticale vouw
      `M ${x4} ${y0} L ${x4} ${y3}`, // 4e verticale vouw
    ].join(" ");

    return { cuts, creases };
};