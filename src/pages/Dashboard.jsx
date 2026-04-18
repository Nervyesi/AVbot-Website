import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Analytics from './Analytics';

// ── Design tokens ────────────────────────────────────────────────────────
const C = {
  gold:     '#C8A84E',
  goldDark: '#94730D',
  bg:       '#0A0A0F',
  surface:  'rgba(255,255,255,0.03)',
  border:   'rgba(200,168,78,0.12)',
  borderHover: 'rgba(200,168,78,0.35)',
  muted:    'rgba(255,255,255,0.45)',
  subtle:   'rgba(255,255,255,0.06)',
};

// ── Servers ──────────────────────────────────────────────────────────────
const SERVERS = [
  { id: 'ameretaverse', name: 'AmeretaVerse',    icon: '⚡', members: 1247, invite: 'https://discord.gg/zueuN7xmWx' },
  { id: 'add',          name: 'Add a server…',   icon: '+',  members: null, invite: null },
];

// ── Reusable UI primitives ───────────────────────────────────────────────

const Card = ({ children, style }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '14px', padding: '24px', ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '18px 14px 6px', }}>
    {children}
  </div>
);

const PageHeader = ({ icon, title, desc, badge }) => (
  <div style={{ marginBottom: '32px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.1)', border: `1px solid rgba(200,168,78,0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>{icon}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h2>
          {badge && (
            <span style={{
              background: 'rgba(200,168,78,0.12)', border: `1px solid rgba(200,168,78,0.3)`,
              color: C.gold, fontSize: '10px', fontWeight: 700, padding: '2px 8px',
              borderRadius: '100px', letterSpacing: '0.06em',
            }}>{badge}</span>
          )}
        </div>
        {desc && <p style={{ margin: '2px 0 0', color: C.muted, fontSize: '13px' }}>{desc}</p>}
      </div>
    </div>
  </div>
);

// ── Form primitives ───────────────────────────────────────────────────────

const Label = ({ children, hint }) => (
  <div style={{ marginBottom: '6px' }}>
    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{children}</span>
    {hint && <span style={{ fontSize: '11px', color: C.muted, marginLeft: '8px' }}>{hint}</span>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', style }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%', background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
      padding: '10px 12px', color: '#fff', fontSize: '14px',
      fontFamily: 'Sora, sans-serif', outline: 'none',
      transition: 'border-color 0.2s', boxSizing: 'border-box',
      ...style,
    }}
    onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%', background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
      padding: '10px 12px', color: '#fff', fontSize: '14px',
      fontFamily: 'Sora, sans-serif', outline: 'none', resize: 'vertical',
      transition: 'border-color 0.2s', boxSizing: 'border-box',
    }}
    onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
  />
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: '100%', background: '#1a1a22',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
      padding: '10px 12px', color: '#fff', fontSize: '14px',
      fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer',
    }}
  >
    {options.map(o => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const Toggle = ({ value, onChange, label, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{desc}</div>}
    </div>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px', borderRadius: '100px',
        background: value ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'rgba(255,255,255,0.1)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px', left: value ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  </div>
);

const FieldRow = ({ children, cols = 2 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '16px', marginBottom: '18px',
  }}>{children}</div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <Label hint={hint}>{label}</Label>
    {children}
  </div>
);

const SaveBtn = ({ saved, onSave }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
    <button
      onClick={onSave}
      className="btn-primary"
      style={{ padding: '11px 28px', fontSize: '14px' }}
    >
      {saved ? '✓  Saved' : 'Save Changes'}
    </button>
    {saved && (
      <span style={{ color: '#3ba55c', fontSize: '13px' }}>
        Settings saved successfully.
      </span>
    )}
  </div>
);

const SettingsCard = ({ title, children, style }) => (
  <Card style={{ marginBottom: '20px', ...style }}>
    {title && (
      <div style={{
        fontSize: '13px', fontWeight: 700, color: C.gold,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px',
      }}>{title}</div>
    )}
    {children}
  </Card>
);

function useSave() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };
  return [saved, save];
}

// ── Overview ──────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, change, changeType = 'up' }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '14px', padding: '22px',
    transition: 'border-color 0.2s',
  }}
    onMouseOver={e => e.currentTarget.style.borderColor = C.borderHover}
    onMouseOut={e => e.currentTarget.style.borderColor = C.border}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        {change && (
          <div style={{ fontSize: '12px', marginTop: '6px', color: changeType === 'up' ? '#3ba55c' : '#ed4245' }}>
            {changeType === 'up' ? '↑' : '↓'} {change} this week
          </div>
        )}
      </div>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px',
      }}>{icon}</div>
    </div>
  </div>
);

const ModuleStatus = ({ name, icon, status }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icon}</span>
      <span style={{ fontSize: '14px' }}>{name}</span>
    </div>
    <span style={{
      fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
      background: status === 'Active' ? 'rgba(59,165,92,0.15)' : 'rgba(255,255,255,0.06)',
      color: status === 'Active' ? '#3ba55c' : C.muted,
      border: `1px solid ${status === 'Active' ? 'rgba(59,165,92,0.3)' : 'transparent'}`,
    }}>{status}</span>
  </div>
);

// ── Pulse placeholder (waiting for live data) ─────────────────────────────

const LivePending = ({ label }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    color: C.muted, fontSize: '13px',
  }}>
    <div style={{
      width: '7px', height: '7px', borderRadius: '50%',
      background: 'rgba(200,168,78,0.5)',
      animation: 'pulse 2s ease-in-out infinite',
    }} />
    {label}
    <style>{`
      @keyframes pulse {
        0%,100% { opacity:0.3; transform:scale(1); }
        50%      { opacity:1;   transform:scale(1.4); }
      }
    `}</style>
  </div>
);

const LiveCard = ({ label, icon }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '12px', padding: '20px 22px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{label}</div>
        <LivePending label="Connect bot to see live data" />
      </div>
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
      }}>{icon}</div>
    </div>
  </div>
);

const Overview = () => (
  <div>
    {/* ── Server identity ── */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px',
      padding: '20px 24px',
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
        background: 'linear-gradient(135deg,#C8A84E,#94730D)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
      }}>⚡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AmeretaVerse</div>
        <div style={{ color: C.muted, fontSize: '13px', marginTop: '2px' }}>
          Web3 community server
        </div>
      </div>
      <a
        href="https://discord.gg/zueuN7xmWx"
        target="_blank" rel="noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.25)',
          color: '#7289da', textDecoration: 'none',
          padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          transition: 'background 0.2s', flexShrink: 0,
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.1)'}
      >
        <span>💬</span> Open Discord
      </a>
    </div>

    {/* ── Live stat placeholders ── */}
    <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
      Server Stats
    </div>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
      gap: '12px', marginBottom: '24px',
    }}>
      <LiveCard label="Total Members"   icon="👥" />
      <LiveCard label="Online Now"      icon="🟢" />
      <LiveCard label="Active Raids"    icon="⚔️" />
      <LiveCard label="Points Today"    icon="⭐" />
    </div>

    {/* ── Module status + recent activity ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>
      {/* Recent activity */}
      <Card>
        <div style={{ fontSize: '12px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Recent Activity
        </div>
        {[
          { icon: '⚠️', text: 'Phishing link deleted from #general',       time: '2m ago',  color: '#ed4245' },
          { icon: '⚔️', text: 'Raid on @AmeretaProject launched',           time: '8m ago',  color: C.gold },
          { icon: '🚫', text: 'Spam mute applied to @spammer_x',            time: '14m ago', color: '#FF6600' },
          { icon: '✅', text: '9 new members verified via captcha',          time: '22m ago', color: '#3ba55c' },
          { icon: '📋', text: 'Creator application #0062 approved',         time: '41m ago', color: '#5865F2' },
          { icon: '🔄', text: 'E4E pool refreshed — 28 new tweets added',   time: '1h ago',  color: C.gold },
          { icon: '⭐', text: '@Nervyesi earned 480 points from raid',       time: '2h ago',  color: C.gold },
          { icon: '🔒', text: 'Anti-raid lockdown triggered and lifted',     time: '4h ago',  color: '#ed4245' },
          { icon: '👤', text: 'Suspicious user @sc4m_acc flagged on join',   time: '6h ago',  color: '#FF6600' },
          { icon: '📋', text: 'Creator application #0061 submitted',         time: '7h ago',  color: '#5865F2' },
        ].map((a, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
              background: `${a.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
            }}>{a.icon}</div>
            <div style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>{a.text}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{a.time}</div>
          </div>
        ))}
      </Card>

      {/* Module status */}
      <Card>
        <div style={{ fontSize: '12px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          Module Status
        </div>
        <ModuleStatus name="Verification"    icon="🔐" status="Active" />
        <ModuleStatus name="Role Selection"  icon="🎭" status="Active" />
        <ModuleStatus name="Creator Ticket"  icon="📋" status="Active" />
        <ModuleStatus name="Raid System"     icon="⚔️" status="Active" />
        <ModuleStatus name="Engage Pool"     icon="🔄" status="Active" />
        <ModuleStatus name="Section Roles"   icon="🏠" status="Active" />
        <ModuleStatus name="Protection"      icon="🛡️" status="Active" />
      </Card>
    </div>
  </div>
);

// ── Settings pages ────────────────────────────────────────────────────────

const VerificationSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#verify',
    role: 'Verified Member',
    message: 'Welcome to AmeretaVerse! Complete the captcha to unlock all channels.',
    difficulty: 'medium', maxAttempts: '3', timeout: '5',
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🔐" title="Verification" badge="MODULE" desc="Configure how new members verify when they first join the server." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Verification" desc="Require members to complete a captcha before accessing the server." />
      </SettingsCard>
      <SettingsCard title="Channel & Role">
        <FieldRow>
          <Field label="Verification Channel" hint="where the embed is posted">
            <Input value={v.channel} onChange={set('channel')} placeholder="#verify" />
          </Field>
          <Field label="Role on Completion" hint="granted after passing">
            <Input value={v.role} onChange={set('role')} placeholder="Verified Member" />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SettingsCard title="Captcha">
        <FieldRow>
          <Field label="Difficulty">
            <Select value={v.difficulty} onChange={set('difficulty')} options={[
              { value: 'easy',   label: 'Easy — 4-character code' },
              { value: 'medium', label: 'Medium — 6-character code' },
              { value: 'hard',   label: 'Hard — 8-character mixed' },
            ]} />
          </Field>
          <Field label="Max Attempts" hint="before ban">
            <Input type="number" value={v.maxAttempts} onChange={set('maxAttempts')} placeholder="3" />
          </Field>
        </FieldRow>
        <Field label="Timeout (minutes)" hint="session expires after">
          <Input type="number" value={v.timeout} onChange={set('timeout')} placeholder="5" style={{ maxWidth: '160px' }} />
        </Field>
      </SettingsCard>
      <SettingsCard title="Embed Message">
        <Field label="Verification Message" hint="shown in the embed">
          <Textarea value={v.message} onChange={set('message')} rows={3}
            placeholder="Welcome! Complete the captcha to get access." />
        </Field>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const RoleSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#roles', allowMultiple: false,
    message: 'Select your role to get started in AmeretaVerse.',
    roles: [
      { id: 1, name: 'Creator',   emoji: '🎨', style: 'gold' },
      { id: 2, name: 'Community', emoji: '👥', style: 'secondary' },
    ],
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🎭" title="Role Selection" badge="MODULE" desc="Let members self-assign roles via Discord buttons." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Role Selection" />
        <Toggle value={v.allowMultiple} onChange={set('allowMultiple')} label="Allow Multiple Roles" desc="Members can hold both Creator and Community roles simultaneously." />
      </SettingsCard>
      <SettingsCard title="Channel">
        <Field label="Role Selection Channel">
          <Input value={v.channel} onChange={set('channel')} placeholder="#roles" style={{ maxWidth: '280px' }} />
        </Field>
      </SettingsCard>
      <SettingsCard title="Roles">
        <div style={{ marginBottom: '14px' }}>
          {v.roles.map((r, i) => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '8px',
            }}>
              <span style={{ fontSize: '18px' }}>{r.emoji}</span>
              <input
                value={r.name}
                onChange={e => {
                  const roles = [...v.roles];
                  roles[i] = { ...roles[i], name: e.target.value };
                  setV(p => ({ ...p, roles }));
                }}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none',
                }}
              />
              <button
                onClick={() => setV(p => ({ ...p, roles: p.roles.filter(x => x.id !== r.id) }))}
                style={{ background: 'none', border: 'none', color: '#ed4245', cursor: 'pointer', fontSize: '16px' }}
              >×</button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setV(p => ({ ...p, roles: [...p.roles, { id: Date.now(), name: 'New Role', emoji: '✨', style: 'primary' }] }))}
          style={{
            background: 'rgba(200,168,78,0.08)', border: '1px dashed rgba(200,168,78,0.3)',
            color: C.gold, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '13px',
          }}
        >+ Add Role</button>
      </SettingsCard>
      <SettingsCard title="Embed Message">
        <Field label="Welcome Message">
          <Textarea value={v.message} onChange={set('message')} rows={3} />
        </Field>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const CreatorTicketSettings = () => {
  const [v, setV] = useState({
    enabled: true, category: 'Creator Applications', adminRole: 'Admins',
    approvalMsg: 'Congratulations! Your creator application has been approved. Welcome to the AmeretaVerse Creator program.',
    rejectionMsg: 'Thank you for applying. Unfortunately your application does not meet our current requirements. You may reapply in 30 days.',
    fields: [
      { id: 1, label: 'Name / Display Name',  enabled: true, required: true },
      { id: 2, label: 'X (Twitter) Profile',  enabled: true, required: true },
      { id: 3, label: 'Follower Count',        enabled: true, required: true },
      { id: 4, label: 'Engagement Score',      enabled: true, required: false },
      { id: 5, label: 'Niche & About',         enabled: true, required: true },
    ],
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const toggleField = id => setV(p => ({
    ...p, fields: p.fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f),
  }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="📋" title="Creator Ticket" badge="MODULE" desc="Configure the creator application flow and admin review process." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Creator Tickets" />
      </SettingsCard>
      <SettingsCard title="Channel & Roles">
        <FieldRow>
          <Field label="Ticket Category" hint="Discord category name">
            <Input value={v.category} onChange={set('category')} placeholder="Creator Applications" />
          </Field>
          <Field label="Admin Role" hint="who can approve">
            <Input value={v.adminRole} onChange={set('adminRole')} placeholder="Admins" />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SettingsCard title="Application Form Fields">
        {v.fields.map(f => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: f.enabled ? '#3ba55c' : 'rgba(255,255,255,0.2)',
              }} />
              <span style={{ fontSize: '14px', color: f.enabled ? '#fff' : C.muted }}>{f.label}</span>
              {f.required && (
                <span style={{ fontSize: '10px', color: '#ed4245', fontWeight: 700 }}>REQUIRED</span>
              )}
            </div>
            <Toggle value={f.enabled} onChange={() => toggleField(f.id)} label="" />
          </div>
        ))}
      </SettingsCard>
      <SettingsCard title="Response Messages">
        <Field label="Approval Message" hint="DM sent on approve">
          <Textarea value={v.approvalMsg} onChange={set('approvalMsg')} rows={3} />
        </Field>
        <div style={{ marginTop: '16px' }}>
          <Field label="Rejection Message" hint="DM sent on reject">
            <Textarea value={v.rejectionMsg} onChange={set('rejectionMsg')} rows={3} />
          </Field>
        </div>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const RaidSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#raids', mode: 'any',
    likePoints: '10', commentPoints: '20', retweetPoints: '15',
    duration: '30', maxActive: '2', proofRequired: false,
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="⚔️" title="Raid System" badge="MODULE" desc="Configure raid channels, point rewards, and engagement rules." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Raid System" />
        <Toggle value={v.proofRequired} onChange={set('proofRequired')} label="Require Screenshot Proof" desc="Members must upload proof before points are awarded." />
      </SettingsCard>
      <SettingsCard title="Channel & Limits">
        <FieldRow>
          <Field label="Raid Channel">
            <Input value={v.channel} onChange={set('channel')} placeholder="#raids" />
          </Field>
          <Field label="Max Active Raids" hint="at the same time">
            <Input type="number" value={v.maxActive} onChange={set('maxActive')} placeholder="2" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Default Duration (min)">
            <Input type="number" value={v.duration} onChange={set('duration')} placeholder="30" />
          </Field>
          <Field label="Engagement Mode">
            <Select value={v.mode} onChange={set('mode')} options={[
              { value: 'all',     label: 'All 3 actions required' },
              { value: 'any',     label: 'Any action counts' },
              { value: 'partial', label: 'Partial — points per action' },
            ]} />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SettingsCard title="Point Weights">
        <FieldRow cols={3}>
          <Field label="❤️ Like" hint="pts per action">
            <Input type="number" value={v.likePoints} onChange={set('likePoints')} placeholder="10" />
          </Field>
          <Field label="💬 Comment" hint="pts per action">
            <Input type="number" value={v.commentPoints} onChange={set('commentPoints')} placeholder="20" />
          </Field>
          <Field label="🔁 Retweet" hint="pts per action">
            <Input type="number" value={v.retweetPoints} onChange={set('retweetPoints')} placeholder="15" />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const EngageSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#engage',
    linkLifetime: '24', pointsPerLink: '30',
    likeWeight: '1.0', commentWeight: '1.5', retweetWeight: '1.2',
    dailyLimit: '5', submitCost: '0', minFollowers: '500',
    autoReset: true,
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🔄" title="Engage Pool" badge="MODULE" desc="Configure the Engage-for-Engage pool, point weights, and submission rules." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Engage Pool" />
        <Toggle value={v.autoReset} onChange={set('autoReset')} label="Auto-Reset Pool Daily" desc="Clears stale tweets every 24 hours and resets daily limits." />
      </SettingsCard>
      <SettingsCard title="Channel & Limits">
        <FieldRow>
          <Field label="Engage Channel">
            <Input value={v.channel} onChange={set('channel')} placeholder="#engage" />
          </Field>
          <Field label="Link Lifetime (hours)" hint="before expiry">
            <Input type="number" value={v.linkLifetime} onChange={set('linkLifetime')} placeholder="24" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Daily Engage Limit" hint="per user">
            <Input type="number" value={v.dailyLimit} onChange={set('dailyLimit')} placeholder="5" />
          </Field>
          <Field label="Submit Cost (points)" hint="to post a link">
            <Input type="number" value={v.submitCost} onChange={set('submitCost')} placeholder="0" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Points Per Link" hint="base reward">
            <Input type="number" value={v.pointsPerLink} onChange={set('pointsPerLink')} placeholder="30" />
          </Field>
          <Field label="Min. Followers to Submit" hint="quality gate">
            <Input type="number" value={v.minFollowers} onChange={set('minFollowers')} placeholder="500" />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SettingsCard title="Engagement Weights">
        <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>
          Points earned = base × weight for each action type.
        </p>
        <FieldRow cols={3}>
          <Field label="❤️ Like Weight">
            <Input type="number" value={v.likeWeight} onChange={set('likeWeight')} placeholder="1.0" />
          </Field>
          <Field label="💬 Comment Weight">
            <Input type="number" value={v.commentWeight} onChange={set('commentWeight')} placeholder="1.5" />
          </Field>
          <Field label="🔁 Retweet Weight">
            <Input type="number" value={v.retweetWeight} onChange={set('retweetWeight')} placeholder="1.2" />
          </Field>
        </FieldRow>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const SectionSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#sections',
    message: 'Pick your interests to unlock the right channels. You can toggle sections on and off at any time.',
    sections: [
      { id: 1, name: 'NFTs',   emoji: '🖼️', role: 'nfts',   enabled: true },
      { id: 2, name: 'Engage', emoji: '🔄', role: 'engage', enabled: true },
      { id: 3, name: 'Trade',  emoji: '📈', role: 'trade',  enabled: true },
      { id: 4, name: 'Degen',  emoji: '🎲', role: 'degen',  enabled: true },
      { id: 5, name: 'AI',     emoji: '🤖', role: 'ai',     enabled: true },
    ],
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const toggleSection = id => setV(p => ({
    ...p, sections: p.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s),
  }));
  const updateSection = (id, key, val) => setV(p => ({
    ...p, sections: p.sections.map(s => s.id === id ? { ...s, [key]: val } : s),
  }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🏠" title="Section Roles" badge="MODULE" desc="Manage server sections — each section maps to a Discord role and unlocks specific channels." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Section Roles" />
      </SettingsCard>
      <SettingsCard title="Channel">
        <Field label="Section Selection Channel">
          <Input value={v.channel} onChange={set('channel')} placeholder="#sections" style={{ maxWidth: '280px' }} />
        </Field>
      </SettingsCard>
      <SettingsCard title="Sections">
        {v.sections.map(s => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 1fr auto',
            alignItems: 'center', gap: '12px',
            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: '20px', textAlign: 'center' }}>{s.emoji}</span>
            <input
              value={s.name}
              onChange={e => updateSection(s.id, 'name', e.target.value)}
              placeholder="Section Name"
              style={{
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '7px 10px', color: '#fff',
                fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none',
              }}
            />
            <input
              value={s.role}
              onChange={e => updateSection(s.id, 'role', e.target.value)}
              placeholder="role-name"
              style={{
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '7px 10px', color: C.gold,
                fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none',
              }}
            />
            <Toggle value={s.enabled} onChange={() => toggleSection(s.id)} label="" />
          </div>
        ))}
        <button
          onClick={() => setV(p => ({
            ...p, sections: [...p.sections, { id: Date.now(), name: 'New Section', emoji: '✨', role: 'new-section', enabled: true }],
          }))}
          style={{
            marginTop: '14px', background: 'rgba(200,168,78,0.08)',
            border: '1px dashed rgba(200,168,78,0.3)', color: C.gold,
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '13px',
          }}
        >+ Add Section</button>
      </SettingsCard>
      <SettingsCard title="Embed Message">
        <Field label="Selection Message">
          <Textarea value={v.message} onChange={set('message')} rows={3} />
        </Field>
      </SettingsCard>
      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

