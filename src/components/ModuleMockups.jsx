import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Module mockups. Premium Discord-embed-style cards depicting each AVbot
 * module in motion. Each mockup uses an IntersectionObserver to gate its
 * internal animation so counters tick, checkmarks pop, log feeds stagger,
 * etc. only when the card is on screen.
 */

// ── Shared style fragments ──────────────────────────────────────────────────

export const mockupCardStyle = {
  background: 'linear-gradient(180deg, #1f2024 0%, #1a1b1f 100%)',
  borderLeft: '3px solid var(--av-gold)',
  borderRadius: '8px',
  padding: '20px 24px',
  color: 'var(--av-text)',
  fontFamily: 'Sora, sans-serif',
  fontSize: '14px',
  width: '100%',
  maxWidth: '460px',
  boxShadow:
    '0 30px 70px -28px rgba(0,0,0,0.78), ' +
    '0 0 0 1px rgba(255,255,255,0.05), ' +
    'inset 0 1px 0 rgba(255,255,255,0.04)',
  position: 'relative',
};

const headerRowStyle = {
  display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px',
};

const botBadgeStyle = {
  background: '#5865F2',
  color: '#fff',
  fontSize: '9px',
  fontWeight: 700,
  padding: '1px 5px',
  borderRadius: '3px',
  marginLeft: '5px',
  letterSpacing: '0.04em',
};

const labelStyle = {
  fontSize: '10.5px',
  color: 'rgba(228,228,231,0.55)',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontWeight: 600,
};

const dividerStyle = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  margin: '12px 0',
};

const monoFont = 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace';

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

function BotHeader({ subtitle, accent }) {
  return (
    <div style={headerRowStyle}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c89a1f, #94730D)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: '#0a0a0a',
        boxShadow: '0 6px 20px -6px rgba(200,168,78,0.5)',
      }}>AV</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          AVbot
          <span style={botBadgeStyle}>BOT</span>
        </div>
        {subtitle && (
          <div style={{
            fontSize: 11, color: accent || 'rgba(228,228,231,0.55)',
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 1,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: 'currentColor',
              opacity: 0.7,
            }} />
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Module mockups ──────────────────────────────────────────────────────────

export function AnalyticsMockup() {
  const [ref, inView] = useInViewOnce();
  const [tab, setTab] = useState(1); // 0=1d, 1=7d, 2=30d
  // Sparkline points (normalized 0..1)
  const spark = [0.32, 0.40, 0.36, 0.48, 0.56, 0.51, 0.62, 0.74, 0.69, 0.82, 0.78, 0.90, 0.94, 1.00];

  // SVG path for the sparkline
  const W = 380, H = 60;
  const pathD = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * W;
    const y = H - v * H * 0.85 - 4;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  // Compute fill area
  const fillPathD = pathD + ` L ${W} ${H} L 0 ${H} Z`;

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Community Pulse" accent="var(--av-gold)" />

      <div style={{
        display: 'flex', gap: 4,
        background: 'rgba(255,255,255,0.04)',
        padding: 3, borderRadius: 6,
        marginBottom: 14,
        width: 'fit-content',
      }}>
        {['1D', '7D', '30D'].map((l, i) => (
          <button
            key={l}
            onClick={() => setTab(i)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: tab === i ? 'rgba(200,168,78,0.18)' : 'transparent',
              color: tab === i ? 'var(--av-gold)' : 'rgba(228,228,231,0.55)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              transition: 'all 0.15s',
            }}
          >{l}</button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 16, marginBottom: 16,
      }}>
        {[
          { label: 'Members', target: 9978, trend: '↗ +124' },
          { label: 'Active',  target: 1420, trend: '↗ +38' },
          { label: 'Engages', target: 3840, trend: '↗ +212' },
          { label: 'Raids',   target: 47,   trend: '↘ -3' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--av-gold)', lineHeight: 1.1 }}>
              <Counter target={s.target} inView={inView} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <div style={labelStyle}>{s.label}</div>
              <div style={{
                fontSize: 10,
                color: s.trend.startsWith('↗') ? '#7adc9a' : '#f1d586',
                fontFamily: monoFont,
              }}>{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={dividerStyle} />

      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', marginBottom: 4,
        }}>
          <span style={labelStyle}>Member growth</span>
          <span style={{ fontSize: 10, color: 'rgba(228,228,231,0.4)', fontFamily: monoFont }}>last 7d</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="ax-spark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(241,213,134,0.55)" />
              <stop offset="100%" stopColor="rgba(148,115,13,0)" />
            </linearGradient>
          </defs>
          <path
            d={fillPathD}
            fill="url(#ax-spark)"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 1s ease 0.4s',
            }}
          />
          <path
            d={pathD}
            stroke="var(--av-gold)"
            strokeWidth="1.5"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 700,
              strokeDashoffset: inView ? 0 : 700,
              transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22, 0.6, 0.2, 1) 0.3s',
            }}
          />
        </svg>
      </div>
    </div>
  );
}

