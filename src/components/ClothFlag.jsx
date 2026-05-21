import React, { useEffect, useRef } from 'react';

/**
 * ClothFlag.
 *
 * Verlet mass-spring cloth simulation. Renders a rectangular flag whose left
 * edge is pinned (the implicit pole) and whose other edges respond to wind.
 * The supplied logo image is texture-mapped onto the deforming mesh by drawing
 * each grid cell as two affine-warped triangles, so the logo ripples WITH the
 * cloth instead of sitting flatly on top.
 *
 * Wind:
 *   ambient  layered sine waves vary in space and time so different parts of
 *            the cloth catch the breeze independently (traveling ripples).
 *   cursor   the page-level cursor velocity is smoothed into a directional
 *            wind force. Falloff near the cursor adds local gusts. The wind
 *            eases in and decays back to zero on its own.
 *
 * Shading:
 *   each quad is darkened in proportion to its horizontal compression so folds
 *   read as fabric depth, and stretched quads catch a faint warm tint.
 */
export default function ClothFlag({
  src,
  width  = 360,
  height = 220,
  // Padding around the cloth area inside the canvas. Lets the cloth billow
  // beyond its rest position without clipping. Mostly to the right and bottom.
  padLeft   = 36,
  padRight  = 96,
  padTop    = 38,
  padBottom = 64,
  cols = 18,
  rows = 12,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Sizing + DPR setup ────────────────────────────────────────────────
    const cssW = width + padLeft + padRight;
    const cssH = height + padTop + padBottom;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ── Particle grid (flat arrays for cache friendliness) ────────────────
    const N = cols * rows;
    const px    = new Float32Array(N);
    const py    = new Float32Array(N);
    const opx   = new Float32Array(N);
    const opy   = new Float32Array(N);
    const pinX  = new Float32Array(N); // pinned anchor x (left column)
    const pinY  = new Float32Array(N);
    const pinned = new Uint8Array(N);

    const cellW = width  / (cols - 1);
    const cellH = height / (rows - 1);
    const diagRest = Math.hypot(cellW, cellH);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const X = padLeft + c * cellW;
        const Y = padTop  + r * cellH;
        px[i]  = X;  py[i]  = Y;
        opx[i] = X;  opy[i] = Y;
        pinX[i] = X; pinY[i] = Y;
        pinned[i] = c === 0 ? 1 : 0;
      }
    }

    // ── Constraints (structural + shear) ──────────────────────────────────
    // [aIndex, bIndex, restLength] tuples packed into a flat Float32Array
    // for tight inner-loop iteration.
    const cons = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) cons.push(i, i + 1,        cellW);
        if (r < rows - 1) cons.push(i, i + cols,     cellH);
        if (c < cols - 1 && r < rows - 1) {
          // Shear diagonals stiffen the mesh so it does not collapse.
          cons.push(i,     i + cols + 1, diagRest);
          cons.push(i + 1, i + cols,     diagRest);
        }
      }
    }
    const consArr = new Float32Array(cons);
    const consLen = consArr.length;

    // ── Logo texture ──────────────────────────────────────────────────────
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let imgReady = false;
    let imgW = 1, imgH = 1;
    img.onload = () => {
      imgReady = true;
      imgW = img.naturalWidth  || img.width  || 1;
      imgH = img.naturalHeight || img.height || 1;
    };
    img.src = src;

    // ── Mouse tracking ────────────────────────────────────────────────────
    const hasHover = window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;

    // Mouse position in canvas-local coords. Off-screen at start.
    let mouseX = -1e6;
    let mouseY = -1e6;
    let prevMouseClientX = 0;
    let prevMouseClientY = 0;
    let mouseClientVx = 0;
    let mouseClientVy = 0;
    let pointerActive = false;

    // Smoothed cursor-wind force, used in the cloth update.
    let windX = 0;
    let windY = 0;

    const onMove = (e) => {
      if (!pointerActive) {
        prevMouseClientX = e.clientX;
        prevMouseClientY = e.clientY;
        pointerActive = true;
      }
      mouseClientVx = e.clientX - prevMouseClientX;
      mouseClientVy = e.clientY - prevMouseClientY;
      prevMouseClientX = e.clientX;
      prevMouseClientY = e.clientY;

      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    if (hasHover) {
      window.addEventListener('pointermove', onMove, { passive: true });
    }

    // ── Animation loop ────────────────────────────────────────────────────
    let frame;
    const startT = performance.now();

    // Apply a small initial gust so the flag unfurls instead of starting limp.
    for (let i = 0; i < N; i++) {
      if (!pinned[i]) {
        const c = i % cols;
        const edge = c / (cols - 1);
        opx[i] = px[i] - edge * 6;
        opy[i] = py[i] - edge * 2;
      }
    }

    const tick = (now) => {
      const elapsed = (now - startT) * 0.001;
      // Fixed timestep keeps Verlet stable regardless of frame jitter.
      const dt = 1 / 60;

      // Smooth wind toward target. Target derived from mouse velocity.
      // Strong smoothing makes the wind feel like real air mass: gusts
      // build up and decay over many frames rather than snapping.
      const targetWindX = mouseClientVx * 0.55;
      const targetWindY = mouseClientVy * 0.45 + 0.0;
      windX = windX * 0.88 + targetWindX * 0.12;
      windY = windY * 0.88 + targetWindY * 0.12;
      // Decay raw mouse velocity so when the pointer stops we stop blowing.
      mouseClientVx *= 0.78;
      mouseClientVy *= 0.78;

      // Ambient breeze parameters. Two large-scale waves and one small
      // flutter, each at different temporal and spatial frequencies.
      const A1 =  Math.sin(elapsed * 0.55) * 0.55 + 0.6;  // 0..1.2-ish
      const A2 =  Math.sin(elapsed * 1.30 + 1.1) * 0.4 + 0.4;
      const t1 = elapsed * 1.10;
      const t2 = elapsed * 2.80;

      const damping = 0.984;
      const gravity = 16;

      // Verlet integration with per-particle wind.
      for (let i = 0; i < N; i++) {
        if (pinned[i]) {
          // Pole has a tiny vertical sway so it feels attached, not welded.
          py[i] = pinY[i] + Math.sin(elapsed * 1.6 + i * 0.7) * 0.4;
          px[i] = pinX[i];
          opx[i] = px[i];
          opy[i] = py[i];
          continue;
        }
        const c = i % cols;
        const r = (i - c) / cols;
        const edge = c / (cols - 1);            // 0 at pole, 1 at free edge
        const rowFactor = 0.6 + 0.4 * Math.sin(r * 0.9);

        // Position-and-time varying ambient wind.
        const aX =
          ( Math.sin(t1 + r * 0.55 + c * 0.18) * 11 * A1
          + Math.sin(t2 + r * 1.10 + c * 0.34) * 4  * A2
          + Math.sin(elapsed * 4.2 + r * 1.7 + c * 0.9) * 1.4
          ) * (0.35 + edge * 0.9);

        const aY =
          ( Math.sin(t1 * 0.8 + c * 0.27) * 5 * A1
          + Math.sin(t2 * 0.6 + r * 0.85) * 3 * A2
          ) * (0.4 + edge * 0.6);

        // Localised cursor gust falloff (Gaussian in canvas space).
        const dxm = px[i] - mouseX;
        const dym = py[i] - mouseY;
        const d2  = dxm * dxm + dym * dym;
        const localGust = Math.exp(-d2 / (180 * 180));

        const wScale = (0.25 + edge * 0.9) * rowFactor;
        const cwX = windX * (0.18 + localGust * 1.4) * wScale * 4.5;
        const cwY = windY * (0.18 + localGust * 1.4) * wScale * 4.5;

        const ax = aX + cwX;
        const ay = aY + gravity * (0.3 + edge * 0.7) + cwY;

        // Verlet step.
        const vx = (px[i] - opx[i]) * damping;
        const vy = (py[i] - opy[i]) * damping;
        opx[i] = px[i];
        opy[i] = py[i];
        px[i] = px[i] + vx + ax * dt * dt;
        py[i] = py[i] + vy + ay * dt * dt;
      }

      // Relax constraints. 3 iterations is plenty for this resolution.
      const ITER = 3;
      for (let it = 0; it < ITER; it++) {
        for (let k = 0; k < consLen; k += 3) {
          const a    = consArr[k]     | 0;
          const b    = consArr[k + 1] | 0;
          const rest = consArr[k + 2];
          const dx = px[b] - px[a];
          const dy = py[b] - py[a];
          const distSq = dx * dx + dy * dy;
          if (distSq < 0.0001) continue;
          const dist = Math.sqrt(distSq);
          const diff = (dist - rest) / dist;
          const offX = dx * diff * 0.5;
          const offY = dy * diff * 0.5;
          const ap = pinned[a];
          const bp = pinned[b];
          if (ap && bp) continue;
          if (ap) {
            px[b] -= offX * 2; py[b] -= offY * 2;
          } else if (bp) {
            px[a] += offX * 2; py[a] += offY * 2;
          } else {
            px[a] += offX; py[a] += offY;
            px[b] -= offX; py[b] -= offY;
          }
        }
      }

      // ── Render ─────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, cssW, cssH);

      // Soft drop shadow under the cloth (a flat ellipse on the background).
      const shadowCenterX = padLeft + width  * 0.5;
      const shadowCenterY = padTop  + height + 16;
      const sgrad = ctx.createRadialGradient(
        shadowCenterX, shadowCenterY, 2,
        shadowCenterX, shadowCenterY, width * 0.55,
      );
      sgrad.addColorStop(0,   'rgba(0,0,0,0.45)');
      sgrad.addColorStop(0.6, 'rgba(0,0,0,0.12)');
      sgrad.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(shadowCenterX, shadowCenterY);
      ctx.scale(1, 0.32);
      ctx.translate(-shadowCenterX, -shadowCenterY);
      ctx.fillStyle = sgrad;
      ctx.fillRect(0, shadowCenterY - 80, cssW, 200);
      ctx.restore();

      if (imgReady) {
        renderCloth(ctx, px, py, cols, rows, img, imgW, imgH, cellW);
      } else {
        // Pre-load fallback: solid black flag silhouette in its rest pose.
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.moveTo(padLeft, padTop);
        ctx.lineTo(padLeft + width, padTop);
        ctx.lineTo(padLeft + width, padTop + height);
        ctx.lineTo(padLeft, padTop + height);
        ctx.closePath();
        ctx.fill();
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      if (hasHover) window.removeEventListener('pointermove', onMove);
    };
  }, [src, width, height, padLeft, padRight, padTop, padBottom, cols, rows]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="AVbot"
      style={{ display: 'block', userSelect: 'none', pointerEvents: 'none' }}
    />
  );
}

