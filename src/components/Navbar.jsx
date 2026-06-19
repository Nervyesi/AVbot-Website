import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADD_TO_DISCORD_URL } from '../constants';

// On-landing anchor links (smooth scroll to a section).
const ANCHOR_LINKS = [
  { id: 'showcase', label: 'Modules' },
  { id: 'why',      label: 'Why AVbot' },
];

// Real route links, available on every page.
const ROUTE_LINKS = [
  { to: '/faq',  label: 'FAQ' },
  { to: '/docs', label: 'Docs' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on viewport widening (becomes desktop).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 720px)');
    const handler = (e) => { if (e.matches) setMenuOpen(false); };
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [menuOpen]);

  const linkStyle = {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(16px, 2.5vw, 32px)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.3s, border-bottom 0.3s',
        background: (scrolled || menuOpen) ? 'rgba(10,10,15,0.95)' : 'transparent',
        borderBottom: (scrolled || menuOpen) ? '1px solid rgba(200,168,78,0.15)' : '1px solid transparent',
        backdropFilter: (scrolled || menuOpen) ? 'blur(12px)' : 'none',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png"
            alt="AVbot"
            draggable="false"
            style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block', userSelect: 'none' }}
          />
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff', letterSpacing: '-0.02em' }}>
            AVbot
          </span>
        </Link>

        {/* Desktop links. Anchor links only on the landing page; route links
            (FAQ, Docs) on every page. */}
        <div className="av-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {isLanding && ANCHOR_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              style={linkStyle}
              onMouseOver={(e) => (e.target.style.color = 'var(--av-gold)')}
              onMouseOut={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              {l.label}
            </a>
          ))}
          {ROUTE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={linkStyle}
              onMouseOver={(e) => (e.target.style.color = 'var(--av-gold)')}
              onMouseOut={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="av-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}>
            Dashboard
          </Link>
          <a
            href={ADD_TO_DISCORD_URL}
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '13px' }}
          >
            Add to Discord
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="av-nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(200,168,78,0.3)',
            borderRadius: '8px',
            color: '#fff',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <span style={{
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '18px',
            height: '13px',
          }}>
            <span style={{
              width: '100%', height: '2px', background: '#fff', borderRadius: '2px',
              transition: 'transform 0.2s, opacity 0.2s',
              transform: menuOpen ? 'translateY(5px) rotate(45deg)' : 'none',
            }} />
            <span style={{
              width: '100%', height: '2px', background: '#fff', borderRadius: '2px',
              transition: 'opacity 0.2s',
              opacity: menuOpen ? 0 : 1,
            }} />
            <span style={{
              width: '100%', height: '2px', background: '#fff', borderRadius: '2px',
              transition: 'transform 0.2s',
              transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
            }} />
          </span>
        </button>
      </nav>

      {/* Mobile dropdown sheet */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: 'rgba(10,10,15,0.96)',
            backdropFilter: 'blur(14px)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'av-fade-in 0.2s ease forwards',
          }}
        >
          {isLanding && ANCHOR_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '14px 16px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {l.label}
            </a>
          ))}
          {ROUTE_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '14px 16px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '14px 16px',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Dashboard
          </Link>
          <a
            href={ADD_TO_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: '12px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'var(--av-gold)',
              color: '#0a0a0a',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            Add AVbot to Discord
          </a>
        </div>
      )}
    </>
  );
};

export default Navbar;
