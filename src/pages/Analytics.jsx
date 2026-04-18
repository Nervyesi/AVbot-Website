import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  gold:    '#C8A84E',
  goldDim: 'rgba(200,168,78,0.18)',
  blue:    '#5865F2',
  green:   '#3ba55c',
  red:     '#ed4245',
  orange:  '#FF8C42',
  muted:   'rgba(255,255,255,0.45)',
  border:  'rgba(200,168,78,0.12)',
  surface: 'rgba(255,255,255,0.03)',
  grid:    'rgba(255,255,255,0.04)',
};

// ── Tooltip style ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#16161e', border: `1px solid ${C.border}`,
      borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
    }}>
      <div style={{ color: C.muted, marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Sora, sans-serif' };

// ── Mock data generators ───────────────────────────────────────────────────

// Seeded "random" for consistent renders
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function genDayData() {
  const r = seeded(42);
  const hours = [];
  const peakHours = [14, 15, 16, 17, 18, 19, 20, 21]; // 2pm-9pm UTC
  for (let h = 0; h < 24; h++) {
    const isPeak = peakHours.includes(h);
    const base = isPeak ? 280 : 90;
    hours.push({
      label: `${String(h).padStart(2, '0')}:00`,
      messages: Math.round(base + r() * (isPeak ? 160 : 80)),
      joins: Math.round(r() * (isPeak ? 4 : 1.5)),
      voice: parseFloat((r() * (isPeak ? 7 : 2)).toFixed(1)),
    });
  }
  return hours;
}

function genWeekData() {
  const r = seeded(77);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((d, i) => ({
    label: d,
    messages: Math.round(2800 + r() * 2200),
    joins: Math.round(6 + r() * 18),
    leaves: Math.round(1 + r() * 6),
    voice: Math.round(12 + r() * 22),
    points: Math.round(4200 + r() * 5800),
  }));
}

function genMonthData() {
  const r = seeded(13);
  return Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    messages: Math.round(2500 + r() * 2500),
    joins: Math.round(3 + r() * 22),
    leaves: Math.round(r() * 7),
    voice: Math.round(8 + r() * 28),
    points: Math.round(3000 + r() * 8000),
  }));
}

function genYearData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const memberBase = [412, 478, 551, 634, 698, 762, 841, 916, 992, 1058, 1142, 1247];
  const r = seeded(99);
  return months.map((m, i) => ({
    label: m,
    members: memberBase[i],
    joins: Math.round(40 + r() * 90),
    leaves: Math.round(5 + r() * 18),
    messages: Math.round(55000 + r() * 45000),
    voice: Math.round(280 + r() * 220),
    points: Math.round(80000 + r() * 120000),
  }));
}

const DATA = { day: genDayData(), week: genWeekData(), month: genMonthData(), year: genYearData() };

// ── Per-channel message breakdown (static) ───────────────────────────────
const CHANNEL_DATA = [
  { channel: '#general',  messages: 9840 },
  { channel: '#trading',  messages: 6320 },
  { channel: '#raids',    messages: 4180 },
  { channel: '#engage',   messages: 3750 },
  { channel: '#nfts',     messages: 2940 },
  { channel: '#degen',    messages: 2210 },
  { channel: '#ai',       messages: 1680 },
  { channel: '#off-topic',messages: 1290 },
];

// ── Voice channels ────────────────────────────────────────────────────────
const VOICE_DATA = [
  { name: 'General Voice', hours: 184 },
  { name: 'Raid Room',     hours: 127 },
  { name: 'Degens Only',   hours: 94  },
  { name: 'Alpha Room',    hours: 73  },
  { name: 'AFK',           hours: 38  },
];

// ── Top chatters ──────────────────────────────────────────────────────────
const TOP_CHATTERS = [
  { name: 'Nervyesi',      msgs: 1842, badge: '🥇' },
  { name: 'Web3Creator',   msgs: 1540, badge: '🥈' },
  { name: 'DeFi_Builder',  msgs: 1290, badge: '🥉' },
  { name: 'NFT_Alpha',     msgs: 1084, badge: '' },
  { name: 'CryptoNative',  msgs: 940,  badge: '' },
  { name: 'Web3_Trader',   msgs: 817,  badge: '' },
  { name: 'DegenKing',     msgs: 742,  badge: '' },
  { name: 'AIResearcher',  msgs: 698,  badge: '' },
];

