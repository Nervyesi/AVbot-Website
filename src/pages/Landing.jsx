import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';
import AmbientBackground from '../components/AmbientBackground';
import HeroCenterpiece from '../components/HeroCenterpiece';
import ModulesOverview from '../components/ModulesOverview';
import ScrollJourney from '../components/ScrollJourney';
import WhySection from '../components/WhySection';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

// Decide once, synchronously, whether to play the cinematic boot sequence.
// First visit in a browser session boots; revisits go straight to steady
// state. Reduced-motion users never boot.
function shouldBoot() {
  try {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.sessionStorage && window.sessionStorage.getItem('av_hero_booted')) return false;
    return true;
  } catch {
    return false;
  }
}

// ── CTA buttons ────────────────────────────────────────────────────────────

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
      {/* Idle pulsing glow ring */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', inset: -2,
          borderRadius: '14px',
          boxShadow: '0 0 0 1px rgba(248,225,138,0.5)',
          opacity: hover ? 0 : 0.6,
          animation: 'av-core-pulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
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
        border: `1px solid ${hover ? 'var(--av-gold)' : 'rgba(255,255,255,0.18)'}`,
        backgroundColor: hover ? 'rgba(200,168,78,0.06)' : 'rgba(20,20,24,0.4)',
        color: 'var(--av-text)',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '-0.01em',
        textDecoration: 'none',
        backdropFilter: 'blur(6px)',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      {children}
    </a>
  );
}

// ── Live stat strip ──────────────────────────────────────────────────────────

const MONO = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

// Compact, round-DOWN formatting: 947 / 1.2K / 9.9K / 10K / 47K / 120K / 1.2M.
function fmtStat(n) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  if (n < 1000) return String(n);
  if (n < 10000) {
    const v = Math.floor(n / 100) / 10;       // one decimal, rounded down
    return `${(v % 1 === 0 ? v.toFixed(0) : v.toFixed(1))}K`;
  }
  if (n < 1000000) return `${Math.floor(n / 1000)}K`;
  const v = Math.floor(n / 100000) / 10;
  return `${(v % 1 === 0 ? v.toFixed(0) : v.toFixed(1))}M`;
}

// Count-up to `target`, formatted compactly each frame. Runs once when active.
function CountUpStat({ target, active }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.floor(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return <>{fmtStat(v)}+</>;
}

function SkeletonNum() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '34px',
        height: '12px',
        borderRadius: '3px',
        background: 'rgba(200,168,78,0.18)',
        animation: 'av-fade-in 1.1s ease-in-out infinite alternate',
        verticalAlign: 'middle',
      }}
    />
  );
}

// stats: null while loading, false if the fetch failed (strip hidden), else
// the loaded object. Renders a monospace gold strip with count-ups, or skeleton
// bars while loading.
function HeroStatStrip({ stats, delay }) {
  if (stats === false) return null; // failed entirely → hide
  const loaded = stats && typeof stats === 'object';
  // Empty deploy guard: if everything is zero, do not show "0+ members".
  if (loaded) {
    const allZero =
      !stats.members_total && !stats.servers_count &&
      !stats.tasks_verified_total && !stats.protection_actions_total;
    if (allZero) return null;
  }

  const blocks = [
    { key: 'members_total',        label: 'members' },
    { key: 'servers_count',        label: 'servers' },
    { key: 'tasks_verified_total', label: 'tasks verified' },
    { key: 'protection_actions_total', label: 'threats blocked' },
  ];

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 0.6, 0.2, 1] }}
      style={{
        marginTop: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px 16px',
        padding: '12px 20px',
        borderRadius: '12px',
        background: 'rgba(14,14,18,0.5)',
        border: '1px solid rgba(200,168,78,0.16)',
        backdropFilter: 'blur(8px)',
        fontFamily: MONO,
        fontSize: 'clamp(11px, 1.3vw, 13px)',
        color: 'rgba(228,228,231,0.6)',
        textShadow: '0 1px 10px rgba(0,0,0,0.7)',
      }}
    >
      {blocks.map((b, i) => (
        <React.Fragment key={b.key}>
          {i > 0 && <span style={{ color: 'rgba(200,168,78,0.4)' }}>·</span>}
          <span>
            <span style={{ color: 'var(--av-gold-light)', fontWeight: 700 }}>
              {loaded ? <CountUpStat target={stats[b.key] || 0} active /> : <SkeletonNum />}
            </span>
            {' '}{b.label}
          </span>
        </React.Fragment>
      ))}
    </motion.div>
  );
}

// ── Per-word headline reveal ─────────────────────────────────────────────────

