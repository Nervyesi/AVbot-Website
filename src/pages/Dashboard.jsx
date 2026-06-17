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
  searchRadarAsset,
  sendRadarDigestNow, refreshRadarPreview,
  resolveRadarMeme,
  fetchRaidSettings, saveRaidSettings, fetchRaidList, createRaid, endRaid,
  fetchRaidLeaderboard, fetchRaidVerificationLog, runRaidManualCheck, sendRaidGuide,
  fetchRaidGuideDefaults, fetchRaidScrapingHealth,
  fetchEngagePools, updateEngagePool,
  listWalletCollections, createWalletCollection, updateWalletCollection,
  deleteWalletCollection, fetchWalletSubmissions, postWalletCollection,
  closeWalletCollection,
  resolveDiscordServer, fetchDiscordRoles,
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

const Input = ({ value, onChange, placeholder, type = 'text', style, disabled = false }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    disabled={disabled}
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

// ── Wallet Collections (inside the Engage module) ───────────────────────────────

const WALLET_CHAINS = [
  { value: 'evm',     label: 'EVM' },
  { value: 'solana',  label: 'Solana' },
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'cardano', label: 'Cardano' },
  { value: 'cosmos',  label: 'Cosmos' },
  { value: 'tron',    label: 'Tron' },
  { value: 'aptos',   label: 'Aptos' },
  { value: 'sui',     label: 'Sui' },
  { value: 'other',   label: 'Other' },
];
const WALLET_CHAIN_LABEL = Object.fromEntries(WALLET_CHAINS.map(c => [c.value, c.label]));

const WALLET_STATUS_BADGE = {
  draft:  { label: 'Draft',  bg: 'rgba(255,255,255,0.06)', bd: 'rgba(255,255,255,0.15)', fg: 'rgba(255,255,255,0.6)' },
  posted: { label: 'Posted', bg: 'rgba(59,165,92,0.12)',   bd: 'rgba(59,165,92,0.4)',    fg: '#3ba55c' },
  closed: { label: 'Closed', bg: 'rgba(237,66,69,0.12)',   bd: 'rgba(237,66,69,0.4)',    fg: '#ed4245' },
};

const WALLET_EDITOR_DEFAULTS = {
  name: '', blockchain: 'evm', channel_id: '', required_role_id: '',
  ping_role_ids: [], embed_title: '', embed_description: '', embed_color: '',
  embed_thumbnail_url: '', embed_image_url: '',
  button_label: '', modal_title: '', modal_field_label: '', modal_placeholder: '',
};

