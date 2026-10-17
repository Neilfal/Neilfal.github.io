/* Hero: a probability grid that hunts for your cursor.
   Same idea as the WALL-E project: a belief over where the target is,
   sharpening when the target holds still and spreading when it moves. */
(function () {
  const hero = document.getElementById("hero");
  const canvas = document.getElementById("belief");
  const confEl = document.getElementById("conf");
  if (!hero || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Palette stops (low belief -> peak): faint white, aqua, sun, coral
  const stops = [
    [0.0, [255, 255, 255, 0.07]],
    [0.3, [25, 211, 243, 0.55]],
    [0.65, [255, 210, 63, 0.9]],
    [1.0, [255, 79, 94, 1]],
  ];
  function colorAt(p) {
    for (let i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        const [p0, c0] = stops[i - 1];
        const [p1, c1] = stops[i];
        const t = (p - p0) / (p1 - p0);
        const m = (k) => c0[k] + (c1[k] - c0[k]) * t;
        return `rgba(${m(0) | 0},${m(1) | 0},${m(2) | 0},${m(3).toFixed(2)})`;
      }
    }
    return "rgba(255,79,94,1)";
  }

  let w = 0, h = 0, dpr = 1, cell = 32, cols = 0, rows = 0;
  const target = { x: 0, y: 0 };
  const est = { x: 0, y: 0 };
  let sigma = 6;
  let lastMove = -1e9;
  let userActive = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = w < 600 ? 26 : 34;
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    if (!userActive) {
      target.x = est.x = cols * 0.72;
      target.y = est.y = rows * 0.45;
    }
    if (reduceMotion) draw(0);
  }

  function setTarget(clientX, clientY) {
    const r = hero.getBoundingClientRect();
    target.x = (clientX - r.left) / cell;
    target.y = (clientY - r.top) / cell;
    lastMove = performance.now();
    userActive = true;
  }
  hero.addEventListener("pointermove", (e) => setTarget(e.clientX, e.clientY), { passive: true });
  hero.addEventListener("pointerdown", (e) => setTarget(e.clientX, e.clientY), { passive: true });

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const s2 = 2 * sigma * sigma;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = c + 0.5 - est.x;
        const dy = r + 0.5 - est.y;
        let p = Math.exp(-(dx * dx + dy * dy) / s2);
        // faint shimmer so a wide belief still feels alive
        p *= 0.9 + 0.1 * Math.sin(t / 700 + c * 0.9 + r * 1.3);
        const size = (cell - 5) * (0.55 + 0.45 * Math.min(p * 1.2, 1));
        const off = (cell - size) / 2;
        ctx.fillStyle = colorAt(Math.min(p, 1));
        const x = c * cell + off;
        const y = r * cell + off;
        const rad = size * 0.28;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, size, size, rad);
        else ctx.rect(x, y, size, size);
        ctx.fill();
      }
    }
    // confidence: how concentrated the belief is
    const conf = Math.max(0, Math.min(1, 1 - (sigma - 1.8) / 5));
    confEl.textContent = "Confidence " + Math.round(conf * 100) + "%";
  }

  if (reduceMotion) {
    sigma = 2;
    resize();
    window.addEventListener("resize", resize);
    return;
  }

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(hero);

  function frame(now) {
    if (visible) {
      const moving = now - lastMove < 220;
      const idle = now - lastMove > 3500;
      if (idle) {
        // wander on its own until someone moves again
        target.x = cols * (0.5 + 0.38 * Math.sin(now / 4200));
        target.y = rows * (0.5 + 0.34 * Math.sin(now / 3100 + 1));
      }
      est.x += (target.x - est.x) * 0.08;
      est.y += (target.y - est.y) * 0.08;
      const sigmaGoal = moving || idle ? 6.2 : 2.0;
      sigma += (sigmaGoal - sigma) * 0.05;
      draw(now);
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
})();
