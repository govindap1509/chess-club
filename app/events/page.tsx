'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Event } from '@/lib/supabase/types';

interface EventWithCount extends Event {
  signup_count: number;
  already_joined: boolean;
}

export default function EventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  async function loadEvents(uid: string) {
    const { data: evData } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!evData) return;

    const { data: signups } = await supabase
      .from('event_signups')
      .select('event_id, user_id');

    const enriched: EventWithCount[] = evData.map((ev) => ({
      ...ev,
      signup_count: signups?.filter((s) => s.event_id === ev.id).length ?? 0,
      already_joined: signups?.some((s) => s.event_id === ev.id && s.user_id === uid) ?? false,
    }));

    setEvents(enriched);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await loadEvents(user.id);
      setLoading(false);
    }
    init();
  }, []);

  async function handleJoin(eventId: string) {
    if (!userId) return;
    setJoiningId(eventId);
    try {
      const { error } = await supabase
        .from('event_signups')
        .insert({ event_id: eventId, user_id: userId });
      if (error) {
        if (error.code === '23505') {
          toast.error('You already joined this event!');
        } else {
          throw error;
        }
      } else {
        toast.success('You joined the event!');
        await loadEvents(userId);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setJoiningId(null);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#80868B' }}>Loading events…</div>;

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date());
  const past = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: '#202124', marginBottom: 32 }}>
        Chess Events
      </h1>

      {upcoming.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#3C4043', marginBottom: 16 }}>Upcoming Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((ev) => (
              <EventCard key={ev.id} ev={ev} onJoin={handleJoin} joiningId={joiningId} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#80868B', marginBottom: 16 }}>Past Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.map((ev) => (
              <EventCard key={ev.id} ev={ev} onJoin={handleJoin} joiningId={joiningId} past />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p style={{ textAlign: 'center', color: '#80868B', padding: '48px 0' }}>No events scheduled yet.</p>
      )}
    </div>
  );
}

function EventCard({
  ev,
  onJoin,
  joiningId,
  past = false,
}: {
  ev: EventWithCount;
  onJoin: (id: string) => void;
  joiningId: string | null;
  past?: boolean;
}) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${past ? '#DADCE0' : '#1A73E8'}`, opacity: past ? 0.72 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 4 }}>{ev.title}</h3>
          <p style={{ fontSize: 13, color: '#5F6368', marginBottom: ev.description ? 8 : 0 }}>
            {new Date(ev.event_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {ev.description && <p style={{ fontSize: 14, color: '#3C4043', marginBottom: 8 }}>{ev.description}</p>}
          <p style={{ fontSize: 12, color: '#80868B' }}>{ev.signup_count} student{ev.signup_count !== 1 ? 's' : ''} joined</p>
        </div>
        {!past && (
          <div style={{ flexShrink: 0 }}>
            {ev.already_joined ? (
              <span style={{ display: 'inline-block', background: '#E6F4EA', color: '#137333', fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 100 }}>
                ✓ Joined
              </span>
            ) : (
              <button
                onClick={() => onJoin(ev.id)}
                disabled={joiningId === ev.id}
                className="btn-primary"
                style={{ fontSize: 13 }}
              >
                {joiningId === ev.id ? 'Joining…' : 'Join'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
