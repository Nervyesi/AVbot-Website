import React from 'react';
import { motion } from 'framer-motion';

/**
 * HeroCenterpiece: "The Engine Core".
 *
 * A code-generated reactor / turbine schematic behind the hero text. From the
 * outside in: slow volumetric gold light beams, a toothed gear ring, a
 * counter rotating hex frame, radial circuit traces with pulses that travel
 * outward, a fast spinning turbine fan, and a breathing energy core with a
 * white hot center. On brand for "your community deserves an engine".
 *
 * Pure SVG plus CSS transforms/opacity, so it is GPU-light and bounded to its
 * own box (no canvas, nothing painted over content). It sits at zIndex 0
 * behind the hero text.
 *
 * Centering lives on a static parent so framer-motion's scale/opacity
 * eruption (boot) and the parent parallax cannot clobber the centering
 * transform. Every animated SVG group uses transform-box: fill-box so it
 * rotates / scales about its own centre. prefers-reduced-motion freezes it
 * into a static schematic via the .av-engine rule in index.css.
 */

const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);
const BLADES = Array.from({ length: 9 }, (_, i) => i * 40);
const TRACES = [20, 80, 140, 200, 260, 320];

const spin = (dur, dir) => ({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  animation: `av-orbit-${dir} ${dur}s linear infinite`,
  willChange: 'transform',
});

export default function HeroCenterpiece({ boot = false }) {
  const eruptInitial = boot ? { scale: 0.3, opacity: 0 } : { scale: 1, opacity: 1 };
  const eruptTransition = boot
    ? { duration: 1.2, delay: 0.3, ease: [0.16, 0.7, 0.18, 1] }
    : { duration: 0 };

  return (
    // Static parent owns the centering transform.
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'clamp(440px, 62vw, 820px)',
        aspectRatio: '1 / 1',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <motion.div
        initial={eruptInitial}
        animate={{ scale: 1, opacity: 1 }}
        transition={eruptTransition}
        style={{ position: 'absolute', inset: 0 }}
      >
        <svg
          className="av-engine"
          viewBox="0 0 400 400"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="eng-glow">
              <stop offset="0%" stopColor="rgba(200,168,78,0.30)" />
              <stop offset="45%" stopColor="rgba(148,115,13,0.10)" />
              <stop offset="100%" stopColor="rgba(148,115,13,0)" />
            </radialGradient>
            <radialGradient id="eng-core">
              <stop offset="0%" stopColor="#fffdf2" />
              <stop offset="32%" stopColor="#fbe9ad" />
              <stop offset="62%" stopColor="rgba(232,200,105,0.55)" />
              <stop offset="100%" stopColor="rgba(148,115,13,0)" />
            </radialGradient>
            <linearGradient id="eng-blade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(248,225,138,0.9)" />
              <stop offset="100%" stopColor="rgba(148,115,13,0.15)" />
            </linearGradient>
            <radialGradient id="eng-node">
              <stop offset="0%" stopColor="#fff5cf" />
              <stop offset="60%" stopColor="#e8c869" />
              <stop offset="100%" stopColor="rgba(148,115,13,0)" />
            </radialGradient>
          </defs>

          {/* Soft halo */}
          <circle cx="200" cy="200" r="150" fill="url(#eng-glow)" />

          {/* Volumetric light beams, slow rotation */}
          <g style={spin(110, 'cw')} opacity="0.5">
            {RAYS.map((a) => (
              <polygon
                key={a}
                points="190,14 210,14 200,150"
                transform={`rotate(${a} 200 200)`}
                fill="rgba(200,168,78,0.12)"
              />
            ))}
          </g>

          {/* Toothed gear ring */}
          <g style={spin(80, 'cw')}>
            <circle
              cx="200" cy="200" r="150"
              fill="none" stroke="rgba(200,168,78,0.22)" strokeWidth="12"
              strokeDasharray="3 13" vectorEffect="non-scaling-stroke"
            />
            <circle
              cx="200" cy="200" r="157"
              fill="none" stroke="rgba(200,168,78,0.28)" strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* Counter rotating hex frame */}
          <g style={spin(64, 'ccw')}>
            <polygon
              points="200,84 300,142 300,258 200,316 100,258 100,142"
              fill="none" stroke="rgba(232,200,105,0.32)" strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* Radial circuit traces with travelling pulses */}
          <g>
            {TRACES.map((a, i) => (
              <g key={a} transform={`rotate(${a} 200 200)`}>
                <line x1="200" y1="82" x2="200" y2="26" stroke="rgba(200,168,78,0.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line
                  x1="200" y1="82" x2="200" y2="26"
                  stroke="rgba(255,245,207,0.9)" strokeWidth="1.6"
                  strokeDasharray="5 60" vectorEffect="non-scaling-stroke"
                  style={{ animation: `av-trace 2.6s linear infinite`, animationDelay: `${i * 0.42}s` }}
                />
                <circle cx="200" cy="24" r="3" fill="url(#eng-node)" style={{ animation: 'av-logo-pulse 3s ease-in-out infinite', animationDelay: `${i * 0.42}s` }} />
              </g>
            ))}
          </g>

          {/* Turbine fan, fast counter rotation */}
          <g style={spin(22, 'ccw')}>
            {BLADES.map((a) => (
              <path
                key={a}
                d="M 200 150 C 224 142 236 120 234 92 C 224 116 212 134 200 142 Z"
                transform={`rotate(${a} 200 200)`}
                fill="url(#eng-blade)"
                opacity="0.55"
              />
            ))}
            <circle cx="200" cy="200" r="46" fill="none" stroke="rgba(232,200,105,0.5)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </g>

          {/* Breathing energy core */}
          <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'av-eng-pulse 4.2s ease-in-out infinite' }}>
            <circle cx="200" cy="200" r="58" fill="url(#eng-core)" />
          </g>
          {/* White hot center */}
          <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'av-eng-pulse 2.6s ease-in-out infinite' }}>
            <circle cx="200" cy="200" r="18" fill="url(#eng-core)" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
