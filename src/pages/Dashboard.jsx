import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import Analytics from './Analytics';
import { DashboardContext } from '../DashboardContext';
import {
  loginWithDiscord, fetchMe, fetchServers, fetchServerStats,
  fetchServerAnalytics, fetchConfig, saveConfig,
  sendProtectionMessage, sendTicketsPanel, sendVerifyMessage,
  fetchFlaggedUsers, fetchAuditLog,
  clearToken, getToken, setToken,
  listRolePanels, createRolePanel, updateRolePanel, deleteRolePanel,
  createRoleButton, updateRoleButton, deleteRoleButton,
  sendRolePanel, refreshRolePanel,
  listAssets, uploadAsset, deleteAsset,
  listForms, createForm, updateForm, deleteForm,
  createFormField, updateFormField, deleteFormField, sendForm,
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
  // Feature toggles
  linkEnabled:          'protection_link_detection',
  linkWhitelist:        'protection_link_whitelist',
  linkAction:           'protection_link_action',
  spamEnabled:          'protection_spam_detection',
  spamThreshold:        'protection_spam_threshold',
  spamWindow:           'protection_spam_window',
  spamAction:           'protection_spam_action',
  spamMuteDuration:     'protection_spam_mute_duration',
  suspEnabled:          'protection_suspicious_users',
  suspAction:           'protection_suspicious_action',
  suspAge:              'protection_suspicious_account_age',
  suspNoAvatar:         'protection_suspicious_no_avatar',
  suspUsernameEnabled:  'protection_suspicious_username_keywords',
  suspBioEnabled:       'protection_suspicious_bio_keywords',
  suspKeywordsList:     'protection_suspicious_keywords_list',
  phishingEnabled:      'protection_phishing_detection',
  phishingAction:       'protection_phishing_action',
  phishingList:         'protection_phishing_list',
  antiRaidEnabled:      'protection_anti_raid',
  antiRaidThreshold:    'protection_anti_raid_threshold',
  antiRaidWindow:       'protection_anti_raid_window',
  antiRaidAction:       'protection_anti_raid_action',
  bannedEnabled:        'protection_banned_words',
  bannedList:           'protection_banned_words_list',
  bannedAction:         'protection_banned_words_action',
  logChannel:           'protection_log_channel',
  // DM settings
  dmEnabled:            'protection_dm_on_action',
  dmLinkMsg:            'protection_dm_link_message',
  dmSpamMsg:            'protection_dm_spam_message',
  dmBannedMsg:          'protection_dm_banned_word_message',
  dmPhishingMsg:        'protection_dm_phishing_message',
  dmSuspMsg:            'protection_dm_suspicious_message',
  // Main embed (Send Message)
  mainEmbedTitle:       'protection_main_embed_title',
  mainEmbedDesc:        'protection_main_embed_description',
  mainEmbedChannel:     'protection_main_embed_channel',
};

const VERIFY_CONFIG_MAP = {
  enabled:             'verify_enabled',
  channel:             'verify_channel',
  successRole:         'verify_success_role',
  maxAttempts:         'verify_max_attempts',
  embedTitle:          'verify_embed_title',
  embedDescription:    'verify_embed_description',
  embedButtonLabel:    'verify_embed_button_label',
  wrongAttemptMessage: 'verify_wrong_attempt_message',
  lastChanceMessage:   'verify_last_chance_message',
  kickedMessage:       'verify_kicked_message',
  successMessage:      'verify_success_message',
  dmOnSuccessEnabled:  'verify_dm_on_success_enabled',
  dmOnSuccessMessage:  'verify_dm_on_success_message',
  dmOnKickEnabled:     'verify_dm_on_kick_enabled',
  dmOnKickMessage:     'verify_dm_on_kick_message',
  verifyColor:         'verify_color',
  verifyThumbnailUrl:  'verify_thumbnail_url',
  verifyImageUrl:      'verify_image_url',
  verifyFooterText:    'verify_footer_text',
  verifyFooterIconUrl: 'verify_footer_icon_url',
};

const VERIFY_DEFAULTS = {
  enabled:             true,
  channel:             '',
  successRole:         'Verified',
  maxAttempts:         '3',
  embedTitle:          '🔒 Verify to Enter',
  embedDescription:    'Click the button below and solve the CAPTCHA to access the server.',
  embedButtonLabel:    'Verify',
  wrongAttemptMessage: '❌ Wrong! You have {remaining} attempts left.',
  lastChanceMessage:   "⚠️ Last chance! Get this one wrong and you'll be kicked.",
  kickedMessage:       "You've been kicked for failing verification. You can rejoin and try again.",
  successMessage:      '✅ Verified! Welcome to the server.',
  dmOnSuccessEnabled:  true,
  dmOnSuccessMessage:  "Welcome! You've been verified in {server}.",
  dmOnKickEnabled:     true,
  dmOnKickMessage:     'You were kicked from {server} for failing CAPTCHA. Feel free to try again.',
  verifyColor:         '',
  verifyThumbnailUrl:  '',
  verifyImageUrl:      '',
  verifyFooterText:    '',
  verifyFooterIconUrl: '',
};

const RAID_CONFIG_MAP = {
  likeWeight:    'engage_weight_like',
  commentWeight: 'engage_weight_comment',
  retweetWeight: 'engage_weight_retweet',
};

const TICKETS_CONFIG_MAP = {
  enabled:               'tickets_enabled',
  panelChannel:          'tickets_panel_channel',
  panelTitle:            'tickets_panel_title',
  panelDesc:             'tickets_panel_description',
  panelButtonLabel:      'tickets_panel_button_label',
  category:              'tickets_category',
  staffRoles:            'tickets_staff_roles',
  pingRole:              'tickets_ping_role',
  welcomeMessage:        'tickets_welcome_message',
  archiveChannel:        'tickets_archive_channel',
  autoCloseEnabled:      'tickets_auto_close_enabled',
  autoCloseWarningHours: 'tickets_auto_close_warning_hours',
  autoCloseFinalHours:   'tickets_auto_close_final_hours',
  autoCloseWarningMsg:   'tickets_auto_close_warning_message',
  dmOnOpenEnabled:       'tickets_dm_on_open_enabled',
  dmOnOpenMessage:       'tickets_dm_on_open_message',
  dmOnCloseEnabled:      'tickets_dm_on_close_enabled',
  dmOnCloseMessage:      'tickets_dm_on_close_message',
  panelColor:            'tickets_color',
  panelThumbnailUrl:     'tickets_thumbnail_url',
  panelImageUrl:         'tickets_image_url',
  panelFooterText:       'tickets_footer_text',
};

const TICKETS_DEFAULTS = {
  enabled:               false,
  panelChannel:          '',
  panelTitle:            'Support Tickets',
  panelDesc:             'Need help? Click the button below to open a support ticket. A staff member will assist you shortly.',
  panelButtonLabel:      'Open Ticket',
  category:              '',
  staffRoles:            '',
  pingRole:              '',
  welcomeMessage:        'Hi {user}, thanks for opening a ticket. A staff member will be with you shortly. Please describe your issue in detail.',
  archiveChannel:        '',
  autoCloseEnabled:      true,
  autoCloseWarningHours: '48',
  autoCloseFinalHours:   '72',
  autoCloseWarningMsg:   'This ticket has been inactive for 48 hours. It will be auto-closed in 24 hours unless someone responds.',
  dmOnOpenEnabled:       true,
  dmOnOpenMessage:       "Your support ticket has been opened in {server}. We'll be in touch soon.",
  dmOnCloseEnabled:      true,
  dmOnCloseMessage:      'Your support ticket in {server} has been closed. If you need further help, feel free to open a new one.',
  panelColor:            '',
  panelThumbnailUrl:     '',
  panelImageUrl:         '',
  panelFooterText:       '',
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



// ── Visual customization modals & embed preview ───────────────────────────────

const ComingSoonModal = ({ onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: '#13131a', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 700 }}>🎨 Visual Customization coming soon</h3>
      <button onClick={onClose}
        style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 28px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700 }}>
        OK
      </button>
    </div>
  </div>
);