export function VerifyMockup() {
  const [ref, inView] = useInViewOnce();
  // 0 = idle, 1 = verifying, 2 = verified
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setStage(1), 700);
    const t2 = setTimeout(() => setStage(2), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Verification panel" />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--av-text)', marginBottom: 6 }}>
          Welcome to AmeretaVerse
        </div>
        <div style={{ fontSize: 13, color: 'rgba(228,228,231,0.7)', lineHeight: 1.55 }}>
          Verify yourself to unlock the creator channels. Takes ten seconds.
        </div>
      </div>

      <button
        disabled
        style={{
          width: '100%',
          padding: '12px 18px',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 14,
          fontFamily: 'Sora, sans-serif',
          color: stage === 2 ? '#0a0a0a' : '#0a0a0a',
          background: stage === 2 ? '#3ba55c' : 'var(--av-gold)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'default',
          transition: 'background 0.5s ease',
          boxShadow: stage === 2
            ? '0 0 28px -6px rgba(59,165,92,0.55)'
            : '0 0 28px -10px rgba(200,168,78,0.55)',
        }}
      >
        {stage === 0 && <>○ Click to verify</>}
        {stage === 1 && (
          <>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid rgba(10,10,10,0.3)',
              borderTopColor: '#0a0a0a',
              animation: 'av-spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
            Verifying
          </>
        )}
        {stage === 2 && <>✓ Verified</>}
      </button>

      {stage === 2 && (
        <div style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'rgba(59,165,92,0.08)',
          border: '1px solid rgba(59,165,92,0.3)',
          borderRadius: 6,
          fontSize: 12,
          color: '#7adc9a',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'av-fade-in 0.5s ease 0.1s both',
        }}>
          <span>🎭</span>
          Role granted: <span style={{ fontWeight: 700, color: '#a8e7bc' }}>Builder</span>
        </div>
      )}
    </div>
  );
}

export function RoleSelectMockup() {
  const [ref, inView] = useInViewOnce();
  const [picked, setPicked] = useState(new Set());
  useEffect(() => {
    if (!inView) return;
    const seq = [0, 3, 1];
    const timers = seq.map((idx, i) => setTimeout(() => {
      setPicked((prev) => new Set(prev).add(idx));
    }, 500 + i * 500));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const roles = [
    { icon: '🎨', label: 'Creator' },
    { icon: '🛠️', label: 'Builder' },
    { icon: '📊', label: 'Trader' },
    { icon: '🤝', label: 'Member' },
    { icon: '🎮', label: 'Gamer' },
    { icon: '⛓️', label: 'Onchain' },
  ];

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Pick your roles" />

      <div style={{
        fontSize: 13, color: 'rgba(228,228,231,0.7)',
        marginBottom: 12, lineHeight: 1.5,
      }}>
        Choose any that fit. We will sort your channel access automatically.
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        {roles.map((r, i) => {
          const active = picked.has(i);
          return (
            <div
              key={r.label}
              style={{
                padding: '10px 12px',
                borderRadius: 7,
                background: active ? 'rgba(200,168,78,0.18)' : 'rgba(255,255,255,0.035)',
                border: `1px solid ${active ? 'var(--av-gold)' : 'rgba(255,255,255,0.07)'}`,
                color: active ? 'var(--av-gold)' : 'rgba(228,228,231,0.85)',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.4s cubic-bezier(0.22, 0.6, 0.2, 1)',
              }}
            >
              <span style={{ fontSize: 15 }}>{r.icon}</span>
              <span>{r.label}</span>
              {active && (
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={labelStyle}>Selected</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--av-gold)' }}>
          {picked.size} / {roles.length}
        </span>
      </div>
    </div>
  );
}

export function FormsMockup() {
  const [ref, inView] = useInViewOnce();
  const [typed, setTyped] = useState('');
  const [stamped, setStamped] = useState(false);
  const targetText = 'Building in public. Weekly drops.';
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(targetText.slice(0, i));
      if (i >= targetText.length) clearInterval(interval);
    }, 32);
    const stamp = setTimeout(() => setStamped(true), 2400);
    return () => { clearInterval(interval); clearTimeout(stamp); };
  }, [inView]);

  const fields = [
    { label: 'X handle',   value: '@nervyesi', mono: true },
    { label: 'Following',  value: '12.4k',     mono: true },
    { label: 'Content',    value: 'Threads, video', mono: false },
  ];

  return (
    <div ref={ref} style={{ ...mockupCardStyle, overflow: 'hidden' }}>
      <BotHeader subtitle="Creator application" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map((f) => (
          <div key={f.label}>
            <div style={{ ...labelStyle, marginBottom: 3 }}>{f.label}</div>
            <div style={{
              padding: '8px 12px',
              borderRadius: 5,
              background: '#13141a',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12.5,
              color: 'var(--av-text)',
              fontFamily: f.mono ? monoFont : 'Sora, sans-serif',
            }}>{f.value}</div>
          </div>
        ))}
        <div>
          <div style={{ ...labelStyle, marginBottom: 3 }}>Why creator</div>
          <div style={{
            padding: '8px 12px',
            borderRadius: 5,
            background: '#13141a',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12.5,
            color: 'var(--av-text)',
            minHeight: 36,
            display: 'flex', alignItems: 'center',
          }}>
            {typed}
            <span style={{
              display: 'inline-block', width: 7, height: 14,
              background: 'var(--av-gold)',
              marginLeft: 2,
              opacity: typed.length === targetText.length ? 0 : 1,
              animation: 'av-blink 1s steps(1) infinite',
            }} />
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 16, right: 14,
          padding: '7px 16px',
          border: '2px solid #3ba55c',
          borderRadius: 6,
          color: '#7adc9a',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          transform: stamped ? 'rotate(-12deg) scale(1)' : 'rotate(-32deg) scale(0.55)',
          opacity: stamped ? 1 : 0,
          transition: 'all 0.6s cubic-bezier(0.22, 1.4, 0.4, 1)',
          background: 'rgba(59,165,92,0.04)',
        }}
      >
        Approved
      </div>
    </div>
  );
}