const WalletCollectionsSection = ({ sid }) => {
  // isPremium gates the visual customization (color picker + image uploads),
  // exactly like every other module. Non-premium guilds see the controls but
  // get the standard "coming soon" modal on change.
  const { isPremium } = useContext(DashboardContext);
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [activeId, setActiveId] = useState(null);

  const [editor, setEditor] = useState({ ...WALLET_EDITOR_DEFAULTS });
  const setEd = k => v => setEditor(p => ({ ...p, [k]: v }));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg]   = useState('');
  const [msgKind, setMsgKind] = useState('ok');
  const [confirmDel, setConfirmDel] = useState(null);
  const [baseline, setBaseline] = useState('');

  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subFilter, setSubFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const showMsg = (text, kind = 'ok') => {
    setMsg(text); setMsgKind(kind);
    setTimeout(() => setMsg(''), 4500);
  };

  const doFetch = async () => {
    if (!sid) return;
    const { collections } = await listWalletCollections(sid);
    setList(collections || []);
  };

  useEffect(() => {
    if (!sid) { setLoading(false); return; }
    setLoading(true); setActiveId(null); setList([]);
    listWalletCollections(sid)
      .then(({ collections }) => { setList(collections || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [sid]); // eslint-disable-line

  const active = list.find(c => c.id === activeId) || null;

  // Hydrate the editor + load submissions when a collection opens.
  useEffect(() => {
    const row = list.find(x => x.id === activeId);
    if (!row) return;
    const hydrated = {
      name:              row.name || '',
      blockchain:        row.blockchain || 'evm',
      channel_id:        row.channel_id || '',
      required_role_id:  row.required_role_id || '',
      ping_role_ids:     Array.isArray(row.ping_role_ids) ? row.ping_role_ids : [],
      embed_title:       row.embed_title || '',
      embed_description: row.embed_description || '',
      embed_color:       row.embed_color || '',
      embed_thumbnail_url: row.embed_thumbnail_url || '',
      embed_image_url:     row.embed_image_url || '',
      button_label:      row.button_label || '',
      modal_title:       row.modal_title || '',
      modal_field_label: row.modal_field_label || '',
      modal_placeholder: row.modal_placeholder || '',
    };
    setEditor(hydrated);
    setBaseline(JSON.stringify(hydrated));
    setMsg(''); setSubFilter(''); setCopied(false);
    setSubsLoading(true); setSubs([]);
    fetchWalletSubmissions(sid, row.id)
      .then(r => setSubs(r.submissions || []))
      .catch(e => showMsg(e.message, 'err'))
      .finally(() => setSubsLoading(false));
  }, [activeId, list]); // eslint-disable-line

  const dirty = !!baseline && JSON.stringify(editor) !== baseline;
  const goToList = () => {
    if (dirty && !window.confirm('Discard changes?')) return;
    setActiveId(null); setMsg('');
  };

  const editorToPayload = () => ({
    name:              editor.name,
    blockchain:        editor.blockchain,
    channel_id:        editor.channel_id,
    required_role_id:  editor.required_role_id || '',
    ping_role_ids:     editor.ping_role_ids || [],
    embed_title:       editor.embed_title,
    embed_description: editor.embed_description,
    embed_color:       editor.embed_color || null,
    embed_thumbnail_url: editor.embed_thumbnail_url || '',
    embed_image_url:     editor.embed_image_url || '',
    button_label:      editor.button_label,
    modal_title:       editor.modal_title,
    modal_field_label: editor.modal_field_label,
    modal_placeholder: editor.modal_placeholder,
  });

  const handleCreate = async () => {
    if (!sid) return;
    try {
      const created = await createWalletCollection(sid, { name: 'New Collection', blockchain: 'evm' });
      await doFetch();
      setActiveId(created.id);
    } catch (e) { setError(e.message); }
  };

  const handleSave = async () => {
    if (!sid || !activeId || busy) return;
    setBusy(true);
    try {
      const res = await updateWalletCollection(sid, activeId, editorToPayload());
      await doFetch();
      setActiveId(null);   // return to list view (page navigation)
      showMsg(res?.live_edit === 'edited' ? 'Saved (live message updated)' : 'Saved');
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handlePost = async () => {
    if (!sid || !activeId || busy) return;
    setBusy(true);
    try {
      await updateWalletCollection(sid, activeId, editorToPayload());
      await postWalletCollection(sid, activeId);
      showMsg('Posted to channel.');
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleClose = async () => {
    if (!sid || !activeId || busy) return;
    setBusy(true);
    try {
      await closeWalletCollection(sid, activeId);
      showMsg('Closed. Button disabled on the posted message.');
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleDelete = async (id) => {
    if (!sid || !id) return;
    setBusy(true);
    try {
      await deleteWalletCollection(sid, id);
      if (activeId === id) setActiveId(null);
      setConfirmDel(null);
      await doFetch();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const filteredSubs = subs.filter(s => {
    if (!subFilter.trim()) return true;
    const q = subFilter.trim().toLowerCase();
    return (s.username || '').toLowerCase().includes(q)
        || (s.wallet_address || '').toLowerCase().includes(q)
        || (s.user_id || '').includes(q);
  });

  const copyAll = async () => {
    // "display name <TAB> wallet" per line so a paste into a spreadsheet lands
    // the name in column A and the wallet in column B. Members who left the
    // server fall back to "(left server)".
    const text = filteredSubs
      .map(s => `${s.username || '(left server)'}\t${s.wallet_address}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) { showMsg('Clipboard blocked by the browser.', 'err'); }
  };

  const isDraft  = active?.status === 'draft';
  const isPosted = active?.status === 'posted';

  return (
    <div>
      <PageHeader icon="💼" title="Wallet Collections" badge="GIVEAWAY"
        desc="Collect member wallet addresses behind a role gate for mint whitelists. Validates each address against the chain you pick." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* ── List view (hidden while editing/creating) ── */}
      {!active && (
      <SettingsCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Collections</div>
            <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>
              Drafts stay private. Post to drop the embed and open submissions. Closing disables the button.
            </div>
          </div>
          <button onClick={handleCreate}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '9px 16px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
            + New Collection
          </button>
        </div>

        {loading ? (
          <div style={{ color: C.muted, fontSize: '13px', padding: '16px 0' }}>Loading…</div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.muted }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>💼</div>
            <div style={{ fontSize: '14px' }}>
              No wallet collections yet. Create one to get started.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {list.map(row => {
              const isOpen = activeId === row.id;
              const badge  = WALLET_STATUS_BADGE[row.status] || WALLET_STATUS_BADGE.draft;
              return (
                <div key={row.id}
                  style={{ background: isOpen ? 'rgba(200,168,78,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isOpen ? C.gold : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.name || '(unnamed)'}
                    </div>
                    <div style={{ fontSize: '11px', color: C.muted, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.35)', color: '#8b95f5', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {WALLET_CHAIN_LABEL[row.blockchain] || row.blockchain}
                      </span>
                      <span style={{ background: badge.bg, border: `1px solid ${badge.bd}`, color: badge.fg, padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge.label}</span>
                      <span>{(row.submission_count || 0).toLocaleString()} wallet{row.submission_count === 1 ? '' : 's'}</span>
                      {row.channel_id && <span>· channel {row.channel_id}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveId(row.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => setConfirmDel(row.id)} title="Delete this collection"
                      style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>
      )}

      {/* Delete confirmation modal */}
      {confirmDel != null && (
        <div onClick={() => setConfirmDel(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#16161e', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', maxWidth: '420px', width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Delete this collection?</div>
            <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, marginBottom: '20px' }}>
              This removes the collection and all collected wallet submissions. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirmDel(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDel)} disabled={busy}
                style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.45)', borderRadius: '8px', padding: '8px 18px', color: C.red, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit view (replaces the list) ── */}
      {active && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <button onClick={goToList}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>
              ‹ Back to list
            </button>
            <span style={{ fontSize: '13px', color: C.muted }}>
              {active.status === 'draft' ? 'New collection' : 'Editing'}{active.name ? `: ${active.name}` : ''}
            </span>
          </div>
          <SettingsCard title="Collection">
            <FieldRow>
              <Field label="Name" hint="Used in commands and the dashboard">
                <Input value={editor.name} onChange={setEd('name')} placeholder="e.g. Genesis Mint WL" />
              </Field>
              <Field label="Blockchain" hint="Wallets are validated against this chain">
                <Select value={editor.blockchain} onChange={setEd('blockchain')} options={WALLET_CHAINS} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Channel" hint="Where the embed is posted (name or ID)">
                <Input value={editor.channel_id} onChange={setEd('channel_id')} placeholder="#whitelist or channel ID" />
              </Field>
              <Field label="Required Role (optional)" hint="Role ID needed to submit. Blank = open to all">
                <Input value={editor.required_role_id} onChange={setEd('required_role_id')} placeholder="Role ID (blank = everyone)" />
              </Field>
            </FieldRow>
            <Field label="Ping Roles on Post (optional)" hint="Comma-separated role IDs mentioned when posted">
              <Input
                value={(Array.isArray(editor.ping_role_ids) ? editor.ping_role_ids : []).join(', ')}
                onChange={v => setEd('ping_role_ids')(v.split(',').map(x => x.trim()).filter(Boolean))}
                placeholder="Role ID, Role ID..."
              />
            </Field>
          </SettingsCard>

          <SettingsCard title="Embed">
            <EmbedPreview
              serverId={sid}
              isPremium={isPremium}
              title={editor.embed_title}
              description={editor.embed_description}
              thumbnailUrl={editor.embed_thumbnail_url}
              imageUrl={editor.embed_image_url}
              color={editor.embed_color || '#94730D'}
              footerText={''}
              onTitleChange={setEd('embed_title')}
              onDescriptionChange={setEd('embed_description')}
              onThumbnailChange={setEd('embed_thumbnail_url')}
              onImageChange={setEd('embed_image_url')}
              onColorChange={setEd('embed_color')}
              onFooterTextChange={() => {}}
              showImage={true}
              bodySize="base"
            />
            <Field label="Button Label">
              <Input value={editor.button_label} onChange={setEd('button_label')} placeholder="Submit Wallet" />
            </Field>
          </SettingsCard>

          <SettingsCard title="Submission Form">
            <FieldRow>
              <Field label="Modal Title">
                <Input value={editor.modal_title} onChange={setEd('modal_title')} placeholder="Submit Your Wallet" />
              </Field>
              <Field label="Field Label">
                <Input value={editor.modal_field_label} onChange={setEd('modal_field_label')} placeholder="Your EVM wallet address" />
              </Field>
            </FieldRow>
            <Field label="Field Placeholder (optional)">
              <Input value={editor.modal_placeholder} onChange={setEd('modal_placeholder')} placeholder="0x..." />
            </Field>
          </SettingsCard>

          {/* ── Submissions ── */}
          <SettingsCard title="Submissions">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <Input value={subFilter} onChange={setSubFilter} placeholder="Filter by username or wallet…" />
              </div>
              <button onClick={copyAll} disabled={filteredSubs.length === 0}
                title="Copies name and wallet, tab separated, ready to paste into a spreadsheet"
                style={{ background: copied ? 'rgba(59,165,92,0.2)' : 'rgba(200,168,78,0.12)', border: `1px solid ${copied ? 'rgba(59,165,92,0.5)' : 'rgba(200,168,78,0.4)'}`, borderRadius: '8px', padding: '9px 16px', color: copied ? C.green : C.gold, cursor: filteredSubs.length ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0, opacity: filteredSubs.length ? 1 : 0.5 }}>
                {copied ? '✓ Copied' : `📋 Copy All (paste into spreadsheet) (${filteredSubs.length})`}
              </button>
            </div>

            {subsLoading ? (
              <div style={{ color: C.muted, fontSize: '13px', padding: '12px 0' }}>Loading submissions…</div>
            ) : filteredSubs.length === 0 ? (
              <div style={{ color: C.muted, fontSize: '13px', padding: '12px 0' }}>
                {subs.length === 0 ? 'No wallets submitted yet.' : 'No submissions match your filter.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: C.muted, textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '8px 10px', width: '36px' }}>#</th>
                      <th style={{ padding: '8px 10px' }}>Discord User</th>
                      <th style={{ padding: '8px 10px' }}>Wallet Address</th>
                      <th style={{ padding: '8px 10px' }}>Submitted</th>
                      <th style={{ padding: '8px 10px' }}>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map((s, i) => (
                      <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ padding: '8px 10px', color: C.muted }}>{i + 1}</td>
                        <td style={{ padding: '8px 10px' }}>{s.username ? `@${s.username}` : `(${s.user_id})`}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>{s.wallet_address}</td>
                        <td style={{ padding: '8px 10px', color: C.muted, fontSize: '12px', whiteSpace: 'nowrap' }}>{(s.submitted_at || '').replace('T', ' ').slice(0, 16)}</td>
                        <td style={{ padding: '8px 10px', color: C.muted, fontSize: '12px', whiteSpace: 'nowrap' }}>{(s.updated_at || '').replace('T', ' ').slice(0, 16)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SettingsCard>

          {/* ── Action bar ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
            <button onClick={handleSave} disabled={busy}
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#0A0A0F', cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            {isDraft && (
              <button onClick={handlePost} disabled={busy}
                style={{ background: 'rgba(59,165,92,0.15)', border: '1px solid rgba(59,165,92,0.45)', borderRadius: '8px', padding: '10px 20px', color: C.green, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700 }}>
                🚀 Post to Channel
              </button>
            )}
            {isPosted && (
              <button onClick={handleClose} disabled={busy}
                style={{ background: 'rgba(237,66,69,0.12)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '8px', padding: '10px 20px', color: C.red, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700 }}>
                Close Collection
              </button>
            )}
            {msg && (
              <span style={{ fontSize: '13px', color: msgKind === 'err' ? C.red : C.green }}>{msg}</span>
            )}
          </div>
        </>
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
  cost_source:       'community', // 'community' | 'engage'
  entry_tasks:       [],         // [{type, target, label}]
};

// Giveaway entry-task types. value matches the backend enum; the target field
// shape changes per type (handled in the editor).
// Logical task kinds shown in the "Configure Tasks" checkbox modal. Like and
// Retweet are one logical kind (engagement) that stores as separate
// twitter_like / twitter_retweet rows under the hood, so backend verification
// and legacy data are untouched.
// Three logical task kinds. Discord is one unified type (membership, with
// optional role multipliers). Per-giveaway caps in Issue 7.
const GIVEAWAY_TASK_KIND_META = {
  follow:     { label: 'Follow',          max: 5 },
  engagement: { label: 'Like / Retweet',  max: 1 },
  discord:    { label: 'Discord',         max: 2 },
};

// Client-side validators mirror the backend so the admin gets an inline error
// before the save round-trips. The backend re-validates regardless.
const RE_X_USERNAME = /^[A-Za-z0-9_]{1,15}$/;
const RE_SNOWFLAKE  = /^\d{17,20}$/;
const RE_TWEET_REF  = /(?:status\/)?(\d{10,25})/;
// Flexible invite accept + canonical code extraction (Issue 5).
const RE_DISCORD_INVITE = /^(https?:\/\/)?(www\.)?discord\.(gg|com\/invite)\/[a-zA-Z0-9]+\/?$/i;
const RE_INVITE_CODE    = /(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/i;

function normalizeInvite(url) {
  const s = String(url || '').trim();
  if (!RE_DISCORD_INVITE.test(s)) return null;
  const m = s.match(RE_INVITE_CODE);
  return m ? `https://discord.gg/${m[1]}` : null;
}

// Stable key for merging a like + retweet that target the same tweet.
function tweetKey(target) {
  const m = String(target || '').match(/(?:status\/)?(\d{10,25})/);
  return m ? m[1] : String(target || '').trim().toLowerCase();
}

// Flat entry_tasks array -> logical units for the editor. Merges a
// twitter_like + twitter_retweet on the same tweet into one engagement unit,
// and migrates legacy discord_member / discord_role into the unified discord
// type (a member + role on the same server become one task).
function tasksToLogical(tasks) {
  const units = [];
  const engByKey = {};
  const discordByServer = {};
  const ensureDiscord = (sid, invite) => {
    let u = discordByServer[sid];
    if (!u) {
      u = { kind: 'discord', server_id: sid, invite_url: invite || '', roles: [] };
      discordByServer[sid] = u;
      units.push(u);
    } else if (!u.invite_url && invite) {
      u.invite_url = invite;
    }
    return u;
  };
  for (const t of (tasks || [])) {
    if (t.type === 'twitter_like' || t.type === 'twitter_retweet') {
      const key = tweetKey(t.target);
      let u = engByKey[key];
      if (!u) { u = { kind: 'engagement', target: t.target || '', like: false, retweet: false }; engByKey[key] = u; units.push(u); }
      if (t.type === 'twitter_like') u.like = true; else u.retweet = true;
    } else if (t.type === 'twitter_follow') {
      units.push({ kind: 'follow', target: t.target || '' });
    } else if (t.type === 'discord') {
      const sid = String(t.server_id || t.target || '').trim();
      const u = ensureDiscord(sid, (t.invite_url || '').trim());
      for (const r of (t.role_multipliers || [])) {
        u.roles.push({ role_id: String(r.role_id || '').trim(), multiplier: Number(r.multiplier) || 1, type: (String(r.type || 'BASE').toUpperCase() === 'STACK') ? 'STACK' : 'BASE' });
      }
    } else if (t.type === 'discord_member') {
      ensureDiscord(String(t.target || t.server_id || '').trim(), (t.invite_url || '').trim());
    } else if (t.type === 'discord_role') {
      const [g = '', r = ''] = String(t.target || '').split(':');
      const u = ensureDiscord(g.trim(), (t.invite_url || '').trim());
      if (r.trim()) u.roles.push({ role_id: r.trim(), multiplier: 1, type: 'BASE' });
    }
  }
  return units;
}

// Logical units -> flat entry_tasks array for storage (no custom labels).
function logicalToTasks(units) {
  const out = [];
  for (const u of (units || [])) {
    if (u.kind === 'follow') {
      out.push({ type: 'twitter_follow', target: (u.target || '').trim() });
    } else if (u.kind === 'engagement') {
      const target = (u.target || '').trim();
      if (u.like)    out.push({ type: 'twitter_like',    target });
      if (u.retweet) out.push({ type: 'twitter_retweet', target });
    } else if (u.kind === 'discord') {
      out.push({
        type: 'discord',
        server_id: (u.server_id || '').trim(),
        invite_url: (normalizeInvite(u.invite_url) || (u.invite_url || '').trim()),
        role_multipliers: (u.roles || []).map(r => ({
          role_id: (r.role_id || '').trim(),
          multiplier: Math.max(1, Math.min(100, Number(r.multiplier) || 1)),
          type: r.type === 'STACK' ? 'STACK' : 'BASE',
        })),
      });
    }
  }
  return out;
}

function newTaskUnit(kind) {
  if (kind === 'follow')     return { kind, target: '' };
  if (kind === 'engagement') return { kind, target: '', like: true, retweet: true };
  if (kind === 'discord')    return { kind, server_id: '', invite_url: '', roles: [] };
  return { kind };
}

// Validate one logical unit. Returns an error string or null.
function validateGiveawayUnit(u) {
  if (u.kind === 'follow') {
    if (!RE_X_USERNAME.test(String(u.target || '').trim().replace(/^@/, ''))) return 'Enter a valid X username (letters, numbers, underscore, max 15)';
  } else if (u.kind === 'engagement') {
    if (!u.like && !u.retweet) return 'Select Like, Retweet, or both';
    if (!RE_TWEET_REF.test(String(u.target || '').trim())) return 'Enter a valid tweet URL or ID';
  } else if (u.kind === 'discord') {
    if (!RE_SNOWFLAKE.test(String(u.server_id || '').trim())) return 'Resolve a Discord server first';
    if (String(u.invite_url || '').trim() && !normalizeInvite(u.invite_url)) return 'Enter a valid Discord invite URL';
    for (const r of (u.roles || [])) {
      if (!RE_SNOWFLAKE.test(String(r.role_id || '').trim())) return 'Select a role for every role multiplier row';
      const m = Number(r.multiplier);
      if (!Number.isInteger(m) || m < 1 || m > 100) return 'Role multiplier must be 1 to 100';
    }
  }
  return null;
}

function validateGiveawayUnits(units) {
  for (let i = 0; i < (units || []).length; i++) {
    const err = validateGiveawayUnit(units[i]);
    if (err) return `Task ${i + 1}: ${err}`;
  }
  return null;
}

// Validate the flat entry_tasks (used at save time on editor.entry_tasks).
function validateGiveawayTasks(tasks) {
  return validateGiveawayUnits(tasksToLogical(tasks));
}

// Winner count control: free text typing + minus/plus buttons. Validates to a
// positive integer 1..1000 on blur, resetting to the last valid value on bad
// input (Fix 1).
const WinnerCountInput = ({ value, onChange, disabled }) => {
  const [text, setText] = useState(String(value ?? 1));
  useEffect(() => { setText(String(value ?? 1)); }, [value]);
  const commit = (raw) => {
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) { setText(String(value)); return; }
    const clamped = Math.min(1000, Math.max(1, n));
    setText(String(clamped));
    onChange(clamped);
  };
  const step = (delta) => {
    if (disabled) return;
    const base = Number.isInteger(parseInt(text, 10)) ? parseInt(text, 10) : (value || 1);
    const next = Math.min(1000, Math.max(1, base + delta));
    setText(String(next));
    onChange(next);
  };
  const btn = {
    width: '34px', height: '38px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#fff', cursor: disabled ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif',
    fontSize: '16px', fontWeight: 700, opacity: disabled ? 0.5 : 1, flexShrink: 0,
  };
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <button type="button" onClick={() => step(-1)} disabled={disabled} style={btn}>−</button>
      <input
        value={text}
        disabled={disabled}
        inputMode="numeric"
        onChange={e => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        style={{ width: '70px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 8px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', opacity: disabled ? 0.55 : 1 }}
      />
      <button type="button" onClick={() => step(1)} disabled={disabled} style={btn}>+</button>
    </div>
  );
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

// Small labeled checkbox used for the Like / Retweet sub-options.
const TaskCheckbox = ({ checked, onToggle, label }) => (
  <div onClick={onToggle}
    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', cursor: 'pointer' }}>
    <div style={{ width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, border: `1px solid ${checked ? C.gold : 'rgba(255,255,255,0.25)'}`, background: checked ? `linear-gradient(135deg,${C.gold},${C.goldDark})` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0F', fontSize: '12px', fontWeight: 800 }}>
      {checked ? '✓' : ''}
    </div>
    <span style={{ fontSize: '13px', color: '#fff' }}>{label}</span>
  </div>
);

// Bold type header above each configured task's inputs.
const TaskHeader = ({ children }) => (
  <div style={{ fontSize: '12px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
    {children}
  </div>
);

// Searchable role select (Issue 2, Option B). Shows the selected role NAME,
// type to filter by name (case-insensitive substring), arrow keys to navigate,
// Enter to pick, Escape / outside click to close. Stores the role ID. Legacy
// IDs not in the fetched list still display as "Role {id}".
const RoleCombobox = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hi, setHi] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const selected = (options || []).find(o => String(o.id) === String(value));
  const display = selected ? selected.name : (value ? `Role ${value}` : '');
  const q = query.trim().toLowerCase();
  const filtered = q ? (options || []).filter(o => o.name.toLowerCase().includes(q)) : (options || []);
  const pick = (o) => { onChange(o.id); setOpen(false); setQuery(''); };

  const onKey = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(filtered.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[hi]) pick(filtered[hi]); }
    else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  const inputStyle = { width: '100%', background: 'rgba(0,0,0,0.3)', border: `1px solid ${open ? 'rgba(200,168,78,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', boxSizing: 'border-box' };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        value={open ? query : display}
        placeholder={display || 'Select a role…'}
        onFocus={() => { setOpen(true); setHi(0); }}
        onChange={e => { setQuery(e.target.value); setHi(0); if (!open) setOpen(true); }}
        onKeyDown={onKey}
        style={inputStyle} />
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60, background: '#1a1a22', border: `1px solid ${C.border}`, borderRadius: '8px', maxHeight: '210px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {(options || []).length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: C.orange }}>AVbot must be in this server to load roles</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: C.muted }}>No roles match.</div>
          ) : filtered.map((o, idx) => (
            <div key={o.id}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }}
              onMouseEnter={() => setHi(idx)}
              style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer', color: idx === hi ? C.gold : '#fff', background: idx === hi ? 'rgba(200,168,78,0.12)' : (String(o.id) === String(value) ? 'rgba(200,168,78,0.06)' : 'transparent') }}>
              {o.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// One-line summary for a collapsed configured-task row.
function giveawayTaskSummary(u) {
  if (u.kind === 'follow') return `Follow: @${String(u.target || '').replace(/^@/, '') || '(not set)'}`;
  if (u.kind === 'engagement') {
    const a = [u.like && 'Like', u.retweet && 'Retweet'].filter(Boolean).join(' & ');
    return `${a || 'Like / Retweet'}: ${u.target || '(no tweet)'}`;
  }
  if (u.kind === 'discord') {
    const rc = (u.roles || []).length;
    return `Discord: server ${u.server_id || '(none)'}` + (rc ? ` · ${rc} role${rc === 1 ? '' : 's'}` : ' · membership only');
  }
  return 'Task';
}

// Inline configuration form for one task (add or edit). Holds its own draft so
// empty fields never vanish; commits on Add/Save after client validation.
const TaskConfigForm = ({ sid, initial, isEdit, onCommit, onCancel }) => {
  const [u, setU] = useState(initial);
  const [err, setErr] = useState('');
  const set = (patch) => setU(p => ({ ...p, ...patch }));
  const setRole = (i, patch) => set({ roles: (u.roles || []).map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  const addRole = () => set({ roles: [...(u.roles || []), { role_id: '', multiplier: 1, type: 'BASE' }] });
  const removeRole = (i) => set({ roles: (u.roles || []).filter((_, idx) => idx !== i) });
  const toggleEng = (field) => {
    const nextVal = !u[field];
    const other = field === 'like' ? u.retweet : u.like;
    if (!nextVal && !other) return;
    set({ [field]: nextVal });
  };

  // Discord server resolution (Issue 2). Paste invite URL or ID, resolve to a
  // server card, then pick roles from a dropdown when the bot is in the server.
  const [resolveInput, setResolveInput] = useState(initial.invite_url || initial.server_id || '');
  const [resolved, setResolved] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolveErr, setResolveErr] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);

  const loadRoles = async (gid) => {
    try {
      const r = await fetchDiscordRoles(sid, gid);
      setRoleOptions(r.roles || []);
    } catch (_) { setRoleOptions([]); }
  };

  const doResolve = async (inputOverride) => {
    const q = (inputOverride != null ? inputOverride : resolveInput).trim();
    if (!q) { setResolveErr('Enter an invite URL or server ID'); return; }
    setResolving(true); setResolveErr('');
    try {
      const r = await resolveDiscordServer(sid, q);
      setResolved(r);
      const serverChanged = String(r.server_id) !== String(u.server_id || '');
      set({ server_id: r.server_id, invite_url: r.invite_url || '', ...(serverChanged ? { roles: [] } : {}) });
      if (r.bot_in_server) loadRoles(r.server_id); else setRoleOptions([]);
    } catch (e) {
      setResolveErr(e.message); setResolved(null); setRoleOptions([]);
    } finally {
      setResolving(false);
    }
  };

  // Auto-resolve when editing an existing Discord task so the card + roles show.
  useEffect(() => {
    if (u.kind === 'discord' && (initial.server_id || initial.invite_url)) {
      doResolve(initial.invite_url || initial.server_id);
    }
  }, []); // eslint-disable-line

  const commit = () => {
    const e = validateGiveawayUnit(u);
    if (e) { setErr(e); return; }
    const out = { ...u };
    if (u.kind === 'discord') out.invite_url = normalizeInvite(u.invite_url) || (u.invite_url || '').trim();
    onCommit(out);
  };

  const numStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 8px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', textAlign: 'center' };
  const pill = (active) => ({ background: active ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? C.gold : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', padding: '7px 12px', color: active ? C.gold : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 700 });
  const xStyle = { background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 6px', flexShrink: 0 };
  const meta = GIVEAWAY_TASK_KIND_META[u.kind] || { label: 'Task' };
  const botIn = resolved && resolved.bot_in_server;

  return (
    <div style={{ background: 'rgba(200,168,78,0.05)', border: '1px solid rgba(200,168,78,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
      <TaskHeader>{meta.label}</TaskHeader>

      {u.kind === 'follow' && (
        <Input value={u.target} onChange={v => set({ target: v })} placeholder="X username (without @)" />
      )}

      {u.kind === 'engagement' && (<>
        <Input value={u.target} onChange={v => set({ target: v })} placeholder="Tweet URL or ID" />
        <div style={{ display: 'flex', gap: '18px', marginTop: '8px' }}>
          <TaskCheckbox checked={!!u.like}    onToggle={() => toggleEng('like')}    label="Like" />
          <TaskCheckbox checked={!!u.retweet} onToggle={() => toggleEng('retweet')} label="Retweet" />
        </div>
      </>)}

      {u.kind === 'discord' && (<>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Input value={resolveInput} onChange={setResolveInput}
              onBlur={() => { if (resolveInput.trim() && !resolved) doResolve(); }}
              placeholder="Discord server invite URL or ID" />
          </div>
          <button type="button" onClick={() => doResolve()} disabled={resolving}
            style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.4)', borderRadius: '8px', padding: '10px 16px', color: C.gold, cursor: resolving ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, flexShrink: 0, opacity: resolving ? 0.6 : 1 }}>
            {resolving ? 'Resolving…' : 'Resolve'}
          </button>
        </div>
        {resolveErr && <div style={{ fontSize: '12px', color: C.red, marginTop: '8px' }}>{resolveErr}</div>}

        {resolved && (
          <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {resolved.icon_url
              ? <img src={resolved.icon_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
              : <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(200,168,78,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.gold, fontWeight: 800 }}>{(resolved.name || '?')[0]}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>✓ {resolved.name}</div>
              {resolved.member_count != null && (
                <div style={{ fontSize: '12px', color: C.muted }}>~{Number(resolved.member_count).toLocaleString()} members</div>
              )}
              {botIn
                ? <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, color: C.green, background: 'rgba(59,165,92,0.12)', border: '1px solid rgba(59,165,92,0.4)', borderRadius: '100px', padding: '2px 8px' }}>Bot is in this server</span>
                : <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, color: C.orange, background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.35)', borderRadius: '100px', padding: '2px 8px' }}>AVbot is not in this server. Invite the bot for verification to work.</span>}
            </div>
          </div>
        )}

        {resolved && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Role Multipliers (optional)</span>
              {botIn && (
                <button type="button" onClick={addRole}
                  style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.4)', borderRadius: '7px', padding: '5px 10px', color: C.gold, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '11px', fontWeight: 700 }}>
                  + Add Role
                </button>
              )}
            </div>
            {!botIn ? (
              <div style={{ fontSize: '11px', color: C.orange }}>AVbot must be in this server before role multipliers can be configured. You can still save this as a membership only task.</div>
            ) : (u.roles || []).length === 0 ? (
              <div style={{ fontSize: '11px', color: C.muted }}>No roles. Task requires server membership only.</div>
            ) : (u.roles || []).map((r, ri) => (
                <div key={ri} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <RoleCombobox value={r.role_id} options={roleOptions}
                      onChange={(id) => setRole(ri, { role_id: id })} />
                  </div>
                  <input type="number" min="1" max="100" value={String(r.multiplier)}
                    onChange={e => setRole(ri, { multiplier: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })}
                    style={{ width: '64px', ...numStyle }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['BASE', 'STACK'].map(tp => (
                      <button key={tp} type="button" onClick={() => setRole(ri, { type: tp })} style={pill(r.type === tp)}>{tp}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => removeRole(ri)} title="Remove role" style={xStyle}>×</button>
                </div>
            ))}
            {botIn && (
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                BASE: highest matched multiplier counts. STACK: added on top. Tickets weight the draw.
              </div>
            )}
          </div>
        )}
      </>)}

      {err && <div style={{ fontSize: '12px', color: C.red, marginTop: '10px' }}>{err}</div>}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button type="button" onClick={commit}
          style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '8px 18px', color: '#0A0A0F', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700 }}>
          {isEdit ? 'Save' : 'Add'}
        </button>
        <button type="button" onClick={onCancel}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// Entry-task editor (Issue 3 inline UX). A single "Add Task" button reveals a
// type picker (Follow / Like-Retweet / Discord, capped per Issue 7); choosing a
// type opens that type's config form inline. Existing rows show a summary with
// Edit / Remove. No custom label field.
const GiveawayTasksEditor = ({ tasks, onChange, sid }) => {
  const units = tasksToLogical(tasks);
  const [panel, setPanel] = useState(null);  // null | {mode:'select'} | {mode:'new',draft} | {mode:'edit',index,draft}

  const counts = { follow: 0, engagement: 0, discord: 0 };
  for (const u of units) counts[u.kind] = (counts[u.kind] || 0) + 1;

  const commitUnits = (next) => onChange(logicalToTasks(next));
  const removeUnit = (i) => commitUnits(units.filter((_, idx) => idx !== i));
  const onCommit = (unit) => {
    if (panel && panel.mode === 'edit') commitUnits(units.map((u, idx) => idx === panel.index ? unit : u));
    else commitUnits([...units, unit]);
    setPanel(null);
  };

  const editBtn = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 };
  const xBtn = { background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 6px' };
  const cancelBtn = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' };

  return (
    <div style={{ marginTop: '6px', marginBottom: '18px' }}>
      <Label hint="Members complete these before entering. Discord role multipliers weight the draw.">Entry tasks (optional)</Label>

      {units.length === 0 && !panel && (
        <div style={{ fontSize: '12px', color: C.muted, padding: '8px 0' }}>
          No tasks. Members enter directly (subject to role and cost rules).
        </div>
      )}

      {units.map((u, i) => (
        (panel && panel.mode === 'edit' && panel.index === i)
          ? <TaskConfigForm key={i} sid={sid} initial={panel.draft} isEdit onCommit={onCommit} onCancel={() => setPanel(null)} />
          : (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{giveawayTaskSummary(u)}</span>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                <button type="button" onClick={() => setPanel({ mode: 'edit', index: i, draft: { ...units[i] } })} style={editBtn}>Edit</button>
                <button type="button" onClick={() => removeUnit(i)} title="Remove task" style={xBtn}>×</button>
              </div>
            </div>
          )
      ))}

      {panel && panel.mode === 'select' && (
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', color: C.muted, marginBottom: '10px' }}>Choose a task type</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(GIVEAWAY_TASK_KIND_META).map(([kind, meta]) => {
              const disabled = counts[kind] >= meta.max;
              return (
                <button key={kind} type="button" disabled={disabled}
                  onClick={() => setPanel({ mode: 'new', draft: newTaskUnit(kind) })}
                  title={disabled ? `Maximum ${meta.max} ${meta.label} task${meta.max === 1 ? '' : 's'}` : meta.label}
                  style={{ background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(200,168,78,0.12)', border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : 'rgba(200,168,78,0.4)'}`, borderRadius: '8px', padding: '9px 16px', color: disabled ? C.muted : C.gold, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 700, opacity: disabled ? 0.6 : 1 }}>
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '12px' }}>
            <button type="button" onClick={() => setPanel(null)} style={cancelBtn}>Cancel</button>
          </div>
        </div>
      )}

      {panel && panel.mode === 'new' && (
        <TaskConfigForm sid={sid} initial={panel.draft} onCommit={onCommit} onCancel={() => setPanel(null)} />
      )}

      {!panel && (
        <button type="button" onClick={() => setPanel({ mode: 'select' })}
          style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.4)', borderRadius: '8px', padding: '8px 14px', color: C.gold, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 700 }}>
          + Add Task
        </button>
      )}
    </div>
  );
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

  // Top-level sub-tab inside the Giveaway module. Defaults to 'giveaways' so
  // existing admins land on the familiar list first. 'wallet' shows the Wallet
  // Collections area. Mirrors the Radar module's topic tab bar.
  const [activeTab, setActiveTab] = useState('giveaways');

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

  const [baseline, setBaseline] = useState('');

  // When a row becomes active in the editor, hydrate the form. entry_tasks are
  // kept as full objects (the API returns the canonical shape, including the
  // unified discord type with server_id / invite_url / role_multipliers).
  useEffect(() => {
    const row = list.find(x => x.id === activeId);
    if (!row) return;
    const dur = secondsToFriendly(row.duration_seconds || 3600);
    const hydrated = {
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
      cost_source:       row.cost_source || 'community',
      entry_tasks:       Array.isArray(row.entry_tasks) ? row.entry_tasks : [],
    };
    setEditor(hydrated);
    setBaseline(JSON.stringify(hydrated));
    setMsg('');
  }, [activeId, list]);

  const dirty = !!baseline && JSON.stringify(editor) !== baseline;
  const goToList = () => {
    if (dirty && !window.confirm('Discard changes?')) return;
    setActiveId(null);
    setMsg('');
  };

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
    cost_source:       editor.cost_source === 'engage' ? 'engage' : 'community',
    // Send entry tasks as-is. They are already in the canonical flat shape
    // (the tasks editor writes them via logicalToTasks), so a Discord task
    // keeps its server_id / invite_url / role_multipliers. Do NOT remap to
    // {type,target,label} here — that dropped server_id and made the backend
    // reject Discord tasks with "not a valid Discord server ID".
    entry_tasks:       editor.entry_tasks || [],
  });

  const handleSave = async () => {
    if (!serverId || !activeId || busy) return;
    // Inline task validation before the round-trip.
    const taskErr = validateGiveawayTasks(editor.entry_tasks);
    if (taskErr) { showMsg(taskErr, 'err'); return; }
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
        delete payload.cost_source;   // locked once active (matches backend)
      }
      const res = await updateGiveaway(serverId, activeId, payload);
      await doFetch();
      setActiveId(null);   // return to list view (page navigation)
      showMsg(res?.live_edit === 'edited' ? 'Saved (live message updated)' : 'Saved');
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const handleStart = async () => {
    if (!serverId || !activeId || busy) return;
    const taskErr = validateGiveawayTasks(editor.entry_tasks);
    if (taskErr) { showMsg(taskErr, 'err'); return; }
    // Save first so the latest editor values are in the row when start posts.
    setBusy(true);
    try {
      const payload = editorToPayload();
      await updateGiveaway(serverId, activeId, payload);
      const res = await startGiveaway(serverId, activeId);
      await doFetch();
      setActiveId(null);   // return to list view
      showMsg(`Started. Ends ${giveawayRelative(res.ends_at)}.`);
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

      {/* Sub-tab bar (matches the Radar module's topic tab bar). */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '8px' }}>
        {[
          { id: 'giveaways', label: 'Giveaways',         icon: '🎉' },
          { id: 'wallet',    label: 'Wallet Collections', icon: '💼' },
        ].map(t => {
          const active = activeTab === t.id;
          return (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: active ? 'rgba(200,168,78,0.14)' : 'transparent', border: active ? '1px solid rgba(200,168,78,0.4)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: active ? C.gold : 'rgba(255,255,255,0.7)', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <span style={{ display: 'inline-flex', width: '16px', height: '16px', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'giveaways' && (<>
      {/* ── List view (hidden while editing/creating) ── */}
      {!active && (
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
                      {row.entry_cost_points > 0 && <span>· {row.entry_cost_points.toLocaleString()} {row.cost_source === 'engage' ? 'engage pts' : 'pts'}</span>}
                      {Array.isArray(row.entry_tasks) && row.entry_tasks.length > 0 && (
                        <span style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.35)', color: '#8b95f5', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 700 }}>
                          Tasks: {row.entry_tasks.length}
                        </span>
                      )}
                      {row.winner_count > 1 && <span>· {row.winner_count} winners</span>}
                      {ends && <span>· ends {ends}</span>}
                      {row.channel_id && <span>· channel {row.channel_id}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveId(row.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 12px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                      ✏️ Edit
                    </button>
                    {row.status !== 'draft' && (
                      <button onClick={() => openEntrants(row.id)}
                        title="View entrants"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 10px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                        👥 {row.entry_count}
                      </button>
                    )}
                    {(row.status === 'active' || row.status === 'drawing') ? (
                      <button disabled
                        title="Active giveaways cannot be deleted. Cancel or wait for it to end first."
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                    ) : (
                      <button onClick={() => setConfirm({ id: row.id, action: 'delete' })}
                        title="Delete this giveaway"
                        style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '16px', padding: '4px 6px', lineHeight: 1 }}>🗑</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>
      )}

      {/* ── Create / Edit view (replaces the list) ── */}
      {active && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <button onClick={goToList}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px', color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600 }}>
              ‹ Back to list
            </button>
            <span style={{ fontSize: '13px', color: C.muted }}>
              {isDraft ? 'New giveaway' : 'Editing'}{active.title ? `: ${active.title}` : ''}
            </span>
          </div>
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
                hint={isActive ? 'Locked while active.' : 'Type a number or use the buttons. 1 to 1000.'}>
                <WinnerCountInput
                  value={Number(editor.winner_count) || 1}
                  onChange={v => setEd('winner_count')(v)}
                  disabled={isActive} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Entry cost (points)"
                hint={isActive ? 'Locked while active.' : 'Set 0 for free entry. Cancelling refunds everyone.'}>
                <Input type="number"
                  value={String(editor.entry_cost_points)}
                  onChange={v => setEd('entry_cost_points')(Math.max(0, Number(v) || 0))}
                  placeholder="0"
                  style={{ maxWidth: '160px' }} />
                {Number(editor.entry_cost_points) > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: C.muted, marginBottom: '6px' }}>
                      Which point pool pays for entries
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[['community', 'Community Points'], ['engage', 'Engage Points']].map(([val, lbl]) => {
                        const sel = (editor.cost_source || 'community') === val;
                        return (
                          <button key={val} type="button"
                            onClick={() => { if (!isActive) setEd('cost_source')(val); }}
                            disabled={isActive}
                            style={{ background: sel ? 'rgba(200,168,78,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sel ? C.gold : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '8px 14px', color: sel ? C.gold : '#fff', cursor: isActive ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, opacity: isActive ? 0.6 : 1 }}>
                            {sel ? '● ' : '○ '}{lbl}
                          </button>
                        );
                      })}
                    </div>
                    {(editor.cost_source === 'engage') && (
                      <div style={{ fontSize: '11px', color: C.orange, marginTop: '6px' }}>
                        Make sure this server has Engage Points enabled, or entries will fail.
                      </div>
                    )}
                  </div>
                )}
              </Field>
              <Field label="Target channel"
                hint={isActive ? 'Locked while active.' : 'Channel name or numeric ID.'}>
                <Input value={editor.channel_id} onChange={setEd('channel_id')}
                  placeholder="#giveaways or 1234567890" />
              </Field>
            </FieldRow>

            <GiveawayTasksEditor
              key={activeId}
              sid={serverId}
              tasks={editor.entry_tasks || []}
              onChange={setEd('entry_tasks')} />
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
      {confirm?.action === 'delete' && (
        <div onClick={() => setConfirm(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#16161e', border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', maxWidth: '420px', width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Delete this giveaway?</div>
            <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, marginBottom: '20px' }}>
              This will also remove all entries and prevent re-drawing. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirm(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px' }}>Cancel</button>
              <button onClick={() => handleDelete(confirm.id)} disabled={busy}
                style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.45)', borderRadius: '8px', padding: '8px 18px', color: C.red, cursor: busy ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
      </>)}

      {/* Wallet Collections tab. Tab switching provides the separation, so the
          section renders without its own top divider here. */}
      {activeTab === 'wallet' && <WalletCollectionsSection sid={serverId} />}
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

// Inline SVG icon set used across the Radar tab. Lucide-style, ~1.8px
// stroke inside a fixed-size box; the wrapping <div style={fontSize: ...}>
// at the call sites is irrelevant because SVGs render at their own
// width/height. Drawn ourselves so font/emoji availability never breaks.
const RICON_CRYPTO = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8h4.5a2.5 2.5 0 0 1 0 5H9" />
    <path d="M9 13h5a2.5 2.5 0 0 1 0 5H9" />
    <path d="M9 5v3M9 16v3M13 5v3M13 16v3" />
  </svg>
);
const RICON_NFT = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M21 16l-5-5-9 9" />
  </svg>
);
const RICON_MEME = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14c1 1.5 2.5 2.5 4 2.5S15 15.5 16 14" />
    <circle cx="9"  cy="10" r=".8" />
    <circle cx="15" cy="10" r=".8" />
  </svg>
);
const RICON_FOREX = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M4 8h12l-3-3" />
    <path d="M20 16H8l3 3" />
  </svg>
);
const RICON_STOCKS = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M3 17l5-5 4 4 8-9" />
    <path d="M14 7h6v6" />
  </svg>
);
const RICON_LIQUIDATION = (size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L3 14h7l-2 8 11-13h-7l1-7z" />
  </svg>
);
const RICON_RADAR_HEADER = (size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 12 L20 6" />
    <path d="M19.07 4.93a10 10 0 1 1-14.14 0" />
    <path d="M16.24 7.76a6 6 0 1 1-8.48 0" />
  </svg>
);
const RICON_REFRESH = (size = 12) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 3v6h-6" />
  </svg>
);
// Per-topic configuration lives on RADAR_TOPIC_TABS down in RadarSettings;
// the legacy topic-card constants are no longer needed (the new tab bar
// renders directly from RADAR_TOPIC_TABS).

// Digest template defaults — must mirror digest.py's news-y defaults so the
// dashboard preview shows the same fallback wording the bot will post.
const RADAR_DIGEST_DEFAULTS = {
  title:  "Today's Market Beat",
  intro:  "Here's how your tracked assets are moving today.",
  color:  '#94730D',                 // brand goldDark
  footer: 'AVbot',
};
const RADAR_THUMBNAIL_MODES = [
  { value: 'brand',      label: 'Brand thumbnail' },
  { value: 'first_coin', label: 'First coin logo' },
  { value: 'off',        label: 'No thumbnail' },
];
const RADAR_DATE_MODES = [
  { value: 'date_tz',    label: 'Date + timezone' },
  { value: 'date_only',  label: 'Date only' },
  { value: 'off',        label: 'No date' },
];

// Channel-id input — type="text" + inputMode="numeric" so the browser
// keeps the string verbatim (Discord snowflakes exceed JS Number precision
// and type="number" silently rounds the last digits). Pattern enforces
// digits-only on mobile keyboards. State stays a string end-to-end.
const RadarChannelInput = ({ value, onChange, placeholder = 'numeric channel id' }) => (
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    autoComplete="off"
    spellCheck={false}
    value={value == null ? '' : String(value)}
    onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
    placeholder={placeholder}
    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
    onFocus={e => e.target.style.borderColor = 'rgba(200,168,78,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
  />
);

const RADAR_TOPIC_TABS = [
  { id: 'crypto',      label: 'Crypto',      Icon: RICON_CRYPTO,      live: true  },
  { id: 'nft',         label: 'NFT',         Icon: RICON_NFT,         live: true  },
  { id: 'meme',        label: 'Memecoin',    Icon: RICON_MEME,        live: true  },
  { id: 'forex',       label: 'Forex',       Icon: RICON_FOREX,       live: true  },
  { id: 'stocks',      label: 'Stocks',      Icon: RICON_STOCKS,      live: false },
  { id: 'liquidation', label: 'Liquidations',Icon: RICON_LIQUIDATION, live: false },
];

const RADAR_TOPIC_DEFAULTS = () => ({
  daily_enabled:               0,
  daily_channel:               '',
  daily_time:                  '08:00',
  digest_mention_role_ids:     [],
  alerts_enabled:              0,
  alerts_channel:              '',
  movement_threshold_pct:      5.0,
  volume_multiplier_threshold: 3.0,
  alerts_mention_role_ids:     [],
  // Phase 3 — multi-timeframe watchlist alerts (research-based defaults).
  alert_1h_threshold_pct:      3.0,
  alert_24h_threshold_pct:     8.0,
  alert_7d_threshold_pct:      20.0,
  alert_volume_multiplier:     2.5,
  alert_1h_enabled:            1,
  alert_24h_enabled:           1,
  alert_7d_enabled:            0,
  alert_volume_enabled:        1,
  // Phase 3 — Trending Discovery (meme + nft only).
  discovery_enabled:                   0,
  discovery_channel:                   '',
  discovery_mention_role_ids:          [],
  discovery_min_liquidity_usd:         50000,
  discovery_min_volume_24h_usd:        100000,
  discovery_min_age_hours:             24,
  discovery_min_change_1h_pct:         30.0,
  discovery_min_volume_change_24h_pct: 50.0,
  discovery_min_sales_24h:             10,
  digest_title:                '',
  digest_intro:                '',
  digest_color:                '',
  digest_footer:               '',
  digest_thumbnail_mode:       'brand',
  digest_date_mode:            'date_tz',
  manual_digests_used_today:   0,
  manual_digests_remaining_today: 5,
  manual_digests_daily_cap:    5,
});

// Field-level dirty diff for one topic row. We normalize both sides for
// stable comparison (arrays sorted, strings trimmed).
function radarTopicDiffers(local, persisted) {
  if (!local || !persisted) return false;
  const norm = (v) => Array.isArray(v) ? v.slice().sort().join(',')
                    : (v == null ? '' : String(v));
  const keys = [
    'daily_enabled','daily_channel','daily_time',
    'digest_mention_role_ids',
    'alerts_enabled','alerts_channel',
    'movement_threshold_pct','volume_multiplier_threshold',
    'alerts_mention_role_ids',
    'alert_1h_threshold_pct','alert_24h_threshold_pct','alert_7d_threshold_pct',
    'alert_volume_multiplier',
    'alert_1h_enabled','alert_24h_enabled','alert_7d_enabled','alert_volume_enabled',
    'discovery_enabled','discovery_channel','discovery_mention_role_ids',
    'discovery_min_liquidity_usd','discovery_min_volume_24h_usd',
    'discovery_min_age_hours','discovery_min_change_1h_pct',
    'discovery_min_volume_change_24h_pct','discovery_min_sales_24h',
    'digest_title','digest_intro','digest_color','digest_footer',
    'digest_thumbnail_mode','digest_date_mode',
  ];
  for (const k of keys) {
    if (norm(local[k]) !== norm(persisted[k])) return true;
  }
  return false;
}

function radarGlobalDiffers(local, persisted) {
  if (!local || !persisted) return false;
  return Number(local.timezone_offset || 0) !== Number(persisted.timezone_offset || 0);
}

const RadarSettings = () => {
  const { server } = useContext(DashboardContext);
  const serverId = server?.id;

  // ── Loaded state ─────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [msg,      setMsg]      = useState('');
  const [msgKind,  setMsgKind]  = useState('ok');
  const showMsg = (text, kind = 'ok') => {
    setMsg(text); setMsgKind(kind);
    setTimeout(() => setMsg(''), 4500);
  };

  // Persisted = last server-confirmed; Forms = local editable state.
  // Comparing the two field-by-field gives us per-topic dirty indicators.
  const [persistedGlobal, setPersistedGlobal] = useState(null);
  const [persistedTopics, setPersistedTopics] = useState(null);
  const [globalForm,      setGlobalForm]      = useState({ timezone_offset: 0 });
  const [topicForms,      setTopicForms]      = useState({
    crypto: RADAR_TOPIC_DEFAULTS(),
    nft:    RADAR_TOPIC_DEFAULTS(),
    meme:   RADAR_TOPIC_DEFAULTS(),
    forex:  RADAR_TOPIC_DEFAULTS(),
  });

  // Watchlist (used by the watchlist editor + live preview, both
  // already kind-aware).
  const [watchlist, setWatchlist] = useState([]);

  // Active topic on the tab bar.
  const [activeTopic, setActiveTopic] = useState('crypto');

  // ── Initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!serverId) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      fetchRadarSettings(serverId).catch(e => { setError(e.message); return null; }),
      fetchRadarWatchlist(serverId).catch(() => ({ watchlist: [] })),
    ]).then(([s, wl]) => {
      if (s) hydrateFromServer(s);
      setWatchlist(wl?.watchlist || []);
      setLoading(false);
    });
  }, [serverId]); // eslint-disable-line

  function hydrateFromServer(s) {
    const g = s?.global || {};
    const t = s?.topics || {};
    setPersistedGlobal(g);
    setPersistedTopics(t);
    setGlobalForm({ timezone_offset: Number(g.timezone_offset || 0) });
    setTopicForms({
      crypto: { ...RADAR_TOPIC_DEFAULTS(), ...(t.crypto || {}) },
      nft:    { ...RADAR_TOPIC_DEFAULTS(), ...(t.nft    || {}) },
      meme:   { ...RADAR_TOPIC_DEFAULTS(), ...(t.meme   || {}) },
      forex:  { ...RADAR_TOPIC_DEFAULTS(), ...(t.forex  || {}) },
    });
  }

  // ── Watchlist polling (30s while tab is visible) ────────────────────
  useEffect(() => {
    if (!serverId) return;
    let alive = true; let timer = null;
    const pull = () => {
      fetchRadarWatchlist(serverId)
        .then(r => { if (alive) setWatchlist(r?.watchlist || []); })
        .catch(() => {});
    };
    const tick = () => { if (document.visibilityState !== 'hidden') pull(); };
    const onVis = () => { if (document.visibilityState === 'visible') pull(); };
    timer = setInterval(tick, 30000);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [serverId]); // eslint-disable-line

  // ── Field helpers ───────────────────────────────────────────────────
  const setTopicField = (topic) => (k) => (v) => {
    setTopicForms(prev => ({
      ...prev,
      [topic]: { ...(prev[topic] || RADAR_TOPIC_DEFAULTS()), [k]: v },
    }));
  };
  const setGlobalField = (k) => (v) => {
    setGlobalForm(prev => ({ ...prev, [k]: v }));
  };

  const isTopicDirty = (t) =>
    radarTopicDiffers(topicForms[t], persistedTopics?.[t]);
  const isGlobalDirty = () =>
    radarGlobalDiffers(globalForm, persistedGlobal);

  const dirtyTopics = ['crypto','nft','meme','forex'].filter(isTopicDirty);
  const anyDirty = dirtyTopics.length > 0 || isGlobalDirty();

  // ── Save handlers ────────────────────────────────────────────────────
  const buildTopicPayload = (t) => ({
    daily_enabled:               topicForms[t].daily_enabled ? 1 : 0,
    daily_channel:               String(topicForms[t].daily_channel || ''),
    daily_time:                  topicForms[t].daily_time || '08:00',
    digest_mention_role_ids:     Array.isArray(topicForms[t].digest_mention_role_ids)
                                   ? topicForms[t].digest_mention_role_ids
                                   : parseRoleIdInput(topicForms[t].digest_mention_role_ids || ''),
    alerts_enabled:              topicForms[t].alerts_enabled ? 1 : 0,
    alerts_channel:              String(topicForms[t].alerts_channel || ''),
    movement_threshold_pct:      Number(topicForms[t].movement_threshold_pct || 5),
    volume_multiplier_threshold: Number(topicForms[t].volume_multiplier_threshold || 3),
    alerts_mention_role_ids:     Array.isArray(topicForms[t].alerts_mention_role_ids)
                                   ? topicForms[t].alerts_mention_role_ids
                                   : parseRoleIdInput(topicForms[t].alerts_mention_role_ids || ''),
    // Phase 3 — multi-timeframe watchlist alerts.
    alert_1h_threshold_pct:      Number(topicForms[t].alert_1h_threshold_pct ?? 3),
    alert_24h_threshold_pct:     Number(topicForms[t].alert_24h_threshold_pct ?? 8),
    alert_7d_threshold_pct:      Number(topicForms[t].alert_7d_threshold_pct ?? 20),
    alert_volume_multiplier:     Number(topicForms[t].alert_volume_multiplier ?? 2.5),
    alert_1h_enabled:            topicForms[t].alert_1h_enabled ? 1 : 0,
    alert_24h_enabled:           topicForms[t].alert_24h_enabled ? 1 : 0,
    alert_7d_enabled:            topicForms[t].alert_7d_enabled ? 1 : 0,
    alert_volume_enabled:        topicForms[t].alert_volume_enabled ? 1 : 0,
    // Phase 3 — Trending Discovery (meme + nft).
    discovery_enabled:           topicForms[t].discovery_enabled ? 1 : 0,
    discovery_channel:           String(topicForms[t].discovery_channel || ''),
    discovery_mention_role_ids:  Array.isArray(topicForms[t].discovery_mention_role_ids)
                                   ? topicForms[t].discovery_mention_role_ids
                                   : parseRoleIdInput(topicForms[t].discovery_mention_role_ids || ''),
    discovery_min_liquidity_usd:         Number(topicForms[t].discovery_min_liquidity_usd ?? 50000),
    discovery_min_volume_24h_usd:        Number(topicForms[t].discovery_min_volume_24h_usd ?? 100000),
    discovery_min_age_hours:             Number(topicForms[t].discovery_min_age_hours ?? 24),
    discovery_min_change_1h_pct:         Number(topicForms[t].discovery_min_change_1h_pct ?? 30),
    discovery_min_volume_change_24h_pct: Number(topicForms[t].discovery_min_volume_change_24h_pct ?? 50),
    discovery_min_sales_24h:             Number(topicForms[t].discovery_min_sales_24h ?? 10),
    digest_title:                topicForms[t].digest_title || '',
    digest_intro:                topicForms[t].digest_intro || '',
    digest_color:                topicForms[t].digest_color || '',
    digest_footer:               topicForms[t].digest_footer || '',
    digest_thumbnail_mode:       topicForms[t].digest_thumbnail_mode || 'brand',
    digest_date_mode:            topicForms[t].digest_date_mode || 'date_tz',
  });

  const buildGlobalPayload = () => ({
    timezone_offset: Number(globalForm.timezone_offset || 0),
  });

  const [saving, setSaving] = useState(false);

  async function patchAndHydrate(payload) {
    const updated = await saveRadarSettings(serverId, payload);
    hydrateFromServer(updated);
  }

  const handleSaveCurrent = async () => {
    if (!serverId || saving) return;
    setSaving(true);
    try {
      const payload = {};
      if (isGlobalDirty()) payload.global = buildGlobalPayload();
      if (isTopicDirty(activeTopic)) {
        payload.topics = { [activeTopic]: buildTopicPayload(activeTopic) };
      }
      if (Object.keys(payload).length === 0) {
        showMsg('Nothing to save.', 'ok');
      } else {
        await patchAndHydrate(payload);
        showMsg('Saved.');
      }
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    if (!serverId || saving) return;
    setSaving(true);
    try {
      const payload = {};
      if (isGlobalDirty()) payload.global = buildGlobalPayload();
      if (dirtyTopics.length > 0) {
        payload.topics = {};
        for (const t of dirtyTopics) payload.topics[t] = buildTopicPayload(t);
      }
      if (Object.keys(payload).length === 0) {
        showMsg('Nothing to save.', 'ok');
      } else {
        await patchAndHydrate(payload);
        showMsg(`Saved ${dirtyTopics.length} topic${dirtyTopics.length === 1 ? '' : 's'}.`);
      }
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setSaving(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <PageHeader icon={<RICON_RADAR_HEADER size={18} />} title="Radar" badge="MODULE"
          desc="Per-topic market intelligence with watchlists, daily market updates, and price movement alerts." />
        <div style={{ color: C.muted, fontSize: '13px', padding: '24px 0' }}>Loading...</div>
      </div>
    );
  }

  const topicForm = topicForms[activeTopic] || RADAR_TOPIC_DEFAULTS();
  const setField  = setTopicField(activeTopic);

  return (
    <div>
      <PageHeader icon={<RICON_RADAR_HEADER size={18} />} title="Radar" badge="MODULE"
        desc="Per-topic market intelligence with watchlists, daily market updates, and price movement alerts." />

      {error && (
        <div style={{ background: 'rgba(237,66,69,0.1)', border: '1px solid rgba(237,66,69,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: C.red, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '18px' }}>x</button>
        </div>
      )}

      {/* Shared global card. Timezone applies to every topic. */}
      <SettingsCard title="Global">
        <Field label="Timezone" hint="Shared by every topic on this server. Each topic's daily time is interpreted in this timezone.">
          <select value={Number(globalForm.timezone_offset || 0)}
            onChange={e => setGlobalField('timezone_offset')(Number(e.target.value))}
            style={{ width: '100%', maxWidth: '320px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer' }}>
            {RADAR_TIMEZONE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </SettingsCard>

      {/* Topic tab bar. */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', padding: '8px' }}>
        {RADAR_TOPIC_TABS.map(t => {
          const active   = activeTopic === t.id;
          const dirty    = t.live && isTopicDirty(t.id);
          const clickable = t.live;
          const bg = active ? 'rgba(200,168,78,0.14)'
                   : !clickable ? 'rgba(255,255,255,0.03)'
                   : 'transparent';
          const fg = active ? C.gold
                   : !clickable ? C.muted
                   : 'rgba(255,255,255,0.7)';
          const border = active ? '1px solid rgba(200,168,78,0.4)'
                       : '1px solid rgba(255,255,255,0.06)';
          return (
            <button key={t.id}
              onClick={() => clickable && setActiveTopic(t.id)}
              disabled={!clickable}
              title={!clickable ? `${t.label} ships in a later phase.` : t.label}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: bg, border, borderRadius: '8px', color: fg, fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600, cursor: clickable ? 'pointer' : 'not-allowed', position: 'relative' }}>
              <span style={{ display: 'inline-flex', width: '16px', height: '16px' }}>{t.Icon(16)}</span>
              {t.label}
              {t.live && (
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: active ? C.gold : C.green, marginLeft: '2px' }}>
                  Live
                </span>
              )}
              {!t.live && (
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.muted, marginLeft: '2px' }}>
                  Soon
                </span>
              )}
              {dirty && (
                <span title="Unsaved changes" style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: C.red }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Watchlist editor for the active topic (kind-specific UX). */}
      <RadarWatchlistByKind
        kind={activeTopic}
        label={RADAR_TOPIC_TABS.find(t => t.id === activeTopic)?.label || 'Watchlist'}
        hint={
          activeTopic === 'crypto' ? 'Add tokens by name. Each entry appears in your daily market update and is evaluated for movement and volume alerts.'
        : activeTopic === 'nft'    ? 'Pick a chain and enter the OpenSea collection slug (e.g. pudgypenguins). Each entry appears in your daily market update and is evaluated for movement and volume alerts.'
        : activeTopic === 'meme'   ? 'Paste a DEXScreener URL or chain:address. Click Resolve to preview, then confirm to add.'
        : activeTopic === 'forex'  ? 'Pick two currencies, or a commodity priced in USD (Gold, Silver, Oil, Platinum). Movement alerts use the 24h delta.'
        : ''}
        serverId={serverId}
        watchlist={watchlist}
        refresh={async () => {
          const r = await fetchRadarWatchlist(serverId);
          setWatchlist(r?.watchlist || []);
        }}
        showMsg={showMsg}
      />

      {/* Daily digest card for the active topic. */}
      <RadarTopicDailyCard
        topic={activeTopic}
        serverId={serverId}
        form={topicForm}
        setField={setField}
        showMsg={showMsg}
        onSent={async () => {
          // After a successful send the row's used/remaining moves. Hydrate
          // just the topic row so the counter updates without losing
          // unsaved edits elsewhere.
          try {
            const fresh = await fetchRadarSettings(serverId);
            hydrateFromServer(fresh);
          } catch {}
        }}
      />

      {/* Movement alerts card for the active topic. */}
      <RadarTopicAlertsCard topic={activeTopic} form={topicForm} setField={setField} />

      {/* Trending Discovery card — Memecoin + NFT only (not Crypto/Forex). */}
      {(activeTopic === 'meme' || activeTopic === 'nft') && (
        <RadarDiscoveryCard topic={activeTopic} form={topicForm} setField={setField} />
      )}

      {/* Digest Style card for the active topic. */}
      <SettingsCard title="Digest Style">
        <RadarDigestStyle settings={{ ...topicForm, timezone_offset: globalForm.timezone_offset }}
          setField={setField} />
      </SettingsCard>

      {/* Live preview grid for the active topic only. */}
      <RadarTopicLivePreview topic={activeTopic} watchlist={watchlist}
        serverId={serverId} showMsg={showMsg} />

      {/* Save bar — saves current OR all dirty topics. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button onClick={handleSaveCurrent} disabled={saving || (!isGlobalDirty() && !isTopicDirty(activeTopic))}
          style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#0A0A0F', cursor: (saving || (!isGlobalDirty() && !isTopicDirty(activeTopic))) ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: (saving || (!isGlobalDirty() && !isTopicDirty(activeTopic))) ? 0.5 : 1 }}>
          {saving ? 'Saving...' : `Save ${RADAR_TOPIC_TABS.find(t => t.id === activeTopic)?.label || ''}`}
        </button>
        {(dirtyTopics.length > 1 || (dirtyTopics.length === 1 && !dirtyTopics.includes(activeTopic)) || (isGlobalDirty() && dirtyTopics.length > 0)) && (
          <button onClick={handleSaveAll} disabled={saving || !anyDirty}
            style={{ background: 'rgba(200,168,78,0.10)', border: '1px solid rgba(200,168,78,0.35)', borderRadius: '8px', padding: '10px 18px', color: C.gold, cursor: (saving || !anyDirty) ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: (saving || !anyDirty) ? 0.5 : 1 }}>
            Save all ({dirtyTopics.length + (isGlobalDirty() ? 1 : 0)})
          </button>
        )}
        {msg && (
          <span style={{ fontSize: '12px', color: msgKind === 'err' ? C.red : C.green }}>
            {msgKind === 'err' ? 'x ' : '+ '}{msg}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Per-topic Daily card (channel, time, mention roles, send-now) ────────
const RadarTopicDailyCard = ({ topic, serverId, form, setField, showMsg, onSent }) => {
  const [sending, setSending] = useState(false);
  const handleSendNow = async () => {
    if (!serverId || sending) return;
    setSending(true);
    try {
      const r = await sendRadarDigestNow(serverId, topic);
      const rem = r?.remaining_today;
      showMsg(`${topic} digest sent.${rem != null ? ` ${rem} of ${r.daily_cap} remaining today.` : ''}`);
      if (onSent) await onSent();
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setSending(false); }
  };

  const remaining = form.manual_digests_remaining_today ?? form.manual_digests_daily_cap ?? 5;
  const cap       = form.manual_digests_daily_cap ?? 5;
  const used      = form.manual_digests_used_today ?? 0;

  return (
    <SettingsCard title="Daily digest">
      <FieldRow>
        <Field label="Enable daily digest">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: C.muted }}>
            <input type="checkbox" checked={!!form.daily_enabled}
              onChange={e => setField('daily_enabled')(e.target.checked ? 1 : 0)}
              style={{ accentColor: C.gold }} />
            Post a daily market update in this topic's channel.
          </label>
        </Field>
        <Field label="Channel" hint="Where this topic's digest is posted.">
          <RadarChannelInput value={form.daily_channel || ''}
            onChange={setField('daily_channel')} />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Time of day" hint="Interpreted in the timezone set in the Global card above.">
          <Input value={form.daily_time || '08:00'} onChange={setField('daily_time')}
            placeholder="08:00" style={{ maxWidth: '120px' }} />
        </Field>
        <Field label="Mention roles"
          hint="Role IDs, comma separated (spaces OK). Each role gets pinged with each digest.">
          <Input
            value={Array.isArray(form.digest_mention_role_ids)
              ? form.digest_mention_role_ids.join(', ')
              : (form.digest_mention_role_ids || '')}
            onChange={v => setField('digest_mention_role_ids')(parseRoleIdInput(v))}
            placeholder="1234567890, 9876543210" />
        </Field>
      </FieldRow>

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
            Posts the current digest for this topic immediately. Limited to {cap} per UTC day with a 5 minute cooldown.{' '}
            <strong style={{ color: '#fff' }}>{used} of {cap} used today</strong>
            {' '}{remaining} remaining
          </div>
        </div>
        {remaining <= 0 ? (
          <button disabled title="Daily cap reached for this topic. Resets at UTC midnight."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 16px', color: C.muted, cursor: 'not-allowed', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600 }}>
            Daily cap reached
          </button>
        ) : (
          <button onClick={handleSendNow} disabled={sending}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '8px 18px', color: '#0A0A0F', cursor: sending ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 700, opacity: sending ? 0.6 : 1 }}>
            {sending ? 'Sending...' : 'Send digest now'}
          </button>
        )}
      </div>
    </SettingsCard>
  );
};

// One timeframe row: an enable toggle + a threshold input. Used by the
// multi-timeframe alerts card so every timeframe is independently switchable.
const RadarTimeframeRow = ({ label, enabledKey, thresholdKey, form, setField,
                             suffix = '%', min, max, recommended, note }) => {
  const on = !!form[enabledKey];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '170px' }}>
        <input type="checkbox" checked={on}
          onChange={e => setField(enabledKey)(e.target.checked ? 1 : 0)}
          style={{ accentColor: C.gold }} />
        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{label}</span>
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Input type="number" value={(form[thresholdKey] ?? recommended) + ''}
          onChange={v => setField(thresholdKey)(Number(v))}
          disabled={!on}
          placeholder={String(recommended)}
          style={{ maxWidth: '100px', opacity: on ? 1 : 0.45 }} />
        <span style={{ fontSize: '13px', color: C.muted }}>{suffix}</span>
      </div>
      <span style={{ fontSize: '11px', color: C.muted, flex: 1, minWidth: '160px' }}>
        {note || `Recommended ${recommended}${suffix}. Allowed ${min}${suffix} to ${max}${suffix}.`}
      </span>
    </div>
  );
};

// Multi-timeframe watchlist alerts. 1h / 24h / 7d each fire independently
// (direction from the sign of the change); volume spike is a separate
// toggle. Forex hides the volume row (no liquidity metric) and notes that
// its 1h check falls back to the 24h delta (Frankfurter is daily-cadence).
const RadarTopicAlertsCard = ({ topic, form, setField }) => {
  const isForex = topic === 'forex';
  return (
    <SettingsCard title="Movement alerts">
      <FieldRow>
        <Field label="Enable alerts">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: C.muted }}>
            <input type="checkbox" checked={!!form.alerts_enabled}
              onChange={e => setField('alerts_enabled')(e.target.checked ? 1 : 0)}
              style={{ accentColor: C.gold }} />
            Post alerts when a watchlist asset moves sharply on a timeframe below.
          </label>
        </Field>
        <Field label="Channel">
          <RadarChannelInput value={form.alerts_channel || ''}
            onChange={setField('alerts_channel')} />
        </Field>
      </FieldRow>

      <div style={{ marginTop: '6px' }}>
        <div style={{ fontSize: '12px', color: C.muted, marginBottom: '4px' }}>
          Recommended: 3% / 8% / 20% — major moves only. Each timeframe fires
          on a move in either direction with a 1 hour per-asset cooldown.
        </div>
        <RadarTimeframeRow label="1 hour change"
          enabledKey="alert_1h_enabled" thresholdKey="alert_1h_threshold_pct"
          form={form} setField={setField} recommended={3} min={1} max={20}
          note={isForex ? 'Forex has no hourly feed — this falls back to the 24h delta. Allowed 1% to 20%.' : undefined} />
        <RadarTimeframeRow label="24 hour change"
          enabledKey="alert_24h_enabled" thresholdKey="alert_24h_threshold_pct"
          form={form} setField={setField} recommended={8} min={3} max={50} />
        <RadarTimeframeRow label="7 day change"
          enabledKey="alert_7d_enabled" thresholdKey="alert_7d_threshold_pct"
          form={form} setField={setField} recommended={20} min={10} max={100}
          note={isForex ? 'Off by default. Forex moves slowly; 10% to 100% allowed.' : 'Off by default — weekly moves are high confidence. Allowed 10% to 100%.'} />
        {!isForex && (
          <RadarTimeframeRow label="Volume spike"
            enabledKey="alert_volume_enabled" thresholdKey="alert_volume_multiplier"
            form={form} setField={setField} suffix="x" recommended={2.5} min={1.5} max={10}
            note="Fires when 24h volume crosses this multiple of the recent baseline. Allowed 1.5x to 10x." />
        )}
      </div>

      <Field label="Mention roles"
        hint="Role IDs, comma separated (spaces OK). Each role gets pinged on every alert.">
        <Input
          value={Array.isArray(form.alerts_mention_role_ids)
            ? form.alerts_mention_role_ids.join(', ')
            : (form.alerts_mention_role_ids || '')}
          onChange={v => setField('alerts_mention_role_ids')(parseRoleIdInput(v))}
          placeholder="1234567890, 9876543210" />
      </Field>
    </SettingsCard>
  );
};

// ── Trending Discovery card (Memecoin + NFT only) ────────────────────────
// A separate subsystem from the watchlist: a background scanner surfaces
// tokens / collections that are pumping right now, filtered by quality
// thresholds. Buy signal only — no dump alerts. Each asset is posted at
// most once per cooldown window (12h meme, 24h nft).
const RADAR_DISCOVERY_FAKE = {
  meme: {
    title: '🚀 Memecoin Pumping — $WAGMI',
    lines: [
      '**Price:** $0.004210',
      '**1h change:** +42.0%',
      '**Liquidity:** $182,400',
      '**24h volume:** $1,240,000',
      '**Pair age:** 3.5 days',
      '**Chain:** SOLANA',
      '**DEX:** raydium',
    ],
  },
  nft: {
    title: '🎨 NFT Heating Up: Sample Collection',
    lines: [
      '**Chain:** ETHEREUM',
      '**Floor:** Ξ1.820',
      '**24h volume:** Ξ640.00',
      '**Volume change 24h:** +120.0%',
      '**Sales last 24h:** 84',
    ],
  },
};

const RadarDiscoveryPreview = ({ topic }) => {
  const sample = RADAR_DISCOVERY_FAKE[topic];
  if (!sample) return null;
  return (
    <div style={{ marginTop: '14px' }}>
      <div style={{ fontSize: '11px', color: C.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Live preview (sample data)
      </div>
      <div style={{ display: 'flex', gap: '12px', background: '#2b2d31', borderRadius: '8px', padding: '14px 16px', borderLeft: `4px solid ${C.gold}`, maxWidth: '460px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{sample.title}</div>
          {sample.lines.map((ln, i) => {
            const [k, ...rest] = ln.replace(/\*\*/g, '').split(':');
            return (
              <div key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7 }}>
                <span style={{ color: C.muted }}>{k}:</span>{rest.join(':')}
              </div>
            );
          })}
          <div style={{ fontSize: '11px', color: C.gold, marginTop: '8px' }}>Open on {topic === 'meme' ? 'DEXScreener' : 'OpenSea'}</div>
        </div>
        <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'rgba(200,168,78,0.12)', flexShrink: 0 }} />
      </div>
    </div>
  );
};

