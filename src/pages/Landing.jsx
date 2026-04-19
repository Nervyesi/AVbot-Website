import React, { useEffect, useState } from 'react';
import DiscordMockup from '../components/DiscordMockup';
import { ADD_TO_DISCORD_URL } from '../constants';

// ── Scroll Animation Hook ──────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      }),
      { threshold: 0.15 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

// ── Feature data ──────────────────────────────────────────────────────────
const features = [
  {
    mockup: 'verification',
    title: 'Smart Verification',
    desc: 'Stop bots before they enter. AVbot\'s multi-layer captcha system verifies real humans automatically, keeping your server clean without any manual moderation.',
    icon: '🔐',
  },
  {
    mockup: 'roleSelection',
    title: 'Role Selection',
    desc: 'Let members self-assign roles via Discord buttons. Creators and community members get different access levels, permissions, and channels — all automated.',
    icon: '🎭',
  },
  {
    mockup: 'creatorTicket',
    title: 'Creator Tickets',
    desc: 'Accept creator applications through a structured ticket flow. Review follower counts, engagement rates, and content type before approving or rejecting — right in Discord.',
    icon: '📋',
  },
  {
    mockup: 'raidSystem',
    title: 'Raid System',
    desc: 'Coordinate mass engagement on Twitter in seconds. Launch raids with targets, rewards, and time limits. Members earn points for each action taken.',
    icon: '⚔️',
  },
  {
    mockup: 'engageForEngage',
    title: 'Engage-for-Engage',
    desc: 'A self-sustaining engagement pool where creators support each other. Post your tweet, engage with others, and earn points — all tracked and incentivized automatically.',
    icon: '🔄',
  },
  {
    mockup: 'sectionRoles',
    title: 'Section Roles',
    desc: 'Organize your server with toggle-based section rooms. Members pick their interests (NFTs, Trading, AI, Degen) and unlock relevant channels. Zero config needed.',
    icon: '🏠',
  },
  {
    mockup: 'protection',
    title: 'Auto-Moderation',
    desc: 'Full server protection on autopilot. Link detection, spam muting, phishing blocklist, suspicious user flagging, and anti-raid lockdown — all logged to your mod channel.',
    icon: '🛡️',
  },
];

// ── FAQ data ──────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is AVbot free to use?',
    a: 'AVbot has a free tier with core features. Premium plans unlock advanced automation, custom branding, and priority support for high-volume servers.',
  },
  {
    q: 'Do I need to know how to code to set it up?',
    a: 'Not at all. AVbot is fully configured through Discord slash commands and an intuitive dashboard. No coding, hosting, or technical knowledge required.',
  },
  {
    q: 'How does the points system work?',
    a: 'Members earn points by completing raids, engaging in the E4E pool, verifying, and participating in events. Admins can set point values per action and configure leaderboards.',
  },
  {
    q: 'Can AVbot handle large servers?',
    a: 'AVbot is built for scale. Whether you have 100 or 100,000 members, the verification, raid, and engagement systems are optimized for high concurrency without rate limit issues.',
  },
  {
    q: 'Is my server\'s data safe?',
    a: 'All data is encrypted at rest and in transit. AVbot only requests the minimum necessary Discord permissions and never stores message content beyond what\'s needed for features.',
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────
const steps = [
  { icon: '🤖', step: '01', title: 'Invite', desc: 'Add AVbot to your Discord server with one click. It\'s live in under 30 seconds.' },
  { icon: '⚙️', step: '02', title: 'Configure', desc: 'Run /setup in your server. AVbot creates channels, roles, and configs automatically.' },
  { icon: '🎨', step: '03', title: 'Customize', desc: 'Adjust point values, raid rewards, embed colors, and verification difficulty from the dashboard.' },
  { icon: '🚀', step: '04', title: 'Launch', desc: 'Turn on modules one by one. Your community starts running itself from day one.' },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${open ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '10px',
        marginBottom: '10px',
        transition: 'border-color 0.2s',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '18px 22px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', color: '#fff', fontFamily: 'Sora, sans-serif',
          fontWeight: 600, fontSize: '15px', textAlign: 'left',
        }}
      >
        {q}
        <span style={{
          color: '#C8A84E', fontSize: '20px', lineHeight: 1,
          transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s',
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: '0 22px 18px', color: 'rgba(255,255,255,0.7)',
          fontSize: '14px', lineHeight: 1.7,
        }}>{a}</div>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const Landing = () => {
  useScrollReveal();

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#fff', fontFamily: 'Sora, sans-serif' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '120px 2rem 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(200,168,78,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="fade-in" style={{ transitionDelay: '0.1s' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(200,168,78,0.12)',
            border: '1px solid rgba(200,168,78,0.35)',
            color: '#C8A84E',
            padding: '6px 16px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            marginBottom: '28px',
            textTransform: 'uppercase',
          }}>
            ⚡ The Ultimate Web3 Discord Bot
          </span>
        </div>

        <h1 className="fade-in" style={{
          fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
          fontWeight: 800,
          lineHeight: 1.05,
          margin: '0 0 24px',
          letterSpacing: '-0.03em',
          transitionDelay: '0.2s',
        }}>
          Your community<br />
          <span className="gold-gradient">runs itself.</span>
        </h1>

        <p className="fade-in" style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '580px',
          lineHeight: 1.7,
          margin: '0 0 40px',
          transitionDelay: '0.3s',
        }}>
          Verification. Creator management. Raids. Engagement. Points. Leaderboards.
          <br />One bot. Zero manual work. Built for Web3.
        </p>

        <div className="fade-in" style={{
          display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center',
          transitionDelay: '0.4s',
        }}>
          <a href={ADD_TO_DISCORD_URL} className="btn-primary" style={{ textDecoration: 'none', fontSize: '15px', padding: '14px 28px' }}>
            <span>🤖</span> Add to Discord
          </a>
          <a href="#features" className="btn-secondary" style={{ textDecoration: 'none', fontSize: '15px', padding: '14px 28px' }}>
            See Features ↓
          </a>
        </div>

        {/* Scroll hint */}
        <div className="fade-in" style={{
          position: 'absolute', bottom: '40px',
          color: 'rgba(255,255,255,0.3)', fontSize: '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          transitionDelay: '0.8s',
        }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(200,168,78,0.5))' }} />
          scroll
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        borderTop: '1px solid rgba(200,168,78,0.12)',
        borderBottom: '1px solid rgba(200,168,78,0.12)',
        background: 'rgba(200,168,78,0.03)',
        padding: '28px 2rem',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', textAlign: 'center',
        }}>
          {[
            { val: '10+', label: 'Modules' },
            { val: '24/7', label: 'Uptime' },
            { val: '∞', label: 'Customizable' },
            { val: '0', label: 'Manual Work' },
          ].map(s => (
            <div key={s.label} className="fade-in">
              <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }} className="gold-gradient">
                {s.val}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ── */}
      <section id="features" style={{ padding: '100px 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Everything your server needs,<br /><span className="gold-gradient">built right in.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
              Six powerful modules. One bot. Works out of the box.
            </p>
          </div>

          {features.map((f, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={f.mockup}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '60px',
                  alignItems: 'center',
                  marginBottom: '100px',
                  direction: isEven ? 'ltr' : 'rtl',
                }}
              >
                {/* Text */}
                <div className={isEven ? 'slide-left' : 'slide-right'} style={{ direction: 'ltr' }}>
                  <div style={{
                    fontSize: '40px', marginBottom: '16px',
                    width: '64px', height: '64px',
                    background: 'rgba(200,168,78,0.1)',
                    border: '1px solid rgba(200,168,78,0.2)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.8rem', fontWeight: 700, margin: '0 0 14px',
                    letterSpacing: '-0.02em',
                  }}>{f.title}</h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, fontSize: '15px', margin: 0,
                  }}>{f.desc}</p>
                </div>

                {/* Discord Mockup */}
                <div
                  className={isEven ? 'slide-right' : 'slide-left'}
                  style={{ direction: 'ltr', display: 'flex', justifyContent: 'center' }}
                >
                  <DiscordMockup type={f.mockup} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        padding: '100px 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: '70px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px' }}>
              Up and running in <span className="gold-gradient">4 steps.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
              From invite to fully automated in minutes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}>
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="fade-in glass"
                style={{
                  padding: '28px 24px',
                  borderRadius: '16px',
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                <div style={{
                  color: 'rgba(200,168,78,0.3)',
                  fontSize: '48px', fontWeight: 800, lineHeight: 1, marginBottom: '4px',
                }}>{s.step}</div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>{s.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px' }}>
              Got <span className="gold-gradient">questions?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
              Everything you need to know before adding AVbot.
            </p>
          </div>
          <div className="fade-in">
            {faqs.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: '100px 2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(200,168,78,0.12)',
        background: 'radial-gradient(ellipse at center, rgba(200,168,78,0.05) 0%, transparent 70%)',
      }}>
        <div className="fade-in">
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, margin: '0 0 20px', letterSpacing: '-0.03em',
          }}>
            Ready to automate<br /><span className="gold-gradient">your server?</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '16px', marginBottom: '36px', maxWidth: '420px', margin: '0 auto 36px',
          }}>
            Join hundreds of Web3 communities already running on AVbot.
          </p>
          <a href={ADD_TO_DISCORD_URL} className="btn-primary" style={{
            textDecoration: 'none', fontSize: '16px', padding: '16px 36px',
          }}>
            <span>🤖</span> Add AVbot to Discord — It's Free
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 2rem',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #C8A84E, #94730D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '13px', color: '#0A0A0F',
            }}>AV</div>
            <span style={{ fontWeight: 700, color: '#fff' }}>AVbot</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { icon: '🐦', label: 'Twitter', href: 'https://twitter.com' },
              { icon: '💬', label: 'Discord', href: 'https://discord.gg' },
              { icon: '🐙', label: 'GitHub', href: 'https://github.com/Nervyesi/AVbot-Website' },
            ].map(s => (
              <a key={s.label} href={s.href} style={{
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'color 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#C8A84E'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                <span>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>

          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            © 2026 AVbot. Built for Web3 communities.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
