import React, { useEffect, useRef } from 'react';

/**
 * SilkFlag.
 *
 * A Verlet mass-spring cloth simulation rendered to Canvas 2D as raking gold
 * light on black silk. The fabric only. No textures, no images, nothing that
 * can break. Logo and headlines live in a separate HTML content layer that
 * the parent overlays on top.
 *
 * Architectural notes:
 *   The simulation runs in canvas-local coordinates with the cloth's rest
 *   bounding box offset from the canvas edges by pad* values. The pole is
 *   the leftmost column of pinned particles. The rest of the cloth is free
 *   and responds to ambient wind plus a smoothed, directional cursor wind.
 *
 * Shading (the make-or-break detail):
 *   Each quad is filled with a single color sampled from a 256-entry LUT.
 *   The lookup index is a per-quad lightness in [0..1] derived from
 *     (a) a traveling wave phase  -- this is the rake light
 *     (b) horizontal compression  -- folds go darker
 *     (c) vertical-deviation      -- back-facing folds go darker
 *   The LUT ramps from near-black through dark gold-brown into full
 *   #94730D gold and finally a bright #e8c869 sheen.
 *
 * Wind:
 *   ambient   three layered sines vary in space (column, row) and time
 *             with a slow amplitude envelope. Strength is scaled by the
 *             edge factor so ripples travel from pole to free edge.
 *   cursor    raw cursor velocity is smoothed into a target wind vector
 *             with 0.88 inertia. Raw velocity decays at 0.78 each frame so
 *             when the pointer stops the gust decays back to nothing over
 *             roughly a second.
 *
 * Displacement feedback:
 *   each frame we call onTick({ tx, ty, skew }) where tx/ty are the
 *   average displacement of central tracking particles from their rest
 *   positions and skew is a tiny rotation derived from the same average.
 *   The parent applies a muted version of this to the content layer so the
 *   logo and headlines breathe with the fabric.
 */
