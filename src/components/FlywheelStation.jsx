import React from 'react';
import { motion } from 'framer-motion';
import { FlywheelMockup } from './ModuleMockups';

/**
 * FlywheelStation.
 *
 * The first cinematic deep-dive: the X Engagement Flywheel, merging the Raid
 * and Engage systems into one narrative. Copy on one side, the dual-pane
 * mockup on the other, both revealing on scroll. Transparent so the page-wide
 * ambient composites beneath.
 *
 * This is Phase 2 checkpoint 1. The standalone Raid and Engage stations still
 * live in ScrollJourney for now; they get folded away in the next checkpoint
 * when the full showcase is restructured.
 */
export default function FlywheelStation() {
  return (
    <section
      id="flywheel"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 12vh, 140px) 24px',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1140px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(32px, 5vw, 72px)',
        }}
      >
        {/* Copy */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ flex: '1 1 360px', minWidth: 0, maxWidth: '520px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 16,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--av-gold)',
            textShadow: '0 0 24px rgba(0,0,0,0.85)',
          }}>
            <span style={{ fontSize: 18 }}>⚔️</span> X Engagement
          </div>

          <h2 style={{
            margin: '0 0 18px',
            fontSize: 'clamp(2rem, 4.4vw, 3.3rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.04,
            color: 'var(--av-text)',
            textShadow: '0 2px 22px rgba(0,0,0,0.7)',
          }}>
            Two angles.{' '}
            <span style={{
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out infinite',
            }}>
              One engine.
            </span>
          </h2>

          <p style={{
            margin: '0 0 22px',
            fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
            lineHeight: 1.65,
            color: 'rgba(228,228,231,0.82)',
            textShadow: '0 1px 12px rgba(0,0,0,0.6)',
          }}>
            Whether you are amplifying a creator or running a peer flywheel, AVbot
            turns Twitter engagement into a community habit. Raids reward members
            for boosting your posts with live verification and anti cheat. Engage
            lets members earn points on each other, then spend them to post their
            own. Both feed one shared leaderboard.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { icon: '✅', text: 'Live X verification' },
              { icon: '🛡️', text: 'Anti cheat detection' },
              { icon: '🏆', text: 'Unified leaderboard' },
            ].map((f) => (
              <span key={f.text} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 13px', borderRadius: 999,
                background: 'rgba(200,168,78,0.08)',
                border: '1px solid rgba(200,168,78,0.25)',
                color: 'var(--av-gold)',
                fontSize: 12.5, fontWeight: 600,
              }}>
                <span>{f.icon}</span>{f.text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', justifyContent: 'center' }}
        >
          <FlywheelMockup />
        </motion.div>
      </div>
    </section>
  );
}