export function TicketsMockup() {
  const [ref, inView] = useInViewOnce();
  const [status, setStatus] = useState(0); // 0=open, 1=progress, 2=resolved
  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setStatus(1), 1400);
    const t2 = setTimeout(() => setStatus(2), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  const bubbles = [
    { who: 'member', text: 'Cannot access the creator channel after verification.', time: '14:02' },
    { who: 'staff',  text: 'Looking into it. Which role did you pick on join?',     time: '14:03' },
    { who: 'member', text: 'Builder. Followed every step.',                          time: '14:03' },
    { who: 'staff',  text: 'Found it. Role assignment was stuck. Refreshing now.',   time: '14:05' },
  ];

  const statusTone = [
    { bg: 'rgba(241,213,134,0.16)', border: 'rgba(241,213,134,0.4)', fg: '#f1d586', label: 'OPEN' },
    { bg: 'rgba(200,168,78,0.16)',  border: 'rgba(200,168,78,0.45)', fg: 'var(--av-gold)', label: 'IN PROGRESS' },
    { bg: 'rgba(59,165,92,0.16)',   border: 'rgba(59,165,92,0.4)',   fg: '#7adc9a',  label: 'RESOLVED' },
  ];
  const tone = statusTone[status];

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Ticket #0214 • Support" />

      <div style={{
        display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14,
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
          background: tone.bg,
          border: `1px solid ${tone.border}`,
          color: tone.fg,
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          transition: 'all 0.45s',
        }}>{tone.label}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bubbles.map((b, i) => (
          <motion.div
            key={i}
            initial={{ y: 10, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.4 }}
            style={{
              alignSelf: b.who === 'member' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: 10,
              background: b.who === 'member'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(200,168,78,0.13)',
              border: `1px solid ${b.who === 'member' ? 'rgba(255,255,255,0.06)' : 'rgba(200,168,78,0.28)'}`,
              fontSize: 12,
              color: b.who === 'member' ? 'rgba(228,228,231,0.85)' : 'var(--av-text)',
              lineHeight: 1.5,
              position: 'relative',
            }}
          >
            <div>{b.text}</div>
            <div style={{
              fontSize: 9, color: 'rgba(228,228,231,0.4)',
              fontFamily: monoFont, marginTop: 3,
              textAlign: 'right',
            }}>{b.time}</div>
          </motion.div>
        ))}
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
      <BotHeader subtitle="Raid #0042 • Live verification" accent="var(--av-gold)" />

      <div style={{
        background: '#13141a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 7,
        padding: '12px 14px',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(200,168,78,0.4), rgba(148,115,13,0.7))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#0a0a0a',
            flexShrink: 0,
          }}>A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--av-text)' }}>
              @ameretaverse <span style={{ color: 'rgba(228,228,231,0.4)', fontWeight: 400 }}>· 2m</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(228,228,231,0.8)', lineHeight: 1.5, marginTop: 4 }}>
              Engage with our latest. Three tasks, full payout. Live cheat detection on.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {tasks.map((t) => {
          const on = toggled[t.key];
          return (
            <div
              key={t.key}
              style={{
                flex: 1,
                padding: '9px 10px',
                borderRadius: 7,
                background: on ? 'rgba(59,165,92,0.16)' : 'rgba(255,255,255,0.035)',
                border: `1px solid ${on ? 'rgba(59,165,92,0.55)' : 'rgba(255,255,255,0.08)'}`,
                color: on ? '#7adc9a' : 'rgba(228,228,231,0.55)',
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
        padding: '12px 0 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={labelStyle}>Points earned</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--av-gold)' }}>
          <Counter target={count} inView={inView} duration={500} key={count} />
          <span style={{ fontSize: 11, color: 'rgba(228,228,231,0.55)', marginLeft: 6, fontWeight: 500 }}>pts</span>
        </span>
      </div>
    </div>
  );
}

export function EngageMockup() {
  const [ref, inView] = useInViewOnce();
  const tweets = [
    { who: 'nervyesi',  pts: 18 },
    { who: 'devfounder', pts: 22 },
  ];

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Engage pool • Community" accent="var(--av-gold)" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {tweets.map((t, i) => (
          <motion.div
            key={t.who}
            initial={{ y: 8, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.35 }}
            style={{
              background: '#13141a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
              padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(200,168,78,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'var(--av-gold)',
              flexShrink: 0,
            }}>{t.who.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>@{t.who}</div>
              <div style={{
                fontSize: 11, color: 'rgba(228,228,231,0.55)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>posted a tweet · ready to engage</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700,
              color: 'var(--av-gold)',
              background: 'rgba(200,168,78,0.1)',
              border: '1px solid rgba(200,168,78,0.3)',
              padding: '4px 8px',
              borderRadius: 4,
              fontFamily: monoFont,
            }}>+{t.pts}</div>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={labelStyle}>Your balance</span>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--av-gold)' }}>
          <Counter target={324} inView={inView} />
          <span style={{ fontSize: 11, color: 'rgba(228,228,231,0.55)', marginLeft: 6, fontWeight: 500 }}>pts</span>
        </span>
      </div>
    </div>
  );
}

export function ProtectionMockup() {
  const [ref, inView] = useInViewOnce();
  const events = [
    { sev: 'warn',  icon: '🛡️', text: 'Spam filtered',       detail: '@user_a821 muted for 10 minutes' },
    { sev: 'error', icon: '⚠️', text: 'Raid detected',        detail: '12 joins in 30s, lockdown engaged' },
    { sev: 'warn',  icon: '🚫', text: 'Phishing link blocked', detail: 'discord-nitro.gift removed' },
    { sev: 'info',  icon: '🔒', text: 'Account age gate',      detail: '3 accounts under 7d held' },
  ];
  const sevColor = {
    warn:  { border: 'rgba(241,213,134,0.55)', tint: 'rgba(241,213,134,0.06)', dot: '#f1d586' },
    error: { border: 'rgba(255,140,66,0.6)',   tint: 'rgba(255,140,66,0.06)',  dot: '#ff8c42' },
    info:  { border: 'rgba(255,255,255,0.2)',  tint: 'rgba(255,255,255,0.03)', dot: 'rgba(255,255,255,0.5)' },
  };

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Protection • Live" accent="#ff8c42" />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 12,
      }}>
        <span style={labelStyle}>Today</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--av-text)' }}>
          <Counter target={47} inView={inView} duration={1100} />
          <span style={{ fontSize: 11, color: 'rgba(228,228,231,0.55)', marginLeft: 6, fontWeight: 500 }}>actions</span>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map((e, i) => {
          const tone = sevColor[e.sev];
          return (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={inView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.3 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '9px 11px',
                background: tone.tint,
                border: `1px solid ${tone.border}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{e.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--av-text)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: tone.dot,
                  }} />
                  {e.text}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(228,228,231,0.55)', marginTop: 1 }}>
                  {e.detail}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function LogsMockup() {
  const [ref, inView] = useInViewOnce();
  const [tab, setTab] = useState(0);
  const tabs = ['All', 'Admin', 'Protection'];
  const rows = [
    { sev: 'info', cat: 'admin',      text: 'Granted access to @new_mod',           time: '14:02' },
    { sev: 'warn', cat: 'protection', text: 'Phishing link removed in #general',     time: '14:04' },
    { sev: 'info', cat: 'raid',       text: 'Raid #0042 created by @nervyesi',       time: '14:08' },
    { sev: 'warn', cat: 'engage',     text: 'Flagged: @user_92ab on submission #07', time: '14:11' },
    { sev: 'info', cat: 'settings',   text: 'Brand color updated',                   time: '14:15' },
    { sev: 'info', cat: 'forms',      text: 'Application #014 approved',             time: '14:19' },
  ];
  const sevTone = {
    info: { fg: '#a1a1aa', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)' },
    warn: { fg: '#f1d586', bg: 'rgba(241,213,134,0.07)', border: 'rgba(241,213,134,0.28)' },
  };

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Unified activity log" />

      <div style={{
        display: 'flex', gap: 4,
        background: 'rgba(255,255,255,0.04)',
        padding: 3, borderRadius: 6,
        marginBottom: 14,
        width: 'fit-content',
      }}>
        {tabs.map((l, i) => (
          <button
            key={l}
            onClick={() => setTab(i)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: 'none',
              background: tab === i ? 'rgba(200,168,78,0.18)' : 'transparent',
              color: tab === i ? 'var(--av-gold)' : 'rgba(228,228,231,0.55)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Sora, sans-serif',
              transition: 'all 0.15s',
            }}
          >{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => {
          const tone = sevTone[r.sev];
          return (
            <motion.div
              key={i}
              initial={{ x: -14, opacity: 0 }}
              animate={inView ? { x: 0, opacity: 1 } : { x: -14, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.14 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
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
                fontFamily: monoFont,
                minWidth: 36, textAlign: 'center',
              }}>{r.sev.toUpperCase()}</span>
              <span style={{
                fontSize: 10, color: 'rgba(228,228,231,0.5)',
                fontFamily: monoFont, minWidth: 60,
              }}>{r.cat}</span>
              <span style={{
                fontSize: 12, color: 'var(--av-text)', flex: 1, minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{r.text}</span>
              <span style={{
                fontSize: 10, color: 'rgba(228,228,231,0.35)',
                fontFamily: monoFont,
              }}>{r.time}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function FlywheelMockup() {
  const [ref, inView] = useInViewOnce(0.25);
  // Raid task chips light up in sequence.
  const [tasks, setTasks] = useState({ like: false, comment: false, retweet: false });
  useEffect(() => {
    if (!inView) return;
    const a = setTimeout(() => setTasks((s) => ({ ...s, like: true })), 500);
    const b = setTimeout(() => setTasks((s) => ({ ...s, comment: true })), 1000);
    const c = setTimeout(() => setTasks((s) => ({ ...s, retweet: true })), 1500);
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); };
  }, [inView]);

  const raidTasks = [
    { key: 'like', icon: '❤️', label: 'Like' },
    { key: 'comment', icon: '💬', label: 'Reply' },
    { key: 'retweet', icon: '🔁', label: 'Repost' },
  ];

  const submissions = [
    { who: 'nervyesi', pts: 22 },
    { who: 'degenmsa', pts: 18 },
    { who: 'web3kid', pts: 15 },
  ];

  // Shared leaderboard fed by both sides.
  const board = [
    { who: 'degenmsa', pts: 1840, tag: 'RAID + ENGAGE' },
    { who: 'nervyesi', pts: 1610, tag: 'RAID + ENGAGE' },
    { who: 'web3kid', pts: 1230, tag: 'ENGAGE' },
  ];

  const paneLabel = {
    fontSize: 10, fontWeight: 800, letterSpacing: '0.16em',
    textTransform: 'uppercase', color: 'var(--av-gold)', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 6,
  };

  return (
    <div ref={ref} style={{ ...mockupCardStyle, maxWidth: 580 }}>
      <BotHeader subtitle="X Engagement Flywheel • Live" accent="var(--av-gold)" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        {/* RAID pane */}
        <div style={{
          flex: '1 1 220px', minWidth: 0,
          background: '#13141a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '12px 13px',
        }}>
          <div style={paneLabel}><span>⚔️</span> Raid</div>
          <div style={{ fontSize: 11, color: 'rgba(228,228,231,0.7)', lineHeight: 1.45, marginBottom: 10 }}>
            A creator posts. The community amplifies, verified live.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {raidTasks.map((t) => {
              const on = tasks[t.key];
              return (
                <div key={t.key} style={{
                  flex: 1, padding: '7px 4px', borderRadius: 6, textAlign: 'center',
                  fontSize: 10, fontWeight: 600,
                  background: on ? 'rgba(59,165,92,0.16)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${on ? 'rgba(59,165,92,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: on ? '#7adc9a' : 'rgba(228,228,231,0.5)',
                  transition: 'all 0.4s ease',
                }}>
                  <div style={{ fontSize: 13 }}>{t.icon}</div>
                  {t.label}{on ? ' ✓' : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* ENGAGE pane */}
        <div style={{
          flex: '1 1 220px', minWidth: 0,
          background: '#13141a', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8, padding: '12px 13px',
        }}>
          <div style={paneLabel}><span>🔁</span> Engage</div>
          <div style={{ fontSize: 11, color: 'rgba(228,228,231,0.7)', lineHeight: 1.45, marginBottom: 10 }}>
            Members engage each other, earn points, post their own.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {submissions.map((s, i) => (
              <motion.div
                key={s.who}
                initial={{ x: 14, opacity: 0 }}
                animate={inView ? { x: 0, opacity: 1 } : { x: 14, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.35 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 8px', borderRadius: 5,
                  background: 'rgba(255,255,255,0.035)',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{s.who}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--av-gold)', fontFamily: monoFont }}>+{s.pts}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Unified leaderboard */}
      <div style={{
        background: 'rgba(200,168,78,0.05)',
        border: '1px solid rgba(200,168,78,0.2)',
        borderRadius: 8, padding: '12px 14px',
      }}>
        <div style={{ ...labelStyle, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>🏆</span> One shared leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {board.map((b, i) => (
            <div key={b.who} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                background: i === 0 ? 'var(--av-gold)' : 'rgba(200,168,78,0.18)',
                color: i === 0 ? '#0a0a0a' : 'var(--av-gold)',
              }}>{i + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{b.who}</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(228,228,231,0.4)', fontFamily: monoFont }}>{b.tag}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--av-gold)', fontFamily: monoFont, minWidth: 48, textAlign: 'right' }}>
                <Counter target={b.pts} inView={inView} duration={1600} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GiveawayMockup() {
  const [ref, inView] = useInViewOnce(0.3);
  const [stage, setStage] = useState(0); // 0 roles, 1 math, 2 entrants, 3 winner
  useEffect(() => {
    if (!inView) return;
    const t = [
      setTimeout(() => setStage(1), 1300),
      setTimeout(() => setStage(2), 2300),
      setTimeout(() => setStage(3), 3500),
    ];
    return () => t.forEach(clearTimeout);
  }, [inView]);

  const roles = [
    { name: 'Verified', kind: 'BASE', val: '1x', tone: 'rgba(228,228,231,0.6)' },
    { name: 'Degen', kind: 'BASE', val: '5x', tone: 'var(--av-gold)' },
    { name: 'Booster', kind: 'STACK', val: '+2', tone: '#c9a4ff' },
    { name: 'Leadership', kind: 'STACK', val: '+3', tone: '#7adc9a' },
  ];
  const entrants = [
    { who: 'web3kid', tix: 10, hot: true },
    { who: 'floorsweep', tix: 6 },
    { who: 'gmfren', tix: 3 },
    { who: 'lurker', tix: 1 },
  ];
  const total = entrants.reduce((a, b) => a + b.tix, 0);

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Giveaway • Nitro x3" accent="var(--av-gold)" />

      {/* Entrant roles */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>@web3kid entering with</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {roles.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ x: -14, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -14, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.22 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 6,
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.tone, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, flex: 1 }}>{r.name}</span>
            <span style={{
              fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em',
              color: 'rgba(228,228,231,0.4)', fontFamily: monoFont,
            }}>{r.kind}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.tone, fontFamily: monoFont, minWidth: 26, textAlign: 'right' }}>{r.val}</span>
          </motion.div>
        ))}
      </div>

      {/* Ticket math */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '10px 12px', borderRadius: 8, marginBottom: 14,
        background: 'rgba(200,168,78,0.06)',
        border: '1px solid rgba(200,168,78,0.22)',
        fontFamily: monoFont, fontSize: 15, fontWeight: 700,
        color: 'var(--av-text)',
        opacity: stage >= 1 ? 1 : 0.35,
        transition: 'opacity 0.5s',
      }}>
        <span>5 + 2 + 3 =</span>
        <span style={{ color: 'var(--av-gold)', fontSize: 19 }}>
          {stage >= 1 ? <Counter target={10} inView duration={700} /> : 0}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(228,228,231,0.6)', fontWeight: 500 }}>tickets</span>
      </div>

      {/* Weighted draw bar */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>Weighted draw • {total} tickets</div>
      <div style={{ display: 'flex', gap: 3, height: 30, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
        {entrants.map((e) => {
          const pct = (e.tix / total) * 100;
          const won = stage >= 3 && e.hot;
          return (
            <div
              key={e.who}
              title={`@${e.who} · ${e.tix} tickets`}
              style={{
                width: stage >= 2 ? `${pct}%` : '0%',
                background: won
                  ? 'linear-gradient(180deg, #f1d586, var(--av-gold))'
                  : e.hot ? 'rgba(200,168,78,0.45)' : 'rgba(255,255,255,0.1)',
                border: won ? '1px solid #fff5cf' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                transition: 'width 0.8s cubic-bezier(0.22,0.6,0.2,1), background 0.4s, box-shadow 0.4s',
                boxShadow: won ? '0 0 18px rgba(241,213,134,0.7)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: won ? '#0a0a0a' : 'transparent',
                whiteSpace: 'nowrap', overflow: 'hidden',
              }}
            >{e.tix}</div>
          );
        })}
      </div>

      {/* Winner reveal */}
      <div style={{
        textAlign: 'center', padding: '9px 12px', borderRadius: 8,
        background: stage >= 3 ? 'rgba(59,165,92,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${stage >= 3 ? 'rgba(59,165,92,0.4)' : 'rgba(255,255,255,0.06)'}`,
        fontSize: 13, fontWeight: 700,
        color: stage >= 3 ? '#a8e7bc' : 'rgba(228,228,231,0.4)',
        transition: 'all 0.5s',
      }}>
        {stage >= 3 ? '🎉 Winner drawn: @web3kid' : 'Drawing winner…'}
      </div>
    </div>
  );
}