// ── Render helpers ────────────────────────────────────────────────────────

function renderCloth(ctx, px, py, cols, rows, img, imgW, imgH, restW) {
  // We render quad by quad. Each quad is two affine-warped triangles. After
  // the textured triangles we draw a per-quad shading fill that darkens
  // compressed folds and warmly tints stretched ridges.
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

      const u0 = (c       / (cols - 1)) * imgW;
      const v0 = (r       / (rows - 1)) * imgH;
      const u1 = ((c + 1) / (cols - 1)) * imgW;
      const v1 = v0;
      const u2 = u0;
      const v2 = ((r + 1) / (rows - 1)) * imgH;
      const u3 = u1;
      const v3 = v2;

      drawTexturedTri(ctx, img,
        x0, y0, x1, y1, x2, y2,
        u0, v0, u1, v1, u2, v2);

      drawTexturedTri(ctx, img,
        x1, y1, x3, y3, x2, y2,
        u1, v1, u3, v3, u2, v2);

      // Shading from compression.
      const avgW = ((x1 - x0) + (x3 - x2)) * 0.5;
      const stretch = avgW / restW;
      if (stretch < 1) {
        const fold = 1 - stretch;
        ctx.fillStyle = `rgba(0,0,0,${Math.min(0.55, fold * 0.85)})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.fill();
      } else {
        const high = Math.min(0.22, (stretch - 1) * 0.6);
        if (high > 0.02) {
          ctx.fillStyle = `rgba(241,213,134,${high})`;
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
  }
}

function drawTexturedTri(
  ctx, img,
  x0, y0, x1, y1, x2, y2,
  u0, v0, u1, v1, u2, v2,
) {
  // Affine transform that maps the source triangle (u_i, v_i) to the
  // destination triangle (x_i, y_i). Derivation: solve A * U = X for A,
  // where U is the source matrix and X is the destination matrix in
  // homogeneous form.
  const du1 = u1 - u0, dv1 = v1 - v0;
  const du2 = u2 - u0, dv2 = v2 - v0;
  const det = du1 * dv2 - du2 * dv1;
  if (Math.abs(det) < 0.0001) return;
  const invDet = 1 / det;
  const dx1 = x1 - x0, dy1 = y1 - y0;
  const dx2 = x2 - x0, dy2 = y2 - y0;
  const a = (dx1 * dv2 - dx2 * dv1) * invDet;
  const b = (dx2 * du1 - dx1 * du2) * invDet;
  const c = (dy1 * dv2 - dy2 * dv1) * invDet;
  const d = (dy2 * du1 - dy1 * du2) * invDet;
  const e = x0 - a * u0 - b * v0;
  const f = y0 - c * u0 - d * v0;

  ctx.save();
  // Clip to destination triangle. AA on the clip can leave hairline seams
  // between adjacent triangles; we intentionally accept this and the
  // shading pass on top hides it visually.
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();
  // Canvas matrix order is (a, b, c, d, e, f) where x' = a*x + c*y + e
  // and y' = b*x + d*y + f. Our matrix maps (u,v) to (x,y) as
  // x = a*u + b*v + e, y = c*u + d*v + f, so we pass (a, c, b, d, e, f).
  ctx.transform(a, c, b, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
