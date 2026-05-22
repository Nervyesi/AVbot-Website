import React from 'react';
import { motion } from 'framer-motion';

/**
 * WhySection.
 *
 * The "one bot, or twelve" comparison. A two-column reflow on desktop,
 * stacked on mobile, contrasting the typical Discord-bot stack against
 * one AVbot. Subtle, tasteful. No premium wording.
 */

const STACK = [
  'Verification bot',
  'Role picker bot',
  'Forms bot',
  'Ticket bot',
  'Raid coordinator',
  'Engage bot',
  'Anti-spam bot',
  'Mod log bot',
  'Analytics bot',
];

export default function WhySection() {
  return (
    <section
      id="why"
      style={{
        position: 'relative',
        padding: 'clamp(80px, 12vw, 160px) 24px',
        backgroundColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ y: 26, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}
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
            One bot. <span style={{ color: 'var(--av-gold)' }}>Or twelve.</span>
          </h2>
          <p style={{
            marginTop: '16px',
            marginBottom: 0,
            fontSize: '1.05rem',
            color: 'rgba(228,228,231,0.78)',
            lineHeight: 1.6,
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}>
            Most Web3 communities run a Frankenstein stack of single-purpose bots that never quite talk to each other. AVbot replaces all of it.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* The stack */}
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              padding: '28px',
              borderRadius: '14px',
              backgroundColor: 'rgba(16,16,20,0.78)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(228,228,231,0.55)',
              marginBottom: '14px',
            }}>
              Without AVbot
            </div>
            <div style={{
              fontSize: 'clamp(1.1rem, 1.6vw, 1.25rem)',
              fontWeight: 700,
              color: 'var(--av-text)',
              marginBottom: '18px',
              lineHeight: 1.3,
            }}>
              Nine separate bots. Nine dashboards. Nine integrations to maintain.
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {STACK.map((s) => (
                <li
                  key={s}
                  style={{
                    fontSize: '13px',
                    color: 'rgba(228,228,231,0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '5px 0',
                  }}
                >
                  <span style={{
                    width: '14px', height: '14px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    flexShrink: 0,
                    display: 'inline-block',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-12deg)',
                      width: '8px', height: '1px',
                      background: 'rgba(255,255,255,0.4)',
                    }} />
                  </span>
                  <span style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(255,255,255,0.25)' }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* AVbot */}
          <motion.div
            initial={{ y: 36, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              padding: '28px',
              borderRadius: '14px',
              backgroundColor: 'rgba(20,16,8,0.78)',
              border: '1px solid rgba(200,168,78,0.45)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 60px -20px rgba(200,168,78,0.5), inset 0 0 0 1px rgba(200,168,78,0.08)',
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--av-gold)',
              marginBottom: '14px',
            }}>
              With AVbot
            </div>
            <div style={{
              fontSize: 'clamp(1.1rem, 1.6vw, 1.25rem)',
              fontWeight: 700,
              color: 'var(--av-text)',
              marginBottom: '18px',
              lineHeight: 1.3,
            }}>
              One bot. Nine modules. One dashboard. One bill that never grows.
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {['📊 Analytics', '✅ Verify', '🎭 Roles', '📝 Forms', '🎫 Tickets', '⚔️ Raid', '🔁 Engage', '🛡️ Protect', '📋 Logs'].map((m) => (
                <div
                  key={m}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(200,168,78,0.08)',
                    border: '1px solid rgba(200,168,78,0.22)',
                    color: 'var(--av-gold)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
