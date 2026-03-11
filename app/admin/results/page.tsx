'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface SimplePlayer {
  id: string;
  name: string | null;
}

interface SimpleEvent {
  id: string;
  title: string;
}

interface MatchWithPlayers {
  id: string;
  event_id: string | null;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  created_at: string;
  player1: { name: string | null } | null;
  player2: { name: string | null } | null;
  winner: { name: string | null } | null;
  events: { title: string } | null;
}

export default function AdminResultsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<SimpleEvent[]>([]);
  const [players, setPlayers] = useState<SimplePlayer[]>([]);
  const [results, setResults] = useState<MatchWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    event_id: '',
    player1_id: '',
    player2_id: '',
    winner_id: '',
  });

  async function load() {
    const [{ data: ev }, { data: pl }, { data: rs }] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('profiles').select('id, name').order('name'),
      supabase
        .from('match_results')
        .select(
          `*, 
          player1:profiles!match_results_player1_id_fkey(name),
          player2:profiles!match_results_player2_id_fkey(name),
          winner:profiles!match_results_winner_id_fkey(name),
          events(title)`
        )
        .order('created_at', { ascending: false })
        .limit(30),
    ]);
    setEvents((ev as SimpleEvent[]) ?? []);
    setPlayers((pl as SimplePlayer[]) ?? []);
    setResults((rs as unknown as MatchWithPlayers[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.player1_id === form.player2_id) {
      toast.error('Players must be different');
      return;
    }
    setSaving(true);
    try {
      // 1. Save match result
      const { error } = await supabase.from('match_results').insert({
        event_id: form.event_id || null,
        player1_id: form.player1_id,
        player2_id: form.player2_id,
        winner_id: form.winner_id || null,
      });
      if (error) throw error;

      // 2. Fetch current ratings for both players
      const [{ data: p1d }, { data: p2d }] = await Promise.all([
        supabase.from('profiles').select('name, chess_rating').eq('id', form.player1_id).single(),
        supabase.from('profiles').select('name, chess_rating').eq('id', form.player2_id).single(),
      ]);
      const p1Rating = p1d?.chess_rating ?? 1000;
      const p2Rating = p2d?.chess_rating ?? 1000;
      const p1Name = p1d?.name ?? 'Player 1';
      const p2Name = p2d?.name ?? 'Player 2';

      // 3. Calculate new ratings (win +10, loss -5, draw unchanged, floor 800)
      let newP1 = p1Rating, newP2 = p2Rating;
      if (form.winner_id === form.player1_id) {
        newP1 = p1Rating + 10;
        newP2 = Math.max(800, p2Rating - 5);
      } else if (form.winner_id === form.player2_id) {
        newP1 = Math.max(800, p1Rating - 5);
        newP2 = p2Rating + 10;
      }

      // 4. Update profiles + insert rating history
      await Promise.all([
        supabase.from('profiles').update({ chess_rating: newP1 }).eq('id', form.player1_id),
        supabase.from('profiles').update({ chess_rating: newP2 }).eq('id', form.player2_id),
        supabase.from('rating_history').insert([
          { user_id: form.player1_id, rating: newP1, note: `vs ${p2Name}` },
          { user_id: form.player2_id, rating: newP2, note: `vs ${p1Name}` },
        ]),
      ]);

      const resultLabel = !form.winner_id ? 'Draw'
        : form.winner_id === form.player1_id ? `${p1Name} won` : `${p2Name} won`;
      toast.success(`Saved! ${resultLabel} · Ratings updated`);
      setForm({ event_id: '', player1_id: '', player2_id: '', winner_id: '' });
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: '#80868B', fontSize: 14 }}>Loading…</p>;

  const winners: { value: string; label: string }[] = [];
  if (form.player1_id) {
    const p1 = players.find((p) => p.id === form.player1_id);
    winners.push({ value: form.player1_id, label: p1?.name ?? 'Player 1' });
  }
  if (form.player2_id) {
    const p2 = players.find((p) => p.id === form.player2_id);
    winners.push({ value: form.player2_id, label: p2?.name ?? 'Player 2' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Form */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>Enter Match Result</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="label">Event</label>
            <select
              className="input"
              required
              value={form.event_id}
              onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
            >
              <option value="">Select event…</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Player 1 (White)</label>
              <select
                className="input"
                required
                value={form.player1_id}
                onChange={(e) => setForm((f) => ({ ...f, player1_id: e.target.value, winner_id: '' }))}
              >
                <option value="">Select…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Player 2 (Black)</label>
              <select
                className="input"
                required
                value={form.player2_id}
                onChange={(e) => setForm((f) => ({ ...f, player2_id: e.target.value, winner_id: '' }))}
              >
                <option value="">Select…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Winner (leave blank for draw)</label>
            <select
              className="input"
              value={form.winner_id}
              onChange={(e) => setForm((f) => ({ ...f, winner_id: e.target.value }))}
            >
              <option value="">Draw / Not recorded</option>
              {winners.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Result'}
          </button>
        </form>
      </div>

      {/* Results table */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 12 }}>Recent Results</h2>
        {results.length === 0 ? (
          <p style={{ color: '#80868B', fontSize: 14 }}>No results yet.</p>
        ) : (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #DADCE0', textAlign: 'left' }}>
                  <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Event</th>
                  <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Player 1</th>
                  <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10, paddingRight: 12 }}>Player 2</th>
                  <th style={{ fontSize: 11, fontWeight: 500, color: '#5F6368', textTransform: 'uppercase', paddingBottom: 10 }}>Winner</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F1F3F4' }}>
                    <td style={{ padding: '10px 12px 10px 0', color: '#5F6368' }}>{r.events?.title ?? '—'}</td>
                    <td style={{ padding: '10px 12px 10px 0' }}>{r.player1?.name ?? '—'}</td>
                    <td style={{ padding: '10px 12px 10px 0' }}>{r.player2?.name ?? '—'}</td>
                    <td style={{ padding: '10px 0', fontWeight: 500, color: '#1A73E8' }}>
                      {r.winner?.name ?? <span style={{ color: '#80868B', fontWeight: 400 }}>Draw</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
