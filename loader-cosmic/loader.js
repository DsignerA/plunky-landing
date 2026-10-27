/* No framework or audio required. Call GrooveMakersLoader.finish() when the app is ready. */
(() => {
  'use strict';
  const root = document.getElementById('gc-merged-loader');
  if (!root) return;
  const screen = root.querySelector('.gc-screen');
  const canvas = root.querySelector('.gc-ether-wave');
  const context = canvas && canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null, width = 170, visible = true, finishing = false, destroyed = false;
  let resizeObserver, intersectionObserver, removalTimer, fallbackTimer;

  function draw(time = 0) {
    if (!context) return;
    context.clearRect(0, 0, width, 24);
    const t = motion.matches ? 0 : time * 0.00055;
    for (let layer = 0; layer < 3; layer++) {
      context.beginPath();
      for (let x = 0; x <= width; x++) {
        const u = x / width;
        const envelope = Math.pow(Math.sin(Math.PI * u), 1.6);
        const breath = 0.65 + 0.35 * Math.sin(t * 0.7 + layer * 0.8);
        const y = 12 + envelope * (
          Math.sin(u * Math.PI * (4.2 + layer * 0.4) - t + layer * 0.65) * 3.2 * breath +
          Math.sin(u * Math.PI * 9 + t * 0.43) * 0.65
        );
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(126,109,238,0)');
      gradient.addColorStop(0.23, layer === 0 ? 'rgba(137,129,255,.65)' : 'rgba(134,105,244,.23)');
      gradient.addColorStop(0.6, layer === 0 ? 'rgba(147,242,255,.9)' : 'rgba(124,220,255,.28)');
      gradient.addColorStop(1, 'rgba(119,219,255,0)');
      context.strokeStyle = gradient;
      context.lineWidth = layer === 0 ? 0.8 : 0.5;
      context.stroke();
    }
  }
  function tick(time) {
    frame = null;
    if (destroyed || finishing || !visible || motion.matches) return;
    draw(time);
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    draw(0);
    if (!destroyed && !finishing && visible && !motion.matches && context) frame = requestAnimationFrame(tick);
  }
  function size() {
    if (!context) return;
    width = canvas.getBoundingClientRect().width || 170;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(24 * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    clearTimeout(fallbackTimer);
    clearTimeout(removalTimer);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    motion.removeEventListener('change', resume);
    window.removeEventListener('groove:ready', finish);
    root.remove();
    window.dispatchEvent(new CustomEvent('groove:loader-dismissed'));
  }
  function finish() {
    if (finishing || destroyed) return;
    finishing = true;
    clearTimeout(fallbackTimer);
    if (frame !== null) cancelAnimationFrame(frame);
    screen.classList.add('gc-revealed');
    root.classList.add('gm-exit');
    root.setAttribute('aria-busy', 'false');
    removalTimer = setTimeout(destroy, motion.matches ? 0 : 700);
  }
  if (context) {
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(size);
      resizeObserver.observe(canvas);
    }
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); });
      intersectionObserver.observe(canvas);
    }
    size(); resume();
  }
  motion.addEventListener('change', resume);
  window.addEventListener('groove:ready', finish);
  window.GrooveMakersLoader = { finish, destroy };
  fallbackTimer = setTimeout(finish, 8000);
  // In app-controlled mode, the application owns readiness; the timeout still fails open.
  if (root.dataset.readyMode !== 'app') {
    const pageReady = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
    const imagesReady = Promise.all([...root.querySelectorAll('img')].map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve()));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([pageReady, imagesReady, fontsReady]).then(finish);
  }
})();
