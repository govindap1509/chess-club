'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Events' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get initial auth state
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    // Full page reload to clear all cached auth state
    window.location.href = '/';
  }

  return (
    <nav
      style={{
        background: '#FFFFFF',
        borderBottom: scrolled ? '1px solid #DADCE0' : '1px solid transparent',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
        transition: 'border-color 200ms ease',
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: '100%' }}
        className="flex items-center justify-between"
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ color: '#202124', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <span style={{ color: '#1A73E8', fontSize: 20 }}>♟</span>
          Chess Club
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center" style={{ gap: 32 }}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: pathname === l.href ? '#1A73E8' : '#3C4043',
                textDecoration: 'none',
                borderBottom: pathname === l.href ? '2px solid #1A73E8' : '2px solid transparent',
                paddingBottom: 2,
                transition: 'color 200ms ease',
              }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: pathname.startsWith('/admin') ? '#1A73E8' : '#3C4043',
                textDecoration: 'none',
                borderBottom: pathname.startsWith('/admin') ? '2px solid #1A73E8' : '2px solid transparent',
                paddingBottom: 2,
              }}
            >
              Admin
            </Link>
          )}
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="btn-primary"
              style={{ padding: '8px 16px', textDecoration: 'none', fontSize: 14 }}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ color: '#5F6368', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile slide panel */}
      {open && (
        <div
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #DADCE0',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: pathname === l.href ? '#1A73E8' : '#3C4043',
                textDecoration: 'none',
                padding: '10px 0',
                borderBottom: '1px solid #F1F3F4',
              }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: pathname.startsWith('/admin') ? '#1A73E8' : '#3C4043',
                textDecoration: 'none',
                padding: '10px 0',
                borderBottom: '1px solid #F1F3F4',
              }}
            >
              Admin
            </Link>
          )}
          {userEmail ? (
            <button
              onClick={handleLogout}
              style={{
                marginTop: 12,
                textAlign: 'left',
                fontSize: 14,
                fontWeight: 500,
                color: '#C5221F',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 12,
                fontSize: 14,
                fontWeight: 500,
                color: '#1A73E8',
                textDecoration: 'none',
                padding: '8px 0',
              }}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
