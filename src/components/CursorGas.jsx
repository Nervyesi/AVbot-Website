import React, { useEffect, useRef } from 'react';

/**
 * CursorGas.
 *
 * Heavy CO2-style golden fog that emits ONLY while the cursor is moving.
 * When the cursor is still, no new puffs spawn; existing puffs continue
 * their physics (drift, sag, fade). When the cursor moves, puffs spawn
 * along the cursor path with most of the cursor velocity inherited, so
 * a fast sweep produces a forceful billow that travels and spreads, and
 * a slow drift produces a gentle roll.
 *
 * Implementation notes:
 *   - 256-pixel pre-rendered gold blob sprite reused for every draw.
 *   - Pool of 128 particles in flat Float32Arrays. Zero per-frame allocs.
 *   - Additive (lighter) composite so overlapping puffs merge into thick
 *     luminous fog rather than reading as separate dots.
 *   - Per-puff lateral spread accelerates after the puff has aged ~30%,
 *     turning a directed jet into a billowing cloud over a couple seconds.
 *   - Touch / no-hover devices: not rendered at all.
 */
export default function CursorGas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const hasHover = typeof window !== 'undefined' && window.matchMedia
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

    // Pre-render gold blob sprite.
    const SPRITE_SIZE = 256;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0.00, 'rgba(248,225,138,1.0)');
      grad.addColorStop(0.18, 'rgba(218,178,86,0.85)');
      grad.addColorStop(0.42, 'rgba(168,124,28,0.40)');
      grad.addColorStop(0.70, 'rgba(148,115,13,0.12)');
      grad.addColorStop(1.00, 'rgba(148,115,13,0.00)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // Particle pool.
    const MAX = 128;
    const px   = new Float32Array(MAX);
    const py   = new Float32Array(MAX);
    const pvx  = new Float32Array(MAX);
    const pvy  = new Float32Array(MAX);
    const page = new Float32Array(MAX);
    const plife = new Float32Array(MAX);
    const psize = new Float32Array(MAX);
    const pdir  = new Int8Array(MAX);     // lateral bias direction
    const alive = new Uint8Array(MAX);
    let nextSlot = 0;

    function spawn(x, y, vx, vy) {
      const slot = nextSlot;
      nextSlot = (nextSlot + 1) % MAX;
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 6;
      px[slot]    = x + Math.cos(ang) * r;
      py[slot]    = y + Math.sin(ang) * r;
      // Inherit most of the cursor velocity so a sweep produces a real
      // jet of fog with momentum. Add a small random kick for variation.
      pvx[slot]   = vx * 0.55 + (Math.random() - 0.5) * 24;
      pvy[slot]   = vy * 0.55 + (Math.random() - 0.5) * 24;
      page[slot]  = 0;
      plife[slot] = 2.0 + Math.random() * 1.4;
      psize[slot] = 0.85 + Math.random() * 0.55;
      pdir[slot]  = Math.random() < 0.5 ? -1 : 1;
      alive[slot] = 1;
    }

    // Pointer state. We never emit unless an actual move event arrived
    // during the previous frame, and we keep a small "moved-recently"
    // window so a steady drag emits continuously.
    let mouseX = -1e6, mouseY = -1e6;
    let prevX  = mouseX, prevY = mouseY;
    let cursorVx = 0, cursorVy = 0;
    let initialised = false;
    let movedThisFrame = false;
    let lastEmitAt = 0;

    const onMove = (e) => {
      if (!initialised) {
        mouseX = prevX = e.clientX;
        mouseY = prevY = e.clientY;
        initialised = true;
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      movedThisFrame = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let frame;
    let lastT = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) * 0.001);
      lastT = now;

      // Per-frame cursor velocity. If the cursor did not move this frame,
      // we do NOT emit. Existing puffs still drift and fade.
      if (movedThisFrame) {
        const dx = mouseX - prevX;
        const dy = mouseY - prevY;
        // Smooth velocity so sequential frames feel continuous instead
        // of glitchy on near-still cursors. Keep most of the new value.
        cursorVx = cursorVx * 0.25 + dx * 60 * 0.75;
        cursorVy = cursorVy * 0.25 + dy * 60 * 0.75;

        const speed = Math.hypot(dx, dy);
        // Spawn rate scales with speed and is throttled by minimum
        // interval. A slow drag produces ~1 puff per emit interval; a
        // fast sweep produces up to 3 puffs distributed along the path.
        const elapsedSinceEmit = now - lastEmitAt;
        if (elapsedSinceEmit >= 24) {
          const count = Math.min(3, 1 + Math.floor(speed / 22));
          for (let k = 0; k < count; k++) {
            const u = (k + 1) / (count + 1);
            const sx = prevX + dx * u;
            const sy = prevY + dy * u;
            spawn(sx, sy, cursorVx, cursorVy);
          }
          lastEmitAt = now;
        }
        prevX = mouseX;
        prevY = mouseY;
        movedThisFrame = false;
      } else {
        // Decay the cached cursor velocity so any tail-end emissions
        // settle quickly when the cursor stops. We still do not spawn.
        cursorVx *= 0.7;
        cursorVy *= 0.7;
      }

      // Physics + render.
      ctx.clearRect(0, 0, viewportW, viewportH);
      ctx.globalCompositeOperation = 'lighter';

      const GRAVITY = 26;     // gentle downward pull, fog settles
      const DAMPING = 0.955;

      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        page[i] += dt;
        if (page[i] >= plife[i]) { alive[i] = 0; continue; }

        const tn = page[i] / plife[i];

        // Lateral spread grows after ~30% of life so the directed jet
        // turns into a billowing cloud as it ages. Direction baked at
        // spawn so opposite-direction puffs reinforce a billowing look.
        const spread = pdir[i] * Math.max(0, tn - 0.3) * 28;

        pvx[i] = (pvx[i] + spread * dt) * DAMPING;
        pvy[i] = (pvy[i] + GRAVITY * dt) * DAMPING;

        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        // Off-screen kill.
        if (px[i] < -260 || px[i] > viewportW + 260 ||
            py[i] > viewportH + 260) {
          alive[i] = 0;
          continue;
        }

        // Opacity: fade in over first 12%, plateau, fade out the rest.
        let op;
        if (tn < 0.12) op = tn / 0.12;
        else op = 1 - (tn - 0.12) / 0.88;
        // Peak alpha gives heavy, readable fog without being opaque.
        op *= 0.16 * (0.8 + psize[i] * 0.4);

        // Radius grows with age (diffusion). Generous range so puffs
        // read as voluminous gas rather than dots.
        const radius = (60 + psize[i] * 50) + tn * 70;
        const size = radius * 2;

        ctx.globalAlpha = op;
        ctx.drawImage(sprite, px[i] - radius, py[i] - radius, size, size);
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