const PointsPage = () => (
  <div>
    <PageHeader icon="⭐" title="Points & Leaderboard" desc="View and manage the AmeretaVerse points leaderboard." />
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: '14px', marginBottom: '24px',
    }}>
      <StatCard label="Total Points Issued" value="48,320" icon="⭐" change="+9,640" />
      <StatCard label="Unique Earners" value="412" icon="👥" change="+28" />
      <StatCard label="Avg Points/User" value="117" icon="📊" change="+12" />
    </div>
    <Card>
      <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
        Top 10 Leaderboard
      </div>
      {[
        { rank: 1, name: 'Nervyesi',       points: 4820, badge: '🥇' },
        { rank: 2, name: 'Web3Creator',    points: 3970, badge: '🥈' },
        { rank: 3, name: 'DeFi_Builder',   points: 3540, badge: '🥉' },
        { rank: 4, name: 'NFT_Alpha',      points: 2880, badge: '' },
        { rank: 5, name: 'CryptoNative',   points: 2340, badge: '' },
        { rank: 6, name: 'Web3_Trader',    points: 1990, badge: '' },
        { rank: 7, name: 'DegenKing',      points: 1780, badge: '' },
        { rank: 8, name: 'AIResearcher',   points: 1620, badge: '' },
        { rank: 9, name: 'Raider_Pro',     points: 1450, badge: '' },
        { rank: 10, name: 'Community_01',  points: 1280, badge: '' },
      ].map((u, i, arr) => (
        <div key={u.rank} style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0',
          borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}>
          <div style={{ width: '28px', textAlign: 'center', fontSize: u.badge ? '18px' : '13px',
            color: u.badge ? undefined : C.muted, fontWeight: 700 }}>
            {u.badge || `#${u.rank}`}
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `hsl(${u.rank * 37},40%,30%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700,
          }}>{u.name[0]}</div>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>@{u.name}</div>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: '14px' }}>
            {u.points.toLocaleString()} pts
          </div>
        </div>
      ))}
    </Card>
  </div>
);

// ── Server selector dropdown ──────────────────────────────────────────────

const ServerSelector = ({ server, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
          borderRadius: '8px', padding: '7px 12px',
          color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px',
          transition: 'border-color 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = C.borderHover}
        onMouseOut={e => e.currentTarget.style.borderColor = C.border}
      >
        <span style={{ fontSize: '16px' }}>{server.icon}</span>
        <span style={{ fontWeight: 600 }}>{server.name}</span>
        <span style={{
          fontSize: '10px', color: C.muted,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '200px',
          background: '#1a1a22', border: `1px solid ${C.border}`,
          borderRadius: '10px', overflow: 'hidden', zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          {SERVERS.map(s => (
            <div key={s.id}
              onClick={() => {
                if (s.id === 'add') { window.open('https://discord.gg/zueuN7xmWx', '_blank'); }
                else { onSelect(s); }
                setOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', cursor: 'pointer',
                background: server.id === s.id ? 'rgba(200,168,78,0.08)' : 'transparent',
                color: s.id === 'add' ? C.gold : '#fff',
                fontSize: '13px', fontWeight: s.id === 'add' ? 600 : 400,
                transition: 'background 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => {
                e.currentTarget.style.background = server.id === s.id ? 'rgba(200,168,78,0.08)' : 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div>{s.name}</div>
                {s.members && <div style={{ fontSize: '11px', color: C.muted }}>{s.members.toLocaleString()} members</div>}
              </div>
              {server.id === s.id && <span style={{ color: C.gold, fontSize: '14px' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Protection Settings ───────────────────────────────────────────────────

const ProtectionSettings = () => {
  const [v, setV] = useState({
    linkDetection:      true,
    linkWhitelist:      'twitter.com, x.com, discord.gg, youtube.com',
    spamDetection:      true,
    spamThreshold:      '5',
    spamWindow:         '10',
    suspiciousUsers:    true,
    suspiciousAction:   'flag',
    suspiciousAge:      '7',
    phishingDetection:  true,
    antiRaid:           true,
    antiRaidThreshold:  '10',
    antiRaidWindow:     '60',
    bannedWords:        false,
    bannedWordsList:    '',
    logChannel:         'mod-log',
    muteRole:           'Muted',
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🛡️" title="Auto-Moderation" badge="MODULE"
        desc="Automated protection: link filtering, spam control, phishing detection, anti-raid, and more." />

      {/* ── Protection Stats (live placeholders) ── */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
        Protection Stats · Last 7 Days
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
        gap: '12px', marginBottom: '28px',
      }}>
        {[
          { label: 'Messages Deleted', icon: '🗑️' },
          { label: 'Users Flagged',    icon: '🚩' },
          { label: 'Raids Blocked',    icon: '🔒' },
          { label: 'Spam Mutes',       icon: '🔇' },
          { label: 'Phishing Deleted', icon: '⚠️' },
          { label: 'Banned Words Hit', icon: '🚫' },
        ].map(s => <LiveCard key={s.label} {...s} />)}
      </div>

      {/* ── Link Detection ── */}
      <SettingsCard title="Link Detection">
        <Toggle value={v.linkDetection} onChange={set('linkDetection')}
          label="Enable Link Detection"
          desc="Auto-delete messages containing URLs not on the whitelist." />
        <div style={{ marginTop: '14px' }}>
          <Field label="Allowed Domains" hint="comma-separated whitelist">
            <Input value={v.linkWhitelist} onChange={set('linkWhitelist')}
              placeholder="twitter.com, x.com, discord.gg" />
          </Field>
        </div>
      </SettingsCard>

      {/* ── Phishing Detection ── */}
      <SettingsCard title="Phishing Detection">
        <Toggle value={v.phishingDetection} onChange={set('phishingDetection')}
          label="Enable Phishing Detection"
          desc="Block and delete messages containing known phishing domains. Users receive a DM warning." />
      </SettingsCard>

      {/* ── Spam Detection ── */}
      <SettingsCard title="Spam Detection">
        <Toggle value={v.spamDetection} onChange={set('spamDetection')}
          label="Enable Spam Detection"
          desc="Automatically mute users who send too many messages in a short window." />
        <FieldRow style={{ marginTop: '14px' }}>
          <Field label="Message Threshold" hint="per window">
            <Input type="number" value={v.spamThreshold} onChange={set('spamThreshold')} placeholder="5" />
          </Field>
          <Field label="Time Window (seconds)">
            <Input type="number" value={v.spamWindow} onChange={set('spamWindow')} placeholder="10" />
          </Field>
        </FieldRow>
        <Field label="Mute Role Name" hint="created automatically if it doesn't exist">
          <Input value={v.muteRole} onChange={set('muteRole')} placeholder="Muted" style={{ maxWidth: '240px' }} />
        </Field>
      </SettingsCard>

      {/* ── Suspicious Users ── */}
      <SettingsCard title="Suspicious User Detection">
        <Toggle value={v.suspiciousUsers} onChange={set('suspiciousUsers')}
          label="Enable Suspicious User Detection"
          desc="Flag users on join based on account age, default avatar, and scam keywords in name." />
        <FieldRow style={{ marginTop: '14px' }}>
          <Field label="Action on Detection">
            <Select value={v.suspiciousAction} onChange={set('suspiciousAction')} options={[
              { value: 'flag', label: 'Flag only — log to mod-log' },
              { value: 'kick', label: 'Kick — remove from server' },
              { value: 'ban',  label: 'Ban — permanent removal' },
            ]} />
          </Field>
          <Field label="Minimum Account Age (days)">
            <Input type="number" value={v.suspiciousAge} onChange={set('suspiciousAge')} placeholder="7" />
          </Field>
        </FieldRow>
      </SettingsCard>

      {/* ── Anti-Raid ── */}
      <SettingsCard title="Anti-Raid">
        <Toggle value={v.antiRaid} onChange={set('antiRaid')}
          label="Enable Anti-Raid"
          desc="If a burst of users join at once, all invites are paused and admins are pinged." />
        <FieldRow style={{ marginTop: '14px' }}>
          <Field label="Join Threshold" hint="users to trigger lockdown">
            <Input type="number" value={v.antiRaidThreshold} onChange={set('antiRaidThreshold')} placeholder="10" />
          </Field>
          <Field label="Time Window (seconds)">
            <Input type="number" value={v.antiRaidWindow} onChange={set('antiRaidWindow')} placeholder="60" />
          </Field>
        </FieldRow>
      </SettingsCard>

      {/* ── Banned Words ── */}
      <SettingsCard title="Banned Words Filter">
        <Toggle value={v.bannedWords} onChange={set('bannedWords')}
          label="Enable Banned Words Filter"
          desc="Auto-delete messages containing any of the words in the list below." />
        <div style={{ marginTop: '14px' }}>
          <Field label="Banned Words" hint="comma-separated">
            <Textarea value={v.bannedWordsList} onChange={set('bannedWordsList')}
              rows={3} placeholder="word1, word2, word3" />
          </Field>
        </div>
      </SettingsCard>

      {/* ── Logging ── */}
      <SettingsCard title="Logging">
        <Field label="Mod Log Channel" hint="all protection actions are posted here">
          <Input value={v.logChannel} onChange={set('logChannel')} placeholder="mod-log" style={{ maxWidth: '240px' }} />
        </Field>
      </SettingsCard>

      <SaveBtn saved={saved} onSave={save} />
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────

const NAV = [
  { id: 'overview',        icon: '📊', label: 'Overview',       group: null },
  { id: 'analytics',       icon: '📈', label: 'Analytics',      group: null },
  { id: 'verification',    icon: '🔐', label: 'Verification',   group: 'Settings' },
  { id: 'roles',           icon: '🎭', label: 'Role Selection', group: 'Settings' },
  { id: 'creator-ticket',  icon: '📋', label: 'Creator Ticket', group: 'Settings' },
  { id: 'raid',            icon: '⚔️', label: 'Raid System',    group: 'Settings' },
  { id: 'engage',          icon: '🔄', label: 'Engage Pool',    group: 'Settings' },
  { id: 'sections',        icon: '🏠', label: 'Section Roles',  group: 'Settings' },
  { id: 'protection',      icon: '🛡️', label: 'Protection',     group: 'Settings' },
  { id: 'points',          icon: '⭐', label: 'Points',         group: 'More' },
];

const PAGES = {
  overview:       <Overview />,
  analytics:      <Analytics />,
  verification:   <VerificationSettings />,
  roles:          <RoleSettings />,
  'creator-ticket': <CreatorTicketSettings />,
  raid:           <RaidSettings />,
  engage:         <EngageSettings />,
  sections:       <SectionSettings />,
  protection:     <ProtectionSettings />,
  points:         <PointsPage />,
};

// ── Dashboard shell ───────────────────────────────────────────────────────

const Dashboard = () => {
  const [loggedIn, setLoggedIn]     = useState(false);
  const [active, setActive]         = useState('overview');
  const [server, setServer]         = useState(SERVERS[0]);

  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Sora, sans-serif', padding: '2rem', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
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
            background: 'linear-gradient(135deg,#C8A84E,#94730D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '13px', color: '#0A0A0F',
          }}>AV</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>AVbot</span>
        </Link>
        <div style={{
          background: C.surface, border: '1px solid rgba(200,168,78,0.15)',
          borderRadius: '20px', padding: '48px 40px', textAlign: 'center',
          maxWidth: '420px', width: '100%',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ margin: '0 0 10px', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            AVbot Dashboard
          </h1>
          <p style={{ margin: '0 0 32px', color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>
            Manage your server's automation, raids, engagement, and points — all in one place.
          </p>
          <button
            className="btn-primary"
            onClick={() => setLoggedIn(true)}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
          >
            <span>💬</span> Login with Discord
          </button>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <a
              href="https://discord.gg/zueuN7xmWx"
              target="_blank" rel="noreferrer"
              style={{ color: '#7289da', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>💬</span> Join AmeretaVerse Discord
            </a>
          </div>
          <p style={{ margin: '16px 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
            By logging in you agree to our Terms of Service.
          </p>
        </div>
      </div>
    );
  }

  const groups = ['Settings', 'More'];
  const groupedNav = {
    top:     NAV.filter(n => !n.group),
    Settings: NAV.filter(n => n.group === 'Settings'),
    More:    NAV.filter(n => n.group === 'More'),
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: 'Sora, sans-serif', color: '#fff' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '224px', flexShrink: 0,
        background: 'rgba(255,255,255,0.02)', borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', padding: '20px 18px',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#C8A84E,#94730D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', color: '#0A0A0F',
          }}>AV</div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>AVbot</span>
        </Link>

        <nav style={{ flex: 1, padding: '10px 10px 0' }}>
          {/* Top (ungrouped) */}
          {groupedNav.top.map(item => <NavBtn key={item.id} item={item} active={active} setActive={setActive} />)}

          {/* Grouped */}
          {groups.map(g => (
            <div key={g}>
              <SectionLabel>{g}</SectionLabel>
              {groupedNav[g].map(item => <NavBtn key={item.id} item={item} active={active} setActive={setActive} />)}
            </div>
          ))}
        </nav>

        {/* User + server info */}
        <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#5865F2,#3a4299)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>👤</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: '11px', color: C.muted }}>AmeretaVerse</div>
            </div>
          </div>
          <button onClick={() => setLoggedIn(false)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', fontSize: '12px', fontFamily: 'Sora, sans-serif', padding: 0,
          }}>Logout →</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 40px', borderBottom: `1px solid ${C.border}`,
          background: 'rgba(0,0,0,0.2)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <ServerSelector server={server} onSelect={setServer} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://discord.gg/zueuN7xmWx"
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)',
                color: '#7289da', textDecoration: 'none',
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.1)'}
            >
              <span>💬</span> AmeretaVerse Discord
            </a>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: '960px' }}>
          {PAGES[active]}
        </div>
      </main>
    </div>
  );
};

const NavBtn = ({ item, active, setActive }) => (
  <button
    onClick={() => setActive(item.id)}
    style={{
      width: '100%',
      background: active === item.id ? 'rgba(200,168,78,0.1)' : 'transparent',
      border: `1px solid ${active === item.id ? 'rgba(200,168,78,0.2)' : 'transparent'}`,
      borderRadius: '8px', color: active === item.id ? C.gold : 'rgba(255,255,255,0.55)',
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', cursor: 'pointer', fontSize: '13px',
      fontWeight: active === item.id ? 600 : 400,
      marginBottom: '2px', fontFamily: 'Sora, sans-serif',
      transition: 'all 0.15s', textAlign: 'left',
    }}
    onMouseOver={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseOut={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
    {item.label}
  </button>
);

export default Dashboard;
