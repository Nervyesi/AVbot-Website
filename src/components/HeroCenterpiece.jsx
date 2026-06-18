import React from 'react';
import { motion } from 'framer-motion';

/**
 * HeroCenterpiece.
 *
 * Code-generated cinematic gold motif behind the logo. Counter-rotating SVG
 * orbital rings with travelling gold nodes, a breathing core, a hot inner
 * spot, a faint halo, and an outer ring of fourteen module glyphs that orbit
 * slowly (each counter-rotated to stay upright).
 *
 * When `boot` is true (first visit in a session) the whole motif erupts from
 * a single core: the core ignites, the rings scale in, and the fourteen
 * glyphs emerge with a stagger. When `boot` is false it snaps to the steady
 * state instantly. Pure CSS animation drives the continuous orbit; framer
 * handles the one-shot eruption.
 */

const MODULE_GLYPHS = ['📊', '✅', '🎭', '📝', '🎫', '⚔️', '🔁', '🎁', '💼', '📡', '💬', '⚙️', '🛡️', '📋'];
const RING_RADIUS_PCT = 47; // glyph ring radius, aligned to the outer orbital

export default function HeroCenterpiece({ boot = false }) {
  // Eruption timing for the orbital container.
  const eruptInitial = boot ? { scale: 0.35, opacity: 0 } : { scale: 1, opacity: 1 };
  const eruptAnimate = { scale: 1, opacity: 1 };
  const eruptTransition = boot
    ? { duration: 1.1, delay: 0.35, ease: [0.16, 0.7, 0.18, 1] }
    : { duration: 0 };

  return (
    <motion.div
      aria-hidden="true"
      initial={eruptInitial}
      animate={eruptAnimate}
      transition={eruptTransition}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(420px, 60vw, 780px)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Outer atmospheric halo */}
      <div
        style={{
          position: 'absolute',
          inset: '6%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(200,168,78,0.08) 0%, rgba(148,115,13,0.04) 38%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Module-glyph orbit ring */}
      <div
        className="av-icon-ring"
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'av-icon-orbit 120s linear infinite',
          willChange: 'transform',
        }}
      >
        {MODULE_GLYPHS.map((g, i) => {
          const angle = (i / MODULE_GLYPHS.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + RING_RADIUS_PCT * Math.cos(angle);
          const y = 50 + RING_RADIUS_PCT * Math.sin(angle);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Counter-rotate to keep the glyph upright while the ring spins */}
              <div
                className="av-icon-upright"
                style={{
                  animation: 'av-icon-orbit-rev 120s linear infinite',
                  willChange: 'transform',
                }}
              >
                <motion.span
                  initial={boot ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 0.4 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={
                    boot
                      ? { duration: 0.6, delay: 1.0 + i * 0.05, ease: [0.22, 1.2, 0.4, 1] }
                      : { duration: 0 }
                  }
                  style={{
                    display: 'block',
                    fontSize: 'clamp(15px, 2vw, 21px)',
                    filter: 'drop-shadow(0 0 8px rgba(200,168,78,0.5)) grayscale(0.2)',
                    userSelect: 'none',
                  }}
                >
                  {g}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ring 1 (outermost, slowest) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          overflow: 'visible', animation: 'av-orbit-ccw 70s linear infinite',
        }}
      >
        <defs>
          <radialGradient id="hc-node">
            <stop offset="0%" stopColor="#fff5cf" stopOpacity="1" />
            <stop offset="55%" stopColor="#e8c869" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#94730D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="195" stroke="rgba(200,168,78,0.18)" strokeWidth="1" fill="none" strokeDasharray="80 38" vectorEffect="non-scaling-stroke" />
        <circle cx="200" cy="5" r="5" fill="url(#hc-node)" opacity="0.85" />
      </svg>

      {/* Ring 2 (middle, contra-rotating) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          overflow: 'visible', animation: 'av-orbit-cw 46s linear infinite',
        }}
      >
        <circle cx="200" cy="200" r="148" stroke="rgba(200,168,78,0.32)" strokeWidth="1.5" fill="none" strokeDasharray="130 70" vectorEffect="non-scaling-stroke" />
        <circle cx="200" cy="52" r="4" fill="url(#hc-node)" opacity="0.9" />
        <circle cx="200" cy="348" r="3" fill="url(#hc-node)" opacity="0.7" />
      </svg>

      {/* Ring 3 (inner, brighter, faster) */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          overflow: 'visible', animation: 'av-orbit-ccw 26s linear infinite',
        }}
      >
        <circle cx="200" cy="200" r="108" stroke="rgba(232,200,105,0.5)" strokeWidth="2" fill="none" strokeDasharray="50 70" vectorEffect="non-scaling-stroke" />
        <circle cx="200" cy="92" r="3.5" fill="url(#hc-node)" opacity="1" />
      </svg>

      {/* Inner faint solid ring */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '36%', aspectRatio: '1 / 1', borderRadius: '50%',
          border: '1px solid rgba(232,200,105,0.42)',
          boxShadow: '0 0 28px rgba(232,200,105,0.32), inset 0 0 22px rgba(232,200,105,0.18)',
        }}
      />

      {/* Boot ignite pulse ring (one-shot) */}
      {boot && (
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '24%', aspectRatio: '1 / 1', borderRadius: '50%',
            border: '1px solid rgba(248,225,138,0.8)',
            animation: 'av-pulse-ring 1.4s ease-out 0.3s 2',
          }}
        />
      )}

      {/* Breathing radial core */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '52%', aspectRatio: '1 / 1', borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(248,225,138,0.85) 0%, rgba(200,168,78,0.55) 28%, rgba(148,115,13,0.22) 56%, transparent 100%)',
          filter: 'blur(10px)',
          animation: 'av-core-pulse 4.2s ease-in-out infinite',
        }}
      />

      {/* Hot inner spot */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '14%', aspectRatio: '1 / 1', borderRadius: '50%',
          background:
            'radial-gradient(circle, #fffdf2 0%, #fbe9ad 38%, rgba(232,200,105,0.55) 70%, transparent 100%)',
          filter: 'blur(3px)',
          animation: 'av-core-pulse 2.6s ease-in-out infinite',
        }}
      />
    </motion.div>
  );
}
