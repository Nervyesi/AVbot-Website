import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import Analytics from './Analytics';
import { DashboardContext } from '../DashboardContext';
import {
  loginWithDiscord, fetchMe, fetchServers, fetchServerStats,
  fetchServerAnalytics, fetchConfig, saveConfig,
  sendProtectionMessage, sendTicketsPanel, sendVerifyMessage,
  clearToken, getToken, setToken,
  listRolePanels, createRolePanel, updateRolePanel, deleteRolePanel,
  createRoleButton, updateRoleButton, deleteRoleButton,
  sendRolePanel, refreshRolePanel,
  listAssets, uploadAsset, deleteAsset,
  listForms, createForm, updateForm, deleteForm,
  createFormField, updateFormField, deleteFormField, sendForm,
  listEmbeds, createEmbed, updateEmbed, sendEmbed,
  deleteEmbedMessage, deleteEmbed,
  listGiveaways, createGiveaway, updateGiveaway, startGiveaway,
  endGiveawayNow, rerollGiveaway, cancelGiveaway, deleteGiveaway,
  fetchGiveawayEntries,
  fetchRadarSettings, saveRadarSettings,
  fetchRadarWatchlist, addRadarWatchlistEntry, deleteRadarWatchlistEntry,
  searchRadarAsset, fetchRadarRecentAlerts,
  sendRadarDigestNow, refreshRadarPreview,
  fetchRaidSettings, saveRaidSettings, fetchRaidList, createRaid, endRaid,
  fetchRaidLeaderboard, fetchRaidVerificationLog, runRaidManualCheck, sendRaidGuide,
  fetchRaidGuideDefaults, fetchRaidScrapingHealth,
  fetchEngagePools, updateEngagePool,
  fetchSettings, updateBrand, updateAccess, updateLevels,
  fetchLogs, downloadLogs, fetchFlags, resolveFlag,
  fetchUserPoints, adjustPoints, fetchLeaderboard,
  downloadBackup, runBackupNow, fetchGlobalOverview,
} from '../api';
import { DISCORD_INVITE_URL, ADD_TO_DISCORD_URL, API_BASE_URL } from '../constants';

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



// ── User avatar URL helper ────────────────────────────────────────────────────

function userAvatarUrl(user) {
  if (!user) return 'https://cdn.discordapp.com/embed/avatars/0.png';
  // Prefer the explicit avatar_url field if backend supplies it.
  if (user.avatar_url) return user.avatar_url;
  // Legacy backends stored the full URL on `avatar` — pass it through unchanged.
  if (typeof user.avatar === 'string' && /^https?:\/\//.test(user.avatar)) {
    return user.avatar;
  }
  // Otherwise treat `avatar` as a Discord avatar hash and construct a CDN URL.
  const id = user.user_id || user.id;
  if (user.avatar_hash && id) {
    const ext = String(user.avatar_hash).startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${user.avatar_hash}.${ext}?size=128`;
  }
  if (user.avatar && id) {
    const ext = String(user.avatar).startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.${ext}?size=128`;
  }
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}

// ── Discord-message-style Brand preview (edit-in-place) ───────────────────────

