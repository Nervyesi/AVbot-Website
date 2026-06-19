import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DISCORD_INVITE_URL } from '../constants';

/**
 * Footer.
 *
 * Minimal footer. Anchor + outbound links, then a subtle monospace
 * "Vibecoded by @Nervyesi" credit that gilds on hover.
 */

function FooterLink({ href, external, children }) {
  const [hover, setHover] = useState(false);
  const style = {
    color: hover ? 'var(--av-gold)' : 'rgba(228,228,231,0.65)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'color 0.18s',
    padding: '6px 0',
  };
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith('#') || href.startsWith('/')) {
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          style={style}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        to={href}
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </Link>
    );
  }
  return null;
}

function CreditLink() {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="https://x.com/nervyesi"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '11px',
        letterSpacing: '0.04em',
        color: hover ? 'var(--av-gold)' : 'rgba(228,228,231,0.32)',
        textDecoration: 'none',
        transition: 'color 0.18s',
      }}
    >
      vibecoded by @nervyesi
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        padding: '60px 24px 36px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(10,10,14,0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '32px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: 700,
                fontSize: '16px',
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              <img
                src="https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png"
                alt="AVbot"
                style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
              />
              AVbot
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(228,228,231,0.5)', maxWidth: '300px' }}>
              The Discord engine Web3 was missing.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '24px',
              flex: 1,
              maxWidth: '720px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(228,228,231,0.4)',
                  marginBottom: '6px',
                  fontWeight: 700,
                }}
              >
                Product
              </div>
              <FooterLink href="#showcase">Modules</FooterLink>
              <FooterLink href="#why">Why AVbot</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(228,228,231,0.4)',
                  marginBottom: '6px',
                  fontWeight: 700,
                }}
              >
                Community
              </div>
              <FooterLink href={DISCORD_INVITE_URL} external>Discord</FooterLink>
              <FooterLink href="https://x.com/ameretaverse" external>X</FooterLink>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(228,228,231,0.4)',
                  marginBottom: '6px',
                  fontWeight: 700,
                }}
              >
                Resources
              </div>
              <FooterLink href="/docs">Documentation</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(228,228,231,0.4)',
                  marginBottom: '6px',
                  fontWeight: 700,
                }}
              >
                Legal
              </div>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(228,228,231,0.35)' }}>
            © AVbot. Built for Web3.
          </div>
          <CreditLink />
        </div>
      </div>
    </footer>
  );
}
