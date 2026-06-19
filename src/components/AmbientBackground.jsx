import React, { useEffect, useRef } from 'react';

/**
 * AmbientBackground.
 *
 * Page-wide cinematic atmosphere that sits BEHIND all content. Three layers:
 *   1. A 2D canvas of slow-drifting gold particles (multiple sizes/depths).
 *   2. A periodic vertical scan line that sweeps the viewport.
 *   3. A static SVG grain overlay for filmic depth.
 *
 * Deliberately uses a 2D canvas (not WebGL) and never paints an opaque fill
 * (clearRect + additive dot draws only), so it cannot composite over the
 * page the way the old WebGL CursorGas did. It is mounted as a child of the
 * relative page root at zIndex 0, below the zIndex 1 content wrapper, and is
 * pointer-events:none and aria-hidden.
 *
 * Honors prefers-reduced-motion: no canvas RAF, no scan sweep, just a faint
 * static vignette so the page still has depth.
 */

const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>" +
      "<feColorMatrix type='saturate' values='0'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/></svg>"
  );

function prefersReducedMotion() {
  try {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return false;
  }
}

export default function AmbientBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let frame = 0;
    let particles = [];
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      // Particle density scales with viewport area, capped for sanity.
      // Far fewer particles on small screens to preserve battery.
      const isMobile = w < 768;
      const count = Math.min(isMobile ? 28 : 90, Math.round((w * h) / (isMobile ? 42000 : 26000)));
      particles = new Array(count).fill(0).map(() => {
        const depth = Math.random(); // 0 = far/slow/faint, 1 = near
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + depth * 1.8,
          vy: (0.08 + depth * 0.35) * -1, // drift upward
          sway: 0.2 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
          a: 0.05 + depth * 0.22,
        };
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (t) => {
      raf = requestAnimationFrame(draw);
      frame++;
      // Throttle to roughly half rate on small screens.
      if (w < 768 && (frame & 1)) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        const x = p.x + Math.sin(t * 0.0004 + p.phase) * p.sway * 6;
        if (p.y < -8) {
          p.y = h + 8;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 178, 96, ${p.a})`;
        ctx.fill();
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Faint static vignette so depth survives even under reduced motion. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 12%, rgba(200,168,78,0.05) 0%, rgba(10,10,10,0) 55%)',
        }}
      />

      {/* Drifting gold particles. */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Periodic scan line. */}
      <div
        className="av-amb-scanline"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '180px',
          background:
            'linear-gradient(to bottom, rgba(200,168,78,0) 0%, rgba(200,168,78,0.06) 50%, rgba(200,168,78,0) 100%)',
          animation: 'av-scan-sweep 16s linear infinite',
          willChange: 'transform, opacity',
        }}
      />

      {/* Filmic grain. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${GRAIN_SVG}")`,
          backgroundSize: '180px 180px',
          opacity: 0.035,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
