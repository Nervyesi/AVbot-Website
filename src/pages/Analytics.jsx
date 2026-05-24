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

const NoDataYet = ({ dataStarted, height = 210 }) => (
  <div style={{
    height, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '10px', color: C.muted, textAlign: 'center', padding: '0 24px',
  }}>
    <div style={{ fontSize: '26px' }}>📊</div>
    <div style={{ fontSize: '13px', fontWeight: 600 }}>No data yet.</div>
    <div style={{ fontSize: '12px', opacity: 0.7 }}>
      {dataStarted
        ? `Analytics data collection started ${dataStarted}. Check back in 24 hours.`
        : 'Data collection started today. Check back in 24 hours.'}
    </div>
  </div>
);

const NumCard = ({ label, value, sub, color = '#fff' }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px 20px' }}>
    <div style={{ color: C.muted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{label}</div>
    {value === undefined
      ? <div style={{ color: C.muted, fontSize: '13px' }}>No data yet</div>
      : value != null
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

const TrackingBanner = ({ text }) => (
  <div style={{ fontSize: '11px', color: C.muted, marginBottom: '10px', opacity: 0.8 }}>
    📅 {text}
  </div>
);

const ChartCard = ({ title, timeframe, onTimeframe, height = 220, children, noData, dataStarted, banner }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
      <CardTitle style={{ marginBottom: 0 }}>{title}</CardTitle>
      {onTimeframe && <TimeToggle value={timeframe} onChange={onTimeframe} />}
    </div>
    {banner && <TrackingBanner text={banner} />}
    {noData
      ? <NoDataYet dataStarted={dataStarted} height={height} />
      : children
        ? <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
        : <ChartPlaceholder height={height} />
    }
  </Card>
);

// ── Analytics page ────────────────────────────────────────────────────────────

const Analytics = () => {
  const { server } = useContext(DashboardContext);
  const [memberTf, setMemberTf] = useState('week');
  const [jlTf,     setJlTf]     = useState('week');
  const [msgTf,    setMsgTf]    = useState('week');
  const [apiData,  setApiData]  = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    fetchServerAnalytics(server.id, memberTf)
      .then(d => { setApiData(d); setLoading(false); })
      .catch(() => { setApiData(null); setLoading(false); });
  }, [server?.id]); // eslint-disable-line

  const d = apiData;
  const serverName  = server?.name ?? 'No server selected';
  const dataStarted       = d?.data_started ?? null;
  const sc                = d?.stat_cards ?? null;
  const hasData           = d?.has_any_data ?? null;
  const leavesStarted     = d?.leaves_tracking_started ?? null;
  const firstMsgDate      = d?.first_message_tracked_date ?? null;

  // snapVal: null = still loading (show LivePending); undefined = no data yet; value = show it
  const snapVal = (v) => d === null ? null : (!hasData ? undefined : (v ?? 0));

  // Pull timeframe-specific data; null = loading/no API, [] = API returned empty
  const memberRaw  = d?.member_growth?.[memberTf] ?? null;
  const jlRaw      = d?.joins_leaves?.[jlTf]     ?? null;
  const msgRaw     = d?.messages?.[msgTf]         ?? null;

  const memberNoData = Array.isArray(memberRaw) && memberRaw.length === 0;
  const jlNoData     = Array.isArray(jlRaw)     && jlRaw.length === 0;
  const msgNoData    = Array.isArray(msgRaw)    && msgRaw.length === 0;
  const memberData   = memberNoData ? null : memberRaw;
  const jlData       = jlNoData     ? null : jlRaw;
  const msgData      = msgNoData    ? null : msgRaw;

  // Messages per channel: backend sends [{channel_id, name, count}].
  const channelRaw  = d?.messages_per_channel ?? null;
  const channelData = (Array.isArray(channelRaw) && channelRaw.length) ? channelRaw : null;

  // Most active hours: backend sends 24 slots [{hour, label, count}].
  const hoursRaw    = d?.active_hours ?? null;
  const hoursHasData = Array.isArray(hoursRaw) && hoursRaw.some(h => (h.count || 0) > 0);
  const hoursData   = hoursHasData ? hoursRaw : null;

  // Top chatters: backend sends [{user_id, username, count}].
  const chattersRaw = d?.top_chatters ?? null;
  const topChatters = (Array.isArray(chattersRaw) && chattersRaw.length) ? chattersRaw : null;

  // Voice: structured empty state until voice tracking exists.
  const voice       = d?.voice ?? null;
  const voiceAvail  = !!voice?.available;

  // Engagement, split into two independent halves.
  const community   = d?.community_points    ?? null;
  const engageEng   = d?.engage_engagement   ?? null;

  // Member-growth Y domain: scale to the real data range (with padding) so
  // fluctuations at ~10k are visible instead of a flat line pinned to a 0 floor.
  const memberVals  = (Array.isArray(memberData) ? memberData : [])
    .map(p => p.value).filter(v => v != null);
  const memberMin   = memberVals.length ? Math.min(...memberVals) : 0;
  const memberMax   = memberVals.length ? Math.max(...memberVals) : 0;
  const memberPad   = Math.max(1, Math.round((memberMax - memberMin) * 0.15));
  const memberDomain = memberVals.length
    ? [Math.max(0, memberMin - memberPad), memberMax + memberPad]
    : [0, 'auto'];

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', color: '#fff' }}>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Analytics</h2>
        <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>
          {serverName} · {loading ? 'Loading…' : d ? 'Live data' : 'Select a server to view analytics'}
        </p>
      </div>

      {/* ── Members ── */}
      <SectionHeading icon="👥" title="Members" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Members"  value={sc?.total_members != null ? sc.total_members.toLocaleString() : null}  sub="all time" color={C.gold} />
        <NumCard label="Today"          value={snapVal(sc?.today_joins) === undefined ? undefined : snapVal(sc?.today_joins) != null ? `+${snapVal(sc.today_joins)}` : null} sub="new today" />
        <NumCard label="This Week"      value={snapVal(sc?.week_joins) === undefined ? undefined : snapVal(sc?.week_joins) != null ? `+${snapVal(sc.week_joins)}` : null}   sub="joins" />
        <NumCard label="This Month"     value={snapVal(sc?.month_joins) === undefined ? undefined : snapVal(sc?.month_joins) != null ? `+${snapVal(sc.month_joins)}` : null} sub="joins" />
        <NumCard label="Verified"       value={sc?.verified_count != null ? sc.verified_count.toLocaleString() : null}
          sub={sc?.total_members > 0 ? `${((sc.verified_count / sc.total_members) * 100).toFixed(1)}% rate` : null}
          color={C.green} />
      </div>

      <ChartCard title="Member Growth" timeframe={memberTf} onTimeframe={setMemberTf} height={230} noData={memberNoData} dataStarted={dataStarted}>
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
            <YAxis tick={axisStyle} domain={memberDomain} allowDecimals={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" name="Members" stroke={C.gold} fill="url(#goldGrad)" strokeWidth={2} dot={false} connectNulls={false} />
          </AreaChart>
        ) : null}
      </ChartCard>

      <ChartCard
        title="Joins / Leaves"
        timeframe={jlTf}
        onTimeframe={setJlTf}
        height={230}
        noData={jlNoData}
        dataStarted={dataStarted}
        banner={leavesStarted ? `Leaves tracked from ${leavesStarted} — earlier data shows joins only` : null}
      >
        {jlData ? (
          <BarChart data={jlData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: C.muted }} />
            <Bar dataKey="joins"  name="Joins"  fill={C.green} radius={[3, 3, 0, 0]} />
            <Bar dataKey="leaves" name="Leaves" fill={C.red}   radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : null}
      </ChartCard>

      {/* ── Messages ── */}
      <SectionHeading icon="💬" title="Messages" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Today"      value={snapVal(sc?.messages_today) === undefined ? undefined : snapVal(sc?.messages_today) != null ? snapVal(sc.messages_today).toLocaleString() : null} sub="messages" color={C.gold} />
        <NumCard label="This Week"  value={snapVal(sc?.messages_week) === undefined ? undefined : snapVal(sc?.messages_week) != null ? snapVal(sc.messages_week).toLocaleString() : null}   sub="messages" />
        <NumCard label="This Month" value={snapVal(sc?.messages_month) === undefined ? undefined : snapVal(sc?.messages_month) != null ? snapVal(sc.messages_month).toLocaleString() : null} sub="messages" />
        <NumCard label="This Year"  value={snapVal(sc?.messages_year) === undefined ? undefined : snapVal(sc?.messages_year) != null ? snapVal(sc.messages_year).toLocaleString() : null}   sub="messages" />
        <NumCard label="Avg / Day"  value={snapVal(sc?.messages_avg_per_day) === undefined ? undefined : snapVal(sc?.messages_avg_per_day) != null ? snapVal(sc.messages_avg_per_day).toLocaleString() : null} sub="last 30d" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <ChartCard
          title="Messages Over Time"
          timeframe={msgTf}
          onTimeframe={setMsgTf}
          height={210}
          noData={msgNoData}
          dataStarted={dataStarted}
          banner={firstMsgDate ? `Message tracking started ${firstMsgDate}` : null}
        >
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
              <Area type="monotone" dataKey="value" name="Messages" stroke={C.blue} fill="url(#blueGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          ) : null}
        </ChartCard>

        <ChartCard title="Messages per Channel" height={210} noData={channelRaw != null && !channelData} dataStarted={dataStarted}>
          {channelData ? (
            <BarChart data={channelData.slice(0, 10)} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={axisStyle} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} width={84} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Messages" fill={C.gold} radius={[0, 4, 4, 0]} />
            </BarChart>
          ) : null}
        </ChartCard>
      </div>

      <ChartCard title="Most Active Hours (UTC)" height={190} noData={hoursRaw != null && !hoursData} dataStarted={dataStarted}>
        {hoursData ? (
          <BarChart data={hoursData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="label" tick={{ ...axisStyle, fontSize: 9 }} interval={1} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Messages" fill={C.gold} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : null}
      </ChartCard>

      {topChatters ? (
        <Card style={{ marginTop: '16px' }}>
          <CardTitle>Top Chatters</CardTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '10px' }}>
            {topChatters.map((u, i) => {
              const name = u.username || `User ${u.user_id}`;
              return (
              <div key={u.user_id || i} style={{
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
                }}>{name[0]?.toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: '11px', color: C.muted }}>{(u.count || 0).toLocaleString()} msgs</div>
                </div>
              </div>
            );})}
          </div>
        </Card>
      ) : (
        <Card style={{ marginTop: '16px' }}>
          <CardTitle>Top Chatters</CardTitle>
          <div style={{ color: C.muted, fontSize: '13px' }}>No messages tracked yet. This populates as members chat.</div>
        </Card>
      )}

      {/* ── Voice ── */}
      <SectionHeading icon="🎙️" title="Voice" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Total Hours" value={voiceAvail ? `${Math.round((voice.total_minutes || 0) / 60)}h` : undefined} sub="all time" color={C.gold} />
        <NumCard label="Sessions"    value={voiceAvail ? (voice.total_sessions || 0).toLocaleString() : undefined} sub="all time" />
        <NumCard label="Channels"    value={voiceAvail ? (voice.top_channels?.length || 0) : undefined} sub="with activity" />
        <NumCard label="Members"     value={voiceAvail ? (voice.top_users?.length || 0) : undefined} sub="in voice" />
      </div>

      {!voiceAvail && (
        <Card>
          <CardTitle>Voice Activity</CardTitle>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '10px', color: C.muted, textAlign: 'center', padding: '24px',
          }}>
            <div style={{ fontSize: '26px' }}>🎙️</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>No voice data yet.</div>
            <div style={{ fontSize: '12px', opacity: 0.7, maxWidth: '420px' }}>
              Voice activity will appear here once members start using voice channels. Tracking is ready and will populate automatically.
            </div>
          </div>
        </Card>
      )}

      {/* ── Community Points engagement (raids + community points) ── */}
      <SectionHeading icon="⚔️" title="Community Points" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Points Awarded" value={community != null ? (community.points_awarded || 0).toLocaleString() : null} sub="from raids" color={C.gold} />
        <NumCard label="Points Offered" value={community != null ? (community.points_offered || 0).toLocaleString() : null} sub="all raids" />
        <NumCard label="Raids Done"     value={community != null ? (community.total_raids || 0).toLocaleString() : null}   sub="total" />
        <NumCard label="Active Raids"   value={community != null ? (community.active_raids || 0).toLocaleString() : null}  sub="right now" color={C.orange} />
        <NumCard label="Participants"   value={community != null ? (community.participants || 0).toLocaleString() : null}  sub="unique" color={C.green} />
      </div>

      <Card>
        <CardTitle>Top Community Point Holders</CardTitle>
        {community?.top_holders?.length ? (
          <ResponsiveContainer width="100%" height={Math.max(120, community.top_holders.length * 34)}>
            <BarChart data={community.top_holders.map(h => ({ name: h.username || `User ${h.user_id}`, points: h.points }))}
              layout="vertical" margin={{ top: 0, right: 16, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={axisStyle} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
              <YAxis type="category" dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="points" name="Points" fill={C.gold} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: C.muted, fontSize: '13px' }}>No community points awarded yet. Run a raid to get started.</div>
        )}
      </Card>

      {/* ── Engage-for-Engage engagement (engage module, separate) ── */}
      <SectionHeading icon="🔁" title="Engage for Engage" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '16px' }}>
        <NumCard label="Engage Points"  value={engageEng != null ? (engageEng.total_points || 0).toLocaleString() : null} sub="all time" color={C.gold} />
        <NumCard label="Engagements"    value={engageEng != null ? (engageEng.total_engagements || 0).toLocaleString() : null} sub="confirmed" />
        <NumCard label="Active Links"   value={engageEng != null ? (engageEng.active_links || 0).toLocaleString() : null}  sub="in pool" color={C.orange} />
        <NumCard label="Total Links"    value={engageEng != null ? (engageEng.total_links || 0).toLocaleString() : null}   sub="all time" />
        <NumCard label="Participants"   value={engageEng != null ? (engageEng.participants || 0).toLocaleString() : null}  sub="unique" color={C.green} />
      </div>

      <Card>
        <CardTitle>Engage for Engage Overview</CardTitle>
        {engageEng && (engageEng.total_links || engageEng.total_engagements) ? (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={[
                { label: 'Links',       value: engageEng.total_links || 0 },
                { label: 'Active',      value: engageEng.active_links || 0 },
                { label: 'Engagements', value: engageEng.total_engagements || 0 },
                { label: 'Participants',value: engageEng.participants || 0 },
              ]}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="label" tick={axisStyle} />
              <YAxis tick={axisStyle} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Engage" fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: C.muted, fontSize: '13px' }}>No engage-for-engage activity yet.</div>
        )}
      </Card>

      <div style={{ height: '40px' }} />
    </div>
  );
};

export default Analytics;