// Splits a line into words and rises each up behind an overflow mask, with a
// per-word stagger. When not booting, snaps in quickly.
function WordsReveal({ text, boot, baseDelay = 0, wordStyle }) {
  const words = text.split(' ');
  return (
    <span style={{ display: 'inline' }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', lineHeight: 1.04 }}
        >
          <motion.span
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: boot ? 0.75 : 0.5,
              delay: (boot ? baseDelay : 0) + i * (boot ? 0.06 : 0.025),
              ease: [0.22, 0.7, 0.2, 1],
            }}
            style={{ display: 'inline-block', ...wordStyle }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

const GOLD_GRADIENT_WORD = {
  background: 'linear-gradient(115deg, #94730D 18%, #f1d586 50%, #94730D 82%)',
  backgroundSize: '250% 100%',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  animation: 'av-shine 7s ease-in-out 2.6s infinite',
  filter: 'drop-shadow(0 0 36px rgba(148,115,13,0.2))',
};

function HeroSection({ inviteUrl, stats, boot }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Centerpiece recedes and is FULLY gone (opacity 0) by ~42% of the hero,
  // so the orbital has cleared long before the next section enters view.
  const cpY = useTransform(scrollYProgress, [0, 0.45], [0, -300]);
  const cpScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.12]);
  const cpOpacity = useTransform(scrollYProgress, [0, 0.22, 0.42], [1, 0.4, 0]);
  // Content drifts up gently (parallax depth).
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  // Bottom edge break fades in early so the hero ends decisively.
  const edgeOpacity = useTransform(scrollYProgress, [0.12, 0.5], [0, 1]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(96px, 14vh, 144px) 24px clamp(60px, 8vh, 96px)',
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* Parallax centerpiece layer. overflow:hidden caps it to the hero box
          so it can never extend visually into the next section. */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          y: cpY, scale: cpScale, opacity: cpOpacity,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <HeroCenterpiece boot={boot} />
      </motion.div>

      {/* Content column */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 3,
          y: contentY,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '1100px',
          width: '100%',
        }}
      >
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: boot ? 0.9 : 0 }}
          style={{
            marginBottom: '26px',
            fontSize: 'clamp(10px, 1vw, 12px)',
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'var(--av-gold)',
            textShadow: '0 0 24px rgba(0,0,0,0.85)',
          }}
        >
          From Web3, for Web3.
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={boot ? { scale: 0.86, opacity: 0, filter: 'blur(10px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={boot ? { duration: 1.1, delay: 0.7, ease: [0.16, 0.7, 0.18, 1] } : { duration: 0.5 }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: '30px',
          }}
        >
          <img
            src={LOGO_URL}
            alt="AVbot"
            draggable="false"
            style={{
              position: 'relative',
              width: 'clamp(170px, 21vw, 250px)',
              height: 'auto',
              maxHeight: '150px',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
              filter: 'drop-shadow(0 0 16px rgba(200,168,78,0.35)) drop-shadow(0 0 48px rgba(148,115,13,0.18))',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(2.2rem, 6.5vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.03,
          letterSpacing: '-0.045em',
          fontFamily: 'Sora, sans-serif',
          textAlign: 'center',
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}>
          <span style={{ display: 'block', color: 'var(--av-text)' }}>
            <WordsReveal text="Your community" boot={boot} baseDelay={1.2} />
          </span>
          <span style={{ display: 'block' }}>
            <WordsReveal text="deserves an engine" boot={boot} baseDelay={1.5} wordStyle={GOLD_GRADIENT_WORD} />
          </span>
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: boot ? 0.85 : 0.5, delay: boot ? 2.0 : 0.1, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: '26px',
            marginBottom: 0,
            fontSize: 'clamp(1rem, 1.85vw, 1.22rem)',
            lineHeight: 1.6,
            maxWidth: '660px',
            color: 'rgba(228,228,231,0.78)',
            fontFamily: 'Sora, sans-serif',
            textAlign: 'center',
            textShadow: '0 1px 12px rgba(0,0,0,0.6)',
          }}
        >
          Engagement, intelligence, and protection. All woven into one bot
        </motion.p>

        {/* Live stat strip */}
        <HeroStatStrip stats={stats} delay={boot ? 2.2 : 0.2} />

        {/* CTAs */}
        <motion.div
          className="av-hero-ctas"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: boot ? 0.9 : 0.5, delay: boot ? 2.35 : 0.25, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: 'clamp(28px, 4vh, 44px)',
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <PrimaryCTA href={inviteUrl}>Add AVbot to Discord</PrimaryCTA>
          <SecondaryCTA href="#flywheel">See It in Action</SecondaryCTA>
        </motion.div>
      </motion.div>

      {/* Bottom edge break: a pronounced fade-to-dark plus a bold gold rule so
          the hero ends decisively before the next section begins. */}
      <motion.div
        aria-hidden="true"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, opacity: edgeOpacity, pointerEvents: 'none' }}
      >
        <div style={{
          height: '34vh',
          background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.6) 55%, rgba(10,10,10,0.94) 100%)',
        }} />
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(200,168,78,0.85) 50%, transparent 100%)',
          boxShadow: '0 0 22px rgba(200,168,78,0.6)',
        }} />
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#flywheel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: boot ? 2.6 : 0.6, duration: 0.8 },
          y: { duration: 2.2, repeat: Infinity, delay: boot ? 2.6 : 0.6, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(228,228,231,0.5)',
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

// ── Page ────────────────────────────────────────────────────────────────────

const Landing = () => {
  const [inviteUrl, setInviteUrl] = useState(ADD_TO_DISCORD_URL);
  // null = loading (skeleton), false = failed (strip hidden), object = loaded.
  const [stats, setStats] = useState(null);
  // Computed once, synchronously, so there is no steady-state flash before boot.
  const [boot] = useState(shouldBoot);

  useEffect(() => {
    try { window.sessionStorage && window.sessionStorage.setItem('av_hero_booted', '1'); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/public/bot-info`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.invite_url) setInviteUrl(d.invite_url); })
      .catch(() => {});
    fetch(`${API_BASE_URL}/api/public/stats`)
      .then((r) => { if (!r.ok) throw new Error('stats http ' + r.status); return r.json(); })
      .then((d) => { if (!cancelled) setStats(d && typeof d === 'object' ? d : false); })
      .catch(() => { if (!cancelled) setStats(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'var(--av-bg)',
      color: 'var(--av-text)',
      minHeight: '100vh',
      fontFamily: 'Sora, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Ambient layer sits behind everything at zIndex 0 (CursorGas retired). */}
      <AmbientBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection inviteUrl={inviteUrl} stats={stats} boot={boot} />
        <ModulesOverview />
        <ScrollJourney />
        <WhySection />
        <FinalCTA inviteUrl={inviteUrl} />
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
