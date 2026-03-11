import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import BadgeChip from '@/components/BadgeChip';
import Avatar from '@/components/Avatar';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(4);

  const { data: leaders } = await supabase
    .from('profiles')
    .select('id, name, chess_rating, profile_photo')
    .order('chess_rating', { ascending: false })
    .limit(10);

  return (
    <div>
      {/* HERO with chess image */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#0D1117' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1400&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.35,
        }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#8AB4F8', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Welcome to
          </p>
          <h1 style={{ fontSize: 'clamp(36px,6vw,56px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
            School Chess Club
          </h1>
          <p style={{ fontSize: 18, fontWeight: 400, color: '#C9D1D9', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
            Join weekly chess events, track your rating, compete with fellow students,
            and climb the leaderboard.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              background: '#1A73E8',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 600,
              padding: '14px 36px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 200ms',
            }}
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Chess image strip */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: 200, overflow: 'hidden' }}>
        <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586165368502-1bad9cc70139?w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </section>

      {/* UPCOMING EVENTS */}
      <section style={{ padding: '64px 0', background: '#F8F9FA' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 400, color: '#202124', marginBottom: 8 }}>Upcoming Events</h2>
          <p style={{ fontSize: 14, color: '#5F6368', marginBottom: 40 }}>Sign in to register and secure your spot.</p>
          {events && events.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {events.map((event) => (
                <div key={event.id} className="card" style={{ borderTop: '3px solid #1A73E8' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1A73E8', letterSpacing: '0.05em', marginBottom: 10, textTransform: 'uppercase' }}>
                    {new Date(event.event_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <h3 style={{ fontSize: 18, fontWeight: 500, color: '#202124', marginBottom: 8 }}>{event.title}</h3>
                  {event.description && <p style={{ fontSize: 14, color: '#3C4043', lineHeight: 1.6 }}>{event.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 14, color: '#80868B' }}>No upcoming events. Check back soon!</p>
          )}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section style={{ padding: '64px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 400, color: '#202124', marginBottom: 8 }}>Leaderboard</h2>
          <p style={{ fontSize: 14, color: '#5F6368', marginBottom: 40 }}>Ranked by chess rating.</p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #DADCE0', background: '#F8F9FA' }}>
                  {['Rank','Player','Rating','Badge'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#5F6368', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaders?.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #E8EAED' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 500, color: '#80868B' }}>{i + 1}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar src={p.profile_photo} name={p.name} size={30} />
                        <span style={{ fontWeight: 500, color: '#202124' }}>{p.name ?? 'Anonymous'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#1A73E8', fontSize: 15 }}>{p.chess_rating ?? '—'}</td>
                    <td style={{ padding: '14px 20px' }}><BadgeChip rating={p.chess_rating} /></td>
                  </tr>
                ))}
                {(!leaders || leaders.length === 0) && (
                  <tr><td colSpan={4} style={{ padding: '32px 20px', textAlign: 'center', color: '#80868B' }}>No players yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#202124', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#E8EAED', marginBottom: 4 }}>♟ School Chess Club</p>
              <p style={{ fontSize: 13, color: '#9AA0A6' }}>Building champions, one move at a time.</p>
            </div>
            <Link href="/login" style={{ fontSize: 13, color: '#8AB4F8', textDecoration: 'none' }}>Login</Link>
          </div>
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #3C4043' }}>
            <p style={{ fontSize: 12, color: '#5F6368' }}>&copy; {new Date().getFullYear()} School Chess Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
