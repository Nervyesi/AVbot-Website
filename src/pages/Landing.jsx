import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';
import CursorSmoke from '../components/CursorSmoke';
import BlackHole from '../components/BlackHole';
import ScrollJourney from '../components/ScrollJourney';

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

function LogoHalo() {
  // A restrained gold aura behind the logo. Three layered blurs at very low
  // intensities so the logo reads as lit from within, not under a spotlight.
  // Candlelight in a dark room, not a floodlight.
  const layers = [
    { size: 'clamp(180px, 22vw, 300px)', blur: 26,  pulseMin: 0.18, pulseMax: 0.30, duration: 4.2, color: 'rgba(200,168,78,0.55)' },
    { size: 'clamp(280px, 36vw, 460px)', blur: 64,  pulseMin: 0.10, pulseMax: 0.18, duration: 6.0, color: 'rgba(148,115,13,0.45)' },
    { size: 'clamp(420px, 54vw, 720px)', blur: 110, pulseMin: 0.05, pulseMax: 0.09, duration: 8.5, color: 'rgba(148,115,13,0.35)' },
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

function HeroSection({ inviteUrl }) {
  const hasHover = usePointerHover();
  const particlesRef = useRef(null);

  // Subtle parallax on the gold-particle layer.
  useEffect(() => {
    if (!hasHover) return;
    const onMove = (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
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
      {/* The cinematic centerpiece. A real-time GLSL black hole sits at the
          back of the hero, behind everything else. The shader provides its
          own starfield, so we drop the old ConstellationGrid in favour of
          the lensed stars inside the shader. ParticleField and Vignette
          stay as subtle foreground atmosphere accents over the disk. */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.1, ease: [0.16, 0.7, 0.18, 1] }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        aria-hidden="true"
      >
        <BlackHole intensity={1.0} />
      </motion.div>
      <ParticleField parallaxRef={particlesRef} />
      <Vignette />

      {/* Content column */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1100px',
        width: '100%',
      }}>
        {/* Localised dark radial scrim behind the content so the copy stays
            crisp over the bright accretion disk. Confined to the content
            band; the disk outside this region reads at full brightness. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-12% -8%',
            background: 'radial-gradient(ellipse at center, rgba(8,8,10,0.62) 0%, rgba(8,8,10,0.34) 45%, transparent 80%)',
            filter: 'blur(18px)',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        {/* Tagline pill */}
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
            marginBottom: '24px',
          }}
        >
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: 'var(--av-gold)',
            boxShadow: '0 0 10px rgba(200,168,78,0.8)',
          }} />
          Built for Web3, by Web3.
        </motion.div>

        {/* Logo with breathing gold halo. The clean centerpiece. */}
        <motion.div
          initial={{ scale: 0.86, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 0.7, 0.18, 1] }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: '28px',
          }}
        >
          <LogoHalo />
          <LightRays />
          <img
            src={LOGO_URL}
            alt="AVbot"
            draggable="false"
            style={{
              position: 'relative',
              width: 'clamp(180px, 22vw, 260px)',
              height: 'auto',
              maxHeight: '160px',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
              filter: 'drop-shadow(0 0 14px rgba(200,168,78,0.25)) drop-shadow(0 0 36px rgba(148,115,13,0.12))',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(2.4rem, 6.4vw, 4.75rem)',
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          fontFamily: 'Sora, sans-serif',
          textAlign: 'center',
        }}>
          <motion.span
            initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              display: 'block',
              color: 'var(--av-text)',
            }}
          >
            Your community
          </motion.span>
          <motion.span
            initial={{ y: 28, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: 1.4, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              display: 'block',
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out 2.6s infinite',
              filter: 'drop-shadow(0 0 36px rgba(148,115,13,0.18))',
            }}
          >
            deserves better.
          </motion.span>
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, delay: 1.75, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: '24px',
            marginBottom: 0,
            fontSize: 'clamp(1rem, 1.85vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '640px',
            color: 'var(--av-text-muted)',
            fontFamily: 'Sora, sans-serif',
            textAlign: 'center',
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
            marginTop: '28px',
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
      <CursorSmoke />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection inviteUrl={inviteUrl} />
        <ScrollJourney />
      </div>
    </div>
  );
};

export default Landing;
