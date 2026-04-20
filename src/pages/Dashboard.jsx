import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Analytics from './Analytics';
import { DashboardContext } from '../DashboardContext';
import {
  loginWithDiscord, fetchMe, fetchServers, fetchServerStats,
  fetchServerAnalytics, fetchConfig, saveConfig,
  fetchProtectionLog, fetchFlaggedUsers, fetchAuditLog,
  clearToken, getToken, setToken,
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

const ADD_SERVER_ENTRY = { id: 'add', name: 'Add a server…', icon: null, members: null };

// ── Core UI primitives ────────────────────────────────────────────────────────

const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', ...style }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '18px 14px 6px' }}>
    {children}
  </div>
);

const PageHeader = ({ icon, title, desc, badge }) => (
  <div style={{ marginBottom: '32px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(200,168,78,0.1)', border: '1px solid rgba(200,168,78,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{icon}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h2>
          {badge && <span style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.3)', color: C.gold, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', letterSpacing: '0.06em' }}>{badge}</span>}
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
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', ...style }}
    onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
    onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
);

const Select = ({ value, onChange, options, style }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer', ...style }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Toggle = ({ value, onChange, label, desc }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{desc}</div>}
    </div>
    <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '100px', background: value ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
    </div>
  </div>
);

const FieldRow = ({ children, cols = 2, style }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', marginBottom: '18px', ...style }}>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div><Label hint={hint}>{label}</Label>{children}</div>
);

const SettingsCard = ({ title, children, style }) => (
  <Card style={{ marginBottom: '20px', ...style }}>
    {title && <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>{title}</div>}
    {children}
  </Card>
);

function useSave() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };
  return [saved, save];
}

// ── Config maps — maps form field key → config table key ─────────────────────
// Only keys that exist in DEFAULT_CONFIG are included here.

const ENGAGE_CONFIG_MAP = {
  linkLifetime:  'engage_link_lifetime_hours',
  pointsPerLink: 'engage_points_per_link',
  likeWeight:    'engage_weight_like',
  commentWeight: 'engage_weight_comment',
  retweetWeight: 'engage_weight_retweet',
  dailyLimit:    'engage_daily_limit',
  submitCost:    'engage_submit_cost',
};

const PROTECT_CONFIG_MAP = {
  linkEnabled:       'protection_link_detection',
  linkWhitelist:     'protection_link_whitelist',
  spamEnabled:       'protection_spam_detection',
  spamThreshold:     'protection_spam_threshold',
  spamWindow:        'protection_spam_window',
  suspEnabled:       'protection_suspicious_users',
  suspAction:        'protection_suspicious_action',
  suspAge:           'protection_suspicious_account_age',
  phishingEnabled:   'protection_phishing_detection',
  antiRaidEnabled:   'protection_anti_raid',
  antiRaidThreshold: 'protection_anti_raid_threshold',
  antiRaidWindow:    'protection_anti_raid_window',
  bannedEnabled:     'protection_banned_words',
  bannedList:        'protection_banned_words_list',
  logChannel:        'protection_log_channel',
};

const RAID_CONFIG_MAP = {
  likeWeight:    'engage_weight_like',
  commentWeight: 'engage_weight_comment',
  retweetWeight: 'engage_weight_retweet',
};

/**
 * useSaveConfig — load config on mount, save only changed keys on demand.
 * @param {string|number} serverId
 * @param {Object}        configMap   { formKey: configKey }
 * @param {Object}        formDefaults  initial form state (used to detect boolean fields)
 * @param {Function}      setForm     state setter from useState
 */
function useSaveConfig(serverId, configMap, formDefaults, setForm) {
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const configRef = useRef({});

  useEffect(() => {
    if (!serverId) return;
    fetchConfig(serverId)
      .then(cfg => {
        configRef.current = cfg;
        setForm(prev => {
          const updates = { ...prev };
          for (const [fk, ck] of Object.entries(configMap)) {
            if (cfg[ck] !== undefined) {
              updates[fk] = typeof formDefaults[fk] === 'boolean'
                ? cfg[ck] === '1'
                : cfg[ck];
            }
          }
          return updates;
        });
      })
      .catch(() => {}); // keep defaults on failure
  }, [serverId]); // eslint-disable-line

  const save = (currentValues) => {
    if (!serverId || saveState === 'saving') return;
    const cfg = configRef.current;
    const updates = {};
    for (const [fk, ck] of Object.entries(configMap)) {
      const cur = typeof currentValues[fk] === 'boolean'
        ? (currentValues[fk] ? '1' : '0')
        : String(currentValues[fk] ?? '');
      const prev = cfg[ck] !== undefined ? String(cfg[ck]) : null;
      if (prev === null || cur !== prev) updates[ck] = cur;
    }
    if (Object.keys(updates).length === 0) {
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
      return;
    }
    setSaveState('saving');
    saveConfig(serverId, updates)
      .then(() => {
        for (const [fk, ck] of Object.entries(configMap)) {
          configRef.current[ck] = typeof currentValues[fk] === 'boolean'
            ? (currentValues[fk] ? '1' : '0')
            : String(currentValues[fk] ?? '');
        }
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      })
      .catch(() => {
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      });
  };

  return { saveState, save };
}

const ActionBar = ({ saved, saveState: saveStateProp, onSave, onSend, sendLabel = 'Send Message' }) => {
  const s = saveStateProp ?? (saved ? 'saved' : 'idle');
  const btnText = s === 'saving' ? 'Saving…' : s === 'saved' ? '✓  Saved' : s === 'error' ? '✗  Error' : 'Save Changes';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px', flexWrap: 'wrap' }}>
      <button onClick={onSave} className="btn-primary"
        disabled={s === 'saving'}
        style={{ padding: '11px 28px', fontSize: '14px', opacity: s === 'saving' ? 0.7 : 1 }}>
        {btnText}
      </button>
      {onSend && (
        <button onClick={onSend}
          style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '11px 24px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.25)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.12)'}>
          📨 {sendLabel}
        </button>
      )}
      {s === 'saved' && <span style={{ color: C.green, fontSize: '13px' }}>Settings saved successfully.</span>}
      {s === 'error'  && <span style={{ color: C.red,   fontSize: '13px' }}>Save failed. Please try again.</span>}
    </div>
  );
};

// Indented sub-toggle used inside DM sections
const SubToggle = ({ value, onChange, label, desc, children }) => (
  <div style={{ marginLeft: '16px', borderLeft: `2px solid rgba(200,168,78,0.18)`, paddingLeft: '16px', marginTop: '6px' }}>
    <Toggle value={value} onChange={onChange} label={label} desc={desc} />
    {value && children && <div style={{ marginBottom: '8px' }}>{children}</div>}
  </div>
);

// Collapsible "Advanced Customization" card
const AdvancedSection = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ marginBottom: '20px' }}>
      <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Advanced Customization</div>
        <span style={{ color: C.muted, fontSize: '11px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {open && <div style={{ marginTop: '20px' }}>{children}</div>}
    </Card>
  );
};

