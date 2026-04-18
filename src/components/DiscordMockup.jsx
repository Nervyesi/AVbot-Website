import React from 'react';

// ── Primitives ────────────────────────────────────────────────────────────

const BotBadge = () => (
  <span style={{
    background: '#5865F2', color: 'white',
    fontSize: '10px', fontWeight: 700,
    padding: '1px 5px', borderRadius: '3px',
    letterSpacing: '0.03em', marginLeft: '4px',
  }}>BOT</span>
);

const DiscordBtn = ({ label, style = 'primary', emoji }) => {
  const map = {
    primary:   { background: '#5865F2', color: 'white' },
    success:   { background: '#248046', color: 'white' },
    danger:    { background: '#da3744', color: 'white' },
    secondary: { background: '#4f545c', color: '#dcddde' },
    gold:      { background: 'linear-gradient(135deg,#C8A84E,#94730D)', color: '#0A0A0F' },
  };
  return (
    <button style={{
      ...map[style], border: 'none', borderRadius: '4px',
      padding: '6px 14px', fontSize: '13px', fontWeight: 600,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      gap: '4px', fontFamily: 'inherit',
    }}>
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
};

const Embed = ({ color = '#94730D', title, children, fields, footer, buttons, cols = 2 }) => (
  <div style={{
    display: 'flex', borderLeft: `4px solid ${color}`,
    background: '#2f3136', borderRadius: '4px',
    padding: '12px 14px', marginTop: '4px', maxWidth: '440px',
  }}>
    <div style={{ flex: 1 }}>
      {title && (
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
          {title}
        </div>
      )}
      {children && (
        <div style={{ color: '#dcddde', fontSize: '13px', lineHeight: 1.55, marginBottom: fields || buttons ? '10px' : 0 }}>
          {children}
        </div>
      )}
      {fields && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '8px', marginBottom: buttons ? '10px' : 0,
        }}>
          {fields.map((f, i) => (
            <div key={i}>
              <div style={{ color: '#b9bbbe', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.name}</div>
              <div style={{ color: '#dcddde', fontSize: '13px', marginTop: '2px' }}>{f.value}</div>
            </div>
          ))}
        </div>
      )}
      {buttons && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {buttons.map((b, i) => <DiscordBtn key={i} {...b} />)}
        </div>
      )}
      {footer && (
        <div style={{
          color: '#72767d', fontSize: '11px',
          marginTop: '10px', borderTop: '1px solid #3f4147', paddingTop: '8px',
        }}>{footer}</div>
      )}
    </div>
  </div>
);

// ── Individual mockup definitions ─────────────────────────────────────────

const VerificationMockup = () => (
  <Embed
    title="🔐 Verification Required"
    fields={[
      { name: '⏱ Timeout',  value: '5 minutes' },
      { name: '🔄 Attempts', value: '3 remaining' },
    ]}
    buttons={[{ label: 'Verify', style: 'gold', emoji: '✅' }]}
    footer="AVbot Verification • Powered by AVbot"
  >
    Welcome to the server. Verify your humanity to unlock all channels.
    Click the button below to complete the captcha challenge.
  </Embed>
);

const RoleSelectionMockup = () => (
  <Embed
    title="🎭 Choose Your Role"
    buttons={[
      { label: 'Creator',   style: 'gold',      emoji: '🎨' },
      { label: 'Community', style: 'secondary',  emoji: '👥' },
    ]}
    footer="AVbot Role System • You can change this at any time"
  >
    Select how you participate in AmeretaVerse. Creators get access to the
    application flow and exclusive channels. Community members join the
    engage and raid rooms.
  </Embed>
);

