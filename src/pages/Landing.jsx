import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

// Tailwind v4 utility emission is broken in this CRA setup, so styling is done
// with inline styles + the :root design tokens defined in index.css. Same
// convention as Dashboard.jsx.

// ── Hero background effects ──────────────────────────────────────────────────

function ParticleField() {
  const particles = React.useMemo(() => (
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
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '800px', height: '800px', borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--av-gold-glow) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
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
            background:   'rgba(200,168,78,0.45)',
            boxShadow:    '0 0 6px rgba(200,168,78,0.3)',
            animation:    `av-float-${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function WavingFlag() {
  const [windSpeed, setWindSpeed] = useState(4);

  useEffect(() => {
    let lastX = 0;
    let lastT = Date.now();
    const handler = (e) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastT);
      const velocity = Math.abs(e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
      // Faster cursor, faster wave. Clamp 1.5s..5s.
      setWindSpeed((prev) => {
        const target = Math.max(1.5, 5 - velocity * 8);
        // Ease toward target so changes feel natural rather than snappy.
        return prev * 0.7 + target * 0.3;
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: 0, top: '20%',
        width: '320px', height: '420px',
        opacity: 0.12,
        pointerEvents: 'none',
        background: 'linear-gradient(135deg, var(--av-gold) 0%, transparent 70%)',
        transformOrigin: 'top left',
        animation: `flag-wave ${windSpeed.toFixed(2)}s ease-in-out infinite`,
        maskImage: 'repeating-linear-gradient(to right, black, black 2px, transparent 2px, transparent 6px)',
        WebkitMaskImage: 'repeating-linear-gradient(to right, black, black 2px, transparent 2px, transparent 6px)',
      }}
    />
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

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ inviteUrl }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        backgroundColor: 'var(--av-bg)',
        overflow: 'hidden',
      }}
    >
      <ParticleField />
      <WavingFlag />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'relative',
          marginBottom: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-20% -10%',
            background: 'var(--av-gold)',
            filter:     'blur(60px)',
            opacity:    0.5,
            animation:  'av-logo-pulse 3s ease-in-out infinite',
            borderRadius: '50%',
          }}
        />
        <img
          src={LOGO_URL}
          alt="AVbot"
          draggable="false"
          style={{
            position: 'relative',
            width: '100%',
            height: 'auto',
            maxHeight: '180px',
            objectFit: 'contain',
            userSelect: 'none',
            display: 'block',
          }}
        />
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          margin: 0,
          fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          maxWidth: '900px',
        }}
      >
        <span style={{ display: 'block', color: 'var(--av-text)' }}>One bot.</span>
        <span style={{ display: 'block', color: 'var(--av-gold)' }}>Nine modules.</span>
        <span style={{ display: 'block', color: 'var(--av-text)' }}>Zero manual work.</span>
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        style={{
          marginTop: '28px',
          fontSize: 'clamp(1rem, 1.95vw, 1.2rem)',
          lineHeight: 1.65,
          maxWidth: '720px',
          color: 'var(--av-text-muted)',
        }}
      >
        Verification, Roles, Forms, Tickets, Raids, Engagement, Protection, Analytics, and Logs.
        <br />
        All in one place. All in your brand. All under your control.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        style={{
          marginTop: '40px',
          display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'relative', overflow: 'hidden',
            padding: '16px 32px', borderRadius: '10px',
            backgroundColor: 'var(--av-gold)', color: '#000',
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '15px',
            textDecoration: 'none',
            transition: 'background-color 0.2s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--av-gold-light)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--av-gold)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Add AVbot to Discord
        </a>

        <a
          href="#showcase"
          style={{
            padding: '16px 32px', borderRadius: '10px',
            border: '1px solid var(--av-border-strong)',
            color: 'var(--av-text)', backgroundColor: 'transparent',
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '15px',
            textDecoration: 'none',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--av-gold)';
            e.currentTarget.style.backgroundColor = 'rgba(200,168,78,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--av-border-strong)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          See It in Action
        </a>
      </motion.div>

      <motion.a
        href="#stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1.5, duration: 0.8 },
          y:       { duration: 2, repeat: Infinity, delay: 1.5 },
        }}
        style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--av-text-dim)',
        }}
        aria-label="Scroll for more"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
