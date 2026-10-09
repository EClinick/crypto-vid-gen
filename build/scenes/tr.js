// TOP-RIGHT quadrant: avatar-bubble field -> wallet row "0x082E...CA88  $27.70M  +$22.24M".
// Loop period 2.967s, three ~0.989s shots separated by hard cuts:
//   A [0, 0.967)     two counter-rotating rings of face bubbles, camera zooming in
//   B [0.967, 1.985) purple avatar + address, slow push-in then pull-back, pale depth bubbles fade out
//   C [1.985, 2.967) "$27.70M" and "+$22.24M" slide in, row shrinks then camera tilts up
// All keyframe tables below were measured from the reference (quadrant px, 30fps).
(function () {
  const U = window.U;
  const PERIOD = 2.9667, CUT_B = 0.967;
  const CX = 960, CY = 540;

  // ---------- generic interpolation ----------
  function interp(tab, t) { // tab: [[t, v...], ...] sorted; returns array of values (linear)
    if (t <= tab[0][0]) return tab[0].slice(1);
    const n = tab.length;
    if (t >= tab[n - 1][0]) return tab[n - 1].slice(1);
    let i = 1; while (tab[i][0] < t) i++;
    const a = tab[i - 1], b = tab[i], k = (t - a[0]) / (b[0] - a[0]);
    return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k);
  }

  // ---------- palette ----------
  const COL = {
    teal: '#72a69e', mint: '#b3ffd8', maroon: '#7a484f', purple: '#e099fd',
    cyan: '#a0fff6', peach: '#f5cea9',
  };

  // ---------- face drawing (bubble diameter = 100 units) ----------
  // quad variants: slightly irregular white "card" faces, offset right of center
  const QUADS = [
    [[23, 30], [86.7, 28.6], [89.5, 65.7], [28.2, 67.7]],
    [[22, 29.5], [86, 30.5], [90, 67.5], [26.5, 68]],
    [[24, 30.5], [87.5, 28.5], [89, 66], [29.5, 67.5]],
    [[22.5, 29], [86.5, 31], [90.5, 68], [27, 66.5]],
    [[23.5, 31], [88, 29.5], [88.5, 67], [26, 66]],
  ];
  function roundedQuad(q, r) {
    // polygon with rounded corners via quadratic curves at vertices
    let d = '';
    for (let i = 0; i < 4; i++) {
      const p0 = q[(i + 3) % 4], p1 = q[i], p2 = q[(i + 1) % 4];
      const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
      const a = [p1[0] + v1[0] / l1 * r, p1[1] + v1[1] / l1 * r];
      const b = [p1[0] + v2[0] / l2 * r, p1[1] + v2[1] / l2 * r];
      d += (i === 0 ? 'M' : 'L') + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' Q' + p1[0] + ' ' + p1[1] + ' ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2) + ' ';
    }
    return d + 'Z';
  }
  function eye(type, x, y, side) {
    switch (type) {
      case 'dot': return `<circle cx="${x}" cy="${y}" r="3.3" fill="#111"/>`;
      case 'squint': return `<path d="M${x - 4} ${y - 1.3} Q${x - 2} ${y - 2.9} ${x} ${y - 1.2} Q${x + 2} ${y - 2.9} ${x + 4} ${y - 1.3} Q${x + 3.4} ${y + 1.6} ${x} ${y + 2.5} Q${x - 3.4} ${y + 1.6} ${x - 4} ${y - 1.3} Z" fill="#111"/>`;
      case 'slant': return `<ellipse cx="${x}" cy="${y}" rx="3.9" ry="2.1" fill="#111" transform="rotate(${side * -14} ${x} ${y})"/>`;
      case 'half': return `<path d="M${x - 3.6} ${y + 1.3} A3.6 3.6 0 0 1 ${x + 3.6} ${y + 1.3} Z" fill="#000"/>`;
      case 'dash': return `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="1.6" fill="#000"/>`;
    }
    return '';
  }
  function mouth(type, x, y) {
    switch (type) {
      case 'smile': return `<path d="M${x - 4.8} ${y - 1.2} L${x + 4.8} ${y - 1.2} Q${x + 4.6} ${y + 3.2} ${x} ${y + 3.2} Q${x - 4.6} ${y + 3.2} ${x - 4.8} ${y - 1.2} Z" fill="#fff" stroke="#111" stroke-width="1.15" stroke-linejoin="round"/>`;
      case 'o': return `<path d="M${x - 3.2} ${y - 1.2} L${x + 3.2} ${y - 1.2} Q${x + 3.2} ${y + 3.2} ${x} ${y + 3.2} Q${x - 3.2} ${y + 3.2} ${x - 3.2} ${y - 1.2} Z" fill="#fff" stroke="#111" stroke-width="1.1" stroke-linejoin="round"/>`;
      case 'dash': return `<line x1="${x - 4.5}" y1="${y + 1}" x2="${x + 4.5}" y2="${y + 1}" stroke="#7a7a7a" stroke-width="1.7" stroke-linecap="round"/>`;
      case 'frown': return `<path d="M${x - 3.8} ${y + 2.6} Q${x} ${y - 3.4} ${x + 3.8} ${y + 2.6}" fill="none" stroke="#111" stroke-width="1.15" stroke-linecap="round"/>`;
    }
    return '';
  }
  const FACES = {
    happy: ['squint', 'smile', 19], flat: ['dot', 'dash', 19], slant: ['slant', 'smile', 21.5], frown: ['dot', 'frown', 17],
    wink: ['half', 'smile', 20.5], o: ['dot', 'o', 16.5],
  };
  function bubbleSVG(color, face, qi) {
    const [et, mt, es] = FACES[face];
    const fx = 55, fy = 49.5;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block;overflow:visible;filter:blur(0.6px)">` +
      `<circle cx="50" cy="50" r="50" fill="${color}"/>` +
      `<path d="${roundedQuad(QUADS[qi % QUADS.length], 4.5)}" fill="#fff"/>` +
      eye(et, fx - es, fy, -1) + eye(et, fx + es, fy, 1) + mouth(mt, fx, fy) + `</svg>`;
  }
  function makeBubble(parent, color, face, qi, extraCss) {
    const e = U.el('div', `position:absolute;left:0;top:0;width:100px;height:100px;transform-origin:0 0;${extraCss || ''}`, bubbleSVG(color, face, qi));
    parent.appendChild(e); return e;
  }
  function placeBubble(e, x, y, d, op) {
    const s = d / 100;
    e.style.transform = `translate(${(x - d / 2).toFixed(2)}px,${(y - d / 2).toFixed(2)}px) scale(${s.toFixed(4)})`;
    if (op !== undefined) e.style.opacity = op.toFixed(3);
  }

  // ---------- Shot A: rings ----------
  // foreground ring: 8 bubbles @45deg, angle at t=0 = 17.9 + 45k, r=303.5, d=127.5 (scale 1)
  const FG = [
    ['cyan', 'frown'], ['teal', 'happy'], ['purple', 'slant'], ['peach', 'wink'],
    ['purple', 'slant'], ['mint', 'flat'], ['teal', 'happy'], ['maroon', 'o'],
  ];
  // background ring: 12 bubbles @30deg, angle at t=0 = -10.74 + 30k, r=600, d=94, 50% opacity
  const BG = [
    ['purple', 'slant'], ['maroon', 'o'], ['peach', 'happy'], ['teal', 'happy'], ['mint', 'flat'], ['cyan', 'frown'],
    ['teal', 'happy'], ['peach', 'happy'], ['maroon', 'o'], ['teal', 'flat'], ['mint', 'flat'], ['purple', 'slant'],
  ];
  // fg ring absolute angle of the maroon bubble (k=7: 332.9deg) over time
  const A_FG_ANG = [[0, -27.46], [0.0333, -40.19], [0.0667, -49.82], [0.1, -57.84], [0.1333, -64.73], [0.1667, -70.78], [0.2, -76.15],
    [0.2333, -80.89], [0.2667, -85.31], [0.3, -89.29], [0.3333, -92.87], [0.3667, -96.16], [0.4, -99.22], [0.4333, -102.01],
    [0.4667, -104.65], [0.5, -106.99], [0.5333, -109.2], [0.5667, -111.23], [0.6, -113.09], [0.6333, -114.82], [0.6667, -116.34],
    [0.7, -117.73], [0.7333, -119.05], [0.7667, -120.28], [0.8, -121.25], [0.8333, -122.27], [0.8667, -123.09], [0.9, -123.85],
    [0.9333, -124.47], [0.967, -125.0]];
  // bg ring rotation delta (deg, clockwise) over time
  const A_BG_ROT = [[0, 0], [0.0333, 14.44], [0.0667, 25.4], [0.1, 34.0], [0.1333, 40.93], [0.1667, 46.64], [0.2, 51.43], [0.2333, 55.51],
    [0.2667, 59.02], [0.3, 62.08], [0.3333, 64.71], [0.3667, 67.12], [0.4333, 71.42], [0.5, 74.8], [0.6, 78.5], [0.7, 81.1],
    [0.8, 83.0], [0.9, 84.4], [0.967, 85.0]];
  // shared zoom
  const A_SCALE = [[0, 1], [0.0333, 1.0342], [0.0667, 1.0604], [0.1, 1.0821], [0.1333, 1.0996], [0.1667, 1.1147], [0.2, 1.128],
    [0.2333, 1.1399], [0.2667, 1.1494], [0.3, 1.1571], [0.3333, 1.1641], [0.3667, 1.1733], [0.4333, 1.1905], [0.5, 1.1945],
    [0.6, 1.2053], [0.7, 1.212], [0.8, 1.2162], [0.9, 1.2179], [0.967, 1.2190]];

  // ---------- Shot B/C: row ----------
  // [t, purple cx, purple cy, S (address ink width / 513), text dy (screen px, text cap-center minus circle center)]
  const ROW = [[0.968,564.5,627.5,1.3041,41],[1.001,542.5,628.5,1.3821,26],[1.034,528,627.5,1.4347,19],[1.068,517.5,624.5,1.4698,15.5],[1.101,510.5,621.5,1.4971,12],[1.134,505,618.5,1.5185,9],[1.168,500,613.5,1.5341,8.5],[1.201,496.5,610.5,1.5497,6.5],[1.234,493.5,606,1.5614,5.5],[1.268,491.5,602.5,1.5712,3.5],[1.301,489.5,597.5,1.5809,3.5],[1.334,487.5,593.5,1.5867,2.5],[1.368,485.5,589,1.5926,2],[1.401,485,584.5,1.5984,2],[1.434,484,580.5,1.6023,1],[1.468,482.5,575.5,1.6082,1.5],[1.501,481.5,571.5,1.6101,0.5],[1.534,479.5,567.5,1.6101,0],[1.568,477.5,563.5,1.6101,-0.5],[1.601,473.5,559.5,1.6101,-1],[1.634,469.5,555,1.6062,-1],[1.668,464,550.5,1.6023,-1],[1.701,457,546.5,1.5945,-1],[1.734,449.5,542,1.5867,-1],[1.768,440.5,537.5,1.577,-0.5],[1.801,429.5,534,1.5653,-1.5],[1.834,418,529.5,1.5478,-1],[1.868,404,525.5,1.5302,-1],[1.901,388,521.5,1.5068,-0.5],[1.934,372.5,518,1.4815,-1],[1.968,353.5,516.5,1.4503,-1],[2.001,335.5,517,1.4172,-1],[2.034,316.5,517.5,1.3821,-1],[2.068,299,518.5,1.3431,-1.5],[2.101,283.5,518.5,1.308,-0.5],[2.134,270.5,519.5,1.2729,-1.5],[2.168,261,520,1.2398,-1.5],[2.201,252,520.5,1.2086,-1],[2.234,246,520.5,1.1832,-0.5],[2.268,241.5,520.5,1.1579,-0.5],[2.301,237.5,521.5,1.1365,-1],[2.334,235,521.5,1.1189,-0.5],[2.368,233.5,522.5,1.1033,-1],[2.401,231.5,522.5,1.0877,-1],[2.434,230.5,522.5,1.0741,-1],[2.468,229.5,522.5,1.0624,-1],[2.501,230,522.5,1.0526,-0.5],[2.534,229.5,521.5,1.0448,-0.5],[2.568,229.5,520.5,1.0351,-1.5],[2.601,229.5,518.5,1.0312,-2],[2.634,230,514.5,1.0214,-1],[2.668,229,509.5,1.0175,-0.5],[2.701,229.5,504.5,1.0136,-0.5],[2.734,229.5,497.5,1.0097,-0.5],[2.768,229.5,488.5,1.0078,-0.5],[2.801,230.5,478.5,1.0039,-1],[2.834,230.5,465.5,1.0019,-1.5],[2.868,230.5,447.5,1.0019,-0.5],[2.901,230.5,425.5,1,-1],[2.934,230.5,393.5,1,-1],[2.967,230.5,352,1,-1]];
  // extra slide-in offsets (world px, +x) for the value labels
  const V1_OFF = [[1.985, 40], [2.001, 31.8], [2.034, 20], [2.068, 15.6], [2.101, 12.2], [2.134, 9.8], [2.201, 8.5], [2.301, 6.3],
    [2.401, 4.0], [2.501, 3.1], [2.701, 2.0], [2.934, 0]];
  const V2_OFF = [[2.118, 44], [2.134, 32], [2.168, 19.6], [2.201, 17.5], [2.268, 12], [2.334, 8], [2.401, 6.7], [2.501, 4.8],
    [2.701, 3.0], [2.934, 0]];
  const V1_ON = 1.985, V2_ON = 2.118;

  // depth bubbles in shot B: [color, face, alpha, blur, track [[t,cx,cy,d]...], fade [t0,t1]]
  const B_BUB = [
    ['cyan', 'happy', 0.36, 0.6, [[0.967, 157, 41, 210], [1.0, 130, 26, 216], [1.1, 29, -27, 234], [1.2, -30, -52, 240], [1.3, -70, -70, 246]], [1.3, 1.5]],
    ['teal', 'happy', 0.36, 0.6, [[0.967, 475, 251, 204], [1.0, 458, 239, 212], [1.1, 398, 196, 232], [1.2, 367, 171, 240], [1.3, 347, 153, 248],
      [1.4, 331, 138, 252], [1.5, 317, 127, 254], [1.6, 298, 117, 248], [1.7, 280, 106, 244], [1.8, 240, 100, 238], [1.9, 200, 105, 232], [1.97, 185, 100, 228]], [1.45, 1.97]],
    ['teal', 'happy', 0.5, 0.3, [[0.967, 1534, 265, 154], [1.0, 1554, 259, 160], [1.1, 1618, 243, 176], [1.2, 1646, 241, 184], [1.3, 1664, 243, 188],
      [1.4, 1673, 244, 192], [1.5, 1679, 245, 190], [1.6, 1673, 247, 188], [1.7, 1648, 248, 182], [1.8, 1600, 254, 178], [1.9, 1540, 262, 172], [1.97, 1480, 270, 166]], [1.5, 1.97]],
    ['mint', 'flat', 0.5, 0.3, [[0.967, 1544, 781, 156], [1.0, 1563, 790, 162], [1.1, 1621, 829, 180], [1.2, 1644, 851, 186], [1.3, 1656, 864, 192],
      [1.4, 1664, 874, 192], [1.5, 1668, 879, 194], [1.6, 1661, 883, 192], [1.7, 1637, 882, 188], [1.8, 1587, 878, 182], [1.9, 1530, 872, 176], [1.97, 1480, 868, 170]], [1.55, 1.97]],
    ['peach', 'happy', 0.3, 0.6, [[0.967, 357, 952, 204], [1.0, 339, 965, 214], [1.1, 289, 1001, 234], [1.2, 273, 1007, 242], [1.3, 269, 1011, 250],
      [1.4, 271, 1009, 254], [1.5, 275, 1003, 254], [1.6, 277, 993, 250], [1.7, 275, 981, 246], [1.8, 265, 965, 240], [1.9, 255, 950, 234], [1.97, 245, 935, 228]], [1.5, 1.97]],
    ['purple', 'slant', 0.36, 0.6, [[0.967, 13, 1007, 146], [1.0, -17, 1031, 150], [1.1, -80, 1080, 160]], [1.0, 1.1]],
  ];

  // world layout of the row at S=1 (relative to purple avatar center)
  const AV_D = 160;
  const ADDR_X = 160.5, ADDR_W = 513, ADDR_F = 73;
  const V1_X = 782.5, V1_W = 257, V2_X = 1147.5, V2_W = 310, VAL_F = 63.5;
  const GREEN = '#2fe07b';

  let layA, layB, fgEls = [], bgEls = [], bEls = [], rowEl, addrEl, v1El, v2El;

  function measure(text, weight, size, family) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = `${weight} ${size}px "${family}"`;
    const m = c.measureText(text);
    return { left: m.actualBoundingBoxLeft, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, cap: c.measureText('H').actualBoundingBoxAscent };
  }

  function svgText(text, size, weight, fill, inkW) {
    const m = measure(text, weight, size, 'Inter');
    const ls = (inkW - m.w) / (text.length - 1); // letter-spacing to hit the measured ink width exactly
    const e = U.el('div', 'position:absolute;left:0;top:0;white-space:nowrap;line-height:1;');
    e.innerHTML = `<svg width="2000" height="200" viewBox="0 -100 2000 200" style="position:absolute;left:0;top:-100px;overflow:visible">` +
      `<text x="${m.left.toFixed(2)}" y="${(m.cap / 2).toFixed(2)}" font-family="Inter" font-weight="${weight}" font-size="${size}" letter-spacing="${ls.toFixed(3)}" fill="${fill}">${text}</text></svg>`;
    return e;
  }

  window.SCENES.tr = {
    async init(root) {
      root.innerHTML = '';
      root.style.background = '#fff';
      await Promise.all([document.fonts.load('600 73px "Inter"'), document.fonts.load('600 63px "Inter"')]);
      layA = U.el('div', 'position:absolute;inset:0;');
      layB = U.el('div', 'position:absolute;inset:0;');
      root.appendChild(layA); root.appendChild(layB);
      BG.forEach(([c, f], k) => bgEls.push(makeBubble(layA, COL[c], f, k + 1, 'opacity:0.5;')));
      FG.forEach(([c, f], k) => fgEls.push(makeBubble(layA, COL[c], f, k)));
      B_BUB.forEach(([c, f, a, blur], k) => bEls.push(makeBubble(layB, COL[c], f, k + 2, `filter:blur(${blur}px);`)));
      rowEl = U.el('div', 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;');
      layB.appendChild(rowEl);
      const av = U.el('div', `position:absolute;left:${-AV_D / 2}px;top:${-AV_D / 2}px;width:${AV_D}px;height:${AV_D}px;`, bubbleSVG(COL.purple, 'slant', 1));
      rowEl.appendChild(av);
      addrEl = svgText('0x082E...CA88', ADDR_F, 600, '#000', ADDR_W); rowEl.appendChild(addrEl);
      v1El = svgText('$27.70M', VAL_F, 600, '#000', V1_W); rowEl.appendChild(v1El);
      v2El = svgText('+$22.24M', VAL_F, 600, GREEN, V2_W); rowEl.appendChild(v2El);
    },
    render(root, t) {
      const lt = U.loopT(t, PERIOD);
      const inA = lt < CUT_B;
      layA.style.display = inA ? 'block' : 'none';
      layB.style.display = inA ? 'none' : 'block';
      if (inA) {
        const [fgAng] = interp(A_FG_ANG, lt), [bgRot] = interp(A_BG_ROT, lt), [S] = interp(A_SCALE, lt);
        const fgBase = fgAng - 332.9; // rotation applied to the lattice (maroon is k=7 at 332.9)
        fgEls.forEach((e, k) => {
          const a = (17.9 + 45 * k + fgBase) * Math.PI / 180, r = 303.5 * S;
          placeBubble(e, CX + r * Math.cos(a), CY + r * Math.sin(a), 127.5 * S);
        });
        bgEls.forEach((e, k) => {
          const a = (-10.74 + 30 * k + bgRot) * Math.PI / 180, r = 600 * S;
          placeBubble(e, CX + r * Math.cos(a), CY + r * Math.sin(a), 94 * S);
        });
      } else {
        B_BUB.forEach(([c, f, alpha, blur, track, fade], k) => {
          const [x, y, d] = interp(track, lt);
          const op = alpha * (1 - U.prog(lt, fade[0], fade[1]));
          bEls[k].style.display = op > 0.002 ? 'block' : 'none';
          placeBubble(bEls[k], x, y, d, op);
        });
        const [cx, cy, S, tdy] = interp(ROW, lt);
        rowEl.style.transform = `translate(${cx.toFixed(2)}px,${cy.toFixed(2)}px) scale(${S.toFixed(4)})`;
        addrEl.style.transform = `translate(${ADDR_X}px,${(tdy / S + 2).toFixed(2)}px)`;
        const o1 = lt >= V1_ON, o2 = lt >= V2_ON;
        v1El.style.display = o1 ? 'block' : 'none';
        v2El.style.display = o2 ? 'block' : 'none';
        if (o1) v1El.style.transform = `translate(${(V1_X + interp(V1_OFF, lt)[0]).toFixed(2)}px,2px)`;
        if (o2) v2El.style.transform = `translate(${(V2_X + interp(V2_OFF, lt)[0]).toFixed(2)}px,2px)`;
      }
    },
  };
})();