const RadarDiscoveryCard = ({ topic, form, setField }) => {
  if (topic !== 'meme' && topic !== 'nft') return null;
  const isMeme = topic === 'meme';
  return (
    <SettingsCard title="Trending Discovery">
      <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px', lineHeight: 1.6 }}>
        Surfaces tokens and collections currently pumping. Buy signal only — no
        dump alerts. Each asset is alerted at most once per {isMeme ? '12 hours' : '24 hours'}.
        This is separate from your watchlist.
      </div>
      <FieldRow>
        <Field label="Enable discovery">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: C.muted }}>
            <input type="checkbox" checked={!!form.discovery_enabled}
              onChange={e => setField('discovery_enabled')(e.target.checked ? 1 : 0)}
              style={{ accentColor: C.gold }} />
            Scan {isMeme ? 'DEXScreener every 5 minutes' : 'OpenSea every 10 minutes'} and post buy signals.
          </label>
        </Field>
        <Field label="Discovery channel">
          <RadarChannelInput value={form.discovery_channel || ''}
            onChange={setField('discovery_channel')} />
        </Field>
      </FieldRow>

      {isMeme ? (
        <>
          <FieldRow>
            <Field label="Min liquidity (USD)" hint="Rug filter. Recommended 50,000.">
              <Input type="number" value={(form.discovery_min_liquidity_usd ?? 50000) + ''}
                onChange={v => setField('discovery_min_liquidity_usd')(Number(v))}
                placeholder="50000" style={{ maxWidth: '160px' }} />
            </Field>
            <Field label="Min 24h volume (USD)" hint="Recommended 100,000.">
              <Input type="number" value={(form.discovery_min_volume_24h_usd ?? 100000) + ''}
                onChange={v => setField('discovery_min_volume_24h_usd')(Number(v))}
                placeholder="100000" style={{ maxWidth: '160px' }} />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Min pair age (hours)" hint="Older pairs are less likely rugs. Recommended 24.">
              <Input type="number" value={(form.discovery_min_age_hours ?? 24) + ''}
                onChange={v => setField('discovery_min_age_hours')(Number(v))}
                placeholder="24" style={{ maxWidth: '120px' }} />
            </Field>
            <Field label="Min 1h change (%)" hint="Buy threshold. Recommended 30%.">
              <Input type="number" value={(form.discovery_min_change_1h_pct ?? 30) + ''}
                onChange={v => setField('discovery_min_change_1h_pct')(Number(v))}
                placeholder="30" style={{ maxWidth: '120px' }} />
            </Field>
          </FieldRow>
        </>
      ) : (
        <>
          <FieldRow>
            <Field label="Min 24h volume change (%)" hint="How much hotter than yesterday. Recommended 50%.">
              <Input type="number" value={(form.discovery_min_volume_change_24h_pct ?? 50) + ''}
                onChange={v => setField('discovery_min_volume_change_24h_pct')(Number(v))}
                placeholder="50" style={{ maxWidth: '140px' }} />
            </Field>
            <Field label="Min sales (24h)" hint="Real demand filter. Recommended 10.">
              <Input type="number" value={(form.discovery_min_sales_24h ?? 10) + ''}
                onChange={v => setField('discovery_min_sales_24h')(Number(v))}
                placeholder="10" style={{ maxWidth: '120px' }} />
            </Field>
          </FieldRow>
          <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
            Collections scanned across Ethereum, Base and Solana. Floor and volume are in each chain's native token; dust collections below a small floor are skipped automatically.
          </div>
        </>
      )}

      <Field label="Mention roles"
        hint="Role IDs, comma separated (spaces OK). Pinged on every discovery alert.">
        <Input
          value={Array.isArray(form.discovery_mention_role_ids)
            ? form.discovery_mention_role_ids.join(', ')
            : (form.discovery_mention_role_ids || '')}
          onChange={v => setField('discovery_mention_role_ids')(parseRoleIdInput(v))}
          placeholder="1234567890, 9876543210" />
      </Field>

      <RadarDiscoveryPreview topic={topic} />
    </SettingsCard>
  );
};

