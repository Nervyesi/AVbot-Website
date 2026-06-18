import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChapterBreak.
 *
 * A rhythm device between deep-dive stations. A thin gold line draws across
 * the viewport (scaleX from a centered origin) as it enters view, with a
 * chapter index and label rising up beneath it. Gives the long showcase a
 * sense of flipping through chapters rather than one continuous scroll.
 */
export default function ChapterBreak({ index, label }) {
  const num = String(index).padStart(2, '0');
  return (
    <div
      style={{
        position: 'relative',
        padding: 'clamp(44px, 8vh, 96px) 24px clamp(20px, 3vh, 36px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: [0.22, 0.6, 0.2, 1] }}
        style={{
          width: 'min(620px, 80vw)',
          height: '1px',
          transformOrigin: 'center',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(200,168,78,0.55) 50%, transparent 100%)',
          boxShadow: '0 0 14px rgba(200,168,78,0.4)',
        }}
      />
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 0.6, 0.2, 1] }}
        style={{
          marginTop: '18px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(228,228,231,0.5)',
        }}
      >
        <span style={{ color: 'var(--av-gold)' }}>{num}</span>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(200,168,78,0.5)' }} />
        <span>{label}</span>
      </motion.div>
    </div>
  );
}
