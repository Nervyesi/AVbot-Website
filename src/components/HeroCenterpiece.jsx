import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * HeroCenterpiece: "The Blueprint" (edge-distributed).
 *
 * An asymmetric engineering schematic drawn in thin gold lines. The named
 * module blocks scatter to the EDGES of the frame (four corners plus the two
 * sides, with the CORE_ENGINE offset along the top), leaving the CENTRE clear
 * for the hero headline and CTAs. Orthogonal wires bridge the periphery and
 * cross through the centre at several heights, carrying bright light pulses
 * that stream toward their destinations. The eye reads the wires + pulses
 * behind the text, with the labelled blocks sitting out at the margins.
 *
 * Strictly NON-radial: only rectangles, straight orthogonal polylines and
 * diamond (rotated square) nodes. No circles, rings, or rotation about a
 * centre. Pure SVG plus CSS dash animation, GPU-light, transparent, bounded,
 * zIndex 0 behind the text, pointer-events none. On small screens it collapses
 * to a minimal ambient version (corner brackets plus a few wires, no blocks).
 * prefers-reduced-motion freezes it via the .av-blueprint rule in index.css.
 */

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

// viewBox 1000 x 600. The central column (x ~320..680, full height) is the
// hero content zone (logo, kicker, headline, subline, stat strip, CTAs) and is
// kept clear of blocks. Blocks scatter irregularly through the left and right
// margins at varied positions, sizes and slight tilts.
// Two blocks flank the logo at the top; the other six are pushed to the very
// edges (left right-edges = 100 / 10%, right left-edges >= 900 / 90%) leaving
// an 80% clear central content column. Several bleed past the frame edge so the
// schematic reads as a slice of a larger system. Heights are clustered, not
// evenly stacked; tilts vary widely. `side` decides where labels anchor so
// they stay readable from the visible edge inward.
const BLOCKS = [
  // Flanking the logo (top centre, compact, fully visible)
  { id: 'verify', side: 'c', x: 212, y: 70, w: 152, h: 44, rot: -5, label: 'VERIFY_HUMAN', note: 'captcha' },
  { id: 'radar',  side: 'c', x: 700, y: 52, w: 140, h: 44, rot: 4,  label: 'RADAR_FEEDS',  note: 'BTC +3.2%' },
  // Left edge (right edges = 100, bleed left). engage + raid cluster; protect alone low.
  { id: 'engage',  side: 'l', x: -44, y: 176, w: 144, h: 56, rot: 5,  label: 'ENGAGE_FLYWHEEL',  note: 'v3' },
  { id: 'raid',    side: 'l', x: -20, y: 250, w: 120, h: 46, rot: -6, label: 'RAID_VERIFY',      note: 'live' },
  { id: 'protect', side: 'l', x: -52, y: 496, w: 152, h: 60, rot: 2,  label: 'PROTECTION_GUARD', note: '47/day' },
  // Right edge (left edges >= 900, bleed right). give + analytics cluster low; core alone top.
  { id: 'core',      side: 'r', x: 900, y: 44,  w: 156, h: 64, rot: -4, label: 'CORE_ENGINE',      note: '14 modules', hub: true },
  { id: 'give',      side: 'r', x: 900, y: 336, w: 240, h: 56, rot: 0,  label: 'GIVEAWAY_WEIGHTED',note: '5x' },
  { id: 'analytics', side: 'r', x: 908, y: 452, w: 180, h: 58, rot: 6,  label: 'ANALYTICS_PULSE',  note: '+212' },
];

