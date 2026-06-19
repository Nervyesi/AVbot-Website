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
// Layout in three zones. TOP (y < 15%): a row of five reading edge-corner,
// flank-left, LOGO, flank-right, edge-corner. MIDDLE (y 25%..70%): completely
// empty of blocks; the hero content lives here with only faint wires + pulses
// behind it. BOTTOM (y 75%..95%): four scattered blocks at the corners, one
// higher and one lower per side. Several blocks bleed past the frame edge.
// `side` decides where labels anchor so they read from the visible edge inward.
const BLOCKS = [
  // Flanking the logo (top centre, compact, fully visible)
  { id: 'verify',  side: 'c', x: 156, y: 100, w: 148, h: 44, rot: -4, label: 'VERIFY_HUMAN',     note: 'captcha' },   // A, beside logo at its eye-line (right edge ~30%)
  { id: 'radar',   side: 'c', x: 648, y: 96,  w: 140, h: 44, rot: 4,  label: 'RADAR_FEEDS',      note: 'BTC +3.2%' }, // B, beside logo at its eye-line
  // Top corners
  { id: 'engage',  side: 'l', x: -24, y: 30,  w: 150, h: 50, rot: 5,  label: 'ENGAGE_FLYWHEEL',  note: 'v3' },        // C, top-left
  { id: 'core',    side: 'r', x: 905, y: 30,  w: 150, h: 58, rot: -3, label: 'CORE_ENGINE',      note: '14 modules', hub: true }, // D, top-right
  // Bottom-left (mid + far)
  { id: 'raid',    side: 'l', x: -36, y: 408, w: 156, h: 54, rot: 2,  label: 'RAID_VERIFY',      note: 'live' },      // E, lifted + deeper in corner
  { id: 'protect', side: 'l', x: 2,   y: 540, w: 170, h: 48, rot: 0,  label: 'PROTECTION_GUARD', note: '47/day' },    // F (unchanged)
  // Bottom-right (mid + far)
  { id: 'give',      side: 'r', x: 930, y: 408, w: 250, h: 56, rot: 0,  label: 'GIVEAWAY_WEIGHTED',note: '5x' },       // G, lifted + deeper, bleeds ~18%
  { id: 'analytics', side: 'r', x: 905, y: 534, w: 180, h: 52, rot: 5,  label: 'ANALYTICS_PULSE',  note: '+212' },     // H (unchanged)
];

// Wires (orthogonal). center:true cross the empty middle band and stay very
// faint (only their pulses read); top/margin/bottom wires are brighter. Each
// pulse has its own duration and peak brightness; delays are tuned so pulses
// hand off at shared nodes. Pulses originate at the flank blocks (A, B) beside
// the logo and travel down to the bottom blocks (energy from the brain out).
const WIRES = [
  { pts: '230,100 230,22 718,22 718,96',    dur: 2.2, peak: 0.85, delay: 0.0, center: false }, // A top -> B top, up and over above the logo
  { pts: '230,144 200,144 200,435 120,435', dur: 2.6, peak: 0.90, delay: 0.3, center: true },  // A bottom -> E right
  { pts: '718,140 820,140 820,436 930,436', dur: 2.8, peak: 0.85, delay: 0.6, center: true },  // B bottom -> G left
  { pts: '51,80 51,408',                    dur: 1.4, peak: 1.00, delay: 0.2, center: false }, // C bottom -> E top (left edge, FAST)
  { pts: '980,88 980,408',                  dur: 2.0, peak: 0.90, delay: 0.4, center: false }, // D bottom -> G top (right edge)
  { pts: '120,435 120,508 930,508 930,436', dur: 3.0, peak: 0.65, delay: 0.9, center: true },  // E right -> G left, low bottom bridge (SLOW)
  { pts: '230,144 210,144 210,564 172,564', dur: 2.4, peak: 0.75, delay: 1.2, center: true },  // A bottom -> F right
  { pts: '950,88 950,534',                  dur: 1.6, peak: 0.95, delay: 0.5, center: false }, // D bottom -> H top (right edge)
  { pts: '126,55 156,55 156,122',           dur: 1.8, peak: 0.90, delay: 1.5, center: false }, // C right -> A left
];

// Nodes sit only in the TOP and BOTTOM zones (never in the empty middle band),
// reading as data-flow crossings.
const NODES = [
  [230, 22], [718, 22], [51, 80], [980, 88],      // top
  [200, 435], [820, 436], [120, 435], [905, 534], // bottom
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

      {/* Annotations + a bottom-right corner bracket (top-left bracket removed
          so it cannot clash with the ENGAGE_FLYWHEEL corner block). The title
          sits at the very top edge, clear above that block. */}
      <polyline points="976,530 976,568 920,568" fill="none" stroke="rgba(200,168,78,0.32)" strokeWidth="1.2" />
      <text x="30" y="14" fill="rgba(200,168,78,0.5)" fontFamily={MONO} fontSize="11" letterSpacing="2">AVBOT // SYSTEM SCHEMATIC</text>
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
