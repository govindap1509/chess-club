'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function EventSignupButton({
  eventId,
  alreadyJoined,
}: {
  eventId: string;
  alreadyJoined: boolean;
}) {
  const supabase = createClient();
  const [joined, setJoined] = useState(alreadyJoined);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (joined) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('event_signups')
        .insert({ event_id: eventId, user_id: user.id });

      if (error) {
        if (error.code === '23505') {
          toast('Already registered!');
          setJoined(true);
        } else {
          throw error;
        }
      } else {
        toast.success('Registered!');
        setJoined(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <span
        style={{
          display: 'inline-block',
          background: '#137333',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: 100,
          cursor: 'default',
        }}
      >
        ✓ Registered
      </span>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={loading}
      style={{
        display: 'inline-block',
        background: 'transparent',
        color: '#1A73E8',
        fontSize: 12,
        fontWeight: 600,
        padding: '5px 15px',
        borderRadius: 100,
        border: '1.5px solid #1A73E8',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {loading ? 'Registering…' : 'Register'}
    </button>
  );
}
