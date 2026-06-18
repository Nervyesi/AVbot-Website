import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ModulesOverview.
 *
 * A quick-scan grid that names every module grouped by purpose, sitting
 * between the hero and the ScrollJourney deep-dives. Four category columns on
 * desktop, two on tablet, one on mobile (auto-fit). Clicking any module smooth
 * scrolls to the showcase section below. Visual language matches the existing
 * module mockups: dark gradient panel, gold left border, Sora, framer-motion
 * reveal on scroll.
 */

const GOLD = 'var(--av-gold)';

// Categories and their modules. Mirrors the product's 14 modules grouped by
// what they do. Radar is a single module with multiple feeds (shown as a
// sub-line). Levels and Server Settings are listed where the owner placed them.
const CATEGORIES = [
  {
    label: 'Community',
    modules: [
      { icon: '✅', name: 'Verification' },
      { icon: '🎭', name: 'Role Selection' },
      { icon: '📝', name: 'Forms' },
      { icon: '🎫', name: 'Tickets' },
      { icon: '🏅', name: 'Levels' },
    ],
  },
  {
    label: 'Engagement',
    modules: [
      { icon: '🔁', name: 'Engage-for-Engage' },
      { icon: '⚔️', name: 'Raid' },
      { icon: '🎁', name: 'Giveaway' },
      { icon: '💼', name: 'Wallet Collection' },
    ],
  },
  {
    label: 'Safety & Ops',
    modules: [
      { icon: '🛡️', name: 'Protection' },
      { icon: '📋', name: 'Logs' },
      { icon: '📊', name: 'Analytics' },
      { icon: '💬', name: 'Embed Messages' },
      { icon: '⚙️', name: 'Server Settings' },
    ],
  },
  {
    label: 'Web3 Intelligence',
    modules: [
      { icon: '📡', name: 'Radar', sub: 'Crypto · NFT · Meme · Forex · Commodities' },
    ],
  },
];

function ModuleRow({ icon, name, sub }) {
  const [hover, setHover] = useState(false);
  const goToShowcase = () => {
    const el = document.getElementById('showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div
      onClick={goToShowcase}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        borderLeft: `2px solid ${hover ? GOLD : 'transparent'}`,
        background: hover ? 'rgba(200,168,78,0.08)' : 'transparent',
        transform: hover ? 'translateX(3px)' : 'translateX(0)',
        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
      }}
    >
      <span style={{ fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: hover ? GOLD : 'rgba(228,228,231,0.9)',
          transition: 'color 0.2s',
        }}>
          {name}
        </span>
        {sub && (
          <span style={{
            fontSize: '11px',
            color: 'rgba(228,228,231,0.45)',
            marginTop: '2px',
            lineHeight: 1.5,
          }}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

function CategoryCard({ category, index }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 0.6, 0.2, 1] }}
      style={{
        background: 'linear-gradient(180deg, #1f2024 0%, #1a1b1f 100%)',
        borderLeft: `3px solid ${GOLD}`,
        borderRadius: '12px',
        padding: '20px 18px',
        boxShadow:
          '0 30px 70px -28px rgba(0,0,0,0.7), ' +
          '0 0 0 1px rgba(255,255,255,0.05), ' +
          'inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: GOLD,
        marginBottom: '12px',
        paddingLeft: '12px',
      }}>
        {category.label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {category.modules.map((m) => (
          <ModuleRow key={m.name} icon={m.icon} name={m.name} sub={m.sub} />
        ))}
      </div>
    </motion.div>
  );
}

export default function ModulesOverview() {
  return (
    <section
      id="modules-overview"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 10vh, 120px) 24px clamp(20px, 4vh, 48px)',
        backgroundColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 56px)' }}
        >
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.85rem, 4.4vw, 3rem)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--av-text)',
            lineHeight: 1.1,
            textShadow: '0 2px 22px rgba(0,0,0,0.75)',
          }}>
            Everything your community{' '}
            <span style={{
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out infinite',
            }}>
              needs
            </span>.
          </h2>
          <p style={{
            marginTop: '16px',
            marginBottom: 0,
            fontSize: '1.05rem',
            color: 'rgba(228,228,231,0.78)',
            lineHeight: 1.6,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textWrap: 'balance',
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}>
            Fourteen modules, grouped by what they do. Tap any one to see it in action below.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}>
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.label} category={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
