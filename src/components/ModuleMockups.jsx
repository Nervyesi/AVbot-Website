import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Module mockups. Discord-embed-style CSS cards used as the in-action panels
 * along the ScrollJourney. Each mockup has its own IntersectionObserver that
 * gates its internal animation (counters tick, checkmarks pop, log feeds
 * stagger) only when the mockup itself is on screen.
 */

// ── Shared style fragments ──────────────────────────────────────────────────

export const mockupCardStyle = {
  background: '#1e1f22',
  borderLeft: '3px solid var(--av-gold)',
  borderRadius: '6px',
  padding: '18px 22px',
  color: 'var(--av-text)',
  fontFamily: 'Sora, sans-serif',
  fontSize: '14px',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 28px 70px -28px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
  position: 'relative',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
};

const botBadgeStyle = {
  background: '#5865F2',
  color: '#fff',
  fontSize: '9px',
  fontWeight: 700,
  padding: '1px 5px',
  borderRadius: '3px',
  marginLeft: '4px',
  letterSpacing: '0.04em',
};

const labelStyle = {
  fontSize: '11px',
  color: 'var(--av-text-dim)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function useInViewOnce(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Counter({ target, prefix = '', suffix = '', inView, duration = 1500 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const startT = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - startT) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.floor(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

function BotHeader({ subtitle }) {
  return (
    <div style={headerStyle}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c89a1f, #94730D)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: '#0a0a0a',
      }}>AV</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          AVbot
          <span style={botBadgeStyle}>BOT</span>
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--av-text-dim)' }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ── Module mockups ──────────────────────────────────────────────────────────

