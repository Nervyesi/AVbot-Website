import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL } from '../constants';

/**
 * FinalCTA.
 *
 * The closing crescendo of the landing. One big line, one big button.
 */
export default function FinalCTA({ inviteUrl }) {
  const [hover, setHover] = useState(false);
  const href = inviteUrl || ADD_TO_DISCORD_URL;

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(110px, 16vw, 200px) 24px',
        textAlign: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.h2
          initial={{ y: 28, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            margin: 0,
            fontSize: 'clamp(2rem, 5.2vw, 3.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.028em',
            lineHeight: 1.06,
            color: 'var(--av-text)',
            textShadow: '0 2px 28px rgba(0,0,0,0.78)',
          }}
        >
          The last Discord bot your community
          <br />
          <span
            style={{
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out infinite',
            }}
          >
            will ever need.
          </span>
        </motion.h2>

        <motion.p
          initial={{ y: 18, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            margin: '22px auto 0',
            fontSize: 'clamp(1rem, 1.85vw, 1.2rem)',
            color: 'rgba(228,228,231,0.78)',
            lineHeight: 1.6,
            maxWidth: '600px',
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}
        >
          Free to add. Free to use. Fourteen modules, one bot, zero friction.
        </motion.p>

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 0.6, 0.2, 1] }}
          style={{ marginTop: 'clamp(36px, 5vw, 56px)' }}
        >
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
              gap: '12px',
              padding: '20px 40px',
              borderRadius: '14px',
              backgroundColor: hover ? 'var(--av-gold-light)' : 'var(--av-gold)',
              color: '#0a0a0a',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: '17px',
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              overflow: 'hidden',
              transform: hover ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hover
                ? '0 26px 80px -14px rgba(200,168,78,0.6), 0 0 0 1px rgba(200,168,78,0.5)'
                : '0 16px 56px -16px rgba(148,115,13,0.55), 0 0 0 1px rgba(148,115,13,0.3)',
              transition: 'background-color 0.25s, transform 0.18s, box-shadow 0.25s',
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>Add AVbot to Discord</span>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
                transform: hover ? 'translateX(150%)' : 'translateX(-150%)',
                transition: 'transform 0.9s cubic-bezier(0.4, 0.0, 0.2, 1)',
                pointerEvents: 'none',
              }}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
