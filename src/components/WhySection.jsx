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
  'Anti spam bot',
  'Mod log bot',
  'Analytics bot',
  'Welcome bot',
  'Giveaway bot',
];

const COMPARISON_ROWS = [
  { feature: 'Web3 native',                       avbot: 'yes',  general: 'no',      web3bot: 'yes'     },
  { feature: 'Live X verification',               avbot: 'yes',  general: 'no',      web3bot: 'partial' },
  { feature: 'Engage to earn ecosystem',          avbot: 'yes',  general: 'no',      web3bot: 'partial' },
  { feature: 'Raids with anti cheat',             avbot: 'yes',  general: 'no',      web3bot: 'partial' },
  { feature: 'Verification and roles',            avbot: 'yes',  general: 'yes',     web3bot: 'yes'     },
  { feature: 'Forms and tickets',                 avbot: 'yes',  general: 'partial', web3bot: 'partial' },
  { feature: 'Protection, anti spam, anti raid',  avbot: 'yes',  general: 'yes',     web3bot: 'partial' },
  { feature: 'Unified analytics and logs',        avbot: 'yes',  general: 'partial', web3bot: 'no'      },
  { feature: 'Fully branded to your community',   avbot: 'yes',  general: 'no',      web3bot: 'no'      },
  { feature: 'All in one bot',                    avbot: 'yes',  general: 'no',      web3bot: 'no'      },
  { feature: 'Role based ticket multipliers in giveaways', avbot: 'yes', general: 'no', web3bot: 'no' },
  { feature: 'Multi chain wallet collection',     avbot: 'yes',  general: 'no',      web3bot: 'no'      },
  { feature: 'Cost',                              avbot: 'free', general: 'subs',    web3bot: 'subs'    },
];

function CellMark({ value }) {
  if (value === 'yes') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--av-gold)', fontSize: '13px', fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 8.5 L6.5 12 L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        Yes
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'rgba(228,228,231,0.55)', fontSize: '13px', fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 2 A 6 6 0 0 1 8 14 Z" fill="currentColor" />
        </svg>
        Partial
      </span>
    );
  }
  if (value === 'no') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'rgba(228,228,231,0.35)', fontSize: '13px', fontWeight: 500,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        No
      </span>
    );
  }
  if (value === 'free') {
    return (
      <span style={{ color: 'var(--av-gold)', fontSize: '13px', fontWeight: 700 }}>
        Free
      </span>
    );
  }
  if (value === 'subs') {
    return (
      <span style={{ color: 'rgba(228,228,231,0.55)', fontSize: '13px', fontWeight: 500 }}>
        Multiple subscriptions
      </span>
    );
  }
  return null;
}

function ComparisonTable() {
  return (
    <motion.div
      initial={{ y: 36, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.85, ease: [0.22, 0.6, 0.2, 1] }}
      className="av-cmp"
      style={{
        backgroundColor: 'rgba(14,14,18,0.78)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 30px 80px -40px rgba(0,0,0,0.6)',
      }}
    >
      <div className="av-cmp-header" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(160px, 1.7fr) 1fr 1fr 1fr',
        padding: '18px 22px',
        backgroundColor: 'rgba(20,20,24,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(228,228,231,0.55)',
      }}>
        <div>Feature</div>
        <div style={{
          color: 'var(--av-gold)',
          padding: '0 12px',
          background: 'rgba(200,168,78,0.05)',
          margin: '-18px 0',
          paddingTop: '18px', paddingBottom: '18px',
          borderLeft: '1px solid rgba(200,168,78,0.18)',
          borderRight: '1px solid rgba(200,168,78,0.18)',
        }}>AVbot</div>
        <div style={{ padding: '0 12px' }}>Typical Discord bots</div>
        <div style={{ padding: '0 12px' }}>Web3 focused bots</div>
      </div>

      {COMPARISON_ROWS.map((row, i) => (
        <div
          key={row.feature}
          className="av-cmp-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(160px, 1.7fr) 1fr 1fr 1fr',
            padding: '14px 22px',
            alignItems: 'center',
            borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
          }}
        >
          <div className="av-cmp-feature" style={{
            fontSize: '14px',
            color: 'rgba(228,228,231,0.88)',
            fontWeight: 500,
          }}>
            {row.feature}
          </div>
          <div className="av-cmp-cell av-cmp-cell-avbot" style={{
            background: 'rgba(200,168,78,0.06)',
            margin: '-14px 0',
            padding: '14px 12px',
            borderLeft: '1px solid rgba(200,168,78,0.18)',
            borderRight: '1px solid rgba(200,168,78,0.18)',
          }}>
            <span className="av-cmp-cell-label">AVbot</span>
            <CellMark value={row.avbot} />
          </div>
          <div className="av-cmp-cell" style={{ padding: '0 12px' }}>
            <span className="av-cmp-cell-label">Typical Discord bots</span>
            <CellMark value={row.general} />
          </div>
          <div className="av-cmp-cell" style={{ padding: '0 12px' }}>
            <span className="av-cmp-cell-label">Web3 focused bots</span>
            <CellMark value={row.web3bot} />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

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
            Most Web3 communities run a Frankenstein stack of single purpose bots that never quite talk to each other. AVbot replaces all of it, free.
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
              10+ separate bots. 10+ dashboards. Multiple subscriptions to maintain.
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
              One bot. Fourteen modules. One dashboard. Free.
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {['📊 Analytics', '✅ Verification', '🎭 Role Selection', '📝 Forms', '🎫 Tickets', '⚔️ Raid', '🔁 Engage', '🛡️ Protection', '📋 Logs', '🎁 Giveaway', '💼 Wallet Collection', '📡 Radar', '💬 Embed Messages', '⚙️ Server Settings'].map((m) => (
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

        {/* Comparison table */}
        <div style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              textAlign: 'center',
              marginBottom: 'clamp(24px, 4vw, 40px)',
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--av-gold)',
            }}>
              Side by side
            </div>
            <h3 style={{
              margin: '8px 0 0',
              fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--av-text)',
              lineHeight: 1.15,
              textShadow: '0 2px 18px rgba(0,0,0,0.6)',
            }}>
              How AVbot compares.
            </h3>
          </motion.div>
          <ComparisonTable />
        </div>
      </div>
    </section>
  );
}
