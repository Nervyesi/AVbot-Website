import React from 'react';
import { motion } from 'framer-motion';

/**
 * HeroCenterpiece: "The Blueprint".
 *
 * An asymmetric engineering schematic behind the hero text, drawn entirely in
 * thin gold lines like a circuit board / blueprint. Named module blocks are
 * wired together with orthogonal traces, and bright light pulses flow along
 * those traces toward the CORE_ENGINE block, like data moving through the
 * architecture. Reads as "the inside of an engine".
 *
 * Deliberately NON-radial: only rectangles, straight orthogonal polylines and
 * diamond (rotated square) nodes. No circles, no rings, no rotation about a
 * centre. The composition is weighted to the left and right clusters with a
 * diagonal flow, so it never feels anchored to a point.
 *
 * Pure SVG plus CSS dash animation, GPU-light, transparent, bounded to its own
 * box, zIndex 0 behind the text, pointer-events none. The boot reveal is a
 * fade plus slight rise (no scale, no spin). prefers-reduced-motion freezes it
 * into a static diagram via the .av-blueprint rule in index.css.
 */

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

// viewBox is 1000 x 600. Blocks are placed asymmetrically, flowing toward the
// CORE_ENGINE on the right.
const BLOCKS = [
  { id: 'engage',    x: 56,  y: 92,  w: 216, h: 62, label: 'ENGAGE_FLYWHEEL', note: 'v3' },
  { id: 'raid',      x: 56,  y: 300, w: 196, h: 56, label: 'RAID_VERIFY',      note: 'live' },
  { id: 'give',      x: 300, y: 198, w: 224, h: 66, label: 'GIVEAWAY_WEIGHTED',note: '5x' },
  { id: 'verify',    x: 300, y: 436, w: 188, h: 54, label: 'VERIFY_HUMAN',     note: 'captcha' },
  { id: 'core',      x: 556, y: 244, w: 188, h: 98, label: 'CORE_ENGINE',      note: '14 modules', hub: true },
  { id: 'radar',     x: 792, y: 104, w: 176, h: 56, label: 'RADAR_FEEDS',      note: 'BTC +3.2%' },
  { id: 'protect',   x: 792, y: 300, w: 184, h: 56, label: 'PROTECTION_GUARD', note: '47/day' },
  { id: 'analytics', x: 556, y: 436, w: 188, h: 54, label: 'ANALYTICS_PULSE',  note: '+212' },
];

// Orthogonal traces (right-angle routing). delay staggers the travelling pulse.
const TRACES = [
  { pts: '272,123 287,123 287,231 300,231', delay: 0.0 },
  { pts: '252,328 287,328 287,250 300,250', delay: 0.5 },
  { pts: '160,154 160,300',                 delay: 1.0 },
  { pts: '524,231 540,231 540,293 556,293', delay: 0.3 },
  { pts: '744,288 768,288 768,132 792,132', delay: 0.9 },
  { pts: '744,312 770,312 770,328 792,328', delay: 1.3 },
  { pts: '650,342 650,436',                 delay: 0.7 },
  { pts: '488,463 520,463 520,322 556,322', delay: 1.5 },
];

// Diamond nodes at key junctions (rotated squares, never circles).
const NODES = [
  [300, 231], [556, 293], [556, 322], [744, 288], [744, 312], [650, 342], [287, 328], [160, 154],
];

const GRID = [];
for (let x = 80; x < 1000; x += 80) GRID.push({ x1: x, y1: 0, x2: x, y2: 600 });
for (let y = 80; y < 600; y += 80) GRID.push({ x1: 0, y1: y, x2: 1000, y2: y });

function Diamond({ cx, cy, r = 4, delay = 0 }) {
  return (
    <rect
      x={cx - r} y={cy - r} width={r * 2} height={r * 2}
      transform={`rotate(45 ${cx} ${cy})`}
      fill="rgba(248,225,138,0.9)"
      style={{ animation: 'av-logo-pulse 3s ease-in-out infinite', animationDelay: `${delay}s` }}
    />
  );
}