// ── E4E activity ──────────────────────────────────────────────────────────
const E4E_WEEK = genWeekData().map(d => ({
  label: d.label,
  engagements: Math.round(120 + Math.random() * 280),
  submitted:   Math.round(15 + Math.random() * 35),
}));

// ── UI primitives ─────────────────────────────────────────────────────────

const Card = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', ...style }}>
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <div style={{ fontSize: '13px', fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
    {children}
  </div>
);

const SectionHeading = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '36px 0 16px' }}>
    <div style={{
      width: '34px', height: '34px', borderRadius: '8px',
      background: C.goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
    }}>{icon}</div>
    <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</span>
  </div>
);

const NumCard = ({ label, value, sub, color = '#fff' }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px',
  }}>
    <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{sub}</div>}
  </div>
);

// ── Timeframe toggle ──────────────────────────────────────────────────────

const TimeToggle = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '3px' }}>
    {['day', 'week', 'month', 'year'].map(t => (
      <button key={t} onClick={() => onChange(t)} style={{
        background: value === t ? C.goldDim : 'transparent',
        border: value === t ? `1px solid rgba(200,168,78,0.3)` : '1px solid transparent',
        color: value === t ? C.gold : C.muted,
        fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 600,
        padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', textTransform: 'capitalize',
        transition: 'all 0.15s',
      }}>{t}</button>
    ))}
  </div>
);

// ── Chart wrapper with header ─────────────────────────────────────────────

const ChartCard = ({ title, timeframe, onTimeframe, height = 220, children }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
      <CardTitle style={{ marginBottom: 0 }}>{title}</CardTitle>
      {onTimeframe && <TimeToggle value={timeframe} onChange={onTimeframe} />}
    </div>
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </Card>
);

// ── Analytics page ────────────────────────────────────────────────────────

