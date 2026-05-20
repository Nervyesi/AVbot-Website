import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

// Single page-wide style block so we don't fight the existing index.css.
// Tailwind is available (v4 zero-config) — use it freely for layout/spacing.

// ── Hero ─────────────────────────────────────────────────────────────────────

function ParticleField() {
  // Pre-computed positions/delays so the layout is stable between renders.
  // 30 particles max per spec rule #9.
  const particles = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      top:      Math.random() * 100,
      left:     Math.random() * 100,
      size:     Math.random() < 0.3 ? 2 : 1,
      duration: 15 + Math.random() * 20,
      delay:    Math.random() * 10,
      anim:     i % 4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Central radial gold glow */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: '800px', height: '800px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--av-gold-glow) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top:        `${p.top}%`,
            left:       `${p.left}%`,
            width:      `${p.size * 2}px`,
            height:     `${p.size * 2}px`,
            background: 'rgba(200,168,78,0.45)',
            boxShadow:  '0 0 6px rgba(200,168,78,0.3)',
            animation:  `av-float-${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection({ inviteUrl }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ minHeight: '100vh', backgroundColor: 'var(--av-bg)' }}
    >
      <ParticleField />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:    'var(--av-gold)',
            filter:        'blur(48px)',
            animation:     'av-logo-pulse 3s ease-in-out infinite',
          }}
        />
        <img
          src={LOGO_URL}
          alt="AVbot"
          className="relative w-32 h-32 md:w-40 md:h-40 select-none"
          draggable="false"
        />
      </motion.div>

      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.05]"
        style={{ color: 'var(--av-text)' }}
      >
        Your Community
        <br />
        <span style={{ color: 'var(--av-gold)' }}>Deserves Better.</span>
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-6 text-lg md:text-xl max-w-2xl leading-relaxed"
        style={{ color: 'var(--av-text-muted)' }}
      >
        AVbot is the Web3-native Discord engine built for raids, engagement,
        and growth. Crafted for serious communities.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mt-10 flex flex-col sm:flex-row gap-4"
      >
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 rounded-lg font-semibold relative overflow-hidden group transition-transform"
          style={{ backgroundColor: 'var(--av-gold)', color: '#000' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span className="relative z-10">Add AVbot to Discord</span>
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'var(--av-gold-light)' }}
            aria-hidden="true"
          />
        </a>

        <a
          href="#showcase"
          className="px-8 py-4 rounded-lg font-semibold border transition-colors"
          style={{
            borderColor: 'var(--av-border-strong)',
            color:       'var(--av-text)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--av-gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--av-border-strong)'; }}
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
        className="absolute bottom-8 left-1/2"
        style={{ transform: 'translateX(-50%)' }}
        aria-label="Scroll for more"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--av-text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    const steps    = duration / stepTime;
    const increment = target / steps;
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
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--av-gold)' }}>
        {prefix}{displayed.toLocaleString()}
      </div>
      <div
        className="text-xs md:text-sm uppercase tracking-wider mt-2"
        style={{ color: 'var(--av-text-dim)', letterSpacing: '0.12em' }}
      >
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
      className="border-y"
      style={{ borderColor: 'var(--av-border)', backgroundColor: 'var(--av-bg-elevated)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatItem label="Members Engaged"    value={stats?.total_members || 0}      visible={visible} />
        <StatItem label="Active This Month"  value={stats?.active_members || 0}     visible={visible} />
        <StatItem label="Growth (30d)"       value={stats?.member_growth_30d || 0}  visible={visible} prefix="+" />
        <StatItem label="Total Interactions" value={stats?.total_messages || 0}     visible={visible} />
      </div>
    </div>
  );
}

// ── Module Showcase ──────────────────────────────────────────────────────────

const MODULES = [
  {
    id:         'raid',
    icon:       '⚔️',
    title:      'Raid',
    tagline:    'Amplify your X reach.',
    description:'Reward your community with points for engaging with your tweets. Live X verification, anti-cheat, and a competitive leaderboard.',
    features:   ['Live Twitter verification', 'Anti-cheat detection', 'Customizable rewards', 'Real-time leaderboard'],
  },
  {
    id:         'engage',
    icon:       '🔁',
    title:      'Engage',
    tagline:    'A self-sustaining ecosystem.',
    description:"Members earn points by engaging with each other's tweets, then spend those points to submit their own. A perpetual engine for your community.",
    features:   ['Per-pool isolation', 'Submit your own tweets', 'Configurable economy', 'Multi-pool for power users'],
  },
  {
    id:         'protection',
    icon:       '🛡️',
    title:      'Protection',
    tagline:    "Your community's guardian.",
    description:'Anti-spam, anti-raid, and anti-scam guardrails that work silently in the background. Sleep easy.',
    features:   ['Spam filter', 'Raid detection', 'Account-age gates', 'Customizable rules'],
  },
  {
    id:         'verify',
    icon:       '✅',
    title:      'Verification',
    tagline:    'Identity, on your terms.',
    description:"Token-gated, role-based access. Verify members through customizable challenges that fit your community's vibe.",
    features:   ['Token gating', 'Role assignment', 'Custom panels', 'Web3-native'],
  },
  {
    id:         'forms',
    icon:       '📝',
    title:      'Forms',
    tagline:    'Onboarding, redefined.',
    description:'Build custom application forms for your community. Approval workflows, role rewards, and full submission history.',
    features:   ['Drag-and-drop builder', 'Approval workflows', 'Auto-role on approval', 'Submission history'],
  },
  {
    id:         'tickets',
    icon:       '🎫',
    title:      'Tickets',
    tagline:    'Support that scales.',
    description:"Ticket management that doesn't turn your DMs into chaos. Categorized, threaded, and trackable.",
    features:   ['Threaded conversations', 'Category routing', 'Auto-close inactive', 'Full audit trail'],
  },
];

function ModuleCard({ module, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl border p-6 overflow-hidden group cursor-default transition-colors duration-300"
      style={{
        backgroundColor: 'var(--av-bg-elevated)',
        borderColor:     hovered ? 'var(--av-gold)' : 'var(--av-border)',
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity:    hovered ? 1 : 0,
          background: 'radial-gradient(circle at top right, var(--av-gold-glow) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="text-4xl mb-4">{module.icon}</div>
        <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--av-text)' }}>
          {module.title}
        </h3>
        <div className="text-sm font-medium mb-4" style={{ color: 'var(--av-gold)' }}>
          {module.tagline}
        </div>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--av-text-muted)' }}>
          {module.description}
        </p>

        <ul className="space-y-2">
          {module.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--av-text-dim)' }}>
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
    <section id="showcase" className="py-24 px-6" style={{ backgroundColor: 'var(--av-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: 'var(--av-text)' }}>
            Six modules. <span style={{ color: 'var(--av-gold)' }}>One bot.</span>
          </h2>
          <p className="mt-4 text-lg" style={{ color: 'var(--av-text-muted)' }}>
            Each module crafted for serious Web3 communities. Pick what fits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div style={{ backgroundColor: 'var(--av-bg)', color: 'var(--av-text)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>
      <HeroSection inviteUrl={inviteUrl} />
      <LiveStatsBar />
      <ModuleShowcase />

      <div className="py-24 text-center text-sm" style={{ color: 'var(--av-text-dim)' }}>
        More sections coming soon…
      </div>
    </div>
  );
};

export default Landing;
