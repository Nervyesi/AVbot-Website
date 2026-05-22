import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { MODULE_PANELS } from './ModuleMockups';

/**
 * ScrollJourney.
 *
 * One unified module section. A gold comet trails down a curving SVG path
 * as the page scrolls. The path is faint by default; the portion the comet
 * has traveled lights up bright gold behind it. Nine stations sit at the
 * bends, alternating left and right on desktop, stacked centered on mobile.
 * Each station's in-action mockup reveals as the comet reaches it.
 *
 * Scroll driving:
 *   useScroll scoped to the section ref gives a 0..1 progress value as the
 *   section travels through the viewport. useMotionValueEvent writes the
 *   trail's stroke-dashoffset and the comet's transform attribute directly
 *   to the DOM each frame, bypassing React re-renders for 60fps motion.
 */

// ── Geometry ────────────────────────────────────────────────────────────────

const STATIONS = MODULE_PANELS.length;     // 9
const VB_W    = 1000;                       // viewBox width (path coord space)
const SPACING_DESKTOP = 620;                // vertical spacing between stations
const SPACING_MOBILE  = 540;
const TOP_PAD    = 360;                     // heading takes up the top of the section
const BOTTOM_PAD = 360;                     // outro space after last station
const RIGHT_X = VB_W * 0.78;
const LEFT_X  = VB_W * 0.22;
const CENTER_X = VB_W * 0.5;

function buildDesktopPath(stationYs) {
  // S-curve weaving through alternating-side station bends.
  let d = `M ${CENTER_X} 80`;
  let prevX = CENTER_X;
  let prevY = 80;
  for (let i = 0; i < stationYs.length; i++) {
    const y = stationYs[i];
    const x = i % 2 === 0 ? RIGHT_X : LEFT_X;
    const dy = y - prevY;
    d += ` C ${prevX} ${prevY + dy * 0.45}, ${x} ${y - dy * 0.45}, ${x} ${y}`;
    prevX = x; prevY = y;
  }
  // Tail down to the bottom center.
  const lastY = stationYs[stationYs.length - 1];
  d += ` C ${prevX} ${lastY + 220}, ${CENTER_X} ${lastY + 320}, ${CENTER_X} ${lastY + 360}`;
  return d;
}

function buildMobilePath(stationYs) {
  const lastY = stationYs[stationYs.length - 1];
  return `M ${CENTER_X} 80 L ${CENTER_X} ${lastY + 360}`;
}

// ── Card position ───────────────────────────────────────────────────────────

