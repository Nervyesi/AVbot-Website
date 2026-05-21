import React, { useEffect, useRef } from 'react';

/**
 * CursorSmoke (volumetric gold vapor).
 *
 * A pool of large, soft, gold radial puffs drift under a curl-noise flow
 * field. When the cursor moves, puffs spawn along its path with inherited
 * velocity, so movement carves an organic trail. When the cursor stops,
 * ambient emission keeps a few puffs per second flowing from the last
 * cursor position, and a gentle gravity pulls them down while spread
 * forces fan them sideways. Additive blending lets overlapping puffs
 * merge into luminous haze instead of reading as separate dots.
 *
 * Performance:
 *   - One pre-rendered 256 sprite reused for every draw, so per-frame
 *     work is N drawImage calls with zero allocations.
 *   - 128-particle pool with circular slot reuse and a flat-array state.
 *   - Single rAF, passive pointermove listener, dPR capped at 2.
 *   - Disabled entirely on (hover: none) devices.
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

    // ── Pre-rendered gold puff sprite ─────────────────────────────────────
    // Soft radial gradient. Hot core, warm body, transparent halo. Used as
    // the drawImage source for every puff, scaled per-particle.
    const SPRITE_SIZE = 256;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPRITE_SIZE;
    {
      const sctx = sprite.getContext('2d');
      const c = SPRITE_SIZE / 2;
      const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
      grad.addColorStop(0.00, 'rgba(232,200,105,1.00)');
      grad.addColorStop(0.18, 'rgba(218,178,86,0.85)');
      grad.addColorStop(0.40, 'rgba(165,124,28,0.45)');
      grad.addColorStop(0.65, 'rgba(148,115,13,0.18)');
      grad.addColorStop(0.85, 'rgba(148,115,13,0.05)');
      grad.addColorStop(1.00, 'rgba(148,115,13,0.00)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
    }

    // ── Particle pool (flat Float32Arrays, no per-frame allocs) ───────────
    const MAX = 128;
    const px    = new Float32Array(MAX);
    const py    = new Float32Array(MAX);
    const pvx   = new Float32Array(MAX);
    const pvy   = new Float32Array(MAX);
    const page  = new Float32Array(MAX);
    const plife = new Float32Array(MAX);
    const psize = new Float32Array(MAX);
    const alive = new Uint8Array(MAX);
    let nextSlot = 0;

    // ── Mouse tracking ───────────────────────────────────────────────────
    let mouseX = -1e6, mouseY = -1e6;
    let prevMouseX = mouseX, prevMouseY = mouseY;
    let cursorVx = 0, cursorVy = 0;
    let initialised = false;
    let movedSinceFrame = false;
    let lastMoveAt = 0;

    const onMove = (e) => {
      if (!initialised) {
        mouseX = prevMouseX = e.clientX;
        mouseY = prevMouseY = e.clientY;
        initialised = true;
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;
      movedSinceFrame = true;
      lastMoveAt = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // ── Spawn helper ─────────────────────────────────────────────────────
    function spawn(x, y, vx, vy, lifeBase) {
      const slot = nextSlot;
      nextSlot = (nextSlot + 1) % MAX;
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * 6;
      px[slot]    = x + Math.cos(ang) * r;
      py[slot]    = y + Math.sin(ang) * r;
      // Inherit a fraction of the cursor velocity. A small random kick adds
      // organic variation so puffs do not all start with identical drift.
      pvx[slot]   = vx * 0.18 + (Math.random() - 0.5) * 22;
      pvy[slot]   = vy * 0.18 + (Math.random() - 0.5) * 22 - 6;
      page[slot]  = 0;
      plife[slot] = lifeBase + Math.random() * 0.9;
      // Base size multiplier (final radius is computed each frame from age
      // plus this multiplier; ranges roughly 70 to 220 pixels).
      psize[slot] = 0.85 + Math.random() * 0.55;
      alive[slot] = 1;
    }

    // ── Curl-style flow field (cheap layered sin/cos) ────────────────────
    // Returns the acceleration vector for a puff at (x, y) at time t. The
    // field flows on long scales so puffs swirl rather than walk in lines.
    function flowFieldX(x, y, t) {
      return (
        Math.sin(x * 0.0050 + y * 0.0034 + t * 0.55) * 22 +
        Math.sin(x * 0.0125 - y * 0.0080 + t * 0.31) * 11 +
        Math.sin(x * 0.0260 + y * 0.0090 - t * 0.92) *  5
      );
    }
    function flowFieldY(x, y, t) {
      return (
        Math.cos(x * 0.0036 + y * 0.0055 + t * 0.61) * 20 +
        Math.cos(x * 0.0080 + y * 0.0140 - t * 0.42) * 10 +
        Math.cos(x * 0.0210 - y * 0.0070 + t * 0.85) *  5
      );
    }

    // ── Animation loop ───────────────────────────────────────────────────
    let frame;
    let lastT = performance.now();
    let ambientAcc = 0; // accumulator for ambient idle emission

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) * 0.001);
      lastT = now;
      const t = now * 0.001;

      // Cursor velocity smoothed for trail spawning.
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const moveSpeed = Math.hypot(dx, dy);
      // Lerp the velocity so spawned puffs inherit a smoothed direction.
      cursorVx = cursorVx * 0.7 + dx * 0.3 * 60;
      cursorVy = cursorVy * 0.7 + dy * 0.3 * 60;

      // Spawn from the cursor path. 1 to 3 puffs per frame proportional to
      // speed. We use moveSpeed (pixel delta this frame) as the metric.
      if (movedSinceFrame && initialised) {
        const emit = Math.min(3, 1 + Math.floor(moveSpeed / 26));
        // Distribute spawn points along the cursor path to avoid clumping
        // at very fast cursor moves.
        for (let k = 0; k < emit; k++) {
          const u = (k + 1) / (emit + 1);
          const sx = prevMouseX + dx * u;
          const sy = prevMouseY + dy * u;
          spawn(sx, sy, cursorVx, cursorVy, 1.8);
        }
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        movedSinceFrame = false;
      }

      // Ambient idle emission: when the cursor has not moved recently,
      // keep haze drifting from the last position so it feels alive.
      const idleFor = now - lastMoveAt;
      if (initialised && idleFor > 250) {
        ambientAcc += dt;
        // One puff every ~140ms while idle.
        while (ambientAcc >= 0.14) {
          ambientAcc -= 0.14;
          spawn(mouseX, mouseY, 0, 0, 2.1);
        }
      } else {
        ambientAcc = 0;
      }

      // Update each puff.
      const GRAVITY  = 18;   // gentle downward drift
      const DAMPING  = 0.965;
      const SPREAD   = 4.5;  // outward push as puff ages
      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        page[i] += dt;
        if (page[i] >= plife[i]) {
          alive[i] = 0;
          continue;
        }

        const x = px[i];
        const y = py[i];

        // Flow field acceleration. The field is large-scale so motion is
        // smooth and continuous across nearby puffs.
        const ax = flowFieldX(x, y, t);
        const ay = flowFieldY(x, y, t) + GRAVITY;

        // Outward spread component decays over life and is stronger when
        // the puff has been alive a while: a gentle billowing-apart force.
        // Use a tiny per-puff vector based on its current velocity to
        // avoid creating a true zero-divide singularity.
        const vmag = Math.hypot(pvx[i], pvy[i]) || 1;
        const spreadX = (pvx[i] / vmag) * SPREAD;
        const spreadY = (pvy[i] / vmag) * SPREAD * 0.4;

        pvx[i] = (pvx[i] + (ax + spreadX) * dt) * DAMPING;
        pvy[i] = (pvy[i] + (ay + spreadY) * dt) * DAMPING;

        px[i] += pvx[i] * dt;
        py[i] += pvy[i] * dt;

        // Mark dead if drifted far off-screen.
        if (px[i] < -260 || px[i] > viewportW + 260 ||
            py[i] < -260 || py[i] > viewportH + 260) {
          alive[i] = 0;
        }
      }

      // Render. Full clear each frame for clean haze, no muddy ghost rect.
      ctx.clearRect(0, 0, viewportW, viewportH);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        const tn = page[i] / plife[i];
        // Opacity curve: fade in for 12% of life, ride the plateau, then
        // fade out for the rest. Peak alpha around 0.11 keeps the vapor
        // visible without obscuring content.
        let op;
        if (tn < 0.12) op = tn / 0.12;
        else op = 1 - (tn - 0.12) / 0.88;
        op *= 0.13 * (0.8 + psize[i] * 0.4);

        // Puff radius grows with age (diffusion). Starts wide.
        const radius = (78 + psize[i] * 70) + tn * 90;
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
