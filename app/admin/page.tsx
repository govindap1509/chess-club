import { createClient } from '@/lib/supabase/server';

const statColors = [
  { bg: '#E8F0FE', color: '#1A73E8' },
  { bg: '#E6F4EA', color: '#137333' },
  { bg: '#FEF3C7', color: '#B45309' },
  { bg: '#EDE7F6', color: '#6200EA' },
];

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [{ count: studentCount }, { count: eventCount }, { count: messageCount }, { count: resultCount }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('match_results').select('*', { count: 'exact', head: true }),
    ]);

  const stats = [
    { label: 'Total Students', value: studentCount ?? 0, icon: '👥' },
    { label: 'Events', value: eventCount ?? 0, icon: '📅' },
    { label: 'Pending Messages', value: messageCount ?? 0, icon: '✉️' },
    { label: 'Match Results', value: resultCount ?? 0, icon: '🏆' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: statColors[i].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 600, color: '#202124', lineHeight: 1.2 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: '#5F6368', marginTop: 2 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14, color: '#5F6368' }}>
        Use the tabs above to manage events, students, match results, and messages.
      </p>
    </div>
  );
}