export default function SilkFlag({
  width  = 760,
  height = 460,
  padLeft   = 60,
  padRight  = 130,
  padTop    = 60,
  padBottom = 90,
  cols = 24,
  rows = 16,
  onTick,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Sizing + DPR ─────────────────────────────────────────────────────
    // The simulation runs in logical pixel coordinates (cssW x cssH). The
    // canvas backing buffer is sized at logical * dpr for crisp pixels; the
    // canvas element fills its parent via CSS so it scales responsively.
    const cssW = width + padLeft + padRight;
    const cssH = height + padTop + padBottom;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ── Particle state in flat Float32Arrays ─────────────────────────────
    const N = cols * rows;
    const px   = new Float32Array(N);
    const py   = new Float32Array(N);
    const opx  = new Float32Array(N);
    const opy  = new Float32Array(N);
    const rx   = new Float32Array(N); // rest x
    const ry   = new Float32Array(N); // rest y
    const pinX = new Float32Array(N);
    const pinY = new Float32Array(N);
    const pinned = new Uint8Array(N);

    const cellW = width  / (cols - 1);
    const cellH = height / (rows - 1);
    const diagRest = Math.hypot(cellW, cellH);
    const bend2W = cellW * 2;
    const bend2H = cellH * 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const X = padLeft + c * cellW;
        const Y = padTop  + r * cellH;
        px[i] = X;  py[i] = Y;
        opx[i] = X; opy[i] = Y;
        rx[i] = X;  ry[i] = Y;
        pinX[i] = X; pinY[i] = Y;
        pinned[i] = c === 0 ? 1 : 0;
      }
    }

    // ── Constraints packed [a, b, restLen, stiffness] ────────────────────
    //   stiffness is the fraction of distance correction applied each
    //   iteration. Structural/shear at 1.0, bend at 0.35 so bends are
    //   only a gentle stiffening, not rigid.
    const consArr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) consArr.push(i, i + 1,     cellW,    1.0);
        if (r < rows - 1) consArr.push(i, i + cols,  cellH,    1.0);
        if (c < cols - 1 && r < rows - 1) {
          consArr.push(i,     i + cols + 1, diagRest, 0.85);
          consArr.push(i + 1, i + cols,     diagRest, 0.85);
        }
        if (c < cols - 2) consArr.push(i, i + 2,        bend2W, 0.35);
        if (r < rows - 2) consArr.push(i, i + cols * 2, bend2H, 0.35);
      }
    }
    const CONS = new Float32Array(consArr);
    const CONS_LEN = CONS.length;

    // ── Tracking particles for displacement feedback ─────────────────────
    const trackIdx = [];
    {
      const r0 = Math.floor(rows * 0.30);
      const r1 = Math.floor(rows * 0.70);
      const c0 = Math.floor(cols * 0.35);
      const c1 = Math.floor(cols * 0.70);
      for (let r = r0; r <= r1; r += 2) {
        for (let c = c0; c <= c1; c += 3) {
          trackIdx.push(r * cols + c);
        }
      }
    }
    const trackCount = trackIdx.length;

    // ── Shade LUT (256 entries, precomputed once) ─────────────────────────
    // Stops define the ramp from black trough to sheen highlight.
    const LUT = buildShadeLUT();

    // ── Wind state ───────────────────────────────────────────────────────
    const hasHover = window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;

    let mouseLocalX = -1e6;
    let mouseLocalY = -1e6;
    let prevClientX = 0;
    let prevClientY = 0;
    let pointerKnown = false;
    let mouseRawVx = 0;
    let mouseRawVy = 0;
    // Smoothed wind (the actual force applied to particles)
    let windX = 0;
    let windY = 0;

    const onMove = (e) => {
      if (!pointerKnown) {
        prevClientX = e.clientX;
        prevClientY = e.clientY;
        pointerKnown = true;
      }
      mouseRawVx = e.clientX - prevClientX;
      mouseRawVy = e.clientY - prevClientY;
      prevClientX = e.clientX;
      prevClientY = e.clientY;

      // The canvas is CSS-scaled to fill its parent, so we have to map
      // displayed pixels back into logical (cloth-coordinate) pixels.
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width  > 0 ? cssW / rect.width  : 1;
      const sy = rect.height > 0 ? cssH / rect.height : 1;
      mouseLocalX = (e.clientX - rect.left) * sx;
      mouseLocalY = (e.clientY - rect.top)  * sy;
    };
    if (hasHover) {
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    // ── Entrance gust: offset old positions so the cloth has initial
    //    rightward velocity. Settling produces the unfurl effect.
    for (let i = 0; i < N; i++) {
      if (pinned[i]) continue;
      const c = i % cols;
      const edge = c / (cols - 1);
      opx[i] = px[i] - 18 - edge * 10;
      opy[i] = py[i] - 6;
    }

    // ── Render-time tracking values (reused, no per-frame allocation) ────
    const tickPayload = { tx: 0, ty: 0, skew: 0 };

    // ── Animation loop ───────────────────────────────────────────────────
    let frame;
    const startT = performance.now();
    const dt = 1 / 60;
    const dt2 = dt * dt;

    const ITER = 5;
    const damping = 0.984;

    const tick = (now) => {
      const elapsed = (now - startT) * 0.001;

      // Smooth wind toward target derived from mouse velocity. Strong
      // inertia gives gusts that build and settle, never snap.
      const targetWindX = mouseRawVx * 0.55;
      const targetWindY = mouseRawVy * 0.45;
      windX = windX * 0.88 + targetWindX * 0.12;
      windY = windY * 0.88 + targetWindY * 0.12;
      // Decay raw velocity so a parked cursor returns wind to zero.
      mouseRawVx *= 0.78;
      mouseRawVy *= 0.78;

      // Slow amplitude envelopes for the ambient breeze. These breathe
      // over tens of seconds, so the wind has gentle gusty character.
      const A1 = 0.55 + Math.sin(elapsed * 0.13) * 0.40;
      const A2 = 0.45 + Math.sin(elapsed * 0.27 + 1.3) * 0.35;
      const t1 = elapsed * 1.05;
      const t2 = elapsed * 2.70;
      const t3 = elapsed * 4.40;

      const gravity = 18;

      // ── Verlet integration ────────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        if (pinned[i]) {
          // Tiny breath on the pole so the attachment does not feel welded.
          const r = (i / cols) | 0;
          py[i] = pinY[i] + Math.sin(elapsed * 1.4 + r * 0.45) * 0.4;
          px[i] = pinX[i];
          opx[i] = px[i];
          opy[i] = py[i];
          continue;
        }

        const c = i % cols;
        const r = (i - c) / cols;
        const edge = c / (cols - 1);                  // 0 pole, 1 free
        const rowOsc = 0.55 + 0.45 * Math.sin(r * 0.85 + 0.4);

        // Layered ambient wind in X. Three sines at decreasing scale.
        const aX =
          ( Math.sin(t1 + r * 0.55 + c * 0.18) * 14 * A1
          + Math.sin(t2 + r * 0.95 + c * 0.34) * 6  * A2
          + Math.sin(t3 + r * 1.70 + c * 0.92) * 2
          ) * (0.30 + edge * 1.10) * rowOsc;

        const aY =
          ( Math.sin(t1 * 0.85 + c * 0.27) * 4 * A1
          + Math.sin(t2 * 0.60 + r * 0.85) * 2 * A2
          ) * (0.35 + edge * 0.75);

        // Cursor gust localised by Gaussian proximity to the mouse.
        const dxm = px[i] - mouseLocalX;
        const dym = py[i] - mouseLocalY;
        const d2  = dxm * dxm + dym * dym;
        // sigma = 200 px gives a soft area gust around the cursor.
        const localGust = Math.exp(-d2 / 40000);
        const wScale = (0.22 + edge * 0.95) * rowOsc;
        const cwX = windX * (0.18 + localGust * 1.6) * wScale * 5.0;
        const cwY = windY * (0.18 + localGust * 1.6) * wScale * 5.0;

        const ax = aX + cwX;
        const ay = aY + gravity * (0.25 + edge * 0.70) + cwY;

        // Verlet step.
        const vx = (px[i] - opx[i]) * damping;
        const vy = (py[i] - opy[i]) * damping;
        opx[i] = px[i];
        opy[i] = py[i];
        px[i] = px[i] + vx + ax * dt2;
        py[i] = py[i] + vy + ay * dt2;
      }

      // ── Constraint relaxation ─────────────────────────────────────────
      for (let it = 0; it < ITER; it++) {
        for (let k = 0; k < CONS_LEN; k += 4) {
          const a    = CONS[k]     | 0;
          const b    = CONS[k + 1] | 0;
          const rest = CONS[k + 2];
          const stif = CONS[k + 3];

          const dx = px[b] - px[a];
          const dy = py[b] - py[a];
          const distSq = dx * dx + dy * dy;
          if (distSq < 0.0001) continue;
          const dist = Math.sqrt(distSq);
          const diff = (dist - rest) / dist * stif;
          const offX = dx * diff * 0.5;
          const offY = dy * diff * 0.5;

          const pa = pinned[a];
          const pb = pinned[b];
          if (pa && pb) continue;
          if (pa) {
            px[b] -= offX * 2;
            py[b] -= offY * 2;
          } else if (pb) {
            px[a] += offX * 2;
            py[a] += offY * 2;
          } else {
            px[a] += offX;
            py[a] += offY;
            px[b] -= offX;
            py[b] -= offY;
          }
        }
      }

      // ── Tracking displacement for the content-layer sync ─────────────
      let sumDx = 0, sumDy = 0;
      for (let t = 0; t < trackCount; t++) {
        const i = trackIdx[t];
        sumDx += px[i] - rx[i];
        sumDy += py[i] - ry[i];
      }
      tickPayload.tx = (sumDx / trackCount) * 0.55;
      tickPayload.ty = (sumDy / trackCount) * 0.25;
      // Skew from average horizontal displacement, normalised to flag width.
      tickPayload.skew = (sumDx / trackCount) / width * 2.4;
      if (onTick) onTick(tickPayload);

      // ── Render ────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, cssW, cssH);

      // Drop shadow.
      const shX = padLeft + width * 0.5;
      const shY = padTop + height + 18;
      const sgrad = ctx.createRadialGradient(shX, shY, 4, shX, shY, width * 0.6);
      sgrad.addColorStop(0,   'rgba(0,0,0,0.42)');
      sgrad.addColorStop(0.6, 'rgba(0,0,0,0.1)');
      sgrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(shX, shY);
      ctx.scale(1, 0.28);
      ctx.translate(-shX, -shY);
      ctx.fillStyle = sgrad;
      ctx.fillRect(0, shY - 100, cssW, 220);
      ctx.restore();

      renderCloth(
        ctx, px, py, cols, rows, cellW, cellH, LUT, elapsed,
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      if (hasHover) window.removeEventListener('pointermove', onMove);
    };
  }, [width, height, padLeft, padRight, padTop, padBottom, cols, rows, onTick]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none' }}
    />
  );
}