const RadarTopicLivePreview = ({ topic, watchlist, serverId, showMsg }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastTs, setLastTs] = useState(null);
  const items = (watchlist || []).filter(w => w.asset_kind === topic);

  // Polling already runs at the parent level; refresh-now hits the bulk
  // endpoint scoped to this topic for an immediate refresh.
  const handleRefresh = async () => {
    if (!serverId || refreshing) return;
    setRefreshing(true);
    try {
      await refreshRadarPreview(serverId, topic);
      setLastTs(Date.now());
      showMsg('Refreshed.');
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setRefreshing(false); }
  };

  return (
    <SettingsCard title="Live preview">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: C.muted }}>
          Live prices over this topic's watchlist. Auto refresh every 30 seconds while this tab is visible.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastTs && (
            <span style={{ fontSize: '11px', color: C.muted }}>Updated {secondsAgo(lastTs)} ago</span>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            style={{ background: 'rgba(200,168,78,0.10)', border: '1px solid rgba(200,168,78,0.25)', borderRadius: '8px', padding: '6px 12px', color: C.gold, cursor: refreshing ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, opacity: refreshing ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px', animation: refreshing ? 'avspin 0.8s linear infinite' : 'none' }}>
              {RICON_REFRESH(12)}
            </span>
            {refreshing ? 'Refreshing...' : 'Refresh now'}
          </button>
          <style>{`@keyframes avspin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
      {items.length === 0 ? (
        <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
          Add entries to this topic's watchlist to see live prices here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {items.map(w => <RadarLiveCard key={w.id} entry={w} />)}
        </div>
      )}
    </SettingsCard>
  );
};


// Memecoin chain chip colors (brand colors per chain). Mirrors the Discord
// badge mapping in services/radar/chain_badges.py.
const CHAIN_COLORS = {
  solana:    '#9945FF',
  ethereum:  '#627EEA',
  base:      '#0052FF',
  arbitrum:  '#28A0F0',
  polygon:   '#8247E5',
  bsc:       '#F0B90B',
  optimism:  '#FF0420',
  avalanche: '#E84142',
  fantom:    '#1969FF',
  blast:     '#FCFC03',
  linea:     '#121212',
  scroll:    '#FFEEDA',
};
const chainBgColor = (chain) => CHAIN_COLORS[(chain || '').toLowerCase()] || '#666';

// Memecoin identifiers are 'chain:address' — recover the chain prefix for the
// card chip without needing the backend to send a separate field.
const chainFromIdentifier = (identifier) =>
  (identifier && identifier.includes(':')) ? identifier.split(':')[0].toLowerCase() : '';

// NFT chains supported by the OpenSea v2 adapter. Used by the NFT add UI's
// chain selector; the watchlist identifier is '<chain>:<slug>'.
const NFT_CHAINS = [
  { code: 'ethereum',  label: 'Ethereum' },
  { code: 'polygon',   label: 'Polygon' },
  { code: 'base',      label: 'Base' },
  { code: 'arbitrum',  label: 'Arbitrum' },
  { code: 'optimism',  label: 'Optimism' },
  { code: 'solana',    label: 'Solana' },
  { code: 'avalanche', label: 'Avalanche' },
  { code: 'zora',      label: 'Zora' },
  { code: 'blast',     label: 'Blast' },
  { code: 'sei',       label: 'Sei' },
];

// Static currency list so the Forex add dropdowns always have options. Fiat is
// priced via Frankfurter; commodities (auto-quoted in USD) via Yahoo.
const FOREX_CURRENCIES = [
  // Fiat
  { identifier: 'USD', name: 'US Dollar',        type: 'fiat' },
  { identifier: 'EUR', name: 'Euro',             type: 'fiat' },
  { identifier: 'GBP', name: 'British Pound',    type: 'fiat' },
  { identifier: 'JPY', name: 'Japanese Yen',     type: 'fiat' },
  { identifier: 'CHF', name: 'Swiss Franc',      type: 'fiat' },
  { identifier: 'CAD', name: 'Canadian Dollar',  type: 'fiat' },
  { identifier: 'AUD', name: 'Australian Dollar', type: 'fiat' },
  { identifier: 'CNY', name: 'Chinese Yuan',     type: 'fiat' },
  { identifier: 'AED', name: 'UAE Dirham',       type: 'fiat' },
  { identifier: 'TRY', name: 'Turkish Lira',     type: 'fiat' },
  // Commodities (auto-quoted in USD)
  { identifier: 'XAU',   name: 'Gold (XAU)',     type: 'commodity' },
  { identifier: 'XAG',   name: 'Silver (XAG)',   type: 'commodity' },
  { identifier: 'WTI',   name: 'Oil WTI',        type: 'commodity' },
  { identifier: 'BRENT', name: 'Oil Brent',      type: 'commodity' },
  { identifier: 'XPT',   name: 'Platinum (XPT)', type: 'commodity' },
];
const COMMODITY_BASES = new Set(
  FOREX_CURRENCIES.filter(c => c.type === 'commodity').map(c => c.identifier)
);

// Honors the snapshot's display symbol (NFT floor in Ξ,
// forex in the quote currency, etc.). Single-char glyphs prefix the number;
// multi-char tickers (SOL, AVAX) follow it.
function fmtRadarPriceSym(v, sym) {
  if (v == null) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  const s = sym || '$';
  const body = n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
            : n >= 1    ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
            : n.toFixed(6);
  return s.length === 1 ? `${s}${body}` : `${body} ${s}`;
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
// ── Watchlist editor (per kind) ─────────────────────────────────────────────
// crypto/nft → search-as-you-type → click suggestion to add.
// forex      → two dropdowns (base / quote) → Add button.
// meme       → paste DEXScreener URL or chain:address → Resolve → Confirm.
const RadarWatchlistByKind = ({
  kind, serverId, label, hint, watchlist, refresh, showMsg, disabledReason,
}) => {
  const items = (watchlist || []).filter(w => w.asset_kind === kind);
  const [confirmDel, setConfirmDel] = useState(null);
  const handleRemove = async (id) => {
    try {
      await deleteRadarWatchlistEntry(serverId, id);
      await refresh();
      showMsg('Removed.');
    } catch (e) { showMsg(e.message, 'err'); }
  };

  const listBlock = (
    <>
      {items.length === 0 ? (
        <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '14px 0' }}>
          No {label.toLowerCase()} entries yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(w => {
            const snap  = w.snapshot || {};
            const price = snap.price_usd;
            const ch24  = snap.change_24h_pct;
            return (
              <div key={w.id} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {snap.image_url && (
                  <img src={snap.image_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                )}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{w.display_name || w.asset_identifier}</div>
                  <div style={{ fontSize: '11px', color: C.muted, wordBreak: 'break-all' }}>{w.asset_identifier}</div>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', textAlign: 'right' }}>
                  <div>{price != null ? fmtRadarPriceWithSymbol(snap) : '—'}</div>
                  <div style={{ color: ch24 == null ? C.muted : (ch24 >= 0 ? C.green : C.red), fontSize: '11px' }}>
                    {ch24 == null ? '—' : `${ch24 >= 0 ? '+' : ''}${ch24.toFixed(2)}%`}
                  </div>
                </div>
                {confirmDel === w.id ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleRemove(w.id)}
                      style={{ background: 'rgba(237,66,69,0.2)', border: '1px solid rgba(237,66,69,0.4)', borderRadius: '6px', padding: '4px 10px', color: C.red, cursor: 'pointer', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>Yes</button>
                    <button onClick={() => setConfirmDel(null)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', color: C.muted, cursor: 'pointer', fontSize: '12px', fontFamily: 'Sora, sans-serif' }}>No</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDel(w.id)}
                    style={{ background: 'rgba(237,66,69,0.08)', border: '1px solid rgba(237,66,69,0.35)', borderRadius: '6px', padding: '6px 10px', color: C.red, cursor: 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px' }}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <SettingsCard title={`${label} watchlist`}>
      <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>
        {hint}
      </div>
      {disabledReason ? (
        <div style={{ background: 'rgba(237,66,69,0.06)', border: '1px solid rgba(237,66,69,0.25)', borderRadius: '8px', padding: '10px 14px', color: C.red, fontSize: '12px', marginBottom: '12px' }}>
          {disabledReason}
        </div>
      ) : (
        <>
          {kind === 'crypto' || kind === 'nft' ? (
            <RadarSearchAddBlock kind={kind} serverId={serverId}
              refresh={refresh} showMsg={showMsg} />
          ) : null}
          {kind === 'forex' ? (
            <RadarForexAddBlock serverId={serverId} refresh={refresh} showMsg={showMsg} />
          ) : null}
          {kind === 'meme' ? (
            <RadarMemeAddBlock serverId={serverId} refresh={refresh} showMsg={showMsg} />
          ) : null}
        </>
      )}
      {listBlock}
    </SettingsCard>
  );
};

const RadarSearchAddBlock = ({ kind, serverId, refresh, showMsg }) => {
  const isNft = kind === 'nft';
  const [q,        setQ]        = useState('');
  const [nftChain, setNftChain] = useState('ethereum');
  const [results,  setResults]  = useState([]);
  const [open,     setOpen]     = useState(false);
  const [pending,  setPending]  = useState(false);
  // When an adapter is env-gated off (e.g. NFT without OPENSEA_API_KEY) the
  // search endpoint returns a `note` describing how to enable it. We surface
  // that exact message inline instead of a generic "search failed".
  const [note,     setNote]     = useState('');
  const timerRef = useRef(null);

  // Probe once on mount so a disabled adapter shows its hint even before
  // the admin types anything.
  useEffect(() => {
    if (!serverId) return;
    let alive = true;
    searchRadarAsset(serverId, kind, '')
      .then(r => { if (alive) setNote(r?.note || ''); })
      .catch(() => {});
    return () => { alive = false; };
  }, [kind, serverId]);

  useEffect(() => {
    if (!serverId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const term = (q || '').trim();
    if (term.length < 2) { setResults([]); setPending(false); return; }
    setPending(true);
    // OpenSea has no fuzzy name search, so for NFT the query resolves a
    // '<chain>:<slug>'. Crypto stays a plain CoinGecko search term.
    const lookup = kind === 'nft' ? `${nftChain}:${term}` : term;
    timerRef.current = setTimeout(() => {
      searchRadarAsset(serverId, kind, lookup)
        .then(r => { setResults(r?.suggestions || []); setNote(r?.note || ''); })
        .catch(() => setResults([]))
        .finally(() => setPending(false));
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [q, kind, serverId, nftChain]);

  const handleAdd = async (sug) => {
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind:       kind,
        asset_identifier: sug.identifier,
        display_name:     sug.name || sug.symbol || sug.identifier,
      });
      setQ(''); setResults([]); setOpen(false);
      await refresh();
      showMsg(`Added ${sug.name || sug.identifier}.`);
    } catch (e) { showMsg(e.message, 'err'); }
  };
  const handleAddRaw = async () => {
    const term = (q || '').trim();
    if (!term) return;
    const ident = isNft && !term.includes(':') ? `${nftChain}:${term}` : term;
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind: kind, asset_identifier: ident,
      });
      setQ(''); setResults([]); setOpen(false);
      await refresh();
      showMsg('Added.');
    } catch (e) { showMsg(e.message, 'err'); }
  };

  // Adapter disabled (e.g. NFT without OPENSEA_API_KEY): show the exact
  // server-supplied hint and hide the search box entirely.
  if (note) {
    return (
      <div style={{ background: 'rgba(237,66,69,0.06)', border: '1px solid rgba(237,66,69,0.25)', borderRadius: '8px', padding: '10px 14px', color: C.red, fontSize: '12px', marginBottom: '12px' }}>
        {note}
      </div>
    );
  }

  const selectStyle = { background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer', minWidth: '130px' };

  return (
    <div style={{ position: 'relative', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      {isNft && (
        <select value={nftChain} onChange={e => setNftChain(e.target.value)} style={selectStyle}>
          {NFT_CHAINS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      )}
      <div style={{ position: 'relative', flex: 1 }}>
        <Input value={q} onChange={(v) => { setQ(v); setOpen(true); }}
          placeholder={isNft
            ? 'Collection slug (e.g. pudgypenguins, boredapeyachtclub)'
            : 'Search a token (e.g. bitcoin, ethereum, solana)…'} />
        {open && ((q || '').trim().length >= 2) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#16161e', border: `1px solid ${C.border}`, borderRadius: '10px', maxHeight: '280px', overflowY: 'auto', zIndex: 30, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            {pending && (
              <div style={{ padding: '10px 14px', color: C.muted, fontSize: '12px' }}>Searching…</div>
            )}
            {!pending && results.length === 0 && (
              <button onClick={handleAddRaw}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '10px 14px', color: C.muted, fontSize: '12px', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                {isNft ? `Add "${nftChain}:${q.trim()}" anyway.` : `No suggestions. Add "${q.trim()}" anyway.`}
              </button>
            )}
            {results.map((sug, i) => (
              <button key={sug.identifier + i} onClick={() => handleAdd(sug)}
                style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', padding: '10px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {(sug.thumb || sug.image || sug.image_url) && (
                  <img src={sug.thumb || sug.image || sug.image_url} alt=""
                    style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                )}
                <span style={{ flex: 1 }}>
                  {sug.symbol && <strong>{sug.symbol}</strong>}
                  <span style={{ color: C.muted, marginLeft: sug.symbol ? '8px' : 0 }}>{sug.name}</span>
                </span>
                {sug.chain && (
                  <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9px', fontFamily: 'monospace', fontWeight: 600, background: chainBgColor(sug.chain), color: '#fff', textTransform: 'uppercase' }}>
                    {String(sug.chain).slice(0, 4)}
                  </span>
                )}
                {sug.market_cap_rank && (
                  <span style={{ color: C.muted, fontSize: '11px' }}>#{sug.market_cap_rank}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RadarForexAddBlock = ({ serverId, refresh, showMsg }) => {
  const fiat        = FOREX_CURRENCIES.filter(c => c.type === 'fiat');
  const commodities = FOREX_CURRENCIES.filter(c => c.type === 'commodity');
  const [base,  setBase]  = useState('EUR');
  const [quote, setQuote] = useState('USD');
  const [busy,  setBusy]  = useState(false);

  const isCommodityBase = COMMODITY_BASES.has(base);

  // Commodities are always quoted in USD; force it when a commodity is picked.
  useEffect(() => {
    if (isCommodityBase && quote !== 'USD') setQuote('USD');
  }, [isCommodityBase, quote]);

  const sameCurrency = !isCommodityBase && base === quote;

  const handleAdd = async () => {
    const q = isCommodityBase ? 'USD' : quote;
    if (!base || !q || sameCurrency || busy) return;
    setBusy(true);
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind: 'forex', asset_identifier: `${base}/${q}`,
      });
      await refresh();
      showMsg(`Added ${base}/${q}.`);
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setBusy(false); }
  };

  const selectStyle = { background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer', minWidth: '120px' };
  const opt = c => <option key={c.identifier} value={c.identifier}>{c.identifier} ({c.name})</option>;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
        <Field label="Base">
          <select value={base} onChange={e => setBase(e.target.value)} style={selectStyle}>
            <optgroup label="Fiat">{fiat.map(opt)}</optgroup>
            <optgroup label="Commodities">{commodities.map(opt)}</optgroup>
          </select>
        </Field>
        <div style={{ paddingBottom: '12px', color: C.muted, fontSize: '16px', fontWeight: 700 }}>/</div>
        <Field label="Quote">
          <select value={quote} onChange={e => setQuote(e.target.value)} disabled={isCommodityBase}
            style={{ ...selectStyle, opacity: isCommodityBase ? 0.5 : 1, cursor: isCommodityBase ? 'not-allowed' : 'pointer' }}>
            {fiat.map(opt)}
          </select>
        </Field>
        <button onClick={handleAdd} disabled={busy || sameCurrency}
          style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '10px 18px', color: '#0A0A0F', cursor: (busy || sameCurrency) ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, opacity: (busy || sameCurrency) ? 0.5 : 1 }}>
          {busy ? 'Adding…' : 'Add pair'}
        </button>
      </div>
      {isCommodityBase && (
        <div style={{ color: C.muted, fontSize: '12px', marginTop: '8px' }}>
          Commodities are priced in USD.
        </div>
      )}
      {sameCurrency && (
        <div style={{ color: C.red, fontSize: '12px', marginTop: '8px' }}>
          Base and quote must be different.
        </div>
      )}
    </div>
  );
};

const RadarMemeAddBlock = ({ serverId, refresh, showMsg }) => {
  const [input,    setInput]    = useState('');
  const [preview,  setPreview]  = useState(null);
  const [resolving, setResolving] = useState(false);
  const [saving,   setSaving]   = useState(false);

  const handleResolve = async () => {
    const term = (input || '').trim();
    if (!term || resolving) return;
    setResolving(true); setPreview(null);
    try {
      const r = await resolveRadarMeme(serverId, term);
      setPreview(r);
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setResolving(false); }
  };
  const handleConfirm = async () => {
    if (!preview || saving) return;
    setSaving(true);
    try {
      await addRadarWatchlistEntry(serverId, {
        asset_kind: 'meme',
        asset_identifier: preview.identifier,
        display_name: preview.name || preview.symbol || preview.identifier,
      });
      setInput(''); setPreview(null);
      await refresh();
      showMsg(`Added ${preview.symbol || preview.identifier}.`);
    } catch (e) { showMsg(e.message, 'err'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input value={input} onChange={setInput}
            placeholder="DEXScreener URL or chain:address (e.g. solana:F7Hwf…)" />
        </div>
        <button onClick={handleResolve} disabled={resolving || !input.trim()}
          style={{ background: 'rgba(200,168,78,0.12)', border: '1px solid rgba(200,168,78,0.4)', borderRadius: '8px', padding: '10px 16px', color: C.gold, cursor: (resolving || !input.trim()) ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 600, opacity: (resolving || !input.trim()) ? 0.5 : 1 }}>
          {resolving ? 'Resolving…' : 'Resolve'}
        </button>
      </div>
      {preview && (
        <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(200,168,78,0.25)', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {preview.image_url && <img src={preview.image_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontWeight: 700 }}>
              {preview.symbol || '—'} <span style={{ color: C.muted, fontSize: '12px' }}>· {preview.chain}</span>
            </div>
            <div style={{ fontSize: '11px', color: C.muted, wordBreak: 'break-all' }}>{preview.address}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {fmtRadarPriceWithSymbol({ price_usd: preview.price_usd, price_display_symbol: '$' })}
              {preview.change_24h_pct != null && (
                <span style={{ color: preview.change_24h_pct >= 0 ? C.green : C.red, marginLeft: '8px' }}>
                  {preview.change_24h_pct >= 0 ? '+' : ''}{preview.change_24h_pct.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <button onClick={handleConfirm} disabled={saving}
            style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#0A0A0F', cursor: saving ? 'default' : 'pointer', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Adding…' : 'Confirm and add'}
          </button>
        </div>
      )}
    </div>
  );
};

function fmtRadarPriceWithSymbol(snap) {
  if (!snap || snap.price_usd == null) return '—';
  const n = Number(snap.price_usd);
  if (!Number.isFinite(n)) return '—';
  const sym = snap.price_display_symbol || '$';
  const formatted = n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : n >= 1 ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : n.toFixed(6);
  // Single-glyph symbols ($, €, £, ¥) prefix; 3-letter codes (USD, EUR) suffix.
  if (sym === '$' || sym === '€' || sym === '£' || sym === '¥' || sym.length === 1) {
    return `${sym}${formatted}`;
  }
  return `${formatted} ${sym}`;
}

const RadarLiveCard = ({ entry }) => {
  const snap  = entry.snapshot || {};
  const price = snap.price_usd;
  const ch1   = snap.change_1h_pct;
  const ch24  = snap.change_24h_pct;
  const name  = entry.display_name || snap.symbol_display || entry.asset_identifier;
  // Commodities/forex carry a friendly label like 'Gold (XAU/USD)'; show it as
  // the card title with the raw pair beneath. Other kinds are unaffected.
  const forexFriendly = entry.asset_kind === 'forex'
    ? (snap.display_name || entry.display_name) : null;
  const chain = (entry.asset_kind === 'meme' || entry.asset_kind === 'nft')
    ? ((snap?.raw?.chain) || chainFromIdentifier(entry.asset_identifier))
    : '';
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
            {forexFriendly || (snap.symbol_display || entry.asset_identifier || '').toUpperCase()}
          </div>
          <div style={{ fontSize: '10px', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {forexFriendly ? (snap.symbol_display || entry.asset_identifier) : name}
          </div>
        </div>
        {chain && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 8px', borderRadius: '999px',
            fontSize: '10px', fontFamily: 'monospace', fontWeight: 600,
            letterSpacing: '0.05em', background: chainBgColor(chain),
            color: '#fff', textTransform: 'uppercase',
          }}>
            {chain.slice(0, 5)}
          </span>
        )}
        {snap.rank && <span style={{ fontSize: '10px', color: C.muted }}>#{snap.rank}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700 }}>
            {fmtRadarPriceSym(price, snap.price_display_symbol)}
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

// ── Digest Style sub-section ────────────────────────────────────────────────
// Per-guild customization for the digest embed. Mirrors the Embed Message
// editor pattern (live Discord-style preview to the right). Defaults match
// the news-y defaults in services/radar/digest.py so the preview shows the
// same fallback text the bot will post when a field is left empty.
const RadarDigestStyle = ({ settings, setField }) => {
  const s = settings || {};
  const title  = s.digest_title  || '';
  const intro  = s.digest_intro  || '';
  const color  = s.digest_color  || '';
  const footer = s.digest_footer || '';
  const thumbMode = s.digest_thumbnail_mode || 'brand';

  const liveTitle  = title || RADAR_DIGEST_DEFAULTS.title;
  const liveIntro  = intro || RADAR_DIGEST_DEFAULTS.intro;
  const liveColor  = /^#?[0-9a-fA-F]{6}$/.test(color || '')
    ? (color.startsWith('#') ? color : `#${color}`)
    : RADAR_DIGEST_DEFAULTS.color;
  const liveFooter = footer || RADAR_DIGEST_DEFAULTS.footer;

  const today = new Date();
  const monthLabel = today.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const dateMode = s.digest_date_mode || 'date_tz';
  const tzOffset = Number(s.timezone_offset || 0);
  const tzSign   = tzOffset >= 0 ? '+' : '-';
  const tzHH     = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tzMM     = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  const dateSuffix = dateMode === 'off'        ? ''
                   : dateMode === 'date_only'  ? ` — ${monthLabel}`
                   : ` — ${monthLabel} (UTC${tzSign}${tzHH}:${tzMM})`;

  return (
    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
        Digest Style
      </div>
      <div style={{ fontSize: '11px', color: C.muted, marginBottom: '14px' }}>
        Tailor how the digest embed looks. Empty fields fall back to the news-style defaults shown in the preview.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', alignItems: 'flex-start' }}>
        {/* ── Inputs column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Field label="Title" hint={`Leave empty for default: "${RADAR_DIGEST_DEFAULTS.title}".`}>
            <Input value={title} onChange={setField('digest_title')}
              placeholder={RADAR_DIGEST_DEFAULTS.title} />
          </Field>
          <Field label="Intro" hint="Shown above the per-token list. Leave empty for default.">
            <Textarea value={intro} onChange={setField('digest_intro')}
              placeholder={RADAR_DIGEST_DEFAULTS.intro} rows={2} />
          </Field>
          <FieldRow>
            <Field label="Color" hint="Hex color, e.g. #C8A84E. Empty uses your brand color.">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color"
                  value={liveColor}
                  onChange={e => setField('digest_color')(e.target.value)}
                  style={{ width: '36px', height: '36px', padding: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }} />
                <Input value={color}
                  onChange={setField('digest_color')}
                  placeholder="#C8A84E" />
              </div>
            </Field>
            <Field label="Thumbnail mode" hint="Brand thumbnail, first watchlist coin's logo, or no thumbnail.">
              <select value={thumbMode}
                onChange={e => setField('digest_thumbnail_mode')(e.target.value)}
                style={{ width: '100%', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', fontFamily: 'Sora, sans-serif', outline: 'none', cursor: 'pointer' }}>
                {RADAR_THUMBNAIL_MODES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </FieldRow>
          <Field label="Date display" hint="Whether the title appends today's date and your timezone label.">
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
              {RADAR_DATE_MODES.map(o => {
                const active = (s.digest_date_mode || 'date_tz') === o.value;
                return (
                  <button key={o.value} type="button"
                    onClick={() => setField('digest_date_mode')(o.value)}
                    style={{ flex: 1, background: active ? 'rgba(200,168,78,0.18)' : 'transparent', border: active ? '1px solid rgba(200,168,78,0.4)' : '1px solid transparent', color: active ? C.gold : C.muted, fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600, padding: '6px 8px', borderRadius: '5px', cursor: 'pointer' }}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Footer" hint={`Leave empty for the brand footer ("${RADAR_DIGEST_DEFAULTS.footer}").`}>
            <Input value={footer} onChange={setField('digest_footer')}
              placeholder={RADAR_DIGEST_DEFAULTS.footer} />
          </Field>
        </div>

        {/* ── Live Discord-style preview ── */}
        <div>
          <div style={{ fontSize: '11px', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Preview
          </div>
          <div style={{ background: '#1e1f22', borderRadius: '8px', padding: '14px 16px', borderLeft: `4px solid ${liveColor}`, fontFamily: 'Whitney, Sora, sans-serif' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', marginBottom: '4px' }}>
              📊 {liveTitle}{dateSuffix}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', lineHeight: 1.5, marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
              {liveIntro}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '8px 10px', fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ color: C.muted, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Your Watchlist</div>
              <div>{'BTC      $68,234.00  +2.30%'}</div>
              <div>{'ETH      $3,456.00   -0.80%'}</div>
              <div>{'SOL      $156.40     +5.10%'}</div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {liveFooter}
            </div>
          </div>
          <div style={{ fontSize: '10px', color: C.muted, marginTop: '6px', textAlign: 'center' }}>
            Brand color and brand footer apply unless overridden above.
          </div>
        </div>
      </div>
    </div>
  );
};

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