export function WalletMockup() {
  const [ref, inView] = useInViewOnce(0.3);
  const chains = ['EVM', 'Solana', 'Bitcoin', 'Cardano', 'Cosmos', 'Tron', 'Aptos', 'Sui'];
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setSel((s) => (s + 1) % chains.length), 1300);
    const c = setTimeout(() => setCopied(true), 2800);
    return () => { clearInterval(id); clearTimeout(c); };
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = [
    { who: 'web3kid', addr: '0x7a3f…91c4' },
    { who: 'degenmsa', addr: '0xb20a…7e02' },
    { who: 'floorsweep', addr: '0x4c91…aa38' },
    { who: 'gmfren', addr: '0x10de…55b1' },
  ];

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Wallet Collection • Genesis Mint" accent="var(--av-gold)" />

      {/* Chain picker */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>Chain</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {chains.map((c, i) => {
          const active = i === sel;
          return (
            <span key={c} style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
              background: active ? 'rgba(200,168,78,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? 'var(--av-gold)' : 'rgba(255,255,255,0.08)'}`,
              color: active ? 'var(--av-gold)' : 'rgba(228,228,231,0.6)',
              transition: 'all 0.3s',
            }}>{c}</span>
          );
        })}
      </div>

      {/* Submissions table */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>Submissions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {rows.map((r, i) => (
          <motion.div
            key={r.who}
            initial={{ y: 8, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 8, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.3 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 11px', borderRadius: 6,
              background: '#13141a', border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{r.who}</span>
            <span style={{ fontSize: 11.5, color: 'var(--av-gold)', fontFamily: monoFont }}>{r.addr}</span>
          </motion.div>
        ))}
      </div>

      {/* Copy to sheet */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '10px 12px', borderRadius: 8,
        background: copied ? 'rgba(59,165,92,0.1)' : 'rgba(200,168,78,0.06)',
        border: `1px solid ${copied ? 'rgba(59,165,92,0.4)' : 'rgba(200,168,78,0.25)'}`,
        transition: 'all 0.4s',
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: copied ? '#a8e7bc' : 'var(--av-gold)' }}>
          {copied ? '✓ 412 wallets copied to clipboard' : '📋 Copy all wallets'}
        </span>
        <span style={{
          fontSize: 16, opacity: copied ? 1 : 0.4,
          transition: 'opacity 0.4s',
        }}>📊</span>
      </div>
    </div>
  );
}