// ── Per-quad cloth rendering ─────────────────────────────────────────────────

function renderCloth(ctx, px, py, cols, rows, restW, restH, LUT, t) {
  // Pre-compute time-varying scalars used inside the inner loop.
  const phaseT1 = t * 0.95;
  const phaseT2 = t * 1.65;

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const i0 = r * cols + c;
      const i1 = i0 + 1;
      const i2 = i0 + cols;
      const i3 = i2 + 1;

      const x0 = px[i0], y0 = py[i0];
      const x1 = px[i1], y1 = py[i1];
      const x2 = px[i2], y2 = py[i2];
      const x3 = px[i3], y3 = py[i3];

      // Quad geometry derived from corner positions.
      const widthTop = x1 - x0;
      const widthBot = x3 - x2;
      const avgW = (widthTop + widthBot) * 0.5;
      const heightL = y2 - y0;
      const heightR = y3 - y1;
      const avgH = (heightL + heightR) * 0.5;

      // Horizontal compression: positive when folded (narrower than rest).
      const hCompression = 1 - avgW / restW;
      // Vertical deviation: positive when stretched downward, negative when squashed.
      const vDeviation = (avgH - restH) / restH;

      // Traveling wave phase. Two sines combined give a non-uniform pattern
      // that flows from pole to free edge over time.
      const phaseA = Math.sin(phaseT1 + c * 0.26 + r * 0.08);
      const phaseB = Math.sin(phaseT2 + c * 0.45 - r * 0.18) * 0.45;
      const phase = (phaseA + phaseB) * 0.5; // -1..+1

      // Lightness in [0..1]. Center 0.45 keeps base tone fairly dark; the
      // phase term swings the rake light across; compression darkens folds;
      // back-facing vertical deviation darkens further.
      let lightness =
        0.46
        + phase * 0.40
        - Math.max(0, hCompression) * 0.55
        - Math.max(0, vDeviation) * 0.10;

      if (lightness < 0) lightness = 0;
      else if (lightness > 1) lightness = 1;

      // LUT lookup.
      ctx.fillStyle = LUT[(lightness * 255) | 0];
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ── Shade LUT ────────────────────────────────────────────────────────────────

function buildShadeLUT() {
  // Stops chosen to produce black silk with gold rake-light.
  // index -> [r, g, b]
  const stops = [
    [0,   3,   3,   3 ],   // deepest trough (almost black)
    [55,  9,   8,   6 ],   // dark
    [110, 50,  35,  9 ],   // very dark gold-brown
    [165, 120, 90,  18],   // mid gold
    [210, 200, 152, 30],   // bright gold
    [240, 232, 200, 105],  // sheen highlight
    [255, 252, 222, 152],  // brightest specular
  ];
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    let prev = stops[0], next = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (i >= stops[s][0] && i <= stops[s + 1][0]) {
        prev = stops[s]; next = stops[s + 1];
        break;
      }
    }
    const range = next[0] - prev[0] || 1;
    const k = (i - prev[0]) / range;
    const R = (prev[1] + (next[1] - prev[1]) * k) | 0;
    const G = (prev[2] + (next[2] - prev[2]) * k) | 0;
    const B = (prev[3] + (next[3] - prev[3]) * k) | 0;
    lut[i] = `rgb(${R},${G},${B})`;
  }
  return lut;
}
