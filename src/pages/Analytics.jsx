import React, { useState, useEffect, useContext } from 'react';
import { DashboardContext } from '../DashboardContext';
import { fetchServerAnalytics } from '../api';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

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

// ── Live placeholder ──────────────────────────────────────────────────────────

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

const NumCard = ({ label, value, sub, color = '#fff' }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px' }}>
    <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{label}</div>
    {value != null
      ? <>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '12px', color: C.muted, marginTop: '4px' }}>{sub}</div>}
        </>
      : <LivePending />
    }
  </div>
);

const ChartPlaceholder = ({ height = 210 }) => (
  <div style={{
    height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '12px', color: C.muted,
  }}>
    <LivePending />
    <div style={{ fontSize: '12px', opacity: 0.7 }}>Chart data will appear here once the bot is connected</div>
  </div>
);

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

const ChartCard = ({ title, timeframe, onTimeframe, height = 220, children }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
      <CardTitle style={{ marginBottom: 0 }}>{title}</CardTitle>
      {onTimeframe && <TimeToggle value={timeframe} onChange={onTimeframe} />}
    </div>
    {children ? (
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    ) : (
      <ChartPlaceholder height={height} />
    )}
  </Card>
);

// ── Analytics page ────────────────────────────────────────────────────────────

const Analytics = () => {
  const { server } = useContext(DashboardContext);
  const [memberTf, setMemberTf] = useState('week');
  const [msgTf,    setMsgTf]    = useState('week');
  const [voiceTf,  setVoiceTf]  = useState('week');
  const [ptsTf,    setPtsTf]    = useState('week');
  const [apiData,  setApiData]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    fetchServerAnalytics(server.id)
      .then(d => { setApiData(d); setLoading(false); })
      .catch(() => { setApiData(null); setLoading(false); });
  }, [server?.id]);

  const d = apiData;
  const serverName = server?.name ?? 'No server selected';

  // Pull timeframe-specific data from API if available
  const memberData  = d?.member_growth?.[memberTf] ?? null;
  const msgData     = d?.messages?.[msgTf] ?? null;
  const voiceData   = d?.voice?.[voiceTf] ?? null;
  const pointsData  = d?.points?.[ptsTf] ?? null;
  const channelData = d?.channels ?? null;
  const voiceChData = d?.voice_channels ?? null;
  const topChatters = d?.top_chatters ?? null;
  const e4eData     = d?.e4e ?? null;

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', color: '#fff' }}>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
          {serverName} · {loading ? 'Loading…' : d ? 'Live data' : 'Connect bot to see live data'}
        </p>
      </div>

      {/* ── Members ── */}
      <SectionHeading icon="👥" title="Members" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Members"  value={d?.member_count?.toLocaleString()}        sub="all time"       color={C.gold} />
        <NumCard label="Today"          value={d?.joins_today != null ? `+${d.joins_today}` : null} sub="new today" />
        <NumCard label="This Week"      value={d?.joins_week != null ? `+${d.joins_week}` : null}   sub="joins" />
        <NumCard label="This Month"     value={d?.joins_month != null ? `+${d.joins_month}` : null} sub="joins" />
        <NumCard label="Verified"       value={d?.verified_count?.toLocaleString()}      sub={d ? `${((d.verified_count / d.member_count) * 100).toFixed(1)}% rate` : null} color={C.green} />
      </div>

      <ChartCard title="Member Growth" timeframe={memberTf} onTimeframe={setMemberTf} height={230}>
        {memberData ? (
          <AreaChart data={memberData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
            <Area type="monotone" dataKey={memberTf === 'year' ? 'members' : 'joins'} name={memberTf === 'year' ? 'Members' : 'Joins'} stroke={C.gold} fill="url(#goldGrad)" strokeWidth={2} dot={false} />
            {(memberTf === 'week' || memberTf === 'month') &&
              <Area type="monotone" dataKey="leaves" name="Leaves" stroke={C.red} fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            }
          </AreaChart>
        ) : null}
      </ChartCard>

      {/* ── Messages ── */}
      <SectionHeading icon="💬" title="Messages" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Today"      value={d?.messages_today?.toLocaleString()}  sub="messages" color={C.gold} />
        <NumCard label="This Week"  value={d?.messages_week?.toLocaleString()}   sub="messages" />
        <NumCard label="This Month" value={d?.messages_month?.toLocaleString()}  sub="messages" />
        <NumCard label="This Year"  value={d?.messages_year?.toLocaleString()}   sub="messages" />
        <NumCard label="Avg / Day"  value={d?.messages_avg_day?.toLocaleString()} sub="last 30d" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <ChartCard title="Messages Over Time" timeframe={msgTf} onTimeframe={setMsgTf} height={210}>
          {msgData ? (
            <AreaChart data={msgData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
          ) : null}
        </ChartCard>

        <ChartCard title="Messages per Channel" height={210}>
          {channelData ? (
            <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={axisStyle} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="channel" tick={{ ...axisStyle, fontSize: 10 }} width={72} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="messages" name="Messages" fill={C.gold} radius={[0, 4, 4, 0]} />
            </BarChart>
          ) : null}
        </ChartCard>
      </div>

      <ChartCard title="Most Active Hours (UTC)" height={190}>
        {d?.hourly ? (
          <BarChart data={d.hourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={{ ...axisStyle, fontSize: 9 }} interval={1} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="messages" name="Messages" fill={C.gold} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : null}
      </ChartCard>

      {topChatters ? (
        <Card style={{ marginTop: '16px' }}>
          <CardTitle>Top Chatters</CardTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px' }}>
            {topChatters.map((u, i) => (
              <div key={u.name} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
              }}>
                <span style={{ fontSize: i < 3 ? '18px' : '13px', width: '22px', textAlign: 'center', color: C.muted, fontWeight: 700 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${i * 47},40%,28%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
                }}>{u.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{u.name}</div>
                  <div style={{ fontSize: '11px', color: C.muted }}>{u.msgs?.toLocaleString()} msgs</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card style={{ marginTop: '16px' }}>
          <CardTitle>Top Chatters</CardTitle>
          <LivePending />
        </Card>
      )}

      {/* ── Voice ── */}
      <SectionHeading icon="🎙️" title="Voice" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Today"      value={d?.voice_today != null ? `${d.voice_today}h` : null}  sub="total voice" color={C.gold} />
        <NumCard label="This Week"  value={d?.voice_week != null ? `${d.voice_week}h` : null}    sub="voice hours" />
        <NumCard label="This Month" value={d?.voice_month != null ? `${d.voice_month}h` : null}  sub="voice hours" />
        <NumCard label="Peak Hour"  value={d?.voice_peak_hour ?? null}  sub="UTC most active" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ChartCard title="Voice Activity Over Time" timeframe={voiceTf} onTimeframe={setVoiceTf} height={210}>
          {voiceData ? (
            <AreaChart data={voiceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
          ) : null}
        </ChartCard>

        <ChartCard title="Most Used Voice Channels" height={210}>
          {voiceChData ? (
            <BarChart data={voiceChData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={axisStyle} unit="h" />
              <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" name="Hours" fill={C.green} radius={[0, 4, 4, 0]} />
            </BarChart>
          ) : null}
        </ChartCard>
      </div>

      {/* ── Engagement ── */}
      <SectionHeading icon="⚡" title="Engagement" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Points"    value={d?.points_total?.toLocaleString()}   sub="all time" color={C.gold} />
        <NumCard label="This Week"       value={d?.points_week?.toLocaleString()}    sub="points" />
        <NumCard label="Raids Done"      value={d?.raids_total?.toLocaleString()}    sub="total" />
        <NumCard label="Active Raids"    value={d?.raids_active?.toLocaleString()}   sub="right now" color={C.orange} />
        <NumCard label="E4E Engagements" value={d?.e4e_week?.toLocaleString()}       sub="this week" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <ChartCard title="Points Distributed" timeframe={ptsTf} onTimeframe={setPtsTf} height={210}>
          {pointsData ? (
            <AreaChart data={pointsData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
          ) : null}
        </ChartCard>

        <ChartCard title="Engage-for-Engage Activity" height={210}>
          {e4eData ? (
            <BarChart data={e4eData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="label" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: C.muted }} />
              <Bar dataKey="engagements" name="Engagements" fill={C.gold} radius={[3, 3, 0, 0]} />
              <Bar dataKey="submitted"   name="Submitted"   fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : null}
        </ChartCard>
      </div>

      <div style={{ height: '40px' }} />
    </div>
  );
};

export default Analytics;
