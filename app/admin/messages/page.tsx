'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Message } from '@/lib/supabase/types';

interface MessageWithProfile extends Message {
  profiles: { name: string | null } | null;
}

export default function AdminMessagesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    setMessages((data as MessageWithProfile[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleReply(msgId: string) {
    const reply = replyText[msgId];
    if (!reply?.trim()) { toast.error('Reply cannot be empty'); return; }
    setSending(msgId);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ admin_reply: reply, status: 'replied', replied_at: new Date().toISOString() })
        .eq('id', msgId);
      if (error) throw error;
      toast.success('Reply sent!');
      setReplyText((r) => ({ ...r, [msgId]: '' }));
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSending(null);
    }
  }

  if (loading) return <p style={{ color: '#80868B', fontSize: 14 }}>Loading…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 500, color: '#202124', marginBottom: 4 }}>
        Messages ({messages.length})
      </h2>
      {messages.length === 0 && (
        <p style={{ color: '#80868B', fontSize: 14 }}>No messages yet.</p>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className="card"
          style={{ borderLeft: `4px solid ${m.status === 'replied' ? '#34A853' : '#FBBC04'}` }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 500, fontSize: 14, color: '#202124' }}>{m.profiles?.name ?? 'Unknown'}</span>
              <span style={{ color: '#80868B', fontSize: 12, marginLeft: 8 }}>
                {new Date(m.created_at).toLocaleString('en-GB')}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: m.status === 'replied' ? '#137333' : '#B45309', background: m.status === 'replied' ? '#E6F4EA' : '#FEF3C7', padding: '3px 10px', borderRadius: 100 }}>
              {m.status === 'replied' ? '✓ Replied' : '⏳ Pending'}
            </span>
          </div>

          <p style={{ fontSize: 14, fontWeight: 500, color: '#202124', marginBottom: 6 }}>{m.subject}</p>
          <p style={{ fontSize: 14, color: '#3C4043', background: '#F8F9FA', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>{m.message}</p>

          {m.admin_reply && (
            <div style={{ background: '#E6F4EA', color: '#137333', fontSize: 13, borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
              <strong>Your reply: </strong>{m.admin_reply}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 13 }}
              placeholder="Type reply…"
              value={replyText[m.id] ?? ''}
              onChange={(e) => setReplyText((r) => ({ ...r, [m.id]: e.target.value }))}
            />
            <button
              onClick={() => handleReply(m.id)}
              disabled={sending === m.id}
              className="btn-primary"
              style={{ fontSize: 13 }}
            >
              {sending === m.id ? '…' : 'Reply'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