// Wires. center:true cross the wide content column and stay very faint (only
// their pulses read). Each pulse has its own duration and peak brightness for
// a busy, layered "live system" feel; delays are tuned so pulses appear to
// hand off at shared nodes. Two originate from the logo-flanking blocks and
// travel down through the centre (the brain spreading energy outward).
const WIRES = [
  { pts: '288,114 288,364 900,364',         dur: 2.4, peak: 0.90, delay: 0.0, center: true },  // VERIFY(flank) -> give
  { pts: '770,96 770,300 100,300',          dur: 2.8, peak: 0.85, delay: 0.4, center: true },  // RADAR(flank) -> protect
  { pts: '900,76 364,76',                   dur: 2.0, peak: 0.80, delay: 0.7, center: true },  // core -> verify(flank), top
  { pts: '100,204 500,204 500,364 900,364', dur: 1.2, peak: 1.00, delay: 0.2, center: true },  // engage -> give, FAST
  { pts: '100,273 470,273 470,452 908,452', dur: 3.0, peak: 0.65, delay: 0.9, center: true },  // raid -> analytics, SLOW
  { pts: '100,526 540,526 540,76 900,76',   dur: 2.6, peak: 0.95, delay: 1.3, center: true },  // protect -> core, long
  { pts: '950,392 950,452',                 dur: 1.5, peak: 0.95, delay: 0.5, center: false }, // give -> analytics (chain)
  { pts: '50,232 50,250',                   dur: 1.8, peak: 0.85, delay: 1.1, center: false }, // engage -> raid
  { pts: '364,92 700,74',                   dur: 2.2, peak: 0.70, delay: 1.6, center: true },  // flank to flank, top
  { pts: '930,108 930,336',                 dur: 2.0, peak: 0.90, delay: 0.3, center: false }, // core -> give
];

// Nodes sit in the safe top/bottom gaps (never behind the headline) plus a few
// at block edges, reading as data-flow crossings.
const NODES = [
  [500, 76], [532, 92], [470, 114],
  [486, 526], [540, 520],
  [100, 204], [900, 364], [100, 526],
];

const GRID = [];
for (let x = 100; x < 1000; x += 100) GRID.push({ x1: x, y1: 0, x2: x, y2: 600 });
for (let y = 100; y < 600; y += 100) GRID.push({ x1: 0, y1: y, x2: 1000, y2: y });

// Mobile: a sparse ambient version, no blocks.
const MOBILE_WIRES = [
  { pts: '20,150 200,150 200,360 380,360', delay: 0.0 },
  { pts: '380,90 380,260 20,260 20,470',   delay: 0.7 },
  { pts: '20,560 200,560 200,420 380,420', delay: 1.2 },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 768px)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 768px)');
    const h = (e) => setMobile(e.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  return mobile;
}

function Diamond({ cx, cy, r = 4, delay = 0 }) {
  return (
    <rect
      x={cx - r} y={cy - r} width={r * 2} height={r * 2}
      transform={`rotate(45 ${cx} ${cy})`}
      fill="rgba(248,225,138,0.85)"
      style={{ animation: 'av-logo-pulse 3s ease-in-out infinite', animationDelay: `${delay}s` }}
    />
  );
}

