import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';
import SilkFlag from '../components/SilkFlag';
import CursorSmoke from '../components/CursorSmoke';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

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

function HeroSection({ inviteUrl }) {
  const hasHover = usePointerHover();
  const constellationRef = useRef(null);
  const particlesRef     = useRef(null);
  // Ref to the DOM element holding logo + headline + subline, so the cloth
  // can apply a synced transform without triggering React re-renders.
  const fabricContentRef = useRef(null);

  // Stable onTick handler: writes the synced transform directly to the DOM
  // element. useCallback keeps reference identity stable across renders so
  // SilkFlag's effect does not re-init on every Hero render.
  const handleClothTick = useCallback((d) => {
    const el = fabricContentRef.current;
    if (!el) return;
    // Mute the cloth's displacement before applying. The flag swings a lot
    // more than the text should. Cap each axis so violent gusts cannot
    // jerk the text off-center.
    const tx = clamp(d.tx, -6, 6);
    const ty = clamp(d.ty, -3, 3);
    const skew = clamp(d.skew, -0.45, 0.45);
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${skew.toFixed(3)}deg)`;
  }, []);

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
      {/* Far background atmosphere */}
      <ConstellationGrid parallaxRef={constellationRef} />
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

        {/* Flag stage. The cloth canvas sits absolutely behind the content
            overlay so the flag becomes the visual backdrop. The overlay
            (logo + headline + subline) sways in sync with the cloth. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.45, ease: [0.16, 0.7, 0.18, 1] }}
          style={{
            position: 'relative',
            width: 'min(980px, 92vw)',
            // Maintains the flag's bounding-box aspect (with billow padding).
            // Canvas logical size is 950 x 610 (760 + 60 + 130, 460 + 60 + 90).
            aspectRatio: '950 / 610',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          {/* Cloth (back). Absolute-fills the stage; canvas scales via CSS. */}
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
          }}>
            <SilkFlag
              onTick={handleClothTick}
              width={760}
              height={460}
              padLeft={60}
              padRight={130}
              padTop={60}
              padBottom={90}
              cols={24}
              rows={16}
            />
          </div>

          {/* Content overlay (front), synced to cloth motion. */}
          <div
            ref={fabricContentRef}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '720px',
              padding: '0 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              willChange: 'transform',
            }}
          >
            {/* Soft dark scrim behind the content for readability over gold folds. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-12% -10%',
                background: 'radial-gradient(ellipse at center, rgba(8,8,10,0.55) 0%, rgba(8,8,10,0.28) 45%, transparent 80%)',
                filter: 'blur(14px)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />

            {/* Logo. Plain <img>. Cannot become a black rectangle. */}
            <motion.img
              initial={{ scale: 0.88, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.0, delay: 0.85, ease: [0.16, 0.7, 0.18, 1] }}
              src={LOGO_URL}
              alt="AVbot"
              draggable="false"
              style={{
                width: 'clamp(170px, 24vw, 260px)',
                height: 'auto',
                objectFit: 'contain',
                userSelect: 'none',
                display: 'block',
                filter: 'drop-shadow(0 0 24px rgba(200,168,78,0.45)) drop-shadow(0 0 56px rgba(148,115,13,0.25))',
                marginBottom: '18px',
              }}
            />

            {/* One-shot light burst from logo center. */}
            <LightRays />

            {/* Headline */}
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5.4vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              fontFamily: 'Sora, sans-serif',
            }}>
              <motion.span
                initial={{ y: 22, opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.85, delay: 1.25, ease: [0.22, 0.6, 0.2, 1] }}
                style={{
                  display: 'block',
                  color: 'var(--av-text)',
                  textShadow: '0 2px 22px rgba(0,0,0,0.55)',
                }}
              >
                Your community
              </motion.span>
              <motion.span
                initial={{ y: 26, opacity: 0, filter: 'blur(8px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 1.55, ease: [0.22, 0.6, 0.2, 1] }}
                style={{
                  display: 'block',
                  background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
                  backgroundSize: '250% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                  animation: 'av-shine 7s ease-in-out 2.6s infinite',
                  filter: 'drop-shadow(0 2px 22px rgba(0,0,0,0.45))',
                }}
              >
                deserves better.
              </motion.span>
            </h1>

            {/* Subline */}
            <motion.p
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: 1.9, ease: [0.22, 0.6, 0.2, 1] }}
              style={{
                marginTop: '20px',
                marginBottom: 0,
                fontSize: 'clamp(0.95rem, 1.65vw, 1.1rem)',
                lineHeight: 1.55,
                maxWidth: '560px',
                color: 'var(--av-text-muted)',
                fontFamily: 'Sora, sans-serif',
                textShadow: '0 1px 10px rgba(0,0,0,0.45)',
              }}
            >
              AVbot turns your Discord into a living Web3 community engine.
            </motion.p>
          </div>
        </motion.div>

        {/* CTAs sit below the flag. */}
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
      <CursorSmoke />

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
