'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function NewMessagePage() {
  const supabase = createClient();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('messages').insert({
        user_id: user.id,
        subject,
        message,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Message sent to admin!');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 24 }}>Message Admin</h1>

      <form onSubmit={handleSend} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Subject</label>
          <input
            className="input"
            placeholder="e.g. Question about next event"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            className="input h-32 resize-none"
            placeholder="Write your message here…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Sending…' : 'Send Message'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
