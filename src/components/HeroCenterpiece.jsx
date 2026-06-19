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
const BLOCKS = [
  // Left margin (right edges all <= 260, clear of the content column)
  { id: 'engage',    x: 40,  y: 84,  w: 200, h: 60, rot: 3,  label: 'ENGAGE_FLYWHEEL',  note: 'v3' },
  { id: 'raid',      x: 60,  y: 224, w: 168, h: 50, rot: -4, label: 'RAID_VERIFY',      note: 'live' },
  { id: 'protect',   x: 36,  y: 430, w: 212, h: 64, rot: 0,  label: 'PROTECTION_GUARD', note: '47/day' },
  { id: 'verify',    x: 70,  y: 544, w: 168, h: 46, rot: 0,  label: 'VERIFY_HUMAN',     note: 'captcha' },
  // Right margin (left edges all >= 740, clear of the content column)
  { id: 'core',      x: 778, y: 44,  w: 188, h: 66, rot: -3, label: 'CORE_ENGINE',      note: '14 modules', hub: true },
  { id: 'radar',     x: 800, y: 196, w: 166, h: 50, rot: 4,  label: 'RADAR_FEEDS',      note: 'BTC +3.2%' },
  { id: 'give',      x: 748, y: 372, w: 226, h: 56, rot: 0,  label: 'GIVEAWAY_WEIGHTED',note: '5x' },
  { id: 'analytics', x: 756, y: 510, w: 204, h: 60, rot: 3,  label: 'ANALYTICS_PULSE',  note: '+212' },
];

// Orthogonal wires. center:true ones cross the hero content column and stay
// very faint (only their pulses read); peripheral ones are a touch brighter.
const WIRES = [
  { pts: '240,114 505,114 505,400 748,400',  delay: 0.0,  center: true },  // engage -> give
  { pts: '228,249 480,249 480,540 756,540',  delay: 0.6,  center: true },  // raid -> analytics
  { pts: '778,77 540,77 540,568 238,568',    delay: 0.3,  center: true },  // core -> verify (long vertical)
  { pts: '248,462 520,462 520,221 800,221',  delay: 0.9,  center: true },  // protect -> radar
  { pts: '748,400 800,400 800,246',          delay: 1.3,  center: false }, // give -> radar (right margin)
  { pts: '146,144 146,430',                  delay: 1.1,  center: false }, // engage -> protect (left margin)
  { pts: '800,510 800,428',                  delay: 0.45, center: false }, // analytics -> give (right margin)
  { pts: '150,540 150,274',                  delay: 1.5,  center: false }, // verify -> raid (left margin)
];

const NODES = [
  [505, 114], [505, 400], [540, 300], [480, 249], [520, 462], [800, 246], [146, 287],
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
          <polyline key={i} points={t.pts} fill="none" stroke={`rgba(200,168,78,${t.center ? 0.15 : 0.3})`} strokeWidth="1.2" />
        ))}
      </g>

      {/* Wires: bright travelling pulses */}
      <g>
        {WIRES.map((t, i) => (
          <polyline
            key={i} points={t.pts} fill="none"
            stroke={`rgba(255,245,207,${t.center ? 0.85 : 0.95})`} strokeWidth="2" strokeDasharray="8 130" strokeLinecap="round"
            style={{ animation: 'av-trace 2.9s linear infinite', animationDelay: `${t.delay}s` }}
          />
        ))}
      </g>

      {/* Junction nodes */}
      {NODES.map(([cx, cy], i) => (
        <Diamond key={i} cx={cx} cy={cy} delay={(i % 4) * 0.4} />
      ))}

      {/* Module blocks: irregular, tilted, varied sizes, all in the margins */}
      {BLOCKS.map((b) => (
        <g key={b.id} transform={b.rot ? `rotate(${b.rot} ${b.x + b.w / 2} ${b.y + b.h / 2})` : undefined}>
          <rect
            x={b.x} y={b.y} width={b.w} height={b.h}
            fill={b.hub ? 'rgba(200,168,78,0.09)' : 'rgba(200,168,78,0.04)'}
            stroke={b.hub ? 'rgba(248,225,138,0.78)' : 'rgba(200,168,78,0.58)'}
            strokeWidth={b.hub ? 1.5 : 1}
          />
          <line x1={b.x + 12} y1={b.y + 24} x2={b.x + b.w - 12} y2={b.y + 24} stroke="rgba(200,168,78,0.18)" strokeWidth="1" />
          <rect
            x={b.x + b.w - 19} y={b.y + 7} width={8} height={8}
            transform={`rotate(45 ${b.x + b.w - 15} ${b.y + 11})`}
            fill={b.hub ? 'rgba(248,225,138,0.9)' : 'rgba(200,168,78,0.7)'}
            style={{ animation: 'av-logo-pulse 2.6s ease-in-out infinite' }}
          />
          <text x={b.x + 12} y={b.y + 17} fill={b.hub ? '#f1d586' : 'rgba(232,200,105,0.82)'} fontFamily={MONO} fontSize={b.hub ? 14 : 12} fontWeight="700" letterSpacing="0.5">
            {b.label}
          </text>
          <text x={b.x + b.w - 12} y={b.y + b.h - 11} textAnchor="end" fill="rgba(228,228,231,0.5)" fontFamily={MONO} fontSize="10.5">
            {b.note}
          </text>
        </g>
      ))}
    </Frame>
  );
}
