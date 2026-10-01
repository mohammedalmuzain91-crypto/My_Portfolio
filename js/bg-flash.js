// Flashing-lights background (canvas): red light bursts, twinkling sparks and
// an occasional soft full-screen pulse. Palette: #830000 / #bc0202 / #ff0000.
(function () {
  const canvas = document.getElementById('flash-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const REDS = [[131, 0, 0], [188, 2, 2], [255, 0, 0], [255, 40, 40]];
  const rand = (a, b) => a + Math.random() * (b - a);

  let W, H, dpr, lastW = 0, lastH = 0;
  let bursts = [], sparks = [], pulse = 0, nextPulse = 3, maxBursts = 8;

  function newBurst(startAged) {
    const small = W < 600;
    const col = REDS[Math.floor(Math.random() * REDS.length)];
    const life = rand(0.9, 2.4);
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(small ? 110 : 180, small ? 240 : 420),
      col, life,
      age: startAged ? rand(0, life) : 0,
      peak: rand(0.55, 0.9),
      flick: Math.random() < 0.5 // some bursts blink twice
    };
  }

  function newSpark() {
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(1.2, 3.2),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.8, 2.6),
      drift: rand(-6, 6),
      white: Math.random() < 0.25
    };
  }

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    lastW = W; lastH = H;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maxBursts = Math.max(5, Math.min(18, Math.round(W * H / 85000)));
    bursts = Array.from({ length: maxBursts }, () => newBurst(true));
    const nSparks = Math.max(30, Math.min(110, Math.round(W * H / 14000)));
    sparks = Array.from({ length: nSparks }, newSpark);
    if (reduceMotion) draw(0);
  }

  // quick rise, slower fade; optional second blink
  function envelope(t, flick) {
    let a = t < 0.15 ? t / 0.15 : Math.pow(1 - (t - 0.15) / 0.85, 1.6);
    if (flick) a *= 0.65 + 0.35 * Math.abs(Math.sin(t * Math.PI * 3));
    return Math.max(0, a);
  }

  function draw(dt) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    // soft full-screen pulse (like a distant flash)
    nextPulse -= dt;
    if (nextPulse <= 0) { pulse = 1; nextPulse = rand(5, 11); }
    if (pulse > 0) {
      ctx.fillStyle = 'rgba(131,0,0,' + (0.22 * pulse * pulse).toFixed(3) + ')';
      ctx.fillRect(0, 0, W, H);
      pulse -= dt * 1.6;
    }

    // light bursts
    for (let i = 0; i < bursts.length; i++) {
      const b = bursts[i];
      b.age += dt;
      const t = b.age / b.life;
      if (t >= 1) { bursts[i] = newBurst(false); continue; }
      const a = envelope(t, b.flick) * b.peak;
      if (a <= 0.003) continue;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      const c = b.col.join(',');
      g.addColorStop(0, 'rgba(' + c + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.45, 'rgba(' + c + ',' + (a * 0.35).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }

    // twinkling sparks
    for (const s of sparks) {
      s.phase += s.speed * dt;
      s.y += s.drift * dt;
      if (s.y < -5) s.y = H + 5; else if (s.y > H + 5) s.y = -5;
      const tw = Math.pow(Math.max(0, Math.sin(s.phase)), 6); // sharp blink
      if (tw < 0.02) continue;
      ctx.fillStyle = s.white
        ? 'rgba(255,200,200,' + (tw * 0.9).toFixed(3) + ')'
        : 'rgba(255,40,40,' + (tw * 0.95).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.6 + tw * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let last = 0;
  function loop(t) {
    if (!document.hidden && t - last > 33) { // ~30 fps
      const dt = Math.min(0.1, (t - last) / 1000);
      draw(last ? dt : 0.033);
      last = t;
    }
    requestAnimationFrame(loop);
  }

  setup();
  if (!reduceMotion) requestAnimationFrame(loop);

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (window.innerWidth !== lastW || Math.abs(window.innerHeight - lastH) > 150) setup();
    }, 200);
  });
})();
