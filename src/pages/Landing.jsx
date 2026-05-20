import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

// Inline styles everywhere because Tailwind v4 utility emission is broken in
// this CRA setup. Design tokens live in :root via index.css.

// ── Hooks ────────────────────────────────────────────────────────────────────

function usePointerHover() {
  const [hasHover, setHasHover] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover)');
    setHasHover(mq.matches);
    const handler = (e) => setHasHover(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return hasHover;
}

// ── Background atmosphere layers ─────────────────────────────────────────────

function Vignette() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)',
        zIndex: 2,
      }}
    />
  );
}

function ConstellationGrid({ parallaxRef }) {
  const dots = useMemo(() => {
    const out = [];
    const cols = 14, rows = 9;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          x: (c / (cols - 1)) * 100 + (Math.random() - 0.5) * 3.2,
          y: (r / (rows - 1)) * 100 + (Math.random() - 0.5) * 3.2,
          size: Math.random() < 0.12 ? 2 : 1,
          opacity: 0.06 + Math.random() * 0.18,
        });
      }
    }
    return out;
  }, []);

  return (
    <div
      ref={parallaxRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
        zIndex: 0,
      }}
    >
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${d.x}%`, top: `${d.y}%`,
            width: `${d.size}px`, height: `${d.size}px`,
            borderRadius: '50%',
            background: 'rgb(200,168,78)',
            opacity: d.opacity,
            boxShadow: d.size === 2 ? '0 0 4px rgba(200,168,78,0.5)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

function ParticleField({ parallaxRef }) {
  const particles = useMemo(() => (
    Array.from({ length: 30 }).map((_, i) => ({
      top:      Math.random() * 100,
      left:     Math.random() * 100,
      size:     Math.random() < 0.3 ? 2 : 1,
      duration: 15 + Math.random() * 20,
      delay:    Math.random() * 10,
      anim:     i % 4,
    }))
  ), []);

  return (
    <div
      ref={parallaxRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
        zIndex: 1,
      }}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top:        `${p.top}%`,
            left:       `${p.left}%`,
            width:      `${p.size * 2}px`,
            height:     `${p.size * 2}px`,
            borderRadius: '50%',
            background:   'rgba(200,168,78,0.55)',
            boxShadow:    '0 0 8px rgba(200,168,78,0.4)',
            animation:    `av-float-${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Silk flag. SVG path morphed every frame, mouse drives wind. ────────────

const FLAG_W = 720;
const FLAG_H = 360;

function buildFlagPath(t, wind) {
  const ampTop = 10 + wind * 3.2;
  const ampMid = 22 + wind * 5.5;
  const ampBot = 12 + wind * 3.4;
  const k = (2 * Math.PI) / 220;
  const omega = 1.9 * wind;
  const step = 14;
  const out = [];

  // Top edge, left to right.
  out.push(`M 0 ${(ampTop * 0.35 * Math.sin(omega * t)).toFixed(2)}`);
  for (let x = step; x <= FLAG_W; x += step) {
    const y = ampTop * Math.sin(k * x + omega * t);
    out.push(`L ${x} ${y.toFixed(2)}`);
  }

  // Right edge, the "loose" side, top to bottom, biggest amplitude.
  for (let yi = step; yi <= FLAG_H; yi += step) {
    const x = FLAG_W + ampMid * Math.sin(k * yi * 1.4 + omega * t + Math.PI / 3);
    out.push(`L ${x.toFixed(2)} ${yi}`);
  }

  // Bottom edge, right to left.
  for (let x = FLAG_W - step; x >= 0; x -= step) {
    const y = FLAG_H + ampBot * Math.sin(k * x + omega * t + Math.PI / 2);
    out.push(`L ${x} ${y.toFixed(2)}`);
  }

  // Left edge stays fixed (this is the implicit pole).
  out.push(`L 0 ${(ampTop * 0.35 * Math.sin(omega * t)).toFixed(2)}`);
  out.push('Z');
  return out.join(' ');
}

function SilkFlag({ hasHover }) {
  const pathRef  = useRef(null);
  const sheenRef = useRef(null);
  const windRef  = useRef(2.2);

  useEffect(() => {
    let lastX = 0;
    let lastT = performance.now();
    const onMove = (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const v = Math.abs(e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
      // Faster cursor, faster wave. Smooth toward target, clamp 1..7.
      const target = Math.max(1, Math.min(7, 1 + v * 14));
      windRef.current = windRef.current * 0.82 + target * 0.18;
    };
    if (hasHover) window.addEventListener('mousemove', onMove, { passive: true });

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = (now - start) / 1000;
      const wind = windRef.current;
      const d = buildFlagPath(t, wind);
      if (pathRef.current)  pathRef.current.setAttribute('d', d);
      if (sheenRef.current) sheenRef.current.setAttribute('d', d);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      if (hasHover) window.removeEventListener('mousemove', onMove);
    };
  }, [hasHover]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -52%) rotate(-2deg)',
        width: 'min(120vw, 1400px)',
        height: 'auto',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95,
        filter: 'drop-shadow(0 30px 80px rgba(148,115,13,0.25))',
      }}
    >
      <svg
        viewBox={`-10 -30 ${FLAG_W + 60} ${FLAG_H + 60}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="silkGoldFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#c89a1f" stopOpacity="0.55" />
            <stop offset="35%"  stopColor="#94730D" stopOpacity="0.35" />
            <stop offset="75%"  stopColor="#94730D" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#94730D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkSheen" x1="0" y1="0" x2="1" y2="0.05">
            <stop offset="0%"   stopColor="#ffeec1" stopOpacity="0" />
            <stop offset="35%"  stopColor="#ffeec1" stopOpacity="0.18" />
            <stop offset="55%"  stopColor="#ffeec1" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffeec1" stopOpacity="0" />
          </linearGradient>
          <filter id="silkSoft" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>

        <path ref={pathRef}  d={buildFlagPath(0, 2.2)} fill="url(#silkGoldFill)" filter="url(#silkSoft)" />
        <path ref={sheenRef} d={buildFlagPath(0, 2.2)} fill="url(#silkSheen)" />
      </svg>
    </div>
  );
}

// ── One-shot light ray burst from logo center ───────────────────────────────

function LightRays() {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {angles.map((angle, i) => (
        <div
          key={angle}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '2px',
            height: 'clamp(160px, 28vw, 360px)',
            transformOrigin: '50% 0%',
            background: 'linear-gradient(to bottom, rgba(200,168,78,0.55) 0%, rgba(148,115,13,0.25) 35%, transparent 100%)',
            filter: 'blur(0.5px)',
            '--ray-angle': `${angle}deg`,
            animation: 'av-ray-burst 1.6s cubic-bezier(0.22, 0.85, 0.35, 1) 0.55s 1 both',
            animationDelay: `${0.55 + i * 0.03}s`,
            transform: `translate(-50%, -50%) rotate(${angle}deg) scaleY(0)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Layered halos behind the logo (3 stacked blurs at different rhythms) ────

function LogoHalo() {
  const layers = [
    { size: 'clamp(280px, 38vw, 520px)', blur: 22,  pulseMin: 0.40, pulseMax: 0.70, duration: 3.6, color: 'rgba(200,168,78,0.85)' },
    { size: 'clamp(420px, 58vw, 760px)', blur: 60,  pulseMin: 0.28, pulseMax: 0.45, duration: 5.0, color: 'rgba(148,115,13,0.7)'  },
    { size: 'clamp(620px, 82vw, 1100px)', blur: 120, pulseMin: 0.12, pulseMax: 0.22, duration: 7.5, color: 'rgba(148,115,13,0.5)'  },
  ];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {layers.map((L, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: L.size, height: L.size,
            background: L.color,
            borderRadius: '50%',
            filter: `blur(${L.blur}px)`,
            transform: 'translate(-50%, -50%)',
            '--pulse-min': L.pulseMin,
            '--pulse-max': L.pulseMax,
            animation: `av-pulse-soft ${L.duration}s ease-in-out infinite`,
            opacity: L.pulseMin,
          }}
        />
      ))}
    </div>
  );
}

