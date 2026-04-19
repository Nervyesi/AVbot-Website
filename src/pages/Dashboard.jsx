import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Analytics from './Analytics';
import { DashboardContext } from '../DashboardContext';
import {
  loginWithDiscord, fetchMe, fetchServers, fetchServerStats,
  fetchServerAnalytics, fetchProtectionLog, clearToken, getToken, setToken,
} from '../api';
import { DISCORD_INVITE_URL } from '../constants';

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  gold:        '#C8A84E',
  goldDark:    '#94730D',
  bg:          '#0A0A0F',
  surface:     'rgba(255,255,255,0.03)',
  border:      'rgba(200,168,78,0.12)',
  borderHover: 'rgba(200,168,78,0.35)',
  muted:       'rgba(255,255,255,0.45)',
  subtle:      'rgba(255,255,255,0.06)',
  green:       '#3ba55c',
  red:         '#ed4245',
  blue:        '#5865F2',
  orange:      '#FF8C42',
};

const ADD_SERVER_ENTRY = { id: 'add', name: 'Add a server…', icon: '+', members: null };

// ── UI primitives ──────────────────────────────────────────────────────────────

const Card = ({ children, style }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '14px', padding: '24px', ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    color: C.muted, fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '18px 14px 6px',
  }}>{children}</div>
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
      transition: 'border-color 0.2s', boxSizing: 'border-box', ...style,
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
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', marginBottom: '18px' }}>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <Label hint={hint}>{label}</Label>
    {children}
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

const ActionBar = ({ saved, onSave, onSend, sendLabel = 'Send Message' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
    <button onClick={onSave} className="btn-primary" style={{ padding: '11px 28px', fontSize: '14px' }}>
      {saved ? '✓  Saved' : 'Save Changes'}
    </button>
    {onSend && (
      <button
        onClick={onSend}
        style={{
          background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)',
          color: '#7289da', padding: '11px 24px', borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600,
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.25)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.12)'}
      >
        📨 {sendLabel}
      </button>
    )}
    {saved && <span style={{ color: C.green, fontSize: '13px' }}>Settings saved successfully.</span>}
  </div>
);

// ── Live-data placeholder ─────────────────────────────────────────────────────

const LivePending = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px' }}>
    <div style={{
      width: '7px', height: '7px', borderRadius: '50%',
      background: 'rgba(200,168,78,0.5)',
      animation: 'avpulse 2s ease-in-out infinite',
    }} />
    Connect bot to see live data
    <style>{`@keyframes avpulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}`}</style>
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
        <LivePending />
      </div>
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
      }}>{icon}</div>
    </div>
  </div>
);

// ── Overview stat card ────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, sub, subColor = C.green }) => (
  <div
    style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: '14px', padding: '22px', transition: 'border-color 0.2s',
    }}
    onMouseOver={e => e.currentTarget.style.borderColor = C.borderHover}
    onMouseOut={e => e.currentTarget.style.borderColor = C.border}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', marginTop: '6px', color: subColor }}>{sub}</div>}
      </div>
      <div style={{
        width: '42px', height: '42px', borderRadius: '10px',
        background: 'rgba(200,168,78,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px',
      }}>{icon}</div>
    </div>
  </div>
);

// ── Overview ──────────────────────────────────────────────────────────────────