function cardPositionStyle(i, y, isMobile) {
  if (isMobile) {
    return {
      position: 'absolute',
      top: `${y}px`,
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(420px, 90%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    };
  }
  const onRight = i % 2 === 0;
  return {
    position: 'absolute',
    top: `${y}px`,
    transform: 'translateY(-50%)',
    width: '46%',
    maxWidth: '500px',
    [onRight ? 'left' : 'right']: '50%',
    paddingLeft:  onRight ? '40px' : 0,
    paddingRight: onRight ? 0 : '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: onRight ? 'flex-start' : 'flex-end',
    textAlign: onRight ? 'left' : 'right',
  };
}

// ── Hook: media query ──────────────────────────────────────────────────────

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false
  );
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [query]);
  return matches;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ScrollJourney() {
  const isMobile = useMediaQuery('(max-width: 860px)');

  // Recompute station ys + section height when layout mode flips.
  const spacing = isMobile ? SPACING_MOBILE : SPACING_DESKTOP;
  const stationYs = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < STATIONS; i++) {
      out.push(TOP_PAD + i * spacing);
    }
    return out;
  }, [spacing]);
  const sectionH = TOP_PAD + (STATIONS - 1) * spacing + BOTTOM_PAD;
  const pathD = isMobile ? buildMobilePath(stationYs) : buildDesktopPath(stationYs);

  // Scroll progress through the section.
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Refs onto the SVG nodes so we can update them imperatively at 60fps.
  const pathRef        = useRef(null);
  const trailGlowRef   = useRef(null);
  const trailCoreRef   = useRef(null);
  const cometRef       = useRef(null);
  const cometCoreRef   = useRef(null);
  const stationNodeRefs = useRef([]);
  const [pathLen, setPathLen] = useState(0);

  // Measure the path length once it is mounted with the current geometry.
  useEffect(() => {
    if (!pathRef.current) return;
    // getTotalLength reflects the viewBox-space length of the path.
    const len = pathRef.current.getTotalLength();
    setPathLen(len);
    if (trailGlowRef.current) {
      trailGlowRef.current.setAttribute('stroke-dasharray', len);
      trailGlowRef.current.setAttribute('stroke-dashoffset', len);
    }
    if (trailCoreRef.current) {
      trailCoreRef.current.setAttribute('stroke-dasharray', len);
      trailCoreRef.current.setAttribute('stroke-dashoffset', len);
    }
  }, [pathD]);

  // Drive trail draw + comet position directly from scroll progress.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!pathLen || !pathRef.current) return;
    const lenAt = p * pathLen;
    const offset = pathLen - lenAt;
    if (trailGlowRef.current) trailGlowRef.current.setAttribute('stroke-dashoffset', offset);
    if (trailCoreRef.current) trailCoreRef.current.setAttribute('stroke-dashoffset', offset);
    if (cometRef.current) {
      const pt = pathRef.current.getPointAtLength(lenAt);
      cometRef.current.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
      // Subtle scale flicker over time. Multiplied into the inner core so the
      // halo stays stable while the hot center glints.
      const flicker = 1 + Math.sin(performance.now() * 0.006) * 0.06;
      if (cometCoreRef.current) {
        cometCoreRef.current.setAttribute('transform', `scale(${flicker.toFixed(3)})`);
      }
    }
    // Activate stations the comet has passed.
    stationNodeRefs.current.forEach((node, i) => {
      if (!node) return;
      const sy = stationYs[i];
      const stationP = (sy - 80) / (sectionH - 160);
      const lit = p >= stationP - 0.005;
      // Animate the node itself via two stacked circles in the group;
      // we just flip a data attribute and let CSS handle it.
      node.dataset.lit = lit ? '1' : '0';
    });
  });

  return (
    <section
      ref={sectionRef}
      id="journey"
      style={{
        position: 'relative',
        height: `${sectionH}px`,
        // Transparent so the fixed BlackHoleVideo behind the Landing root
        // shows through the journey as the user scrolls.
        backgroundColor: 'transparent',
        overflow: 'visible',
      }}
    >
      {/* Heading at the top of the journey. */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: '120px 24px 0',
        textAlign: 'center',
        zIndex: 2,
      }}>
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
        >
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 4.6vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--av-text)',
            lineHeight: 1.1,
          }}>
            Nine modules. <span style={{ color: 'var(--av-gold)' }}>One engine.</span>
          </h2>
          <p style={{
            marginTop: '14px',
            marginBottom: 0,
            fontSize: '1.05rem',
            color: 'var(--av-text-muted)',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}>
            Scroll, and watch each system light up. The comet leads the way.
          </p>
        </motion.div>
      </div>

      {/* SVG path + comet sits absolutely over the section's full area. */}
      <svg
        viewBox={`0 0 ${VB_W} ${sectionH}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <defs>
          <filter id="aj-trail-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="aj-comet-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <radialGradient id="aj-comet-core">
            <stop offset="0%"   stopColor="#fffcef" stopOpacity="1" />
            <stop offset="35%"  stopColor="#f7e2a4" stopOpacity="0.95" />
            <stop offset="70%"  stopColor="#c89a1f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#94730D" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="aj-node-lit">
            <stop offset="0%"   stopColor="#fff5cf" stopOpacity="1" />
            <stop offset="60%"  stopColor="#e8c869" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#94730D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint base path */}
        <path
          d={pathD}
          stroke="rgba(148,115,13,0.22)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* Outer glow trail */}
        <path
          ref={trailGlowRef}
          d={pathD}
          stroke="rgba(232,200,105,0.85)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          filter="url(#aj-trail-glow)"
        />
        {/* Sharp core trail (kept by a second path so the line stays crisp inside the glow) */}
        <path
          ref={pathRef}
          d={pathD}
          stroke="transparent"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={trailCoreRef}
          d={pathD}
          stroke="#fff5cf"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* Station nodes. Each is two stacked circles; data-lit toggles their
            visual state. */}
        {stationYs.map((y, i) => {
          const x = isMobile
            ? CENTER_X
            : (i % 2 === 0 ? RIGHT_X : LEFT_X);
          return (
            <g
              key={i}
              ref={(el) => { stationNodeRefs.current[i] = el; }}
              data-lit="0"
              className="aj-node"
              transform={`translate(${x},${y})`}
            >
              <circle r="14" fill="url(#aj-node-lit)" className="aj-node-glow" />
              <circle r="6"  fill="#fff5cf"           className="aj-node-core" />
              <circle r="3"  fill="#ffffff"           className="aj-node-pip"  />
            </g>
          );
        })}

        {/* Comet at scroll-driven position */}
        <g ref={cometRef} transform={`translate(${CENTER_X},80)`}>
          <circle r="34" fill="url(#aj-comet-core)" opacity="0.55" filter="url(#aj-comet-glow)" />
          <circle r="20" fill="url(#aj-comet-core)" opacity="0.85" />
          <g ref={cometCoreRef}>
            <circle r="9"  fill="#fff5cf" />
            <circle r="3"  fill="#ffffff" />
          </g>
        </g>
      </svg>

      {/* Station HTML cards, absolutely positioned at their viewBox y. The
          viewBox y maps 1:1 to section pixels because the SVG fills the
          section vertically with preserveAspectRatio: none. */}
      {MODULE_PANELS.map((panel, i) => {
        const y = stationYs[i];
        const onRight = i % 2 === 0;
        const { Mockup } = panel;
        return (
          <div
            key={panel.id}
            style={{
              ...cardPositionStyle(i, y, isMobile),
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 0.6, 0.2, 1] }}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : (onRight ? 'flex-start' : 'flex-end'),
              }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: 10,
                color: 'var(--av-gold)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                <span style={{ fontSize: 18 }}>{panel.icon}</span>
                {panel.label}
              </div>
              <h3 style={{
                margin: '0 0 12px',
                fontSize: 'clamp(1.4rem, 2.6vw, 1.85rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--av-text)',
                lineHeight: 1.15,
              }}>
                {panel.headline}
              </h3>
              <p style={{
                margin: '0 0 18px',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: 'var(--av-text-muted)',
                maxWidth: 460,
              }}>
                {panel.copy}
              </p>
              <Mockup />
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}