// ── Premium primary CTA with shine sweep on hover ───────────────────────────

function PrimaryCTA({ href, children }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 32px',
        borderRadius: '12px',
        backgroundColor: hover ? 'var(--av-gold-light)' : 'var(--av-gold)',
        color: '#0a0a0a',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '-0.01em',
        textDecoration: 'none',
        overflow: 'hidden',
        boxShadow: hover
          ? '0 20px 60px -10px rgba(200,168,78,0.55), 0 0 0 1px rgba(200,168,78,0.4)'
          : '0 10px 40px -12px rgba(148,115,13,0.45), 0 0 0 1px rgba(148,115,13,0.25)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'background-color 0.25s, transform 0.18s, box-shadow 0.25s',
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
          transform: hover ? 'translateX(150%)' : 'translateX(-150%)',
          transition: 'transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      />
    </a>
  );
}

function SecondaryCTA({ href, children }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '15px 30px',
        borderRadius: '12px',
        border: `1px solid ${hover ? 'var(--av-gold)' : 'var(--av-border-strong)'}`,
        backgroundColor: hover ? 'rgba(200,168,78,0.06)' : 'transparent',
        color: 'var(--av-text)',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '-0.01em',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      {children}
    </a>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ inviteUrl }) {
  const hasHover = usePointerHover();
  const constellationRef = useRef(null);
  const particlesRef     = useRef(null);

  // Subtle parallax on background layers.
  useEffect(() => {
    if (!hasHover) return;
    const onMove = (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      if (constellationRef.current) {
        constellationRef.current.style.transform = `translate3d(${(-dx * 10).toFixed(1)}px, ${(-dy * 10).toFixed(1)}px, 0)`;
      }
      if (particlesRef.current) {
        particlesRef.current.style.transform = `translate3d(${(-dx * 22).toFixed(1)}px, ${(-dy * 22).toFixed(1)}px, 0)`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [hasHover]);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 100px',
        backgroundColor: 'var(--av-bg)',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Atmosphere */}
      <ConstellationGrid parallaxRef={constellationRef} />
      <SilkFlag hasHover={hasHover} />
      <ParticleField parallaxRef={particlesRef} />
      <LogoHalo />
      <Vignette />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        maxWidth: '1000px',
      }}>
        {/* Tagline label */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(200,168,78,0.25)',
            background: 'rgba(148,115,13,0.05)',
            color: 'var(--av-gold)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: '36px',
          }}
        >
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--av-gold)',
            boxShadow: '0 0 10px rgba(200,168,78,0.8)',
          }} />
          Built for Web3, by Web3.
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0, filter: 'blur(12px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 0.7, 0.18, 1] }}
          style={{
            position: 'relative',
            marginBottom: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '340px',
            zIndex: 3,
          }}
        >
          <LightRays />
          <img
            src={LOGO_URL}
            alt="AVbot"
            draggable="false"
            style={{
              position: 'relative',
              width: '100%',
              height: 'auto',
              maxHeight: '190px',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
              filter: 'drop-shadow(0 0 40px rgba(200,168,78,0.35)) drop-shadow(0 0 80px rgba(148,115,13,0.25))',
            }}
          />
        </motion.div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(2.5rem, 7.2vw, 5.5rem)',
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          fontFamily: 'Sora, sans-serif',
        }}>
          <motion.span
            initial={{ y: 28, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 0.6, 0.2, 1] }}
            style={{ display: 'block', color: 'var(--av-text)' }}
          >
            Your community
          </motion.span>
          <motion.span
            initial={{ y: 32, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: 1.5, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              display: 'block',
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out 2.6s infinite',
              textShadow: '0 0 48px rgba(148,115,13,0.18)',
            }}
          >
            deserves better.
          </motion.span>
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, delay: 1.85, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: '28px',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.6,
            maxWidth: '720px',
            color: 'var(--av-text-muted)',
            fontFamily: 'Sora, sans-serif',
          }}
        >
          AVbot turns your Discord into a living Web3 community engine.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 2.15, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: '44px',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <PrimaryCTA href={inviteUrl}>Add AVbot to Discord</PrimaryCTA>
          <SecondaryCTA href="#showcase">See It in Action</SecondaryCTA>
        </motion.div>
      </div>

      {/* Seam glow bridging hero into stats bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(148,115,13,0.06) 60%, rgba(17,17,17,0.85) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Scroll indicator */}
      <motion.a
        href="#stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 2.6, duration: 0.8 },
          y:       { duration: 2.2, repeat: Infinity, delay: 2.6, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--av-text-dim)',
          zIndex: 3,
        }}
        aria-label="Scroll for more"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.a>
    </section>
  );
}