const Overview = () => {
  const { server } = useContext(DashboardContext);
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    Promise.all([
      fetchServerStats(server.id).catch(() => null),
      fetchServerAnalytics(server.id).catch(() => null),
    ]).then(([s, a]) => { setStats(s); setAnalytics(a); setLoading(false); });
  }, [server?.id]);

  const memberGrowth30d = analytics?.member_growth_30d ?? analytics?.joins_30d ?? null;
  const totalMessages   = analytics?.total_messages ?? analytics?.messages_30d ?? null;

  const cards = [
    { label: 'Total Members',              icon: '👥', val: stats?.member_count?.toLocaleString(),     sub: null },
    { label: 'Active Members',             icon: '🟢', val: stats?.online_count?.toLocaleString(),      sub: 'online now' },
    { label: 'Member Growth (30 days)',    icon: '📈', val: memberGrowth30d != null ? `+${memberGrowth30d.toLocaleString()}` : null, sub: 'net joins' },
    { label: 'Total Messages',             icon: '💬', val: totalMessages?.toLocaleString(),            sub: 'all time' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Overview</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
          {server?.name ?? 'Select a server above'}
          {loading ? ' · Loading…' : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px' }}>
        {cards.map(card =>
          card.val != null
            ? <StatCard key={card.label} label={card.label} icon={card.icon} value={card.val} sub={card.sub} />
            : <LiveCard key={card.label} label={card.label} icon={card.icon} />
        )}
      </div>
    </div>
  );
};

// ── Verification ──────────────────────────────────────────────────────────────

const VerificationSettings = () => {
  const [v, setV] = useState({
    enabled: true, channel: '#verify', role: 'Verified Member',
    verifyMessage: 'Welcome to AmeretaVerse! Complete the captcha below to unlock all channels.',
    successMessage: 'You\'re verified! Welcome to the server.',
    maxAttempts: '3',
    dmOnVerify: false,
    dmMessage: 'You\'ve been verified in AmeretaVerse! Check out the channels and introduce yourself.',
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🔐" title="Verification" badge="MODULE" desc="Configure how new members verify when they first join." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Verification"
          desc="Require members to complete a captcha before accessing the server." />
      </SettingsCard>

      {v.enabled && (
        <>
          <SettingsCard title="Channel & Role">
            <FieldRow>
              <Field label="Verification Channel" hint="name or ID">
                <Input value={v.channel} onChange={set('channel')} placeholder="#verify" />
              </Field>
              <Field label="Role Reward" hint="granted after passing">
                <Input value={v.role} onChange={set('role')} placeholder="Verified Member" />
              </Field>
            </FieldRow>
          </SettingsCard>

          <SettingsCard title="Messages">
            <Field label="Verify Message" hint="shown in the embed">
              <Textarea value={v.verifyMessage} onChange={set('verifyMessage')} rows={2}
                placeholder="Welcome! Complete the captcha to get access." />
            </Field>
            <div style={{ marginTop: '16px' }}>
              <Field label="Success Message" hint="shown after passing">
                <Textarea value={v.successMessage} onChange={set('successMessage')} rows={2}
                  placeholder="You're verified! Welcome." />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard title="Limits">
            <Field label="Max Attempts" hint="before action is taken" style={{ maxWidth: '200px' }}>
              <Input type="number" value={v.maxAttempts} onChange={set('maxAttempts')} placeholder="3" style={{ maxWidth: '160px' }} />
            </Field>
          </SettingsCard>

          <SettingsCard title="DM on Verify">
            <Toggle value={v.dmOnVerify} onChange={set('dmOnVerify')} label="Send DM on Verification"
              desc="Send the member a direct message when they successfully verify." />
            {v.dmOnVerify && (
              <div style={{ marginTop: '14px' }}>
                <Field label="DM Message">
                  <Textarea value={v.dmMessage} onChange={set('dmMessage')} rows={3}
                    placeholder="You've been verified! Welcome to the server." />
                </Field>
              </div>
            )}
          </SettingsCard>
        </>
      )}

      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Role Selection ────────────────────────────────────────────────────────────

const defaultEmbed = () => ({
  id: Date.now(),
  channel: '#roles',
  giveOnly: false,
  confirmationEnabled: false,
  confirmationText: 'Your role has been updated!',
  dmEnabled: false,
  dmText: 'Your role selection has been updated.',
  roles: [
    { id: 1, name: 'Creator',   emoji: '🎨' },
    { id: 2, name: 'Community', emoji: '👥' },
  ],
});

const EmbedEditor = ({ embed, onChange, onSend, onDelete, index }) => {
  const set = k => val => onChange({ ...embed, [k]: val });
  const updateRole = (id, field, val) => onChange({
    ...embed, roles: embed.roles.map(r => r.id === id ? { ...r, [field]: val } : r),
  });
  const removeRole = id => onChange({ ...embed, roles: embed.roles.filter(r => r.id !== id) });
  const addRole = () => onChange({
    ...embed, roles: [...embed.roles, { id: Date.now(), name: 'New Role', emoji: '✨' }],
  });

  return (
    <Card style={{ marginBottom: '16px', border: `1px solid rgba(200,168,78,0.18)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Embed #{index + 1}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onSend} style={{
            background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)',
            color: '#7289da', padding: '6px 14px', borderRadius: '6px',
            cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600,
          }}>📨 Send Message</button>
          <button onClick={onDelete} style={{
            background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '14px', padding: '4px 8px',
          }}>× Remove</button>
        </div>
      </div>

      <FieldRow>
        <Field label="Channel" hint="name or ID">
          <Input value={embed.channel} onChange={set('channel')} placeholder="#roles" />
        </Field>
        <Field label="Mode">
          <Select value={embed.giveOnly ? 'give' : 'toggle'} onChange={v => set('giveOnly')(v === 'give')} options={[
            { value: 'toggle', label: 'Give & Remove (toggle)' },
            { value: 'give',   label: 'Give Only' },
          ]} />
        </Field>
      </FieldRow>

      <div style={{ marginBottom: '14px' }}>
        <Label>Roles</Label>
        {embed.roles.map(r => (
          <div key={r.id} style={{
            display: 'grid', gridTemplateColumns: '36px 1fr auto',
            gap: '8px', alignItems: 'center', marginBottom: '8px',
          }}>
            <input
              value={r.emoji}
              onChange={e => updateRole(r.id, 'emoji', e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '16px',
                fontFamily: 'Sora, sans-serif', outline: 'none', textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
            <input
              value={r.name}
              onChange={e => updateRole(r.id, 'name', e.target.value)}
              placeholder="Role name or ID"
              style={{
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '9px 12px', color: '#fff',
                fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button onClick={() => removeRole(r.id)} style={{
              background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 8px',
            }}>×</button>
          </div>
        ))}
        <button onClick={addRole} style={{
          marginTop: '4px', background: 'rgba(200,168,78,0.08)',
          border: '1px dashed rgba(200,168,78,0.3)', color: C.gold,
          padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
          fontFamily: 'Sora, sans-serif', fontSize: '12px',
        }}>+ Add Role</button>
      </div>

      <Toggle value={embed.confirmationEnabled} onChange={set('confirmationEnabled')}
        label="Confirmation Message" desc="Show an ephemeral message when role is applied." />
      {embed.confirmationEnabled && (
        <div style={{ marginBottom: '14px' }}>
          <Textarea value={embed.confirmationText} onChange={set('confirmationText')} rows={2} placeholder="Your role has been updated!" />
        </div>
      )}

      <Toggle value={embed.dmEnabled} onChange={set('dmEnabled')}
        label="DM After Action" desc="Send a DM when a role is given or removed." />
      {embed.dmEnabled && (
        <div style={{ marginTop: '8px' }}>
          <Textarea value={embed.dmText} onChange={set('dmText')} rows={2} placeholder="Your role selection has been updated." />
        </div>
      )}
    </Card>
  );
};

const RoleSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [embeds, setEmbeds] = useState([defaultEmbed()]);
  const [saved, save] = useSave();

  const updateEmbed = (id, data) => setEmbeds(prev => prev.map(e => e.id === id ? data : e));
  const deleteEmbed = id => setEmbeds(prev => prev.filter(e => e.id !== id));

  return (
    <div>
      <PageHeader icon="🎭" title="Role Selection" badge="MODULE" desc="Create role selection embeds — each embed has its own channel and role set." />
      <SettingsCard title="Module">
        <Toggle value={enabled} onChange={setEnabled} label="Enable Role Selection" />
      </SettingsCard>

      {enabled && (
        <>
          {embeds.map((embed, i) => (
            <EmbedEditor
              key={embed.id}
              embed={embed}
              index={i}
              onChange={data => updateEmbed(embed.id, data)}
              onSend={() => {}}
              onDelete={() => deleteEmbed(embed.id)}
            />
          ))}
          <button
            onClick={() => setEmbeds(prev => [...prev, defaultEmbed()])}
            style={{
              width: '100%', background: 'rgba(200,168,78,0.04)',
              border: '1px dashed rgba(200,168,78,0.25)', color: C.gold,
              padding: '12px', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600,
              marginBottom: '4px',
            }}
          >+ Create New Embed</button>
        </>
      )}

      <ActionBar saved={saved} onSave={save} />
    </div>
  );
};

// ── Forms (renamed from Creator Ticket) ──────────────────────────────────────

const FormsSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    formName: 'Creator Application',
    channel: '#apply',
    category: 'Creator Applications',
    reviewRole: 'Admins',
    approveMsg: 'Congratulations! Your application has been approved. Welcome to the program.',
    rejectMsg: 'Thank you for applying. Unfortunately your application does not meet our current requirements.',
    dmOnApprove: true,
    dmApproveMsg: 'Your application was approved! You\'ll get access shortly.',
    dmOnReject: false,
    dmRejectMsg: 'Your application was not approved this time. You may reapply in 30 days.',
    fields: [
      { id: 1, name: 'Name / Display Name',   minLen: '2',  maxLen: '50',  required: true },
      { id: 2, name: 'X (Twitter) Profile',   minLen: '5',  maxLen: '100', required: true },
      { id: 3, name: 'Follower Count',         minLen: '1',  maxLen: '20',  required: true },
      { id: 4, name: 'Niche & About',          minLen: '20', maxLen: '500', required: true },
      { id: 5, name: 'Engagement Score',       minLen: '1',  maxLen: '20',  required: false },
    ],
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const updateField = (id, key, val) => setV(p => ({
    ...p, fields: p.fields.map(f => f.id === id ? { ...f, [key]: val } : f),
  }));
  const removeField = id => setV(p => ({ ...p, fields: p.fields.filter(f => f.id !== id) }));
  const addField = () => setV(p => ({
    ...p, fields: [...p.fields, { id: Date.now(), name: 'New Field', minLen: '1', maxLen: '200', required: false }],
  }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="📋" title="Forms" badge="MODULE" desc="Build custom application forms with configurable fields and approval messages." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Forms" />
      </SettingsCard>

      {v.enabled && (
        <>
          <SettingsCard title="Form Setup">
            <FieldRow>
              <Field label="Form Name">
                <Input value={v.formName} onChange={set('formName')} placeholder="Creator Application" />
              </Field>
              <Field label="Button Channel" hint="where the Apply button is posted">
                <Input value={v.channel} onChange={set('channel')} placeholder="#apply" />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Ticket Category" hint="Discord category for form threads">
                <Input value={v.category} onChange={set('category')} placeholder="Creator Applications" />
              </Field>
              <Field label="Reviewer Role" hint="who can approve / reject">
                <Input value={v.reviewRole} onChange={set('reviewRole')} placeholder="Admins" />
              </Field>
            </FieldRow>
          </SettingsCard>

          <SettingsCard title="Form Fields">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 32px', gap: '8px', marginBottom: '6px' }}>
              {['Field Name', 'Min', 'Max', 'Required', ''].map((h, i) => (
                <div key={i} style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {v.fields.map(f => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px 32px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  value={f.name}
                  onChange={e => updateField(f.id, 'name', e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px', padding: '8px 10px', color: '#fff',
                    fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none',
                  }}
                />
                <input type="number" value={f.minLen} onChange={e => updateField(f.id, 'minLen', e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" value={f.maxLen} onChange={e => updateField(f.id, 'maxLen', e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    onClick={() => updateField(f.id, 'required', !f.required)}
                    style={{
                      width: '36px', height: '20px', borderRadius: '100px',
                      background: f.required ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '2px', left: f.required ? '18px' : '2px',
                      width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ fontSize: '11px', color: C.muted }}>{f.required ? 'Yes' : 'No'}</span>
                </div>
                <button onClick={() => removeField(f.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            ))}
            <button onClick={addField} style={{
              marginTop: '8px', background: 'rgba(200,168,78,0.08)',
              border: '1px dashed rgba(200,168,78,0.3)', color: C.gold,
              padding: '7px 14px', borderRadius: '7px', cursor: 'pointer',
              fontFamily: 'Sora, sans-serif', fontSize: '12px',
            }}>+ Add Field</button>
          </SettingsCard>

          <SettingsCard title="Approval Messages">
            <Field label="Approve Message" hint="shown in form channel">
              <Textarea value={v.approveMsg} onChange={set('approveMsg')} rows={2} />
            </Field>
            <div style={{ marginTop: '14px' }}>
              <Field label="Reject Message" hint="shown in form channel">
                <Textarea value={v.rejectMsg} onChange={set('rejectMsg')} rows={2} />
              </Field>
            </div>
          </SettingsCard>

          <SettingsCard title="DM Notifications">
            <Toggle value={v.dmOnApprove} onChange={set('dmOnApprove')} label="DM on Approve" />
            {v.dmOnApprove && (
              <div style={{ marginBottom: '14px' }}>
                <Textarea value={v.dmApproveMsg} onChange={set('dmApproveMsg')} rows={2} placeholder="Your application was approved!" />
              </div>
            )}
            <Toggle value={v.dmOnReject} onChange={set('dmOnReject')} label="DM on Reject" />
            {v.dmOnReject && (
              <div style={{ marginTop: '8px' }}>
                <Textarea value={v.dmRejectMsg} onChange={set('dmRejectMsg')} rows={2} placeholder="Your application was not approved this time." />
              </div>
            )}
          </SettingsCard>
        </>
      )}

      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Tickets (NEW) ─────────────────────────────────────────────────────────────

const TicketsSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    channel: '#support',
    category: 'Support Tickets',
    openRoles: 'everyone',
    seeRoles: 'Support Team',
    respondRoles: 'Support Team',
    pingRole: 'Support Team',
    welcomeMessage: 'Thanks for opening a ticket! A support team member will be with you shortly. Please describe your issue in detail.',
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🎫" title="Tickets" badge="MODULE" desc="Standard support ticket system — let members open support threads with one click." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Tickets" />
      </SettingsCard>

      {v.enabled && (
        <>
          <SettingsCard title="Channels">
            <FieldRow>
              <Field label="Button Channel" hint="where the Open Ticket button is posted">
                <Input value={v.channel} onChange={set('channel')} placeholder="#support" />
              </Field>
              <Field label="Ticket Category" hint="Discord category for ticket threads">
                <Input value={v.category} onChange={set('category')} placeholder="Support Tickets" />
              </Field>
            </FieldRow>
          </SettingsCard>

          <SettingsCard title="Roles & Permissions">
            <FieldRow>
              <Field label="Who Can Open Tickets" hint="role name, ID, or 'everyone'">
                <Input value={v.openRoles} onChange={set('openRoles')} placeholder="everyone" />
              </Field>
              <Field label="Who Can See Tickets" hint="role name or ID">
                <Input value={v.seeRoles} onChange={set('seeRoles')} placeholder="Support Team" />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Who Can Respond" hint="role name or ID">
                <Input value={v.respondRoles} onChange={set('respondRoles')} placeholder="Support Team" />
              </Field>
              <Field label="Ping Role on New Ticket" hint="leave blank to disable">
                <Input value={v.pingRole} onChange={set('pingRole')} placeholder="Support Team" />
              </Field>
            </FieldRow>
          </SettingsCard>

          <SettingsCard title="Welcome Message">
            <Field label="Message sent when a ticket is opened">
              <Textarea value={v.welcomeMessage} onChange={set('welcomeMessage')} rows={4}
                placeholder="Thanks for opening a ticket! A support member will be with you shortly." />
            </Field>
          </SettingsCard>
        </>
      )}

      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Raid Settings ─────────────────────────────────────────────────────────────

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
        {v.enabled && (
          <Toggle value={v.proofRequired} onChange={set('proofRequired')} label="Require Screenshot Proof"
            desc="Members must upload proof before points are awarded." />
        )}
      </SettingsCard>

      {v.enabled && (
        <>
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
        </>
      )}

      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Deploy Raid Post" />
    </div>
  );
};

// ── Engage Settings ───────────────────────────────────────────────────────────

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
        {v.enabled && (
          <Toggle value={v.autoReset} onChange={set('autoReset')} label="Auto-Reset Pool Daily"
            desc="Clears stale tweets every 24 hours and resets daily limits." />
        )}
      </SettingsCard>

      {v.enabled && (
        <>
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
            <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>Points earned = base × weight for each action type.</p>
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
        </>
      )}

      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Protection Settings ───────────────────────────────────────────────────────

const ProtectionSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    linkDetection:      true,
    linkWhitelist:      'twitter.com, x.com, discord.gg, youtube.com',
    spamDetection:      true,
    spamThreshold:      '5',
    spamWindow:         '10',
    muteRole:           'Muted',
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
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🛡️" title="Protection" badge="MODULE"
        desc="Automated protection: link filtering, spam control, phishing detection, and anti-raid." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Protection" />
      </SettingsCard>

      {v.enabled && (
        <>
          <SettingsCard title="Link Detection">
            <Toggle value={v.linkDetection} onChange={set('linkDetection')}
              label="Enable Link Detection"
              desc="Auto-delete messages containing URLs not on the whitelist." />
            {v.linkDetection && (
              <div style={{ marginTop: '14px' }}>
                <Field label="Allowed Domains" hint="comma-separated whitelist">
                  <Input value={v.linkWhitelist} onChange={set('linkWhitelist')} placeholder="twitter.com, x.com, discord.gg" />
                </Field>
              </div>
            )}
          </SettingsCard>

          <SettingsCard title="Phishing Detection">
            <Toggle value={v.phishingDetection} onChange={set('phishingDetection')}
              label="Enable Phishing Detection"
              desc="Block and delete messages containing known phishing domains. Users receive a DM warning." />
          </SettingsCard>

          <SettingsCard title="Spam Detection">
            <Toggle value={v.spamDetection} onChange={set('spamDetection')}
              label="Enable Spam Detection"
              desc="Automatically mute users who send too many messages in a short window." />
            {v.spamDetection && (
              <>
                <FieldRow style={{ marginTop: '14px' }}>
                  <Field label="Message Threshold" hint="per window">
                    <Input type="number" value={v.spamThreshold} onChange={set('spamThreshold')} placeholder="5" />
                  </Field>
                  <Field label="Time Window (seconds)">
                    <Input type="number" value={v.spamWindow} onChange={set('spamWindow')} placeholder="10" />
                  </Field>
                </FieldRow>
                <Field label="Mute Role Name" hint="created automatically if missing">
                  <Input value={v.muteRole} onChange={set('muteRole')} placeholder="Muted" style={{ maxWidth: '240px' }} />
                </Field>
              </>
            )}
          </SettingsCard>

          <SettingsCard title="Suspicious User Detection">
            <Toggle value={v.suspiciousUsers} onChange={set('suspiciousUsers')}
              label="Enable Suspicious User Detection"
              desc="Flag users on join based on account age, default avatar, and scam keywords in name." />
            {v.suspiciousUsers && (
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
            )}
          </SettingsCard>

          <SettingsCard title="Anti-Raid">
            <Toggle value={v.antiRaid} onChange={set('antiRaid')}
              label="Enable Anti-Raid"
              desc="If a burst of users join at once, all invites are paused and admins are pinged." />
            {v.antiRaid && (
              <FieldRow style={{ marginTop: '14px' }}>
                <Field label="Join Threshold" hint="users to trigger lockdown">
                  <Input type="number" value={v.antiRaidThreshold} onChange={set('antiRaidThreshold')} placeholder="10" />
                </Field>
                <Field label="Time Window (seconds)">
                  <Input type="number" value={v.antiRaidWindow} onChange={set('antiRaidWindow')} placeholder="60" />
                </Field>
              </FieldRow>
            )}
          </SettingsCard>

          <SettingsCard title="Banned Words Filter">
            <Toggle value={v.bannedWords} onChange={set('bannedWords')}
              label="Enable Banned Words Filter"
              desc="Auto-delete messages containing any of the words in the list below." />
            {v.bannedWords && (
              <div style={{ marginTop: '14px' }}>
                <Field label="Banned Words" hint="comma-separated">
                  <Textarea value={v.bannedWordsList} onChange={set('bannedWordsList')} rows={3} placeholder="word1, word2, word3" />
                </Field>
              </div>
            )}
          </SettingsCard>

          <SettingsCard title="Logging">
            <Field label="Mod Log Channel" hint="all protection actions are posted here">
              <Input value={v.logChannel} onChange={set('logChannel')} placeholder="mod-log" style={{ maxWidth: '240px' }} />
            </Field>
          </SettingsCard>
        </>
      )}

      <ActionBar saved={saved} onSave={save} />
    </div>
  );
};

// ── Admin Panel pages ─────────────────────────────────────────────────────────

const FLAG_SOURCES = {
  raid:       { label: 'Raid',       color: C.gold },
  engage:     { label: 'Engage',     color: C.orange },
  protection: { label: 'Protection', color: C.red },
};

const MOCK_FLAGS = [
  { id: 1, user: 'sc4m_acc#0001',   source: 'protection', reason: 'Suspicious account on join — age 2d, default avatar', time: '2h ago' },
  { id: 2, user: 'raid_cheat#1234', source: 'raid',       reason: 'Submitted raid proof without completing engagement', time: '4h ago' },
  { id: 3, user: 'spam_bot#9999',   source: 'protection', reason: 'Spam mute triggered — 12 messages in 8 seconds', time: '6h ago' },
  { id: 4, user: 'fake_eng#5678',   source: 'engage',     reason: 'Submitted link with fewer than minimum followers', time: '1d ago' },
  { id: 5, user: 'phish_link#2222', source: 'protection', reason: 'Phishing domain detected in #general', time: '1d ago' },
];

const FlaggedUsers = () => {
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [filter, setFilter] = useState('all');

  const dismiss = id => setFlags(prev => prev.filter(f => f.id !== id));
  const visible = filter === 'all' ? flags : flags.filter(f => f.source === filter);

  const ActionBtn = ({ color, label, onClick }) => (
    <button onClick={onClick} style={{
      background: `${color}14`, border: `1px solid ${color}40`, color,
      padding: '5px 10px', borderRadius: '6px', cursor: 'pointer',
      fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600,
      transition: 'background 0.15s',
    }}>{label}</button>
  );

  return (
    <div>
      <PageHeader icon="🚩" title="Flagged Users" desc="All flagged users from Raid, Engage, and Protection modules." />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'raid', 'engage', 'protection'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'rgba(200,168,78,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filter === f ? 'rgba(200,168,78,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === f ? C.gold : C.muted,
            padding: '6px 14px', borderRadius: '7px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600,
            textTransform: 'capitalize',
          }}>{f === 'all' ? 'All Sources' : f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: C.muted, alignSelf: 'center' }}>{visible.length} entries</span>
      </div>

      {visible.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '14px' }}>No flagged users</div>
        </Card>
      ) : (
        <Card style={{ padding: '0' }}>
          {visible.map((flag, i) => {
            const src = FLAG_SOURCES[flag.source];
            return (
              <div key={flag.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 24px',
                borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: `${src.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}>🚩</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{flag.user}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                      background: `${src.color}18`, color: src.color, border: `1px solid ${src.color}30`,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{src.label}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {flag.reason}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginRight: '8px' }}>{flag.time}</div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <ActionBtn color={C.muted} label="Dismiss" onClick={() => dismiss(flag.id)} />
                  <ActionBtn color={C.orange} label="Warn" onClick={() => {}} />
                  <ActionBtn color={C.gold}   label="Kick"  onClick={() => {}} />
                  <ActionBtn color={C.red}    label="Ban"   onClick={() => {}} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

const MOCK_MOD_LOG = [
  { id: 1, action: 'Message Deleted',    module: 'Link Detection',    target: '@scammer_x',     mod: 'Bot', detail: 'URL not in whitelist: shady-nft.xyz', time: '2m ago',  color: C.red },
  { id: 2, action: 'Spam Mute Applied',  module: 'Spam Detection',    target: '@spambot_99',    mod: 'Bot', detail: '12 messages in 8 seconds', time: '14m ago', color: C.orange },
  { id: 3, action: 'Phishing Deleted',   module: 'Phishing',          target: '@phish_acc',     mod: 'Bot', detail: 'Known phishing domain detected', time: '32m ago', color: C.red },
  { id: 4, action: 'User Flagged',       module: 'Suspicious Users',  target: '@new_joiner#001',mod: 'Bot', detail: 'Account 2 days old, default avatar', time: '1h ago',  color: C.orange },
  { id: 5, action: 'Anti-Raid Lockdown', module: 'Anti-Raid',         target: 'Server',         mod: 'Bot', detail: '15 joins in 45 seconds, invites paused', time: '4h ago',  color: C.red },
  { id: 6, action: 'Banned Word Hit',    module: 'Banned Words',      target: '@user#5678',     mod: 'Bot', detail: 'Word "scam" matched in #general', time: '6h ago',  color: C.orange },
];

const ModLog = () => {
  const { server } = useContext(DashboardContext);
  const [log] = useState(MOCK_MOD_LOG);
  const [filter, setFilter] = useState('all');
  const [apiLog, setApiLog] = useState(null);

  useEffect(() => {
    if (!server?.id) return;
    fetchProtectionLog(server.id, 50).then(setApiLog).catch(() => {});
  }, [server?.id]);

  const modules = ['all', 'Link Detection', 'Spam Detection', 'Phishing', 'Suspicious Users', 'Anti-Raid', 'Banned Words'];
  const entries = apiLog ?? log;
  const visible = filter === 'all' ? entries : entries.filter(e => e.module === filter);

  return (
    <div>
      <PageHeader icon="📝" title="Mod Log" desc="All protection actions taken by the bot." />

      {!apiLog && (
        <div style={{
          background: 'rgba(200,168,78,0.06)', border: `1px solid rgba(200,168,78,0.2)`,
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          fontSize: '12px', color: C.muted, display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <LivePending />
          <span style={{ marginLeft: '4px' }}>Showing demo data — connect bot for live logs</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {modules.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{
            background: filter === m ? 'rgba(200,168,78,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filter === m ? 'rgba(200,168,78,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === m ? C.gold : C.muted,
            padding: '5px 12px', borderRadius: '7px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600,
          }}>{m === 'all' ? 'All' : m}</button>
        ))}
      </div>

      <Card style={{ padding: '0' }}>
        {visible.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '14px' }}>No entries found</div>
        ) : visible.map((entry, i) => (
          <div key={entry.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 22px',
            borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: entry.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{entry.action}</span>
                <span style={{ fontSize: '11px', color: C.muted, padding: '1px 7px', borderRadius: '100px', background: C.subtle }}>
                  {entry.module}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: C.muted }}>
                {entry.target} · {entry.detail}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{entry.time}</div>
          </div>
        ))}
      </Card>
    </div>
  );
};

const MOCK_AUDIT = [
  { id: 1, action: 'Config Saved',        module: 'Verification',   user: 'Nervyesi', detail: 'Updated verification channel to #verify-new', time: '10m ago' },
  { id: 2, action: 'Message Sent',        module: 'Role Selection', user: 'Nervyesi', detail: 'Deployed role embed to #roles', time: '1h ago' },
  { id: 3, action: 'Config Saved',        module: 'Protection',     user: 'Nervyesi', detail: 'Added "scam" to banned words list', time: '2h ago' },
  { id: 4, action: 'Role Given',          module: 'Role Selection', user: 'Bot',       detail: '@member selected Creator role', time: '3h ago' },
  { id: 5, action: 'Ticket Opened',       module: 'Tickets',        user: 'Bot',       detail: '@community opened ticket #0042', time: '5h ago' },
  { id: 6, action: 'Form Submitted',      module: 'Forms',          user: 'Bot',       detail: 'Creator application #0063 submitted by @creator_x', time: '8h ago' },
  { id: 7, action: 'Application Approved',module: 'Forms',          user: 'Nervyesi', detail: 'Approved creator application #0062', time: '12h ago' },
];

const AuditLog = () => {
  return (
    <div>
      <PageHeader icon="📋" title="Audit Log" desc="All bot actions — config changes, message sends, role changes, and more." />

      <div style={{
        background: 'rgba(200,168,78,0.06)', border: `1px solid rgba(200,168,78,0.2)`,
        borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
        fontSize: '12px', color: C.muted, display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <LivePending />
        <span style={{ marginLeft: '4px' }}>Showing demo data — connect bot for live audit log</span>
      </div>

      <Card style={{ padding: '0' }}>
        {MOCK_AUDIT.map((entry, i) => (
          <div key={entry.id} style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 22px',
            borderBottom: i < MOCK_AUDIT.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: 'rgba(200,168,78,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>📋</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{entry.action}</span>
                <span style={{ fontSize: '11px', color: C.muted, padding: '1px 7px', borderRadius: '100px', background: C.subtle }}>
                  {entry.module}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: C.muted }}>{entry.detail}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{entry.user}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{entry.time}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ── Server selector ───────────────────────────────────────────────────────────

const ServerSelector = ({ server, servers = [], onSelect }) => {
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
        <span style={{ fontSize: '10px', color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '200px',
          background: '#1a1a22', border: `1px solid ${C.border}`,
          borderRadius: '10px', overflow: 'hidden', zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          {[...servers, ADD_SERVER_ENTRY].map(s => (
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
              onMouseOut={e => { e.currentTarget.style.background = server.id === s.id ? 'rgba(200,168,78,0.08)' : 'transparent'; }}
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

// ── AI Help floating button ───────────────────────────────────────────────────

const AIHelpButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 100 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 12px)', right: 0,
          width: '340px',
          background: '#13131a', border: `1px solid ${C.border}`,
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg,#C8A84E,#94730D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              }}>🤖</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>AVbot AI Help</div>
                <div style={{ fontSize: '11px', color: C.muted }}>Ask anything about your bot setup</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '18px', lineHeight: 1,
            }}>×</button>
          </div>

          <div style={{ padding: '20px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: C.muted }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✨</div>
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                AI assistant coming soon!<br />
                We'll connect it up in the next update.
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything…"
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  padding: '9px 12px', color: '#fff', fontSize: '13px',
                  fontFamily: 'Sora, sans-serif', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button style={{
                background: `linear-gradient(135deg,${C.gold},${C.goldDark})`,
                border: 'none', borderRadius: '8px', padding: '9px 14px',
                color: '#0A0A0F', cursor: 'pointer', fontSize: '14px',
                fontFamily: 'Sora, sans-serif', fontWeight: 700,
              }}>↑</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: `linear-gradient(135deg,${C.gold},${C.goldDark})`,
          border: 'none', borderRadius: '100px', padding: '12px 20px',
          color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
          fontSize: '13px', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(200,168,78,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(200,168,78,0.45)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,168,78,0.35)'; }}
      >
        🤖 Need help?
      </button>
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'overview',    icon: '📊', label: 'Overview',      group: null },
  { id: 'analytics',  icon: '📈', label: 'Analytics',     group: null },

  { id: 'verification', icon: '🔐', label: 'Verification',   group: 'Settings' },
  { id: 'roles',        icon: '🎭', label: 'Role Selection', group: 'Settings' },
  { id: 'forms',        icon: '📋', label: 'Forms',          group: 'Settings' },
  { id: 'tickets',      icon: '🎫', label: 'Tickets',        group: 'Settings' },
  { id: 'raid',         icon: '⚔️', label: 'Raid',           group: 'Settings' },
  { id: 'engage',       icon: '🔄', label: 'Engage',         group: 'Settings' },
  { id: 'protection',   icon: '🛡️', label: 'Protection',     group: 'Settings' },

  { id: 'flagged',    icon: '🚩', label: 'Flagged Users', group: 'Admin Panel' },
  { id: 'modlog',     icon: '📝', label: 'Mod Log',       group: 'Admin Panel' },
  { id: 'auditlog',   icon: '📋', label: 'Audit Log',     group: 'Admin Panel' },
];

const PAGES = {
  overview:     <Overview />,
  analytics:    <Analytics />,
  verification: <VerificationSettings />,
  roles:        <RoleSettings />,
  forms:        <FormsSettings />,
  tickets:      <TicketsSettings />,
  raid:         <RaidSettings />,
  engage:       <EngageSettings />,
  protection:   <ProtectionSettings />,
  flagged:      <FlaggedUsers />,
  modlog:       <ModLog />,
  auditlog:     <AuditLog />,
};

// ── Dashboard shell ───────────────────────────────────────────────────────────

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

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [servers, setServers] = useState([]);
  const [server, setServer]   = useState(null);
  const [active, setActive]   = useState('overview');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      window.history.replaceState({}, '', '/dashboard');
    }
    if (!getToken()) { setAuthLoading(false); return; }
    fetchMe()
      .then(u => { setUser(u); return fetchServers(); })
      .then(list => { setServers(list); if (list.length) setServer(list[0]); })
      .catch(() => { clearToken(); })
      .finally(() => setAuthLoading(false));
  }, []);

  const logout = () => { clearToken(); setUser(null); setServers([]); setServer(null); };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Sora, sans-serif', color: C.muted, fontSize: '14px',
      }}>Loading…</div>
    );
  }

  if (!user) {
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
            onClick={loginWithDiscord}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
          >
            <span>💬</span> Login with Discord
          </button>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <a
              href={DISCORD_INVITE_URL}
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

  const groups = ['Settings', 'Admin Panel'];
  const groupedNav = {
    top:           NAV.filter(n => !n.group),
    Settings:      NAV.filter(n => n.group === 'Settings'),
    'Admin Panel': NAV.filter(n => n.group === 'Admin Panel'),
  };

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64`
    : null;

  return (
    <DashboardContext.Provider value={{ server, user }}>
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
            {groupedNav.top.map(item => <NavBtn key={item.id} item={item} active={active} setActive={setActive} />)}
            {groups.map(g => (
              <div key={g}>
                <SectionLabel>{g}</SectionLabel>
                {groupedNav[g].map(item => <NavBtn key={item.id} item={item} active={active} setActive={setActive} />)}
              </div>
            ))}
          </nav>

          <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                : <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#5865F2,#3a4299)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                  }}>👤</div>
              }
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</div>
                <div style={{ fontSize: '11px', color: C.muted }}>Discord</div>
              </div>
            </div>
            <button onClick={logout} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '12px', fontFamily: 'Sora, sans-serif', padding: 0,
            }}>Logout →</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 40px', borderBottom: `1px solid ${C.border}`,
            background: 'rgba(0,0,0,0.2)',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {server
              ? <ServerSelector server={server} servers={servers} onSelect={setServer} />
              : <span style={{ fontSize: '13px', color: C.muted }}>No servers found — add bot to a server first</span>
            }
            <a
              href={DISCORD_INVITE_URL}
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
              💬 AmeretaVerse Discord
            </a>
          </div>

          <div style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: '960px' }}>
            {PAGES[active]}
          </div>
        </main>

        <AIHelpButton />
      </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
