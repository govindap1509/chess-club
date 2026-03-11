import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BadgeChip from '@/components/BadgeChip';
import Avatar from '@/components/Avatar';
import EventSignupButton from './EventSignupButton';
import RatingChart from './RatingChart';
import { getBadge } from '@/lib/badges';

// Badge tier boundaries for progress bar
type Tier = { min: number; max: number; next: string | null; nextMin: number | null };
const TIERS: Tier[] = [
  { min: 0,    max: 899,  next: 'Rising Player', nextMin: 900  },
  { min: 900,  max: 999,  next: 'Club Player',   nextMin: 1000 },
  { min: 1000, max: 1099, next: 'Advanced',       nextMin: 1100 },
  { min: 1100, max: 1199, next: 'Master',          nextMin: 1200 },
  { min: 1200, max: 3000, next: null,              nextMin: null },
];

function getRatingProgress(rating: number | null | undefined) {
  const r = rating ?? 0;
  const tier: Tier = TIERS.find((t) => r >= t.min && r <= t.max) ?? TIERS[0];
  if (!tier.next || tier.nextMin === null) return { pct: 100, pointsLeft: 0, nextBadge: null };
  const range = tier.max - tier.min + 1;
  const pct = Math.min(100, Math.round(((r - tier.min) / range) * 100));
  const pointsLeft = tier.nextMin - r;
  return { pct, pointsLeft, nextBadge: tier.next };
}

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_BG = ['#FEF9C3', '#F1F5F9', '#FEF3E8'];
const MEDAL_BORDER = ['#FDE047', '#CBD5E1', '#FDBA74'];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [
    { data: profile },
    { data: allEvents },
    { data: mySignupRows },
    { data: myMessages },
    { data: leaderTop },
    { data: allMyMatches },
    { data: ratingHistory },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }),
    supabase.from('event_signups').select('event_id').eq('user_id', user.id),
    supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, name, chess_rating, profile_photo').order('chess_rating', { ascending: false }).limit(5),
    supabase
      .from('match_results')
      .select('id, event_id, player1_id, player2_id, winner_id, created_at, events(title), p1:profiles!match_results_player1_id_fkey(name), p2:profiles!match_results_player2_id_fkey(name)')
      .or(`player1_id.eq.${user!.id},player2_id.eq.${user!.id}`)
      .order('created_at', { ascending: false }),
    supabase
      .from('rating_history')
      .select('rating, created_at, note')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true })
      .limit(50),
  ]);

  const mySignupSet = new Set((mySignupRows ?? []).map((s: any) => s.event_id));

  const totalMatches = allMyMatches?.length ?? 0;
  const wins = allMyMatches?.filter((m: any) => m.winner_id === user!.id).length ?? 0;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const rating = profile?.chess_rating ?? null;
  const badge = getBadge(rating);
  const { pct, pointsLeft, nextBadge } = getRatingProgress(rating);

  const statCards = [
    { label: 'Chess Rating',   value: rating ?? '—', icon: '♟',  bg: '#E8F0FE', color: '#1A73E8', border: '#A8C7FA' },
    { label: 'Matches Played', value: totalMatches,  icon: '⚔️', bg: '#E6F4EA', color: '#137333', border: '#A8DAB5' },
    { label: 'Wins',           value: wins,          icon: '🏆', bg: '#FEF3C7', color: '#B45309', border: '#FCD34D' },
    { label: 'Win Rate',       value: winRate + '%', icon: '📈', bg: '#F3E8FF', color: '#7C3AED', border: '#C4B5FD' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 60px', display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* WELCOME STRIP */}
      <div style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: '0 4px 20px rgba(26,115,232,0.25)' }}>
        <Avatar src={profile?.profile_photo} name={profile?.name} size={68} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>Welcome back</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', marginBottom: 8, lineHeight: 1.1 }}>
            {profile?.name ?? user!.email}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {profile?.class && (
              <span style={{ fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '3px 10px', borderRadius: 100 }}>
                {profile.class}
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 600, background: badge.bgHex, color: badge.colorHex, padding: '3px 10px', borderRadius: 100 }}>
              {badge.label}
            </span>
          </div>
        </div>
        <Link
          href="/profile"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}
        >
          ✏️ Edit Profile
        </Link>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: s.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RATING PROGRESS */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>Rating Progress</span>
            <BadgeChip rating={rating} />
          </div>
          {nextBadge ? (
            <span style={{ fontSize: 13, color: '#5F6368' }}>
              <strong style={{ color: '#1A73E8' }}>{pointsLeft} pts</strong> to reach {nextBadge}
            </span>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 600, color: '#B45309' }}>🏆 Master tier — top level reached!</span>
          )}
        </div>
        <div style={{ background: '#F1F3F4', borderRadius: 100, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${badge.colorHex}, ${badge.colorHex}CC)`, borderRadius: 100 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#80868B' }}>{rating ?? 0}</span>
          {nextBadge && <span style={{ fontSize: 11, color: '#80868B' }}>{TIERS.find(t => t.next === nextBadge)?.nextMin}</span>}
        </div>
      </div>

      {/* RATING HISTORY CHART */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#202124', marginBottom: 16 }}>📊 Rating History</h2>
        <RatingChart data={(ratingHistory ?? []) as { rating: number; created_at: string; note?: string | null }[]} />
      </div>

      {/* UPCOMING EVENTS */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#202124', marginBottom: 20 }}>📅 Upcoming Events</h2>
        {allEvents && allEvents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {allEvents.map((ev) => {
              const joined = mySignupSet.has(ev.id);
              const parts = ev.description?.split('|') ?? [];
              const desc = parts[0]?.trim();
              const venue = parts.find((p: string) => p.includes('Venue'))?.replace('Venue:', '').trim();
              const time = parts.find((p: string) => p.includes('Time'))?.replace('Time:', '').trim();
              return (
                <div key={ev.id} style={{ border: `2px solid ${joined ? '#A8DAB5' : '#E8EAED'}`, background: joined ? '#F0FBF4' : '#FAFAFA', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1A73E8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(ev.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>{ev.title}</p>
                  {desc && <p style={{ fontSize: 12, color: '#5F6368', lineHeight: 1.5 }}>{desc}</p>}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {venue && <span style={{ fontSize: 11, color: '#3C4043' }}>📍 {venue}</span>}
                    {time && <span style={{ fontSize: 11, color: '#3C4043' }}>🕑 {time}</span>}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <EventSignupButton eventId={ev.id} alreadyJoined={joined} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#80868B' }}>No upcoming events.</p>
        )}
      </section>

      {/* MATCH RESULTS */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#202124', marginBottom: 20 }}>⚔️ My Match Results</h2>
        {allMyMatches && allMyMatches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allMyMatches.map((m: any) => {
              const isP1 = m.player1_id === user!.id;
              const opponentName = isP1 ? (m.p2?.name ?? 'Unknown') : (m.p1?.name ?? 'Unknown');
              const result = m.winner_id === null ? 'Draw' : m.winner_id === user!.id ? 'Won' : 'Lost';
              const rs: Record<string, { color: string; bg: string; icon: string }> = {
                Won:  { color: '#137333', bg: '#E6F4EA', icon: '✅' },
                Lost: { color: '#C5221F', bg: '#FCE8E6', icon: '❌' },
                Draw: { color: '#B45309', bg: '#FEF3C7', icon: '🤝' },
              };
              const st = rs[result];
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #E8EAED', borderRadius: 10, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{st.icon}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>vs {opponentName}</p>
                      <p style={{ fontSize: 12, color: '#5F6368' }}>
                        {m.events?.title ? m.events.title + ' · ' : ''}
                        {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '5px 14px', borderRadius: 100 }}>
                    {result}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#80868B' }}>No match results yet.</p>
        )}
      </section>

      {/* TOP PLAYERS */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#202124', marginBottom: 20 }}>🏅 Top Players</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaderTop?.map((p, i) => {
            const isMe = p.id === user!.id;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: isMe ? '#E8F0FE' : i < 3 ? MEDAL_BG[i] : '#FAFAFA', border: `1.5px solid ${isMe ? '#A8C7FA' : i < 3 ? MEDAL_BORDER[i] : '#E8EAED'}` }}>
                <span style={{ width: 28, textAlign: 'center', fontSize: 18, flexShrink: 0 }}>
                  {i < 3 ? MEDAL[i] : <span style={{ fontSize: 13, fontWeight: 600, color: '#80868B' }}>{i + 1}</span>}
                </span>
                <Avatar src={p.profile_photo} name={p.name} size={32} />
                <span style={{ fontSize: 14, fontWeight: isMe ? 700 : 500, color: '#202124', flex: 1 }}>
                  {p.name ?? 'Anonymous'}{isMe ? ' (you)' : ''}
                </span>
                <span style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#1A73E8' }}>{p.chess_rating ?? '—'}</span>
                <BadgeChip rating={p.chess_rating} />
              </div>
            );
          })}
        </div>
      </section>

      {/* MESSAGES */}
      <section className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#202124' }}>💬 Messages to Admin</h2>
          <Link href="/messages/new" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>+ New Message</Link>
        </div>
        {myMessages && myMessages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myMessages.map((m) => (
              <div key={m.id} style={{ border: '1px solid #DADCE0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8F9FA', borderBottom: '1px solid #E8EAED' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>{m.subject}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#80868B' }}>
                      {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: m.status === 'replied' ? '#137333' : '#B45309', background: m.status === 'replied' ? '#E6F4EA' : '#FEF3C7', padding: '3px 10px', borderRadius: 100 }}>
                      {m.status === 'replied' ? '✓ Replied' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, color: '#3C4043', lineHeight: 1.5 }}>{m.message}</p>
                  {m.admin_reply && (
                    <div style={{ marginTop: 10, background: '#E6F4EA', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #137333' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#137333', marginBottom: 4 }}>Admin Reply</p>
                      <p style={{ fontSize: 13, color: '#202124', lineHeight: 1.5 }}>{m.admin_reply}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#80868B' }}>No messages yet.</p>
        )}
      </section>

    </div>
  );
}
