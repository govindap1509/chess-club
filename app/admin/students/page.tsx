import { createClient } from '@/lib/supabase/server';
import BadgeChip from '@/components/BadgeChip';
import Avatar from '@/components/Avatar';

export default async function AdminStudentsPage() {
  const supabase = createClient();
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .order('chess_rating', { ascending: false });

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>
        All Students ({students?.length ?? 0})
      </h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="w-full" style={{ fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #DADCE0', textAlign: 'left' }}>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Student</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Class</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Rating</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Badge</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Parent Phone</th>
              <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10 }}>Chess.com</th>
            </tr>
          </thead>
          <tbody>
            {students?.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #F1F3F4' }}>
                <td style={{ padding: '10px 12px 10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar src={s.profile_photo} name={s.name} size={28} />
                    <span style={{ fontWeight: 500 }}>{s.name ?? 'No name'}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px 10px 0', color: '#5F6368' }}>{s.class ?? '—'}</td>
                <td style={{ padding: '10px 12px 10px 0', fontFamily: 'monospace', fontWeight: 600, color: '#1A73E8' }}>
                  {s.chess_rating ?? '—'}
                </td>
                <td style={{ padding: '10px 12px 10px 0' }}><BadgeChip rating={s.chess_rating} /></td>
                <td style={{ padding: '10px 12px 10px 0', color: '#5F6368' }}>{s.parent_phone ?? '—'}</td>
                <td style={{ padding: '10px 0' }}>
                  {s.chess_profile_url ? (
                    <a
                      href={s.chess_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1A73E8', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
                    >
                      Profile
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
            {(!students || students.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '24px 0', textAlign: 'center', color: '#80868B' }}>
                  No students have set up profiles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