export function RadarMockup() {
  const [ref, inView] = useInViewOnce(0.3);
  const [alert, setAlert] = useState(false);
  const [digest, setDigest] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const a = setTimeout(() => setAlert(true), 1500);
    const d = setTimeout(() => setDigest(true), 2700);
    return () => { clearTimeout(a); clearTimeout(d); };
  }, [inView]);

  const feeds = [
    { k: 'Crypto', sym: 'BTC', val: '$67,420', chg: '+3.2%', up: true },
    { k: 'NFT', sym: 'Floor', val: 'Ξ 1.84', chg: '+0.6%', up: true },
    { k: 'Meme', sym: 'DOGE', val: '$0.162', chg: '-1.1%', up: false },
    { k: 'Forex', sym: 'EUR/USD', val: '1.0892', chg: '+0.1%', up: true },
    { k: 'Commodities', sym: 'Gold', val: '$2,412', chg: '+0.4%', up: true },
  ];

  return (
    <div ref={ref} style={mockupCardStyle}>
      <BotHeader subtitle="Radar • Market Intelligence" accent="var(--av-gold)" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {feeds.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ x: -12, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -12, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.12 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 11px', borderRadius: 6,
              background: '#13141a', border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', color: 'rgba(228,228,231,0.45)', minWidth: 78, fontFamily: monoFont }}>{f.k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{f.sym}</span>
            <span style={{ fontSize: 12, color: 'var(--av-text)', fontFamily: monoFont }}>{f.val}</span>
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: monoFont, minWidth: 46, textAlign: 'right',
              color: f.up ? '#7adc9a' : '#ff8c66',
            }}>{f.up ? '↗' : '↘'} {f.chg}</span>
          </motion.div>
        ))}
      </div>

      {/* Alert pop */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '9px 12px', borderRadius: 8, marginBottom: 8,
        background: 'rgba(241,213,134,0.1)',
        border: '1px solid rgba(241,213,134,0.4)',
        transform: alert ? 'scale(1)' : 'scale(0.9)',
        opacity: alert ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.22,1.4,0.4,1)',
      }}>
        <span style={{ fontSize: 15 }}>⚡</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f1d586' }}>BTC up 3.2% in the last hour</span>
      </div>

      {/* Digest rolled to channel */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '9px 12px', borderRadius: 8,
        background: 'rgba(88,101,242,0.1)',
        border: '1px solid rgba(88,101,242,0.35)',
        opacity: digest ? 1 : 0,
        transform: digest ? 'translateY(0)' : 'translateY(6px)',
        transition: 'all 0.45s ease',
      }}>
        <span style={{ fontSize: 14 }}>📥</span>
        <span style={{ fontSize: 12, color: 'rgba(228,228,231,0.85)' }}>
          Daily digest posted to <span style={{ color: '#aab4ff', fontWeight: 600 }}>#market-radar</span>
        </span>
      </div>
    </div>
  );
}

