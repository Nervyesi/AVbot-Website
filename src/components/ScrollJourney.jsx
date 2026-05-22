import React from 'react';
import { motion } from 'framer-motion';
import { MODULE_PANELS } from './ModuleMockups';

/**
 * ScrollJourney.
 *
 * Nine 100vh stations stacked vertically over the fixed BlackHoleVideo.
 * As the user scrolls the camera approaches and orbits the black hole;
 * each station's module mockup is composed off to one side (alternating
 * right then left) so the bright disk has room to breathe. Each station
 * reveals via Framer Motion whileInView amount:0.35 once:true and its
 * mockup's internal IntersectionObserver plays the embedded animation.
 *
 * All sections are transparent. The page bg and the video are the only
 * visual layers behind the cards; there are no borders or section fills
 * that could draw a horizontal seam.
 */

function StationCopy({ panel, onRight }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: onRight ? 'flex-start' : 'flex-end',
      textAlign: onRight ? 'left' : 'right',
      marginBottom: '20px',
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
        minHeight: '100vh',
        padding: '12vh 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Transparent so the fixed BlackHoleVideo shows through. No
        // borders, no shadows, nothing that could draw a horizontal edge.
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
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
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: onRight ? 'flex-start' : 'flex-end',
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
    <div style={{ position: 'relative', backgroundColor: 'transparent' }}>
      {/* Section heading. Sits as a small dedicated viewport-height slot so
          the user reads it cleanly before the first module appears. */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          padding: '12vh 24px 0',
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
          style={{ maxWidth: '780px' }}
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
            Nine modules. <span style={{ color: 'var(--av-gold)' }}>One engine.</span>
          </h2>
          <p style={{
            marginTop: '16px',
            marginBottom: 0,
            fontSize: '1.08rem',
            color: 'rgba(228,228,231,0.78)',
            lineHeight: 1.6,
            textShadow: '0 1px 12px rgba(0,0,0,0.7)',
          }}>
            Scroll. The camera closes on the singularity. Each station lights up another part of what AVbot does.
          </p>
        </motion.div>
      </section>

      {MODULE_PANELS.map((panel, i) => (
        <ModuleStation key={panel.id} panel={panel} index={i} />
      ))}
    </div>
  );
}