export function AnalyticsMockup() {
  const [ref, inView] = useInViewOnce();
  const bars = [42, 68, 54, 80, 88, 96];
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Community Pulse" />
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '14px', marginBottom: '18px',
      }}>
        {[
          { label: 'Members', target: 9978 },
          { label: 'Active',  target: 420 },
          { label: 'Engages', target: 1840 },
          { label: 'Growth',  target: 28, prefix: '+', suffix: '%' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--av-gold)' }}>
              <Counter target={s.target} prefix={s.prefix || ''} suffix={s.suffix || ''} inView={inView} />
            </div>
            <div style={labelStyle}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '6px',
        height: '64px', padding: '0 2px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '14px',
      }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1,
            height: inView ? `${h}%` : '0%',
            background: 'linear-gradient(180deg, #f1d586, var(--av-gold) 60%, #6f5208)',
            borderRadius: '3px 3px 0 0',
            transition: `height 0.9s cubic-bezier(0.22, 0.6, 0.2, 1) ${0.25 + i * 0.08}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function VerifyMockup() {
  const [ref, inView] = useInViewOnce();
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setVerified(true), 900);
    return () => clearTimeout(t);
  }, [inView]);
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Verification required" />
      <div style={{ fontSize: 14, color: 'var(--av-text)', marginBottom: 14 }}>
        Verify yourself to access the community.
      </div>
      <button
        disabled
        style={{
          background: verified ? '#3ba55c' : 'var(--av-gold)',
          color: '#0a0a0a',
          border: 'none',
          padding: '9px 22px',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 13,
          fontFamily: 'Sora, sans-serif',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          transition: 'background 0.5s ease, transform 0.4s ease',
          transform: verified ? 'scale(1.02)' : 'scale(1)',
          cursor: 'default',
        }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.4s ease',
          transform: verified ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>
          {verified ? '✓' : '○'}
        </span>
        {verified ? 'Verified' : 'Verify'}
      </button>
      {verified && (
        <div style={{
          fontSize: 12, color: 'var(--av-text-dim)', marginTop: 12,
          opacity: 0, animation: 'fadeUp 0.5s ease 0.1s forwards',
        }}>
          Role granted, access unlocked.
        </div>
      )}
    </div>
  );
}

export function RoleSelectMockup() {
  const [ref, inView] = useInViewOnce();
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setPicked(1), 800);
    return () => clearTimeout(t);
  }, [inView]);
  const roles = [
    { icon: '🎨', label: 'Creator' },
    { icon: '🛠️', label: 'Builder' },
    { icon: '📊', label: 'Trader' },
    { icon: '🤝', label: 'Member' },
  ];
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Pick your roles" />
      <div style={{ fontSize: 13, color: 'var(--av-text-muted)', marginBottom: 14 }}>
        Choose how you want to engage in this community.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {roles.map((r, i) => {
          const active = picked === i;
          return (
            <div
              key={r.label}
              style={{
                padding: '9px 12px',
                borderRadius: 6,
                background: active ? 'rgba(200,168,78,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'var(--av-gold)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? 'var(--av-gold)' : 'var(--av-text)',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.45s cubic-bezier(0.22, 0.6, 0.2, 1)',
              }}
            >
              <span style={{ fontSize: 14 }}>{r.icon}</span>
              {r.label}
              {active && <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RaidMockup() {
  const [ref, inView] = useInViewOnce();
  const [toggled, setToggled] = useState({ like: false, comment: false, retweet: false });
  useEffect(() => {
    if (!inView) return;
    const a = setTimeout(() => setToggled((s) => ({ ...s, like: true })), 500);
    const b = setTimeout(() => setToggled((s) => ({ ...s, comment: true })), 1100);
    const c = setTimeout(() => setToggled((s) => ({ ...s, retweet: true })), 1700);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [inView]);
  const count = (toggled.like ? 12 : 0) + (toggled.comment ? 40 : 0) + (toggled.retweet ? 48 : 0);
  const tasks = [
    { key: 'like',    icon: '❤️', label: 'Like'    },
    { key: 'comment', icon: '💬', label: 'Comment' },
    { key: 'retweet', icon: '🔁', label: 'Retweet' },
  ];
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Raid #0042" />
      <div style={{ fontSize: 13, color: 'var(--av-text-muted)', marginBottom: 12 }}>
        Engage with the latest community post. Live verification, anti cheat on.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {tasks.map((t) => {
          const on = toggled[t.key];
          return (
            <div
              key={t.key}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 6,
                background: on ? 'rgba(59,165,92,0.16)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? 'rgba(59,165,92,0.55)' : 'rgba(255,255,255,0.08)'}`,
                color: on ? '#7adc9a' : 'var(--av-text-dim)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.4s ease',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {on && <span>✓</span>}
            </div>
          );
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '10px 0 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={labelStyle}>Points earned</span>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--av-gold)' }}>
          <Counter target={count} inView={inView} duration={500} key={count} />
        </span>
      </div>
    </div>
  );
}

export function EngageMockup() {
  const [ref, inView] = useInViewOnce();
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Engage pool, Community" />
      <div style={{
        background: '#16181c',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 6,
        padding: '12px 14px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(200,168,78,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--av-gold)',
          }}>N</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>@nervyesi</div>
            <div style={{ fontSize: 10, color: 'var(--av-text-dim)' }}>posted a tweet</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--av-text-muted)', lineHeight: 1.5 }}>
          Just shipped a thing. Tap into the engage pool and we both win.
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={labelStyle}>Balance</span>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--av-gold)' }}>
          <Counter target={324} suffix=" pts" inView={inView} />
        </span>
      </div>
    </div>
  );
}

