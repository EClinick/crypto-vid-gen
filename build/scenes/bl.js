// BL quadrant: "Spend crypto as you go" -> net-worth phone with fire glow -> glossy Deposit pill.
// Loop period 3.6667s. Local timeline: text 0..1.30, phone 1.30..2.366, pill 2.366..3.667.
(function () {
  const P = 11 / 3;
  const CUT_PHONE = 1.2667, CUT_PILL = 2.3667;
  const { clamp, lerp, prog } = U;

  // piecewise-linear interpolation over [[x,y],...] with optional smoothing (smoothstep inside segments)
  function interp(tab, x, smooth) {
    if (x <= tab[0][0]) return tab[0][1];
    for (let i = 1; i < tab.length; i++) {
      if (x <= tab[i][0]) {
        const [x0, y0] = tab[i - 1], [x1, y1] = tab[i];
        let k = (x - x0) / (x1 - x0);
        if (smooth) k = k * k * (3 - 2 * k);
        return y0 + (y1 - y0) * k;
      }
    }
    return tab[tab.length - 1][1];
  }
  // deterministic PRNG
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- timing tables (local seconds) ----------
  // text line vertical center (px)
  const TEXT_Y = [[0, 696], [0.033, 638], [0.066, 618], [0.1, 605], [0.166, 586], [0.233, 574], [0.3, 563], [0.4, 554], [0.633, 545], [0.933, 530], [1.033, 520], [1.1, 509], [1.166, 500], [1.233, 464], [1.2667, 440]];
  const WORDS = [['Spend', -0.05], ['crypto', 0.078], ['as', 0.161], ['you', 0.278], ['go', 0.394]];
  // phone top y, width
  // y of the net-worth number center; phone top derives from it
  const NUM_Y = [[1.2667, 1166], [1.30, 969], [1.333, 940], [1.3667, 911], [1.40, 884], [1.433, 860], [1.4667, 840], [1.5, 824], [1.533, 812], [1.5667, 800], [1.6, 788], [1.633, 776], [1.6667, 768], [1.70, 762], [1.833, 735], [1.9, 728], [1.9667, 721], [2.0333, 713], [2.13, 710], [2.233, 709], [2.283, 703], [2.3, 700], [2.333, 693], [2.3667, 688]];
  const PHONE_W = [[1.2667, 1104], [1.333, 1092], [1.6, 1068], [1.933, 1058], [2.233, 1040], [2.283, 1018], [2.3, 1006], [2.333, 990], [2.3667, 978]];
  const NET = [[1.2667, 623], [1.30, 747], [1.333, 916], [1.3667, 1037], [1.40, 1132], [1.433, 1209], [1.4667, 1274], [1.5, 1329], [1.533, 1376], [1.5667, 1416], [1.6, 1451], [1.633, 1480], [1.6667, 1505], [1.70, 1527], [1.733, 1545], [1.7667, 1560], [1.8, 1572], [1.833, 1581], [1.8667, 1588], [1.9, 1593], [1.933, 1596], [1.9667, 1597]];
  // pill width & center y
  const PILL_W = [[2.366, 1320],  [2.4, 1236],  [2.433, 1200],  [2.466, 1170],  [2.5, 1152],  [2.533, 1140],  [2.566, 1124],  [2.633, 1112],  [2.766, 1098],  [2.833, 1092],  [2.866, 1046],  [2.9, 1006],  [2.933, 998],  [2.966, 1022],  [3.0, 1072],  [3.033, 1092],  [3.1, 1090],  [3.333, 1068],  [3.433, 1062],  [3.6667, 1062]];
  const PILL_Y = [[2.3667, 540], [3.1, 538], [3.233, 535], [3.333, 531], [3.383, 529], [3.433, 524], [3.483, 518], [3.533, 509], [3.583, 494], [3.633, 459], [3.6667, 420]];

  const SVG = {
    tag: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#666" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 12.5l8-8h6v6l-8 8z" transform="rotate(0)"/><circle cx="15" cy="9" r="1.3" fill="#666"/><path d="M2.5 9.5l3 3M6 16l2 2"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#666" stroke-width="1.6"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M12.5 10.2c.6.6.6 2.9 0 3.6M14.4 9c1.1 1.2 1.1 4.8 0 6M16.3 8c1.5 1.7 1.5 6.3 0 8" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#666" stroke-width="1.6"><rect x="5" y="10.5" width="14" height="10.5" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.6" r="1.2" fill="#666"/></svg>',
    eye: '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#666" stroke-width="1.6"><path d="M2 12c2.6-4.4 6-6.6 10-6.6S19.4 7.6 22 12c-2.6 4.4-6 6.6-10 6.6S4.6 16.4 2 12z"/><circle cx="12" cy="12" r="3.2"/></svg>',
    dl: (c, w) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5h5v7h3.5L12 16.5 6 10.5h3.5z"/><path d="M4.5 20.5h15"/></svg>`,
    ul: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 16.5h5v-7h3.5L12 3.5 6 9.5h3.5z"/><path d="M4.5 20.5h15"/></svg>',
    tr: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V8.5h15M16 5.5l3 3-3 3M20 13v2.5H5M8 18.5l-3-3 3-3"/></svg>',
    bigdl: '<svg viewBox="0 0 110 124" width="110" height="124" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"><path d="M41 6h28v44h20L55 88 21 50h20z"/><path d="M5 115h100" stroke-width="10"/></svg>',
    bars: '<svg viewBox="0 0 54 34" width="54" height="34"><rect x="0" y="22" width="9" height="12" rx="2"/><rect x="15" y="15" width="9" height="19" rx="2"/><rect x="30" y="8" width="9" height="26" rx="2"/><rect x="45" y="0" width="9" height="34" rx="2"/></svg>',
    wifi: '<svg viewBox="0 0 48 34" width="48" height="34"><path d="M24 34l-7-8a10 10 0 0 1 14 0z"/><path d="M8.5 19.5a22 22 0 0 1 31 0l-4.5 5a15.5 15.5 0 0 0-22 0z"/><path d="M1 12a32 32 0 0 1 46 0l-4.5 5a25.5 25.5 0 0 0-37 0z"/></svg>',
    batt: '<svg viewBox="0 0 76 36" width="76" height="36"><rect x="1.5" y="1.5" width="66" height="33" rx="10" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/><rect x="5.5" y="5.5" width="58" height="25" rx="7"/><path d="M71 12v12c2.6-1 4-3.4 4-6s-1.4-5-4-6z" fill-opacity=".4"/></svg>',
  };

  const UI = "'Inter', system-ui, sans-serif";

  function build(root) {
    root.innerHTML = '';
    root.style.background = '#fdfaf6';
    // per-phase backgrounds (sampled from reference)
    // text-shot background: two flowing peach ribbons with striations (arc rims of huge off-screen ellipses)
    const P1 = 'rgba(250,234,214,', P2 = 'rgba(252,242,232,';
    const bgText = U.el('div', 'position:absolute;inset:0;background:' +
      `radial-gradient(ellipse 2200px 1150px at -200px -700px, ${P1}1) 0%, ${P1}.9) 72%, ${P1}.65) 80%, ${P2}.35) 84%, ${P1}.5) 87%, ${P2}.25) 91%, ${P1}.3) 94%, ${P1}0) 100%),` +
      `radial-gradient(ellipse 2600px 1280px at 2000px 1900px, ${P1}1) 0%, ${P1}.92) 76%, ${P1}.65) 83%, ${P2}.35) 87%, ${P1}.45) 90%, ${P2}.2) 94%, ${P1}.25) 97%, ${P1}0) 100%),` +
      'linear-gradient(180deg,#fdf9f3 0%,#fdfaf6 50%,#fdf9f4 100%)');
    const bgPhone = U.el('div', 'position:absolute;inset:0;background:' +
      'radial-gradient(ellipse 900px 520px at 1920px 1080px, rgba(250,214,180,.95), rgba(250,214,180,0) 75%),' +
      'radial-gradient(ellipse 700px 400px at 0px 1080px, rgba(251,234,222,.9), rgba(251,234,222,0) 75%),' +
      'linear-gradient(180deg,#ffffff 0%,#ffffff 45%,#fdf7f2 100%)');
    const bgPill = U.el('div', 'position:absolute;inset:0;background:' +
      'radial-gradient(ellipse 1500px 380px at 960px 1120px, rgba(249,222,192,1), rgba(249,222,192,0) 78%),' +
      'radial-gradient(ellipse 600px 500px at 0px 700px, rgba(253,240,236,.9), rgba(253,240,236,0) 70%),' +
      'linear-gradient(180deg,#ffffff 0%,#fefcfa 38%,#fdf3ea 66%,#fbe6d2 100%)');
    root.appendChild(bgText); root.appendChild(bgPhone); root.appendChild(bgPill);
    const spark = document.createElement('canvas'); spark.width = 1920; spark.height = 1080;
    spark.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px';
    root.appendChild(spark);

    // ---- text ----
    const text = U.el('div', `position:absolute;left:532px;top:0;height:0;white-space:nowrap;font-family:Urbanist;font-weight:500;font-size:82px;color:#0b0b0b;letter-spacing:0px;`);
    const words = WORDS.map(([w]) => { const s = U.el('span', 'display:inline-block;position:relative;margin-right:22px;line-height:1', w); text.appendChild(s); return s; });
    root.appendChild(text);

    // ---- phone ----
    const phoneWrap = U.el('div', 'position:absolute;left:0;top:0;width:1920px;height:1080px;');
    const fire = document.createElement('canvas'); fire.width = 1920; fire.height = 1080;
    fire.style.cssText = 'position:absolute;inset:0;width:1920px;height:1080px;filter:blur(3px)';
    phoneWrap.appendChild(fire);
    const phone = U.el('div', `position:absolute;left:0;top:0;width:1070px;height:1400px;transform-origin:50% 0;background:#fff;border-radius:150px 150px 0 0;box-shadow:0 0 0 2px rgba(240,236,232,.7),0 -6px 30px rgba(220,200,180,.25);font-family:${UI};`);
    phone.innerHTML = `
      <div style="position:absolute;left:152px;top:92px;font:600 47px ${UI};color:#050505;letter-spacing:-.5px">9:41</div>
      <div style="position:absolute;left:766px;top:110px;fill:#000">${SVG.bars}</div>
      <div style="position:absolute;left:838px;top:110px;fill:#000">${SVG.wifi}</div>
      <div style="position:absolute;left:903px;top:109px;fill:#000">${SVG.batt}</div>
      <div class="chips" style="position:absolute;left:94px;top:350px;display:flex;gap:27px;align-items:center">
        <div style="height:60px;padding:0 21px;border-radius:32px;border:2.5px solid #e08b80;background:#f8dcd8;display:flex;align-items:center;font:500 36px ${UI};color:#4a4a4a">All</div>
        <div style="height:60px;padding:0 22px 0 16px;border-radius:32px;border:2.5px solid #7a7a7a;display:flex;align-items:center;gap:6px;font:500 36px ${UI};letter-spacing:-1.2px;color:#5d5d5d">${SVG.tag}Trading</div>
        <div style="height:60px;padding:0 20px 0 18px;border-radius:32px;border:2.5px solid #7a7a7a;display:flex;align-items:center;gap:6px;font:500 36px ${UI};letter-spacing:-1.2px;color:#5d5d5d">${SVG.card}Card</div>
        <div style="height:60px;padding:0 22px 0 18px;border-radius:32px;border:2.5px solid #7a7a7a;display:flex;align-items:center;gap:6px;font:500 36px ${UI};letter-spacing:-1.2px;color:#5d5d5d">${SVG.lock}Staking</div>
      </div>
      <div style="position:absolute;left:93px;top:497px;font:400 38px ${UI};color:#6f6f6f">Net Worth</div>
      <div style="position:absolute;left:921px;top:494px">${SVG.eye}</div>
      <div class="net" style="position:absolute;left:0;width:1070px;text-align:center;top:567px;font:700 80px 'DejaVu Sans Mono',monospace;color:#3b3b3b;letter-spacing:0px">$1,597</div>
      <div style="position:absolute;left:92px;top:712px;display:flex;gap:22px">
        <div class="dep" style="position:relative;width:266px;height:92px;border-radius:46px;background:#f6dad7;display:flex;align-items:center;justify-content:center;gap:12px;font:500 38px ${UI};color:#555;overflow:hidden">
          <div class="depfx" style="position:absolute;inset:0;border-radius:46px;opacity:0;background:linear-gradient(100deg,#f1806f 0%,#f5b7aa 45%,#f8c2a9 70%,#f49a64 100%)"></div>
          <div class="deptx" style="position:relative;display:flex;align-items:center;gap:12px">${SVG.dl('#555', 40)}Deposit</div></div>
        <div style="width:300px;height:92px;border-radius:46px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;gap:12px;font:500 38px ${UI};color:#555">${SVG.ul}Withdraw</div>
        <div style="width:276px;height:92px;border-radius:46px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;gap:12px;font:500 38px ${UI};color:#555">${SVG.tr}Transfer</div>
      </div>`;
    phoneWrap.appendChild(phone);
    // pre-cut flash: whitening wash with diagonal light stripes over the whole frame
    const flash = U.el('div', 'position:absolute;inset:0;opacity:0;pointer-events:none;background:' +
      'repeating-linear-gradient(-56deg, rgba(255,246,214,.75) 0px, rgba(255,246,214,.75) 34px, rgba(255,255,255,.5) 34px, rgba(255,255,255,.5) 68px)');
    phoneWrap.appendChild(flash);
    root.appendChild(phoneWrap);

    // ---- pill ----
    const pill = U.el('div', 'position:absolute;left:0;top:0;width:1072px;height:377px;transform-origin:50% 50%;');
    pill.innerHTML = `
      <div class="pbase" style="position:absolute;inset:0;border-radius:189px;overflow:hidden;
        background:linear-gradient(100deg,#ef6044 0%,#f16c4d 20%,#f38a68 42%,#f4936d 55%,#f5925e 74%,#f3884b 100%);
        box-shadow:0 0 6px rgba(240,120,90,.25)">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 340px 260px at 560px 300px, rgba(250,175,140,.45), rgba(250,175,140,0) 70%)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 300px 170px at 230px 330px, rgba(250,170,140,.4), rgba(250,170,140,0) 72%)"></div>
        <div class="rimT" style="position:absolute;top:-30px;width:520px;height:110px;border-radius:60px;background:radial-gradient(ellipse at 50% 60%, rgba(255,228,212,.75), rgba(255,228,212,0) 70%);filter:blur(8px)"></div>
        <div class="rimB" style="position:absolute;bottom:-40px;width:480px;height:120px;border-radius:60px;background:radial-gradient(ellipse at 50% 40%, rgba(255,226,210,.7), rgba(255,226,210,0) 70%);filter:blur(8px)"></div>
        <div style="position:absolute;inset:0;border-radius:189px;box-shadow:inset 0 -10px 22px rgba(255,190,160,.3), inset 8px 0 20px rgba(255,170,140,.2)"></div>
        <div class="pwash" style="position:absolute;inset:0;opacity:0;background:
          radial-gradient(ellipse 520px 250px at 600px 120px, rgba(251,214,200,.95), rgba(251,214,200,0) 78%),
          radial-gradient(ellipse 520px 300px at 420px 250px, rgba(249,200,184,.9), rgba(249,200,184,0) 80%),
          radial-gradient(ellipse 200px 160px at 900px 280px, rgba(240,128,70,.5), rgba(240,128,70,0) 70%)"></div>
        <div class="ppress" style="position:absolute;inset:0;opacity:0;background:linear-gradient(100deg,#eb4f33,#ee6d40)"></div>
      </div>
      <div style="position:absolute;left:170px;top:125px">${SVG.bigdl}</div>
      <div style="position:absolute;left:372px;top:104px;font:540 156px ${UI};color:#fff;letter-spacing:-1px;line-height:1">Deposit</div>`;
    root.appendChild(pill);

    // sparkle field
    const r = rng(7), dots = [];
    for (let i = 0; i < 420; i++) {
      const y = 1080 - Math.pow(r(), 1.3) * 420; // dense near bottom, thinning out by y≈660
      dots.push({ x: r() * 1920, y, s: 4 + r() * 6, ph: r() * 6.28, f: 2 + r() * 5, a: 0.3 + r() * 0.55, dy: 6 + r() * 20 });
    }
    root._bl = { flash: phoneWrap.lastElementChild, bgText, bgPhone, bgPill, text, words, phoneWrap, phone, fire, pill, spark, dots,
      net: phone.querySelector('.net'), dep: phone.querySelector('.dep'), depfx: phone.querySelector('.depfx'), deptx: phone.querySelector('.deptx'),
      pwash: pill.querySelector('.pwash'), rimT: pill.querySelector('.rimT'), rimB: pill.querySelector('.rimB'), pbase: pill.querySelector('.pbase'), ppress: pill.querySelector('.ppress') };
  }

  // soft white square sprite (pre-blurred once; ctx.filter per frame makes headless screenshots ~100x slower)
  let SPRITE = null;
  function sprite() {
    if (SPRITE) return SPRITE;
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const d = Math.max(Math.abs(x - 15.5), Math.abs(y - 15.5)); // square falloff
      const a = clamp((13 - d) / 4);
      if (a > 0) { g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; g.fillRect(x, y, 1, 1); }
    }
    return (SPRITE = c);
  }
  function drawSparkles(S, t, strength, top) {
    const c = S.spark.getContext('2d'), sp = sprite();
    c.clearRect(0, 0, 1920, 1080);
    for (const d of S.dots) {
      const tw = 0.55 + 0.45 * Math.sin(d.ph + t * d.f);
      const yy = d.y - ((t * d.dy) % 60);
      const fade = clamp((yy - 640) / 260);
      const a = d.a * tw * fade * strength;
      if (a < 0.02) continue;
      c.globalAlpha = a;
      const sz = d.s * 1.35;
      c.drawImage(sp, d.x - sz / 2, yy - sz / 2, sz, sz);
    }
    if (top) { // text shot: sparkles also ride the top-left ribbon (mirrored field, fading to the right)
      for (const d of S.dots) {
        const yy = 1080 - d.y + ((t * d.dy) % 60) * 0.5;
        const fade = clamp(1 - (yy + d.x * 0.22) / 420);
        const a = d.a * (0.55 + 0.45 * Math.sin(d.ph + t * d.f)) * fade * strength * 0.8;
        if (a < 0.02) continue;
        c.globalAlpha = a; const sz = d.s; c.drawImage(sp, d.x - sz / 2, yy - sz / 2, sz, sz);
      }
    }
    c.globalAlpha = 1;
  }

  // hue phase of the flames: 0 = yellow, 0.5 = orange, 1 = red (yellow -> red -> yellow over the phone shot)
  const FIRE_HUE = [[1.40, 0], [1.55, 0.12], [1.633, 0.3], [1.75, 0.8], [1.85, 1], [1.97, 0.95], [2.07, 0.5], [2.17, 0.12], [2.25, 0], [2.3667, 0]];
  const FIRE_H = [[1.30, 0], [1.38, 50], [1.433, 160], [1.5, 290], [1.566, 390], [1.633, 450], [1.8, 500], [2.0, 520], [2.3667, 540]];
  function mixc(a, b, k) { return a.map((v, i) => Math.round(v + (b[i] - v) * k)); }
  function hueCol(stops, h) { return h <= 0.5 ? mixc(stops[0], stops[1], h * 2) : mixc(stops[1], stops[2], (h - 0.5) * 2); }
  function drawFire(S, l, left, right) {
    const c = S.fire.getContext('2d');
    c.clearRect(0, 0, 1920, 1080);
    const h = interp(FIRE_H, l, true), hue = interp(FIRE_HUE, l, true);
    const core = hueCol([[248, 206, 0], [244, 112, 8], [234, 34, 4]], hue);   // near phone edge
    const mid = hueCol([[250, 222, 30], [246, 150, 20], [242, 84, 8]], hue);
    const outer = hueCol([[252, 236, 120], [250, 196, 90], [246, 140, 60]], hue);
    for (const side of [-1, 1]) {
      const edge = side < 0 ? left : right;
      const tipY = 1080 - h;
      const spread = side < 0 ? 112 : 122;
      c.beginPath();
      c.moveTo(edge + side * 2, tipY);
      c.bezierCurveTo(edge + side * spread * 0.14, tipY + h * 0.38, edge + side * spread * 0.62, 1080 - h * 0.14, edge + side * spread, 1090);
      c.lineTo(edge - side * 40, 1090);
      c.lineTo(edge - side * 40, tipY);
      c.closePath();
      const grd = c.createLinearGradient(edge, 0, edge + side * spread, 0);
      grd.addColorStop(0, `rgb(${core})`); grd.addColorStop(0.45, `rgb(${mid})`); grd.addColorStop(1, `rgb(${outer})`);
      c.fillStyle = grd;
      c.fill();
    }
    // fade toward the tips
    c.globalCompositeOperation = 'destination-in';
    const vg = c.createLinearGradient(0, 1080 - h, 0, 1080);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.1, 'rgba(0,0,0,.7)'); vg.addColorStop(0.28, 'rgba(0,0,0,1)');
    c.fillStyle = vg; c.fillRect(0, 0, 1920, 1080);
    c.globalCompositeOperation = 'source-over';
  }

  function fmt(v) { v = Math.round(v); return v >= 1000 ? '$' + Math.floor(v / 1000) + ',' + String(v % 1000).padStart(3, '0') : '$' + v; }

  function render(root, t) {
    const S = root._bl;
    const l = U.loopT(t + 1e-4, P); // epsilon keeps exact cut frames on the new shot

    const isText = l < CUT_PHONE, isPhone = l >= CUT_PHONE && l < CUT_PILL, isPill = l >= CUT_PILL;
    S.bgText.style.display = isText ? 'block' : 'none';
    S.bgPhone.style.display = isPhone ? 'block' : 'none';
    S.bgPill.style.display = isPill ? 'block' : 'none';
    drawSparkles(S, t, isPill ? 1 : isPhone ? 0.35 : 0.55, isText);

    // ---- text ----
    S.text.style.display = isText ? 'block' : 'none';
    if (isText) {
      const yc = interp(TEXT_Y, l, true);
      S.text.style.top = (yc - 54) + 'px';
      WORDS.forEach(([, ts], i) => {
        const w = S.words[i];
        if (l < ts) { w.style.visibility = 'hidden'; return; }
        w.style.visibility = 'visible';
        const dt = l - ts, dy = 24 * Math.exp(-dt / 0.05) + 20 * Math.exp(-dt / 0.45); // fast drop + slow settle (ref 'go' still ~10px low 0.2s after landing)
        w.style.transform = `translateY(${dy.toFixed(2)}px)`;
      });
    }

    // ---- phone ----
    S.phoneWrap.style.display = isPhone ? 'block' : 'none';
    if (isPhone) {
      const w = interp(PHONE_W, l), s = w / 1070, top = interp(NUM_Y, l) - 615 * s;
      const PCX = 955; // phone center x (ref sits ~5px left of quadrant center)
      const left = PCX - w / 2;
      const tilt = 10 * Math.exp(-(l - CUT_PHONE) / 0.1); // phone arrives tilted back (top recedes), settles flat
      // pivot the tilt around the net-worth number (y=615) so NUM_Y stays exact while the top foreshortens
      S.phone.style.transform = `translate(${(PCX - 535).toFixed(2)}px, ${top.toFixed(2)}px) scale(${s.toFixed(4)}) translateY(615px) perspective(2400px) rotateX(${tilt.toFixed(2)}deg) translateY(-615px)`;
      S.net.textContent = fmt(interp(NET, l));
      // deposit chip: neutral gray, turns pink as the counter settles
      const kp = prog(l, 1.71, 1.77);
      S.dep.style.background = `rgb(${Math.round(lerp(241, 246, kp))},${Math.round(lerp(241, 218, kp))},${Math.round(lerp(241, 215, kp))})`;
      // deposit button press sequence: pale glossy pink (text fades) -> saturates toward the big pill's orange-red
      const k1 = prog(l, 2.08, 2.20);
      const k2 = U.easeInOutCubic(prog(l, 2.25, 2.37));
      S.depfx.style.opacity = clamp(k1).toFixed(3);
      const L = mixc([245, 178, 168], [239, 104, 78], k2), M = mixc([248, 204, 194], [244, 140, 110], k2), R = mixc([247, 184, 150], [243, 136, 82], k2);
      S.depfx.style.background = `linear-gradient(100deg, rgb(${L}) 0%, rgb(${M}) 50%, rgb(${R}) 100%)`;
      const txtOn = k2;
      S.deptx.style.opacity = (1 - 0.3 * k1 + 0.3 * txtOn).toFixed(3);
      const tc = k1 > 0 ? mixc(mixc([85, 85, 85], [253, 236, 232], k1), [255, 255, 255], txtOn) : [85, 85, 85];
      S.deptx.style.color = `rgb(${tc})`;
      S.deptx.querySelector('svg').setAttribute('stroke', `rgb(${tc})`);
      S.dep.style.filter = 'none'; // ref keeps the chip crisp during the morph
      S.flash.style.opacity = (0.75 * U.easeInCubic(prog(l, 2.28, 2.3667))).toFixed(3);
      drawFire(S, l, left + 4 * s, left + w - 4 * s);
    }

    // ---- pill ----
    S.pill.style.display = isPill ? 'block' : 'none';
    if (isPill) {
      const w = interp(PILL_W, l, true), s = w / 1072, cy = interp(PILL_Y, l, true);
      S.pill.style.transform = `translate(${(960 - 536).toFixed(2)}px, ${(cy - 188.5).toFixed(2)}px) scale(${s.toFixed(4)})`;
      const wash = 1 - U.easeInOutCubic(prog(l, CUT_PILL - 0.05, 2.85));
      S.pwash.style.opacity = (wash * 0.95).toFixed(3);
      const press = Math.sin(Math.PI * prog(l, 2.84, 3.02));
      S.ppress.style.opacity = (press * 0.45).toFixed(3);
      S.pbase.style.filter = `blur(${(4 * (1 - prog(l, CUT_PILL, CUT_PILL + 0.06))).toFixed(2)}px)`; // soft only on the first frames
      // glassy rim highlights drifting along top edge and bottom-left (ref: strongest ~3.0, faint by 3.4)
      const rimA = Math.sin(Math.PI * prog(l, 2.5, 3.55));
      S.rimT.style.left = (lerp(300, 520, prog(l, 2.5, 3.6))).toFixed(1) + 'px';
      S.rimT.style.opacity = (0.9 * rimA).toFixed(3);
      S.rimB.style.left = (lerp(20, 160, prog(l, 2.6, 3.6))).toFixed(1) + 'px';
      S.rimB.style.opacity = (0.8 * Math.sin(Math.PI * prog(l, 2.75, 3.35))).toFixed(3);
    }
  }

  window.SCENES.bl = { init: build, render };
})();