const AssetPickerModal = ({ serverId, onPick, onClose }) => {
  const [tab, setTab]           = useState('library');
  const [assets, setAssets]     = useState([]);
  const [libLoading, setLibLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const fileRef = useRef(null);

  const loadAssets = async () => {
    try { const { assets: a } = await listAssets(serverId); setAssets(a || []); }
    catch { setAssets([]); }
    setLibLoading(false);
  };
  useEffect(() => { loadAssets(); }, [serverId]); // eslint-disable-line

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setUploadErr('File too large. Max 10 MB.'); return; }
    if (!['image/png','image/jpeg','image/jpg','image/gif','image/webp'].includes(f.type)) {
      setUploadErr('Unsupported type. Use PNG, JPG, GIF, or WebP.'); return;
    }
    setUploadErr('');
    setUploadFile(f);
  };

  const handleUpload = async () => {
    if (!uploadFile || uploading) return;
    setUploading(true); setUploadErr('');
    try {
      const res = await uploadAsset(serverId, uploadFile);
      await loadAssets();
      setTab('library');
      setUploadFile(null);
      if (res.url) onPick(res.url);
    } catch (e) { setUploadErr(e.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDel = async (assetId, e) => {
    e.stopPropagation();
    try { await deleteAsset(serverId, assetId); await loadAssets(); } catch {}
  };

  const tabBtn = (active) => ({
    padding: '8px 16px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px',
    fontWeight: 600, background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? C.gold : 'transparent'}`, color: active ? C.gold : C.muted,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#13131a', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Asset Library</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: '16px' }}>
          <button style={tabBtn(tab === 'library')} onClick={() => setTab('library')}>My Library</button>
          <button style={tabBtn(tab === 'upload')} onClick={() => setTab('upload')}>Upload New</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'library' && (
            libLoading ? (
              <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>Loading…</div>
            ) : assets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                <div style={{ fontSize: '13px' }}>No assets yet. Upload your first image.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', gap: '10px' }}>
                {assets.map(a => (
                  <div key={a.asset_id} onClick={() => onPick(a.url)}
                    style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, aspectRatio: '1' }}>
                    <img src={a.url} alt={a.original_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button onClick={(e) => handleDel(a.asset_id, e)}
                      style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: '#fff', fontSize: '13px', lineHeight: '20px', textAlign: 'center', padding: 0 }}>×</button>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.7))', padding: '4px 5px 5px', fontSize: '9px', color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.original_name}</div>
                  </div>
                ))}
              </div>
            )
          )}
          {tab === 'upload' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? C.gold : 'rgba(255,255,255,0.14)'}`, borderRadius: '10px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: dragOver ? 'rgba(200,168,78,0.05)' : 'transparent', marginBottom: '10px' }}>
                {uploadFile ? (
                  <div>
                    <img src={URL.createObjectURL(uploadFile)} alt="preview" style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '6px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', color: C.muted }}>{uploadFile.name} ({(uploadFile.size/1024).toFixed(0)} KB)</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                    <div style={{ fontSize: '13px', color: C.muted }}>Drag & drop or click to select</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>PNG, JPG, GIF, WebP — max 10 MB</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" style={{ display: 'none' }} onChange={e => pickFile(e.target.files?.[0])} />
              </div>
              {uploadErr && <div style={{ color: C.red, fontSize: '12px', marginBottom: '10px' }}>{uploadErr}</div>}
              {uploadFile && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleUpload} disabled={uploading}
                    style={{ flex: 1, background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px', color: '#0A0A0F', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, opacity: uploading ? 0.7 : 1 }}>
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                  <button onClick={() => { setUploadFile(null); setUploadErr(''); }}
                    style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 16px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px' }}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmbedPreview = ({
  serverId, isPremium,
  title = '', description = '',
  thumbnailUrl = '', imageUrl = '',
  color = '#94730D', footerText = '',
  onTitleChange, onDescriptionChange,
  onThumbnailChange, onImageChange,
  onColorChange, onFooterTextChange,
  showImage = true,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [assetModal, setAssetModal] = useState(null);
  const [comingSoon, setComingSoon] = useState(false);
  const pickerRef  = useRef(null);
  const barRef     = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target) &&
          barRef.current    && !barRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const vizClick = (action) => {
    if (!isPremium) { setComingSoon(true); return; }
    action();
  };

  const safeColor = /^#[0-9a-fA-F]{3,6}$/.test(color) ? color : '#94730D';

  const iStyle = {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    fontFamily: 'Sora, sans-serif', color: '#fff', padding: '2px 0', boxSizing: 'border-box',
  };

  return (
    <>
      <div style={{ position: 'relative', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'visible', marginTop: '12px', display: 'flex', fontFamily: 'Whitney, Sora, sans-serif' }}>
        {/* Color bar */}
        <div ref={barRef} onClick={() => vizClick(() => setPickerOpen(p => !p))}
          title={isPremium ? 'Click to change color' : 'Color (premium)'}
          style={{ width: '4px', background: safeColor, flexShrink: 0, cursor: 'pointer', borderRadius: '4px 0 0 4px', minHeight: '100%' }} />

        {/* Color picker popover */}
        {pickerOpen && (
          <div ref={pickerRef} style={{ position: 'absolute', left: '14px', top: '8px', zIndex: 100, background: '#1a1a22', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.55)' }}>
            <HexColorPicker color={safeColor} onChange={v => onColorChange?.(v)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <input value={safeColor} onChange={e => onColorChange?.(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: '5px', padding: '4px 8px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', width: '90px', outline: 'none' }} />
              <button onClick={() => setPickerOpen(false)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '12px' }}>Done</button>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, padding: '12px 14px 10px', minWidth: 0 }}>
          {/* Title + Thumbnail row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input value={title} onChange={e => onTitleChange?.(e.target.value)}
                placeholder="Embed title…"
                style={{ ...iStyle, fontSize: '15px', fontWeight: 700, borderBottom: '1px dashed rgba(255,255,255,0.12)', marginBottom: '8px' }} />
              <textarea value={description} onChange={e => onDescriptionChange?.(e.target.value)}
                placeholder="Embed description…" rows={3}
                style={{ ...iStyle, resize: 'none', fontSize: '13px', color: 'rgba(255,255,255,0.82)', borderBottom: '1px dashed rgba(255,255,255,0.07)', lineHeight: '1.5' }} />
            </div>
            {/* Thumbnail zone */}
            <div onClick={() => vizClick(() => setAssetModal('thumbnail'))}
              title={isPremium ? 'Click to upload thumbnail' : 'Thumbnail (premium)'}
              style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: thumbnailUrl ? 'transparent' : 'rgba(255,255,255,0.04)', border: thumbnailUrl ? 'none' : '1px dashed rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {thumbnailUrl
                ? <img src={thumbnailUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '10px', lineHeight: '1.4' }}>
                    <div style={{ fontSize: '22px' }}>🖼</div>
                    {isPremium ? 'Upload' : '🔒'}
                  </div>
              }
            </div>
          </div>

          {/* Image zone */}
          {showImage && (
            <div onClick={() => vizClick(() => setAssetModal('image'))}
              title={isPremium ? 'Click to upload image/GIF' : 'Image (premium)'}
              style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(imageUrl ? {} : { height: '130px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }) }}>
              {imageUrl
                ? <img src={imageUrl} alt="embed-img" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', width: 'auto', height: 'auto', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🖼️</div>
                    <div>{isPremium ? '+ Upload image or GIF' : '🔒 Image (premium)'}</div>
                  </div>
              }
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {isPremium
              ? <input value={footerText} onChange={e => onFooterTextChange?.(e.target.value)}
                  placeholder="Footer text (empty = brand default)"
                  style={{ ...iStyle, fontSize: '11px', color: 'rgba(255,255,255,0.38)' }} />
              : <div onClick={() => setComingSoon(true)}
                  title="Footer text (premium)"
                  style={{ cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontFamily: 'Sora, sans-serif', padding: '2px 0', userSelect: 'none' }}>
                  {footerText || 'Powered by AVbot'} 🔒
                </div>
            }
          </div>
        </div>
      </div>

      {assetModal && (
        <AssetPickerModal serverId={serverId}
          onPick={(url) => { assetModal === 'thumbnail' ? onThumbnailChange?.(url) : onImageChange?.(url); setAssetModal(null); }}
          onClose={() => setAssetModal(null)} />
      )}
      {comingSoon && <ComingSoonModal onClose={() => setComingSoon(false)} />}
    </>
  );
};


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

  const sc         = analytics?.stat_cards ?? null;
  const hasData    = analytics?.has_any_data ?? null;

  // undefined signals "No data yet" (bot connected but no snapshots); null = loading
  const snapVal = (v) => analytics === null ? null : (!hasData ? undefined : (v ?? 0));

  const growth30d     = snapVal(sc?.month_joins);
  const totalMessages = snapVal(sc?.messages_month);

  const fmtGrowth = growth30d == null ? null
    : growth30d === undefined ? undefined
    : `+${growth30d.toLocaleString()}`;
  const fmtMessages = totalMessages == null ? null
    : totalMessages === undefined ? undefined
    : totalMessages.toLocaleString();

  const cards = [
    { label: 'Total Members',           icon: '👥', val: stats?.member_count?.toLocaleString() },
    { label: 'Active Members',          icon: '🟢', val: stats?.online_count?.toLocaleString(), sub: 'online now' },
    { label: 'Member Growth (30 days)', icon: '📈', val: fmtGrowth, sub: 'net joins' },
    { label: 'Total Messages',          icon: '💬', val: fmtMessages },
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
        {cards.map(c =>
          c.val === undefined
            ? <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px' }}>
                <div style={{ color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                <div style={{ color: C.muted, fontSize: '13px' }}>No data yet</div>
              </div>
            : c.val != null
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
  const { server, isPremium } = useContext(DashboardContext);
  const [v, setV] = useState({ ...VERIFY_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, VERIFY_CONFIG_MAP, VERIFY_DEFAULTS, setV);

  const [sendState, setSendState] = useState('idle');
  const [sendMsg,   setSendMsg]   = useState('');

  const handleSendEmbed = async () => {
    if (!server?.id || sendState === 'sending') return;
    const channelId = v.channel.trim();
    if (!channelId) {
      setSendMsg('Enter a channel name or ID first');
      setSendState('error');
      setTimeout(() => { setSendState('idle'); setSendMsg(''); }, 3000);
      return;
    }
    setSendState('sending');
    try {
      await sendVerifyMessage(server.id, channelId);
      setSendMsg('✓ Sent');
      setSendState('sent');
    } catch (e) {
      setSendMsg(e.message || 'Failed to send');
      setSendState('error');
    }
    setTimeout(() => { setSendState('idle'); setSendMsg(''); }, 4000);
  };

  const dmMaster = v.dmOnSuccessEnabled || v.dmOnKickEnabled;
  const toggleDmMaster = (val) => {
    if (!val) {
      set('dmOnSuccessEnabled')(false);
      set('dmOnKickEnabled')(false);
    } else {
      set('dmOnSuccessEnabled')(true);
    }
  };

  return (
    <div>
      <PageHeader icon="🔐" title="Verification" badge="MODULE" desc="Configure captcha verification for new members." />

      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Verification"
          desc="Require members to complete a captcha before accessing the server." />
      </SettingsCard>

      {v.enabled && (<>
        <SettingsCard title="Channel & Role">
          <FieldRow>
            <Field label="Verification Channel" hint="name or ID — where the Verify embed is posted">
              <Input value={v.channel} onChange={set('channel')} placeholder="#verify or 123456789" />
            </Field>
            <Field label="Success Role" hint="assigned when member passes captcha">
              <Input value={v.successRole} onChange={set('successRole')} placeholder="Verified" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Embed">
          <Field label="Button Label">
            <Input value={v.embedButtonLabel} onChange={set('embedButtonLabel')} placeholder="Verify" />
          </Field>
          <EmbedPreview
            serverId={server?.id}
            isPremium={isPremium}
            title={v.embedTitle}
            description={v.embedDescription}
            thumbnailUrl={v.verifyThumbnailUrl}
            imageUrl={v.verifyImageUrl}
            color={v.verifyColor || '#94730D'}
            footerText={v.verifyFooterText}
            onTitleChange={set('embedTitle')}
            onDescriptionChange={set('embedDescription')}
            onThumbnailChange={set('verifyThumbnailUrl')}
            onImageChange={set('verifyImageUrl')}
            onColorChange={set('verifyColor')}
            onFooterTextChange={set('verifyFooterText')}
          />
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSendEmbed}
              disabled={sendState === 'sending'}
              style={{
                background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)',
                color: '#7289da', padding: '10px 22px', borderRadius: '8px',
                cursor: sendState === 'sending' ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600,
                opacity: sendState === 'sending' ? 0.6 : 1, transition: 'background 0.2s',
              }}
              onMouseOver={e => { if (sendState !== 'sending') e.currentTarget.style.background = 'rgba(88,101,242,0.25)'; }}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.12)'}>
              {sendState === 'sending' ? '📨 Sending…' : '📨 Send Embed to Discord'}
            </button>
            {sendMsg && (
              <span style={{ fontSize: '13px', color: sendState === 'error' ? C.red : C.green }}>{sendMsg}</span>
            )}
          </div>
        </SettingsCard>

        <AdvancedSection>
          <Field label="Max Attempts" hint="before member is kicked (default: 3)">
            <Input type="number" value={v.maxAttempts} onChange={set('maxAttempts')} placeholder="3" style={{ maxWidth: '120px' }} />
          </Field>
          <div style={{ marginTop: '18px' }}>
            <Field label="Success Message" hint="shown as embed title after correct captcha">
              <Textarea value={v.successMessage} onChange={set('successMessage')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Wrong Attempt Message" hint="use {remaining} for attempts left">
              <Textarea value={v.wrongAttemptMessage} onChange={set('wrongAttemptMessage')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Last Chance Message" hint="shown before the final attempt">
              <Textarea value={v.lastChanceMessage} onChange={set('lastChanceMessage')} rows={2} />
            </Field>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Field label="Kicked Message" hint="shown when member is removed for too many failures">
              <Textarea value={v.kickedMessage} onChange={set('kickedMessage')} rows={2} />
            </Field>
          </div>
        </AdvancedSection>

        <SettingsCard title="Direct Messages">
          <Toggle value={dmMaster} onChange={toggleDmMaster} label="Send DMs?"
            desc="Send direct messages to members during verification events." />
          {dmMaster && (<>
            <SubToggle value={v.dmOnSuccessEnabled} onChange={set('dmOnSuccessEnabled')} label="DM on success">
              <Textarea value={v.dmOnSuccessMessage} onChange={set('dmOnSuccessMessage')} rows={2}
                placeholder="Welcome! You've been verified in {server}." />
            </SubToggle>
            <SubToggle value={v.dmOnKickEnabled} onChange={set('dmOnKickEnabled')} label="DM on kick">
              <Textarea value={v.dmOnKickMessage} onChange={set('dmOnKickMessage')} rows={2}
                placeholder="You were kicked from {server} for failing CAPTCHA. Feel free to try again." />
            </SubToggle>
          </>)}
        </SettingsCard>

      </>)}

      <ActionBar saveState={saveState} onSave={() => save(v)} />
    </div>
  );
};

// ── Role Select ───────────────────────────────────────────────────────────────

const BTN_FORM_DEFAULTS = {
  label: '',
  emoji: '',
  role: '',
  mode: 'toggle',
  confirm_give_enabled: false,
  confirm_give_message: 'Are you sure you want this role?',
  confirm_take_enabled: false,
  confirm_take_message: 'Are you sure you want to remove this role?',
  dm_give_enabled: false,
  dm_give_message: 'You received the {role} role in {server}.',
  dm_take_enabled: false,
  dm_take_message: 'You no longer have the {role} role in {server}.',
};

const MODE_BADGE_STYLES = {
  give:   { label: 'Give',   color: '#3ba55c' },
  take:   { label: 'Take',   color: '#ed4245' },
  toggle: { label: 'Toggle', color: '#C8A84E' },
};

const RoleSelectSettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const serverId = server?.id;

  const [panels, setPanels]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activePanelId, setActivePanelId] = useState(null);

  const [panelForm, setPanelForm]     = useState({ title: '', description: '', style: 'buttons', channel: '', thumbnail_url: '', image_url: '', color: '', footer_text: '' });
  const setPF                         = k => v => setPanelForm(p => ({ ...p, [k]: v }));
  const [panelSaving, setPanelSaving] = useState(false);
  const [panelSaveMsg, setPanelSaveMsg] = useState('');

  const [sendState, setSendState] = useState('idle');
  const [sendMsg,   setSendMsg]   = useState('');

  const [buttonModal, setButtonModal] = useState(null);
  const [btnForm, setBtnForm]         = useState({ ...BTN_FORM_DEFAULTS });
  const setBF                         = k => v => setBtnForm(p => ({ ...p, [k]: v }));
  const [btnSaving, setBtnSaving]     = useState(false);
  const [btnSaveMsg, setBtnSaveMsg]   = useState('');

  const [confirmPanelId, setConfirmPanelId]   = useState(null);
  const [confirmButtonId, setConfirmButtonId] = useState(null);

  const doFetch = async () => {
    if (!serverId) return;
    try {
      const { panels: p } = await listRolePanels(serverId);
      setPanels(p);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    setActivePanelId(null);
    setPanels([]);
    listRolePanels(serverId)
      .then(({ panels: p }) => { setPanels(p); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [serverId]); // eslint-disable-line

  useEffect(() => {
    const p = panels.find(x => x.panel_id === activePanelId);
    if (!p) return;
    setPanelForm({
      title:         p.title         || '',
      description:   p.description   || '',
      style:         p.style         || 'buttons',
      channel:       p.channel_id    ? String(p.channel_id) : '',
      thumbnail_url: p.thumbnail_url || '',
      image_url:     p.image_url     || '',
      color:         p.color         || '',
      footer_text:   p.footer_text   || '',
    });
    setSendMsg('');
    setSendState('idle');
    setPanelSaveMsg('');
  }, [activePanelId]); // eslint-disable-line

  const activePanel = panels.find(p => p.panel_id === activePanelId) || null;

  const handleCreatePanel = async () => {
    if (!serverId) return;
    try {
      const created = await createRolePanel(serverId, { title: '🎯 Role Selection', description: '', style: 'buttons' });
      await doFetch();
      setActivePanelId(created.panel_id);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSavePanel = async () => {
    if (!serverId || !activePanelId || panelSaving) return;
    setPanelSaving(true);
    setPanelSaveMsg('');
    try {
      const updates = {
        title: panelForm.title, description: panelForm.description, style: panelForm.style,
        thumbnail_url: panelForm.thumbnail_url || '',
        image_url:     panelForm.image_url     || '',
        color:         panelForm.color         || '',
        footer_text:   panelForm.footer_text   || '',
      };
      const chTrimmed = panelForm.channel.trim();
      if (chTrimmed) updates.channel_id = chTrimmed;
      await updateRolePanel(serverId, activePanelId, updates);
      setPanelSaveMsg('✓ Saved');
      await doFetch();
    } catch (e) {
      setPanelSaveMsg('✗ ' + e.message);
    } finally {
      setPanelSaving(false);
      setTimeout(() => setPanelSaveMsg(''), 3000);
    }
  };

  const handleDeletePanel = async (panelId) => {
    if (!serverId) return;
    try {
      await deleteRolePanel(serverId, panelId);
      setConfirmPanelId(null);
      if (activePanelId === panelId) setActivePanelId(null);
      await doFetch();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSend = async () => {
    if (!serverId || !activePanelId || sendState === 'sending') return;
    const chTrimmed = panelForm.channel.trim();
    if (!chTrimmed) {
      setSendMsg('Please enter a channel name or ID in the Channel field above');
      setSendState('error');
      setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 4000);
      return;
    }
    setSendState('sending');
    try {
      const res = await sendRolePanel(serverId, activePanelId, chTrimmed);
      setSendMsg(`✓ Sent (message ${res.message_id})`);
      setSendState('sent');
      await doFetch();
    } catch (e) {
      setSendMsg('✗ ' + e.message);
      setSendState('error');
    }
    setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 5000);
  };

  const handleRefresh = async () => {
    if (!serverId || !activePanelId || sendState === 'sending') return;
    setSendState('sending');
    try {
      await refreshRolePanel(serverId, activePanelId);
      setSendMsg('✓ Embed refreshed in Discord');
      setSendState('sent');
    } catch (e) {
      setSendMsg('✗ ' + e.message);
      setSendState('error');
    }
    setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 4000);
  };

  const openNewButton = () => {
    setBtnForm({ ...BTN_FORM_DEFAULTS });
    setBtnSaveMsg('');
    setButtonModal({ mode: 'new' });
  };

  const openEditButton = (btn) => {
    setBtnForm({
      label:                btn.label                || '',
      emoji:                btn.emoji                || '',
      role:                 btn.role                 || '',
      mode:                 btn.mode                 || 'toggle',
      confirm_give_enabled: btn.confirm_give_enabled === 1,
      confirm_give_message: btn.confirm_give_message || BTN_FORM_DEFAULTS.confirm_give_message,
      confirm_take_enabled: btn.confirm_take_enabled === 1,
      confirm_take_message: btn.confirm_take_message || BTN_FORM_DEFAULTS.confirm_take_message,
      dm_give_enabled:      btn.dm_give_enabled      === 1,
      dm_give_message:      btn.dm_give_message      || BTN_FORM_DEFAULTS.dm_give_message,
      dm_take_enabled:      btn.dm_take_enabled      === 1,
      dm_take_message:      btn.dm_take_message      || BTN_FORM_DEFAULTS.dm_take_message,
    });
    setBtnSaveMsg('');
    setButtonModal({ mode: 'edit', buttonId: btn.button_id });
  };

  const handleSaveButton = async () => {
    if (!serverId || !activePanelId || btnSaving) return;
    if (!btnForm.label.trim()) { setBtnSaveMsg('Label is required'); return; }
    if (!btnForm.role.trim())  { setBtnSaveMsg('Role is required');  return; }
    setBtnSaving(true);
    setBtnSaveMsg('');
    try {
      const payload = {
        ...btnForm,
        confirm_give_enabled: btnForm.confirm_give_enabled ? 1 : 0,
        confirm_take_enabled: btnForm.confirm_take_enabled ? 1 : 0,
        dm_give_enabled:      btnForm.dm_give_enabled      ? 1 : 0,
        dm_take_enabled:      btnForm.dm_take_enabled      ? 1 : 0,
      };
      if (buttonModal.mode === 'new') {
        await createRoleButton(serverId, activePanelId, payload);
      } else {
        await updateRoleButton(serverId, activePanelId, buttonModal.buttonId, payload);
      }
      setButtonModal(null);
      await doFetch();
    } catch (e) {
      setBtnSaveMsg('✗ ' + e.message);
    } finally {
      setBtnSaving(false);
    }
  };

  const handleDeleteButton = async (buttonId) => {
    if (!serverId || !activePanelId) return;
    try {
      await deleteRoleButton(serverId, activePanelId, buttonId);
      setConfirmButtonId(null);
      await doFetch();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <PageHeader icon="🎭" title="Role Selection" badge="MODULE"
        desc="Create role selection embeds — each embed is a Discord message with role buttons." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
        </div>
      )}

      {/* ── Section A: Embed list ── */}
      <SettingsCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role Selection Embeds</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>Each embed is a Discord message with role buttons inside. You can have multiple embeds in different channels.</div>
          </div>
          <button onClick={handleCreatePanel}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0, marginLeft: '16px' }}>
            + New Embed
          </button>
        </div>

        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px', padding: '16px 0' }}>Loading…</div>
        ) : panels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🎭</div>
            <div style={{ fontSize: '14px' }}>No embeds yet. Click <strong style={{ color: C.gold }}>+ New Embed</strong> to start.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {panels.map(panel => {
              const isActive = activePanelId === panel.panel_id;
              const isSent   = !!panel.message_id;
              const btnCount = (panel.buttons || []).length;
              return (
                <div key={panel.panel_id}
                  style={{ background: isActive ? 'rgba(200,168,78,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isActive ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'border-color 0.2s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{panel.title}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px', display: 'flex', gap: '12px' }}>
                      <span>{isSent ? `✓ Sent` : '⏳ Not sent yet'}</span>
                      <span>🔘 {btnCount} button{btnCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => setActivePanelId(isActive ? null : panel.panel_id)}
                      style={{ background: isActive ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isActive ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 12px', color: isActive ? C.gold : '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      {isActive ? '▲ Close' : '✏️ Edit'}
                    </button>
                    {confirmPanelId === panel.panel_id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.red }}>Delete?</span>
                        <button onClick={() => handleDeletePanel(panel.panel_id)}
                          style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                        <button onClick={() => setConfirmPanelId(null)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmPanelId(panel.panel_id)}
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* ── Section B: Panel editor ── */}
      {activePanel && (<>
        <SettingsCard title="Embed Details">
          <EmbedPreview
            serverId={serverId}
            isPremium={isPremium}
            title={panelForm.title}
            description={panelForm.description}
            thumbnailUrl={panelForm.thumbnail_url}
            imageUrl={panelForm.image_url}
            color={panelForm.color || '#94730D'}
            footerText={panelForm.footer_text}
            onTitleChange={setPF('title')}
            onDescriptionChange={setPF('description')}
            onThumbnailChange={setPF('thumbnail_url')}
            onImageChange={setPF('image_url')}
            onColorChange={setPF('color')}
            onFooterTextChange={setPF('footer_text')}
          />
          <FieldRow style={{ marginTop: '14px' }}>
            <Field label="Style">
              <Select value={panelForm.style} onChange={setPF('style')} options={[
                { value: 'buttons',  label: 'Buttons' },
                { value: 'dropdown', label: 'Dropdown menu' },
              ]} />
            </Field>
            <Field label="Channel" hint="channel name or ID">
              <Input value={panelForm.channel} onChange={setPF('channel')} placeholder="1234567890123456789" />
            </Field>
          </FieldRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
            <button onClick={handleSavePanel} disabled={panelSaving} className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', opacity: panelSaving ? 0.7 : 1 }}>
              {panelSaving ? 'Saving…' : 'Save Embed Details'}
            </button>
            {panelSaveMsg && (
              <span style={{ fontSize: '13px', color: panelSaveMsg.startsWith('✓') ? C.green : C.red }}>{panelSaveMsg}</span>
            )}
          </div>
        </SettingsCard>

        <SettingsCard title="Role Buttons">
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '13px' }}>Each button gives, removes, or toggles a role when clicked.</p>
          {(activePanel.buttons || []).length === 0 ? (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
              No buttons yet. Click + Add Button to create your first one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {(activePanel.buttons || []).map((btn, idx) => {
                const modeStyle = MODE_BADGE_STYLES[btn.mode] || MODE_BADGE_STYLES.toggle;
                return (
                  <div key={btn.button_id}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(200,168,78,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: C.gold, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{btn.emoji ? `${btn.emoji} ` : ''}{btn.label}</div>
                      <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{btn.role}</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: `${modeStyle.color}20`, border: `1px solid ${modeStyle.color}40`, color: modeStyle.color, letterSpacing: '0.04em', flexShrink: 0 }}>{modeStyle.label}</span>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                      <button onClick={() => openEditButton(btn)}
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '4px 10px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>Edit</button>
                      {confirmButtonId === btn.button_id ? (
                        <>
                          <button onClick={() => handleDeleteButton(btn.button_id)}
                            style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '5px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                          <button onClick={() => setConfirmButtonId(null)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmButtonId(btn.button_id)}
                          style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '2px 6px', lineHeight: 1 }}>×</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={openNewButton}
            style={{ background: 'rgba(200,168,78,0.08)', border: '1px dashed rgba(200,168,78,0.3)', color: C.gold, padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>
            + Add Button
          </button>
        </SettingsCard>

        <SettingsCard title="Discord">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleSend} disabled={sendState === 'sending'}
              style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '10px 22px', borderRadius: '8px', cursor: sendState === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, opacity: sendState === 'sending' ? 0.6 : 1, transition: 'background 0.2s' }}
              onMouseOver={e => { if (sendState !== 'sending') e.currentTarget.style.background = 'rgba(88,101,242,0.25)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(88,101,242,0.12)'; }}>
              {sendState === 'sending' ? '📨 Sending…' : activePanel.message_id ? '📨 Re-send' : '📨 Send to Discord'}
            </button>
            {activePanel.message_id && (
              <button onClick={handleRefresh} disabled={sendState === 'sending'}
                style={{ background: 'rgba(200,168,78,0.08)', border: '1px solid rgba(200,168,78,0.25)', color: C.gold, padding: '10px 22px', borderRadius: '8px', cursor: sendState === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, opacity: sendState === 'sending' ? 0.6 : 1, transition: 'background 0.2s' }}
                onMouseOver={e => { if (sendState !== 'sending') e.currentTarget.style.background = 'rgba(200,168,78,0.18)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(200,168,78,0.08)'; }}>
                🔄 Refresh
              </button>
            )}
            {sendMsg && (
              <span style={{ fontSize: '13px', color: sendState === 'error' ? C.red : C.green }}>{sendMsg}</span>
            )}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
            {confirmPanelId === activePanel.panel_id ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: C.red }}>Delete this embed permanently?</span>
                <button onClick={() => handleDeletePanel(activePanel.panel_id)}
                  style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '7px', padding: '7px 14px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>Yes, Delete</button>
                <button onClick={() => setConfirmPanelId(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '7px 14px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmPanelId(activePanel.panel_id)}
                style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.25)', borderRadius: '7px', padding: '8px 18px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>
                🗑️ Delete this Embed
              </button>
            )}
          </div>
        </SettingsCard>
      </>)}

      {/* ── Section C: Button editor modal ── */}
      {buttonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px', overflowY: 'auto' }}>
          <div style={{ background: '#13131a', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {buttonModal.mode === 'new' ? 'Add Role Button' : 'Edit Role Button'}
              </div>
              <button onClick={() => { setButtonModal(null); setBtnSaveMsg(''); }}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            <FieldRow>
              <Field label="Label">
                <Input value={btnForm.label} onChange={setBF('label')} placeholder="Click me" />
              </Field>
              <Field label="Emoji" hint="single emoji or leave empty">
                <Input value={btnForm.emoji} onChange={setBF('emoji')} placeholder="🎯" />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Role" hint="role name or ID">
                <Input value={btnForm.role} onChange={setBF('role')} placeholder="Member" />
              </Field>
              <Field label="Mode">
                <Select value={btnForm.mode} onChange={setBF('mode')} options={[
                  { value: 'toggle', label: 'Toggle (give & take)' },
                  { value: 'give',   label: 'Give only' },
                  { value: 'take',   label: 'Take only' },
                ]} />
              </Field>
            </FieldRow>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '14px' }}>
              <Toggle value={btnForm.confirm_give_enabled} onChange={setBF('confirm_give_enabled')}
                label="Confirm before giving" desc="Ask the user to confirm before adding the role." />
              {btnForm.confirm_give_enabled && (
                <div style={{ marginTop: '8px' }}>
                  <Textarea value={btnForm.confirm_give_message} onChange={setBF('confirm_give_message')} rows={2}
                    placeholder="Are you sure you want this role?" />
                </div>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px' }}>
              <Toggle value={btnForm.confirm_take_enabled} onChange={setBF('confirm_take_enabled')}
                label="Confirm before removing" desc="Ask the user to confirm before removing the role." />
              {btnForm.confirm_take_enabled && (
                <div style={{ marginTop: '8px' }}>
                  <Textarea value={btnForm.confirm_take_message} onChange={setBF('confirm_take_message')} rows={2}
                    placeholder="Are you sure you want to remove this role?" />
                </div>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px' }}>
              <Toggle value={btnForm.dm_give_enabled} onChange={setBF('dm_give_enabled')}
                label="Send DM when given" desc="DM the user when the role is added." />
              {btnForm.dm_give_enabled && (
                <div style={{ marginTop: '8px' }}>
                  <Label hint="use {role} and {server}">Message</Label>
                  <Textarea value={btnForm.dm_give_message} onChange={setBF('dm_give_message')} rows={2}
                    placeholder="You received the {role} role in {server}." />
                </div>
              )}
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px', marginBottom: '20px' }}>
              <Toggle value={btnForm.dm_take_enabled} onChange={setBF('dm_take_enabled')}
                label="Send DM when removed" desc="DM the user when the role is removed." />
              {btnForm.dm_take_enabled && (
                <div style={{ marginTop: '8px' }}>
                  <Label hint="use {role} and {server}">Message</Label>
                  <Textarea value={btnForm.dm_take_message} onChange={setBF('dm_take_message')} rows={2}
                    placeholder="You no longer have the {role} role in {server}." />
                </div>
              )}
            </div>

            {btnSaveMsg && (
              <div style={{ marginBottom: '14px', fontSize: '13px', color: btnSaveMsg.startsWith('✗') ? C.red : C.green }}>{btnSaveMsg}</div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSaveButton} disabled={btnSaving} className="btn-primary"
                style={{ padding: '10px 28px', fontSize: '14px', opacity: btnSaving ? 0.7 : 1 }}>
                {btnSaving ? 'Saving…' : 'Save Button'}
              </button>
              <button onClick={() => { setButtonModal(null); setBtnSaveMsg(''); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 20px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Forms ─────────────────────────────────────────────────────────────────────

const FIELD_TYPE_OPTIONS = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text',  label: 'Long Text' },
  { value: 'number',     label: 'Number' },
  { value: 'dropdown',   label: 'Dropdown' },
];

const FORM_EDITOR_DEFAULTS = {
  name: '', title: '', description: '', button_label: 'Apply',
  thumbnail_url: '', image_url: '', color: '', footer_text: '',
  channel_id: '', ticket_category: '', staff_roles: '', ping_role: '',
  approve_role: '', approve_dm_enabled: false, approve_dm_message: '',
  reject_dm_enabled: false, reject_dm_message: '',
};

const FIELD_MODAL_DEFAULTS = {
  label: '', field_type: 'short_text', placeholder: '',
  required: true, max_length: '', options: '',
};

const FormsSettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const serverId = server?.id;

  const [forms, setForms]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeFormId, setActiveFormId] = useState(null);

  const [editor, setEditor]   = useState({ ...FORM_EDITOR_DEFAULTS });
  const setEd                 = k => v => setEditor(p => ({ ...p, [k]: v }));
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [sendState, setSendState] = useState('idle');
  const [sendMsg, setSendMsg]     = useState('');

  const [fieldModal, setFieldModal] = useState(null);
  const [fmData, setFmData]         = useState({ ...FIELD_MODAL_DEFAULTS });
  const setFm                       = k => v => setFmData(p => ({ ...p, [k]: v }));
  const [fmSaving, setFmSaving]     = useState(false);
  const [fmErr, setFmErr]           = useState('');

  const [confirmFormId,  setConfirmFormId]  = useState(null);
  const [confirmFieldId, setConfirmFieldId] = useState(null);

  const doFetch = async () => {
    if (!serverId) return;
    try {
      const { forms: f } = await listForms(serverId);
      setForms(f);
      setError(null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    setActiveFormId(null);
    setForms([]);
    listForms(serverId)
      .then(({ forms: f }) => { setForms(f); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [serverId]); // eslint-disable-line

  useEffect(() => {
    const f = forms.find(x => x.form_id === activeFormId);
    if (!f) return;
    setEditor({
      name:               f.name               || '',
      title:              f.title              || '',
      description:        f.description        || '',
      button_label:       f.button_label       || 'Apply',
      thumbnail_url:      f.thumbnail_url      || '',
      image_url:          f.image_url          || '',
      color:              f.color              || '',
      footer_text:        f.footer_text        || '',
      channel_id:         f.channel_id         || '',
      ticket_category:    f.ticket_category    || '',
      staff_roles:        f.staff_roles        || '',
      ping_role:          f.ping_role          || '',
      approve_role:       f.approve_role       || '',
      approve_dm_enabled: f.approve_dm_enabled === 1 || f.approve_dm_enabled === true,
      approve_dm_message: f.approve_dm_message || '',
      reject_dm_enabled:  f.reject_dm_enabled  === 1 || f.reject_dm_enabled === true,
      reject_dm_message:  f.reject_dm_message  || '',
    });
    setSaveMsg(''); setSendMsg(''); setSendState('idle');
  }, [activeFormId]); // eslint-disable-line

  const activeForm = forms.find(f => f.form_id === activeFormId) || null;

  const handleCreateForm = async () => {
    if (!serverId) return;
    try {
      const created = await createForm(serverId, 'New Form');
      await doFetch();
      setActiveFormId(created.form_id);
    } catch (e) { setError(e.message); }
  };

  const handleSaveForm = async () => {
    if (!serverId || !activeFormId || saving) return;
    setSaving(true); setSaveMsg('');
    try {
      await updateForm(serverId, activeFormId, {
        ...editor,
        approve_dm_enabled: editor.approve_dm_enabled ? 1 : 0,
        reject_dm_enabled:  editor.reject_dm_enabled  ? 1 : 0,
      });
      setSaveMsg('✓ Saved');
      await doFetch();
    } catch (e) { setSaveMsg('✗ ' + e.message); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3000); }
  };

  const handleDeleteForm = async (formId) => {
    if (!serverId) return;
    try {
      await deleteForm(serverId, formId);
      setConfirmFormId(null);
      if (activeFormId === formId) setActiveFormId(null);
      await doFetch();
    } catch (e) { setError(e.message); }
  };

  const handleSend = async () => {
    if (!serverId || !activeFormId || sendState === 'sending') return;
    const ch = editor.channel_id.trim();
    if (!ch) {
      setSendMsg('Enter a channel name or ID first');
      setSendState('error');
      setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 3500);
      return;
    }
    setSendState('sending');
    try {
      const res = await sendForm(serverId, activeFormId, ch);
      setSendMsg(`✓ Sent (msg ${res.message_id})`);
      setSendState('sent');
      await doFetch();
    } catch (e) {
      setSendMsg('✗ ' + e.message);
      setSendState('error');
    }
    setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 5000);
  };

  const openNewField = () => {
    setFmData({ ...FIELD_MODAL_DEFAULTS });
    setFmErr(''); setFieldModal({ mode: 'new' });
  };
  const openEditField = (f) => {
    setFmData({
      label:      f.label      || '',
      field_type: f.field_type || 'short_text',
      placeholder: f.placeholder || '',
      required:   f.required === 1 || f.required === true,
      max_length: f.max_length != null ? String(f.max_length) : '',
      options:    (() => {
        try { const a = JSON.parse(f.options || '[]'); return a.join('\n'); }
        catch { return ''; }
      })(),
    });
    setFmErr(''); setFieldModal({ mode: 'edit', fieldId: f.field_id });
  };

  const handleSaveField = async () => {
    if (!serverId || !activeFormId || fmSaving) return;
    if (!fmData.label.trim()) { setFmErr('Label is required'); return; }
    if (fmData.label.length > 45) { setFmErr('Label must be ≤ 45 characters'); return; }
    if (fmData.placeholder.length > 100) { setFmErr('Placeholder must be ≤ 100 characters'); return; }

    let options = '';
    if (fmData.field_type === 'dropdown') {
      const lines = fmData.options.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) { setFmErr('Dropdown requires at least 1 option'); return; }
      if (lines.length > 25) { setFmErr('Dropdown can have at most 25 options'); return; }
      options = JSON.stringify(lines);
    }

    const payload = {
      label:      fmData.label.trim(),
      field_type: fmData.field_type,
      placeholder: fmData.placeholder,
      required:   fmData.required ? 1 : 0,
      options,
      max_length: fmData.max_length ? parseInt(fmData.max_length, 10) || null : null,
    };

    setFmSaving(true); setFmErr('');
    try {
      if (fieldModal.mode === 'new') {
        const currentFields = activeForm?.fields || [];
        await createFormField(serverId, activeFormId, { ...payload, position: currentFields.length });
      } else {
        await updateFormField(serverId, activeFormId, fieldModal.fieldId, payload);
      }
      setFieldModal(null);
      await doFetch();
    } catch (e) { setFmErr('✗ ' + e.message); }
    finally { setFmSaving(false); }
  };

  const handleDeleteField = async (fieldId) => {
    if (!serverId || !activeFormId) return;
    try {
      await deleteFormField(serverId, activeFormId, fieldId);
      setConfirmFieldId(null);
      await doFetch();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <PageHeader icon="📋" title="Forms" badge="MODULE"
        desc="Build custom application forms — each form posts a panel embed with an Apply button." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── Section A: Form list ── */}
      <SettingsCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Application Forms</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>Each form has its own panel embed with custom fields and approve/reject workflow.</div>
          </div>
          <button onClick={handleCreateForm}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0, marginLeft: '16px' }}>
            + New Form
          </button>
        </div>
        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px', padding: '16px 0' }}>Loading…</div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📋</div>
            <div style={{ fontSize: '14px' }}>No forms yet. Click <strong style={{ color: C.gold }}>+ New Form</strong> to start.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {forms.map(form => {
              const isActive = activeFormId === form.form_id;
              const fieldCount = (form.fields || []).length;
              return (
                <div key={form.form_id}
                  style={{ background: isActive ? 'rgba(200,168,78,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isActive ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.name}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px' }}>
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                      {form.channel_id ? ` · Sent` : ' · Not sent'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => setActiveFormId(isActive ? null : form.form_id)}
                      style={{ background: isActive ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isActive ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 12px', color: isActive ? C.gold : '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      {isActive ? '▲ Close' : '✏️ Edit'}
                    </button>
                    {confirmFormId === form.form_id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.red }}>Delete?</span>
                        <button onClick={() => handleDeleteForm(form.form_id)}
                          style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                        <button onClick={() => setConfirmFormId(null)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmFormId(form.form_id)}
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* ── Section B: Form editor ── */}
      {activeForm && (<>

        <SettingsCard title="Form Info">
          <Field label="Form Name">
            <Input value={editor.name} onChange={setEd('name')} placeholder="Creator Application" />
          </Field>
        </SettingsCard>

        <SettingsCard title="Panel Embed">
          <Field label="Button Label">
            <Input value={editor.button_label} onChange={setEd('button_label')} placeholder="Apply" style={{ maxWidth: '200px' }} />
          </Field>
          <EmbedPreview
            serverId={serverId}
            isPremium={isPremium}
            title={editor.title}
            description={editor.description}
            thumbnailUrl={editor.thumbnail_url}
            imageUrl={editor.image_url}
            color={editor.color || '#94730D'}
            footerText={editor.footer_text}
            onTitleChange={setEd('title')}
            onDescriptionChange={setEd('description')}
            onThumbnailChange={setEd('thumbnail_url')}
            onImageChange={setEd('image_url')}
            onColorChange={setEd('color')}
            onFooterTextChange={setEd('footer_text')}
          />
        </SettingsCard>

        <SettingsCard title="Submission Settings">
          <FieldRow>
            <Field label="Channel" hint="name or ID — where to post the panel embed">
              <Input value={editor.channel_id} onChange={setEd('channel_id')} placeholder="#apply or 1234567890" />
            </Field>
            <Field label="Ticket Category" hint="Discord category for submission threads">
              <Input value={editor.ticket_category} onChange={setEd('ticket_category')} placeholder="Applications" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Staff Roles" hint="comma-separated — can see and decide on submissions">
              <Input value={editor.staff_roles} onChange={setEd('staff_roles')} placeholder="Admins, Mods" />
            </Field>
            <Field label="Ping Role" hint="optional — mentioned when a submission arrives">
              <Input value={editor.ping_role} onChange={setEd('ping_role')} placeholder="Staff" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Approve Action">
          <Field label="Role to Give" hint="optional — granted to approved applicants">
            <Input value={editor.approve_role} onChange={setEd('approve_role')} placeholder="Member" style={{ maxWidth: '300px' }} />
          </Field>
          <div style={{ marginTop: '14px' }}>
            <SubToggle value={editor.approve_dm_enabled} onChange={setEd('approve_dm_enabled')} label="DM applicant on approve">
              <Textarea value={editor.approve_dm_message} onChange={setEd('approve_dm_message')} rows={2}
                placeholder="Congratulations! Your application was approved." />
            </SubToggle>
          </div>
        </SettingsCard>

        <SettingsCard title="Reject Action">
          <SubToggle value={editor.reject_dm_enabled} onChange={setEd('reject_dm_enabled')} label="DM applicant on reject">
            <Textarea value={editor.reject_dm_message} onChange={setEd('reject_dm_message')} rows={2}
              placeholder="Thank you for applying. Your application was not approved this time." />
          </SubToggle>
        </SettingsCard>

        {/* ── Section C: Field editor ── */}
        <SettingsCard title="Form Fields">
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '13px' }}>
            Fields appear in Discord modals when users click Apply. Max 45-char labels, 5 fields per modal step.
          </p>
          {(activeForm.fields || []).length === 0 ? (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
              No fields yet. Click + Add Field to create your first one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {(activeForm.fields || []).map((f, idx) => (
                <div key={f.field_id}
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(200,168,78,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: C.gold, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>
                      {FIELD_TYPE_OPTIONS.find(o => o.value === f.field_type)?.label || f.field_type}
                      {f.required ? ' · required' : ' · optional'}
                      {f.max_length ? ` · max ${f.max_length}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => openEditField(f)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '4px 10px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>Edit</button>
                    {confirmFieldId === f.field_id ? (
                      <>
                        <button onClick={() => handleDeleteField(f.field_id)}
                          style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '5px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                        <button onClick={() => setConfirmFieldId(null)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmFieldId(f.field_id)}
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '2px 6px', lineHeight: 1 }}>×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={openNewField}
            style={{ background: 'rgba(200,168,78,0.08)', border: '1px dashed rgba(200,168,78,0.3)', color: C.gold, padding: '8px 16px', borderRadius: '7px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' }}>
            + Add Field
          </button>
        </SettingsCard>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button onClick={handleSaveForm} disabled={saving} className="btn-primary"
            style={{ padding: '11px 28px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Form'}
          </button>
          <button onClick={handleSend} disabled={sendState === 'sending'}
            style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '11px 24px', borderRadius: '8px', cursor: sendState === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, opacity: sendState === 'sending' ? 0.6 : 1 }}>
            {sendState === 'sending' ? '📨 Sending…' : '📨 Send to Discord'}
          </button>
          {saveMsg && <span style={{ fontSize: '13px', color: saveMsg.startsWith('✓') ? C.green : C.red }}>{saveMsg}</span>}
          {sendMsg && <span style={{ fontSize: '13px', color: sendState === 'error' ? C.red : C.green }}>{sendMsg}</span>}
        </div>
      </>)}

      {/* ── Field editor modal ── */}
      {fieldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#13131a', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{fieldModal.mode === 'new' ? 'Add Field' : 'Edit Field'}</div>
              <button onClick={() => setFieldModal(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Label <span style={{ fontSize: '11px', color: C.muted }}>max 45 chars</span></Label>
              <Input value={fmData.label} onChange={setFm('label')} placeholder="e.g. Your Name" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Field Type</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {FIELD_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setFm('field_type')(opt.value)}
                    style={{ background: fmData.field_type === opt.value ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${fmData.field_type === opt.value ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '7px', padding: '8px', color: fmData.field_type === opt.value ? C.gold : C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Label>Placeholder <span style={{ fontSize: '11px', color: C.muted }}>optional, max 100 chars</span></Label>
              <Input value={fmData.placeholder} onChange={setFm('placeholder')} placeholder="e.g. Enter your answer here" />
            </div>

            {(fmData.field_type === 'short_text' || fmData.field_type === 'number') && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Max Length <span style={{ fontSize: '11px', color: C.muted }}>optional</span></Label>
                <Input type="number" value={fmData.max_length} onChange={setFm('max_length')} placeholder="e.g. 100" style={{ maxWidth: '140px' }} />
              </div>
            )}

            {fmData.field_type === 'long_text' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Max Length <span style={{ fontSize: '11px', color: C.muted }}>optional, max 4000</span></Label>
                <Input type="number" value={fmData.max_length} onChange={setFm('max_length')} placeholder="e.g. 500" style={{ maxWidth: '140px' }} />
              </div>
            )}

            {fmData.field_type === 'dropdown' && (
              <div style={{ marginBottom: '16px' }}>
                <Label>Options <span style={{ fontSize: '11px', color: C.muted }}>one per line, max 25</span></Label>
                <Textarea value={fmData.options} onChange={setFm('options')} rows={5} placeholder={'Option A\nOption B\nOption C'} />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <Toggle value={fmData.required} onChange={setFm('required')} label="Required" desc="User must fill this field to submit" />
            </div>

            {fmErr && <div style={{ color: C.red, fontSize: '13px', marginBottom: '12px' }}>{fmErr}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveField} disabled={fmSaving}
                style={{ flex: 1, background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '11px', color: '#0A0A0F', cursor: fmSaving ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, opacity: fmSaving ? 0.7 : 1 }}>
                {fmSaving ? 'Saving…' : fieldModal.mode === 'new' ? 'Add Field' : 'Save Field'}
              </button>
              <button onClick={() => setFieldModal(null)}
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '11px 18px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tickets ───────────────────────────────────────────────────────────────────

const TicketsSettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const [v, setV] = useState({ ...TICKETS_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, TICKETS_CONFIG_MAP, TICKETS_DEFAULTS, setV);

  const [sendState, setSendState] = useState('idle');
  const [sendMsg,   setSendMsg]   = useState('');

  const handleSendPanel = async () => {
    if (!server?.id || sendState === 'sending') return;
    setSendState('sending');
    try {
      const res = await sendTicketsPanel(server.id);
      setSendMsg(`✓ Sent to #${res.channel_name}`);
      setSendState('sent');
    } catch (e) {
      setSendMsg(e.message || 'Failed to send');
      setSendState('error');
    }
    setTimeout(() => { setSendState('idle'); setSendMsg(''); }, 4000);
  };

  const dmMaster = v.dmOnOpenEnabled || v.dmOnCloseEnabled;
  const toggleDmMaster = (val) => {
    if (!val) {
      set('dmOnOpenEnabled')(false);
      set('dmOnCloseEnabled')(false);
    } else {
      set('dmOnOpenEnabled')(true);
    }
  };

  return (
    <div>
      <PageHeader icon="🎫" title="Tickets" badge="MODULE" desc="Config-driven support ticket system — members open private channels with one click." />

      <SettingsCard title="Module">
        <Toggle value={v.enabled} onChange={set('enabled')} label="Enable Tickets" />
      </SettingsCard>

      {v.enabled && (<>
        {/* Panel Embed */}
        <SettingsCard title="Panel Embed">
          <FieldRow>
            <Field label="Panel Channel" hint="name or ID — where the Open Ticket button is posted">
              <Input value={v.panelChannel} onChange={set('panelChannel')} placeholder="#support or 123456789" />
            </Field>
            <Field label="Button Label">
              <Input value={v.panelButtonLabel} onChange={set('panelButtonLabel')} placeholder="Open Ticket" />
            </Field>
          </FieldRow>
          <EmbedPreview
            serverId={server?.id}
            isPremium={isPremium}
            title={v.panelTitle}
            description={v.panelDesc}
            thumbnailUrl={v.panelThumbnailUrl}
            imageUrl={v.panelImageUrl}
            color={v.panelColor || '#94730D'}
            footerText={v.panelFooterText}
            onTitleChange={set('panelTitle')}
            onDescriptionChange={set('panelDesc')}
            onThumbnailChange={set('panelThumbnailUrl')}
            onImageChange={set('panelImageUrl')}
            onColorChange={set('panelColor')}
            onFooterTextChange={set('panelFooterText')}
          />
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSendPanel}
              disabled={sendState === 'sending'}
              style={{
                background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)',
                color: '#7289da', padding: '10px 22px', borderRadius: '8px',
                cursor: sendState === 'sending' ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600,
                opacity: sendState === 'sending' ? 0.6 : 1, transition: 'background 0.2s',
              }}
              onMouseOver={e => { if (sendState !== 'sending') e.currentTarget.style.background = 'rgba(88,101,242,0.25)'; }}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.12)'}>
              {sendState === 'sending' ? '📨 Sending…' : '📨 Send Panel'}
            </button>
            {sendMsg && (
              <span style={{ fontSize: '13px', color: sendState === 'error' ? C.red : C.green }}>{sendMsg}</span>
            )}
          </div>
        </SettingsCard>

        {/* Ticket Channels */}
        <SettingsCard title="Ticket Channels">
          <FieldRow>
            <Field label="Ticket Category" hint="Discord category where ticket channels are created">
              <Input value={v.category} onChange={set('category')} placeholder="Support Tickets" />
            </Field>
            <Field label="Archive Channel" hint="optional — transcript posted here on close">
              <Input value={v.archiveChannel} onChange={set('archiveChannel')} placeholder="#ticket-archive or 123456789" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Staff Roles" hint="comma-separated names or IDs — can view and close tickets">
              <Input value={v.staffRoles} onChange={set('staffRoles')} placeholder="Support Team, Admins" />
            </Field>
            <Field label="Ping Role on New Ticket" hint="optional — leave blank to disable">
              <Input value={v.pingRole} onChange={set('pingRole')} placeholder="Support Team" />
            </Field>
          </FieldRow>
        </SettingsCard>

        {/* Welcome Message */}
        <SettingsCard title="Welcome Message">
          <Field label="Sent inside each new ticket channel" hint="use {user} for the opener's mention">
            <Textarea value={v.welcomeMessage} onChange={set('welcomeMessage')} rows={3}
              placeholder="Hi {user}, thanks for opening a ticket. A staff member will be with you shortly." />
          </Field>
        </SettingsCard>

        {/* Auto-Close */}
        <SettingsCard title="Auto-Close">
          <Toggle value={v.autoCloseEnabled} onChange={set('autoCloseEnabled')} label="Enable Auto-Close"
            desc="Automatically close tickets after a period of inactivity." />
          {v.autoCloseEnabled && (<>
            <FieldRow style={{ marginTop: '14px' }}>
              <Field label="Warning after (hours)" hint="inactivity hours before warning is sent">
                <Input type="number" value={v.autoCloseWarningHours} onChange={set('autoCloseWarningHours')} placeholder="48" />
              </Field>
              <Field label="Close after (hours)" hint="inactivity hours before ticket is auto-closed">
                <Input type="number" value={v.autoCloseFinalHours} onChange={set('autoCloseFinalHours')} placeholder="72" />
              </Field>
            </FieldRow>
            <Field label="Warning message">
              <Textarea value={v.autoCloseWarningMsg} onChange={set('autoCloseWarningMsg')} rows={2}
                placeholder="This ticket has been inactive for 48 hours..." />
            </Field>
          </>)}
        </SettingsCard>

        {/* DM Section */}
        <SettingsCard title="Direct Messages">
          <Toggle
            value={dmMaster}
            onChange={toggleDmMaster}
            label="Send DMs to ticket opener?"
            desc="Send direct messages when tickets are opened or closed."
          />
          {dmMaster && (<>
            <SubToggle value={v.dmOnOpenEnabled} onChange={set('dmOnOpenEnabled')} label="DM on ticket open">
              <Textarea value={v.dmOnOpenMessage} onChange={set('dmOnOpenMessage')} rows={2}
                placeholder="Your support ticket has been opened in {server}. We'll be in touch soon." />
            </SubToggle>
            <SubToggle value={v.dmOnCloseEnabled} onChange={set('dmOnCloseEnabled')} label="DM on ticket close">
              <Textarea value={v.dmOnCloseMessage} onChange={set('dmOnCloseMessage')} rows={2}
                placeholder="Your support ticket in {server} has been closed." />
            </SubToggle>
          </>)}
        </SettingsCard>
      </>)}

      <ActionBar saveState={saveState} onSave={() => save(v)} />
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
  // Main embed
  mainEmbedTitle:      '🛡️ Server Protection',
  mainEmbedDesc:       'This server is protected by AVbot. Attempting spam, phishing, raids, or abuse will result in automated action.',
  mainEmbedChannel:    '',
  // Link Detection
  linkEnabled:         true,
  linkWhitelist:       'twitter.com,x.com,discord.gg,youtube.com',
  linkAction:          'delete',
  linkDm:              false,
  dmLinkMsg:           "Your link was removed because it's not whitelisted on this server.",
  // Phishing
  phishingEnabled:     true,
  phishingAction:      'delete',
  phishingList:        '',
  phishingDm:          false,
  dmPhishingMsg:       'Your message was removed — it contained a phishing link.',
  // Spam
  spamEnabled:         true,
  spamThreshold:       '5',
  spamWindow:          '10',
  spamAction:          'mute',
  spamMuteDuration:    '600',
  spamDm:              false,
  dmSpamMsg:           'You were muted for spamming. Duration: {duration}s.',
  // Banned Words
  bannedEnabled:       false,
  bannedList:          '',
  bannedAction:        'delete',
  bannedDm:            false,
  dmBannedMsg:         'Your message contained a banned word and was removed.',
  // Suspicious Users
  suspEnabled:         true,
  suspNoAvatar:        true,
  suspUsernameEnabled: true,
  suspBioEnabled:      false,
  suspAge:             '7',
  suspKeywordsList:    'admin,mod,moderator,support,giveaway,airdrop,staff,team',
  suspAction:          'flag',
  suspDm:              false,
  dmSuspMsg:           'Your account was flagged due to suspicious characteristics.',
  // Anti-Raid
  antiRaidEnabled:     true,
  antiRaidThreshold:   '10',
  antiRaidWindow:      '60',
  antiRaidAction:      'lockdown',
  // Master DM toggle
  dmEnabled:           false,
};

const LINK_ACTION_OPTS = [
  { value: 'delete', label: 'Delete only' },
  { value: 'warn',   label: 'Delete + Warn' },
  { value: 'kick',   label: 'Delete + Kick' },
  { value: 'ban',    label: 'Delete + Ban' },
];
const SPAM_ACTION_OPTS = [
  { value: 'mute', label: 'Mute' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban',  label: 'Ban' },
];
const SUSP_ACTION_OPTS = [
  { value: 'flag', label: 'Flag — log to mod-log only' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban',  label: 'Ban' },
];
const RAID_ACTION_OPTS = [
  { value: 'lockdown',  label: 'Lockdown — pause all invites' },
  { value: 'kick_new',  label: 'Kick new joiners' },
  { value: 'ban_new',   label: 'Ban new joiners' },
];

const ProtectionSettings = () => {
  const { server } = useContext(DashboardContext);
  const [v, setV] = useState({ ...PROTECT_DEFAULTS });
  const set = k => val => setV(p => ({ ...p, [k]: val }));
  const { saveState, save } = useSaveConfig(server?.id, PROTECT_CONFIG_MAP, PROTECT_DEFAULTS, setV);

  const [sendState, setSendState] = useState('idle'); // idle | sending | sent | error
  const [sendMsg,   setSendMsg]   = useState('');

  const handleSendEmbed = async () => {
    if (!server?.id || sendState === 'sending') return;
    setSendState('sending');
    try {
      const res = await sendProtectionMessage(server.id);
      setSendMsg(`✓ Sent to #${res.channel_name}`);
      setSendState('sent');
    } catch (e) {
      setSendMsg(e.message || 'Failed to send');
      setSendState('error');
    }
    setTimeout(() => { setSendState('idle'); setSendMsg(''); }, 4000);
  };

  const DmMsgField = ({ msgKey, placeholder }) => (
    v.dmEnabled ? (
      <div style={{ marginTop: '8px' }}>
        <Textarea value={v[msgKey]} onChange={set(msgKey)} rows={2} placeholder={placeholder} />
      </div>
    ) : null
  );

  const FeatureDmSection = ({ enabledKey, msgKey, placeholder }) => (
    v.dmEnabled ? (
      <>
        <Toggle value={v[enabledKey]} onChange={set(enabledKey)} label="Send DM warning?" />
        {v[enabledKey] && <DmMsgField msgKey={msgKey} placeholder={placeholder} />}
      </>
    ) : null
  );

  const ActionRow = ({ actionKey, opts }) => (
    <Field label="Action on detection">
      <Select value={v[actionKey]} onChange={set(actionKey)} options={opts} />
    </Field>
  );

  return (
    <div>
      <PageHeader icon="🛡️" title="Protection" badge="MODULE" desc="Automated moderation — each feature is individually configurable." />

      {/* Main Embed (Send Message) */}
      <SettingsCard title="Send Message">
        <FieldRow>
          <Field label="Embed Title">
            <Input value={v.mainEmbedTitle} onChange={set('mainEmbedTitle')} placeholder="🛡️ Server Protection" />
          </Field>
          <Field label="Embed Channel" hint="name or ID where the embed will be sent">
            <Input value={v.mainEmbedChannel} onChange={set('mainEmbedChannel')} placeholder="general or 123456789" />
          </Field>
        </FieldRow>
        <Field label="Embed Description">
          <Textarea value={v.mainEmbedDesc} onChange={set('mainEmbedDesc')} rows={2} placeholder="This server is protected by AVbot." />
        </Field>
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSendEmbed}
            disabled={sendState === 'sending'}
            style={{
              background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)',
              color: '#7289da', padding: '10px 22px', borderRadius: '8px', cursor: sendState === 'sending' ? 'not-allowed' : 'pointer',
              fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600,
              opacity: sendState === 'sending' ? 0.6 : 1, transition: 'background 0.2s',
            }}
            onMouseOver={e => { if (sendState !== 'sending') e.currentTarget.style.background = 'rgba(88,101,242,0.25)'; }}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(88,101,242,0.12)'}>
            {sendState === 'sending' ? '📨 Sending…' : '📨 Send Embed'}
          </button>
          {sendMsg && (
            <span style={{ fontSize: '13px', color: sendState === 'error' ? C.red : C.green }}>{sendMsg}</span>
          )}
        </div>
      </SettingsCard>

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

        {/* Master DM toggle */}
        <SettingsCard title="DM Warnings">
          <Toggle value={v.dmEnabled} onChange={set('dmEnabled')} label="Enable DM Warnings"
            desc="When on, send DM messages to users when an action is taken against them." />
        </SettingsCard>

        {/* Link Detection */}
        <SettingsCard title="Link Detection">
          <Toggle value={v.linkEnabled} onChange={set('linkEnabled')} label="Enable Link Detection"
            desc="Delete messages containing URLs not on the whitelist." />
          {v.linkEnabled && (<>
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <Field label="Allowed Domains" hint="comma-separated">
                <Input value={v.linkWhitelist} onChange={set('linkWhitelist')} placeholder="twitter.com,x.com,discord.gg" />
              </Field>
            </div>
            <ActionRow actionKey="linkAction" opts={LINK_ACTION_OPTS} />
            <FeatureDmSection enabledKey="linkDm" msgKey="dmLinkMsg"
              placeholder="Your link was removed because it's not whitelisted on this server." />
          </>)}
        </SettingsCard>

        {/* Phishing */}
        <SettingsCard title="Phishing Detection">
          <Toggle value={v.phishingEnabled} onChange={set('phishingEnabled')} label="Enable Phishing Detection"
            desc="Delete messages containing known phishing domains." />
          {v.phishingEnabled && (<>
            <div style={{ marginTop: '14px' }}>
              <ActionRow actionKey="phishingAction" opts={LINK_ACTION_OPTS} />
            </div>
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <Field label="Phishing Domain List" hint="comma-separated — overrides built-in defaults if set">
                <Textarea value={v.phishingList} onChange={set('phishingList')} rows={3}
                  placeholder="discorcl.com,discord-nitro.com,free-nitro.com,…" />
              </Field>
            </div>
            <FeatureDmSection enabledKey="phishingDm" msgKey="dmPhishingMsg"
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
            <FieldRow>
              <ActionRow actionKey="spamAction" opts={SPAM_ACTION_OPTS} />
              {v.spamAction === 'mute' && (
                <Field label="Mute Duration (seconds)">
                  <Input type="number" value={v.spamMuteDuration} onChange={set('spamMuteDuration')} placeholder="600" />
                </Field>
              )}
            </FieldRow>
            <FeatureDmSection enabledKey="spamDm" msgKey="dmSpamMsg"
              placeholder="You were muted for spamming. Duration: {duration}s." />
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
            <ActionRow actionKey="bannedAction" opts={LINK_ACTION_OPTS} />
            <FeatureDmSection enabledKey="bannedDm" msgKey="dmBannedMsg"
              placeholder="Your message contained a banned word and was removed." />
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
              <Toggle value={v.suspUsernameEnabled} onChange={set('suspUsernameEnabled')} label="Suspicious username keywords"
                desc="Flag users whose username contains scam-related words." />
              <Toggle value={v.suspBioEnabled} onChange={set('suspBioEnabled')} label="Suspicious bio keywords"
                desc="Flag users whose bio contains scam-related words (reserved — Discord API limitation)." />
              <div style={{ marginTop: '14px' }}>
                <Field label="Suspicious Keywords" hint="comma-separated — used for username and bio checks">
                  <Textarea value={v.suspKeywordsList} onChange={set('suspKeywordsList')} rows={2}
                    placeholder="admin,mod,moderator,giveaway,airdrop,staff" />
                </Field>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Field label="Minimum Account Age (days)" hint="flag accounts newer than this — set 0 to disable">
                  <Input type="number" value={v.suspAge} onChange={set('suspAge')} placeholder="7" style={{ maxWidth: '140px' }} />
                </Field>
              </div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <ActionRow actionKey="suspAction" opts={SUSP_ACTION_OPTS} />
            </div>
            <FeatureDmSection enabledKey="suspDm" msgKey="dmSuspMsg"
              placeholder="Your account was flagged due to suspicious characteristics." />
          </>)}
        </SettingsCard>

        {/* Anti-Raid */}
        <SettingsCard title="Anti-Raid">
          <Toggle value={v.antiRaidEnabled} onChange={set('antiRaidEnabled')} label="Enable Anti-Raid"
            desc="If too many users join at once, take action and ping admins." />
          {v.antiRaidEnabled && (<>
            <FieldRow style={{ marginTop: '14px' }}>
              <Field label="Join Threshold" hint="users joining to trigger action">
                <Input type="number" value={v.antiRaidThreshold} onChange={set('antiRaidThreshold')} placeholder="10" />
              </Field>
              <Field label="Time Window (seconds)">
                <Input type="number" value={v.antiRaidWindow} onChange={set('antiRaidWindow')} placeholder="60" />
              </Field>
            </FieldRow>
            <ActionRow actionKey="antiRaidAction" opts={RAID_ACTION_OPTS} />
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
    roles:        <RoleSelectSettings />,
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
    <DashboardContext.Provider value={{ server, user, servers, setServer, isPremium: server?.is_premium === true }}>
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