const Analytics = () => {
  const [memberTf, setMemberTf] = useState('week');
  const [msgTf,    setMsgTf]    = useState('week');
  const [voiceTf,  setVoiceTf]  = useState('week');
  const [ptsTf,    setPtsTf]    = useState('week');

  const md = DATA[memberTf];
  const ms = DATA[msgTf];
  const vd = DATA[voiceTf];
  const pd = DATA[ptsTf];

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', color: '#fff' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>AmeretaVerse · Mock data — connect bot for live stats</p>
      </div>

      {/* ════════════════════════════════════════
          MEMBERS
      ════════════════════════════════════════ */}
      <SectionHeading icon="👥" title="Members" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Members"    value="1,247" sub="+83 this week" color={C.gold} />
        <NumCard label="Today"            value="+14"   sub="new today" />
        <NumCard label="This Week"        value="+83"   sub="joins" />
        <NumCard label="This Month"       value="+312"  sub="joins" />
        <NumCard label="Verified"         value="1,104" sub="88.5% rate" color={C.green} />
      </div>

      {/* Member growth area chart */}
      <ChartCard title="Member Growth" timeframe={memberTf} onTimeframe={setMemberTf} height={230}>
        <AreaChart data={md} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.gold} stopOpacity={0.25} />
              <stop offset="95%" stopColor={C.gold} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
          <XAxis dataKey="label" tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          {memberTf === 'year'
            ? <Area type="monotone" dataKey="members" name="Members" stroke={C.gold} fill="url(#goldGrad)" strokeWidth={2} dot={false} />
            : <Area type="monotone" dataKey="joins"   name="Joins"   stroke={C.gold} fill="url(#goldGrad)" strokeWidth={2} dot={false} />
          }
          {(memberTf === 'week' || memberTf === 'month') &&
            <Area type="monotone" dataKey="leaves" name="Leaves" stroke={C.red} fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
          }
        </AreaChart>
      </ChartCard>

      {/* ════════════════════════════════════════
          MESSAGES
      ════════════════════════════════════════ */}
      <SectionHeading icon="💬" title="Messages" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Today"        value="3,840"  sub="messages" color={C.gold} />
        <NumCard label="This Week"    value="24,310" sub="messages" />
        <NumCard label="This Month"   value="98,720" sub="messages" />
        <NumCard label="This Year"    value="782,400" sub="messages" />
        <NumCard label="Avg / Day"    value="3,560"  sub="last 30d" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Messages over time */}
        <ChartCard title="Messages Over Time" timeframe={msgTf} onTimeframe={setMsgTf} height={210}>
          <AreaChart data={ms} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="messages" name="Messages" stroke={C.blue} fill="url(#blueGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ChartCard>

        {/* Messages per channel */}
        <ChartCard title="Messages per Channel" height={210}>
          <BarChart data={CHANNEL_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={axisStyle} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="channel" tick={{ ...axisStyle, fontSize: 10 }} width={72} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="messages" name="Messages" fill={C.gold} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Hourly activity heatmap (bar) */}
      <ChartCard title="Most Active Hours (UTC)" height={190}>
        <BarChart data={DATA.day} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
          <XAxis dataKey="label" tick={{ ...axisStyle, fontSize: 9 }} interval={1} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="messages" name="Messages" fill={C.gold} radius={[3, 3, 0, 0]}
            label={false}
          />
        </BarChart>
      </ChartCard>

      {/* Top chatters */}
      <Card style={{ marginTop: '16px' }}>
        <CardTitle>Top Chatters</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px' }}>
          {TOP_CHATTERS.map((u, i) => (
            <div key={u.name} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
            }}>
              <span style={{ fontSize: i < 3 ? '18px' : '13px', width: '22px', textAlign: 'center', color: C.muted, fontWeight: 700 }}>
                {u.badge || `#${i + 1}`}
              </span>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: `hsl(${i * 47},40%,28%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
              }}>{u.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.name}</div>
                <div style={{ fontSize: '11px', color: C.muted }}>{u.msgs.toLocaleString()} msgs</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ════════════════════════════════════════
          VOICE
      ════════════════════════════════════════ */}
      <SectionHeading icon="🎙️" title="Voice" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Today"      value="26h"  sub="total voice" color={C.gold} />
        <NumCard label="This Week"  value="182h" sub="voice hours" />
        <NumCard label="This Month" value="714h" sub="voice hours" />
        <NumCard label="Peak Hour"  value="20:00" sub="UTC most active" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ChartCard title="Voice Activity Over Time" timeframe={voiceTf} onTimeframe={setVoiceTf} height={210}>
          <AreaChart data={vd} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="voice" name="Voice (h)" stroke={C.green} fill="url(#greenGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Most Used Voice Channels" height={210}>
          <BarChart data={VOICE_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={axisStyle} unit="h" />
            <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" name="Hours" fill={C.green} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* ════════════════════════════════════════
          ENGAGEMENT
      ════════════════════════════════════════ */}
      <SectionHeading icon="⚡" title="Engagement" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Points"    value="48,320" sub="all time" color={C.gold} />
        <NumCard label="This Week"       value="9,640"  sub="points" />
        <NumCard label="Raids Done"      value="38"     sub="total" />
        <NumCard label="Active Raids"    value="2"      sub="right now" color={C.orange} />
        <NumCard label="E4E Engagements" value="1,840"  sub="this week" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Points distributed */}
        <ChartCard title="Points Distributed" timeframe={ptsTf} onTimeframe={setPtsTf} height={210}>
          <AreaChart data={pd} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.orange} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.orange} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="points" name="Points" stroke={C.orange} fill="url(#orangeGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ChartCard>

        {/* E4E activity */}
        <ChartCard title="Engage-for-Engage Activity" height={210}>
          <BarChart data={E4E_WEEK} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: C.muted }} />
            <Bar dataKey="engagements" name="Engagements" fill={C.gold}  radius={[3, 3, 0, 0]} />
            <Bar dataKey="submitted"   name="Submitted"   fill={C.blue}  radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div style={{ height: '40px' }} />
    </div>
  );
};

export default Analytics;
