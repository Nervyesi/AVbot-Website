import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChapterBreak from './ChapterBreak';
import {
  FlywheelMockup,
  GiveawayMockup,
  ProtectionGuardMockup,
  RadarMockup,
  AnalyticsMockup,
  VerifyMockup,
} from './ModuleMockups';

/**
 * ScrollJourney.
 *
 * The showcase. Six cinematic deep-dive stations, each a near-full-viewport
 * section that alternates the mockup left and right of its copy, separated by
 * ChapterBreak rhythm dividers. Below them, eight condensed module cards in a
 * grid for the remaining toolkit. Every section is transparent so the
 * page-wide ambient composites continuously beneath.
 *
 * The old standalone Raid and Engage stations were folded into the single
 * X Engagement Flywheel deep-dive (station 01).
 */

// ── Deep-dive station data ───────────────────────────────────────────────────

const STATIONS = [
  {
    id: 'flywheel',
    kicker: 'X Engagement',
    white: 'Two angles',
    gold: 'One engine',
    copy:
      'Whether you are amplifying a creator or running a peer flywheel, AVbot turns Twitter engagement into a community habit. Raids reward members for boosting your posts with live verification and anti cheat. Engage hands members a daily set of tweets to like, then earns them the right to post their own.',
    features: [
      { icon: '✅', text: 'Live X verification' },
      { icon: '🛡️', text: 'Anti cheat detection' },
      { icon: '🔁', text: 'Daily engage sets' },
    ],
    Mockup: FlywheelMockup,
  },
  {
    id: 'giveaway',
    kicker: 'Giveaways',
    white: 'Rewards that respect',
    gold: 'your real members',
    copy:
      'Role based ticket multipliers make every draw fair and Web3 native. Base roles set the starting weight, stacking roles add on top, and the draw is weighted random so your most invested members have better odds without locking anyone out.',
    features: [
      { icon: '🎟️', text: 'Role based multipliers' },
      { icon: '⚖️', text: 'Weighted fair draw' },
      { icon: '🔒', text: 'Verified entries only' },
    ],
    Mockup: GiveawayMockup,
  },
  {
    id: 'protection',
    kicker: 'Protection',
    white: 'Sleep through the night',
    gold: 'we stand guard',
    copy:
      'Anti raid, anti spam, and anti scam guardrails work silently while you rest. Phishing links are stripped, fresh accounts are gated, and a sudden flood of joins trips an automatic lockdown. Every action lands in the log for the morning.',
    features: [
      { icon: '🚫', text: 'Phishing blocklist' },
      { icon: '⏳', text: 'Account age gates' },
      { icon: '🔒', text: 'Auto lockdown' },
    ],
    Mockup: ProtectionGuardMockup,
  },
  {
    id: 'radar',
    kicker: 'Web3 Intelligence',
    white: 'The market never sleeps',
    gold: 'neither does Radar',
    copy:
      'Five live feeds in one place. Crypto prices, NFT floors, trending memes, forex pairs, and commodities, all watched continuously. Smart alerts fire on the moves that matter and a daily digest rolls straight into your channels.',
    features: [
      { icon: '📈', text: 'Crypto and forex' },
      { icon: '🖼️', text: 'NFT floor tracking' },
      { icon: '🔔', text: 'Smart alerts' },
    ],
    Mockup: RadarMockup,
  },
  {
    id: 'analytics',
    kicker: 'Analytics',
    white: "Your community's",
    gold: 'heartbeat, live',
    copy:
      'Real time dashboards track member growth, engagement, raids, and giveaways. Sparklines draw themselves, counters tick, and a now live pulse shows the room breathing. Decisions get obvious when the data is in front of you.',
    features: [
      { icon: '⚡', text: 'Real time counters' },
      { icon: '📉', text: 'Growth sparklines' },
      { icon: '🟢', text: 'Now live pulse' },
    ],
    Mockup: AnalyticsMockup,
  },
  {
    id: 'verify',
    kicker: 'Verification',
    white: 'Bots stay out',
    gold: 'humans get in',
    copy:
      'Captcha challenges and human verification keep bot accounts out of your server. Real members solve a quick check and get their role assigned automatically. Generic raid bots cannot pass through.',
    features: [
      { icon: '🧩', text: 'Captcha challenge' },
      { icon: '👤', text: 'Human check' },
      { icon: '🎭', text: 'Auto roles' },
    ],
    Mockup: VerifyMockup,
  },
];

// ── Condensed module cards ───────────────────────────────────────────────────

const CONDENSED = [
  { icon: '🎭', name: 'Role Selection', desc: 'Self serve roles in a single click.' },
  { icon: '📝', name: 'Forms', desc: 'Application flows with approvals and auto roles.' },
  { icon: '🎫', name: 'Tickets', desc: 'Threaded support that scales with your team.' },
  { icon: '🏅', name: 'Levels', desc: 'Reward activity with XP, ranks, and rewards.' },
  { icon: '💬', name: 'Embed Messages', desc: 'Branded announcements and interactive panels.' },
  { icon: '🛡️', name: 'Protection', desc: 'Anti spam, anti raid, and anti scam guardrails.' },
  { icon: '📋', name: 'Logs', desc: 'Every action across every module, traceable.' },
  { icon: '⚙️', name: 'Server Settings', desc: 'One dashboard for the whole bot.' },
];

// ── Components ────────────────────────────────────────────────────────────────