export default function HeroCenterpiece({ boot = false }) {
  const initial = boot ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 };
  const transition = boot
    ? { duration: 1.0, delay: 0.3, ease: [0.16, 0.7, 0.18, 1] }
    : { duration: 0 };

  return (
    // Static parent owns the centering; framer only fades/raises the child.
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(1180px, 94vw)',
        height: 'min(560px, 64vh)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <motion.div
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        style={{ position: 'absolute', inset: 0, opacity: 0.92 }}
      >
        <svg
          className="av-blueprint"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {/* Blueprint grid */}
          <g>
            {GRID.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(200,168,78,0.045)" strokeWidth="0.5" />
            ))}
          </g>

          {/* Corner brackets, asymmetric framing */}
          <polyline points="24,70 24,32 80,32" fill="none" stroke="rgba(200,168,78,0.3)" strokeWidth="1.2" />
          <polyline points="976,530 976,568 920,568" fill="none" stroke="rgba(200,168,78,0.3)" strokeWidth="1.2" />
          <text x="30" y="26" fill="rgba(200,168,78,0.5)" fontFamily={MONO} fontSize="11" letterSpacing="2">AVBOT // SYSTEM SCHEMATIC</text>
          <text x="970" y="556" textAnchor="end" fill="rgba(200,168,78,0.4)" fontFamily={MONO} fontSize="10" letterSpacing="2">REV 2.6</text>

          {/* Traces: faint base lines */}
          <g>
            {TRACES.map((t, i) => (
              <polyline key={i} points={t.pts} fill="none" stroke="rgba(200,168,78,0.2)" strokeWidth="1.2" />
            ))}
          </g>

          {/* Traces: bright travelling pulses */}
          <g>
            {TRACES.map((t, i) => (
              <polyline
                key={i}
                points={t.pts}
                fill="none"
                stroke="rgba(255,245,207,0.95)"
                strokeWidth="2"
                strokeDasharray="8 120"
                strokeLinecap="round"
                style={{ animation: 'av-trace 2.8s linear infinite', animationDelay: `${t.delay}s` }}
              />
            ))}
          </g>

          {/* Junction nodes */}
          {NODES.map(([cx, cy], i) => (
            <Diamond key={i} cx={cx} cy={cy} delay={(i % 4) * 0.4} />
          ))}

          {/* Module blocks */}
          {BLOCKS.map((b) => (
            <g key={b.id}>
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h}
                fill={b.hub ? 'rgba(200,168,78,0.09)' : 'rgba(200,168,78,0.035)'}
                stroke={b.hub ? 'rgba(248,225,138,0.75)' : 'rgba(200,168,78,0.42)'}
                strokeWidth={b.hub ? 1.6 : 1}
              />
              {/* header divider */}
              <line x1={b.x + 12} y1={b.y + 24} x2={b.x + b.w - 12} y2={b.y + 24} stroke="rgba(200,168,78,0.18)" strokeWidth="1" />
              {/* status diamond */}
              <rect
                x={b.x + b.w - 19} y={b.y + 7} width={8} height={8}
                transform={`rotate(45 ${b.x + b.w - 15} ${b.y + 11})`}
                fill={b.hub ? 'rgba(248,225,138,0.95)' : 'rgba(200,168,78,0.7)'}
                style={{ animation: 'av-logo-pulse 2.6s ease-in-out infinite' }}
              />
              <text x={b.x + 12} y={b.y + 17} fill={b.hub ? '#f1d586' : 'rgba(232,200,105,0.92)'} fontFamily={MONO} fontSize={b.hub ? 14 : 12.5} fontWeight="700" letterSpacing="0.5">
                {b.label}
              </text>
              <text x={b.x + b.w - 12} y={b.y + b.h - 11} textAnchor="end" fill="rgba(228,228,231,0.5)" fontFamily={MONO} fontSize="11">
                {b.note}
              </text>
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
