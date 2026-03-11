import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BadgeChip from '@/components/BadgeChip';
import Avatar from '@/components/Avatar';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profile }, { data: upcomingEvents }, { data: mySignups }, { data: myMessages }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(3),
      supabase
        .from('event_signups')
        .select('event_id, events(id, title, event_date)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const { data: leaderTop } = await supabase
    .from('profiles')
    .select('id, name, chess_rating, profile_photo')
    .order('chess_rating', { ascending: false })
    .limit(5);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Welcome strip */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Avatar src={profile?.profile_photo} name={profile?.name} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 6 }}>
            Welcome back, {profile?.name ?? user.email}!
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#5F6368' }}>{profile?.class ?? 'No class set'}</span>
            <span style={{ color: '#DADCE0' }}>·</span>
            <span style={{ fontSize: 13, color: '#5F6368' }}>Rating: {profile?.chess_rating ?? '—'}</span>
            <BadgeChip rating={profile?.chess_rating} />
          </div>
          <Link href="/profile" style={{ fontSize: 13, color: '#1A73E8', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: 6 }}>
            Edit Profile →
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>

        {/* Upcoming Events */}
        <section className="card">
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>Upcoming Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #E8EAED' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#202124', marginBottom: 2 }}>{ev.title}</p>
                    <p style={{ fontSize: 12, color: '#5F6368' }}>
                      {new Date(ev.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <Link href="/events" style={{ fontSize: 12, fontWeight: 500, color: '#1A73E8', background: '#E8F0FE', padding: '5px 12px', borderRadius: 100, textDecoration: 'none' }}>
                    Join
                  </Link>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 14, color: '#80868B' }}>No upcoming events.</p>
            )}
          </div>
          <Link href="/events" style={{ fontSize: 13, color: '#1A73E8', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: 16 }}>
            View all events →
          </Link>
        </section>

        {/* My Signups */}
        <section className="card">
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>My Registered Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mySignups && mySignups.length > 0 ? (
              mySignups.map((s: any) => (
                <div key={s.event_id} style={{ paddingBottom: 14, borderBottom: '1px solid #E8EAED' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#202124', marginBottom: 2 }}>{s.events?.title ?? 'Event'}</p>
                  <p style={{ fontSize: 12, color: '#5F6368' }}>
                    {s.events?.event_date ? new Date(s.events.event_date).toLocaleDateString('en-GB') : ''}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 14, color: '#80868B' }}>You haven&apos;t joined any events yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Leaderboard preview */}
      <section className="card">
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>Top Players</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leaderTop?.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 24, fontSize: 13, fontWeight: 500, color: '#80868B', flexShrink: 0 }}>{i + 1}</span>
              <Avatar src={p.profile_photo} name={p.name} size={28} />
              <span style={{ fontSize: 14, fontWeight: 400, color: '#202124', flex: 1 }}>{p.name ?? 'Anonymous'}</span>
              <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: '#1A73E8' }}>{p.chess_rating ?? '—'}</span>
              <BadgeChip rating={p.chess_rating} />
            </div>
          ))}
        </div>
        <Link href="/leaderboard" style={{ fontSize: 13, color: '#1A73E8', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: 16 }}>
          Full leaderboard →
        </Link>
      </section>

      {/* Messages */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124' }}>Messages to Admin</h2>
          <Link href="/messages/new" className="btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>+ New Message</Link>
        </div>
        {myMessages && myMessages.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myMessages.map((m) => (
              <div key={m.id} style={{ border: '1px solid #DADCE0', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>{m.subject}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: m.status === 'replied' ? '#137333' : '#B45309', background: m.status === 'replied' ? '#E6F4EA' : '#FEF3C7', padding: '3px 8px', borderRadius: 100 }}>
                    {m.status === 'replied' ? 'Replied' : 'Pending'}
                  </span>
                </div>
                {m.admin_reply && (
                  <p style={{ fontSize: 13, color: '#3C4043', background: '#F8F9FA', borderRadius: 6, padding: '8px 12px', marginTop: 8, lineHeight: 1.5 }}>
                    <strong style={{ color: '#137333' }}>Admin: </strong>{m.admin_reply}
                  </p>
                )}
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