const CreatorTicketMockup = () => (
  <>
    {/* Step 1 — Application form (what the creator sees) */}
    <Embed
      title="📋 Creator Application Form"
      cols={1}
      fields={[
        { name: 'Name / Display Name',  value: 'Web3Creator' },
        { name: 'X (Twitter) Profile',  value: 'x.com/Web3Creator' },
        { name: 'Follower Count',        value: '12,400' },
        { name: 'Engagement Score',      value: '4.2 %  •  Avg 520 likes/post' },
        { name: 'Niche & About',         value: 'NFT drops, DeFi education. Daily posts since 2022.' },
      ]}
      footer="Application saved • Ticket #0042"
    >
      Fill in your details below. An admin will review your application
      and respond within 24 hours.
    </Embed>

    {/* Step 2 — Admin review (separate message) */}
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ width: '40px', flexShrink: 0 }} />
        <Embed
          title="📬 New Creator Application — Review Required"
          color="#5865F2"
          fields={[
            { name: 'Applicant',   value: '@Web3Creator' },
            { name: 'Followers',   value: '12,400' },
            { name: 'Score',       value: '4.2 %' },
            { name: 'Niche',       value: 'NFT / DeFi' },
          ]}
          buttons={[
            { label: 'Approve',  style: 'success',   emoji: '✅' },
            { label: 'Reject',   style: 'danger',    emoji: '❌' },
            { label: 'Details',  style: 'secondary', emoji: '📄' },
          ]}
          footer="Ticket #0042 • Pending review"
        >
          A new creator has applied. Review their profile before approving.
        </Embed>
      </div>
    </div>
  </>
);

const RaidMockup = () => (
  <Embed
    title="⚔️ Raid Alert — Join Now"
    fields={[
      { name: '🎯 Target',      value: '@Web3ProjectX' },
      { name: '⭐ Reward',      value: '50 pts per action' },
      { name: '⏰ Ends In',     value: '14 minutes' },
      { name: '👥 Joined',      value: '38 members' },
    ]}
    buttons={[
      { label: 'Like',    style: 'primary',  emoji: '❤️' },
      { label: 'Comment', style: 'primary',  emoji: '💬' },
      { label: 'Retweet', style: 'primary',  emoji: '🔁' },
      { label: 'Done',    style: 'success',  emoji: '✅' },
    ]}
    footer="AVbot Raid System • React fast to earn points"
  >
    A raid has been launched. Engage with the target post and click Done
    when finished to claim your points.
  </Embed>
);

const EngageMockup = () => (
  <Embed
    title="🔄 Engage-for-Engage Pool"
    cols={1}
    fields={[
      { name: '🐦 @Creator_Alpha',  value: 'New NFT drop — drops in 1 hour  •  48 pts' },
      { name: '🐦 @DeFi_Builder',   value: 'Thread on L2 scaling — must read  •  32 pts' },
      { name: '🐦 @Web3_Native',    value: 'Community AMA tomorrow — share it  •  28 pts' },
    ]}
    buttons={[
      { label: 'Start Engaging', style: 'gold',      emoji: '🚀' },
      { label: 'My Stats',       style: 'secondary', emoji: '📊' },
    ]}
    footer="12 tweets available • 3 engagements remaining today"
  >
    Engage with tweets below to earn points. Submit your own tweet to add
    it to the pool.
  </Embed>
);

const SectionRolesMockup = () => (
  <Embed
    title="🏠 Server Sections"
    buttons={[
      { label: 'NFTs',   style: 'gold',      emoji: '🖼️' },
      { label: 'Engage', style: 'primary',   emoji: '🔄' },
      { label: 'Trade',  style: 'success',   emoji: '📈' },
      { label: 'Degen',  style: 'danger',    emoji: '🎲' },
      { label: 'AI',     style: 'secondary', emoji: '🤖' },
    ]}
    footer="AVbot Sections • Toggle any section on or off at any time"
  >
    Pick your interests to unlock the matching channels. Select as many
    as you like — you can change these whenever you want.
  </Embed>
);

// ── Mockup registry ───────────────────────────────────────────────────────

const MOCKUPS = {
  verification:    <VerificationMockup />,
  roleSelection:   <RoleSelectionMockup />,
  creatorTicket:   <CreatorTicketMockup />,
  raidSystem:      <RaidMockup />,
  engageForEngage: <EngageMockup />,
  sectionRoles:    <SectionRolesMockup />,
};

// ── Discord window shell ──────────────────────────────────────────────────

const DiscordMockup = ({ type }) => (
  <div style={{
    background: '#36393f', borderRadius: '12px', padding: '16px',
    fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
    minWidth: '320px', maxWidth: '480px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.05)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#C8A84E,#94730D)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>⚡</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{ color: '#C8A84E', fontWeight: 700, fontSize: '14px' }}>AVbot</span>
          <BotBadge />
          <span style={{ color: '#72767d', fontSize: '11px', marginLeft: '4px' }}>
            Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {MOCKUPS[type]}
      </div>
    </div>
  </div>
);

export default DiscordMockup;
