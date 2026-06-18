import React from 'react';
import { motion } from 'framer-motion';
import { MODULE_PANELS } from './ModuleMockups';

/**
 * ScrollJourney.
 *
 * Nine module stations stacked vertically. Each station composes its
 * mockup off to one side, alternating right then left, with a copy block
 * beside it. Each station reveals via Framer Motion whileInView once and
 * the mockup's internal IntersectionObserver plays the inner animation.
 *
 * All sections are transparent so the page-wide gold hero centerpiece /
 * background composites continuously beneath every section with no
 * horizontal seams.
 */

function StationCopy({ panel, onRight, isMobile }) {
  const align = isMobile ? 'center' : (onRight ? 'flex-start' : 'flex-end');
  const textAlign = isMobile ? 'center' : (onRight ? 'left' : 'right');
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: align,
      textAlign,
      marginBottom: '20px',
      width: '100%',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        marginBottom: '10px',
        color: 'var(--av-gold)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        textShadow: '0 0 24px rgba(0,0,0,0.85)',
      }}>
        <span style={{ fontSize: 18 }}>{panel.icon}</span>
        {panel.label}
      </div>
      <h3 style={{
        margin: '0 0 12px',
        fontSize: 'clamp(1.55rem, 3vw, 2.4rem)',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        color: 'var(--av-text)',
        lineHeight: 1.1,
        textShadow: '0 2px 18px rgba(0,0,0,0.75)',
      }}>
        {panel.headline}
      </h3>
      <p style={{
        margin: 0,
        fontSize: '1rem',
        lineHeight: 1.65,
        color: 'rgba(228,228,231,0.82)',
        maxWidth: '420px',
        textShadow: '0 1px 10px rgba(0,0,0,0.7)',
      }}>
        {panel.copy}
      </p>
    </div>
  );
}

function ModuleStation({ panel, index }) {
  const onRight = index % 2 === 0;
  const { Mockup } = panel;

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(36px, 5vh, 64px) 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: onRight ? 'flex-end' : 'flex-start',
          gap: '40px',
        }}
      >
        <motion.div
          initial={{ y: 36, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 0.6, 0.2, 1] }}
          className={`av-station-col av-station-${onRight ? 'right' : 'left'}`}
          style={{
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <StationCopy panel={panel} onRight={onRight} />
          <Mockup />
        </motion.div>
      </div>
    </section>
  );
}

export default function ScrollJourney() {
  return (
    <div id="showcase" style={{ position: 'relative', backgroundColor: 'transparent' }}>
      <section
        style={{
          position: 'relative',
          padding: 'clamp(64px, 10vh, 120px) 24px clamp(20px, 3vh, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundColor: 'transparent',
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
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--av-text)',
            lineHeight: 1.08,
            textShadow: '0 2px 22px rgba(0,0,0,0.75)',
          }}>
            Fourteen modules. <span style={{ color: 'var(--av-gold)' }}>One engine.</span>
          </h2>
          <p style={{
            marginTop: '16px',
            marginBottom: 0,
            fontSize: '1.08rem',
            color: 'rgba(228,228,231,0.78)',
            lineHeight: 1.6,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            textWrap: 'balance',
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}>
            {'Every system your community needs, working in concert. Scroll, and watch each one light up.'}
          </p>
        </motion.div>
      </section>

      {MODULE_PANELS.map((panel, i) => (
        <ModuleStation key={panel.id} panel={panel} index={i} />
      ))}
    </div>
  );
}