function DiscordMessagePreview({
  botAvatar, botName, accentColor, thumbnail, footerText, footerIcon,
  onAvatarClick, onNameEdit, onColorChange, onThumbnailClick,
  onFooterTextEdit, onFooterIconClick,
  isPremium,
}) {
  const [editingName, setEditingName]     = useState(false);
  const [editingFooter, setEditingFooter] = useState(false);
  const [colorOpen, setColorOpen]         = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!colorOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setColorOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [colorOpen]);

  const safe_color = /^#[0-9a-fA-F]{3,6}$/.test(accentColor) ? accentColor : '#94730D';

  return (
    <div style={{ background: 'transparent', padding: 0, fontFamily: 'Whitney, Sora, sans-serif', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Bot avatar */}
        <div
          onClick={isPremium && onAvatarClick ? onAvatarClick : undefined}
          title={isPremium ? 'Click to change avatar' : undefined}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            overflow: 'hidden', background: 'rgba(255,255,255,0.08)',
            cursor: isPremium && onAvatarClick ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: isPremium ? '2px solid transparent' : 'none',
            position: 'relative',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => { if (isPremium) e.currentTarget.style.borderColor = '#f0a500'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
        >
          {botAvatar
            ? <img src={botAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '18px' }}>🤖</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Bot name row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
            {editingName && isPremium ? (
              <input
                autoFocus
                defaultValue={botName}
                onBlur={e => { onNameEdit && onNameEdit(e.target.value); setEditingName(false); }}
                onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingName(false); }}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #f0a500', color: '#fff', fontWeight: 700, fontSize: '15px', outline: 'none', fontFamily: 'inherit', width: '120px' }}
              />
            ) : (
              <span
                onClick={isPremium && onNameEdit ? () => setEditingName(true) : undefined}
                title={isPremium ? 'Click to edit name' : undefined}
                style={{ color: '#fff', fontWeight: 700, fontSize: '15px', cursor: isPremium && onNameEdit ? 'text' : 'default' }}
              >
                {botName || 'AVbot'}
              </span>
            )}
            <span style={{ background: '#5865F2', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px', letterSpacing: '0.05em' }}>BOT</span>
            <span style={{ color: '#949ba4', fontSize: '12px' }}>Today at 12:34</span>
          </div>

          {/* Embed card */}
          <div style={{ display: 'flex', background: '#2b2d31', borderRadius: '4px', overflow: 'visible', position: 'relative' }}>
            {/* Accent bar */}
            <div
              onClick={isPremium && onColorChange ? () => setColorOpen(o => !o) : undefined}
              title={isPremium ? 'Click to change color' : undefined}
              style={{
                width: '4px', flexShrink: 0, background: safe_color, borderRadius: '4px 0 0 4px',
                cursor: isPremium && onColorChange ? 'pointer' : 'default', minHeight: '100%',
                transition: 'width 0.1s',
              }}
              onMouseEnter={e => { if (isPremium && onColorChange) e.currentTarget.style.width = '6px'; }}
              onMouseLeave={e => { e.currentTarget.style.width = '4px'; }}
            />
            {/* Color picker popover */}
            {colorOpen && isPremium && (
              <div ref={pickerRef} style={{ position: 'absolute', left: '10px', top: '0', zIndex: 100, background: '#1e1f22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                <HexColorPicker color={safe_color} onChange={onColorChange} />
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#949ba4', fontSize: '11px', fontFamily: 'monospace' }}>{safe_color}</span>
                  <button onClick={() => setColorOpen(false)} style={{ background: 'none', border: 'none', color: '#949ba4', cursor: 'pointer', fontSize: '11px' }}>Done</button>
                </div>
              </div>
            )}

            {/* Embed body */}
            <div style={{ flex: 1, padding: '10px 14px 10px 12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Example embed</div>
                <div style={{ color: '#dbdee1', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
                  This embed uses your default brand. Specific modules can override these settings.
                </div>
                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                  <div
                    onClick={isPremium && onFooterIconClick ? onFooterIconClick : undefined}
                    title={isPremium ? 'Click to change footer icon' : undefined}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', cursor: isPremium && onFooterIconClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    {footerIcon
                      ? <img src={footerIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '10px', color: '#949ba4' }}>+</span>}
                  </div>
                  {editingFooter && isPremium ? (
                    <input
                      autoFocus
                      defaultValue={footerText}
                      onBlur={e => { onFooterTextEdit && onFooterTextEdit(e.target.value); setEditingFooter(false); }}
                      onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #f0a500', color: '#949ba4', fontSize: '12px', outline: 'none', fontFamily: 'inherit', flex: 1 }}
                    />
                  ) : (
                    <span
                      onClick={isPremium && onFooterTextEdit ? () => setEditingFooter(true) : undefined}
                      title={isPremium ? 'Click to edit footer text' : undefined}
                      style={{ color: '#949ba4', fontSize: '12px', cursor: isPremium && onFooterTextEdit ? 'text' : 'default' }}
                    >
                      {footerText || 'Powered by AVbot'}
                    </span>
                  )}
                </div>
              </div>
              {/* Thumbnail */}
              <div
                onClick={isPremium && onThumbnailClick ? onThumbnailClick : undefined}
                title={isPremium ? 'Click to change thumbnail' : undefined}
                style={{
                  width: '80px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden',
                  background: thumbnail ? 'transparent' : 'rgba(255,255,255,0.04)',
                  border: thumbnail ? 'none' : '1px dashed rgba(255,255,255,0.15)',
                  cursor: isPremium && onThumbnailClick ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {thumbnail
                  ? <img src={thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>+ image</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Module lock screen (shown when no server is selected) ─────────────────────

const ModuleLock = ({ name }) => (
  <div style={{ textAlign: 'center', padding: '80px 24px' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
    <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
      Add AVbot to unlock {name}
    </h2>
    <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px' }}>
      Bot must be installed in your server to manage this module.
    </p>
    <a
      href={ADD_TO_DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 24px', background: C.gold, color: '#0A0A0F', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
    >
      ➕ Add AVbot to Discord
    </a>
  </div>
);

// ── Config maps — maps form field key → config table key ─────────────────────
// Only keys that exist in DEFAULT_CONFIG are included here.


const PROTECT_CONFIG_MAP = {
  // Feature toggles
  linkEnabled:          'protection_link_detection',
  linkWhitelist:        'protection_link_whitelist',
  linkRoleWhitelist:    'protection_link_role_whitelist',
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

// RAID_CONFIG_MAP removed — RaidSettings now uses dedicated /raid/* API endpoints

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
  const { setAccessError } = useContext(DashboardContext);

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
      .catch(err => { if (err.code === 403) setAccessError(err.message); }); // keep defaults on failure
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

const AssetPickerModal = ({ serverId, onPick, onClose, hasCurrent = false }) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {hasCurrent && (
              <button
                onClick={() => onPick('')}
                title="Remove the current image from this embed"
                style={{ background: 'rgba(237,66,69,0.12)', border: `1px solid rgba(237,66,69,0.4)`, borderRadius: '8px', padding: '7px 14px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>
                Remove image
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
          </div>
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
  bodySize = 'sm',
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
          title={isPremium ? 'Click to change color' : 'Color — coming soon'}
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
                placeholder="Embed description…"
                rows={bodySize === 'base' ? 8 : 3}
                style={{
                  ...iStyle, resize: 'vertical', color: 'rgba(255,255,255,0.82)',
                  borderBottom: '1px dashed rgba(255,255,255,0.07)',
                  fontSize:   bodySize === 'base' ? '15px' : '13px',
                  lineHeight: bodySize === 'base' ? '1.6'  : '1.5',
                  minHeight:  bodySize === 'base' ? '220px': undefined,
                }} />
            </div>
            {/* Thumbnail zone */}
            <div onClick={() => vizClick(() => setAssetModal('thumbnail'))}
              title={isPremium ? 'Click to upload thumbnail' : 'Thumbnail — coming soon'}
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
              title={isPremium ? 'Click to upload image/GIF' : 'Image — coming soon'}
              style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', ...(imageUrl ? {} : { height: '130px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }) }}>
              {imageUrl
                ? <img src={imageUrl} alt="embed-img" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', width: 'auto', height: 'auto', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
                : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🖼️</div>
                    <div>{isPremium ? '+ Upload image or GIF' : '🔒 Image — coming soon'}</div>
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
                  title="Footer text — coming soon"
                  style={{ cursor: 'pointer', fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontFamily: 'Sora, sans-serif', padding: '2px 0', userSelect: 'none' }}>
                  {footerText || 'Powered by AVbot'} 🔒
                </div>
            }
          </div>
        </div>
      </div>

      {assetModal && (
        <AssetPickerModal serverId={serverId}
          hasCurrent={assetModal === 'thumbnail' ? !!thumbnailUrl : !!imageUrl}
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
  const { server, servers, setServer, setAccessError } = useContext(DashboardContext);
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [publicStats, setPublicStats] = useState(null);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    setStats(null); setAnalytics(null);
    Promise.all([
      fetchServerStats(server.id).catch(err => { if (err.code === 403) setAccessError(err.message); return null; }),
      fetchServerAnalytics(server.id).catch(() => null),
    ]).then(([s, a]) => { setStats(s); setAnalytics(a); setLoading(false); });
  }, [server?.id]); // eslint-disable-line

  useEffect(() => {
    // Fetch public AmeretaVerse stats (no auth needed)
    fetch(`${API_BASE_URL}/api/public/ameretaverse-overview`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPublicStats(data); })
      .catch(() => {});
  }, []); // eslint-disable-line

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

  const isPublicMode = servers.length === 0;

  // When no server: use public AmeretaVerse stats in the 4 stat cards
  const publicCards = isPublicMode && publicStats ? [
    { label: 'Total Members',           icon: '👥', val: publicStats.total_members?.toLocaleString() },
    { label: 'Active Members (30d)',    icon: '🟢', val: publicStats.active_members?.toLocaleString(), sub: 'AmeretaVerse' },
    { label: 'Member Growth (30 days)', icon: '📈', val: `+${publicStats.member_growth_30d ?? 0}`, sub: 'net joins' },
    { label: 'Total Messages',          icon: '💬', val: publicStats.total_messages?.toLocaleString() },
  ] : null;

  const cards = publicCards || [
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
          {isPublicMode ? 'AmeretaVerse · Public Stats' : (server?.name ?? 'Select a server')}{loading ? ' · Loading…' : ''}
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

      {/* ── No-server CTA ── */}
      {isPublicMode && !loading && (
        <div style={{ marginTop: '32px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '40px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔓</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Add AVbot to unlock the Dashboard
          </h2>
          <p style={{ color: C.muted, fontSize: '14px', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            Once invited, manage raids, engages, forms, tickets, and more from this control panel.
          </p>
          <a
            href={ADD_TO_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 24px', background: C.gold, color: '#0A0A0F', borderRadius: '8px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', fontFamily: 'Sora, sans-serif' }}
          >
            ➕ Add AVbot to Discord
          </a>
        </div>
      )}
      {!isPublicMode && (
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
            bodySize="base"
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
            bodySize="base"
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
];

const FORM_EDITOR_DEFAULTS = {
  name: '', title: '', description: '', button_label: 'Apply',
  thumbnail_url: '', image_url: '', color: '', footer_text: '',
  channel_id: '', ticket_category: '', staff_roles: '', ping_role: '',
  approve_role: '', approve_dm_enabled: false, approve_dm_message: '',
  reject_dm_enabled: false, reject_dm_message: '',
  auto_close_on_decision: 1,
};

const FIELD_MODAL_DEFAULTS = {
  label: '', field_type: 'short_text', placeholder: '',
  required: true, max_length: '',
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
      auto_close_on_decision: f.auto_close_on_decision != null ? f.auto_close_on_decision : 1,
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
    });
    setFmErr(''); setFieldModal({ mode: 'edit', fieldId: f.field_id });
  };

  const handleSaveField = async () => {
    if (!serverId || !activeFormId || fmSaving) return;
    if (!fmData.label.trim()) { setFmErr('Label is required'); return; }
    if (fmData.label.length > 45) { setFmErr('Label must be ≤ 45 characters'); return; }
    if (fmData.placeholder.length > 100) { setFmErr('Placeholder must be ≤ 100 characters'); return; }

    const payload = {
      label:      fmData.label.trim(),
      field_type: fmData.field_type,
      placeholder: fmData.placeholder,
      required:   fmData.required ? 1 : 0,
      options:    '',
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
            bodySize="base"
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
          <Toggle
            value={editor.auto_close_on_decision === 1}
            onChange={v => setEd('auto_close_on_decision')(v ? 1 : 0)}
            label="Auto-close ticket on decision"
            desc="When staff approves or rejects, close the ticket channel automatically. Disable to let staff close manually."
          />
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0 16px' }} />
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
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

            {fmData.field_type === 'short_text' && (
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
            bodySize="base"
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

const RAID_TAB_LABELS = [
  { id: 'settings',    label: '⚙️ Settings' },
  { id: 'guide',       label: '📖 Guide' },
  { id: 'raids',       label: '⚔️ Raids' },
  { id: 'leaderboard', label: '🏆 Leaderboard' },
  { id: 'manual',      label: '🔍 Manual Check' },
  { id: 'log',         label: '🚩 Verification Flags' },
];

const MANUAL_CHECK_LIMIT = 10;

const RaidSettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const sid = server?.id;

  const [tab, setTab]           = useState('settings');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  const [raids, setRaids]               = useState([]);
  const [raidsLoading, setRaidsLoading] = useState(false);
  const [lb, setLb]                     = useState([]);
  const [lbLoading, setLbLoading]       = useState(false);
  const [logRows, setLogRows]           = useState([]);
  const [logLoading, setLogLoading]     = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Create raid form (no channel override — channel is from Settings)
  const [newTweetUrl, setNewTweetUrl]       = useState('');
  const [newPoints, setNewPoints]           = useState('100');
  const [newMode, setNewMode]               = useState('partial');
  const [newTaskLike, setNewTaskLike]       = useState(true);
  const [newTaskComment, setNewTaskComment] = useState(true);
  const [newTaskRetweet, setNewTaskRetweet] = useState(true);
  const [createState, setCreateState]       = useState('idle');
  const [createMsg, setCreateMsg]           = useState('');

  // Manual check — single flexible identifier field
  const [mcRaidId, setMcRaidId]         = useState('');
  const [mcIdentifier, setMcIdentifier] = useState('');
  const [mcState, setMcState]           = useState('idle');
  const [mcResult, setMcResult]         = useState(null);

  // Scraping health — poll every 60s when on a raid tab
  const [scrapingHealth, setScrapingHealth] = useState(null);

  // Guide send
  const [guideState, setGuideState]     = useState('idle');
  const [guideMsg, setGuideMsg]         = useState('');
  const [guideDefaults, setGuideDefaults] = useState(null);

  const set = k => v => setSettings(p => ({ ...p, [k]: v }));

  const isEnabled = settings?.enabled === 1 || settings?.enabled === true;

  const ratioSum = settings ? (
    (parseInt(settings.point_ratio_like,    10) || 0) +
    (parseInt(settings.point_ratio_comment, 10) || 0) +
    (parseInt(settings.point_ratio_retweet, 10) || 0)
  ) : 100;
  const ratioOk = ratioSum === 100;

  const loadSettings = async () => {
    if (!sid) return;
    try {
      const s = await fetchRaidSettings(sid);
      setSettings(s); setError(null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (!sid) { setLoading(false); return; }
    setLoading(true);
    loadSettings().finally(() => setLoading(false));
    // FIX 3: load guide defaults once
    fetchRaidGuideDefaults().then(d => setGuideDefaults(d)).catch(() => {});
  }, [sid]); // eslint-disable-line

  // FIX 7: when disabled, force tab back to settings
  useEffect(() => {
    if (!isEnabled && tab !== 'settings') setTab('settings');
  }, [isEnabled]); // eslint-disable-line

  useEffect(() => {
    if (tab === 'raids'       && sid) { setRaidsLoading(true); fetchRaidList(sid,'active').then(r => setRaids(r.raids||[])).catch(()=>{}).finally(()=>setRaidsLoading(false)); }
    if (tab === 'leaderboard' && sid) { setLbLoading(true);    fetchRaidLeaderboard(sid,10).then(r => setLb(r.leaderboard||[])).catch(()=>{}).finally(()=>setLbLoading(false)); }
    if (tab === 'log'         && sid) { setLogLoading(true);   fetchRaidVerificationLog(sid).then(r => setLogRows(r.flags||[])).catch(()=>{}).finally(()=>setLogLoading(false)); }
  }, [tab, sid]); // eslint-disable-line

  // Poll scraping health every 60s while on any Raid tab
  useEffect(() => {
    if (!sid) return;
    let cancelled = false;
    const poll = () => fetchRaidScrapingHealth(sid).then(h => { if (!cancelled) setScrapingHealth(h); }).catch(() => {});
    poll();
    const id = setInterval(poll, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, [sid]); // eslint-disable-line

  // FIX 7: enable toggle saves immediately (single-action)
  const handleToggleEnabled = async (newVal) => {
    const newInt = newVal ? 1 : 0;
    setSettings(p => ({ ...p, enabled: newInt }));
    try {
      await saveRaidSettings(sid, { enabled: newInt });
    } catch (e) {
      setSettings(p => ({ ...p, enabled: newInt ? 0 : 1 })); // revert
      setError(e.message);
    }
  };

  const handleSave = async () => {
    if (!sid || saving || !ratioOk) return;
    setSaving(true); setSaveMsg('');
    try {
      await saveRaidSettings(sid, {
        enabled:              settings.enabled ? 1 : 0,
        point_ratio_like:     parseInt(settings.point_ratio_like, 10)    || 12,
        point_ratio_comment:  parseInt(settings.point_ratio_comment, 10) || 40,
        point_ratio_retweet:  parseInt(settings.point_ratio_retweet, 10) || 48,
        raid_channel_id:      settings.raid_channel_id    || '',
        raid_role_ids:        settings.raid_role_ids      || '',
        raid_ping_role_id:    settings.raid_ping_role_id  || '',
        embed_thumbnail_url:  settings.embed_thumbnail_url || '',
        embed_footer_text:    settings.embed_footer_text   || '',
        embed_color:          settings.embed_color          || '',
        raid_guide_channel_id:    settings.raid_guide_channel_id    || '',
        raid_guide_title:         settings.raid_guide_title         || '',
        raid_guide_description:   settings.raid_guide_description   || '',
        raid_guide_thumbnail_url: settings.raid_guide_thumbnail_url || '',
        raid_guide_image_url:     settings.raid_guide_image_url     || '',
        raid_guide_color:         settings.raid_guide_color         || '',
        raid_guide_footer_text:   settings.raid_guide_footer_text   || '',
      });
      setSaveMsg('✓ Saved');
      await loadSettings();
    } catch (e) { setSaveMsg('✗ ' + e.message); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3500); }
  };

  const handleCreateRaid = async () => {
    if (!sid || createState === 'sending') return;
    if (!settings?.raid_channel_id?.trim()) {
      setCreateMsg('Configure a Raid Channel in Settings first'); setCreateState('error'); return;
    }
    if (!newTweetUrl.trim()) { setCreateMsg('Tweet URL required'); setCreateState('error'); return; }
    const pts = parseInt(newPoints, 10);
    if (!pts || pts < 1) { setCreateMsg('Points must be ≥ 1'); setCreateState('error'); return; }
    if (!newTaskLike && !newTaskComment && !newTaskRetweet) { setCreateMsg('Select at least one task'); setCreateState('error'); return; }
    setCreateState('sending'); setCreateMsg('');
    try {
      const res = await createRaid(sid, {
        tweet_url:    newTweetUrl.trim(),
        total_points: pts,
        mode:         newMode,
        tasks:        { like: newTaskLike, comment: newTaskComment, retweet: newTaskRetweet },
      });
      setCreateMsg(`✓ Raid #${String(res.display_number ?? res.raid_id).padStart(4, '0')} posted`);
      setCreateState('sent');
      setNewTweetUrl(''); setNewPoints('100');
      if (tab === 'raids') fetchRaidList(sid,'active').then(r => setRaids(r.raids||[])).catch(()=>{});
    } catch (e) { setCreateMsg('✗ ' + e.message); setCreateState('error'); }
    setTimeout(() => { setCreateMsg(''); setCreateState('idle'); }, 5000);
  };

  const handleEndRaid = async (raidId) => {
    if (!sid) return;
    try {
      await endRaid(sid, raidId);
      setRaids(prev => prev.filter(r => r.raid_id !== raidId));
    } catch (e) { setError(e.message); }
  };

  const handleManualCheck = async () => {
    if (!sid || mcState === 'loading') return;
    if (!mcRaidId || !mcIdentifier.trim()) {
      setMcResult({ error: 'Enter a Raid ID and a user identifier' }); return;
    }
    setMcState('loading'); setMcResult(null);
    try {
      const res = await runRaidManualCheck(sid, parseInt(mcRaidId, 10), mcIdentifier.trim());
      setMcResult(res);
    } catch (e) { setMcResult({ error: e.message }); }
    setMcState('idle');
  };

  const handleSendGuide = async () => {
    if (!sid || guideState === 'sending') return;
    setGuideState('sending');
    try {
      await sendRaidGuide(sid);
      setGuideMsg('✓ Guide sent'); setGuideState('sent');
    } catch (e) { setGuideMsg('✗ ' + e.message); setGuideState('error'); }
    setTimeout(() => { setGuideMsg(''); setGuideState('idle'); }, 4000);
  };

  const toggleExpand = (key) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  if (loading) return <div style={{ color: C.muted, padding: '32px', fontSize: '14px' }}>Loading…</div>;

  return (
    <div>
      <PageHeader icon="⚔️" title="Raid System" badge="MODULE"
        desc="Per-guild Twitter raid management with adaptive verification and per-guild leaderboard." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Tab strip — non-settings tabs hidden when disabled */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {RAID_TAB_LABELS.filter(t => t.id === 'settings' || isEnabled).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === t.id ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '7px 14px', color: tab === t.id ? C.gold : C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: tab === t.id ? 700 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scraping health banner — shown across all tabs when unhealthy ── */}
      {scrapingHealth && scrapingHealth.healthy === false && (
        <div style={{ background: 'rgba(237,66,69,0.12)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: C.red }}>
          🚨 <strong>Twitter verification is currently offline.</strong> Submissions will be accepted but cannot be automatically verified. Admins can review later when scraping recovers.
          {scrapingHealth.consecutive_failures > 0 && <span style={{ color: C.muted }}> ({scrapingHealth.consecutive_failures} consecutive failures)</span>}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && settings && (<>
        <SettingsCard title="Module">
          <Toggle value={!!settings.enabled} onChange={handleToggleEnabled} label="Enable Raid System"
            desc="Enable or disable the raid system for this server. Changes apply immediately." />
          {!isEnabled && (
            <div style={{ background: 'rgba(200,168,78,0.07)', border: '1px solid rgba(200,168,78,0.2)', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '13px', color: C.muted }}>
              Enable the Raid System to access all features.
            </div>
          )}
          {settings.live_verification_mode && (
            <div style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid rgba(200,168,78,0.35)', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>⚡ Live Verification</span>
              <span style={{ color: C.muted }}>Tasks are verified on X instantly when users confirm. No daily sampling needed for this guild.</span>
            </div>
          )}
        </SettingsCard>

        {/* Only show rest of settings when enabled */}
        {isEnabled && (<>

        <SettingsCard title="Point Ratios">
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>
            Percentages must sum to exactly 100. Points earned = total_points × ratio.
          </p>
          <FieldRow cols={3}>
            <Field label="👍 Like %">
              <Input type="number" value={String(settings.point_ratio_like ?? 12)} onChange={v => set('point_ratio_like')(parseInt(v,10)||0)} placeholder="12" />
            </Field>
            <Field label="💬 Comment %">
              <Input type="number" value={String(settings.point_ratio_comment ?? 40)} onChange={v => set('point_ratio_comment')(parseInt(v,10)||0)} placeholder="40" />
            </Field>
            <Field label="🔁 Retweet %">
              <Input type="number" value={String(settings.point_ratio_retweet ?? 48)} onChange={v => set('point_ratio_retweet')(parseInt(v,10)||0)} placeholder="48" />
            </Field>
          </FieldRow>
          <div style={{ fontSize: '13px', fontWeight: 600, color: ratioOk ? C.green : C.red, marginTop: '4px' }}>
            Sum: {ratioSum} / 100 {ratioOk ? '✓' : '— must equal 100'}
          </div>
        </SettingsCard>

        <SettingsCard title="Channels & Roles">
          <FieldRow>
            <Field label="Raid Channel ★" hint="required — all raids post here">
              <Input value={settings.raid_channel_id || ''} onChange={set('raid_channel_id')} placeholder="#raid-drops or 1234567890" />
            </Field>
            <Field label="Raid Ping Role" hint="optional — mentioned when a new raid drops">
              <Input value={settings.raid_ping_role_id || ''} onChange={set('raid_ping_role_id')} placeholder="Raiders" />
            </Field>
          </FieldRow>
          <Field label="Raid Poster Roles" hint="comma-separated — who can run /raid post (admins always can)">
            <Input value={settings.raid_role_ids || ''} onChange={set('raid_role_ids')} placeholder="Raid Admin, Mods" />
          </Field>
          {!settings.raid_channel_id?.trim() && (
            <div style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.25)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: C.red, marginTop: '8px' }}>
              ⚠️ Raid Channel is required before raids can be posted.
            </div>
          )}
        </SettingsCard>

        <SettingsCard title="Raid Embed Appearance">
          <p style={{ margin: '0 0 12px', color: C.muted, fontSize: '13px' }}>
            Visual styling for raid embeds. The image is always the tweet's own media — image upload is disabled here.
          </p>
          <EmbedPreview
            serverId={sid}
            isPremium={isPremium}
            title="⚔️ New Raid — #0001"
            description="Preview of your raid embed styling."
            thumbnailUrl={settings.embed_thumbnail_url || ''}
            imageUrl=""
            color={settings.embed_color || '#94730D'}
            footerText={settings.embed_footer_text || ''}
            onTitleChange={() => {}}
            onDescriptionChange={() => {}}
            onThumbnailChange={set('embed_thumbnail_url')}
            onImageChange={() => {}}
            onColorChange={set('embed_color')}
            onFooterTextChange={set('embed_footer_text')}
            bodySize="base"
            showImage={false}
          />
        </SettingsCard>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <button onClick={handleSave} disabled={saving || !ratioOk} className="btn-primary"
            style={{ padding: '11px 28px', fontSize: '14px', opacity: (saving || !ratioOk) ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saveMsg && <span style={{ fontSize: '13px', color: saveMsg.startsWith('✓') ? C.green : C.red }}>{saveMsg}</span>}
        </div>
        </>)}  {/* end isEnabled block */}
      </>)}

      {/* ── GUIDE TAB ── */}
      {tab === 'guide' && settings && (<>
        <SettingsCard title="Guide Channel">
          <Field label="Channel" hint="name or ID — where the guide embed is sent">
            <Input value={settings.raid_guide_channel_id || ''} onChange={set('raid_guide_channel_id')} placeholder="#raid-guide or 1234567890" />
          </Field>
        </SettingsCard>

        <SettingsCard title="Guide Embed">
          <p style={{ margin: '0 0 12px', color: C.muted, fontSize: '13px' }}>
            The guide embed sent to members explaining how to raid. Edit the title and body below.
            Image upload is allowed here — use a hero banner if you like.
          </p>
          <EmbedPreview
            serverId={sid}
            isPremium={isPremium}
            title={settings.raid_guide_title || guideDefaults?.title || ''}
            description={settings.raid_guide_description || guideDefaults?.description || ''}
            thumbnailUrl={settings.raid_guide_thumbnail_url || ''}
            imageUrl={settings.raid_guide_image_url || ''}
            color={settings.raid_guide_color || '#94730D'}
            footerText={settings.raid_guide_footer_text || ''}
            onTitleChange={v => set('raid_guide_title')(v || guideDefaults?.title || '')}
            onDescriptionChange={v => set('raid_guide_description')(v || guideDefaults?.description || '')}
            onThumbnailChange={set('raid_guide_thumbnail_url')}
            onImageChange={set('raid_guide_image_url')}
            onColorChange={set('raid_guide_color')}
            onFooterTextChange={set('raid_guide_footer_text')}
            showImage={true}
            bodySize="base"
          />
        </SettingsCard>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary"
            style={{ padding: '11px 28px', fontSize: '14px', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save Guide'}
          </button>
          <button onClick={handleSendGuide} disabled={guideState === 'sending'}
            style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da', padding: '11px 22px', borderRadius: '8px', cursor: guideState === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 600, opacity: guideState === 'sending' ? 0.6 : 1 }}>
            {guideState === 'sending' ? '📨 Sending…' : '📨 Send Guide to Channel'}
          </button>
          {saveMsg && <span style={{ fontSize: '13px', color: saveMsg.startsWith('✓') ? C.green : C.red }}>{saveMsg}</span>}
          {guideMsg && <span style={{ fontSize: '13px', color: guideState === 'error' ? C.red : C.green }}>{guideMsg}</span>}
        </div>
      </>)}

      {/* ── RAIDS TAB ── */}
      {tab === 'raids' && (<>
        <SettingsCard title="Create New Raid">
          {settings && !settings.raid_channel_id?.trim() && (
            <div style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: C.red, marginBottom: '16px' }}>
              ⚠️ No Raid Channel configured. Go to Settings tab and set one first.
            </div>
          )}
          <FieldRow>
            <Field label="Tweet URL" hint="x.com or twitter.com /status/ link">
              <Input value={newTweetUrl} onChange={setNewTweetUrl} placeholder="https://x.com/user/status/123" />
            </Field>
            <Field label="Total Points">
              <Input type="number" value={newPoints} onChange={setNewPoints} placeholder="100" style={{ maxWidth: '120px' }} />
            </Field>
          </FieldRow>
          <Field label="Mode" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['partial', 'all'].map(m => (
                <button key={m} onClick={() => setNewMode(m)}
                  style={{ background: newMode === m ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newMode === m ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '7px', padding: '7px 14px', color: newMode === m ? C.gold : C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                  {m === 'partial' ? 'Partial Credit' : 'All Required'}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ marginBottom: '14px' }}>
            <Label>Tasks</Label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['like','👍 Like',newTaskLike,setNewTaskLike],['comment','💬 Comment',newTaskComment,setNewTaskComment],['retweet','🔁 Retweet',newTaskRetweet,setNewTaskRetweet]].map(([k,lbl,val,setter]) => (
                <button key={k} onClick={() => setter(!val)}
                  style={{ background: val ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${val ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '7px', padding: '8px 14px', color: val ? C.gold : C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={handleCreateRaid} disabled={createState === 'sending'}
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 22px', color: '#0A0A0F', cursor: createState === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: createState === 'sending' ? 0.7 : 1 }}>
              {createState === 'sending' ? '📨 Posting…' : '📨 Post Raid'}
            </button>
            {createMsg && <span style={{ fontSize: '13px', color: createState === 'error' ? C.red : C.green }}>{createMsg}</span>}
          </div>
        </SettingsCard>

        <SettingsCard title="Active Raids">
          {raidsLoading ? (
            <div style={{ color: C.muted, fontSize: '13px' }}>Loading…</div>
          ) : raids.length === 0 ? (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No active raids.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {raids.map(r => (
                <div key={r.raid_id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Raid #{String(r.display_number || r.raid_id).padStart(4,'0')}</div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.tweet_url} · {r.total_points} pts · {r.mode} · {r.participant_count || 0} participants
                    </div>
                  </div>
                  <button onClick={() => handleEndRaid(r.raid_id)}
                    style={{ background: 'rgba(237,66,69,0.12)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '6px', padding: '5px 12px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    End
                  </button>
                </div>
              ))}
            </div>
          )}
        </SettingsCard>
      </>)}

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <SettingsCard title="Guild Leaderboard">
          {lbLoading ? (
            <div style={{ color: C.muted, fontSize: '13px' }}>Loading…</div>
          ) : lb.length === 0 ? (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No raid participants yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lb.map((row, i) => (
                <div key={row.user_id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i < 3 ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'rgba(200,168,78,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? '14px' : '11px', color: i < 3 ? '#0A0A0F' : C.gold, fontWeight: 700, flexShrink: 0 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{row.username || '(unknown)'}</div>
                    <div style={{ fontSize: '11px', color: C.muted }}>{row.raids_completed} raids</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold }}>{row.total_points} pts</div>
                </div>
              ))}
            </div>
          )}
        </SettingsCard>
      )}

      {/* ── MANUAL CHECK TAB ── */}
      {tab === 'manual' && settings && (
        <SettingsCard title="Manual Verification Check">
          <p style={{ margin: '0 0 16px', color: C.muted, fontSize: '13px' }}>
            Verify a user's participation in a specific raid. Accepts Discord username, Discord ID,
            or @twitter_handle.
          </p>
          <div style={{ background: 'rgba(200,168,78,0.08)', border: '1px solid rgba(200,168,78,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', fontSize: '13px', color: C.gold }}>
            Today's usage: {settings.manual_check_count_today ?? 0} / {settings.unlimited_manual_check ? 'Unlimited' : MANUAL_CHECK_LIMIT} checks
          </div>
          <FieldRow>
            <Field label="Raid ID">
              <Input type="number" value={mcRaidId} onChange={setMcRaidId} placeholder="1" style={{ maxWidth: '120px' }} />
            </Field>
            <Field label="User identifier" hint="Discord username / ID · @twitter_handle">
              <Input value={mcIdentifier} onChange={setMcIdentifier} placeholder="@twitter_handle or Discord username or ID" />
            </Field>
          </FieldRow>
          <button onClick={handleManualCheck} disabled={mcState === 'loading'}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 22px', color: '#0A0A0F', cursor: mcState === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: mcState === 'loading' ? 0.7 : 1 }}>
            {mcState === 'loading' ? 'Checking…' : '🔍 Run Check'}
          </button>

          {mcResult && (
            <div style={{ marginTop: '18px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
              {mcResult.error ? (
                <div style={{ color: C.red, fontSize: '13px' }}>{mcResult.error}</div>
              ) : (<>
                {Object.values(mcResult.tasks || {}).some(r =>
                  ['api_error','scrape_failed','scrape_error','auth_error','missing_input','verification_disabled'].includes(r.reason)
                ) && (
                  <div style={{ background: 'rgba(200,168,78,0.1)', border: '1px solid rgba(200,168,78,0.35)', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: C.gold }}>
                    ⚠️ Some tasks could not be verified (API error). The user was <strong>NOT flagged</strong>. Try again later.
                  </div>
                )}
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: C.gold }}>
                  <strong style={{ color: '#fff' }}>{mcResult.discord_username}</strong>
                  {mcResult.twitter_username && mcResult.twitter_username !== '(not linked)' && (
                    <span style={{ color: C.muted, fontWeight: 400 }}> (@{mcResult.twitter_username})</span>
                  )}
                  {' — '}
                  {mcResult.flagged?.length > 0
                    ? `⚠️ Flagged: ${mcResult.flagged.join(', ')}`
                    : Object.values(mcResult.tasks || {}).some(r =>
                        ['api_error','scrape_failed','scrape_error','auth_error','missing_input','verification_disabled'].includes(r.reason)
                      ) ? '❓ Inconclusive' : '✅ Clean'}
                  {mcResult.deducted > 0 && <span style={{ color: C.red }}> (−{mcResult.deducted} pts)</span>}
                </div>
                {Object.entries(mcResult.tasks || {}).map(([task, res]) => (
                  <div key={task} style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>
                    {res.verified === true ? '✅' : res.verified === false ? '❌' : '❓'}
                    {' '}<strong style={{ color: '#fff' }}>{task}</strong>: {res.reason}
                  </div>
                ))}
              </>)}
            </div>
          )}
        </SettingsCard>
      )}

      {/* ── LOG TAB ── */}
      {tab === 'log' && (
        <SettingsCard title="Verification Flags">
          {logLoading ? (
            <div style={{ color: C.muted, fontSize: '13px' }}>Loading…</div>
          ) : logRows.length === 0 ? (
            <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No flagged submissions yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logRows.map(row => {
                const key      = `${row.user_id}_${row.raid_id}`;
                const expanded = expandedRows.has(key);
                return (
                  <div key={key} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>
                          {row.discord_username}
                          {row.twitter_username && row.twitter_username !== '(not linked)' && (
                            <span style={{ color: C.muted, fontWeight: 400, fontSize: '12px' }}> @{row.twitter_username}</span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span>Raid #{String(row.raid_id).padStart(4,'0')}</span>
                          <span style={{ color: C.red }}>⚠ {row.failed_count}/{row.task_count} failed</span>
                          <span>{row.source}</span>
                          <span>{(row.last_checked || '').slice(0,16)}</span>
                          {row.tweet_url && (
                            <a href={row.tweet_url} target="_blank" rel="noreferrer"
                              style={{ color: '#7289da', textDecoration: 'none', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {row.tweet_url.replace('https://', '')}
                            </a>
                          )}
                        </div>
                      </div>
                      <button onClick={() => toggleExpand(key)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', flexShrink: 0 }}>
                        {expanded ? '▲ Hide' : '▼ Tasks'}
                      </button>
                    </div>
                    {expanded && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 14px', background: 'rgba(0,0,0,0.15)' }}>
                        {(row.tasks || []).map(t => (
                          <div key={t.task} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span>{t.verified ? '✅' : '❌'}</span>
                            <strong style={{ color: '#fff', minWidth: '64px' }}>{t.task}</strong>
                            <span style={{ color: C.muted }}>{t.error_text || (t.verified ? 'verified' : 'failed')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SettingsCard>
      )}
    </div>
  );
};

// ── Engage ────────────────────────────────────────────────────────────────────

const EngageSettings = () => {
  const { server } = useContext(DashboardContext);
  const sid = server?.id;

  const [data, setData]               = useState(null);   // {guild_id, is_multi_pool, pools}
  const [loading, setLoading]         = useState(true);
  const [activePoolIdx, setActivePoolIdx] = useState(0);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState('');

  useEffect(() => {
    if (!sid) return;
    setLoading(true);
    fetchEngagePools(sid)
      .then(res => { setData(res); setActivePoolIdx(0); })
      .catch(err => setToast('Failed to load: ' + err.message))
      .finally(() => setLoading(false));
  }, [sid]); // eslint-disable-line

  const pool = data?.pools?.[activePoolIdx] ?? null;

  const setPoolField = (key) => (val) => {
    setData(prev => {
      const pools = [...prev.pools];
      pools[activePoolIdx] = { ...pools[activePoolIdx], [key]: val };
      return { ...prev, pools };
    });
  };

  const handleSave = async () => {
    if (!pool) return;
    setSaving(true);
    try {
      const body = {
        enabled:               pool.enabled ? 1 : 0,
        channel_id:            pool.channel_id || '',
        allowed_role_ids:      Array.isArray(pool.allowed_role_ids) ? pool.allowed_role_ids : [],
        submit_cost:           parseInt(pool.submit_cost, 10) || 0,
        ttl_hours:             pool.ttl_hours || '',
        auto_reset_daily:      pool.auto_reset_daily ? 1 : 0,
        min_followers:         parseInt(pool.min_followers, 10) || 0,
        daily_submission_limit: parseInt(pool.daily_submission_limit, 10) || 3,
        point_ratio_like:      parseInt(pool.point_ratio_like, 10) || 0,
        point_ratio_comment:   parseInt(pool.point_ratio_comment, 10) || 0,
        point_ratio_retweet:   parseInt(pool.point_ratio_retweet, 10) || 0,
        total_points_per_engage: parseInt(pool.total_points_per_engage, 10) || 10,
        allow_like:            pool.allow_like ? 1 : 0,
        allow_comment:         pool.allow_comment ? 1 : 0,
        allow_retweet:         pool.allow_retweet ? 1 : 0,
      };
      const updated = await updateEngagePool(sid, pool.pool_id, body);
      setData(prev => {
        const pools = [...prev.pools];
        try { updated.allowed_role_ids = JSON.parse(updated.allowed_role_ids || '[]'); } catch (_) { updated.allowed_role_ids = []; }
        pools[activePoolIdx] = updated;
        return { ...prev, pools };
      });
      setToast('✓ Saved');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setToast('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div>
      <PageHeader icon="🔄" title="Engage Pool" badge="MODULE" desc="Configure the Engage-for-Engage pool." />
      <div style={{ color: C.muted, padding: '24px 0' }}>Loading…</div>
    </div>
  );

  if (!data || !data.pools?.length) return (
    <div>
      <PageHeader icon="🔄" title="Engage Pool" badge="MODULE" desc="Configure the Engage-for-Engage pool." />
      <div style={{ color: C.muted, padding: '24px 0' }}>No engage pools found.</div>
    </div>
  );

  const isMulti = data.is_multi_pool;
  const poolName = pool?.display_name || pool?.name || 'Engage';

  return (
    <div>
      <PageHeader
        icon="🔄"
        title="Engage Pool"
        badge="MODULE"
        desc={isMulti
          ? 'Two Engage-for-Engage pools: one for the community, one for creators.'
          : 'Configure the Engage-for-Engage pool. Members use /engage and /submit commands.'}
      />

      {/* Pool tabs — ONLY for multi-pool guilds (AmeretaVerse) */}
      {isMulti && (
        <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, marginBottom: '20px' }}>
          {data.pools.map((p, i) => (
            <button key={p.pool_id} onClick={() => setActivePoolIdx(i)}
              style={{
                padding: '8px 18px', fontSize: '13px', fontWeight: 600,
                fontFamily: 'Sora, sans-serif', cursor: 'pointer',
                background: 'none', border: 'none',
                borderBottom: i === activePoolIdx ? `2px solid ${C.gold}` : '2px solid transparent',
                color: i === activePoolIdx ? C.gold : C.muted,
              }}>
              {p.display_name || p.name}
            </button>
          ))}
        </div>
      )}

      {pool && (<>
        <SettingsCard title="Module">
          <Toggle value={!!pool.enabled} onChange={setPoolField('enabled')} label={`Enable ${poolName}`} />
          <Toggle value={!!pool.auto_reset_daily} onChange={setPoolField('auto_reset_daily')} label="Auto-Reset Pool Daily"
            desc="Clears all active submissions at midnight UTC." />
        </SettingsCard>

        <SettingsCard title="Channel">
          <Field label={isMulti ? `${poolName} Channel` : 'Engage Channel'} hint="Channel name or ID">
            <Input value={pool.channel_id || ''} onChange={setPoolField('channel_id')}
              placeholder="#engage or channel ID" />
          </Field>
          <Field label="Allowed Roles (optional)" hint="Comma-separated role IDs. Leave empty = open to all.">
            <Input
              value={(Array.isArray(pool.allowed_role_ids) ? pool.allowed_role_ids : []).join(', ')}
              onChange={v => setPoolField('allowed_role_ids')(v.split(',').map(x => x.trim()).filter(Boolean))}
              placeholder="Role ID, Role ID... (blank = everyone)"
            />
          </Field>
        </SettingsCard>

        <SettingsCard title="Limits">
          <FieldRow>
            <Field label="Link Lifetime (hours)" hint="Leave empty = never expires">
              <Input type="number" value={pool.ttl_hours || ''} onChange={setPoolField('ttl_hours')} placeholder="— never —" />
            </Field>
            <Field label="Daily Submission Limit" hint="Submissions per user per day">
              <Input type="number" value={pool.daily_submission_limit} onChange={setPoolField('daily_submission_limit')} placeholder="3" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Points Per Engage" hint="Total points per engagement action">
              <Input type="number" value={pool.total_points_per_engage} onChange={setPoolField('total_points_per_engage')} placeholder="10" />
            </Field>
            <Field label="Submit Cost (pts)" hint="Engage points charged per submission">
              <Input type="number" value={pool.submit_cost} onChange={setPoolField('submit_cost')} placeholder="50" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Min. Followers to Submit" hint="X follower count required">
              <Input type="number" value={pool.min_followers} onChange={setPoolField('min_followers')} placeholder="100" />
            </Field>
          </FieldRow>
        </SettingsCard>

        <SettingsCard title="Engagement Weights">
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>
            Share of "Points Per Engage" for each task. Ratios are normalized at runtime for enabled tasks only.
          </p>
          <FieldRow cols={3}>
            <div>
              <Toggle value={!!pool.allow_like} onChange={setPoolField('allow_like')} label="❤️ Like" />
              <Field label="Like %">
                <Input type="number" value={pool.point_ratio_like} onChange={setPoolField('point_ratio_like')} placeholder="12" style={{ opacity: pool.allow_like ? 1 : 0.4 }} />
              </Field>
            </div>
            <div>
              <Toggle value={!!pool.allow_comment} onChange={setPoolField('allow_comment')} label="💬 Comment" />
              <Field label="Comment %">
                <Input type="number" value={pool.point_ratio_comment} onChange={setPoolField('point_ratio_comment')} placeholder="40" style={{ opacity: pool.allow_comment ? 1 : 0.4 }} />
              </Field>
            </div>
            <div>
              <Toggle value={!!pool.allow_retweet} onChange={setPoolField('allow_retweet')} label="🔁 Retweet" />
              <Field label="Retweet %">
                <Input type="number" value={pool.point_ratio_retweet} onChange={setPoolField('point_ratio_retweet')} placeholder="48" style={{ opacity: pool.allow_retweet ? 1 : 0.4 }} />
              </Field>
            </div>
          </FieldRow>
        </SettingsCard>
      </>)}

      <ActionBar saveState={saving ? 'saving' : (toast.startsWith('✓') ? 'saved' : 'idle')} onSave={handleSave} />
      {toast && !toast.startsWith('✓') && (
        <div style={{ marginTop: '8px', fontSize: '13px', color: C.red }}>{toast}</div>
      )}
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
              <Field label="Allowed Domains" hint="comma separated (spaces OK)">
                <Input value={v.linkWhitelist} onChange={set('linkWhitelist')} placeholder="twitter.com, x.com, discord.gg" />
              </Field>
            </div>
            <div style={{ marginTop: '14px', marginBottom: '14px' }}>
              <Field label="Allowed Roles"
                hint="Role IDs, comma separated (spaces OK). Members with any of these roles are exempt from link deletion. Useful for team and moderator roles.">
                <Input value={v.linkRoleWhitelist || ''} onChange={set('linkRoleWhitelist')}
                  placeholder="1234567890, 9876543210" />
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


// ── Logs (unified) ───────────────────────────────────────────────────────────

const LOG_SEVERITY_COLOR = {
  info:     { fg: 'rgba(255,255,255,0.78)', accent: 'rgba(255,255,255,0.18)' },
  warning:  { fg: '#f0c97a',                accent: 'rgba(240,201,122,0.5)' },
  error:    { fg: '#ff8c42',                accent: 'rgba(255,140,66,0.55)' },
  critical: { fg: '#ed4245',                accent: 'rgba(237,66,69,0.6)' },
};
const LOG_CATEGORY_ICON = {
  bot_activity: '🤖',
  admin_action: '👮',
  protection:   '🛡️',
  settings:     '⚙️',
  flag:         '🚩',
};
const LOG_MODULE_ICON = {
  raid: '⚔️', engage: '🔁', forms: '📝', tickets: '🎫',
  verify: '✅', roleselect: '🎭', protection: '🛡️',
  settings: '⚙️', brand: '🎨', levels: '⭐', access_control: '🔒',
};
const FLAG_SEVERITY_COLOR = {
  low:    { fg: 'rgba(255,255,255,0.78)', accent: 'rgba(255,255,255,0.18)' },
  medium: { fg: '#f0c97a',                accent: 'rgba(240,201,122,0.5)' },
  high:   { fg: '#ed4245',                accent: 'rgba(237,66,69,0.6)' },
};

function _formatTimeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)         return 'just now';
  if (seconds < 3600)       return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400)      return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7)  return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function _parseTs(ts) {
  if (!ts) return null;
  const s = String(ts);
  const iso = s.includes('T') ? s : s.replace(' ', 'T');
  const withTz = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z';
  const d = new Date(withTz);
  return isNaN(d.getTime()) ? null : d;
}

const _toolbarStyle = {
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px',
  background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
  borderRadius: '10px', padding: '10px 12px', marginBottom: '14px',
};
const _inputStyle = {
  background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`,
  borderRadius: '6px', padding: '7px 10px',
  color: '#fff', fontSize: '13px', fontFamily: 'Sora, sans-serif',
  outline: 'none',
};
const _selectStyle = { ..._inputStyle, paddingRight: '24px', cursor: 'pointer' };
const _pageBtnStyle = (disabled) => ({
  background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
  borderRadius: '6px', padding: '6px 12px',
  color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Sora, sans-serif', fontSize: '12px',
  opacity: disabled ? 0.5 : 1,
});

function LogsSubtabBar({ active, onChange }) {
  const tabs = [
    { id: 'all',          label: 'All Activity',      icon: '📊' },
    { id: 'bot_activity', label: 'Bot Activity',      icon: '🤖' },
    { id: 'admin_action', label: 'Admin Actions',     icon: '👮' },
    { id: 'protection',   label: 'Protection',        icon: '🛡️' },
    { id: 'flag',         label: 'Flagged Users',     icon: '🚩' },
    { id: 'settings',     label: 'Settings Changes',  icon: '⚙️' },
  ];
  return (
    <div style={{
      display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`,
      marginBottom: '18px', overflowX: 'auto',
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '9px 14px', fontSize: '13px', fontWeight: 600,
          fontFamily: 'Sora, sans-serif', background: 'none', border: 'none',
          borderBottom: active === t.id ? `2px solid ${C.gold}` : '2px solid transparent',
          color: active === t.id ? C.gold : C.muted, cursor: 'pointer',
          whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

function EventRow({ event }) {
  const [expanded, setExpanded] = useState(false);
  const sev = LOG_SEVERITY_COLOR[event.severity] || LOG_SEVERITY_COLOR.info;
  const created = _parseTs(event.created_at);
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <div style={{
      borderLeft: `3px solid ${sev.accent}`,
      background: 'rgba(255,255,255,0.025)',
      borderRadius: '0 8px 8px 0',
      padding: '12px 14px', marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>
          {LOG_CATEGORY_ICON[event.category] || '📌'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            flexWrap: 'wrap', marginBottom: '5px',
          }}>
            {event.module && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)',
              }}>
                {LOG_MODULE_ICON[event.module] ? `${LOG_MODULE_ICON[event.module]} ` : ''}
                {event.module}
              </span>
            )}
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)', color: C.muted,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            }}>{event.event_type}</span>
            {event.severity && event.severity !== 'info' && (
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.06)', color: sev.fg,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
              }}>{event.severity}</span>
            )}
            <span style={{
              marginLeft: 'auto', fontSize: '11px', color: C.muted,
            }} title={created ? created.toLocaleString() : ''}>
              {_formatTimeAgo(created)}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
            {event.summary}
          </div>
          {(event.actor_username || event.target_username) && (
            <div style={{
              fontSize: '11px', color: C.muted, marginTop: '5px',
              display: 'flex', gap: '14px', flexWrap: 'wrap',
            }}>
              {event.actor_username && (
                <span>by <span style={{ color: 'rgba(255,255,255,0.8)' }}>{event.actor_username}</span></span>
              )}
              {event.target_username && (
                <span>→ <span style={{ color: 'rgba(255,255,255,0.8)' }}>{event.target_username}</span></span>
              )}
            </div>
          )}
          {hasDetails && (
            <>
              <button onClick={() => setExpanded(v => !v)} style={{
                background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                fontSize: '11px', fontFamily: 'Sora, sans-serif', padding: 0, marginTop: '6px',
              }}>
                {expanded ? '▼' : '▶'} Details
              </button>
              {expanded && (
                <pre style={{
                  marginTop: '6px', background: 'rgba(0,0,0,0.45)',
                  border: `1px solid ${C.border}`, borderRadius: '6px',
                  padding: '8px 10px', fontSize: '11px',
                  color: 'rgba(255,255,255,0.75)',
                  overflowX: 'auto', maxHeight: '240px', whiteSpace: 'pre-wrap',
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                }}>{JSON.stringify(event.details, null, 2)}</pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventLogSection({ serverId, category }) {
  const PAGE_SIZE = 50;
  const [events, setEvents]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch]     = useState('');  // debounced value used for fetching
  const [moduleFilter, setModuleFilter]     = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [exportError, setExportError]       = useState('');
  const [exporting, setExporting]           = useState(false);

  // Debounce the search input → 400ms after the last keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [category, search, moduleFilter, severityFilter]);

  useEffect(() => {
    if (!serverId) return;
    let cancelled = false;
    setLoading(true);
    const params = {
      category:  category || undefined,
      module:    moduleFilter || undefined,
      severity:  severityFilter || undefined,
      search:    search || undefined,
      limit:     PAGE_SIZE,
      offset:    page * PAGE_SIZE,
    };
    fetchLogs(serverId, params)
      .then(data => {
        if (cancelled) return;
        setEvents(Array.isArray(data?.events) ? data.events : []);
        setTotal(Number(data?.total) || 0);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('logs fetch error', err);
        setEvents([]); setTotal(0);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [serverId, category, page, search, moduleFilter, severityFilter]);

  const handleExport = async () => {
    setExportError(''); setExporting(true);
    try {
      await downloadLogs(serverId, {
        category: category || undefined,
        module:   moduleFilter || undefined,
      });
    } catch (err) {
      setExportError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div style={_toolbarStyle}>
        <input
          type="text"
          placeholder="Search summaries or usernames…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{ ..._inputStyle, flex: 1, minWidth: '200px' }}
        />
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={_selectStyle}>
          <option value="">All Modules</option>
          <option value="raid">Raid</option>
          <option value="engage">Engage</option>
          <option value="forms">Forms</option>
          <option value="tickets">Tickets</option>
          <option value="verify">Verify</option>
          <option value="roleselect">Role Select</option>
          <option value="protection">Protection</option>
          <option value="brand">Brand</option>
          <option value="levels">Levels</option>
          <option value="access_control">Access Control</option>
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={_selectStyle}>
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>
        <button onClick={handleExport} disabled={exporting} style={{
          ..._pageBtnStyle(exporting), display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          {exporting ? '…' : '⬇️'} Export CSV
        </button>
        <span style={{ fontSize: '12px', color: C.muted, marginLeft: 'auto' }}>
          {total.toLocaleString()} event(s)
        </span>
      </div>
      {exportError && (
        <div style={{ fontSize: '12px', color: C.red, marginBottom: '12px' }}>{exportError}</div>
      )}

      {loading && events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>Loading…</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>
          No events match your filters.
        </div>
      ) : (
        <div>{events.map(e => <EventRow key={e.event_id} event={e} />)}</div>
      )}

      {total > PAGE_SIZE && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '14px', marginTop: '6px',
          borderTop: `1px solid ${C.border}`, fontSize: '12px', color: C.muted,
        }}>
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={_pageBtnStyle(page === 0)}>
              ◀ Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} style={_pageBtnStyle((page + 1) * PAGE_SIZE >= total)}>
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlagRow({ flag, onResolve }) {
  const sev = FLAG_SEVERITY_COLOR[flag.severity] || FLAG_SEVERITY_COLOR.medium;
  const sourceIcon = LOG_MODULE_ICON[flag.source_module] || '📌';
  const created = _parseTs(flag.created_at);
  return (
    <div style={{
      borderLeft: `3px solid ${sev.accent}`,
      background: 'rgba(255,255,255,0.025)',
      borderRadius: '0 8px 8px 0',
      padding: '12px 14px', marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>🚩</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            flexWrap: 'wrap', marginBottom: '5px',
          }}>
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)',
            }}>{sourceIcon} {flag.source_module}</span>
            <span style={{
              fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)', color: sev.fg,
              textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
            }}>{flag.severity}</span>
            <span style={{
              marginLeft: 'auto', fontSize: '11px', color: C.muted,
            }} title={created ? created.toLocaleString() : ''}>
              {created ? created.toLocaleString() : ''}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ fontWeight: 600 }}>{flag.username || flag.user_id}</span>
            {flag.reason && <span style={{ color: C.muted }}> — {flag.reason}</span>}
          </div>
          {flag.source_ref_id && (
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
              Ref: {flag.source_ref_id}
            </div>
          )}
          {flag.status === 'active' && (
            <button onClick={() => onResolve(flag.flag_id)} style={{
              marginTop: '8px', background: 'rgba(200,168,78,0.1)',
              border: `1px solid ${C.borderHover}`, color: C.gold,
              borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600, fontFamily: 'Sora, sans-serif',
            }}>
              ✓ Resolve
            </button>
          )}
          {flag.status !== 'active' && flag.resolved_note && (
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '6px', fontStyle: 'italic' }}>
              "{flag.resolved_note}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FlaggedUsersSection({ serverId }) {
  const [flags, setFlags]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [moduleFilter, setModuleFilter] = useState('');
  const [toast, setToast]               = useState('');

  const load = React.useCallback(() => {
    if (!serverId) return;
    setLoading(true);
    fetchFlags(serverId, { status: statusFilter, module: moduleFilter || undefined })
      .then(data => setFlags(Array.isArray(data) ? data : []))
      .catch(err => { console.error('flags fetch', err); setFlags([]); })
      .finally(() => setLoading(false));
  }, [serverId, statusFilter, moduleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (flagId) => {
    const note = window.prompt('Resolution note (optional):') || '';
    try {
      await resolveFlag(serverId, flagId, note);
      setToast('✓ Flag resolved');
      load();
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setToast('Failed: ' + (err.message || 'unknown error'));
      setTimeout(() => setToast(''), 4000);
    }
  };

  return (
    <div>
      <div style={_toolbarStyle}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={_selectStyle}>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} style={_selectStyle}>
          <option value="">All Sources</option>
          <option value="raid">Raid</option>
          <option value="engage">Engage</option>
          <option value="protection">Protection</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: C.muted }}>
          {flags.length} flag(s)
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>Loading…</div>
      ) : flags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>
          No {statusFilter} flags.
        </div>
      ) : (
        <div>{flags.map(f => (
          <FlagRow key={f.flag_id} flag={f} onResolve={handleResolve} />
        ))}</div>
      )}

      {toast && (
        <div style={{
          marginTop: '12px', fontSize: '12px',
          color: toast.startsWith('✓') ? C.green : C.red,
        }}>{toast}</div>
      )}
    </div>
  );
}

const LogsModule = () => {
  const { server } = useContext(DashboardContext);
  const sid = server?.id;
  const [subtab, setSubtab] = useState('all');

  return (
    <div>
      <PageHeader
        icon="📋"
        title="Logs"
        desc="Activity, admin actions, flagged users, and settings changes across this server."
      />
      <LogsSubtabBar active={subtab} onChange={setSubtab} />
      {subtab === 'flag'
        ? <FlaggedUsersSection serverId={sid} />
        : <EventLogSection serverId={sid} category={subtab === 'all' ? null : subtab} />}
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
              onClick={() => { if (s.id === 'add') window.open(ADD_TO_DISCORD_URL, '_blank'); else onSelect(s); setOpen(false); }}
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

// ── Points admin (Community Points + Engage Points) ────────────────────────────
//
// Shared panel powering both the "Community Points" and "Engage Points" settings
// sections. mode='community' targets raid/community points; mode='engage' targets
// the engage-for-engage pool points. Provides a data view (leaderboard / pools)
// plus award/remove admin controls wired to the existing admin endpoints. The
// backend enforces auth, bounds the amount, and audit-logs every mutation.

const PointsAdmin = ({ sid, mode }) => {
  const isCommunity = mode === 'community';
  const [board, setBoard]   = useState(null);   // community leaderboard
  const [pools, setPools]   = useState(null);   // engage pools
  const [loading, setLoading] = useState(true);

  const [uid, setUid]       = useState('');
  const [lookup, setLookup] = useState(null);   // looked-up user points
  const [poolId, setPoolId] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy]     = useState(false);
  const [msg, setMsg]       = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (isCommunity) {
        const b = await fetchLeaderboard(sid, 25);
        setBoard(Array.isArray(b) ? b : (b?.leaderboard || []));
      } else {
        const p = await fetchEngagePools(sid);
        const list = Array.isArray(p) ? p : (p?.pools || []);
        setPools(list);
        if (list.length === 1) setPoolId(String(list[0].pool_id));
      }
    } catch (e) { setMsg('Load error: ' + (e.message || e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (sid) loadData(); /* eslint-disable-line */ }, [sid, mode]);

  const doLookup = async () => {
    if (!uid.trim()) return;
    setMsg(''); setLookup(null);
    try {
      const r = await fetchUserPoints(sid, uid.trim());
      setLookup(r);
    } catch (e) { setMsg('✗ ' + (e.message || 'Lookup failed')); }
  };

  const doAdjust = async (action) => {
    if (busy) return;
    const n = parseInt(amount, 10);
    if (!uid.trim()) { setMsg('✗ Enter a user ID first'); return; }
    if (!Number.isFinite(n) || n < 1) { setMsg('✗ Amount must be a positive whole number'); return; }
    if (!isCommunity && pools && pools.length > 1 && !poolId) { setMsg('✗ Select a pool'); return; }
    setBusy(true); setMsg('');
    try {
      const body = { action, type: mode, user_id: uid.trim(), amount: n };
      if (!isCommunity && poolId) body.pool_id = Number(poolId);
      const res = await adjustPoints(sid, body);
      setMsg(`✓ ${action === 'add' ? 'Awarded' : 'Removed'} ${n} points. New balance: ${res.new_points ?? '—'}`);
      await doLookup();
      await loadData();
    } catch (e) { setMsg('✗ ' + (e.message || 'Adjustment failed')); }
    finally { setBusy(false); }
  };

  const inputStyle = {
    background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '9px 12px', color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: '13px', outline: 'none',
  };
  const btn = (bg, fg) => ({
    background: bg, border: 'none', borderRadius: '8px', padding: '9px 16px', color: fg,
    cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px',
    fontWeight: 700, opacity: busy ? 0.6 : 1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
          {isCommunity ? 'Community Points' : 'Engage Points'}
        </div>
        <div style={{ color: C.muted, fontSize: '13px', marginBottom: '18px' }}>
          {isCommunity
            ? 'Points earned through raids and community participation. Look up a member and award or remove points.'
            : 'Points earned through the engage-for-engage module. Managed separately from community points.'}
        </div>

        {/* Admin controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <input value={uid} onChange={e => setUid(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="User ID" style={{ ...inputStyle, width: '170px' }} />
          <button onClick={doLookup} style={btn('rgba(255,255,255,0.08)', '#fff')}>Look up</button>
          {!isCommunity && pools && pools.length > 1 && (
            <select value={poolId} onChange={e => setPoolId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select pool…</option>
              {pools.map(p => <option key={p.pool_id} value={p.pool_id}>{p.display_name || p.name}</option>)}
            </select>
          )}
          <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Amount" style={{ ...inputStyle, width: '110px' }} />
          <button onClick={() => doAdjust('add')}    style={btn(`linear-gradient(135deg,${C.gold},${C.goldDark})`, '#0A0A0F')}>Award</button>
          <button onClick={() => doAdjust('remove')} style={btn('rgba(237,66,69,0.15)', C.red)}>Remove</button>
        </div>
        {msg && <div style={{ marginTop: '12px', fontSize: '13px', color: msg.startsWith('✓') ? C.green : C.red }}>{msg}</div>}

        {lookup && (
          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', fontSize: '13px' }}>
            <div style={{ color: C.muted, marginBottom: '6px' }}>User {lookup.user_id}</div>
            {isCommunity ? (
              <div>Community points: <strong style={{ color: C.gold }}>{(lookup.community_points || 0).toLocaleString()}</strong></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(lookup.engage_pools || []).length
                  ? lookup.engage_pools.map(p => (
                      <div key={p.pool_id}>{p.display_name || p.name}: <strong style={{ color: C.gold }}>{(p.points || 0).toLocaleString()}</strong></div>
                    ))
                  : <div style={{ color: C.muted }}>No engage pools configured.</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data view */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          {isCommunity ? 'Top community point holders' : 'Engage pools'}
        </div>
        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px' }}>Loading…</div>
        ) : isCommunity ? (
          (board && board.length) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {board.map((r, i) => (
                <div key={r.user_id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ width: '26px', color: C.muted, fontWeight: 700 }}>#{i + 1}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username || `User ${r.user_id}`}</span>
                  <strong style={{ color: C.gold }}>{(r.total_points ?? r.points ?? 0).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          ) : <div style={{ color: C.muted, fontSize: '13px' }}>No community points awarded yet.</div>
        ) : (
          (pools && pools.length) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pools.map(p => (
                <div key={p.pool_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                  <span style={{ flex: 1 }}>{p.display_name || p.name}</span>
                  <span style={{ color: C.muted, fontSize: '11px' }}>pool #{p.pool_id}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ color: C.muted, fontSize: '13px' }}>No engage pools configured.</div>
        )}
      </div>
    </div>
  );
};

// ── Settings module ───────────────────────────────────────────────────────────

const SettingsModule = () => {
  const { server } = useContext(DashboardContext);
  const sid = server?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('brand');
  const [brand, setBrand] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [assetTarget, setAssetTarget] = useState(null); // 'bot_avatar_url' | 'default_thumbnail_url' | 'default_footer_icon_url'

  useEffect(() => {
    if (!sid) return;
    setLoading(true);
    fetchSettings(sid)
      .then(d => { setData(d); setBrand(d.brand || {}); })
      .catch(e => setSaveMsg('Load error: ' + e.message))
      .finally(() => setLoading(false));
  }, [sid]); // eslint-disable-line

  const handleSaveBrand = async () => {
    setSaving(true);
    try {
      const updated = await updateBrand(sid, brand);
      setBrand(updated);
      setSaveMsg('✓ Saved');
    } catch (e) {
      setSaveMsg('✗ ' + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleSaveLevels = async () => {
    setSaving(true);
    try {
      const payload = {
        level_enabled:             brand.level_enabled ? 1 : 0,
        xp_per_message:            parseInt(brand.xp_per_message, 10) || 0,
        xp_cooldown_seconds:       parseInt(brand.xp_cooldown_seconds, 10) || 0,
        level_up_message_enabled:  brand.level_up_message_enabled ? 1 : 0,
        level_up_channel_id:       brand.level_up_channel_id || '',
      };
      const updated = await updateLevels(sid, payload);
      setBrand(updated);
      setSaveMsg('✓ Saved');
    } catch (e) {
      setSaveMsg('✗ ' + e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleToggleAccess = async (roleId, module, granted) => {
    setData(prev => ({
      ...prev,
      roles: prev.roles.map(r =>
        r.id !== roleId ? r : {
          ...r,
          modules: granted
            ? [...new Set([...r.modules, module])]
            : r.modules.filter(m => m !== module),
        }
      ),
    }));
    try {
      await updateAccess(sid, roleId, module, granted);
    } catch (e) {
      setSaveMsg('Access update failed: ' + e.message);
      setData(prev => ({
        ...prev,
        roles: prev.roles.map(r =>
          r.id !== roleId ? r : {
            ...r,
            modules: granted
              ? r.modules.filter(m => m !== module)
              : [...new Set([...r.modules, module])],
          }
        ),
      }));
    }
  };

  if (loading) return <div style={{ color: C.muted, padding: '24px 0' }}>Loading…</div>;

  return (
    <div>
      <PageHeader icon="⚙️" title="Server Settings" badge="SERVER" desc="Bot-wide brand defaults and per-module access control." />

      <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, marginBottom: '20px' }}>
        {[['brand', '🎨 Brand'], ['levels', '⭐ Levels'], ['community_points', '⚔️ Community Points'], ['engage_points', '🔁 Engage Points'], ['access', '🔒 Access Control']].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            padding: '8px 16px', fontSize: '13px', fontWeight: 600,
            fontFamily: 'Sora, sans-serif', cursor: 'pointer', background: 'none', border: 'none',
            borderBottom: subTab === id ? `2px solid ${C.gold}` : '2px solid transparent',
            color: subTab === id ? C.gold : C.muted,
          }}>{label}</button>
        ))}
      </div>

      {subTab === 'brand' && (() => {
        const isBrandPremium = sid === '1199707792706117642';

        const handleImageSelect = (url) => {
          if (assetTarget) setBrand(b => ({ ...b, [assetTarget]: url }));
          setAssetTarget(null);
        };

        return (
          <>
            <div style={{ marginBottom: '12px', color: C.muted, fontSize: '13px' }}>
              Fallback color, avatar and footer used across all bot embeds. Module-specific settings always take priority.
            </div>
            <div style={{ position: 'relative' }}>
              <DiscordMessagePreview
                botAvatar={brand.bot_avatar_url}
                botName={brand.bot_display_name || 'AVbot'}
                accentColor={brand.default_embed_color || '#94730D'}
                thumbnail={brand.default_thumbnail_url}
                footerText={brand.default_footer_text}
                footerIcon={brand.default_footer_icon_url}
                isPremium={isBrandPremium}
                onAvatarClick={isBrandPremium ? () => setAssetTarget('bot_avatar_url') : null}
                onNameEdit={isBrandPremium ? (v) => setBrand(b => ({ ...b, bot_display_name: v })) : null}
                onColorChange={isBrandPremium ? (v) => setBrand(b => ({ ...b, default_embed_color: v })) : null}
                onThumbnailClick={isBrandPremium ? () => setAssetTarget('default_thumbnail_url') : null}
                onFooterTextEdit={isBrandPremium ? (v) => setBrand(b => ({ ...b, default_footer_text: v })) : null}
                onFooterIconClick={isBrandPremium ? () => setAssetTarget('default_footer_icon_url') : null}
              />

              {!isBrandPremium && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.65)',
                  backdropFilter: 'blur(2px)', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ textAlign: 'center', maxWidth: '320px', padding: '24px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                    <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: '8px', fontSize: '16px', margin: '0 0 8px' }}>
                      Visual customization is coming soon
                    </h3>
                    <p style={{ color: '#949ba4', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                      Brand customization will be available in a future update.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isBrandPremium && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <ActionBar saveState={saving ? 'saving' : (saveMsg.startsWith('✓') ? 'saved' : 'idle')} onSave={handleSaveBrand} />
                {saveMsg && !saveMsg.startsWith('✓') && <span style={{ color: C.red, fontSize: '13px' }}>{saveMsg}</span>}
              </div>
            )}

            {assetTarget && (
              <AssetPickerModal
                serverId={sid}
                hasCurrent={!!brand[assetTarget]}
                onPick={handleImageSelect}
                onClose={() => setAssetTarget(null)}
              />
            )}
          </>
        );
      })()}

      {subTab === 'levels' && (
        <>
          <SettingsCard title="Activity Leveling">
            <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>
              Members earn XP for sending messages. Each level unlocks bragging rights — and you can hook role rewards on top later.
            </p>
            <Toggle
              value={!!brand.level_enabled}
              onChange={v => setBrand(b => ({ ...b, level_enabled: v ? 1 : 0 }))}
              label="Enable leveling"
            />
            <FieldRow>
              <Field label="XP per message" hint="how much XP a member earns per qualifying message">
                <Input
                  type="number"
                  value={brand.xp_per_message ?? 15}
                  onChange={v => setBrand(b => ({ ...b, xp_per_message: v }))}
                  placeholder="15"
                />
              </Field>
              <Field label="Cooldown (seconds)" hint="minimum gap between XP grants per user">
                <Input
                  type="number"
                  value={brand.xp_cooldown_seconds ?? 60}
                  onChange={v => setBrand(b => ({ ...b, xp_cooldown_seconds: v }))}
                  placeholder="60"
                />
              </Field>
            </FieldRow>
          </SettingsCard>

          <SettingsCard title="Level-up Announcements" style={{ marginTop: '14px' }}>
            <Toggle
              value={!!brand.level_up_message_enabled}
              onChange={v => setBrand(b => ({ ...b, level_up_message_enabled: v ? 1 : 0 }))}
              label="Send a message when someone levels up"
            />
            <Field label="Channel" hint="leave blank to post in the channel where they leveled up">
              <Input
                value={brand.level_up_channel_id || ''}
                onChange={v => setBrand(b => ({ ...b, level_up_channel_id: v }))}
                placeholder="#general or 123456789"
              />
            </Field>
          </SettingsCard>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <ActionBar saveState={saving ? 'saving' : (saveMsg.startsWith('✓') ? 'saved' : 'idle')} onSave={handleSaveLevels} />
            {saveMsg && !saveMsg.startsWith('✓') && <span style={{ color: C.red, fontSize: '13px' }}>{saveMsg}</span>}
          </div>
        </>
      )}

      {subTab === 'community_points' && <PointsAdmin sid={sid} mode="community" />}

      {subTab === 'engage_points' && <PointsAdmin sid={sid} mode="engage" />}

      {subTab === 'access' && data && (
        <SettingsCard title="Module Access by Role">
          <p style={{ margin: '0 0 14px', color: C.muted, fontSize: '13px' }}>
            Restrict which admin roles can access each module. Server owner always has full access.
            If NO roles are checked for a module, ALL admins have access (default).
          </p>
          {(!data.roles || data.roles.length === 0) ? (
            <div style={{ color: C.muted }}>No roles found in this server.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: C.muted, fontWeight: 600, minWidth: '120px' }}>Role</th>
                    {(data.modules || []).map(m => (
                      <th key={m} style={{ padding: '8px 6px', color: C.muted, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {m.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.roles.map(r => (
                    <tr key={r.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                      <td style={{ padding: '7px 6px', fontWeight: 500, color: r.color || '#fff' }}>{r.name}</td>
                      {(data.modules || []).map(m => {
                        const granted = (r.modules || []).includes(m);
                        return (
                          <td key={m} style={{ textAlign: 'center', padding: '7px 6px' }}>
                            <input
                              type="checkbox"
                              checked={granted}
                              onChange={e => handleToggleAccess(r.id, m, e.target.checked)}
                              style={{ cursor: 'pointer', accentColor: C.gold, width: '15px', height: '15px' }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {saveMsg && <div style={{ color: C.red, fontSize: '13px', marginTop: '8px' }}>{saveMsg}</div>}
        </SettingsCard>
      )}
    </div>
  );
};

// ── Embed Message module ─────────────────────────────────────────────────────
// Dashboard-side composer for branded embeds. Backend uses build_branded_embed
// so anything rendered here will look the same when posted to Discord (apart
// from font, which Discord renders client-side).

const EMBED_EDITOR_DEFAULTS = {
  title:         '',
  description:   '',
  color:         '',     // empty = use brand default on server side
  image_url:     '',
  thumbnail_url: '',
  channel_id:    '',
  fields:        [],     // {name, value, inline}
};

const EmbedMessagesSettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const serverId = server?.id;

  const [embeds,    setEmbeds]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeId,  setActiveId]  = useState(null);

  const [editor,    setEditor]    = useState({ ...EMBED_EDITOR_DEFAULTS });
  const setEd                     = k => v => setEditor(p => ({ ...p, [k]: v }));
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');
  const [sendState, setSendState] = useState('idle');
  const [sendMsg,   setSendMsg]   = useState('');
  const [confirmDel, setConfirmDel] = useState(null); // { id, mode: 'draft'|'message' }

  const doFetch = async () => {
    if (!serverId) return;
    try {
      const { embeds: list } = await listEmbeds(serverId);
      setEmbeds(list || []);
      setError(null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    setActiveId(null);
    setEmbeds([]);
    listEmbeds(serverId)
      .then(({ embeds: list }) => { setEmbeds(list || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [serverId]); // eslint-disable-line

  useEffect(() => {
    const row = embeds.find(x => x.id === activeId);
    if (!row) return;
    setEditor({
      title:         row.title || '',
      description:   row.description || '',
      color:         row.color || '',
      image_url:     row.image_url || '',
      thumbnail_url: row.thumbnail_url || '',
      channel_id:    row.channel_id || '',
      fields:        Array.isArray(row.fields) ? row.fields : [],
    });
    setSaveMsg(''); setSendMsg(''); setSendState('idle');
  }, [activeId, embeds]);

  const activeRow = embeds.find(e => e.id === activeId) || null;

  const handleCreate = async () => {
    if (!serverId) return;
    try {
      const created = await createEmbed(serverId, { title: 'New Embed' });
      await doFetch();
      setActiveId(created.id);
    } catch (e) { setError(e.message); }
  };

  const handleSave = async () => {
    if (!serverId || !activeId || saving) return;
    setSaving(true); setSaveMsg('');
    try {
      const res = await updateEmbed(serverId, activeId, {
        title:         editor.title,
        description:   editor.description,
        color:         editor.color || null,
        image_url:     editor.image_url,
        thumbnail_url: editor.thumbnail_url,
        channel_id:    editor.channel_id,
        fields:        editor.fields,
      });
      if (res?.live_edit === 'edited') {
        setSaveMsg('✓ Saved (live message updated)');
      } else if (res?.live_edit === 'forbidden') {
        setSaveMsg('✓ Saved (bot lacks permission to edit live message)');
      } else if (res?.live_edit === 'message_missing') {
        setSaveMsg('✓ Saved (live message was missing; back to draft)');
      } else {
        setSaveMsg('✓ Saved');
      }
      await doFetch();
    } catch (e) { setSaveMsg('✗ ' + e.message); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 4000); }
  };

  const handleSend = async ({ resend = false } = {}) => {
    if (!serverId || !activeId || sendState === 'sending') return;
    const ch = (editor.channel_id || '').trim();
    if (!ch) {
      setSendMsg('Enter a channel name or ID first');
      setSendState('error');
      setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 3500);
      return;
    }
    setSendState('sending');
    try {
      // Save edits first so what posts matches what's on screen. Skip the
      // live-message edit roundtrip on resend (we're about to overwrite anyway).
      await updateEmbed(serverId, activeId, {
        title:         editor.title,
        description:   editor.description,
        color:         editor.color || null,
        image_url:     editor.image_url,
        thumbnail_url: editor.thumbnail_url,
        channel_id:    editor.channel_id,
        fields:        editor.fields,
      });
      const res = await sendEmbed(serverId, activeId, ch);
      setSendMsg(resend
        ? `✓ Resent (msg ${res.message_id})`
        : `✓ Sent (msg ${res.message_id})`);
      setSendState('sent');
      await doFetch();
    } catch (e) {
      setSendMsg('✗ ' + e.message);
      setSendState('error');
    }
    setTimeout(() => { setSendMsg(''); setSendState('idle'); }, 5000);
  };

  const handleDeleteLiveMessage = async () => {
    if (!serverId || !activeId) return;
    try {
      await deleteEmbedMessage(serverId, activeId);
      await doFetch();
      setConfirmDel(null);
    } catch (e) { setError(e.message); }
  };

  const handleDeleteDraft = async () => {
    if (!serverId || !confirmDel) return;
    try {
      await deleteEmbed(serverId, confirmDel.id, false);
      if (activeId === confirmDel.id) setActiveId(null);
      setConfirmDel(null);
      await doFetch();
    } catch (e) { setError(e.message); }
  };

  const addField = () => {
    if ((editor.fields || []).length >= 10) return;
    setEditor(p => ({ ...p, fields: [...(p.fields || []),
      { name: '', value: '', inline: false }] }));
  };
  const updateField = (idx, patch) => {
    setEditor(p => ({
      ...p,
      fields: (p.fields || []).map((f, i) => i === idx ? { ...f, ...patch } : f),
    }));
  };
  const removeField = (idx) => {
    setEditor(p => ({ ...p, fields: (p.fields || []).filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <PageHeader icon="💬" title="Embed Messages" badge="MODULE"
        desc="Compose branded embeds and post them to any channel. Edits flow live; resend creates a new message." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── Embed list ── */}
      <SettingsCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Embeds</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
              Unlimited drafts per server. Each one targets a single channel; you can edit, resend, or remove the posted message at any time.
            </div>
          </div>
          <button onClick={handleCreate}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            + New Embed
          </button>
        </div>

        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px', padding: '16px 0' }}>Loading…</div>
        ) : embeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
            <div style={{ fontSize: '14px' }}>
              No embeds yet. Click <strong style={{ color: C.gold }}>+ New Embed</strong> to start.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {embeds.map(row => {
              const isActive = activeId === row.id;
              const isPosted = row.status === 'posted';
              const titlePreview = row.title || '(untitled)';
              const updatedRel = relativeTime(row.updated_at);
              return (
                <div key={row.id}
                  style={{ background: isActive ? 'rgba(200,168,78,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isActive ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {titlePreview}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: isPosted ? 'rgba(59,165,92,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isPosted ? 'rgba(59,165,92,0.35)' : 'rgba(255,255,255,0.1)'}`,
                        color: isPosted ? C.green : C.muted,
                        padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {isPosted ? 'Posted' : 'Draft'}
                      </span>
                      {row.channel_id && <span>· channel {row.channel_id}</span>}
                      {updatedRel && <span>· edited {updatedRel}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={() => setActiveId(isActive ? null : row.id)}
                      style={{ background: isActive ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isActive ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 12px', color: isActive ? C.gold : '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      {isActive ? '▲ Close' : '✏️ Edit'}
                    </button>
                    {confirmDel?.id === row.id && confirmDel.mode === 'draft' ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.red }}>Delete draft?</span>
                        <button onClick={handleDeleteDraft}
                          style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                        <button onClick={() => setConfirmDel(null)}
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDel({ id: row.id, mode: 'draft' })}
                        title="Delete this draft (live message is left intact)"
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* ── Editor ── */}
      {activeRow && (
        <>
          <SettingsCard title="Embed">
            <EmbedPreview
              serverId={serverId}
              isPremium={isPremium}
              title={editor.title}
              description={editor.description}
              thumbnailUrl={editor.thumbnail_url}
              imageUrl={editor.image_url}
              color={editor.color || '#94730D'}
              footerText={''}
              onTitleChange={setEd('title')}
              onDescriptionChange={setEd('description')}
              onThumbnailChange={setEd('thumbnail_url')}
              onImageChange={setEd('image_url')}
              onColorChange={setEd('color')}
              onFooterTextChange={() => {}}
              showImage={true}
              bodySize="base"
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: C.muted }}>
              Color, footer, thumbnail use your Server Settings brand by default. Set values here to override per-embed.
            </div>
          </SettingsCard>

          <SettingsCard title="Additional Fields"
            >
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '-6px', marginBottom: '12px' }}>
              Optional. Up to 10 named blocks under the description. Inline rows show side by side.
            </div>
            {(editor.fields || []).length === 0 && (
              <div style={{ color: C.muted, fontSize: '13px', padding: '8px 0 12px' }}>
                No extra fields. Click below to add one.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(editor.fields || []).map((f, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    <div>
                      <Label>Name</Label>
                      <Input value={f.name || ''} onChange={v => updateField(i, { name: v })} placeholder="Field title" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Label>Value</Label>
                      <Textarea value={f.value || ''} onChange={v => updateField(i, { value: v })} placeholder="Markdown supported" rows={2} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <label style={{ fontSize: '12px', color: C.muted, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!f.inline}
                        onChange={e => updateField(i, { inline: e.target.checked })}
                        style={{ cursor: 'pointer', accentColor: C.gold }} />
                      Inline
                    </label>
                    <button onClick={() => removeField(i)}
                      style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addField}
              disabled={(editor.fields || []).length >= 10}
              style={{ marginTop: '12px', background: 'rgba(200,168,78,0.08)', border: '1px solid rgba(200,168,78,0.25)', borderRadius: '8px', padding: '8px 14px', color: C.gold, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, opacity: (editor.fields || []).length >= 10 ? 0.4 : 1 }}>
              + Add Field
            </button>
          </SettingsCard>

          <SettingsCard title="Target Channel">
            <Field label="Channel" hint="name (e.g. announcements) or numeric ID">
              <Input value={editor.channel_id} onChange={setEd('channel_id')}
                placeholder="#announcements or 1234567890" />
            </Field>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              <button onClick={handleSave} disabled={saving}
                style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 18px', color: '#0A0A0F', cursor: saving ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : (activeRow.status === 'posted' ? 'Save (edits live message)' : 'Save Draft')}
              </button>
              <button onClick={() => handleSend({ resend: false })}
                disabled={sendState === 'sending'}
                style={{ background: 'rgba(59,165,92,0.12)', border: '1px solid rgba(59,165,92,0.35)', borderRadius: '8px', padding: '9px 18px', color: C.green, cursor: sendState === 'sending' ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: sendState === 'sending' ? 0.6 : 1 }}>
                {sendState === 'sending' ? 'Sending…' : (activeRow.status === 'posted' ? 'Resend (new message)' : 'Send to Channel')}
              </button>
              {activeRow.status === 'posted' && (
                <button onClick={handleDeleteLiveMessage}
                  style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.35)', borderRadius: '8px', padding: '9px 14px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                  Delete Live Message
                </button>
              )}
            </div>

            {(saveMsg || sendMsg) && (
              <div style={{ marginTop: '10px', fontSize: '12px',
                color: (saveMsg.startsWith('✗') || sendMsg.startsWith('✗')) ? C.red : C.green }}>
                {saveMsg}{saveMsg && sendMsg ? ' · ' : ''}{sendMsg}
              </div>
            )}
            {activeRow.status === 'posted' && activeRow.channel_id && activeRow.message_id && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: C.muted }}>
                Posted as message {activeRow.message_id} in channel {activeRow.channel_id}.
              </div>
            )}
          </SettingsCard>
        </>
      )}
    </div>
  );
};

// Relative-time helper for the embed list. Standalone and tolerant of bad
// timestamps; returns an empty string if the input is unparseable.
function relativeTime(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  const diff = Date.now() - t;
  if (diff < 0) return 'just now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60)  return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60)  return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr  < 24)  return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d   < 30)  return `${d}d ago`;
  return new Date(t).toLocaleDateString();
}


// ── Giveaway module ──────────────────────────────────────────────────────────
// Dashboard composer for branded giveaway embeds. Same backend-driven brand
// preview pattern as Embed Messages and Forms.

const GIVEAWAY_EDITOR_DEFAULTS = {
  title:             '',
  description:       '',
  prize:             '',
  color:             '',
  image_url:         '',
  thumbnail_url:     '',
  channel_id:        '',
  mention_role_ids:  [],         // array of role-id strings (multi-role)
  allowed_role_ids:  [],         // array of role-id strings
  duration_value:    1,
  duration_unit:     'hours',    // 'minutes' | 'hours' | 'days'
  winner_count:      1,
  entry_cost_points: 0,
};

// Tolerant parser used by the dashboard inputs: accept any combination of
// commas, whitespace, and newlines as separators. Drops empty tokens. Does
// NOT validate digits — the backend rejects non-numeric tokens with a
// friendly message, and forcing the dashboard to also validate would just
// duplicate the rule in two places.
function parseRoleIdInput(text) {
  return String(text || '')
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

const DURATION_UNIT_FACTOR = { minutes: 60, hours: 3600, days: 86400 };

function secondsToFriendly(sec) {
  const s = Math.max(0, sec | 0);
  if (s >= 86400 && s % 86400 === 0) return { value: s / 86400, unit: 'days' };
  if (s >= 3600  && s % 3600  === 0) return { value: s / 3600,  unit: 'hours' };
  if (s >= 60    && s % 60    === 0) return { value: s / 60,    unit: 'minutes' };
  if (s >= 86400) return { value: Math.round(s / 86400), unit: 'days' };
  if (s >= 3600)  return { value: Math.round(s / 3600),  unit: 'hours' };
  return { value: Math.max(1, Math.round(s / 60)), unit: 'minutes' };
}

function giveawayRelative(iso) {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (isNaN(t)) return '';
  const diff = t - Date.now();
  if (diff <= 0) return 'now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60)   return `in ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60)   return `in ${min}m`;
  const hr  = Math.floor(min / 60);
  if (hr < 24)    return `in ${hr}h ${min % 60}m`;
  const d   = Math.floor(hr / 24);
  return `in ${d}d ${hr % 24}h`;
}

const STATUS_BADGE = {
  draft:     { label: 'Draft',     bg: 'rgba(255,255,255,0.05)', fg: 'rgba(255,255,255,0.55)', bd: 'rgba(255,255,255,0.1)'  },
  active:    { label: 'Active',    bg: 'rgba(59,165,92,0.12)',   fg: '#3ba55c',                bd: 'rgba(59,165,92,0.35)'    },
  drawing:   { label: 'Drawing',   bg: 'rgba(200,168,78,0.12)',  fg: '#C8A84E',                bd: 'rgba(200,168,78,0.35)'  },
  ended:     { label: 'Ended',     bg: 'rgba(88,101,242,0.12)',  fg: '#5865F2',                bd: 'rgba(88,101,242,0.35)'  },
  cancelled: { label: 'Cancelled', bg: 'rgba(237,66,69,0.10)',   fg: '#ed4245',                bd: 'rgba(237,66,69,0.35)'    },
};

const GiveawaySettings = () => {
  const { server, isPremium } = useContext(DashboardContext);
  const serverId = server?.id;

  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeId,  setActiveId]  = useState(null);

  const [editor, setEditor]   = useState({ ...GIVEAWAY_EDITOR_DEFAULTS });
  const setEd = k => v => setEditor(p => ({ ...p, [k]: v }));
  const [busy,    setBusy]    = useState(false);
  const [msg,     setMsg]     = useState('');
  const [msgKind, setMsgKind] = useState('ok'); // 'ok' | 'err'

  const [confirm, setConfirm] = useState(null);  // {id, action: 'delete'|'cancel'}
  const [entrantsFor, setEntrantsFor] = useState(null);
  const [entrants, setEntrants] = useState([]);
  const [entrantsLoading, setEntrantsLoading] = useState(false);

  const doFetch = async () => {
    if (!serverId) return;
    try {
      const { giveaways } = await listGiveaways(serverId);
      setList(giveaways || []);
      setError(null);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    setActiveId(null);
    setList([]);
    listGiveaways(serverId)
      .then(({ giveaways }) => { setList(giveaways || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [serverId]); // eslint-disable-line

  // When a row becomes active in the editor, hydrate the form.
  useEffect(() => {
    const row = list.find(x => x.id === activeId);
    if (!row) return;
    const dur = secondsToFriendly(row.duration_seconds || 3600);
    setEditor({
      title:             row.title || '',
      description:       row.description || '',
      prize:             row.prize || '',
      color:             row.color || '',
      image_url:         row.image_url || '',
      thumbnail_url:     row.thumbnail_url || '',
      channel_id:        row.channel_id || '',
      mention_role_ids:  Array.isArray(row.mention_role_ids) && row.mention_role_ids.length
        ? row.mention_role_ids
        : (row.mention_role_id ? [String(row.mention_role_id)] : []),
      allowed_role_ids:  Array.isArray(row.allowed_role_ids) ? row.allowed_role_ids : [],
      duration_value:    dur.value,
      duration_unit:     dur.unit,
      winner_count:      row.winner_count || 1,
      entry_cost_points: row.entry_cost_points || 0,
    });
    setMsg('');
  }, [activeId, list]);

  const active = list.find(g => g.id === activeId) || null;
  const isActive    = active?.status === 'active';
  const isEnded     = active?.status === 'ended';
  const isDraft     = active?.status === 'draft';
  const isCancelled = active?.status === 'cancelled';

  const showMsg = (text, kind = 'ok') => {
    setMsg(text); setMsgKind(kind);
    setTimeout(() => setMsg(''), 4500);
  };

  // ── Actions ─────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!serverId) return;
    try {
      const created = await createGiveaway(serverId, { title: 'New Giveaway', prize: '' });
      await doFetch();
      setActiveId(created.id);
    } catch (e) { setError(e.message); }
  };

  const editorToPayload = () => ({
    title:             editor.title,
    description:       editor.description,
    prize:             editor.prize,
    color:             editor.color || null,
    image_url:         editor.image_url,
    thumbnail_url:     editor.thumbnail_url,
    channel_id:        editor.channel_id,
    mention_role_ids:  editor.mention_role_ids || [],
    allowed_role_ids:  editor.allowed_role_ids || [],
    duration_seconds:  Math.max(60,
        (Number(editor.duration_value) || 0) * (DURATION_UNIT_FACTOR[editor.duration_unit] || 3600)),
    winner_count:      Math.max(1, Number(editor.winner_count) || 1),
    entry_cost_points: Math.max(0, Number(editor.entry_cost_points) || 0),
  });

  const handleSave = async () => {
    if (!serverId || !activeId || busy) return;
    setBusy(true);
    try {
      const payload = editorToPayload();
      // Drop the locked-while-active fields so the backend doesn't reject the save.
      if (isActive) {
        delete payload.duration_seconds;
        delete payload.winner_count;
        delete payload.entry_cost_points;
        delete payload.allowed_role_ids;
        delete payload.mention_role_ids;
        delete payload.channel_id;
      }
      const res = await updateGiveaway(serverId, activeId, payload);
      showMsg(res?.live_edit === 'edited' ? 'Saved (live message updated)' : 'Saved');
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleStart = async () => {
    if (!serverId || !activeId || busy) return;
    // Save first so the latest editor values are in the row when start posts.
    setBusy(true);
    try {
      const payload = editorToPayload();
      await updateGiveaway(serverId, activeId, payload);
      const res = await startGiveaway(serverId, activeId);
      showMsg(`Started. Ends ${giveawayRelative(res.ends_at)}.`);
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleEndNow = async () => {
    if (!serverId || !activeId || busy) return;
    setBusy(true);
    try {
      await endGiveawayNow(serverId, activeId);
      showMsg('Drawing winners now.');
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleReroll = async () => {
    if (!serverId || !activeId || busy) return;
    setBusy(true);
    try {
      await rerollGiveaway(serverId, activeId);
      showMsg('Rerolled.');
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleCancel = async (id) => {
    if (!serverId || !id) return;
    setBusy(true);
    try {
      const res = await cancelGiveaway(serverId, id);
      const r = res?.refund;
      if (r && r.refunded_points > 0) {
        showMsg(`Cancelled. Refunded ${r.refunded_points.toLocaleString()} points to ${r.refunded_users} entrant${r.refunded_users === 1 ? '' : 's'}.`);
      } else {
        showMsg('Cancelled.');
      }
      setConfirm(null);
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleDelete = async (id) => {
    if (!serverId || !id) return;
    setBusy(true);
    try {
      await deleteGiveaway(serverId, id);
      if (activeId === id) setActiveId(null);
      setConfirm(null);
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const openEntrants = async (id) => {
    setEntrantsFor(id); setEntrants([]); setEntrantsLoading(true);
    try {
      const r = await fetchGiveawayEntries(serverId, id);
      setEntrants(r.entries || []);
    } catch (e) {
      showMsg(e.message, 'err');
    } finally { setEntrantsLoading(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader icon="🎉" title="Giveaway" badge="MODULE"
        desc="Branded giveaway embeds with role gating and optional community-points entry cost. Winners drawn from a seeded reproducible pool." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── List ── */}
      <SettingsCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Giveaways</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
              Drafts stay private. Start to post the embed and open entries. Cancelling an active paid giveaway refunds every entrant.
            </div>
          </div>
          <button onClick={handleCreate}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            + New Giveaway
          </button>
        </div>

        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px', padding: '16px 0' }}>Loading…</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🎉</div>
            <div style={{ fontSize: '14px' }}>
              No giveaways yet. Click <strong style={{ color: C.gold }}>+ New Giveaway</strong> to start.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map(row => {
              const isOpen  = activeId === row.id;
              const badge   = STATUS_BADGE[row.status] || STATUS_BADGE.draft;
              const ends    = row.status === 'active' ? giveawayRelative(row.ends_at) : '';
              return (
                <div key={row.id}
                  style={{ background: isOpen ? 'rgba(200,168,78,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isOpen ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.title || '(untitled)'}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: badge.bg, border: `1px solid ${badge.bd}`, color: badge.fg,
                        padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>{badge.label}</span>
                      <span>{row.entry_count.toLocaleString()} entr{row.entry_count === 1 ? 'y' : 'ies'}</span>
                      {row.entry_cost_points > 0 && <span>· {row.entry_cost_points.toLocaleString()} pts</span>}
                      {row.winner_count > 1 && <span>· {row.winner_count} winners</span>}
                      {ends && <span>· ends {ends}</span>}
                      {row.channel_id && <span>· channel {row.channel_id}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveId(isOpen ? null : row.id)}
                      style={{ background: isOpen ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isOpen ? 'rgba(200,168,78,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', padding: '5px 12px', color: isOpen ? C.gold : '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      {isOpen ? '▲ Close' : '✏️ Edit'}
                    </button>
                    {row.status !== 'draft' && (
                      <button onClick={() => openEntrants(row.id)}
                        title="View entrants"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 10px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                        👥 {row.entry_count}
                      </button>
                    )}
                    {row.status === 'draft' && (
                      confirm?.id === row.id && confirm.action === 'delete' ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: C.red }}>Delete?</span>
                          <button onClick={() => handleDelete(row.id)} disabled={busy}
                            style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                          <button onClick={() => setConfirm(null)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirm({ id: row.id, action: 'delete' })}
                          title="Delete this draft"
                          style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* ── Editor ── */}
      {active && (
        <>
          <SettingsCard title="Giveaway">
            <EmbedPreview
              serverId={serverId}
              isPremium={isPremium}
              title={editor.title}
              description={editor.description}
              thumbnailUrl={editor.thumbnail_url}
              imageUrl={editor.image_url}
              color={editor.color || '#94730D'}
              footerText={''}
              onTitleChange={setEd('title')}
              onDescriptionChange={setEd('description')}
              onThumbnailChange={setEd('thumbnail_url')}
              onImageChange={setEd('image_url')}
              onColorChange={setEd('color')}
              onFooterTextChange={() => {}}
              showImage={true}
              bodySize="base"
            />
            <Field label="Prize" hint="Short summary shown prominently in the embed.">
              <Input value={editor.prize} onChange={setEd('prize')} placeholder="e.g. 100 USDC + 1 month Discord Nitro" />
            </Field>
          </SettingsCard>

          <SettingsCard title="Mechanics">
            <FieldRow>
              <Field label="Duration"
                hint={isActive ? 'Locked while active.' : 'Minimum 60 seconds, maximum 30 days.'}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input type="number"
                    value={String(editor.duration_value)}
                    onChange={v => setEd('duration_value')(Math.max(0, Number(v) || 0))}
                    placeholder="1"
                    style={{ maxWidth: '120px' }} />
                  <select value={editor.duration_unit} onChange={e => setEd('duration_unit')(e.target.value)}
                    disabled={isActive}
                    style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: isActive ? 'default' : 'pointer', opacity: isActive ? 0.55 : 1 }}>
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </Field>
              <Field label="Winner count"
                hint={isActive ? 'Locked while active.' : 'How many winners are drawn.'}>
                <Input type="number"
                  value={String(editor.winner_count)}
                  onChange={v => setEd('winner_count')(Math.max(1, Number(v) || 1))}
                  placeholder="1"
                  style={{ maxWidth: '120px' }} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Entry cost (community points)"
                hint={isActive ? 'Locked while active.' : 'Set 0 for free entry. Cancelling refunds everyone.'}>
                <Input type="number"
                  value={String(editor.entry_cost_points)}
                  onChange={v => setEd('entry_cost_points')(Math.max(0, Number(v) || 0))}
                  placeholder="0"
                  style={{ maxWidth: '160px' }} />
              </Field>
              <Field label="Target channel"
                hint={isActive ? 'Locked while active.' : 'Channel name or numeric ID.'}>
                <Input value={editor.channel_id} onChange={setEd('channel_id')}
                  placeholder="#giveaways or 1234567890" />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Mention roles on post"
                hint="Role IDs, comma separated (spaces OK). Each role gets pinged when the giveaway is posted.">
                <Input value={(editor.mention_role_ids || []).join(', ')}
                  onChange={v => setEd('mention_role_ids')(parseRoleIdInput(v))}
                  placeholder="1234567890, 9876543210" />
              </Field>
              <Field label="Allowed role IDs"
                hint={isActive
                  ? 'Locked while active.'
                  : 'Comma separated (spaces OK). Leave empty to allow anyone in the server.'}>
                <Input value={(editor.allowed_role_ids || []).join(', ')}
                  onChange={v => setEd('allowed_role_ids')(parseRoleIdInput(v))}
                  placeholder="1234567890, 9876543210" />
              </Field>
            </FieldRow>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {(isDraft || isActive) && (
                <button onClick={handleSave} disabled={busy}
                  style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 18px', color: '#0A0A0F', cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'Saving…' : (isActive ? 'Save (edits live message)' : 'Save Draft')}
                </button>
              )}
              {isDraft && (
                <button onClick={handleStart} disabled={busy}
                  style={{ background: 'rgba(59,165,92,0.12)', border: '1px solid rgba(59,165,92,0.4)', borderRadius: '8px', padding: '9px 18px', color: C.green, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                  ▶ Start
                </button>
              )}
              {isActive && (
                <button onClick={handleEndNow} disabled={busy}
                  style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.4)', borderRadius: '8px', padding: '9px 18px', color: C.blue, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                  ⏹ End Now
                </button>
              )}
              {isEnded && (
                <button onClick={handleReroll} disabled={busy}
                  style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.4)', borderRadius: '8px', padding: '9px 18px', color: C.gold, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                  🎲 Reroll
                </button>
              )}
              {(isActive || isDraft) && (
                confirm?.id === active.id && confirm.action === 'cancel' ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: C.red, maxWidth: '320px' }}>
                      {isActive && active.entry_cost_points > 0
                        ? 'Cancel and refund every entrant?'
                        : 'Cancel this giveaway?'}
                    </span>
                    <button onClick={() => handleCancel(active.id)} disabled={busy}
                      style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '6px 12px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>Yes</button>
                    <button onClick={() => setConfirm(null)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 12px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm({ id: active.id, action: 'cancel' })}
                    style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.35)', borderRadius: '8px', padding: '9px 14px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                    {isActive && active.entry_cost_points > 0 ? 'Cancel (refund all)' : 'Cancel'}
                  </button>
                )
              )}
            </div>

            {msg && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: msgKind === 'err' ? C.red : C.green }}>
                {msgKind === 'err' ? '✗ ' : '✓ '}{msg}
              </div>
            )}
            {active && active.message_id && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: C.muted }}>
                Posted as message {active.message_id} in channel {active.channel_id || '—'}.
                {active.status === 'active' && active.ends_at && (
                  <span> Ends {giveawayRelative(active.ends_at)} (server time).</span>
                )}
                {isEnded && active.winners?.length > 0 && (
                  <span> Winners: {active.winners.map(w => `<@${w}>`).join(', ')}</span>
                )}
                {isCancelled && <span> Cancelled.</span>}
              </div>
            )}
          </SettingsCard>
        </>
      )}

      {/* ── Entrants modal ── */}
      {entrantsFor != null && (
        <div onClick={() => setEntrantsFor(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#16161e', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', maxWidth: '480px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Entrants</div>
              <button onClick={() => setEntrantsFor(null)}
                style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            {entrantsLoading ? (
              <div style={{ color: C.muted, fontSize: '13px' }}>Loading…</div>
            ) : entrants.length === 0 ? (
              <div style={{ color: C.muted, fontSize: '13px' }}>No entries yet.</div>
            ) : (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                      <th style={{ textAlign: 'left',  padding: '6px 8px' }}>User</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>Cost</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px' }}>Entered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entrants.map(e => (
                      <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{e.user_id}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{(e.points_charged || 0).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: C.muted }}>
                          {e.entered_at ? new Date(e.entered_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ── Radar module ─────────────────────────────────────────────────────────────
// Phase 1: crypto only. Other topic sections render "coming soon" cards so
// admins can see what's planned without confusion. Watchlist editor uses
// search-as-you-type via /search-asset (CoinGecko search).

const RADAR_TIMEZONE_OPTIONS = (() => {
  const out = [];
  for (let m = -12 * 60; m <= 14 * 60; m += 60) {
    const sign = m >= 0 ? '+' : '-';
    const hh = String(Math.floor(Math.abs(m) / 60)).padStart(2, '0');
    const mm = String(Math.abs(m) % 60).padStart(2, '0');
    out.push({ value: m, label: `UTC${sign}${hh}:${mm}` });
  }
  return out;
})();

const RADAR_COMING_SOON = [
  { id: 'nft',    icon: '🖼️', name: 'NFT' },
  { id: 'meme',   icon: '🐸', name: 'Memecoin' },
  { id: 'forex',  icon: '💱', name: 'Forex' },
  { id: 'stocks', icon: '📈', name: 'Stocks' },
];

const RadarSettings = () => {
  const { server } = useContext(DashboardContext);
  const serverId = server?.id;

  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [msg,      setMsg]      = useState('');
  const [msgKind,  setMsgKind]  = useState('ok');
  const [saving,   setSaving]   = useState(false);

  const [watchlist, setWatchlist] = useState([]);

  // Search-as-you-type state for the add-crypto input
  const [searchQ,        setSearchQ]        = useState('');
  const [searchResults,  setSearchResults]  = useState([]);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchPending,  setSearchPending]  = useState(false);
  const searchTimerRef = useRef(null);

  // Recent alerts
  const [alerts, setAlerts] = useState([]);

  // Live preview state — polling grid over the entire crypto watchlist.
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewLastTs,   setPreviewLastTs]   = useState(null);
  const [previewRefreshing, setPreviewRefreshing] = useState(false);

  // Manual digest send state.
  const [digestSending, setDigestSending] = useState(false);

  const showMsg = (text, kind = 'ok') => {
    setMsg(text); setMsgKind(kind);
    setTimeout(() => setMsg(''), 4500);
  };

  // ── Initial load ───────────────────────────────────────────────────
  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchRadarSettings(serverId).catch(e => { setError(e.message); return null; }),
      fetchRadarWatchlist(serverId, 'crypto').catch(() => ({ watchlist: [] })),
      fetchRadarRecentAlerts(serverId, 50).catch(() => ({ alerts: [] })),
    ]).then(([s, wl, al]) => {
      setSettings(s);
      setWatchlist(wl?.watchlist || []);
      setAlerts(al?.alerts || []);
      setLoading(false);
    });
  }, [serverId]); // eslint-disable-line

  // ── Live preview polling (30s while tab is visible) ────────────────
  // Pulls /watchlist?asset_kind=crypto — already cache-hydrated — so this
  // is zero extra API cost. Polling pauses when the document is hidden.
  useEffect(() => {
    if (!serverId) return;
    let alive = true;
    let timer = null;

    const pull = () => {
      fetchRadarWatchlist(serverId, 'crypto')
        .then(r => {
          if (!alive) return;
          setWatchlist(r?.watchlist || []);
          setPreviewLastTs(Date.now());
        })
        .catch(() => {});
    };

    const tick = () => {
      if (document.visibilityState !== 'hidden') pull();
    };

    const onVis = () => {
      // Snap a refresh as soon as the tab becomes visible again so the
      // user doesn't stare at a 5-minute-old card.
      if (document.visibilityState === 'visible') pull();
    };

    timer = setInterval(tick, 30000);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [serverId]); // eslint-disable-line

  const handlePreviewRefresh = async () => {
    if (!serverId || previewRefreshing) return;
    setPreviewRefreshing(true);
    try {
      await refreshRadarPreview(serverId);
      // The fetcher updated the cache; pull the hydrated watchlist now.
      const r = await fetchRadarWatchlist(serverId, 'crypto');
      setWatchlist(r?.watchlist || []);
      setPreviewLastTs(Date.now());
      showMsg('Refreshed.');
    } catch (e) {
      showMsg(e.message, 'err');
    } finally {
      setPreviewRefreshing(false);
    }
  };

  const handleDigestSendNow = async () => {
    if (!serverId || digestSending) return;
    setDigestSending(true);
    try {
      const r = await sendRadarDigestNow(serverId);
      // Refresh masked settings so remaining-today counter updates.
      try {
        const fresh = await fetchRadarSettings(serverId);
        setSettings(fresh);
      } catch {}
      const remaining = r?.remaining_today;
      showMsg(
        `Digest sent.${remaining != null ? ` ${remaining} of ${r.daily_cap} remaining today.` : ''}`
      );
    } catch (e) {
      showMsg(e.message, 'err');
    } finally {
      setDigestSending(false);
    }
  };

  // ── Search debounce ────────────────────────────────────────────────
  useEffect(() => {
    if (!serverId) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchQ || searchQ.trim().length < 2) {
      setSearchResults([]); setSearchPending(false);
      return;
    }
    setSearchPending(true);
    searchTimerRef.current = setTimeout(() => {
      searchRadarAsset(serverId, 'crypto', searchQ.trim())
        .then(r => { setSearchResults(r?.suggestions || []); })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchPending(false));
    }, 350);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQ, serverId]);

  // ── Settings field updater ─────────────────────────────────────────
  const setField = (k) => (v) => {
    setSettings(s => ({ ...(s || {}), [k]: v }));
  };

  const handleSave = async () => {
    if (!serverId || saving) return;
    setSaving(true);
    try {
      const payload = {
        timezone_offset:             Number(settings.timezone_offset || 0),
        daily_time:                  settings.daily_time || '08:00',
        daily_enabled:               settings.daily_enabled ? 1 : 0,
        daily_channel_crypto:        (settings.daily_channel_crypto || '') + '',
        alerts_channel:              (settings.alerts_channel || '') + '',
        alerts_enabled:              settings.alerts_enabled ? 1 : 0,
        movement_threshold_pct:      Number(settings.movement_threshold_pct || 5),
        volume_multiplier_threshold: Number(settings.volume_multiplier_threshold || 3),
        digest_mention_role_ids:     Array.isArray(settings.digest_mention_role_ids)
                                       ? settings.digest_mention_role_ids
                                       : parseRoleIdInput(settings.digest_mention_role_ids || ''),
        alerts_mention_role_ids:     Array.isArray(settings.alerts_mention_role_ids)
                                       ? settings.alerts_mention_role_ids
                                       : parseRoleIdInput(settings.alerts_mention_role_ids || ''),
      };
      const updated = await saveRadarSettings(serverId, payload);
      setSettings(updated);
      showMsg('Saved.');
    } catch (e) {
      showMsg(e.message, 'err');
    } finally {
      setSaving(false);
    }
  };

  // ── Watchlist add / remove ─────────────────────────────────────────
  const handleAddSuggestion = async (sug) => {
    if (!serverId) return;
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind:       'crypto',
        asset_identifier: sug.identifier,
        display_name:     sug.name || sug.symbol || sug.identifier,
      });
      const wl = await fetchRadarWatchlist(serverId, 'crypto');
      setWatchlist(wl?.watchlist || []);
      setSearchQ(''); setSearchResults([]); setSearchOpen(false);
      showMsg(`Added ${sug.name || sug.identifier}.`);
    } catch (e) { showMsg(e.message, 'err'); }
  };

  const handleAddRaw = async () => {
    const q = (searchQ || '').trim();
    if (!q || !serverId) return;
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind:       'crypto',
        asset_identifier: q,
      });
      const wl = await fetchRadarWatchlist(serverId, 'crypto');
      setWatchlist(wl?.watchlist || []);
      setSearchQ(''); setSearchResults([]); setSearchOpen(false);
      showMsg('Added.');
    } catch (e) { showMsg(e.message, 'err'); }
  };

  const handleRemove = async (entryId) => {
    if (!serverId) return;
    try {
      await deleteRadarWatchlistEntry(serverId, entryId);
      setWatchlist(wl => wl.filter(w => w.id !== entryId));
      showMsg('Removed.');
    } catch (e) { showMsg(e.message, 'err'); }
  };

  // ── Render ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <PageHeader icon="📡" title="Radar" badge="MODULE"
          desc="Market intelligence with watchlists, daily digests, and price movement alerts." />
        <div style={{ color: C.muted, fontSize: '13px', padding: '24px 0' }}>Loading…</div>
      </div>
    );
  }

  const s = settings || {};

  return (
    <div>
      <PageHeader icon="📡" title="Radar" badge="MODULE"
        desc="Market intelligence with watchlists, daily digests, and price movement alerts." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── Section 1: Topics ── */}
      <SettingsCard>
        <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Topics</div>
        <div style={{ fontSize: '12px', color: C.muted, marginBottom: '16px' }}>
          Crypto is live now via CoinGecko. NFT, Memecoin, Forex, Stocks, and Liquidations ship in later phases.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(59,165,92,0.08)', border: `1px solid rgba(59,165,92,0.35)`, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '20px' }}>🪙</div>
            <div style={{ fontWeight: 700, marginTop: '4px' }}>Crypto</div>
            <div style={{ fontSize: '11px', color: C.green, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Live</div>
          </div>
          {RADAR_COMING_SOON.map(t => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px', opacity: 0.6 }}>
              <div style={{ fontSize: '20px' }}>{t.icon}</div>
              <div style={{ fontWeight: 700, marginTop: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Coming soon</div>
            </div>
          ))}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px', opacity: 0.6 }}>
            <div style={{ fontSize: '20px' }}>💥</div>
            <div style={{ fontWeight: 700, marginTop: '4px' }}>Liquidations</div>
            <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Coming soon</div>
          </div>
        </div>
      </SettingsCard>

      {/* ── Section 2: Crypto watchlist ── */}
      <SettingsCard title="Crypto watchlist">
        <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>
          Add tokens by name (search powered by CoinGecko). Each entry appears in your daily digest and is evaluated for movement and volume alerts.
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Input
            value={searchQ}
            onChange={(v) => { setSearchQ(v); setSearchOpen(true); }}
            placeholder="Search a token (e.g. bitcoin, ethereum, solana)…"
          />
          {searchOpen && (searchPending || searchResults.length > 0 || (searchQ || '').trim()) && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#16161e', border: `1px solid ${C.border}`, borderRadius: '10px', maxHeight: '280px', overflowY: 'auto', zIndex: 30, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              {searchPending && (
                <div style={{ padding: '10px 14px', color: C.muted, fontSize: '12px' }}>Searching…</div>
              )}
              {!searchPending && searchResults.length === 0 && (
                <button onClick={handleAddRaw}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 14px', color: C.muted, fontSize: '12px', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                  No suggestions. Add `{searchQ.trim()}` anyway →
                </button>
              )}
              {searchResults.map((sug, i) => (
                <button key={sug.identifier + i}
                  onClick={() => handleAddSuggestion(sug)}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', padding: '10px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {sug.thumb && <img src={sug.thumb} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />}
                  <span style={{ flex: 1 }}>
                    <strong>{sug.symbol || sug.identifier?.toUpperCase()}</strong>
                    <span style={{ color: C.muted, marginLeft: '8px' }}>{sug.name}</span>
                  </span>
                  {sug.market_cap_rank && (
                    <span style={{ color: C.muted, fontSize: '11px' }}>#{sug.market_cap_rank}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            No tokens on the crypto watchlist yet. Use the search above to add some.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {watchlist.map(w => {
              const snap = w.snapshot;
              const price = snap?.price_usd;
              const ch24  = snap?.change_24h_pct;
              return (
                <div key={w.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {snap?.image_url && <img src={snap.image_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{w.display_name}</div>
                    <div style={{ fontSize: '11px', color: C.muted }}>{w.asset_identifier}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' }}>
                    <div>{price != null ? fmtRadarPrice(price) : '—'}</div>
                    <div style={{ color: ch24 == null ? C.muted : (ch24 >= 0 ? C.green : C.red), fontSize: '11px' }}>
                      {ch24 == null ? '—' : `${ch24 >= 0 ? '+' : ''}${ch24.toFixed(2)}%`}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(w.id)}
                    style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.35)', borderRadius: '6px', padding: '6px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      {/* ── Section 3: Daily digest ── */}
      <SettingsCard title="Daily digest">
        <FieldRow>
          <Field label="Enable daily digest">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: C.muted }}>
              <input type="checkbox" checked={!!s.daily_enabled}
                onChange={e => setField('daily_enabled')(e.target.checked ? 1 : 0)}
                style={{ accentColor: C.gold }} />
              Post a daily snapshot in your configured crypto channel.
            </label>
          </Field>
          <Field label="Channel" hint="Where the digest is posted.">
            <Input value={(s.daily_channel_crypto || '') + ''}
              onChange={setField('daily_channel_crypto')}
              placeholder="numeric channel id" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Time of day" hint="Local time using your selected timezone offset.">
            <Input value={s.daily_time || '08:00'} onChange={setField('daily_time')}
              placeholder="08:00" style={{ maxWidth: '120px' }} />
          </Field>
          <Field label="Timezone offset">
            <select value={Number(s.timezone_offset || 0)}
              onChange={e => setField('timezone_offset')(Number(e.target.value))}
              style={{ width: '100%', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer' }}>
              {RADAR_TIMEZONE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </FieldRow>
        <Field label="Mention roles"
          hint="Role IDs, comma separated (spaces OK). Each role gets pinged with each digest. Leave empty for no ping.">
          <Input
            value={Array.isArray(s.digest_mention_role_ids)
              ? s.digest_mention_role_ids.join(', ')
              : (s.digest_mention_role_ids || '')}
            onChange={v => setField('digest_mention_role_ids')(parseRoleIdInput(v))}
            placeholder="1234567890, 9876543210" />
        </Field>

        {/* Manual send-now row */}
        <div style={{
          marginTop: '14px', padding: '12px 14px',
          background: 'rgba(200,168,78,0.06)',
          border: '1px solid rgba(200,168,78,0.18)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>Send digest now</div>
            <div style={{ fontSize: '11px', color: C.muted }}>
              Posts the current digest immediately to your crypto channel. Limited to {s.manual_digests_daily_cap ?? 5} per UTC day with a 5 minute cooldown.{' '}
              <strong style={{ color: '#fff' }}>
                {(s.manual_digests_used_today ?? 0)} of {(s.manual_digests_daily_cap ?? 5)} used today
              </strong>
              {' · '}{(s.manual_digests_remaining_today ?? 5)} remaining
            </div>
          </div>
          {(s.manual_digests_remaining_today ?? 5) <= 0 ? (
            <button disabled title="Daily cap reached. Resets at UTC midnight."
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'not-allowed', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
              Daily cap reached
            </button>
          ) : (
            <button onClick={handleDigestSendNow} disabled={digestSending}
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '8px 18px', color: '#0A0A0F', cursor: digestSending ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 700, opacity: digestSending ? 0.6 : 1 }}>
              {digestSending ? 'Sending…' : 'Send digest now'}
            </button>
          )}
        </div>
      </SettingsCard>

      {/* ── Section 4: Alerts ── */}
      <SettingsCard title="Movement alerts">
        <FieldRow>
          <Field label="Enable alerts">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: C.muted }}>
              <input type="checkbox" checked={!!s.alerts_enabled}
                onChange={e => setField('alerts_enabled')(e.target.checked ? 1 : 0)}
                style={{ accentColor: C.gold }} />
              Post alerts when a watchlist token moves sharply or sees a volume spike.
            </label>
          </Field>
          <Field label="Channel">
            <Input value={(s.alerts_channel || '') + ''}
              onChange={setField('alerts_channel')}
              placeholder="numeric channel id" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Movement threshold (%)" hint="Alert when 1h change crosses this value, up or down. Per-asset cooldown is 1 hour per direction.">
            <Input type="number" value={(s.movement_threshold_pct ?? 5) + ''}
              onChange={v => setField('movement_threshold_pct')(Number(v))}
              placeholder="5" style={{ maxWidth: '120px' }} />
          </Field>
          <Field label="Volume multiplier" hint="Alert when 24h volume crosses this multiple of the median recent baseline. Cooldown is 1 hour per asset.">
            <Input type="number" value={(s.volume_multiplier_threshold ?? 3) + ''}
              onChange={v => setField('volume_multiplier_threshold')(Number(v))}
              placeholder="3" style={{ maxWidth: '120px' }} />
          </Field>
        </FieldRow>
        <Field label="Mention roles"
          hint="Role IDs, comma separated (spaces OK). Each role gets pinged on every movement or volume alert. Leave empty for no ping.">
          <Input
            value={Array.isArray(s.alerts_mention_role_ids)
              ? s.alerts_mention_role_ids.join(', ')
              : (s.alerts_mention_role_ids || '')}
            onChange={v => setField('alerts_mention_role_ids')(parseRoleIdInput(v))}
            placeholder="1234567890, 9876543210" />
        </Field>
      </SettingsCard>

      {/* ── Section 5: Live preview (polling grid over the whole watchlist) ── */}
      <SettingsCard title="Live preview">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: C.muted }}>
            Live snapshots over your crypto watchlist. Auto refresh every 30 seconds while this tab is visible.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: C.muted }}>
              {previewLastTs ? `Updated ${secondsAgo(previewLastTs)} ago` : 'Not loaded yet'}
            </span>
            <button onClick={handlePreviewRefresh} disabled={previewRefreshing}
              style={{ background: 'rgba(200,168,78,0.10)', border: '1px solid rgba(200,168,78,0.25)', borderRadius: '8px', padding: '6px 12px', color: C.gold, cursor: previewRefreshing ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, opacity: previewRefreshing ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {previewRefreshing && <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'avspin 0.8s linear infinite' }} />}
              {previewRefreshing ? 'Refreshing…' : 'Refresh now'}
            </button>
            <style>{`@keyframes avspin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>

        {(() => {
          const cryptoWatchlist = watchlist.filter(w => w.asset_kind === 'crypto');
          if (cryptoWatchlist.length === 0) {
            return (
              <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                Add tokens above to see live prices here.
              </div>
            );
          }
          const visible = previewExpanded ? cryptoWatchlist : cryptoWatchlist.slice(0, 12);
          const hidden  = cryptoWatchlist.length - visible.length;
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {visible.map(w => <RadarLiveCard key={w.id} entry={w} />)}
              </div>
              {hidden > 0 && (
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button onClick={() => setPreviewExpanded(true)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                    Show all ({cryptoWatchlist.length})
                  </button>
                </div>
              )}
              {previewExpanded && cryptoWatchlist.length > 12 && (
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <button onClick={() => setPreviewExpanded(false)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                    Show fewer
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </SettingsCard>

      {/* ── Section 6: Recent alerts log ── */}
      <SettingsCard title="Recent alerts">
        {alerts.length === 0 ? (
          <div style={{ color: C.muted, fontSize: '13px' }}>
            No alerts sent yet. As tokens move past your thresholds they'll appear here for audit.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
            {alerts.map(a => (
              <div key={a.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span style={{
                  background: a.alert_type === 'movement_up'   ? 'rgba(59,165,92,0.12)'
                            : a.alert_type === 'movement_down' ? 'rgba(237,66,69,0.10)'
                            : 'rgba(200,168,78,0.12)',
                  border: `1px solid ${
                    a.alert_type === 'movement_up'   ? 'rgba(59,165,92,0.35)'
                  : a.alert_type === 'movement_down' ? 'rgba(237,66,69,0.35)'
                  : 'rgba(200,168,78,0.35)'}`,
                  color: a.alert_type === 'movement_up'   ? C.green
                       : a.alert_type === 'movement_down' ? C.red
                       : C.gold,
                  padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                  {a.alert_type.replace('_', ' ')}
                </span>
                <span style={{ fontWeight: 600, minWidth: '80px' }}>{a.asset_identifier}</span>
                <span style={{ color: C.muted, flex: 1 }}>
                  {a.payload?.change_1h_pct != null && `1h: ${a.payload.change_1h_pct >= 0 ? '+' : ''}${a.payload.change_1h_pct.toFixed(2)}%`}
                  {a.payload?.price_usd != null && ` · ${fmtRadarPrice(a.payload.price_usd)}`}
                </span>
                <span style={{ color: C.muted, fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {a.sent_at ? new Date(a.sent_at).toLocaleString() : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* ── Save bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#0A0A0F', cursor: saving ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {msg && (
          <span style={{ fontSize: '12px', color: msgKind === 'err' ? C.red : C.green }}>
            {msgKind === 'err' ? '✗ ' : '✓ '}{msg}
          </span>
        )}
      </div>
    </div>
  );
};

function fmtRadarPrice(v) {
  if (v == null) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
  return `$${n.toFixed(6)}`;
}

function secondsAgo(ts) {
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

// Tiny inline sparkline. Renders a polyline through the supplied series.
// Returns null silently when fewer than 6 samples are available (matches
// the task spec — no spinner, no placeholder).
function RadarSparkline({ points, width = 80, height = 24, stroke = '#C8A84E' }) {
  if (!Array.isArray(points) || points.length < 6) return null;
  const vals = points.filter(v => v != null && Number.isFinite(v));
  if (vals.length < 6) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const dx = width / (vals.length - 1);
  const path = vals.map((v, i) => {
    const x = i * dx;
    const y = height - ((v - min) / span) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One card in the live preview grid. snapshot is hydrated by the backend's
// /watchlist endpoint when a cache entry exists. raw.price_history (when
// present in future iterations) drives the sparkline; for now we render
// only when the backend supplies enough points.
const RadarLiveCard = ({ entry }) => {
  const snap  = entry.snapshot || {};
  const price = snap.price_usd;
  const ch1   = snap.change_1h_pct;
  const ch24  = snap.change_24h_pct;
  const name  = entry.display_name || snap.symbol_display || entry.asset_identifier;
  const sparkSeries = Array.isArray(snap?.raw?.price_series)
    ? snap.raw.price_series
    : Array.isArray(snap?.price_history)
      ? snap.price_history
      : null;
  const stale = !entry.snapshot;
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px',
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      opacity: stale ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {snap.image_url
          ? <img src={snap.image_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          : <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(snap.symbol_display || entry.asset_identifier || '').toUpperCase()}
          </div>
          <div style={{ fontSize: '10px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
        </div>
        {snap.rank && <span style={{ fontSize: '10px', color: C.muted }}>#{snap.rank}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700 }}>
            {fmtRadarPrice(price)}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '2px' }}>
            <span style={{ color: ch1  == null ? C.muted : (ch1  >= 0 ? C.green : C.red) }}>
              1h&nbsp;{ch1  == null ? '—' : `${ch1  >= 0 ? '+' : ''}${ch1.toFixed(2)}%`}
            </span>
            <span style={{ color: ch24 == null ? C.muted : (ch24 >= 0 ? C.green : C.red) }}>
              24h&nbsp;{ch24 == null ? '—' : `${ch24 >= 0 ? '+' : ''}${ch24.toFixed(2)}%`}
            </span>
          </div>
        </div>
        <RadarSparkline points={sparkSeries}
          stroke={(ch24 ?? 0) >= 0 ? C.green : C.red} />
      </div>
      {stale && (
        <div style={{ fontSize: '10px', color: C.muted, fontStyle: 'italic' }}>
          Waiting for first fetch
        </div>
      )}
    </div>
  );
};


// ── Nav config ────────────────────────────────────────────────────────────────

// Inline SVG icon for the Radar nav entry. The 📡 emoji didn't render on
// some production browsers (no satellite-antenna glyph in the user's font
// stack), so Radar specifically uses an SVG node. NavBtn detects React
// nodes vs string emojis and renders both correctly.
const RadarNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 12 L20 6" />
    <path d="M19.07 4.93a10 10 0 1 1-14.14 0" />
    <path d="M16.24 7.76a6 6 0 1 1-8.48 0" />
  </svg>
);

const NAV = [
  { id: 'overview',      icon: '📊', label: 'Overview',      group: null },
  { id: 'analytics',    icon: '📈', label: 'Analytics',     group: null },
  { id: 'verification', icon: '🔐', label: 'Verification',   group: 'Settings' },
  { id: 'roles',        icon: '🎭', label: 'Role Selection', group: 'Settings' },
  { id: 'forms',        icon: '📋', label: 'Forms',          group: 'Settings' },
  { id: 'tickets',      icon: '🎫', label: 'Tickets',        group: 'Settings' },
  { id: 'embeds',       icon: '💬', label: 'Embed Messages', group: 'Settings' },
  { id: 'giveaway',     icon: '🎉', label: 'Giveaway',       group: 'Settings' },
  { id: 'radar',        icon: <RadarNavIcon />, label: 'Radar', group: 'Settings' },
  { id: 'raid',         icon: '⚔️', label: 'Raid',           group: 'Settings' },
  { id: 'engage',       icon: '🔄', label: 'Engage',         group: 'Settings' },
  { id: 'protection',   icon: '🛡️', label: 'Protection',     group: 'Settings' },
  { id: 'settings',    icon: '⚙️', label: 'Server Settings', group: 'Settings' },
  { id: 'logs',         icon: '📋', label: 'Logs',           group: 'Admin Panel' },
  { id: 'owner',        icon: '🌐', label: 'Global',          group: 'Owner' },
];

// ── NavBtn ────────────────────────────────────────────────────────────────────

const NavBtn = ({ item, active, setActive }) => (
  <button onClick={() => setActive(item.id)}
    style={{ width: '100%', background: active === item.id ? 'rgba(200,168,78,0.1)' : 'transparent', border: `1px solid ${active === item.id ? 'rgba(200,168,78,0.2)' : 'transparent'}`, borderRadius: '8px', color: active === item.id ? C.gold : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: active === item.id ? 600 : 400, marginBottom: '2px', fontFamily: 'Sora, sans-serif', transition: 'all 0.15s', textAlign: 'left' }}
    onMouseOver={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseOut={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ fontSize: '15px', width: '16px', height: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{item.icon}</span>
    {item.label}
  </button>
);

// ── Owner-only DB backup controls ─────────────────────────────────────────────
// Visible ONLY to the bot owner (Discord id 461460143343927306). The endpoints
// themselves enforce owner-only server-side; this is just the UI gate.
const OWNER_DISCORD_ID = '461460143343927306';

// Discord ids exceed JS Number.MAX_SAFE_INTEGER, so a numeric `user_id` from
// JSON is silently corrupted (and still truthy) — `user_id || id` would never
// fall through to the safe string `id`. Coerce every plausible id field to a
// string and match against any of them. /auth/me exposes `id` as a string.
// This is a cosmetic visibility gate only; the real protection is the
// server-side require_global_admin check on every owner endpoint.
function isOwnerUser(user) {
  const ids = [user?.id, user?.user_id, user?.sub, user?.discord_id]
    .map(v => (v != null ? String(v) : null));
  return ids.includes(OWNER_DISCORD_ID);
}

function OwnerBackupPanel({ user }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy]     = useState(false);

  if (!isOwnerUser(user)) return null;

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    try {
      setStatus('Preparing backup…');
      const filename = await downloadBackup();
      setStatus(`Downloaded ${filename}`);
      setTimeout(() => setStatus(''), 4000);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function handleRunNow() {
    if (busy) return;
    setBusy(true);
    try {
      setStatus('Uploading backup to R2…');
      const res = await runBackupNow();
      setStatus(`Backed up to ${res.key}`);
      setTimeout(() => setStatus(''), 6000);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  const btn = {
    width: '100%', textAlign: 'left', cursor: busy ? 'default' : 'pointer',
    background: 'rgba(200,168,78,0.08)', border: '1px solid rgba(200,168,78,0.2)',
    color: C.gold, fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600,
    padding: '7px 10px', borderRadius: '7px', opacity: busy ? 0.6 : 1,
  };

  return (
    <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: '2px' }}>Owner</div>
      <button onClick={handleDownload} disabled={busy} style={btn}>⬇ Download Database Backup</button>
      <button onClick={handleRunNow} disabled={busy} style={btn}>☁ Run R2 Backup Now</button>
      {status && (
        <div style={{ fontSize: '11px', color: C.muted, lineHeight: 1.4, wordBreak: 'break-all' }}>{status}</div>
      )}
    </div>
  );
}

// ── Owner-only global tenant overview (dashboard tab, owner only) ─────────────
function OwnerOverview({ user }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [sortKey, setSortKey] = useState('members');
  const [sortDir, setSortDir] = useState('desc');

  // Second layer of defence behind the server gate: never even call the
  // endpoint if the viewer is not the owner.
  const owner = isOwnerUser(user);

  useEffect(() => {
    if (!owner) return;
    let alive = true;
    setLoading(true);
    fetchGlobalOverview()
      .then(d => { if (alive) { setData(d); setError(''); } })
      .catch(e => { if (alive) setError(String(e.message || e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [owner]);

  if (!owner) return null;

  const fmt = n => (n == null ? '0' : Number(n).toLocaleString());
  const fmtDate = s => {
    if (!s) return '—';
    const d = new Date(s);
    return isNaN(d) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const setSort = key => {
    if (key === sortKey) { setSortDir(d => (d === 'desc' ? 'asc' : 'desc')); }
    else { setSortKey(key); setSortDir('desc'); }
  };

  const guilds = (data?.guilds || []).slice().sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === 'name') { av = (av || '').toLowerCase(); bv = (bv || '').toLowerCase(); }
    if (sortKey === 'last_active' || sortKey === 'added_at') {
      av = av ? new Date(av).getTime() : 0; bv = bv ? new Date(bv).getTime() : 0;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totals = data?.totals || {};
  const cards = [
    { label: 'Guilds',            value: fmt(totals.guilds) },
    { label: 'Members',           value: fmt(totals.members) },
    { label: 'Raids',             value: fmt(totals.raids) },
    { label: 'Points awarded',    value: fmt(totals.points) },
    { label: 'Engage submissions',value: fmt(totals.engage_subs) },
  ];

  const th = (key, label, align = 'left') => (
    <th
      onClick={() => setSort(key)}
      style={{ textAlign: align, padding: '10px 12px', cursor: 'pointer', color: C.muted,
               fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
               whiteSpace: 'nowrap', userSelect: 'none' }}
    >
      {label}{sortKey === key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
    </th>
  );

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Global Overview</h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: '13px' }}>
          Private owner view of every server using AVbot and how much they use it.
        </p>
      </div>

      {loading && <div style={{ color: C.muted, fontSize: '14px', padding: '24px 0' }}>Loading…</div>}
      {error && !loading && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)',
                      borderRadius: '8px', padding: '16px', color: '#ed4245', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Top-line totals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px', margin: '20px 0 28px' }}>
            {cards.map(c => (
              <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`,
                        borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', color: C.muted, textTransform: 'uppercase',
                              letterSpacing: '0.05em', fontWeight: 700 }}>{c.label}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.gold, marginTop: '6px' }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* Tenants table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px',
                        overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '720px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {th('name', 'Server')}
                  {th('members', 'Members', 'right')}
                  {th('modules', 'Modules')}
                  {th('raids', 'Raids', 'right')}
                  {th('points', 'Points', 'right')}
                  {th('engage_subs', 'Engage', 'right')}
                  {th('added_at', 'Added')}
                  {th('last_active', 'Last active')}
                </tr>
              </thead>
              <tbody>
                {guilds.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {g.icon
                        ? <img src={g.icon} alt="" referrerPolicy="no-referrer" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(200,168,78,0.18)', color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{(g.name?.[0] || '?').toUpperCase()}</div>}
                      <span style={{ fontWeight: 600 }}>{g.name}</span>
                      {g.is_premium && <span style={{ fontSize: '10px', color: C.gold }}>★</span>}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(g.members)}</td>
                    <td style={{ padding: '10px 12px', color: C.muted }}>{(g.modules || []).join(', ') || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(g.raids)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(g.points)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(g.engage_subs)}</td>
                    <td style={{ padding: '10px 12px', color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(g.added_at)}</td>
                    <td style={{ padding: '10px 12px', color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(g.last_active)}</td>
                  </tr>
                ))}
                {guilds.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: C.muted }}>No guilds found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Dashboard shell ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [servers, setServers] = useState([]);
  const [server, setServer]   = useState(null);
  const [active, setActive]   = useState('overview');
  const [authLoading, setAuthLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  // Clear access error whenever the selected server changes
  useEffect(() => {
    setAccessError(null);
  }, [server?.id]);

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
        <img src="https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png" alt="AVbot" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
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

  // The Owner group (Global tab) is only ever rendered for the owner. This is a
  // cosmetic gate; the /api/admin/overview endpoint independently enforces
  // require_global_admin server-side, so a non-owner who forced the tab open
  // would still get a 403 and no data.
  const owner = isOwnerUser(user);
  const groups = owner ? ['Settings', 'Admin Panel', 'Owner'] : ['Settings', 'Admin Panel'];
  const groupedNav = {
    top:           NAV.filter(n => !n.group),
    Settings:      NAV.filter(n => n.group === 'Settings'),
    'Admin Panel': NAV.filter(n => n.group === 'Admin Panel'),
    Owner:         owner ? NAV.filter(n => n.group === 'Owner') : [],
  };
  const avatarUrl = userAvatarUrl(user);

  const noServerAccess = servers.length === 0;

  // Pages defined inside render so they access context naturally via useContext
  const PAGES = {
    overview:     <Overview />,
    analytics:    noServerAccess ? <ModuleLock name="Analytics" /> : <Analytics />,
    verification: noServerAccess ? <ModuleLock name="Verification" /> : <VerificationSettings />,
    roles:        noServerAccess ? <ModuleLock name="Role Select" /> : <RoleSelectSettings />,
    forms:        noServerAccess ? <ModuleLock name="Forms" /> : <FormsSettings />,
    tickets:      noServerAccess ? <ModuleLock name="Tickets" /> : <TicketsSettings />,
    embeds:       noServerAccess ? <ModuleLock name="Embed Messages" /> : <EmbedMessagesSettings />,
    giveaway:     noServerAccess ? <ModuleLock name="Giveaway" /> : <GiveawaySettings />,
    radar:        noServerAccess ? <ModuleLock name="Radar" /> : <RadarSettings />,
    raid:         noServerAccess ? <ModuleLock name="Raid" /> : <RaidSettings />,
    engage:       noServerAccess ? <ModuleLock name="Engage" /> : <EngageSettings />,
    protection:   noServerAccess ? <ModuleLock name="Protection" /> : <ProtectionSettings />,
    settings:     noServerAccess ? <ModuleLock name="Server Settings" /> : <SettingsModule />,
    logs:         noServerAccess ? <ModuleLock name="Logs" /> : <LogsModule />,
    owner:        owner ? <OwnerOverview user={user} /> : <Overview />,
  };

  return (
    <DashboardContext.Provider value={{ server, user, servers, setServer, isPremium: server?.is_premium === true, accessError, setAccessError }}>
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: 'Sora, sans-serif', color: '#fff' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: '224px', flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '20px 18px', borderBottom: `1px solid ${C.border}` }}>
            <img src="https://cdn.avbot.app/1199707792706117642/2e6734d8c9fc47fab6b8525a57374de3.png" alt="AVbot" style={{ height: '34px', width: 'auto', objectFit: 'contain', display: 'block' }} />
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
            <OwnerBackupPanel user={user} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', position: 'relative' }}>
              <img
                src={avatarUrl}
                alt={user?.username || 'User'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Swap the broken <img> for the initials placeholder right beside it.
                  e.target.style.display = 'none';
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.1)' }}
              />
              <div
                aria-hidden="true"
                style={{
                  display: 'none',
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(200,168,78,0.18)', color: C.gold,
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  fontFamily: 'Sora, sans-serif',
                }}
              >
                {(user?.username?.[0] || '?').toUpperCase()}
              </div>
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
            {accessError && (
              <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '8px', padding: '20px', margin: '0 0 20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#ed4245', marginBottom: '8px' }}>🔒 Access Denied</div>
                <p style={{ fontSize: '14px', color: '#c9cdd0', margin: '0 0 8px' }}>{accessError}</p>
                <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>Switch to a server where you have Administrator permission.</p>
              </div>
            )}
            {PAGES[active]}
          </div>
        </main>

        <AIHelpButton />
      </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