export function ProtectionMockup() {
  const [ref, inView] = useInViewOnce();
  const events = [
    { sev: 'warn',  icon: '🛡️', text: 'Spam filtered', detail: '@user_a821 muted 10m' },
    { sev: 'error', icon: '⚠️', text: 'Raid detected', detail: '12 joins in 30s, lockdown engaged' },
    { sev: 'warn',  icon: '🚫', text: 'Phishing link blocked', detail: 'discord-nitro.gift' },
    { sev: 'info',  icon: '🔒', text: 'Account age gate', detail: '3 accounts under 7d held' },
  ];
  const sevColor = {
    warn:  { border: 'rgba(241,213,134,0.55)', tint: 'rgba(241,213,134,0.06)' },
    error: { border: 'rgba(255,140,66,0.6)',   tint: 'rgba(255,140,66,0.06)'  },
    info:  { border: 'rgba(255,255,255,0.2)',  tint: 'rgba(255,255,255,0.03)' },
  };
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Protection log" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map((e, i) => (
          <motion.div
            key={i}
            initial={{ x: -18, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -18, opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.32, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 10px',
              background: sevColor[e.sev].tint,
              border: `1px solid ${sevColor[e.sev].border}`,
              borderRadius: 6,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{e.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--av-text)' }}>{e.text}</div>
              <div style={{ fontSize: 11, color: 'var(--av-text-dim)' }}>{e.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function TicketsMockup() {
  const [ref, inView] = useInViewOnce();
  const bubbles = [
    { who: 'member', text: 'Hey team, I cannot access the creator channel after verification.' },
    { who: 'staff',  text: 'Looking into it. What role did you select on join?' },
    { who: 'member', text: 'Builder. Followed all the steps.' },
  ];
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Ticket #0214" />
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12,
      }}>
        <span style={{
          padding: '3px 10px', borderRadius: 999,
          background: 'rgba(200,168,78,0.16)',
          border: '1px solid rgba(200,168,78,0.35)',
          color: 'var(--av-gold)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Support</span>
        <span style={{
          padding: '3px 10px', borderRadius: 999,
          background: 'rgba(59,165,92,0.16)',
          border: '1px solid rgba(59,165,92,0.4)',
          color: '#7adc9a',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Open</span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, color: 'var(--av-text-dim)',
        }}>3m ago</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.35 }}
            style={{
              alignSelf: b.who === 'member' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: 10,
              background: b.who === 'member' ? 'rgba(255,255,255,0.05)' : 'rgba(200,168,78,0.13)',
              border: `1px solid ${b.who === 'member' ? 'rgba(255,255,255,0.07)' : 'rgba(200,168,78,0.28)'}`,
              fontSize: 12,
              color: b.who === 'member' ? 'var(--av-text-muted)' : 'var(--av-text)',
              lineHeight: 1.5,
            }}
          >
            {b.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function FormsMockup() {
  const [ref, inView] = useInViewOnce();
  const [stamped, setStamped] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setStamped(true), 1100);
    return () => clearTimeout(t);
  }, [inView]);
  const fields = [
    { label: 'X handle', value: '@nervyesi' },
    { label: 'Content type', value: 'Threads, video' },
    { label: 'Why creator', value: 'Building in public, weekly drops.' },
  ];
  return (
    <div ref={ref} style={{ ...mockupCardStyle, overflow: 'hidden' }}>
      <BotHeader subtitle="Creator application" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
        {fields.map((f) => (
          <div key={f.label}>
            <div style={{ ...labelStyle, marginBottom: 3 }}>{f.label}</div>
            <div style={{
              padding: '7px 10px',
              borderRadius: 4,
              background: '#16181c',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12,
              color: 'var(--av-text)',
            }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 18, right: 14,
          padding: '6px 14px',
          border: '2px solid #3ba55c',
          borderRadius: 6,
          color: '#7adc9a',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          transform: stamped ? 'rotate(-12deg) scale(1)' : 'rotate(-30deg) scale(0.6)',
          opacity: stamped ? 1 : 0,
          transition: 'all 0.55s cubic-bezier(0.22, 1.4, 0.4, 1)',
        }}
      >
        Approved
      </div>
    </div>
  );
}

export function LogsMockup() {
  const [ref, inView] = useInViewOnce();
  const rows = [
    { sev: 'info', badge: 'INFO', cat: 'admin',      text: 'Admin granted access to @new_mod' },
    { sev: 'warn', badge: 'WARN', cat: 'protection', text: 'Phishing link removed in #general' },
    { sev: 'info', badge: 'INFO', cat: 'raid',       text: 'Raid #0042 created by @nervyesi' },
    { sev: 'warn', badge: 'WARN', cat: 'engage',     text: 'Flagged: @user_92ab on submission #07' },
    { sev: 'info', badge: 'INFO', cat: 'settings',   text: 'Brand color updated' },
  ];
  const sevTone = {
    info: { fg: '#a1a1aa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)' },
    warn: { fg: '#f1d586', bg: 'rgba(241,213,134,0.08)', border: 'rgba(241,213,134,0.3)' },
  };
  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Unified activity log" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => {
          const tone = sevTone[r.sev];
          return (
            <motion.div
              key={i}
              initial={{ x: -14, opacity: 0 }}
              animate={inView ? { x: 0, opacity: 1 } : { x: -14, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.18 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 10px',
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                borderRadius: 6,
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                color: tone.fg,
                padding: '2px 6px',
                border: `1px solid ${tone.border}`,
                borderRadius: 3,
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              }}>{r.badge}</span>
              <span style={{
                fontSize: 10, color: 'var(--av-text-dim)',
                fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              }}>{r.cat}</span>
              <span style={{
                fontSize: 12, color: 'var(--av-text)', flex: 1, minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{r.text}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Aggregated panel metadata ───────────────────────────────────────────────

export const MODULE_PANELS = [
  { id: 'analytics',  icon: '📊', label: 'Analytics',      headline: 'See your community breathe.',          copy: 'Real time dashboards track member growth, engagement, and module performance. Decisions become obvious when the data is in front of you.', Mockup: AnalyticsMockup },
  { id: 'verify',     icon: '✅', label: 'Verification',   headline: 'Bots stop at the door.',                copy: 'Token gated, role based access. Every member proves they belong through challenges that fit your brand, not a generic captcha.', Mockup: VerifyMockup },
  { id: 'roleselect', icon: '🎭', label: 'Role Selection', headline: 'Members tag themselves.',               copy: 'Beautiful pickers with reaction or button panels. Members claim their roles in a click. Your mods get their afternoons back.', Mockup: RoleSelectMockup },
  { id: 'raid',       icon: '⚔️', label: 'Raid',            headline: 'Amplify your X reach in minutes.',     copy: 'Reward members for engaging with your tweets. Live X verification, anti cheat detection, and a live leaderboard turn organic engagement into a community habit.', Mockup: RaidMockup },
  { id: 'engage',     icon: '🔁', label: 'Engage',          headline: 'A perpetual engine for your community.', copy: 'Members earn points by engaging with each other tweets, then spend those points to submit their own. The flywheel runs itself, no admin work required.', Mockup: EngageMockup },
  { id: 'protection', icon: '🛡️', label: 'Protection',     headline: 'Sleep through the night.',              copy: 'Anti spam, anti raid, and anti scam guardrails work silently. Phishing blocklist, account age gates, and lockdown response all logged for the morning.', Mockup: ProtectionMockup },
  { id: 'tickets',    icon: '🎫', label: 'Tickets',         headline: 'Support that scales.',                  copy: 'Categorized threads, status pills, and a full audit trail. Your team handles ten tickets like one without losing context.', Mockup: TicketsMockup },
  { id: 'forms',      icon: '📝', label: 'Forms',           headline: 'Onboard the right people.',             copy: 'Visual form builder with approval workflows and auto roles. Every application reviewed, every applicant tracked, every decision logged.', Mockup: FormsMockup },
  { id: 'logs',       icon: '📋', label: 'Logs',            headline: 'Every action, traceable.',              copy: 'One unified activity log across every module. Admin actions, flagged users, settings changes, and protection events. Full transparency.', Mockup: LogsMockup },
];
