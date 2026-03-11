import { createClient } from '@/lib/supabase/server';
import BadgeChip from '@/components/BadgeChip';
import Avatar from '@/components/Avatar';

export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: players } = await supabase
    .from('profiles')
    .select('id, name, chess_rating, profile_photo, class')
    .not('chess_rating', 'is', null)
    .order('chess_rating', { ascending: false });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: '#202124', marginBottom: 32 }}>Leaderboard</h1>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #DADCE0', textAlign: 'left' }}>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 16 }}>Rank</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 16 }}>Player</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 16 }}>Class</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 16 }}>Rating</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12 }}>Badge</th>
            </tr>
          </thead>
          <tbody>
            {players?.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderBottom: '1px solid #F1F3F4', background: i === 0 ? '#FFFDE7' : 'transparent' }}
              >
                <td style={{ padding: '12px 16px 12px 0', fontWeight: 600, fontSize: 14 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td style={{ padding: '12px 16px 12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={p.profile_photo} name={p.name} size={34} />
                    <span style={{ fontWeight: 500, fontSize: 14, color: '#202124' }}>{p.name ?? 'Anonymous'}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 14, color: '#5F6368' }}>{p.class ?? '—'}</td>
                <td style={{ padding: '12px 16px 12px 0', fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#1A73E8' }}>
                  {p.chess_rating}
                </td>
                <td style={{ padding: '12px 0' }}>
                  <BadgeChip rating={p.chess_rating} />
                </td>
              </tr>
            ))}
            {(!players || players.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '32px 0', textAlign: 'center', color: '#80868B', fontSize: 14 }}>
                  No rated players yet. Update your rating in your profile!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24 }} className="card">
        <h2 style={{ fontSize: 15, fontWeight: 500, color: '#202124', marginBottom: 12 }}>Badge Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
          {[
            { label: 'Beginner', range: '< 900', bg: '#F1F3F4', color: '#5F6368' },
            { label: 'Rising Player', range: '900–999', bg: '#E6F4EA', color: '#137333' },
            { label: 'Club Player', range: '1000–1099', bg: '#E8F0FE', color: '#1A73E8' },
            { label: 'Advanced', range: '1100–1199', bg: '#EDE7F6', color: '#6200EA' },
            { label: 'Master', range: '1200+', bg: '#FEF3C7', color: '#B45309' },
          ].map((b) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 8px', borderRadius: 100, background: b.bg, color: b.color }}>
                {b.label}
              </span>
              <span style={{ fontSize: 12, color: '#80868B' }}>{b.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
