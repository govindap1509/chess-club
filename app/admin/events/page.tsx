'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Event } from '@/lib/supabase/types';
import { Trash2 } from 'lucide-react';

export default function AdminEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', event_date: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });
    setEvents(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: form.title,
        description: form.description || null,
        event_date: form.event_date,
      });
      if (error) throw error;
      toast.success('Event created!');
      setForm({ title: '', description: '', event_date: '' });
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); await load(); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Create Form */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 16 }}>Create New Event</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              required
              placeholder="Weekly Club Match"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Date & Time</label>
            <input
              className="input"
              type="datetime-local"
              required
              value={form.event_date}
              onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input resize-none h-20"
              placeholder="Details about the event…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Creating…' : 'Create Event'}
          </button>
        </form>
      </div>

      {/* Events List */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 12 }}>All Events</h2>
        {loading ? (
          <p style={{ color: '#80868B', fontSize: 14 }}>Loading…</p>
        ) : events.length === 0 ? (
          <p style={{ color: '#80868B', fontSize: 14 }}>No events yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((ev) => (
              <div key={ev.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#202124', marginBottom: 2 }}>{ev.title}</p>
                  <p style={{ fontSize: 13, color: '#5F6368' }}>
                    {new Date(ev.event_date).toLocaleString('en-GB')}
                  </p>
                  {ev.description && (
                    <p style={{ fontSize: 12, color: '#80868B', marginTop: 4 }}>{ev.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ev.id)}
                  style={{ color: '#C5221F', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, marginTop: 2, padding: 4 }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
