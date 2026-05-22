import React, { useEffect, useRef } from 'react';

/**
 * CursorSmoke (concert fog).
 *
 * Subtle, low-lying gold haze. Concert CO2 fog physics: puffs sink under
 * gravity and spread sideways as they approach the bottom of the viewport,
 * billowing along an invisible floor. Tasteful scale, slow motion, additive
 * glow so overlapping puffs read as luminous mist rather than dots.
 *
 * Performance:
 *   - 256-pixel pre-rendered gold sprite reused for every draw.
 *   - 96-particle pool with circular slot reuse and flat-array state.
 *   - Zero per-frame allocations.
 *   - dPR capped at 2, single rAF, passive listener.
 *   - Disabled on touch / no-hover devices.
 */
export default function CursorSmoke() {
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

    // ── Pre-rendered gold puff sprite ────────────────────────────────────
    const SPRITE_SIZE = 256;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0.00, 'rgba(248,225,138,1.00)');
      grad.addColorStop(0.20, 'rgba(218,178,86,0.80)');
      grad.addColorStop(0.45, 'rgba(165,124,28,0.32)');
      grad.addColorStop(0.70, 'rgba(148,115,13,0.10)');
      grad.addColorStop(1.00, 'rgba(148,115,13,0.00)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // ── Particle pool ────────────────────────────────────────────────────
    const MAX = 96;
    const px    = new Float32Array(MAX);
    const py    = new Float32Array(MAX);
    const pvx   = new Float32Array(MAX);
    const pvy   = new Float32Array(MAX);
    const page  = new Float32Array(MAX);
    const plife = new Float32Array(MAX);
    const psize = new Float32Array(MAX);
    const pdir  = new Int8Array(MAX);     // -1 or +1 lateral bias per puff
    const alive = new Uint8Array(MAX);
    let nextSlot = 0;

    // ── Mouse state ──────────────────────────────────────────────────────
    let mouseX = -1e6, mouseY = -1e6;
    let prevMouseX = mouseX, prevMouseY = mouseY;
    let initialised = false;
    let movedThisFrame = false;
    let lastMoveAt = 0;
    let lastEmitAt = 0;
    let lastIdleEmitAt = 0;

    const onMove = (e) => {
      if (!initialised) {
        mouseX = prevMouseX = e.clientX;
        mouseY = prevMouseY = e.clientY;
        initialised = true;
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      movedThisFrame = true;
      lastMoveAt = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    function spawn(x, y, vxBase, vyBase, lifeBase) {
      const slot = nextSlot;
      nextSlot = (nextSlot + 1) % MAX;
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 4;
      px[slot]    = x + Math.cos(a) * r;
      py[slot]    = y + Math.sin(a) * r;
      // Cursor velocity barely transfers. Concert fog drifts on its own
      // physics, not on cursor inertia.
      pvx[slot]   = vxBase * 0.04 + (Math.random() - 0.5) * 10;
      pvy[slot]   = vyBase * 0.04 + (Math.random() - 0.5) * 6 + 2;
      page[slot]  = 0;
      plife[slot] = lifeBase + Math.random() * 1.1;
      psize[slot] = 0.75 + Math.random() * 0.55;
      pdir[slot]  = Math.random() < 0.5 ? -1 : 1;
      alive[slot] = 1;
    }

    // ── Curl flow (gentle, mostly horizontal swirl). ─────────────────────
    function flowX(x, y, t) {
      return (
        Math.sin(x * 0.0040 + y * 0.0030 + t * 0.35) * 9 +
        Math.sin(x * 0.0095 - y * 0.0065 + t * 0.22) * 5
      );
    }
    function flowY(x, y, t) {
      return (
        Math.cos(x * 0.0035 + y * 0.0050 + t * 0.45) * 4 +
        Math.cos(x * 0.0075 + y * 0.0110 - t * 0.30) * 2
      );
    }

    let frame;
    let lastT = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) * 0.001);
      lastT = now;
      const t = now * 0.001;

      // Emit while moving. Throttle so a fast cursor sweep does not flood
      // the pool. Concert fog is meant to be sparse and slow.
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const speed = Math.hypot(dx, dy);

      if (movedThisFrame && now - lastEmitAt >= 32) {
        const emit = Math.min(2, 1 + Math.floor(speed / 60));
        for (let k = 0; k < emit; k++) {
          const u = (k + 1) / (emit + 1);
          const sx = prevMouseX + dx * u;
          const sy = prevMouseY + dy * u;
          spawn(sx, sy, dx, dy, 2.6);
        }
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        movedThisFrame = false;
        lastEmitAt = now;
      }

      // Idle emission from the last cursor position. Keeps a faint trail
      // sinking and spreading while the user is reading.
      if (initialised && now - lastMoveAt > 200 && now - lastIdleEmitAt >= 220) {
        spawn(mouseX, mouseY, 0, 0, 2.9);
        lastIdleEmitAt = now;
      }

      // Physics + render.
      const GRAVITY   = 36;       // stronger downward pull, fog sinks
      const DAMPING   = 0.955;
      const FLOOR_PCT = 0.95;     // "floor" is the lower 95% of the viewport

      // Render setup.
      ctx.clearRect(0, 0, viewportW, viewportH);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        page[i] += dt;
        if (page[i] >= plife[i]) {
          alive[i] = 0;
          continue;
        }

        const tn = page[i] / plife[i];

        // Curl flow + gravity.
        const fX = flowX(px[i], py[i], t);
        const fY = flowY(px[i], py[i], t);

        // Lateral spread grows as the puff descends below ~60% viewport
        // height, so puffs hug the floor and billow sideways instead of
        // ballooning radially around the cursor.
        const heightFactor = Math.max(0, (py[i] / viewportH) - 0.45) / 0.45;
        const lateral = pdir[i] * heightFactor * 32;

        pvx[i] = (pvx[i] + (fX + lateral) * dt) * DAMPING;
        pvy[i] = (pvy[i] + (fY + GRAVITY) * dt) * DAMPING;

        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        // Soft floor clamp. When the puff reaches the floor it cannot sink
        // further; it just slides sideways with damping.
        const floorY = viewportH * FLOOR_PCT;
        if (py[i] > floorY) {
          py[i] = floorY;
          pvy[i] *= 0.3;
        }

        // Off-screen kill.
        if (px[i] < -300 || px[i] > viewportW + 300) {
          alive[i] = 0;
          continue;
        }

        // Opacity curve: fade in over 12% of life, plateau, fade out.
        let op;
        if (tn < 0.12) op = tn / 0.12;
        else op = 1 - (tn - 0.12) / 0.88;
        // Peak alpha intentionally low so vapor reads as restrained haze.
        op *= 0.075 * (0.7 + psize[i] * 0.35);

        // Radius stays modest. Concert fog tendrils are wisps, not blobs.
        const radius = (32 + psize[i] * 28) + tn * 36;
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
