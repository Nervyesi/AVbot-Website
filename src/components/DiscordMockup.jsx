import React from 'react';

const BotBadge = () => (
  <span style={{
    background: '#5865F2',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '3px',
    letterSpacing: '0.03em',
    marginLeft: '4px',
    verticalAlign: 'middle',
  }}>BOT</span>
);

const DiscordButton = ({ label, style = 'primary', emoji }) => {
  const styles = {
    primary: { background: '#5865F2', color: 'white' },
    success: { background: '#2d7d46', color: 'white' },
    danger: { background: '#da3744', color: 'white' },
    secondary: { background: '#4f545c', color: '#dcddde' },
    gold: { background: 'linear-gradient(135deg, #C8A84E, #94730D)', color: '#0A0A0F' },
  };
  return (
    <button style={{
      ...styles[style],
      border: 'none',
      borderRadius: '4px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'inherit',
    }}>
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
};

const Embed = ({ color = '#94730D', title, description, fields, footer, buttons, thumbnail }) => (
  <div style={{
    display: 'flex',
    borderLeft: `4px solid ${color}`,
    background: '#2f3136',
    borderRadius: '4px',
    padding: '10px 14px',
    marginTop: '4px',
    maxWidth: '440px',
    gap: '10px',
  }}>
    <div style={{ flex: 1 }}>
      {title && (
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{ color: '#dcddde', fontSize: '13px', lineHeight: 1.5, marginBottom: '8px' }}>
          {description}
        </div>
      )}
      {fields && (
        <div style={{ display: 'grid', gridTemplateColumns: fields.length > 2 ? '1fr 1fr' : '1fr', gap: '6px', marginBottom: '8px' }}>
          {fields.map((f, i) => (
            <div key={i}>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{f.name}</div>
              <div style={{ color: '#dcddde', fontSize: '12px' }}>{f.value}</div>
            </div>
          ))}
        </div>
      )}
      {buttons && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {buttons.map((b, i) => (
            <DiscordButton key={i} {...b} />
          ))}
        </div>
      )}
      {footer && (
        <div style={{ color: '#72767d', fontSize: '11px', marginTop: '8px', borderTop: '1px solid #3f4147', paddingTop: '6px' }}>
          {footer}
        </div>
      )}
    </div>
    {thumbnail && (
      <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #C8A84E, #94730D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
        }}>🤖</div>
      </div>
    )}
  </div>
);

const mockups = {
  verification: (
    <Embed
      title="🔐 Verification Required"
      description="To access the server, you must verify your humanity.\n\nClick the button below and complete the captcha challenge."
      fields={[
        { name: '⏱ Timeout', value: '5 minutes' },
        { name: '🔄 Attempts', value: '3 remaining' },
      ]}
      footer="AVbot Verification System • Powered by AVbot"
      buttons={[
        { label: 'Verify Now', style: 'gold', emoji: '✅' },
      ]}
    />
  ),
  roleSelection: (
    <Embed
      title="🎭 Select Your Role"
      description="Choose how you participate in our community.\nYou can change this at any time."
      footer="AVbot Role System"
      buttons={[
        { label: 'Creator', style: 'gold', emoji: '🎨' },
        { label: 'Community', style: 'secondary', emoji: '👥' },
      ]}
    />
  ),
  creatorTicket: (
    <Embed
      title="📋 Creator Application"
      description="**Username:** @Web3Creator\n**Platform:** Twitter/X\n**Followers:** 12,400\n**Content Type:** NFT, DeFi\n**Why join?** I create daily Web3 content and want to grow with this community."
      fields={[
        { name: '📊 Engagement Rate', value: '4.2%' },
        { name: '📅 Applied', value: 'Today' },
      ]}
      footer="Ticket #0042 • Review carefully"
      buttons={[
        { label: 'Approve', style: 'success', emoji: '✅' },
        { label: 'Reject', style: 'danger', emoji: '❌' },
        { label: 'More Info', style: 'secondary', emoji: '❓' },
      ]}
    />
  ),
  raidSystem: (
    <Embed
      title="⚔️ RAID ALERT — Join Now!"
      description="**Target:** @Web3ProjectX\n**Reward:** 50 points per action\n\n> 🔗 https://twitter.com/Web3ProjectX/status/123..."
      fields={[
        { name: '⏰ Ends In', value: '14 minutes' },
        { name: '👥 Participants', value: '38 joined' },
        { name: '🎯 Goal', value: '500 engagements' },
        { name: '✅ Completed', value: '312 so far' },
      ]}
      footer="AVbot Raid System • React fast!"
      buttons={[
        { label: 'Like', style: 'primary', emoji: '❤️' },
        { label: 'Comment', style: 'primary', emoji: '💬' },
        { label: 'Retweet', style: 'primary', emoji: '🔁' },
        { label: 'Done', style: 'success', emoji: '✅' },
      ]}
    />
  ),
  engageForEngage: (
    <Embed
      title="🔄 Engage-for-Engage Pool"
      description="Active tweets waiting for engagement. React to earn points and grow together!"
      fields={[
        { name: '🐦 @Creator_Alpha', value: 'New NFT drop announcement — 48 pts' },
        { name: '🐦 @DeFi_Builder', value: 'Thread on L2 scaling — 32 pts' },
        { name: '🐦 @Web3_Native', value: 'Community AMA tomorrow — 28 pts' },
      ]}
      footer="12 tweets available • Your turn: 3 remaining"
      buttons={[
        { label: 'Start Engaging', style: 'gold', emoji: '🚀' },
        { label: 'My Stats', style: 'secondary', emoji: '📊' },
      ]}
    />
  ),
  sectionRoles: (
    <Embed
      title="🏠 Server Sections"
      description="Pick your interests to unlock the right channels. You can select multiple."
      footer="AVbot Section System • Toggle anytime"
      buttons={[
        { label: 'NFTs', style: 'gold', emoji: '🖼️' },
        { label: 'Engage', style: 'primary', emoji: '🔄' },
        { label: 'Trade', style: 'success', emoji: '📈' },
        { label: 'Degen', style: 'danger', emoji: '🎲' },
        { label: 'AI', style: 'secondary', emoji: '🤖' },
      ]}
    />
  ),
};

const DiscordMockup = ({ type }) => {
  return (
    <div style={{
      background: '#36393f',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
      minWidth: '320px',
      maxWidth: '480px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #C8A84E, #94730D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span style={{ color: '#C8A84E', fontWeight: 700, fontSize: '14px' }}>AVbot</span>
            <BotBadge />
            <span style={{ color: '#72767d', fontSize: '11px', marginLeft: '4px' }}>Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {mockups[type]}
        </div>
      </div>
    </div>
  );
};

export default DiscordMockup;
