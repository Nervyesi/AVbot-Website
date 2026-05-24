import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';
import CursorGas from '../components/CursorGas';
import HeroCenterpiece from '../components/HeroCenterpiece';
import ScrollJourney from '../components/ScrollJourney';
import WhySection from '../components/WhySection';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

const LOGO_URL = 'https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png';

// ── CTA buttons ────────────────────────────────────────────────────────────

function PrimaryCTA({ href, children }) {
  const [hover, setHover] = useState(false);
  return (
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
        gap: '10px',
        padding: '16px 32px',
        borderRadius: '12px',
        backgroundColor: hover ? 'var(--av-gold-light)' : 'var(--av-gold)',
        color: '#0a0a0a',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '-0.01em',
        textDecoration: 'none',
        overflow: 'hidden',
        boxShadow: hover
          ? '0 20px 60px -10px rgba(200,168,78,0.55), 0 0 0 1px rgba(200,168,78,0.4)'
          : '0 10px 40px -12px rgba(148,115,13,0.45), 0 0 0 1px rgba(148,115,13,0.25)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'background-color 0.25s, transform 0.18s, box-shadow 0.25s',
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
          transform: hover ? 'translateX(150%)' : 'translateX(-150%)',
          transition: 'transform 0.85s cubic-bezier(0.4, 0.0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      />
    </a>
  );
}

function SecondaryCTA({ href, children }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '15px 30px',
        borderRadius: '12px',
        border: `1px solid ${hover ? 'var(--av-gold)' : 'rgba(255,255,255,0.18)'}`,
        backgroundColor: hover ? 'rgba(200,168,78,0.06)' : 'rgba(20,20,24,0.4)',
        color: 'var(--av-text)',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '-0.01em',
        textDecoration: 'none',
        backdropFilter: 'blur(6px)',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      {children}
    </a>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────

function HeroSection({ inviteUrl }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(96px, 14vh, 144px) 24px clamp(60px, 8vh, 96px)',
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
    >
      <HeroCenterpiece />

      {/* Content column. Sits above the centerpiece. */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1100px',
        width: '100%',
      }}>
        {/* Cinematic kicker. Two sequenced lines that open the film. */}
        <div style={{
          marginBottom: '28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px',
        }}>
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              fontSize: 'clamp(10px, 1vw, 11px)',
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'var(--av-gold)',
              textAlign: 'center',
            }}
          >
            Web3 deserved a real engine, so we built one.
          </motion.div>
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              fontSize: 'clamp(10px, 1vw, 11px)',
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              textAlign: 'center',
            }}
          >
            From Web3, for Web3.
          </motion.div>
        </div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.86, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 0.7, 0.18, 1] }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: '32px',
          }}
        >
          <img
            src={LOGO_URL}
            alt="AVbot"
            draggable="false"
            style={{
              position: 'relative',
              width: 'clamp(180px, 22vw, 260px)',
              height: 'auto',
              maxHeight: '160px',
              objectFit: 'contain',
              userSelect: 'none',
              display: 'block',
              filter: 'drop-shadow(0 0 16px rgba(200,168,78,0.35)) drop-shadow(0 0 48px rgba(148,115,13,0.18))',
              zIndex: 1,
            }}
          />
        </motion.div>

        {/* Headline */}
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(2.2rem, 6.4vw, 4.75rem)',
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          fontFamily: 'Sora, sans-serif',
          textAlign: 'center',
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}>
          <motion.span
            initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 1.1, ease: [0.22, 0.6, 0.2, 1] }}
            style={{ display: 'block', color: 'var(--av-text)' }}
          >
            Your community
          </motion.span>
          <motion.span
            initial={{ y: 28, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: 1.4, ease: [0.22, 0.6, 0.2, 1] }}
            style={{
              display: 'block',
              background: 'linear-gradient(115deg, #94730D 22%, #f1d586 50%, #94730D 78%)',
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              animation: 'av-shine 7s ease-in-out 2.6s infinite',
              filter: 'drop-shadow(0 0 36px rgba(148,115,13,0.18))',
            }}
          >
            deserves better
          </motion.span>
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.85, delay: 1.75, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: '24px',
            marginBottom: 0,
            fontSize: 'clamp(1rem, 1.85vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '640px',
            color: 'rgba(228,228,231,0.78)',
            fontFamily: 'Sora, sans-serif',
            textAlign: 'center',
            textShadow: '0 1px 12px rgba(0,0,0,0.6)',
          }}
        >
          AVbot turns your Discord into a living Web3 community engine.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 2.05, ease: [0.22, 0.6, 0.2, 1] }}
          style={{
            marginTop: 'clamp(28px, 4vh, 44px)',
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <PrimaryCTA href={inviteUrl}>Add AVbot to Discord</PrimaryCTA>
          <SecondaryCTA href="#showcase">See It in Action</SecondaryCTA>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#showcase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 2.6, duration: 0.8 },
          y:       { duration: 2.2, repeat: Infinity, delay: 2.6, ease: 'easeInOut' },
        }}
        style={{
          position: 'absolute',
          bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(228,228,231,0.5)',
          zIndex: 3,
        }}
        aria-label="Scroll for more"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.a>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const Landing = () => {
  const [inviteUrl, setInviteUrl] = useState(ADD_TO_DISCORD_URL);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/public/bot-info`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d?.invite_url) setInviteUrl(d.invite_url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{
      position: 'relative',
      backgroundColor: 'var(--av-bg)',
      color: 'var(--av-text)',
      minHeight: '100vh',
      fontFamily: 'Sora, sans-serif',
      // Faint global radial so the page bg has depth around the centerpiece.
      backgroundImage:
        'radial-gradient(ellipse at 50% 30%, rgba(200,168,78,0.04) 0%, rgba(10,10,10,0) 50%)',
    }}>
      <CursorGas />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection inviteUrl={inviteUrl} />
        <ScrollJourney />
        <WhySection />
        <FinalCTA inviteUrl={inviteUrl} />
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