// Action dropdown options
const ACTION_OPTS = [
  { value: 'flag',  label: 'Flag only — log to mod-log' },
  { value: 'warn',  label: 'Warn — send a warning message' },
  { value: 'mute',  label: 'Mute — apply mute role' },
  { value: 'kick',  label: 'Kick — remove from server' },
  { value: 'ban',   label: 'Ban — permanent removal' },
];
const DELETE_ACTION_OPTS = [
  { value: 'none',  label: 'Delete only — no further action' },
  { value: 'warn',  label: 'Delete + Warn' },
  { value: 'mute',  label: 'Delete + Mute' },
  { value: 'kick',  label: 'Delete + Kick' },
  { value: 'ban',   label: 'Delete + Ban' },
];

// ── Live-data placeholder ─────────────────────────────────────────────────────

const LivePending = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px' }}>
    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(200,168,78,0.5)', animation: 'avpulse 2s ease-in-out infinite' }} />
    Connect bot to see live data
    <style>{`@keyframes avpulse{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}`}</style>
  </div>
);

const LiveCard = ({ label, icon }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px 22px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>{label}</div>
        <LivePending />
      </div>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(200,168,78,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>{icon}</div>
    </div>
  </div>
);

// ── Overview ──────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon, sub }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px', transition: 'border-color 0.2s' }}
    onMouseOver={e => e.currentTarget.style.borderColor = C.borderHover}
    onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', marginTop: '6px', color: C.green }}>{sub}</div>}
      </div>
      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(200,168,78,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px' }}>{icon}</div>
    </div>
  </div>
);

const ServerIcon = ({ server, size = 48 }) => {
  const isUrl = server?.icon && (server.icon.startsWith('http') || server.icon.startsWith('//'));
  if (isUrl) return <img src={server.icon} alt="" style={{ width: size, height: size, borderRadius: size * 0.25, objectFit: 'cover' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, background: 'linear-gradient(135deg,#C8A84E,#94730D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 800, color: '#0A0A0F', flexShrink: 0 }}>
      {server?.name?.[0] ?? '?'}
    </div>
  );
};

const Overview = () => {
  const { server, servers, setServer } = useContext(DashboardContext);
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    setStats(null); setAnalytics(null);
    Promise.all([
      fetchServerStats(server.id).catch(() => null),
      fetchServerAnalytics(server.id).catch(() => null),
    ]).then(([s, a]) => { setStats(s); setAnalytics(a); setLoading(false); });
  }, [server?.id]);

  const growth30d      = analytics?.member_growth_30d ?? analytics?.joins_30d ?? null;
  const totalMessages  = analytics?.total_messages ?? analytics?.messages_total ?? null;

  const cards = [
    { label: 'Total Members',           icon: '👥', val: stats?.member_count?.toLocaleString() },
    { label: 'Active Members',          icon: '🟢', val: stats?.online_count?.toLocaleString(), sub: 'online now' },
    { label: 'Member Growth (30 days)', icon: '📈', val: growth30d != null ? `+${growth30d.toLocaleString()}` : null, sub: 'net joins' },
    { label: 'Total Messages',          icon: '💬', val: totalMessages?.toLocaleString() },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Overview</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
          {server?.name ?? 'Select a server'}{loading ? ' · Loading…' : ''}
        </p>
      </div>

      {/* ── 4 stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px', marginBottom: '32px' }}>
        {cards.map(c => c.val != null
          ? <StatCard key={c.label} label={c.label} icon={c.icon} value={c.val} sub={c.sub} />
          : <LiveCard key={c.label} label={c.label} icon={c.icon} />
        )}
      </div>

      {/* ── Server cards ── */}
      {servers.length > 0 && (
        <>
          <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Your Servers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: '12px' }}>
            {servers.map(s => {
              const active = server?.id === s.id;
              return (
                <div key={s.id} onClick={() => setServer(s)}
                  style={{ background: active ? 'rgba(200,168,78,0.1)' : C.surface, border: `1px solid ${active ? C.gold : C.border}`, borderRadius: '12px', padding: '16px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                  onMouseOver={e => { if (!active) e.currentTarget.style.borderColor = C.borderHover; }}
                  onMouseOut={e => { if (!active) e.currentTarget.style.borderColor = C.border; }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <ServerIcon server={s} size={44} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: active ? C.gold : '#fff' }}>{s.name}</div>
                  {s.members != null && <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{s.members.toLocaleString()}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Verification ──────────────────────────────────────────────────────────────

const VerificationSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    channel: '#verify',
    roles: 'Verified Member',
    mainMessage: 'Welcome to AmeretaVerse! Verify your account to unlock all channels.\n\nClick the button below to start the captcha.',
    // Advanced
    maxAttempts: '3',
    successMessage: '✅ You have been verified! Welcome to the server.',
    wrongAttemptMsg: '❌ Incorrect captcha. You have {remaining} attempts remaining.',
    lastChanceMsg: '⚠️ Last attempt! Solve this carefully or you will be removed.',
    kickedMessage: '🔒 You have been removed for failing verification too many times. Rejoin to try again.',
    // DM
    dmEnabled: false,
    dmOnSuccess: true,
    dmSuccessMsg: "You've been successfully verified in AmeretaVerse! Check out the channels and introduce yourself.",
    dmOnKick: true,
    dmKickMsg: "You've been removed from AmeretaVerse for failing verification. You're welcome to rejoin and try again.",
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🔐" title="Verification" badge="MODULE" desc="Configure captcha verification for new members." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Verification"
          desc="Require members to complete a captcha before accessing the server." />
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Channel & Roles">
          <FieldRow>
            <Field label="Verification Channel" hint="name or ID">
              <Input value={v.channel} onChange={set('channel')} placeholder="#verify or 123456789" />
            </Field>
            <Field label="Role Reward" hint="multiple allowed — comma separated">
              <Input value={v.roles} onChange={set('roles')} placeholder="Verified Member, Member" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Main Message">
          <Field label="Embed Message" hint="the embed members see with the Verify button">
            <Textarea value={v.mainMessage} onChange={set('mainMessage')} rows={4}
              placeholder="Welcome! Complete the captcha below to unlock all channels." />
          </Field>
        </SettingsCard>

        <AdvancedSection>
          <Field label="Max Attempts" hint="before member is kicked">
            <Input type="number" value={v.maxAttempts} onChange={set('maxAttempts')} placeholder="3" style={{ maxWidth: '120px' }} />
          </Field>
          <div style={{ marginTop: '18px' }}>
            <Field label="Success Message" hint="shown after correct captcha">
              <Textarea value={v.successMessage} onChange={set('successMessage')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Wrong Attempt Message" hint="use {remaining} for attempts left">
              <Textarea value={v.wrongAttemptMsg} onChange={set('wrongAttemptMsg')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Last Chance Message" hint="shown before the final attempt">
              <Textarea value={v.lastChanceMsg} onChange={set('lastChanceMsg')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Kicked Message" hint="shown in the channel when member is removed">
              <Textarea value={v.kickedMessage} onChange={set('kickedMessage')} rows={2} />
            </Field>
          </div>
        </AdvancedSection>

        <SettingsCard title="Direct Messages">
          <Toggle value={v.dmEnabled} onChange={set('dmEnabled')} label="Send DM?"
            desc="Send direct messages to members during verification events." />
          {v.dmEnabled && (<>
            <SubToggle value={v.dmOnSuccess} onChange={set('dmOnSuccess')} label="DM on success">
              <Textarea value={v.dmSuccessMsg} onChange={set('dmSuccessMsg')} rows={2}
                placeholder="You've been verified! Welcome to the server." />
            </SubToggle>
            <SubToggle value={v.dmOnKick} onChange={set('dmOnKick')} label="DM on kick">
              <Textarea value={v.dmKickMsg} onChange={set('dmKickMsg')} rows={2}
                placeholder="You've been removed for failing verification. Rejoin to try again." />
            </SubToggle>
          </>)}
        </SettingsCard>
      </>)}

      {/* TODO: wire in Phase 4-5 when config keys are added for verification */}
      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Role Selection ────────────────────────────────────────────────────────────

const mkEmbed = () => ({
  id: Date.now(),
  channel: '#roles',
  mainMessage: 'Select your roles below to unlock channels that match your interests.',
  giveOnly: false,
  confirmEnabled: false,
  confirmGetMsg: '✅ You\'ve been given the **{role}** role!',
  confirmRemoveMsg: '❌ The **{role}** role has been removed.',
  dmEnabled: false,
  dmOnGet: true,
  dmGetMsg: 'You\'ve been given the **{role}** role in **{server}**.',
  dmOnRemove: true,
  dmRemoveMsg: 'The **{role}** role has been removed in **{server}**.',
  roles: [
    { id: 1, emoji: '🎨', name: 'Creator',   label: 'Creator' },
    { id: 2, emoji: '👥', name: 'Community', label: 'Community' },
  ],
});

const EmbedEditor = ({ embed, onChange, onSend, onDelete, index }) => {
  const set = k => val => onChange({ ...embed, [k]: val });
  const updRole = (id, field, val) => onChange({ ...embed, roles: embed.roles.map(r => r.id === id ? { ...r, [field]: val } : r) });
  const delRole = id => onChange({ ...embed, roles: embed.roles.filter(r => r.id !== id) });
  const addRole = () => onChange({ ...embed, roles: [...embed.roles, { id: Date.now(), emoji: '✨', name: 'New Role', label: 'New Role' }] });

  const miniInput = (val, cb, placeholder) => (
    <input value={val} onChange={e => cb(e.target.value)} placeholder={placeholder}
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
  );

  return (
    <Card style={{ marginBottom: '16px', border: '1px solid rgba(200,168,78,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Embed #{index + 1}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSend} style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>📨 Send Message</button>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '14px', padding: '4px 8px' }}>× Remove</button>
        </div>
      </div>

      <FieldRow>
        <Field label="Channel" hint="name or ID"><Input value={embed.channel} onChange={set('channel')} placeholder="#roles or 123456789" /></Field>
        <Field label="Mode">
          <Select value={embed.giveOnly ? 'give' : 'toggle'} onChange={v => set('giveOnly')(v === 'give')} options={[
            { value: 'toggle', label: 'Give & Remove (toggle)' },
            { value: 'give',   label: 'Give Only' },
          ]} />
        </Field>
      </FieldRow>

      <Field label="Embed Message" hint="shown above the role buttons">
        <Textarea value={embed.mainMessage} onChange={set('mainMessage')} rows={2} placeholder="Select your roles below." />
      </Field>

      <div style={{ marginTop: '18px', marginBottom: '6px' }}>
        <Label>Roles</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr auto', gap: '8px', marginBottom: '6px' }}>
          {['', 'Name / ID', 'Button Label', ''].map((h, i) => <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>)}
        </div>
        {embed.roles.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr auto', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            {miniInput(r.emoji, v => updRole(r.id, 'emoji', v), '🎨')}
            {miniInput(r.name, v => updRole(r.id, 'name', v), 'Role name or ID')}
            {miniInput(r.label, v => updRole(r.id, 'label', v), 'Button label')}
            <button onClick={() => delRole(r.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        ))}
        <button onClick={addRole} style={{ marginTop: '4px', background: 'rgba(200,168,78,0.08)', border: '1px dashed rgba(200,168,78,0.3)', color: C.gold, padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>+ Add Role</button>
      </div>

      <div style={{ marginTop: '18px', borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
        <Toggle value={embed.confirmEnabled} onChange={set('confirmEnabled')} label="Show confirmation before action?"
          desc="Prompt the user before giving or removing the role." />
        {embed.confirmEnabled && (<>
          <div style={{ marginTop: '8px' }}>
            <Label hint="use {role}">When giving a role</Label>
            <Textarea value={embed.confirmGetMsg} onChange={set('confirmGetMsg')} rows={2} placeholder="You'll receive the {role} role. Confirm?" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <Label hint="use {role}">When removing a role</Label>
            <Textarea value={embed.confirmRemoveMsg} onChange={set('confirmRemoveMsg')} rows={2} placeholder="The {role} role will be removed. Confirm?" />
          </div>
        </>)}
      </div>

      <div style={{ marginTop: '14px', borderTop: `1px solid ${C.border}`, paddingTop: '16px' }}>
        <Toggle value={embed.dmEnabled} onChange={set('dmEnabled')} label="Send DM?"
          desc="Send a direct message when a role is given or removed." />
        {embed.dmEnabled && (<>
          <SubToggle value={embed.dmOnGet} onChange={v => set('dmOnGet')(v)} label="DM on role get">
            <Textarea value={embed.dmGetMsg} onChange={set('dmGetMsg')} rows={2} placeholder="You've been given the {role} role in {server}." />
          </SubToggle>
          <SubToggle value={embed.dmOnRemove} onChange={v => set('dmOnRemove')(v)} label="DM on role remove">
            <Textarea value={embed.dmRemoveMsg} onChange={set('dmRemoveMsg')} rows={2} placeholder="The {role} role has been removed in {server}." />
          </SubToggle>
        </>)}
      </div>
    </Card>
  );
};

const RoleSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [embeds, setEmbeds]   = useState([mkEmbed()]);
  const [saved, save]         = useSave();

  const upd = (id, data) => setEmbeds(prev => prev.map(e => e.id === id ? data : e));
  const del = id => setEmbeds(prev => prev.filter(e => e.id !== id));

  return (
    <div>
      <PageHeader icon="🎭" title="Role Selection" badge="MODULE" desc="Create role selection embeds — each embed has its own channel and role set." />
      <SettingsCard title="Module">
        <Toggle value={enabled} onChange={setEnabled} label="Enable Role Selection" />
      </SettingsCard>
      {enabled && (<>
        {embeds.map((embed, i) => (
          <EmbedEditor key={embed.id} embed={embed} index={i}
            onChange={data => upd(embed.id, data)}
            onSend={() => {}}
            onDelete={() => del(embed.id)} />
        ))}
        <button onClick={() => setEmbeds(p => [...p, mkEmbed()])}
          style={{ width: '100%', background: 'rgba(200,168,78,0.04)', border: '1px dashed rgba(200,168,78,0.25)', color: C.gold, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
          + Create New Embed
        </button>
      </>)}
      {/* TODO: wire in Phase 4-5 when config keys are added for role selection */}
      <ActionBar saved={saved} onSave={save} />
    </div>
  );
};

// ── Forms ─────────────────────────────────────────────────────────────────────

const FormsSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    formName: 'Creator Application',
    channel: '#apply',
    category: 'Creator Applications',
    reviewRoles: 'Admins',
    mainMessage: 'Want to join the AmeretaVerse Creator program? Click the button below to start your application.\n\nOur team will review it within 48 hours.',
    approveMsg: '✅ Your application has been approved! Welcome to the Creator program.',
    rejectMsg: 'Thank you for applying. Unfortunately your application does not meet our current requirements. You may reapply in 30 days.',
    dmEnabled: false,
    dmOnApprove: true,
    dmApproveMsg: "Congratulations! Your creator application was approved. You'll receive your roles shortly.",
    dmOnReject: true,
    dmRejectMsg: "Thank you for applying. Your application wasn't approved this time. You may reapply in 30 days.",
    fields: [
      { id: 1, name: 'Name / Display Name',  minLen: '2',  maxLen: '50',  required: true },
      { id: 2, name: 'X (Twitter) Profile',  minLen: '5',  maxLen: '100', required: true },
      { id: 3, name: 'Follower Count',        minLen: '1',  maxLen: '20',  required: true },
      { id: 4, name: 'Niche & About',         minLen: '20', maxLen: '500', required: true },
      { id: 5, name: 'Engagement Score',      minLen: '1',  maxLen: '20',  required: false },
    ],
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const updF = (id, k, val) => setV(p => ({ ...p, fields: p.fields.map(f => f.id === id ? { ...f, [k]: val } : f) }));
  const delF = id => setV(p => ({ ...p, fields: p.fields.filter(f => f.id !== id) }));
  const addF = () => setV(p => ({ ...p, fields: [...p.fields, { id: Date.now(), name: 'New Field', minLen: '1', maxLen: '200', required: false }] }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="📋" title="Forms" badge="MODULE" desc="Build custom application forms with configurable fields and review flow." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Forms" />
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Form Setup">
          <FieldRow>
            <Field label="Form Name"><Input value={v.formName} onChange={set('formName')} placeholder="Creator Application" /></Field>
            <Field label="Button Channel" hint="where the Apply button is posted"><Input value={v.channel} onChange={set('channel')} placeholder="#apply or 123456789" /></Field>
          </FieldRow>
          <FieldRow>
            <Field label="Ticket Category" hint="Discord category for form threads"><Input value={v.category} onChange={set('category')} placeholder="Creator Applications" /></Field>
            <Field label="Reviewer Roles" hint="multiple allowed — comma separated"><Input value={v.reviewRoles} onChange={set('reviewRoles')} placeholder="Admins, Mods" /></Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Main Message">
          <Field label="Embed Message" hint="the embed users see with the Apply button">
            <Textarea value={v.mainMessage} onChange={set('mainMessage')} rows={4} placeholder="Click the button below to start your application." />
          </Field>
        </SettingsCard>

        <SettingsCard title="Form Fields">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 100px 28px', gap: '8px', marginBottom: '8px' }}>
            {['Field Name', 'Min', 'Max', 'Required', ''].map((h, i) => (
              <div key={i} style={{ fontSize: '10px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
          {v.fields.map(f => (
            <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 100px 28px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input value={f.name} onChange={e => updF(f.id, 'name', e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none' }} />
              <input type="number" value={f.minLen} onChange={e => updF(f.id, 'minLen', e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <input type="number" value={f.maxLen} onChange={e => updF(f.id, 'maxLen', e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div onClick={() => updF(f.id, 'required', !f.required)} style={{ width: '36px', height: '20px', borderRadius: '100px', background: f.required ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '2px', left: f.required ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: '11px', color: C.muted }}>{f.required ? 'Yes' : 'No'}</span>
              </div>
              <button onClick={() => delF(f.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>
          ))}
          <button onClick={addF} style={{ marginTop: '8px', background: 'rgba(200,168,78,0.08)', border: '1px dashed rgba(200,168,78,0.3)', color: C.gold, padding: '7px 14px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>+ Add Field</button>
        </SettingsCard>

        <SettingsCard title="Review Messages">
          <Field label="Approve Message" hint="shown in the ticket channel on approve">
            <Textarea value={v.approveMsg} onChange={set('approveMsg')} rows={2} />
          </Field>
          <div style={{ marginTop: '14px' }}>
            <Field label="Reject Message" hint="shown in the ticket channel on reject">
              <Textarea value={v.rejectMsg} onChange={set('rejectMsg')} rows={2} />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Direct Messages">
          <Toggle value={v.dmEnabled} onChange={set('dmEnabled')} label="Send DM?"
            desc="Send direct messages to applicants when their form is reviewed." />
          {v.dmEnabled && (<>
            <SubToggle value={v.dmOnApprove} onChange={set('dmOnApprove')} label="DM on approve">
              <Textarea value={v.dmApproveMsg} onChange={set('dmApproveMsg')} rows={2} placeholder="Congratulations! Your application was approved." />
            </SubToggle>
            <SubToggle value={v.dmOnReject} onChange={set('dmOnReject')} label="DM on reject">
              <Textarea value={v.dmRejectMsg} onChange={set('dmRejectMsg')} rows={2} placeholder="Thank you for applying. Your application was not approved this time." />
            </SubToggle>
          </>)}
        </SettingsCard>
      </>)}

      {/* TODO: wire in Phase 4-5 when config keys are added for forms */}
      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Tickets ───────────────────────────────────────────────────────────────────

const TicketsSettings = () => {
  const [v, setV] = useState({
    enabled: true,
    channel: '#support',
    category: 'Support Tickets',
    mainMessage: 'Need help? Click the button below to open a support ticket.\n\nOur team will respond as soon as possible.',
    welcomeMessage: 'Thanks for opening a ticket! A support team member will be with you shortly.\n\nPlease describe your issue in detail.',
    openRoles: 'everyone',
    seeRoles: 'Support Team',
    respondRoles: 'Support Team',
    pingRole: 'Support Team',
    dmEnabled: false,
    dmOnOpen: true,
    dmOpenMsg: "Your support ticket has been opened. Our team will respond shortly.",
    dmOnClose: true,
    dmCloseMsg: "Your support ticket has been closed. Thanks for reaching out!",
  });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const [saved, save] = useSave();

  return (
    <div>
      <PageHeader icon="🎫" title="Tickets" badge="MODULE" desc="Standard support ticket system — members open threads with one click." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Tickets" />
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Channels">
          <FieldRow>
            <Field label="Button Channel" hint="name or ID — where the Open Ticket button is posted">
              <Input value={v.channel} onChange={set('channel')} placeholder="#support or 123456789" />
            </Field>
            <Field label="Ticket Category" hint="Discord category for ticket threads">
              <Input value={v.category} onChange={set('category')} placeholder="Support Tickets" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Main Message">
          <Field label="Embed Message" hint="the embed users see with the Open Ticket button">
            <Textarea value={v.mainMessage} onChange={set('mainMessage')} rows={3} placeholder="Need help? Open a ticket below." />
          </Field>
        </SettingsCard>

        <SettingsCard title="Welcome Message">
          <Field label="Message sent inside each new ticket">
            <Textarea value={v.welcomeMessage} onChange={set('welcomeMessage')} rows={3}
              placeholder="Thanks for opening a ticket! A support member will be with you shortly." />
          </Field>
        </SettingsCard>

        <SettingsCard title="Roles & Permissions">
          <FieldRow>
            <Field label="Who Can Open Tickets" hint="role name, ID, or 'everyone'">
              <Input value={v.openRoles} onChange={set('openRoles')} placeholder="everyone" />
            </Field>
            <Field label="Who Can See Tickets" hint="multiple — comma separated">
              <Input value={v.seeRoles} onChange={set('seeRoles')} placeholder="Support Team, Admins" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Who Can Respond" hint="multiple — comma separated">
              <Input value={v.respondRoles} onChange={set('respondRoles')} placeholder="Support Team, Admins" />
            </Field>
            <Field label="Ping Role on New Ticket" hint="leave blank to disable">
              <Input value={v.pingRole} onChange={set('pingRole')} placeholder="Support Team" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Direct Messages">
          <Toggle value={v.dmEnabled} onChange={set('dmEnabled')} label="Send DM?"
            desc="Send direct messages to members for ticket events." />
          {v.dmEnabled && (<>
            <SubToggle value={v.dmOnOpen} onChange={set('dmOnOpen')} label="DM on ticket open">
              <Textarea value={v.dmOpenMsg} onChange={set('dmOpenMsg')} rows={2}
                placeholder="Your ticket has been opened. We'll respond soon." />
            </SubToggle>
            <SubToggle value={v.dmOnClose} onChange={set('dmOnClose')} label="DM on ticket close">
              <Textarea value={v.dmCloseMsg} onChange={set('dmCloseMsg')} rows={2}
                placeholder="Your ticket has been closed. Thanks for reaching out!" />
            </SubToggle>
          </>)}
        </SettingsCard>
      </>)}

      {/* TODO: wire in Phase 4-5 when config keys are added for tickets */}
      <ActionBar saved={saved} onSave={save} onSend={() => {}} sendLabel="Send Message" />
    </div>
  );
};

// ── Raid ──────────────────────────────────────────────────────────────────────

const RAID_DEFAULTS = {
  enabled: true,
  channel: '#raids',
  category: 'Raids',
  likeWeight:    '30',
  commentWeight: '50',
  retweetWeight: '20',
  dmEnabled: false,
  dmConfirmMsg: '✅ Your raid participation has been confirmed! Points have been added to your account.',
};

const RaidSettings = () => {
  const { server } = useContext(DashboardContext);
  const [v, setV] = useState({ ...RAID_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, RAID_CONFIG_MAP, RAID_DEFAULTS, setV);

  return (
    <div>
      <PageHeader icon="⚔️" title="Raid System" badge="MODULE" desc="Configure the raid channel and point weight ratios. Duration and proof settings are per-raid via /post." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Raid System" />
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Channels">
          <FieldRow>
            <Field label="Raid Channel" hint="name or ID — where raid posts appear">
              <Input value={v.channel} onChange={set('channel')} placeholder="#raids or 123456789" />
            </Field>
            <Field label="Raid Category" hint="Discord category for raid threads">
              <Input value={v.category} onChange={set('category')} placeholder="Raids" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Point Weight Ratios">
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '13px' }}>
            How many points each action type contributes. Higher = worth more points.
          </p>
          <FieldRow cols={3}>
            <Field label="❤️ Like points"><Input type="number" value={v.likeWeight} onChange={set('likeWeight')} placeholder="30" /></Field>
            <Field label="💬 Comment points"><Input type="number" value={v.commentWeight} onChange={set('commentWeight')} placeholder="50" /></Field>
            <Field label="🔁 Retweet points"><Input type="number" value={v.retweetWeight} onChange={set('retweetWeight')} placeholder="20" /></Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Direct Messages">
          <Toggle value={v.dmEnabled} onChange={set('dmEnabled')} label="Send DM on raid confirmation?"
            desc="Send a DM when a member's raid participation is confirmed and points are awarded." />
          {v.dmEnabled && (
            <div style={{ marginTop: '12px' }}>
              <Textarea value={v.dmConfirmMsg} onChange={set('dmConfirmMsg')} rows={2}
                placeholder="Your raid participation has been confirmed! Points added." />
            </div>
          )}
        </SettingsCard>
      </>)}

      <ActionBar saveState={saveState} onSave={() => save(v)} />
    </div>
  );
};

// ── Engage ────────────────────────────────────────────────────────────────────

const ENGAGE_DEFAULTS = {
  enabled: true,
  channel: '#engage',
  creatorChannel: '#creator-engage',
  linkLifetime: '24',
  pointsPerLink: '30',
  likeWeight: '1.0', commentWeight: '1.5', retweetWeight: '1.2',
  dailyLimit: '5',
  submitCost: '0',
  minFollowers: '500',
  autoReset: true,
};

const EngageSettings = () => {
  const { server } = useContext(DashboardContext);
  const [v, setV] = useState({ ...ENGAGE_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, ENGAGE_CONFIG_MAP, ENGAGE_DEFAULTS, setV);

  return (
    <div>
      <PageHeader icon="🔄" title="Engage Pool" badge="MODULE" desc="Configure the Engage-for-Engage pool. Members use /engage and /submit commands." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Engage Pool" />
        {v.enabled && <Toggle value={v.autoReset} onChange={set('autoReset')} label="Auto-Reset Pool Daily"
          desc="Clears stale links every 24 hours and resets daily limits." />}
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Channels">
          <FieldRow>
            <Field label="Engage Channel" hint="name or ID — general engage pool">
              <Input value={v.channel} onChange={set('channel')} placeholder="#engage or 123456789" />
            </Field>
            <Field label="Creator Engage Channel" hint="name or ID — creator-only pool">
              <Input value={v.creatorChannel} onChange={set('creatorChannel')} placeholder="#creator-engage or 123456789" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Limits">
          <FieldRow>
            <Field label="Link Lifetime (hours)" hint="before expiry"><Input type="number" value={v.linkLifetime} onChange={set('linkLifetime')} placeholder="24" /></Field>
            <Field label="Daily Engage Limit" hint="per user"><Input type="number" value={v.dailyLimit} onChange={set('dailyLimit')} placeholder="5" /></Field>
          </FieldRow>
          <FieldRow>
            <Field label="Points Per Link" hint="base reward"><Input type="number" value={v.pointsPerLink} onChange={set('pointsPerLink')} placeholder="30" /></Field>
            <Field label="Submit Cost (points)" hint="cost to post a link"><Input type="number" value={v.submitCost} onChange={set('submitCost')} placeholder="0" /></Field>
          </FieldRow>
          <FieldRow>
            <Field label="Min. Followers to Submit" hint="quality gate"><Input type="number" value={v.minFollowers} onChange={set('minFollowers')} placeholder="500" /></Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Engagement Weights">
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>Points earned = base × weight for each action type.</p>
          <FieldRow cols={3}>
            <Field label="❤️ Like Weight"><Input type="number" value={v.likeWeight} onChange={set('likeWeight')} placeholder="1.0" /></Field>
            <Field label="💬 Comment Weight"><Input type="number" value={v.commentWeight} onChange={set('commentWeight')} placeholder="1.5" /></Field>
            <Field label="🔁 Retweet Weight"><Input type="number" value={v.retweetWeight} onChange={set('retweetWeight')} placeholder="1.2" /></Field>
          </FieldRow>
        </SettingsCard>
      </>)}

      <ActionBar saveState={saveState} onSave={() => save(v)} />
    </div>
  );
};

// ── Protection ────────────────────────────────────────────────────────────────

const PROTECT_DEFAULTS = {
  enabled: true,
  logChannel: 'mod-log',
  // Link Detection
  linkEnabled: true,
  linkWhitelist: 'twitter.com, x.com, discord.gg, youtube.com',
  linkAction: 'none',
  linkDm: false,
  linkDmMsg: 'Your message was removed because it contained a link not on the allowed list.',
  // Phishing
  phishingEnabled: true,
  phishingAction: 'mute',
  phishingDm: true,
  phishingDmMsg: 'Your message was removed — it contained a known phishing link. Do not share suspicious links in this server.',
  // Spam
  spamEnabled: true,
  spamThreshold: '5',
  spamWindow: '10',
  spamAction: 'mute',
  spamDm: true,
  spamDmMsg: "You've been muted for sending messages too quickly. Please slow down.",
  // Banned Words
  bannedEnabled: false,
  bannedList: '',
  bannedAction: 'none',
  bannedDm: false,
  bannedDmMsg: 'Your message was removed because it contained a word that is not allowed in this server.',
  // Suspicious Users
  suspEnabled: true,
  suspNoAvatar: true,
  suspAge: '7',
  suspUsernameKeywords: 'scam, hack, free crypto, airdrop, nft giveaway',
  suspBioKeywords: '',
  suspAction: 'flag',
  suspDm: false,
  suspDmMsg: 'Your account has been flagged by our automated moderation. A moderator will review your account shortly.',
  // Anti-Raid
  antiRaidEnabled: true,
  antiRaidThreshold: '10',
  antiRaidWindow: '60',
  antiRaidPingRole: '',
};

const ProtectionSettings = () => {
  const { server } = useContext(DashboardContext);
  const [v, setV] = useState({ ...PROTECT_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, PROTECT_CONFIG_MAP, PROTECT_DEFAULTS, setV);

  const DmRow = ({ enabledKey, msgKey, placeholder }) => (
    <>
      <Toggle value={v[enabledKey]} onChange={set(enabledKey)} label="Send DM warning?" />
      {v[enabledKey] && (
        <div style={{ marginTop: '8px', marginBottom: '4px' }}>
          <Textarea value={v[msgKey]} onChange={set(msgKey)} rows={2} placeholder={placeholder} />
        </div>
      )}
    </>
  );

  const ActionRow = ({ actionKey, opts = ACTION_OPTS }) => (
    <Field label="Action on detection">
      <Select value={v[actionKey]} onChange={set(actionKey)} options={opts} />
    </Field>
  );

  return (
    <div>
      <PageHeader icon="🛡️" title="Protection" badge="MODULE" desc="Automated moderation — each feature is individually configurable." />
      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Protection" />
      </SettingsCard>

      {v.enabled && (<>
        {/* Log Channel */}
        <SettingsCard title="Logging">
          <Field label="Mod Log Channel" hint="name or ID — all actions are logged here">
            <Input value={v.logChannel} onChange={set('logChannel')} placeholder="mod-log or 123456789" style={{ maxWidth: '280px' }} />
          </Field>
        </SettingsCard>

        {/* Link Detection */}
        <SettingsCard title="Link Detection">
          <Toggle value={v.linkEnabled} onChange={set('linkEnabled')} label="Enable Link Detection"
            desc="Delete messages containing URLs not on the whitelist." />
          {v.linkEnabled && (<>
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <Field label="Allowed Domains" hint="comma-separated">
                <Input value={v.linkWhitelist} onChange={set('linkWhitelist')} placeholder="twitter.com, x.com, discord.gg" />
              </Field>
            </div>
            <ActionRow actionKey="linkAction" opts={DELETE_ACTION_OPTS} />
            <DmRow enabledKey="linkDm" msgKey="linkDmMsg"
              placeholder="Your message was removed because it contained a link not on the allowed list." />
          </>)}
        </SettingsCard>

        {/* Phishing */}
        <SettingsCard title="Phishing Detection">
          <Toggle value={v.phishingEnabled} onChange={set('phishingEnabled')} label="Enable Phishing Detection"
            desc="Delete messages containing known phishing domains." />
          {v.phishingEnabled && (<>
            <div style={{ marginTop: '14px' }}>
              <ActionRow actionKey="phishingAction" opts={ACTION_OPTS.filter(o => ['mute','kick','ban'].includes(o.value))} />
            </div>
            <DmRow enabledKey="phishingDm" msgKey="phishingDmMsg"
              placeholder="Your message was removed — it contained a phishing link." />
          </>)}
        </SettingsCard>

        {/* Spam */}
        <SettingsCard title="Spam Detection">
          <Toggle value={v.spamEnabled} onChange={set('spamEnabled')} label="Enable Spam Detection"
            desc="Take action when a user sends too many messages in a short time window." />
          {v.spamEnabled && (<>
            <FieldRow style={{ marginTop: '14px' }}>
              <Field label="Message Threshold" hint="per window"><Input type="number" value={v.spamThreshold} onChange={set('spamThreshold')} placeholder="5" /></Field>
              <Field label="Time Window (seconds)"><Input type="number" value={v.spamWindow} onChange={set('spamWindow')} placeholder="10" /></Field>
            </FieldRow>
            <ActionRow actionKey="spamAction" opts={ACTION_OPTS.filter(o => ['mute','kick','ban'].includes(o.value))} />
            <DmRow enabledKey="spamDm" msgKey="spamDmMsg"
              placeholder="You've been muted for sending messages too quickly." />
          </>)}
        </SettingsCard>

        {/* Banned Words */}
        <SettingsCard title="Banned Words Filter">
          <Toggle value={v.bannedEnabled} onChange={set('bannedEnabled')} label="Enable Banned Words Filter"
            desc="Delete messages containing any word from the list below." />
          {v.bannedEnabled && (<>
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <Field label="Banned Words" hint="comma-separated">
                <Textarea value={v.bannedList} onChange={set('bannedList')} rows={3} placeholder="word1, word2, phrase here" />
              </Field>
            </div>
            <ActionRow actionKey="bannedAction" opts={DELETE_ACTION_OPTS} />
            <DmRow enabledKey="bannedDm" msgKey="bannedDmMsg"
              placeholder="Your message was removed because it contained a word not allowed here." />
          </>)}
        </SettingsCard>

        {/* Suspicious Users */}
        <SettingsCard title="Suspicious User Detection">
          <Toggle value={v.suspEnabled} onChange={set('suspEnabled')} label="Enable Suspicious User Detection"
            desc="Flag or remove users that match suspicious criteria when they join." />
          {v.suspEnabled && (<>
            <div style={{ marginTop: '14px', borderTop: `1px solid ${C.border}`, paddingTop: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Detection Criteria</div>
              <Toggle value={v.suspNoAvatar} onChange={set('suspNoAvatar')} label="No profile picture"
                desc="Flag users who join with the default Discord avatar." />
              <div style={{ marginTop: '8px' }}>
                <Field label="Minimum Account Age (days)" hint="flag accounts newer than this">
                  <Input type="number" value={v.suspAge} onChange={set('suspAge')} placeholder="7" style={{ maxWidth: '140px' }} />
                </Field>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Field label="Suspicious Username Keywords" hint="comma-separated — flag if username contains any">
                  <Input value={v.suspUsernameKeywords} onChange={set('suspUsernameKeywords')} placeholder="scam, hack, free crypto" />
                </Field>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Field label="Suspicious Bio Keywords" hint="comma-separated — flag if bio contains any (leave blank to skip)">
                  <Input value={v.suspBioKeywords} onChange={set('suspBioKeywords')} placeholder="dm me for profits, nft giveaway" />
                </Field>
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <ActionRow actionKey="suspAction" opts={ACTION_OPTS.filter(o => ['flag','kick','ban'].includes(o.value))} />
            </div>
            <DmRow enabledKey="suspDm" msgKey="suspDmMsg"
              placeholder="Your account has been flagged. A moderator will review it shortly." />
          </>)}
        </SettingsCard>

        {/* Anti-Raid */}
        <SettingsCard title="Anti-Raid">
          <Toggle value={v.antiRaidEnabled} onChange={set('antiRaidEnabled')} label="Enable Anti-Raid"
            desc="If too many users join at once, pause all invites and ping admins." />
          {v.antiRaidEnabled && (<>
            <FieldRow style={{ marginTop: '14px' }}>
              <Field label="Join Threshold" hint="users joining to trigger lockdown">
                <Input type="number" value={v.antiRaidThreshold} onChange={set('antiRaidThreshold')} placeholder="10" />
              </Field>
              <Field label="Time Window (seconds)">
                <Input type="number" value={v.antiRaidWindow} onChange={set('antiRaidWindow')} placeholder="60" />
              </Field>
            </FieldRow>
            <Field label="Ping Role on Raid" hint="name or ID — leave blank to disable">
              <Input value={v.antiRaidPingRole} onChange={set('antiRaidPingRole')} placeholder="Admins or 123456789" style={{ maxWidth: '280px' }} />
            </Field>
          </>)}
        </SettingsCard>
      </>)}

      <ActionBar saveState={saveState} onSave={() => save(v)} />
    </div>
  );
};

// ── Admin Panel — Flagged Users ───────────────────────────────────────────────

const FLAG_SOURCES = {
  raid:       { label: 'Raid',       color: C.gold },
  engage:     { label: 'Engage',     color: C.orange },
  protection: { label: 'Protection', color: C.red },
};

const FlaggedUsers = () => {
  const { server } = useContext(DashboardContext);
  const [flags, setFlags] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true); setFlags(null);
    fetchFlaggedUsers(server.id)
      .then(data => { setFlags(Array.isArray(data) ? data : data?.flags ?? []); setLoading(false); })
      .catch(() => { setFlags([]); setLoading(false); });
  }, [server?.id]);

  const dismiss = id => setFlags(prev => prev.filter(f => f.id !== id));
  const visible = flags == null ? [] : (filter === 'all' ? flags : flags.filter(f => f.source === filter));

  const ActionBtn = ({ color, label, onClick }) => (
    <button onClick={onClick} style={{ background: `${color}14`, border: `1px solid ${color}40`, color, padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600 }}>{label}</button>
  );

  return (
    <div>
      <PageHeader icon="🚩" title="Flagged Users" desc="All flagged users from Raid, Engage, and Protection modules." />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'raid', 'engage', 'protection'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'rgba(200,168,78,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filter === f ? 'rgba(200,168,78,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === f ? C.gold : C.muted,
            padding: '6px 14px', borderRadius: '7px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
          }}>{f === 'all' ? 'All Sources' : f}</button>
        ))}
        <div style={{ flex: 1 }} />
        {flags != null && <span style={{ fontSize: '12px', color: C.muted }}>{visible.length} entries</span>}
      </div>

      {loading ? (
        <Card style={{ textAlign: 'center', padding: '48px' }}><LivePending /></Card>
      ) : flags == null || visible.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
          <div style={{ fontSize: '14px' }}>{!server ? 'Select a server to view flagged users' : 'No flagged users'}</div>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {visible.map((flag, i) => {
            const src = FLAG_SOURCES[flag.source] ?? { label: flag.source, color: C.muted };
            return (
              <div key={flag.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: `${src.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🚩</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{flag.user ?? flag.username ?? flag.user_id}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: `${src.color}18`, color: src.color, border: `1px solid ${src.color}30`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{src.label}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flag.reason}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginRight: '8px' }}>{flag.time ?? flag.timestamp}</div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <ActionBtn color={C.muted}   label="Dismiss" onClick={() => dismiss(flag.id)} />
                  <ActionBtn color={C.orange}  label="Warn"    onClick={() => {}} />
                  <ActionBtn color={C.gold}    label="Kick"    onClick={() => {}} />
                  <ActionBtn color={C.red}     label="Ban"     onClick={() => {}} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

// ── Admin Panel — Mod Log ─────────────────────────────────────────────────────

const MOD_MODULES = ['all', 'Link Detection', 'Spam Detection', 'Phishing', 'Suspicious Users', 'Anti-Raid', 'Banned Words'];

const ModLog = () => {
  const { server } = useContext(DashboardContext);
  const [log, setLog]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true); setLog(null);
    fetchAuditLog(server.id, 50)
      .then(data => { setLog(Array.isArray(data) ? data : data?.logs ?? []); setLoading(false); })
      .catch(() => { setLog([]); setLoading(false); });
  }, [server?.id]);

  const visible = log == null ? [] : (filter === 'all' ? log : log.filter(e => e.module === filter));

  const dotColor = entry => {
    const m = entry.module ?? '';
    if (m === 'Anti-Raid' || m === 'Phishing' || m === 'Link Detection') return C.red;
    return C.orange;
  };

  return (
    <div>
      <PageHeader icon="📝" title="Mod Log" desc="Protection actions taken by the bot for the selected server." />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {MOD_MODULES.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{
            background: filter === m ? 'rgba(200,168,78,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${filter === m ? 'rgba(200,168,78,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: filter === m ? C.gold : C.muted,
            padding: '5px 12px', borderRadius: '7px', cursor: 'pointer',
            fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 600,
          }}>{m === 'all' ? 'All' : m}</button>
        ))}
      </div>

      {loading ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}><LivePending /></Card>
      ) : log == null || visible.length === 0 ? (
        <Card style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '14px' }}>
          {!server ? 'Select a server to view the mod log' : 'No log entries found'}
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {visible.map((entry, i) => (
            <div key={entry.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 22px', borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor(entry), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{entry.action}</span>
                  <span style={{ fontSize: '11px', color: C.muted, padding: '1px 7px', borderRadius: '100px', background: C.subtle }}>{entry.module}</span>
                </div>
                <div style={{ fontSize: '12px', color: C.muted }}>{entry.target} · {entry.detail}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{entry.time ?? entry.timestamp}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ── Admin Panel — Audit Log ───────────────────────────────────────────────────

const AuditLog = () => {
  const { server } = useContext(DashboardContext);
  const [log, setLog]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true); setLog(null);
    fetchAuditLog(server.id, 50)
      .then(data => { setLog(Array.isArray(data) ? data : data?.logs ?? []); setLoading(false); })
      .catch(() => { setLog([]); setLoading(false); });
  }, [server?.id]);

  return (
    <div>
      <PageHeader icon="📋" title="Audit Log" desc="All bot actions — config changes, message sends, role changes, and more." />

      {loading ? (
        <Card style={{ textAlign: 'center', padding: '40px' }}><LivePending /></Card>
      ) : log == null || log.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center', color: C.muted }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '14px' }}>{!server ? 'Select a server to view the audit log' : 'No audit log entries yet'}</div>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          {log.map((entry, i) => (
            <div key={entry.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 22px', borderBottom: i < log.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'rgba(200,168,78,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{entry.action}</span>
                  <span style={{ fontSize: '11px', color: C.muted, padding: '1px 7px', borderRadius: '100px', background: C.subtle }}>{entry.module}</span>
                </div>
                <div style={{ fontSize: '12px', color: C.muted }}>{entry.detail}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>{entry.user}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{entry.time ?? entry.timestamp}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ── Server selector dropdown ──────────────────────────────────────────────────

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
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', transition: 'border-color 0.2s' }}
        onMouseOver={e => e.currentTarget.style.borderColor = C.borderHover}
        onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
        <ServerIcon server={server} size={20} />
        <span style={{ fontWeight: 600 }}>{server.name}</span>
        <span style={{ fontSize: '10px', color: C.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '220px', background: '#1a1a22', border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
          {[...servers, ADD_SERVER_ENTRY].map(s => (
            <div key={s.id}
              onClick={() => { if (s.id === 'add') window.open('https://discord.gg/zueuN7xmWx', '_blank'); else onSelect(s); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', background: server.id === s.id ? 'rgba(200,168,78,0.08)' : 'transparent', color: s.id === 'add' ? C.gold : '#fff', fontSize: '13px', fontWeight: s.id === 'add' ? 600 : 400, transition: 'background 0.15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => { e.currentTarget.style.background = server.id === s.id ? 'rgba(200,168,78,0.08)' : 'transparent'; }}>
              {s.id === 'add'
                ? <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(200,168,78,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>+</div>
                : <ServerIcon server={s} size={28} />
              }
              <div style={{ flex: 1 }}>
                <div>{s.name}</div>
                {s.members != null && <div style={{ fontSize: '11px', color: C.muted }}>{s.members.toLocaleString()} members</div>}
              </div>
              {server.id === s.id && <span style={{ color: C.gold, fontSize: '14px' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── AI Help button ────────────────────────────────────────────────────────────

const AIHelpButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 100 }}>
      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', right: 0, width: '340px', background: '#13131a', border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🤖</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>AVbot AI Help</div>
                <div style={{ fontSize: '11px', color: C.muted }}>Ask anything about your bot setup</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ padding: '20px', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: C.muted }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>✨</div>
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>AI assistant coming soon!<br />We'll connect it up in the next update.</div>
            </div>
          </div>
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything…"
                style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              <button style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 14px', color: '#0A0A0F', cursor: 'pointer', fontSize: '14px', fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>↑</button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '100px', padding: '12px 20px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 20px rgba(200,168,78,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(200,168,78,0.45)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(200,168,78,0.35)'; }}>
        🤖 Need help?
      </button>
    </div>
  );
};

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'overview',      icon: '📊', label: 'Overview',      group: null },
  { id: 'analytics',    icon: '📈', label: 'Analytics',     group: null },
  { id: 'verification', icon: '🔐', label: 'Verification',   group: 'Settings' },
  { id: 'roles',        icon: '🎭', label: 'Role Selection', group: 'Settings' },
  { id: 'forms',        icon: '📋', label: 'Forms',          group: 'Settings' },
  { id: 'tickets',      icon: '🎫', label: 'Tickets',        group: 'Settings' },
  { id: 'raid',         icon: '⚔️', label: 'Raid',           group: 'Settings' },
  { id: 'engage',       icon: '🔄', label: 'Engage',         group: 'Settings' },
  { id: 'protection',   icon: '🛡️', label: 'Protection',     group: 'Settings' },
  { id: 'flagged',      icon: '🚩', label: 'Flagged Users',  group: 'Admin Panel' },
  { id: 'modlog',       icon: '📝', label: 'Mod Log',        group: 'Admin Panel' },
  { id: 'auditlog',     icon: '📋', label: 'Audit Log',      group: 'Admin Panel' },
];

// ── NavBtn ────────────────────────────────────────────────────────────────────

const NavBtn = ({ item, active, setActive }) => (
  <button onClick={() => setActive(item.id)}
    style={{ width: '100%', background: active === item.id ? 'rgba(200,168,78,0.1)' : 'transparent', border: `1px solid ${active === item.id ? 'rgba(200,168,78,0.2)' : 'transparent'}`, borderRadius: '8px', color: active === item.id ? C.gold : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: active === item.id ? 600 : 400, marginBottom: '2px', fontFamily: 'Sora, sans-serif', transition: 'all 0.15s', textAlign: 'left' }}
    onMouseOver={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseOut={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
    {item.label}
  </button>
);

// ── Dashboard shell ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [servers, setServers] = useState([]);
  const [server, setServer]   = useState(null);
  const [active, setActive]   = useState('overview');
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) { setToken(urlToken); window.history.replaceState({}, '', '/dashboard'); }
    if (!getToken()) { setAuthLoading(false); return; }
    fetchMe()
      .then(u => { setUser(u); return fetchServers(); })
      .then(list => { setServers(list); if (list.length) setServer(list[0]); })
      .catch(() => { clearToken(); })
      .finally(() => setAuthLoading(false));
  }, []);

  const logout = () => { clearToken(); setUser(null); setServers([]); setServer(null); };

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', color: C.muted, fontSize: '14px' }}>Loading…</div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(200,168,78,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Link to="/" style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', color: '#0A0A0F' }}>AV</div>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>AVbot</span>
      </Link>
      <div style={{ background: C.surface, border: '1px solid rgba(200,168,78,0.15)', borderRadius: '20px', padding: '48px 40px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
        <h1 style={{ margin: '0 0 10px', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AVbot Dashboard</h1>
        <p style={{ margin: '0 0 32px', color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>Manage your server's automation, raids, engagement, and points — all in one place.</p>
        <button className="btn-primary" onClick={loginWithDiscord} style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}>
          <span>💬</span> Login with Discord
        </button>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" style={{ color: '#7289da', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💬</span> Join AmeretaVerse Discord
          </a>
        </div>
        <p style={{ margin: '16px 0 0', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>By logging in you agree to our Terms of Service.</p>
      </div>
    </div>
  );

  const groups = ['Settings', 'Admin Panel'];
  const groupedNav = {
    top:           NAV.filter(n => !n.group),
    Settings:      NAV.filter(n => n.group === 'Settings'),
    'Admin Panel': NAV.filter(n => n.group === 'Admin Panel'),
  };
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.user_id}/${user.avatar}.png?size=64`
    : null;

  // Pages defined inside render so they access context naturally via useContext
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

  return (
    <DashboardContext.Provider value={{ server, user, servers, setServer }}>
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: 'Sora, sans-serif', color: '#fff' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: '224px', flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '20px 18px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: '#0A0A0F' }}>AV</div>
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
                : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#5865F2,#3a4299)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
              }
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{user.username}</div>
                <div style={{ fontSize: '11px', color: C.muted }}>Discord</div>
              </div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Sora, sans-serif', padding: 0 }}>Logout →</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', borderBottom: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
            {server
              ? <ServerSelector server={server} servers={servers} onSelect={setServer} />
              : <span style={{ fontSize: '13px', color: C.muted }}>No servers found — add bot to a server first</span>
            }
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.2)', color: '#7289da', textDecoration: 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(88,101,242,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.1)'}>
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