// ── Live Stats Bar ───────────────────────────────────────────────────────────

function StatItem({ label, value, prefix = '', visible }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const target = Number(value) || 0;
    if (target <= 0) { setDisplayed(0); return; }

    const duration = 2000;
    const stepTime = 16;
    const increment = target / (duration / stepTime);
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayed(target);
        clearInterval(interval);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [visible, value]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(1.85rem, 4vw, 2.5rem)',
        fontWeight: 700,
        color: 'var(--av-gold)',
        fontFamily: 'Sora, sans-serif',
      }}>
        {prefix}{displayed.toLocaleString()}
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '11px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--av-text-dim)',
      }}>
        {label}
      </div>
    </div>
  );
}

function LiveStatsBar() {
  const [stats, setStats]     = useState(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/public/ameretaverse-overview`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setStats(d); })
      .catch(() => {
        if (!cancelled) setStats({ total_members: 0, active_members: 0, member_growth_30d: 0, total_messages: 0 });
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id="stats"
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop:    '1px solid var(--av-border)',
        borderBottom: '1px solid var(--av-border)',
        backgroundColor: 'var(--av-bg-elevated)',
      }}
    >
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '48px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '32px',
      }}>
        <StatItem label="Members Engaged"    value={stats?.total_members || 0}      visible={visible} />
        <StatItem label="Active This Month"  value={stats?.active_members || 0}     visible={visible} />
        <StatItem label="Growth (30d)"       value={stats?.member_growth_30d || 0}  visible={visible} prefix="+" />
        <StatItem label="Total Interactions" value={stats?.total_messages || 0}     visible={visible} />
      </div>
    </div>
  );
}

// ── Module Showcase (9 modules) ──────────────────────────────────────────────

const MODULES = [
  {
    id:          'analytics',
    icon:        '📊',
    title:       'Analytics',
    tagline:     'Numbers that matter.',
    description: 'Real time community health metrics, member growth, engagement trends, and module performance. Make decisions with data.',
    features:    ['Live dashboards', 'Member growth tracking', 'Module performance', 'Custom timeframes'],
  },
  {
    id:          'verify',
    icon:        '✅',
    title:       'Verification',
    tagline:     'Identity on your terms.',
    description: 'Token gated, role based access. Verify members through customizable challenges that fit your community vibe.',
    features:    ['Token gating', 'Role assignment', 'Custom panels', 'Web3 native'],
  },
  {
    id:          'roleselect',
    icon:        '🎭',
    title:       'Role Selection',
    tagline:     'Self serve roles.',
    description: 'Beautiful role pickers powered by reactions or buttons. Members claim their tags without burdening your mod team.',
    features:    ['Reaction or button panels', 'Multiple categories', 'Restricted access', 'Auto sync'],
  },
  {
    id:          'forms',
    icon:        '📝',
    title:       'Forms',
    tagline:     'Onboarding redefined.',
    description: 'Build custom application forms for your community. Approval workflows, role rewards, and full submission history.',
    features:    ['Visual builder', 'Approval workflows', 'Auto role on approval', 'Full audit trail'],
  },
  {
    id:          'tickets',
    icon:        '🎫',
    title:       'Tickets',
    tagline:     'Support that scales.',
    description: 'Ticket management that keeps DMs sane. Categorized, threaded, and trackable. Built for serious operations.',
    features:    ['Threaded conversations', 'Category routing', 'Auto close inactive', 'Full audit trail'],
  },
  {
    id:          'raid',
    icon:        '⚔️',
    title:       'Raid',
    tagline:     'Amplify your X reach.',
    description: 'Reward your community with points for engaging with your tweets. Live X verification, anti cheat, and a competitive leaderboard.',
    features:    ['Live X verification', 'Anti cheat detection', 'Customizable rewards', 'Real time leaderboard'],
  },
  {
    id:          'engage',
    icon:        '🔁',
    title:       'Engage',
    tagline:     'Self sustaining ecosystem.',
    description: "Members earn points by engaging with each other tweets, then spend those points to submit their own. A perpetual engine for your community.",
    features:    ['Per pool isolation', 'Submit your own tweets', 'Configurable economy', 'Multi pool support'],
  },
  {
    id:          'protection',
    icon:        '🛡️',
    title:       'Protection',
    tagline:     'Your community guardian.',
    description: 'Anti spam, anti raid, and anti scam guardrails that work silently in the background. Sleep easy at night.',
    features:    ['Spam filter', 'Raid detection', 'Account age gates', 'Customizable rules'],
  },
  {
    id:          'logs',
    icon:        '📋',
    title:       'Logs',
    tagline:     'Every action, traceable.',
    description: 'A unified activity log across every module. Admin actions, flagged users, settings changes, and protection events. Full transparency.',
    features:    ['Unified event feed', 'Per module filtering', 'Flagged user registry', 'CSV export'],
  },
];

function ModuleCard({ module, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '24px',
        borderRadius: '14px',
        backgroundColor: 'var(--av-bg-elevated)',
        border: `1px solid ${hovered ? 'var(--av-gold)' : 'var(--av-border)'}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          background: 'radial-gradient(circle at top right, var(--av-gold-glow) 0%, transparent 70%)',
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>{module.icon}</div>
        <h3 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--av-text)',
        }}>
          {module.title}
        </h3>
        <div style={{
          marginTop: '4px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--av-gold)',
        }}>
          {module.tagline}
        </div>
        <p style={{
          marginTop: '14px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--av-text-muted)',
        }}>
          {module.description}
        </p>

        <ul style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {module.features.map((f) => (
            <li key={f} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '13px', color: 'var(--av-text-dim)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--av-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function ModuleShowcase() {
  return (
    <section
      id="showcase"
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '96px 24px',
        backgroundColor: 'var(--av-bg)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 4.5vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--av-text)',
          }}>
            Nine modules. <span style={{ color: 'var(--av-gold)' }}>One engine.</span>
          </h2>
          <p style={{
            marginTop: '14px',
            fontSize: '1.05rem',
            color: 'var(--av-text-muted)',
            maxWidth: '640px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Built into a single bot. No stacked subscriptions, no integrations to maintain.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {MODULES.map((m, i) => (
            <ModuleCard key={m.id} module={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Scroll meteor (page-wide, behind content) ────────────────────────────────

function ScrollMeteor() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '50%',
        top: `${progress * 100}vh`,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'top 0.1s linear',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-128px', left: '50%',
          width: '2px', height: '128px',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, transparent, var(--av-gold-glow), var(--av-gold))',
        }}
      />
      <div
        style={{
          width: '12px', height: '12px', borderRadius: '50%',
          background: 'var(--av-gold-light)',
          boxShadow: '0 0 30px 10px var(--av-gold-glow)',
        }}
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const Landing = () => {
  const [inviteUrl, setInviteUrl] = useState(ADD_TO_DISCORD_URL);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/public/bot-info`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.invite_url) setInviteUrl(d.invite_url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'var(--av-bg)',
      color: 'var(--av-text)',
      minHeight: '100vh',
      fontFamily: 'Sora, sans-serif',
    }}>
      <ScrollMeteor />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection inviteUrl={inviteUrl} />
        <LiveStatsBar />
        <ModuleShowcase />

        <div style={{
          padding: '96px 24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--av-text-dim)',
        }}>
          More sections coming soon.
        </div>
      </div>
    </div>
  );
};

export default Landing;
