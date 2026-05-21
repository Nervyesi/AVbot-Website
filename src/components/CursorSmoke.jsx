import React, { useEffect, useRef } from 'react';

/**
 * CursorSmoke.
 *
 * Page-wide gold smoke trail that follows the cursor. Implemented as a
 * fixed full-screen overlay canvas with pointer-events disabled. The smoke
 * is a small pool of soft gold blobs that drift, grow, and fade with age.
 * Disabled on touch devices.
 *
 * Performance notes:
 *   The blob sprite is pre-rendered once into an offscreen canvas so that
 *   every per-frame draw is a cheap drawImage. Particle state lives in
 *   flat Float32Arrays. No per-frame object allocations.
 */
export default function CursorSmoke() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Disable on touch / no-hover devices.
    const hasHover = window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;
    if (!hasHover) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let viewportW = window.innerWidth;
    let viewportH = window.innerHeight;

    const resize = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
      canvas.width  = Math.round(viewportW * dpr);
      canvas.height = Math.round(viewportH * dpr);
      canvas.style.width  = `${viewportW}px`;
      canvas.style.height = `${viewportH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Pre-render the soft gold blob sprite once ────────────────────────
    const SPRITE_SIZE = 128;
    const sprite = document.createElement('canvas');
    sprite.width = SPRITE_SIZE;
    sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0,    'rgba(241,213,134,1)');
      grad.addColorStop(0.25, 'rgba(200,168,78,0.75)');
      grad.addColorStop(0.55, 'rgba(148,115,13,0.35)');
      grad.addColorStop(1,    'rgba(148,115,13,0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // ── Particle pool ────────────────────────────────────────────────────
    const MAX = 80;
    const px   = new Float32Array(MAX);
    const py   = new Float32Array(MAX);
    const pvx  = new Float32Array(MAX);
    const pvy  = new Float32Array(MAX);
    const page = new Float32Array(MAX); // current age, seconds
    const plife = new Float32Array(MAX); // total lifetime, seconds
    const psize = new Float32Array(MAX); // size multiplier (random)
    const alive = new Uint8Array(MAX);
    let nextSlot = 0;

    // ── Mouse tracking ───────────────────────────────────────────────────
    let mouseX = -9999, mouseY = -9999;
    let prevMouseX = mouseX, prevMouseY = mouseY;
    let initialised = false;
    let pendingEmit = false;
    let lastEmitT = 0;

    const onMove = (e) => {
      if (!initialised) {
        mouseX = e.clientX; mouseY = e.clientY;
        prevMouseX = mouseX; prevMouseY = mouseY;
        initialised = true;
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      pendingEmit = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // ── Animation loop ───────────────────────────────────────────────────
    let frame;
    let lastT = performance.now();

    // Tunables.
    const EMIT_INTERVAL_MS = 18;  // throttle emit rate so fast cursor does not flood
    const BASE_LIFE        = 0.9;
    const LIFE_JITTER      = 0.7;
    const RISE_FORCE       = 24;   // upward acceleration (smoke rises)
    const DRIFT_DAMP       = 0.965;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) * 0.001);
      lastT = now;

      // Emit new particles while the cursor is moving.
      if (pendingEmit && now - lastEmitT >= EMIT_INTERVAL_MS) {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const speed = Math.hypot(dx, dy);
        const count = Math.min(3, 1 + Math.floor(speed / 14));
        for (let n = 0; n < count; n++) {
          const slot = nextSlot;
          nextSlot = (nextSlot + 1) % MAX;
          const offsetA = Math.random() * Math.PI * 2;
          const offsetR = Math.random() * 5;
          px[slot]    = mouseX + Math.cos(offsetA) * offsetR;
          py[slot]    = mouseY + Math.sin(offsetA) * offsetR;
          // Initial velocity mixes cursor motion with a soft random puff.
          pvx[slot]   = (Math.random() - 0.5) * 18 + dx * 0.18;
          pvy[slot]   = (Math.random() - 0.5) * 18 + dy * 0.18 - 4;
          page[slot]  = 0;
          plife[slot] = BASE_LIFE + Math.random() * LIFE_JITTER;
          psize[slot] = 0.7 + Math.random() * 0.7;
          alive[slot] = 1;
        }
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        pendingEmit = false;
        lastEmitT = now;
      } else if (!pendingEmit) {
        // Cursor parked. Slowly forget last position so a sudden jump
        // does not produce a giant streak across the screen.
        prevMouseX += (mouseX - prevMouseX) * 0.2;
        prevMouseY += (mouseY - prevMouseY) * 0.2;
      }

      // Clear by drawing a slight black tint instead of clearRect, so the
      // trail leaves a barely-perceptible ghost. Using fillRect with low
      // alpha is the classic trail trick.
      // Skipping the ghost trick on this implementation; clearRect is
      // simpler and avoids buildup that can darken the page.
      ctx.clearRect(0, 0, viewportW, viewportH);

      // Use additive blending so overlapping puffs read as a glow.
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        page[i] += dt;
        if (page[i] >= plife[i]) {
          alive[i] = 0;
          continue;
        }
        // Drift physics.
        pvx[i] *= DRIFT_DAMP;
        pvy[i] = pvy[i] * DRIFT_DAMP - RISE_FORCE * dt;
        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        // Age-based opacity and size.
        const tNorm = page[i] / plife[i];
        // opacity curve: fades in quickly, holds, fades out
        const op = (1 - tNorm) * (tNorm < 0.15 ? tNorm / 0.15 : 1) * 0.35;
        const size = (16 + tNorm * 64) * psize[i];

        ctx.globalAlpha = op;
        ctx.drawImage(sprite, px[i] - size * 0.5, py[i] - size * 0.5, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    />
  );
}
