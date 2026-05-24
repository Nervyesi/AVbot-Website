import React, { useEffect, useRef } from 'react';

/**
 * CursorGas.
 *
 * Continuous, heavy, cinematic gold fog that follows the cursor.
 *
 * Goals.
 *   1. Reads as ONE flowing ribbon of gas, not stamped dots. Achieved
 *      by emitting many overlapping soft sprites along the interpolated
 *      path between the previous and current cursor positions, with
 *      additive ('lighter') compositing so adjacent volumes merge.
 *   2. Emits ONLY while the cursor is moving. When the cursor stops,
 *      no new puffs spawn; existing puffs finish their physics and
 *      fade. The per-frame movedThisFrame flag is the gate.
 *   3. SHORT lived (0.6s to 1.4s) and LOCALISED, so the page never
 *      floods. Tight radius range, short distance travel.
 *   4. Speed driven. Faster sweeps emit more dense, slightly stronger
 *      puffs along a longer path. Slow drifts emit a soft glow.
 *   5. Directional inertia plus curl noise on velocity, so the body
 *      swirls and billows like real fog rather than reading as a
 *      rigid streak.
 *
 * Canvas 2D only. Pooled flat arrays. No per-frame allocations. dPR
 * capped at 2. Disabled on touch / no-hover devices.
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

    // Soft gaussian gold sprite. Highlights peak inside, body is the
    // mid gold, edges fade to fully transparent. Re-used for every
    // particle draw so the body of fog is a composite of overlapping
    // copies of this single image.
    const SPRITE_SIZE = 192;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0.00, 'rgba(248,225,138,1.00)');
      grad.addColorStop(0.18, 'rgba(220,178,86,0.62)');
      grad.addColorStop(0.45, 'rgba(168,124,28,0.22)');
      grad.addColorStop(0.75, 'rgba(148,115,13,0.05)');
      grad.addColorStop(1.00, 'rgba(148,115,13,0.00)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // Particle pool.
    const MAX = 384;
    const px    = new Float32Array(MAX);
    const py    = new Float32Array(MAX);
    const pvx   = new Float32Array(MAX);
    const pvy   = new Float32Array(MAX);
    const page  = new Float32Array(MAX);
    const plife = new Float32Array(MAX);
    const psize = new Float32Array(MAX);
    const palpha = new Float32Array(MAX);
    const pseed = new Float32Array(MAX);
    const alive = new Uint8Array(MAX);
    let nextSlot = 0;

    function spawn(x, y, vx, vy, intensity) {
      const slot = nextSlot;
      nextSlot = (nextSlot + 1) % MAX;
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 3;
      px[slot]    = x + Math.cos(ang) * r;
      py[slot]    = y + Math.sin(ang) * r;
      // Inherit a good chunk of cursor velocity so a sweep produces a
      // jet of fog with momentum. Small randomised kick spreads the
      // ribbon laterally so it does not read as a knife-thin streak.
      pvx[slot]   = vx * 0.50 + (Math.random() - 0.5) * 22;
      pvy[slot]   = vy * 0.50 + (Math.random() - 0.5) * 22;
      page[slot]  = 0;
      // Short life: keeps the ribbon localised and prevents flooding.
      plife[slot] = 0.6 + Math.random() * 0.8;
      psize[slot] = 0.75 + Math.random() * 0.45;
      // Per-puff alpha scaled by speed intensity for a denser ribbon
      // on fast sweeps and a softer glow on slow drags.
      palpha[slot] = (0.085 + intensity * 0.07) * (0.85 + Math.random() * 0.3);
      pseed[slot] = Math.random() * 1000;
      alive[slot] = 1;
    }

    // Pointer state.
    let mouseX = -1e6, mouseY = -1e6;
    let prevX  = mouseX, prevY = mouseY;
    let cursorVx = 0, cursorVy = 0;
    let initialised = false;
    let movedThisFrame = false;

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

    // Step constants for the physics loop.
    const GRAVITY = 18;     // gentle settling
    const DAMPING = 0.93;   // fast velocity decay so puffs stay local
    const CURL    = 42;     // curl noise force on velocity

    // Maximum number of puffs spawned in a single frame, protects the
    // pool from pathological cursor teleports.
    const FRAME_SPAWN_CAP = 28;

    // Stride along the cursor path. A puff every ~3.5 pixels is dense
    // enough that overlapping additive sprites merge into one body.
    const PATH_STRIDE = 3.5;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) * 0.001);
      lastT = now;

      if (movedThisFrame) {
        const dx = mouseX - prevX;
        const dy = mouseY - prevY;
        const dist = Math.hypot(dx, dy);

        // Smoothed cursor velocity used as inherited momentum.
        cursorVx = cursorVx * 0.30 + dx * 60 * 0.70;
        cursorVy = cursorVy * 0.30 + dy * 60 * 0.70;

        const count = Math.min(
          FRAME_SPAWN_CAP,
          Math.max(1, Math.ceil(dist / PATH_STRIDE)),
        );
        const intensity = Math.min(1.0, dist / 60);

        // Emit at evenly spaced points along the interpolated path so
        // the ribbon is continuous regardless of pointer event rate.
        for (let k = 0; k < count; k++) {
          const u = (k + 0.5) / count;
          const sx = prevX + dx * u;
          const sy = prevY + dy * u;
          spawn(sx, sy, cursorVx, cursorVy, intensity);
        }

        prevX = mouseX;
        prevY = mouseY;
        movedThisFrame = false;
      } else {
        // Decay cached velocity so any tail-end spawns settle quickly
        // when the cursor stops. We do NOT spawn here.
        cursorVx *= 0.6;
        cursorVy *= 0.6;
      }

      // Full clear every frame so the canvas is always exactly the
      // current live particles, no persistent accumulation that would
      // gradually flood the page.
      ctx.clearRect(0, 0, viewportW, viewportH);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        page[i] += dt;
        if (page[i] >= plife[i]) { alive[i] = 0; continue; }

        const tn = page[i] / plife[i];

        // Cheap curl-noise approximation. Adjacent particles share a
        // smoothly varying flow direction because the noise samples
        // their world position, so the body of fog swirls as a fluid
        // instead of each puff moving independently.
        const s = pseed[i];
        const nx = Math.sin(px[i] * 0.011 + s + page[i] * 1.4)
                 + Math.cos(py[i] * 0.013 + s * 0.7);
        const ny = Math.cos(px[i] * 0.012 - s + page[i] * 1.1)
                 - Math.sin(py[i] * 0.010 + s * 0.9);

        pvx[i] = (pvx[i] + nx * CURL * dt) * DAMPING;
        pvy[i] = (pvy[i] + (ny * CURL + GRAVITY) * dt) * DAMPING;

        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        // Off-screen kill. Conservative margins because puffs stay
        // small and short-lived; they should never roam far.
        if (px[i] < -220 || px[i] > viewportW + 220 ||
            py[i] > viewportH + 220 || py[i] < -260) {
          alive[i] = 0;
          continue;
        }

        // Opacity envelope. Quick fade in over the first 14% so the
        // ribbon appears instantly under the cursor, then an eased
        // fade out over the remainder so it dissipates softly.
        let op;
        if (tn < 0.14) {
          op = tn / 0.14;
        } else {
          const k = (tn - 0.14) / 0.86;
          op = 1 - k * k;
        }
        op *= palpha[i];

        // Tight radius range. Starts small at the cursor, grows
        // modestly with age. This is what stops the fog from
        // blooming into a page-wide cloud.
        const radius = (22 + psize[i] * 18) + tn * 28;
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