function StationCopy({ station, onRight }) {
  return (
    <motion.div
      initial={{ x: onRight ? -40 : 40, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
      style={{ flex: '1 1 360px', minWidth: 0, maxWidth: '520px' }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16,
        fontSize: 12, fontWeight: 700, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--av-gold)',
        textShadow: '0 0 24px rgba(0,0,0,0.85)',
      }}>
        {station.kicker}
      </div>

      <h2 style={{
        margin: '0 0 18px',
        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
        fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.06,
        color: 'var(--av-text)', textShadow: '0 2px 22px rgba(0,0,0,0.7)',
      }}>
        <span style={{ display: 'block' }}>{station.white}</span>
        <span style={{
          display: 'block',
          background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
          backgroundSize: '250% 100%',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent', WebkitTextFillColor: 'transparent',
          animation: 'av-shine 7s ease-in-out infinite',
        }}>
          {station.gold}
        </span>
      </h2>

      <p style={{
        margin: '0 0 22px',
        fontSize: 'clamp(1rem, 1.6vw, 1.12rem)', lineHeight: 1.65,
        color: 'rgba(228,228,231,0.82)', textShadow: '0 1px 12px rgba(0,0,0,0.6)',
      }}>
        {station.copy}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {station.features.map((f) => (
          <span key={f.text} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '7px 13px', borderRadius: 999,
            background: 'rgba(200,168,78,0.08)',
            border: '1px solid rgba(200,168,78,0.25)',
            color: 'var(--av-gold)', fontSize: 12.5, fontWeight: 600,
          }}>
            <span>{f.icon}</span>{f.text}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function DeepDiveStation({ station, index }) {
  const onRight = index % 2 === 0; // mockup on the right for even stations
  const { Mockup } = station;
  const copy = <StationCopy station={station} onRight={onRight} />;
  const mockup = (
    <motion.div
      initial={{ x: onRight ? 40 : -40, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 0.6, 0.2, 1] }}
      style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', justifyContent: 'center' }}
    >
      <Mockup />
    </motion.div>
  );

  return (
    <section
      id={station.id}
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 6vh, 80px) 24px',
        backgroundColor: 'transparent',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '1140px',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(32px, 5vw, 72px)',
      }}>
        {onRight ? <>{copy}{mockup}</> : <>{mockup}{copy}</>}
      </div>
    </section>
  );
}

function CondensedCard({ item, index }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: [0.22, 0.6, 0.2, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '20px 18px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, rgba(31,32,36,0.9) 0%, rgba(26,27,31,0.9) 100%)',
        border: `1px solid ${hover ? 'rgba(200,168,78,0.5)' : 'rgba(255,255,255,0.07)'}`,
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover
          ? '0 24px 60px -24px rgba(0,0,0,0.7), 0 0 24px -8px rgba(200,168,78,0.4)'
          : '0 20px 50px -28px rgba(0,0,0,0.6)',
        transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
      <div style={{
        fontSize: 15, fontWeight: 700, marginBottom: 5,
        color: hover ? 'var(--av-gold)' : 'var(--av-text)',
        transition: 'color 0.25s',
      }}>{item.name}</div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(228,228,231,0.6)' }}>
        {item.desc}
      </div>
    </motion.div>
  );
}

function CondensedGrid() {
  return (
    <section style={{
      position: 'relative',
      padding: 'clamp(64px, 10vh, 120px) 24px',
      backgroundColor: 'transparent',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 56px)' }}
        >
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--av-gold)', marginBottom: 10,
          }}>
            The rest of the toolkit
          </div>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.7rem, 3.8vw, 2.7rem)',
            fontWeight: 800, letterSpacing: '-0.025em',
            color: 'var(--av-text)', lineHeight: 1.1,
            textShadow: '0 2px 22px rgba(0,0,0,0.75)',
          }}>
            Eight more modules, ready to go
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}>
          {CONDENSED.map((item, i) => (
            <CondensedCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Showcase ──────────────────────────────────────────────────────────────────

export default function ScrollJourney() {
  return (
    <div id="showcase" style={{ position: 'relative', backgroundColor: 'transparent' }}>
      <section
        style={{
          position: 'relative',
          padding: 'clamp(56px, 9vh, 110px) 24px clamp(8px, 2vh, 24px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', backgroundColor: 'transparent',
        }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ maxWidth: '780px', width: '100%' }}
        >
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
            fontWeight: 800, letterSpacing: '-0.025em',
            color: 'var(--av-text)', lineHeight: 1.08,
            textShadow: '0 2px 22px rgba(0,0,0,0.75)',
          }}>
            Fourteen modules. <span style={{ color: 'var(--av-gold)', whiteSpace: 'nowrap' }}>One engine</span>
          </h2>
          <p style={{
            marginTop: '16px', marginBottom: 0,
            fontSize: '1.08rem', color: 'rgba(228,228,231,0.78)', lineHeight: 1.6,
            maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto',
            textWrap: 'balance', textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}>
            {'Six systems worth a closer look. Scroll, and watch each one light up.'}
          </p>
        </motion.div>
      </section>

      {STATIONS.map((station, i) => (
        <React.Fragment key={station.id}>
          <ChapterBreak index={i + 1} label={station.kicker} />
          <DeepDiveStation station={station} index={i} />
        </React.Fragment>
      ))}

      <CondensedGrid />
    </div>
  );
}