export function ProtectionGuardMockup() {
  const [ref, inView] = useInViewOnce(0.3);
  const [phase, setPhase] = useState('raid'); // 'raid' then 'clear'
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const timers = [];
    [0, 1, 2].forEach((i) => timers.push(setTimeout(() => setShown(i + 1), 600 + i * 550)));
    timers.push(setTimeout(() => setPhase('clear'), 3000));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  const intercepts = [
    { who: 'nitro-gift-x', reason: 'Phishing link blocked' },
    { who: 'user-2h-old', reason: 'Account age 2h rejected' },
    { who: 'bulk-join-07', reason: 'Verified human required' },
  ];

  const raidMode = phase === 'raid';

  return (
    <div ref={ref} style={{ ...mockupCardStyle, overflow: 'hidden' }}>
      <BotHeader subtitle="Protection • Live" accent={raidMode ? '#ff8c42' : '#3ba55c'} />

      {/* Lockdown bar */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 13px', borderRadius: 7, marginBottom: 14,
        overflow: 'hidden',
        background: raidMode ? 'rgba(255,140,66,0.12)' : 'rgba(59,165,92,0.12)',
        border: `1px solid ${raidMode ? 'rgba(255,140,66,0.5)' : 'rgba(59,165,92,0.45)'}`,
        transition: 'all 0.5s',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: raidMode ? '#ff8c42' : '#7adc9a',
          boxShadow: `0 0 10px ${raidMode ? '#ff8c42' : '#7adc9a'}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 12, fontWeight: 800, letterSpacing: '0.1em',
          color: raidMode ? '#ffb37d' : '#a8e7bc',
        }}>
          {raidMode ? 'RAID MODE ACTIVE' : 'ALL CLEAR'}
        </span>
        {raidMode && (
          <span aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(115deg, transparent 40%, rgba(255,140,66,0.25) 50%, transparent 60%)',
            animation: 'av-shine 1.8s linear infinite',
          }} />
        )}
      </div>

      {/* Intercepted join attempts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14, minHeight: 132 }}>
        {intercepts.map((it, i) => (
          <motion.div
            key={it.who}
            initial={{ x: -18, opacity: 0 }}
            animate={shown > i ? { x: 0, opacity: 1 } : { x: -18, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 11px', borderRadius: 6,
              background: 'rgba(255,140,66,0.06)',
              border: '1px solid rgba(255,140,66,0.28)',
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,140,66,0.18)', color: '#ff8c42', fontSize: 11, fontWeight: 800,
            }}>✕</span>
            <span style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{it.who}</span>
            <span style={{ fontSize: 10.5, color: '#ffb37d', fontFamily: monoFont, whiteSpace: 'nowrap' }}>{it.reason}</span>
          </motion.div>
        ))}
      </div>

      {/* Threat counter */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
        marginBottom: phase === 'clear' ? 12 : 0,
      }}>
        <span style={labelStyle}>Actions today</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--av-gold)' }}>
          <Counter target={47} inView={inView} duration={1400} />
        </span>
      </div>

      {/* Calm state */}
      {phase === 'clear' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 7,
          background: 'rgba(59,165,92,0.08)',
          border: '1px solid rgba(59,165,92,0.3)',
          animation: 'av-fade-in 0.5s ease both',
        }}>
          <span style={{ fontSize: 15 }}>🛡️</span>
          <span style={{ fontSize: 12, color: '#a8e7bc', fontWeight: 600 }}>
            Server calm. Protected by AVbot.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Aggregated panel metadata ───────────────────────────────────────────────

export const MODULE_PANELS = [
  { id: 'analytics',  icon: '📊', label: 'Analytics',      headline: 'See your community breathe',          copy: 'Real time dashboards track member growth, engagement, and module performance. Decisions become obvious when the data is in front of you.', Mockup: AnalyticsMockup },
  { id: 'verify',     icon: '✅', label: 'Verification',   headline: 'Bots stop at the door',                copy: 'Token gated, role based access. Every member proves they belong through challenges that fit your brand, not a generic captcha.', Mockup: VerifyMockup },
  { id: 'roleselect', icon: '🎭', label: 'Role Selection', headline: 'Members tag themselves',               copy: 'Beautiful pickers with reaction or button panels. Members claim their roles in a click. Your mods get their afternoons back.', Mockup: RoleSelectMockup },
  { id: 'forms',      icon: '📝', label: 'Forms',           headline: 'Onboard the right people',             copy: 'Visual form builder with approval workflows and auto roles. Every application reviewed, every applicant tracked, every decision logged.', Mockup: FormsMockup },
  { id: 'tickets',    icon: '🎫', label: 'Tickets',         headline: 'Support that scales',                  copy: 'Categorized threads, status pills, and a full audit trail. Your team handles ten tickets like one without losing context.', Mockup: TicketsMockup },
  { id: 'raid',       icon: '⚔️', label: 'Raid',            headline: 'Amplify your X reach in minutes',     copy: 'Reward members for engaging with your tweets. Live X verification, anti cheat detection, and a live leaderboard turn organic engagement into a community habit.', Mockup: RaidMockup },
  { id: 'engage',     icon: '🔁', label: 'Engage',          headline: 'A perpetual engine for your community', copy: 'Members earn points by engaging with each other tweets, then spend those points to submit their own. The flywheel runs itself, no admin work required.', Mockup: EngageMockup },
  { id: 'protection', icon: '🛡️', label: 'Protection',     headline: 'Sleep through the night',              copy: 'Anti spam, anti raid, and anti scam guardrails work silently. Phishing blocklist, account age gates, and lockdown response all logged for the morning.', Mockup: ProtectionMockup },
  { id: 'logs',       icon: '📋', label: 'Logs',            headline: 'Every action, traceable',              copy: 'One unified activity log across every module. Admin actions, flagged users, settings changes, and protection events. Full transparency.', Mockup: LogsMockup },
];
