import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'raids', icon: '⚔️', label: 'Raids' },
  { id: 'engage', icon: '🔄', label: 'Engage' },
  { id: 'points', icon: '⭐', label: 'Points' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

const StatCard = ({ label, value, icon, change, changeType = 'up' }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(200,168,78,0.12)',
    borderRadius: '14px',
    padding: '24px',
    transition: 'border-color 0.2s',
  }}
    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(200,168,78,0.3)'}
    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(200,168,78,0.12)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
        {change && (
          <div style={{
            fontSize: '12px', marginTop: '6px',
            color: changeType === 'up' ? '#3ba55c' : '#ed4245',
          }}>
            {changeType === 'up' ? '↑' : '↓'} {change} this week
          </div>
        )}
      </div>
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>{icon}</div>
    </div>
  </div>
);

const PlaceholderSection = ({ title, desc }) => (
  <div style={{
    border: '1px dashed rgba(200,168,78,0.2)',
    borderRadius: '14px',
    padding: '60px 24px',
    textAlign: 'center',
    marginTop: '24px',
  }}>
    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔧</div>
    <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{title}</div>
    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{desc}</div>
  </div>
);

const Overview = () => (
  <div>
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700 }}>Overview</h2>
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
        Last 7 days • Ameretaverse Server
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px',
    }}>
      <StatCard label="Total Users" value="1,247" icon="👥" change="+83" />
      <StatCard label="Active Raids" value="3" icon="⚔️" change="+2" />
      <StatCard label="Points Distributed" value="48,320" icon="⭐" change="+12,400" />
      <StatCard label="Flagged Users" value="12" icon="🚩" change="-5" changeType="down" />
    </div>

    {/* Recent Activity */}
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(200,168,78,0.1)',
      borderRadius: '14px',
      padding: '24px',
    }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
        Recent Activity
      </h3>
      {[
        { icon: '⚔️', text: 'Raid on @Web3Project launched', time: '2m ago', color: '#C8A84E' },
        { icon: '✅', text: '14 new members verified', time: '8m ago', color: '#3ba55c' },
        { icon: '📋', text: 'Creator application #0058 approved', time: '22m ago', color: '#5865F2' },
        { icon: '🔄', text: 'E4E pool reset — 31 tweets added', time: '1h ago', color: '#C8A84E' },
        { icon: '🚩', text: '2 users flagged for suspicious activity', time: '3h ago', color: '#ed4245' },
      ].map((a, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '12px 0',
          borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
            background: `${a.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>{a.icon}</div>
          <div style={{ flex: 1, fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>{a.text}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{a.time}</div>
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0F',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Sora, sans-serif', padding: '2rem',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(200,168,78,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Link to="/" style={{
          position: 'absolute', top: '24px', left: '24px',
          display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #C8A84E, #94730D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '13px', color: '#0A0A0F',
          }}>AV</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>AVbot</span>
        </Link>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(200,168,78,0.15)',
          borderRadius: '20px',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ margin: '0 0 10px', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            AVbot Dashboard
          </h1>
          <p style={{ margin: '0 0 32px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6 }}>
            Manage your server's automation, raids, engagement, and points — all in one place.
          </p>
          <button
            className="btn-primary"
            onClick={() => setLoggedIn(true)}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
          >
            <span>💬</span> Login with Discord
          </button>
          <p style={{ margin: '16px 0 0', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            By logging in you agree to our Terms of Service.
          </p>
        </div>
      </div>
    );
  }

  const sectionContent = {
    overview: <Overview />,
    raids: <PlaceholderSection title="Raid Manager" desc="Create, schedule, and monitor your server raids. Coming soon in this view." />,
    engage: <PlaceholderSection title="Engage Pool" desc="Manage the E4E pool, review pending tweets, and configure point rewards." />,
    points: <PlaceholderSection title="Points & Leaderboard" desc="View the leaderboard, adjust point values, and manage member balances." />,
    settings: <PlaceholderSection title="Server Settings" desc="Configure all AVbot modules, permissions, and notification channels." />,
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0F', display: 'flex',
      fontFamily: 'Sora, sans-serif', color: '#fff',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(200,168,78,0.1)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', padding: '0 20px 24px',
          borderBottom: '1px solid rgba(200,168,78,0.1)',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #C8A84E, #94730D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', color: '#0A0A0F',
          }}>AV</div>
          <span style={{ fontWeight: 700, color: '#fff' }}>AVbot</span>
        </Link>

        <nav style={{ flex: 1, padding: '16px 10px 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: '100%', background: active === item.id ? 'rgba(200,168,78,0.1)' : 'transparent',
                border: active === item.id ? '1px solid rgba(200,168,78,0.2)' : '1px solid transparent',
                borderRadius: '8px',
                color: active === item.id ? '#C8A84E' : 'rgba(255,255,255,0.55)',
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px',
                cursor: 'pointer',
                fontSize: '14px', fontWeight: active === item.id ? 600 : 400,
                marginBottom: '4px',
                fontFamily: 'Sora, sans-serif',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(200,168,78,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #5865F2, #3a4299)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>👤</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Ameretaverse</div>
            </div>
          </div>
          <button
            onClick={() => setLoggedIn(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '12px', marginTop: '10px',
              fontFamily: 'Sora, sans-serif', padding: 0,
            }}
          >Logout →</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: '900px' }}>
        {sectionContent[active]}
      </main>
    </div>
  );
};

export default Dashboard;
