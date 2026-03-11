'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Avatar from '@/components/Avatar';
import BadgeChip from '@/components/BadgeChip';
import { Profile } from '@/lib/supabase/types';

const CLASS_OPTIONS = ['Class A', 'Class B', 'Class C'];

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      else setProfile({ id: user.id });
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${userId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('profile-photos')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path);
      setProfile((p) => ({ ...p, profile_photo: urlData.publicUrl }));
      toast.success('Photo uploaded!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        name: profile.name,
        class: profile.class,
        parent_phone: profile.parent_phone,
        chess_profile_url: profile.chess_profile_url,
        chess_rating: profile.chess_rating ? Number(profile.chess_rating) : null,
        profile_photo: profile.profile_photo,
      });
      if (error) throw error;
      toast.success('Profile saved!');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#80868B' }}>Loading…</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 24 }}>My Profile</h1>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Avatar src={profile.profile_photo} name={profile.name} size={72} />
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-sm"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Change Photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <p style={{ fontSize: 12, color: '#80868B', marginTop: 4 }}>JPG, PNG, GIF up to 2MB</p>
        </div>
        <BadgeChip rating={profile.chess_rating} />
      </div>

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            placeholder="Your name"
            value={profile.name ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Class</label>
          <select
            className="input"
            value={profile.class ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, class: e.target.value }))}
          >
            <option value="">Select class…</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Parent / Guardian Phone</label>
          <input
            className="input"
            type="tel"
            placeholder="+1 555 000 0000"
            value={profile.parent_phone ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, parent_phone: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Chess.com Profile URL</label>
          <input
            className="input"
            type="url"
            placeholder="https://www.chess.com/member/yourname"
            value={profile.chess_profile_url ?? ''}
            onChange={(e) => setProfile((p) => ({ ...p, chess_profile_url: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Chess Rating</label>
          <input
            className="input"
            type="number"
            min={0}
            max={3000}
            placeholder="e.g. 1050"
            value={profile.chess_rating ?? ''}
            onChange={(e) =>
              setProfile((p) => ({ ...p, chess_rating: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
