// BOTTOM-RIGHT quadrant: lake-wallpaper phone notification -> lime prize wheel -> "$6400" zoom.
// Loop period 3.767s. All geometry in quadrant px (1920x1080). Pure function of t.
(function () {
  const PERIOD = 3.767;
  const CUT = 1.233; // phone -> wheel

  // Monotone cubic (Fritsch–Carlson) keyframe interpolation over [[t,v],...]
  function makeKF(pts) {
    const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return t => {
      if (t <= xs[0]) return ys[0];
      if (t >= xs[n - 1]) return ys[n - 1];
      let i = 0; while (t > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  }

  // ---------- Phone scene keyframes ----------
  // phone scale about (958,573); measured bezel widths 1187 -> 1443
  const phoneScale = makeKF([[0, 1.002], [0.167, 1.116], [0.333, 1.186], [0.5, 1.226], [0.667, 1.248], [0.833, 1.262], [1.0, 1.272], [1.1, 1.266], [1.167, 1.254], [1.233, 1.23]]);
  const phoneLift = makeKF([[0, 0], [0.667, 0], [0.833, -2], [1.0, -6], [1.1, -24], [1.167, -52], [1.2, -78], [1.233, -104]]);
  const phoneTilt = makeKF([[0, 1], [0.167, 11], [0.333, 17], [0.5, 20], [0.667, 21], [0.833, 22], [1.0, 23], [1.233, 22.5]]); // rotateX deg (top recedes)
  // notification pop (own scale, spring-like with slight overshoot)
  const notifScale = makeKF([[0, 0.346], [0.0167, 0.514], [0.033, 0.63], [0.05, 0.722], [0.067, 0.796], [0.083, 0.855], [0.1, 0.905], [0.117, 0.948], [0.133, 0.984], [0.15, 1.012], [0.2, 1.03], [0.27, 1.012], [0.35, 1.0], [2, 1.0]]);
  const wallShift = makeKF([[0, 0], [0.15, -10], [0.3, -19], [0.45, -30], [0.6, -38], [0.8, -41], [1.0, -41], [1.233, -41]]);
  const notifAdj = makeKF([[0, 1.02], [0.1, 1.03], [0.2, 1.055], [0.35, 1.03], [0.6, 1.004], [0.8, 0.96], [1.0, 0.935], [1.15, 0.951], [1.233, 0.95]]);
  const notifRise = makeKF([[0, 112], [0.033, 80], [0.067, 54], [0.1, 38], [0.15, 23], [0.25, 9], [0.4, 2], [0.6, 0], [2, 0]]); // y offset (local px) — notif starts lower

  // ---------- Wheel keyframes ----------
  const wScale = makeKF([[1.233, 1.68], [1.267, 1.60], [1.3, 1.58], [1.4, 1.555], [1.5, 1.54], [1.6, 1.52], [1.7, 1.50], [1.8, 1.47], [1.9, 1.425], [2.0, 1.34], [2.1, 1.20], [2.2, 1.08], [2.3, 1.024], [2.4, 1.0], [2.6, 0.99], [2.7, 1.0], [2.8, 1.06], [2.867, 1.12], [2.9, 1.15], [2.933, 1.19], [2.967, 1.23], [3.0, 1.27], [3.033, 1.4], [3.067, 1.68], [3.1, 1.91], [3.133, 2.07], [3.2, 2.45], [3.267, 3.34], [3.333, 3.71], [3.4, 3.9], [3.467, 4.04], [3.533, 4.13], [3.6, 4.2], [3.667, 4.26], [3.733, 4.3], [3.767, 4.31]]);
  const wRatio = makeKF([[2.6, 1], [2.733, 1.03], [2.8, 1.035], [2.867, 1.08], [2.933, 1.12], [3.0, 1.2], [3.067, 1.24], [3.2, 1.28], [3.767, 1.28]]);
  const wScaleW = t => wScale(t) * wRatio(t);
  const wCy = makeKF([[1.233, 740], [1.267, 641], [1.3, 597], [1.4, 532], [1.5, 496], [1.6, 480], [1.7, 477], [1.8, 486], [1.9, 502], [2.0, 527], [2.1, 550], [2.2, 552], [2.3, 547], [2.4, 541], [2.6, 534], [2.8, 530], [3.0, 529], [3.1, 527], [3.767, 530]]);
  const wAngle = makeKF([[1.233, -150], [1.267, -78], [1.3, -30], [1.333, 13], [1.367, 53], [1.4, 90], [1.467, 152], [1.533, 200], [1.6, 238], [1.667, 270], [1.733, 294], [1.8, 313], [1.867, 328], [1.933, 339], [2.0, 347], [2.067, 352], [2.133, 356], [2.2, 359], [2.3, 360], [3.767, 360]]);
  const textScale = makeKF([[2.75, 1.0], [2.8, 1.04], [2.9, 1.12], [2.967, 1.2], [3.0, 1.25], [3.05, 1.35], [3.1, 1.55], [3.133, 1.7], [3.2, 1.8], [3.267, 1.87], [3.4, 1.91], [3.5, 1.95], [3.6, 2.04], [3.7, 2.14], [3.767, 2.18]]);
  const salary = makeKF([[2.46, 3200], [2.49, 3214], [2.5, 3221], [2.533, 3253], [2.567, 3310], [2.6, 3405], [2.633, 3519], [2.667, 3703], [2.7, 4017], [2.733, 4428], [2.767, 4804], [2.8, 5100], [2.833, 5324], [2.867, 5500], [2.9, 5641], [2.933, 5770], [2.967, 5880], [3.0, 5960], [3.033, 6030], [3.067, 6100], [3.1, 6138], [3.133, 6180], [3.167, 6215], [3.2, 6250], [3.267, 6320], [3.333, 6360], [3.4, 6385], [3.467, 6395], [3.533, 6399], [3.6, 6400], [3.767, 6400]]);
  // background lime wash 0..1
  const bgLime = makeKF([[1.233, 0.0], [1.45, 0.12], [1.65, 0.4], [1.85, 0.7], [2.05, 0.92], [2.2, 1.0], [3.767, 1.0]]);
  const R_WHEEL = 470;   // rim radius (knob centers) at scale 1
  const R_DISC = 176;    // center disc radius at scale 1
  const CX = 960;


  // ---------- Procedural lake wallpaper (1124x770, plate coords) ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function paintLake() {
    const W = 1124, H = 840, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    // deterministic value noise + fbm
    const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const sm = t => t * t * (3 - 2 * t);
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
      const a = hash(xi, yi), b = hash(xi + 1, yi), cc = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return a + (b - a) * xf + (cc - a) * yf + (a - b - cc + d) * xf * yf; };
    const fbm = (x, y, o = 4) => { let v = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { v += a * vn(x * f + i * 17.3, y * f + i * 9.1); n += a; a *= 0.5; f *= 2.03; } return v / n; };
    const lerp = (a, b, k) => a + (b - a) * k, cl = v => Math.max(0, Math.min(1, v));
    const mix = (c1, c2, k) => [lerp(c1[0], c2[0], k), lerp(c1[1], c2[1], k), lerp(c1[2], c2[2], k)];
    const ramp = (stops, k) => { k = cl(k); for (let i = 0; i < stops.length - 1; i++) if (k <= stops[i + 1][0]) return mix(stops[i][1], stops[i + 1][1], (k - stops[i][0]) / (stops[i + 1][0] - stops[i][0])); return stops[stops.length - 1][1]; };
    const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const waterStops = [[0, '#3d6390'], [0.012, '#5a84b6'], [0.04, '#6990c0'], [0.07, '#7899c3'], [0.095, '#8fa4c3'], [0.12, '#8c9fbc'], [0.2, '#7a8eae'], [0.3, '#8293ae'],
      [0.34, '#97a1b4'], [0.4, '#929caf'], [0.5, '#8895aa'], [0.6, '#7d8ca4'], [0.7, '#72849f'], [0.8, '#627897'], [0.88, '#536f92'], [0.95, '#46668b'], [1, '#3d5f86']].map(([o, h]) => [o, hex(h)]);
    const foliage = [[0, hex('#132326')], [0.3, hex('#203631')], [0.5, hex('#2f4a35')], [0.66, hex('#47693c')], [0.8, hex('#6a9447')], [0.92, hex('#93b862')], [1, hex('#b5cf86')]];
    const sky0 = hex('#b9bfcd'), sky1 = hex('#b1b8c7');
    const img = c.createImageData(W, H), D = img.data;
    // hand-specified layout (by observation): skyline, shore, sunlit clusters, reflection band
    const pl = (pts, x) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const k = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * sm(k); } return pts[pts.length - 1][1]; };
    const skyline = [[0, 76], [150, 73], [300, 71], [450, 72], [560, 75], [600, 84], [650, 92], [750, 96], [850, 98], [950, 90], [1000, 80], [1124, 74]];
    const shore = [[0, 214], [560, 216], [700, 222], [900, 226], [1124, 230]];
    const bandTop = [[0, 310], [300, 300], [560, 284], [700, 274], [900, 265], [1124, 257]];
    const bandBot = [[0, 368], [560, 366], [1124, 370]];
    const suns = [[55, 122, 40, 22, 0.55], [250, 132, 26, 30, 0.75], [335, 160, 18, 32, 0.85], [435, 180, 38, 30, 0.8], [495, 125, 26, 16, 0.6], [548, 175, 16, 30, 0.9],
      [582, 130, 22, 22, 0.6], [690, 130, 34, 22, 0.75], [745, 140, 40, 30, 0.6], [955, 175, 55, 52, 1.0], [1070, 168, 60, 50, 0.95], [150, 185, 40, 22, 0.35]];
    const shades = [[845, 165, 60, 70, 0.7], [620, 190, 40, 30, 0.4], [180, 150, 50, 50, 0.3]];
    const reeds = [[430, 470, 0.7], [470, 560, 1.0], [1050, 1124, 0.25]];
    const ellK = (x, y, e) => { const d = ((x - e[0]) / e[2]) ** 2 + ((y - e[1]) / e[3]) ** 2; return d < 1 ? e[4] * sm(1 - d) : 0; };
    const tops = new Float32Array(W);
    for (let x = 0; x < W; x++) tops[x] = pl(skyline, x) - 7 * Math.pow(Math.max(0, vn(x / 5.5, 11.3) - 0.35), 1.4) * 1.6 - 4 * (vn(x / 2.1, 5.1) - 0.5) - 6 * (fbm(x / 40, 3.7, 3) - 0.5);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4; let col;
      const sy = pl(shore, x);
      if (y < tops[x]) col = mix(sky0, sky1, y / 100);
      else if (y < sy) {
        const depth = (y - tops[x]) / (sy - tops[x]);
        let sun = 0; for (const e of suns) sun = Math.max(sun, ellK(x, y, e));
        let shade = 0; for (const e of shades) shade = Math.max(shade, ellK(x, y, e));
        const clump = fbm(x / 12, y / 10, 4), fine = vn(x / 2.4, y / 2.2);
        // upper conifer band is darker, then sunlit deciduous mid, dark understory at shore
        const conifer = 1 - sm(U.clamp((y - tops[x]) / 26));
        let k = 0.3 + 0.36 * clump + 0.12 * fine + 0.22 * sun * (0.5 + clump) - 0.25 * shade - 0.18 * conifer - 0.4 * Math.pow(Math.max(0, depth - 0.55) / 0.45, 1.5);
        let colr = mix(ramp(foliage, k), hex('#4d5c66'), 0.28);
        // reeds / bright shore grass strip
        for (const r of reeds) if (x > r[0] && x < r[1] && y > sy - 14) colr = mix(colr, hex('#7fa04e'), 0.6 * r[2] * sm((y - (sy - 12)) / 12) * U.clamp(fbm(x / 9, y / 4, 2) * 1.6 - 0.3));
        col = colr;
      } else {
        const wy = Math.min(1, (y - 214) / (770 - 214));
        col = ramp(waterStops, wy);
        // saturated blue strip below shore
        const strip = 1 - U.clamp((y - sy) / 34);
        col = mix(col, hex('#5f86b6'), 0.75 * strip);
        const rip = fbm(x / 95, y / 1.35, 3) - 0.5, ripF = vn(x / 30, y / 0.9) - 0.5;
        const bt = pl(bandTop, x), bb = pl(bandBot, x);
        const inBand = y > bt && y < bb ? Math.sin(Math.PI * Math.pow((y - bt) / (bb - bt), 0.7)) : 0;
        const right = U.clamp((x - 450) / 600);
        const bandK = inBand * (0.55 + 0.45 * right);
        const dark = bandK * U.clamp(0.72 + (rip + ripF * 0.45) * 7);
        col = mix(col, mix(hex('#33475a'), hex('#3b4b40'), right), dark * 0.92);
        // dark top edge of band (sharp "wake" line) and a thin bright wake line above it on the right
        const edge = Math.exp(-((y - bt - 4) ** 2) / 10);
        col = mix(col, hex('#3d5068'), edge * (0.45 + 0.3 * right));
        if (x > 700) { const wl = Math.exp(-((y - (bt - 12)) ** 2) / 4); col = mix(col, hex('#a9bad3'), wl * 0.5 * U.clamp((x - 700) / 150)); }
        const amp = 0.05 + 0.1 * wy;
        col = col.map(v => v * (1 + rip * amp * 2.2 + ripF * amp));
        const d = Math.hypot((x - 500) / 150, (y - 716) / 28);
        if (d < 1) { const kk = U.clamp((1 - d) * 1.6) * U.clamp(0.5 + rip * 3 + ripF * 1.5); col = mix(col, hex('#c8c0cc'), kk * 0.75); }
        if (y - sy < 3) col = mix(col, hex('#2d3f4c'), 0.7 * (1 - (y - sy) / 3));
      }
      D[i] = col[0]; D[i + 1] = col[1]; D[i + 2] = col[2]; D[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const o = out.getContext('2d'); o.filter = 'blur(2.5px)'; o.drawImage(cv, 0, 0);
    return out;
  }

  let els = null;
  let lakeEl = null;
  const offCanvas = document.createElement('canvas'); offCanvas.width = 1920; offCanvas.height = 1080;
  const offCtx = offCanvas.getContext('2d');

  function buildPhone(root) {
    const scene = U.el('div', 'position:absolute;inset:0;background:#fff;overflow:hidden;');
    const persp = U.el('div', 'position:absolute;inset:0;perspective:2600px;perspective-origin:960px 573px;');
    const cam = U.el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:960px 573px;transform-style:preserve-3d;');
    // phone body, outer 363..1550 x, bottom 805, height 1700
    const W = 1195, H = 1700, L = 362, B = 805, T = B - H;
    const shadow = U.el('div', `position:absolute;left:${L + 40}px;top:${T}px;width:${W - 80}px;height:${H}px;border-radius:0 0 200px 200px;box-shadow:0 14px 34px rgba(20,20,30,0.10),0 3px 8px rgba(20,20,30,0.08);`);
    const band = U.el('div', `position:absolute;left:${L}px;top:${T}px;width:${W}px;height:${H}px;border-radius:0 0 212px 212px;background:linear-gradient(90deg,#3a3740 0%,#2b2930 6%,#26252b 50%,#3a3840 94%,#5c5a62 100%);overflow:hidden;`);
    const bandBottom = U.el('div', `position:absolute;left:0;right:0;bottom:0;height:60px;border-radius:0 0 212px 212px;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(46,42,40,0.9) 60%,rgba(26,22,20,1) 100%);`);
    band.appendChild(bandBottom);
    const rimHi = U.el('div', `position:absolute;left:${L}px;top:${T}px;width:${W}px;height:${H}px;border-radius:0 0 212px 212px;box-shadow:inset 0 0 0 1.5px rgba(150,146,158,0.55),inset 0 -2px 2px rgba(190,186,198,0.35);pointer-events:none;`);
    const black = U.el('div', `position:absolute;left:${L + 8}px;top:${T}px;width:${W - 17}px;height:${H - 11}px;border-radius:0 0 205px 205px;background:#0d0d0f;`);
    const sL = 394, sR = 1527, sB = 771;
    const screen = U.el('div', `position:absolute;left:${sL}px;top:${T}px;width:${sR - sL}px;height:${sB - T}px;border-radius:0 0 178px 178px;overflow:hidden;background:#aebfd3;`);
    const lake = paintLake();
    lake.style.cssText = `position:absolute;left:0;top:${-T}px;width:1133px;height:840px;`;
    screen.appendChild(lake);
    lakeEl = lake;
    // notification (local coords at scale 1): box x 467..1449, y 356..561
    const notif = U.el('div', `position:absolute;left:${469 - sL}px;top:${352 - T}px;width:982px;height:205px;border-radius:52px;transform-origin:50% 50%;
      background:linear-gradient(180deg,rgba(226,232,244,0.30),rgba(214,224,240,0.24));
      backdrop-filter:blur(26px) saturate(1.15);-webkit-backdrop-filter:blur(26px) saturate(1.15);
      box-shadow:inset 0 0 0 2px rgba(255,255,255,0.30),inset 0 2px 1px rgba(255,255,255,0.35),0 10px 30px rgba(20,40,70,0.10);overflow:hidden;`);
    const icon = U.el('div', 'position:absolute;left:34px;top:47px;width:110px;height:110px;border-radius:23px;background:linear-gradient(160deg,#d2ff1c,#c6f80e);');
    icon.innerHTML = `<svg viewBox="0 0 110 110" width="110" height="110" style="position:absolute;inset:0">
      <defs><mask id="ceroMask" maskUnits="userSpaceOnUse" x="0" y="0" width="110" height="110">
        <rect width="110" height="110" fill="#fff"/>
        <rect x="48.8" y="29" width="12.6" height="44" rx="6.3" fill="#000"/>
        <rect x="20" y="50" width="32" height="4.2" fill="#000"/>
        <rect x="58" y="39.5" width="40" height="14.5" fill="#000"/>
      </mask></defs>
      <ellipse cx="55.6" cy="51" rx="29" ry="28.5" fill="#152009" mask="url(#ceroMask)"/>
      <circle cx="93" cy="72" r="6" fill="#152009"/></svg>`;
    const textStyle = "position:absolute;font-family:Inter,'SF Pro Text',sans-serif;color:#ffffff;white-space:nowrap;letter-spacing:-0.1px;text-shadow:0 1px 2px rgba(30,50,80,0.10);";
    const title = U.el('div', textStyle + 'left:174px;top:30px;font-size:38px;font-weight:600;', 'Cero');
    const when = U.el('div', textStyle + 'right:38px;top:32px;font-size:32px;font-weight:500;color:rgba(255,255,255,0.92);', 'Just now');
    const body1 = U.el('div', textStyle + 'left:174px;top:80px;font-size:35px;font-weight:500;', "You've been paid your salary: <span class='amt'>$3,200.</span>");
    const body2 = U.el('div', textStyle + 'left:173px;top:129px;font-size:35px;font-weight:500;', 'Balance: $9,967');
    const sheen = U.el('div', 'position:absolute;left:0;top:0;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.6) 30%,rgba(255,255,255,0) 70%);filter:blur(6px);opacity:0;');
    notif.append(icon, title, when, body1, body2, sheen);
    screen.appendChild(notif);
    cam.append(shadow, band, black, screen, rimHi);
    persp.appendChild(cam);
    scene.appendChild(persp);
    root.appendChild(scene);
    return { scene, cam, notif, sheen };
  }

  function buildWheel(root) {
    const scene = U.el('div', 'position:absolute;inset:0;overflow:hidden;background:#fafafa;');
    const fdefs = U.el('div', 'position:absolute;width:0;height:0;overflow:hidden;');
    fdefs.innerHTML = '<svg width="0" height="0"><defs>' + [1, 2, 3, 4, 5, 6, 7, 8].map(l => `<filter id="brvb${l}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="0 ${l * 1.1}"/></filter>`).join('') + '</defs></svg>';
    scene.appendChild(fdefs);
    const bgWhite = U.el('div', 'position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,#f6f6f6 0%,#f8f9f6 50%,#f9fbf2 100%);');
    const bgLimeEl = U.el('div', 'position:absolute;inset:0;opacity:0;');
    const canvas = U.el('canvas', 'position:absolute;left:0;top:0;width:1920px;height:1080px;');
    const wash = U.el('div', 'position:absolute;inset:0;opacity:0;');
    canvas.width = 1920; canvas.height = 1080;
    // DOM overlay group centered on wheel center
    const grp = U.el('div', 'position:absolute;left:0;top:0;width:0;height:0;');
    const rays = U.el('div', `position:absolute;left:-600px;top:-600px;width:1200px;height:1200px;opacity:0;
      background:repeating-conic-gradient(from 0deg,rgba(255,255,255,0.95) 0deg 5deg,rgba(255,255,255,0) 9deg 18deg);
      -webkit-mask-image:radial-gradient(circle,#000 0%,rgba(0,0,0,0.85) 18%,rgba(0,0,0,0.35) 45%,transparent 70%);mask-image:radial-gradient(circle,#000 0%,rgba(0,0,0,0.85) 18%,rgba(0,0,0,0.35) 45%,transparent 70%);`);
    const raysGlow = U.el('div', 'position:absolute;left:-200px;top:-200px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0.5) 30%,rgba(255,255,255,0) 70%);opacity:0;');
    const twoX = U.el('div', "position:absolute;left:-150px;top:-60px;width:300px;height:120px;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-weight:600;font-size:74px;letter-spacing:-2px;color:#26360f;", '2x');
    const ring = U.el('div', 'position:absolute;border-radius:50%;opacity:0;');
    const halo = U.el('div', 'position:absolute;border-radius:50%;background:#fdfdfd;opacity:0;');
    const disc = U.el('div', `position:absolute;left:${-R_DISC}px;top:${-R_DISC}px;width:${2 * R_DISC}px;height:${2 * R_DISC}px;`);
    const pointer = U.el('div', 'position:absolute;left:0;top:0;width:0;height:0;');
    pointer.innerHTML = `<svg width="352" height="352" viewBox="0 0 352 352" style="position:absolute;left:0;top:0;overflow:visible">
      <path d="M176 -77 C179.5 -77 181.5 -74 183.5 -69 L204 -8 Q210 9 242 13 L110 13 Q142 9 148 -8 L168.5 -69 C170.5 -74 172.5 -77 176 -77 Z" fill="#f5f5f5"/></svg>`;
    const discFace = U.el('div', 'position:absolute;inset:0;border-radius:50%;background:#f5f5f5;box-shadow:0 6px 18px rgba(80,110,0,0.16);');
    const discLine = U.el('div', 'position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 0 0px #e3e3e3;');
    disc.append(discFace, pointer, discLine);
    // text group (separate scale)
    const txt = U.el('div', 'position:absolute;left:0;top:0;width:0;height:0;');
    const lbl = U.el('div', "position:absolute;left:-200px;top:-72px;width:400px;text-align:center;font-family:Inter,sans-serif;font-weight:400;font-size:44px;letter-spacing:-0.5px;color:#979b93;", 'Salary');
    const amt = U.el('div', "position:absolute;left:-250px;top:-18px;width:500px;height:92px;display:flex;justify-content:center;font-family:Inter,sans-serif;font-weight:500;font-size:82px;line-height:92px;letter-spacing:-2px;color:#2a4210;text-shadow:0 1px 0 rgba(255,255,255,0.35),0 -1px 1px rgba(60,90,20,0.25);");
    // build odometer columns: $ + 4 digits
    const dollar = U.el('div', 'position:relative;height:92px;', '$');
    amt.appendChild(dollar);
    const cols = [];
    for (let k = 0; k < 4; k++) {
      const c = U.el('div', 'position:relative;height:92px;width:0.6em;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 6%,#000 22%,#000 80%,transparent 94%);mask-image:linear-gradient(180deg,transparent 6%,#000 22%,#000 80%,transparent 94%);');
      const strip = U.el('div', 'position:absolute;left:0;top:0;width:100%;text-align:center;');
      strip.innerHTML = '0123456789012'.split('').map(d => `<div style="height:92px">${d}</div>`).join('');
      c.appendChild(strip); amt.appendChild(c); cols.push({ c, strip });
    }
    txt.append(lbl, amt);
    grp.append(halo, rays, raysGlow, twoX, ring, disc, txt);
    scene.append(bgWhite, bgLimeEl, canvas, wash, grp);
    root.appendChild(scene);
    return { scene, bgLimeEl, wash, canvas, ctx: canvas.getContext('2d'), grp, rays, raysGlow, twoX, ring, halo, disc, pointer, discLine, txt, lbl, amt, cols };
  }

  // draw wheel (wedges, rim, knobs) into canvas; samples = [{cy,s,ang}] across the shutter (motion blur)
  function drawWheelOnce(ctx, cx, cy, s, angDeg) {
    const R = R_WHEEL * s;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angDeg * Math.PI / 180);
    for (let i = 0; i < 10; i++) {
      const a0 = (-90 - 18 + i * 36) * Math.PI / 180, a1 = a0 + 36 * Math.PI / 180;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R + 3 * s, a0 - 0.003, a1 + 0.003); ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? '#caff0f' : '#a8e70d';
      ctx.fill();
    }
    // subtle radial shading toward rim
    const g = ctx.createRadialGradient(0, 0, R * 0.6, 0, 0, R + 3 * s);
    g.addColorStop(0, 'rgba(120,170,0,0)'); g.addColorStop(0.9, 'rgba(120,170,0,0.05)'); g.addColorStop(1, 'rgba(100,150,0,0.22)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R + 3 * s, 0, Math.PI * 2); ctx.fill();
    // rim: thin olive band
    ctx.lineWidth = 5 * s; ctx.strokeStyle = '#8fbb26';
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2 * s; ctx.strokeStyle = '#6c9614';
    ctx.beginPath(); ctx.arc(0, 0, R + 2.8 * s, 0, Math.PI * 2); ctx.stroke();
    // knobs at wedge centers
    for (let i = 0; i < 10; i++) {
      const aa = (-90 + i * 36) * Math.PI / 180, x = Math.cos(aa) * R, y = Math.sin(aa) * R, r = 15 * s;
      const kg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.05, x, y, r);
      kg.addColorStop(0, '#f6ffc8'); kg.addColorStop(0.45, '#dcf866'); kg.addColorStop(1, '#a9d01e');
      ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3.2 * s; ctx.strokeStyle = '#668f10'; ctx.stroke();
    }
    ctx.restore();
  }
  function drawWheel(out, cx, samples, blurPx) {
    const ctx = offCtx; ctx.clearRect(0, 0, 1920, 1080);
    const N = samples.length;
    for (let k = 0; k < N; k++) {
      ctx.globalAlpha = 1 / (k + 1);
      const sm = samples[k];
      drawWheelOnce(ctx, cx, sm.cy, sm.s, sm.ang);
    }
    ctx.globalAlpha = 1;
    out.save();
    out.filter = blurPx > 0.3 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
    out.drawImage(offCanvas, 0, 0);
    out.restore();
  }

  function renderPhone(e, lt) {
    const s = phoneScale(lt), lift = phoneLift(lt), tilt = phoneTilt(lt);
    lakeEl.style.transform = `translateY(${wallShift(lt).toFixed(2)}px)`;
    e.cam.style.transform = `translateY(${lift}px) rotateX(${tilt}deg) scale(${s})`;
    const ns = notifScale(lt) * notifAdj(lt);
    e.notif.style.transform = `translateY(${notifRise(lt)}px) scale(${(ns * 0.97).toFixed(4)},${(ns * 1.09).toFixed(4)})`;
    // sheen sweeping over "$3,200." around 0.80..1.05
    const sp = U.prog(lt, 0.83, 1.05);
    if (sp > 0 && sp < 1) {
      const x = U.lerp(640, 860, U.easeInOutCubic(sp));
      e.sheen.style.left = (x - 55) + 'px'; e.sheen.style.top = (99 - 55) + 'px';
      e.sheen.style.opacity = Math.sin(sp * Math.PI).toFixed(3);
    } else e.sheen.style.opacity = 0;
  }

  const SHUTTER = 1 / 70;
  function renderWheel(e, lt) {
    const s = wScale(lt), cy = wCy(lt), ang = wAngle(lt);
    const t0 = Math.max(CUT, lt - SHUTTER / 2), t1 = lt + SHUTTER / 2;
    // motion extent within shutter (px at rim)
    const dAng = Math.abs(wAngle(t1) - wAngle(t0)) * Math.PI / 180 * R_WHEEL * s;
    const dCy = Math.abs(wCy(t1) - wCy(t0));
    const dS = Math.abs(wScaleW(t1) - wScaleW(t0)) * R_WHEEL;
    const extent = Math.max(dAng, dCy, dS);
    const N = Math.max(1, Math.min(40, Math.ceil(extent / 6)));
    const samples = [];
    for (let k = 0; k < N; k++) {
      const f = N === 1 ? 0.5 : k / (N - 1);
      const tt = N === 1 ? lt : t0 + (t1 - t0) * f;
      const tz = lt + (f - 0.5) * (t1 - t0) * 0.35; // zoom/translate use a shorter effective shutter
      samples.push({ cy: wCy(tz), s: wScaleW(tz), ang: wAngle(tt) });
    }
    // background
    const bl = bgLime(lt);
    e.bgLimeEl.style.opacity = bl;
    const gR = 860 * Math.max(0.95, Math.min(s, 1.6));
    e.bgLimeEl.style.background = `radial-gradient(circle at ${CX}px ${cy}px, #e3ff96 0px, #e3ff96 ${gR * 0.62}px, #e7feab ${gR * 0.84}px, #eefcc8 ${gR * 0.965}px, #f0fbd0 ${gR * 0.99}px, #e4ff96 ${gR * 1.03}px, #e0ff86 ${gR * 1.2}px, #dcff74 ${gR * 1.6}px, #d6ff64 ${gR * 2.1}px)`;
    // wheel canvas
    e.ctx.clearRect(0, 0, 1920, 1080);
    const entry = 1 - U.prog(lt, CUT, 1.8);
    const camBlur = 9 * Math.pow(entry, 1.6);
    drawWheel(e.ctx, CX, samples, camBlur);
    e.ctx.globalCompositeOperation = 'source-over';
    // white wash over the wheel during entry (bright exposure fade)
    e.wash.style.opacity = Math.min(1, 1.8 * Math.pow(entry, 1.2)).toFixed(3);
    e.wash.style.background = `linear-gradient(180deg, rgba(250,250,250,0) ${cy - 40}px, rgba(250,250,250,0.55) ${cy + 260}px, rgba(250,250,250,0.95) ${cy + 520}px), radial-gradient(circle at ${CX}px ${cy}px, rgba(250,250,250,0) ${R_WHEEL * s * 0.7}px, rgba(250,250,250,0.5) ${R_WHEEL * s * 1.0}px, rgba(250,250,250,0.9) ${R_WHEEL * s * 1.15}px)`;
    // DOM group
    e.grp.style.transform = `translate(${CX}px,${cy}px)`;
    const vBlur = Math.min(10, dCy / 6) + 2.2 * Math.pow(entry, 2);
    const domFilter = vBlur > 0.4 ? `blur(${vBlur.toFixed(2)}px)` : 'none';
    e.disc.style.transform = `scale(${s})`;
    e.disc.style.filter = domFilter;
    // pointer collapses at 3.17..3.26
    const pk = 1 - U.prog(lt, 3.21, 3.262);
    e.pointer.style.transform = `translateY(${(1 - pk) * 80}px)`;
    e.pointer.style.opacity = pk;
    // ring line + halo (final)
    const hk = U.prog(lt, 3.2, 3.75);
    const lineW = 3.4 * U.prog(lt, 3.2, 3.27);
    e.discLine.style.boxShadow = `inset 0 0 0 ${lineW.toFixed(2)}px #e2e2e2`;
    const discR = R_DISC * s;
    const haloW = discR * (0.05 + 0.18 * U.easeOutCubic(hk));
    const hr = discR + haloW;
    Object.assign(e.halo.style, { left: -hr + 'px', top: -hr + 'px', width: 2 * hr + 'px', height: 2 * hr + 'px' });
    e.halo.style.opacity = U.prog(lt, 3.19, 3.25);
    e.halo.style.boxShadow = `0 0 ${30 + 50 * hk}px ${8 + 16 * hk}px rgba(255,255,255,0.7)`;
    // glass ripple ring 2.86..3.22
    const rp = U.prog(lt, 2.85, 3.14);
    if (rp > 0 && rp < 1) {
      const outer = discR * (1.3 + 0.75 * U.easeInOutCubic(rp));
      Object.assign(e.ring.style, { left: -outer + 'px', top: -outer + 'px', width: 2 * outer + 'px', height: 2 * outer + 'px' });
      const inner = discR / outer * 100;
      e.ring.style.background = `radial-gradient(circle closest-side, rgba(255,255,255,0) ${inner.toFixed(2)}%, rgba(255,255,255,0.75) ${(inner + 0.8).toFixed(2)}%, rgba(255,255,255,0.32) ${(inner + 4).toFixed(2)}%, rgba(255,255,255,0.24) 91%, rgba(255,255,255,0.55) 97%, rgba(255,255,255,0.2) 99.3%, rgba(255,255,255,0) 100%)`;
      e.ring.style.opacity = (Math.min(1, rp * 12) * (1 - U.prog(rp, 0.72, 1))).toFixed(3);
      e.ring.style.filter = `blur(${(1.4 + dS / 30).toFixed(2)}px)`;
      e.ring.style.boxShadow = '0 0 0 3px rgba(90,130,10,0.18), 0 6px 18px rgba(70,110,0,0.15)';
    } else e.ring.style.opacity = 0;
    // "2x" label rides the wheel at ~0.765R, outlined from 2.233
    const sW = wScaleW(lt);
    const r2x = R_WHEEL * 0.72 * sW;
    const a = ang * Math.PI / 180;
    const x2 = Math.sin(a) * r2x, y2 = -Math.cos(a) * r2x;
    const outlined = lt >= 2.233;
    const pop = outlined ? 1 + 0.33 * U.easeOutCubic(U.prog(lt, 2.24, 2.6)) : 1;
    e.twoX.style.transform = `translate(${x2}px,${y2}px) rotate(${ang}deg) scale(${(s * pop * (1 - 0.22 * U.prog(lt, 2.6, 2.95))).toFixed(4)})`;
    e.twoX.style.color = outlined ? '#ffffff' : '#26360f';
    e.twoX.style.webkitTextStroke = outlined ? '9px #141a0c' : '0px transparent';
    e.twoX.style.paintOrder = 'stroke fill';
    const angBlur = Math.min(8, dAng / 25);
    const b2 = vBlur + angBlur;
    e.twoX.style.filter = b2 > 0.4 ? `blur(${b2.toFixed(2)}px)` : 'none';
    // sunburst rays behind 2x
    const rk = U.prog(lt, 2.3, 2.42);
    e.rays.style.opacity = (0.8 * rk * (1 - 0.6 * U.prog(lt, 2.7, 3.05))).toFixed(3);
    const raysScale = sW * (0.32 + 0.12 * U.easeOutCubic(rk) + 0.12 * U.prog(lt, 2.5, 3.05));
    e.rays.style.transform = `translate(${x2}px,${y2}px) rotate(${((lt - 2.3) * 14).toFixed(2)}deg) scale(${raysScale.toFixed(4)})`;
    e.rays.style.filter = `blur(${(2.5 + dS / 15).toFixed(2)}px)`;
    e.raysGlow.style.opacity = (0.85 * rk).toFixed(3);
    e.raysGlow.style.transform = `translate(${x2}px,${y2}px) scale(${(sW * 0.55).toFixed(4)})`;
    // text
    const ts = lt < 2.75 ? s : textScale(lt);
    e.txt.style.transform = `translateY(${(-6 * U.prog(lt, 3.1, 3.4) * ts).toFixed(2)}px) scale(${ts})`;
    e.txt.style.filter = domFilter;
    // odometer: each column's integer count C_p(t)=floor(v/10^p) smoothed over a 0.09s window ->
    // continuous slot-machine roll, independent of frame rate; vertical motion blur from roll speed
    const colPos = (p, tt) => {
      const NS = 10, Wn = 0.09; let acc = 0;
      for (let i = 0; i < NS; i++) { const u = tt + Wn * 0.5 - Wn * (i + 0.5) / NS; acc += Math.floor(Math.round(salary(u)) / Math.pow(10, p)); }
      return acc / NS;
    };
    for (let k = 0; k < 4; k++) {
      const p = 3 - k;
      const pos = colPos(p, lt);
      const vel = Math.abs(colPos(p, lt + 0.008) - colPos(p, lt - 0.008)) / 0.016; // digits/s
      e.cols[k].strip.style.transform = `translateY(${(-(pos % 10) * 92).toFixed(2)}px)`;
      const lvl = Math.min(3, Math.round(vel * 92 / 60 * 0.025));
      e.cols[k].strip.style.filter = lvl > 0 ? `url(#brvb${lvl})` : 'none';
    }
  }

  window.SCENES.br = {
    async init(root) {
      root.innerHTML = '';
      const p = buildPhone(root);
      const w = buildWheel(root);
      els = { p, w };
    },
    render(root, t) {
      const lt = U.loopT(t, PERIOD);
      const onPhone = lt < CUT;
      els.p.scene.style.display = onPhone ? 'block' : 'none';
      els.w.scene.style.display = onPhone ? 'none' : 'block';
      if (onPhone) renderPhone(els.p, lt); else renderWheel(els.w, lt);
    },
  };
})();
