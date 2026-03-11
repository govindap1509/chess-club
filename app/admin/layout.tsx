import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 8 }}>Admin Panel</h1>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