export default function HeroCenterpiece({ boot = false }) {
  const mobile = useIsMobile();
  const initial = boot ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 };
  const transition = boot
    ? { duration: 1.0, delay: 0.3, ease: [0.16, 0.7, 0.18, 1] }
    : { duration: 0 };

  const Frame = ({ children, viewBox }) => (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: mobile ? '94vw' : 'min(1480px, 95vw)',
        height: mobile ? 'min(620px, 80vh)' : 'min(620px, 72vh)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <motion.div initial={initial} animate={{ opacity: 1, y: 0 }} transition={transition} style={{ position: 'absolute', inset: 0 }}>
        <svg className="av-blueprint" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {children}
        </svg>
      </motion.div>
    </div>
  );

  if (mobile) {
    // Minimal ambient: corner brackets + a few wires with pulses, no blocks.
    return (
      <Frame viewBox="0 0 400 700">
        <polyline points="22,56 22,26 70,26" fill="none" stroke="rgba(200,168,78,0.3)" strokeWidth="1.4" />
        <polyline points="378,644 378,674 330,674" fill="none" stroke="rgba(200,168,78,0.3)" strokeWidth="1.4" />
        <text x="26" y="20" fill="rgba(200,168,78,0.45)" fontFamily={MONO} fontSize="9" letterSpacing="2">AVBOT // SCHEMATIC</text>
        {MOBILE_WIRES.map((w, i) => (
          <polyline key={`b${i}`} points={w.pts} fill="none" stroke="rgba(200,168,78,0.18)" strokeWidth="1.2" />
        ))}
        {MOBILE_WIRES.map((w, i) => (
          <polyline
            key={`p${i}`} points={w.pts} fill="none"
            stroke="rgba(255,245,207,0.9)" strokeWidth="2" strokeDasharray="7 130" strokeLinecap="round"
            style={{ animation: 'av-trace 3.2s linear infinite', animationDelay: `${w.delay}s` }}
          />
        ))}
        <Diamond cx={200} cy={150} delay={0} />
        <Diamond cx={200} cy={360} delay={0.6} />
        <Diamond cx={200} cy={420} delay={1.0} />
      </Frame>
    );
  }

  return (
    <Frame viewBox="0 0 1000 600">
      {/* Blueprint grid */}
      <g>
        {GRID.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(200,168,78,0.04)" strokeWidth="0.5" />
        ))}
      </g>

      {/* Corner brackets + annotations (asymmetric framing) */}
      <polyline points="24,70 24,32 80,32" fill="none" stroke="rgba(200,168,78,0.32)" strokeWidth="1.2" />
      <polyline points="976,530 976,568 920,568" fill="none" stroke="rgba(200,168,78,0.32)" strokeWidth="1.2" />
      <text x="30" y="26" fill="rgba(200,168,78,0.5)" fontFamily={MONO} fontSize="11" letterSpacing="2">AVBOT // SYSTEM SCHEMATIC</text>
      <text x="970" y="556" textAnchor="end" fill="rgba(200,168,78,0.4)" fontFamily={MONO} fontSize="10" letterSpacing="2">REV 2.6</text>

      {/* Wires: faint base lines (very faint where they cross the centre) */}
      <g>
        {WIRES.map((t, i) => (
          <polyline key={i} points={t.pts} fill="none" stroke={`rgba(200,168,78,${t.center ? 0.13 : 0.28})`} strokeWidth="1.2" />
        ))}
      </g>

      {/* Wires: travelling pulses with varied speed and brightness */}
      <g>
        {WIRES.map((t, i) => (
          <polyline
            key={i} points={t.pts} fill="none"
            stroke={`rgba(255,245,207,${t.peak})`} strokeWidth="2"
            strokeDasharray={t.dur < 1.6 ? '6 90' : '8 150'} strokeLinecap="round"
            style={{ animation: `av-trace ${t.dur}s linear infinite`, animationDelay: `${t.delay}s` }}
          />
        ))}
      </g>

      {/* Junction nodes (data-flow crossings) */}
      {NODES.map(([cx, cy], i) => (
        <Diamond key={i} cx={cx} cy={cy} delay={(i % 4) * 0.4} />
      ))}

      {/* Module blocks: irregular, tilted, varied sizes, edges + logo flanks.
          Labels anchor from the visible edge inward so they stay readable. */}
      {BLOCKS.map((b) => {
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const labelX = b.side === 'l' ? 10 : b.x + 12;
        const diaX = b.side === 'r' ? b.x + 15 : b.x + b.w - 15;
        const lineX2 = labelX + Math.min(b.w - 24, 118);
        return (
          <g key={b.id} transform={b.rot ? `rotate(${b.rot} ${cx} ${cy})` : undefined}>
            <rect
              x={b.x} y={b.y} width={b.w} height={b.h}
              fill={b.hub ? 'rgba(200,168,78,0.09)' : 'rgba(200,168,78,0.04)'}
              stroke={b.hub ? 'rgba(248,225,138,0.78)' : 'rgba(200,168,78,0.56)'}
              strokeWidth={b.hub ? 1.5 : 1}
            />
            <line x1={labelX} y1={b.y + 24} x2={lineX2} y2={b.y + 24} stroke="rgba(200,168,78,0.18)" strokeWidth="1" />
            <rect
              x={diaX - 4} y={b.y + 7} width={8} height={8}
              transform={`rotate(45 ${diaX} ${b.y + 11})`}
              fill={b.hub ? 'rgba(248,225,138,0.9)' : 'rgba(200,168,78,0.7)'}
              style={{ animation: 'av-logo-pulse 2.6s ease-in-out infinite' }}
            />
            <text x={labelX} y={b.y + 17} textAnchor="start" fill={b.hub ? '#f1d586' : 'rgba(232,200,105,0.82)'} fontFamily={MONO} fontSize={b.hub ? 14 : 11.5} fontWeight="700" letterSpacing="0.5">
              {b.label}
            </text>
            <text x={labelX} y={b.y + b.h - 11} textAnchor="start" fill="rgba(228,228,231,0.5)" fontFamily={MONO} fontSize="10">
              {b.note}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}
