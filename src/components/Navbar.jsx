import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADD_TO_DISCORD_URL } from '../constants';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.3s, border-bottom 0.3s',
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(200,168,78,0.15)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
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

      {/* Desktop Links */}
      {isLanding && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {['Features', 'How it works', 'FAQ'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.target.style.color = '#C8A84E'}
              onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
            >{link}</a>
          ))}
        </div>
      )}

      {/* CTA Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
    </nav>
  );
};

export default Navbar;
