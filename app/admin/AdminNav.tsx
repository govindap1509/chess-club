'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/results', label: 'Match Results' },
  { href: '/admin/messages', label: 'Messages' },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          style={{
            padding: '6px 14px',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
            background: pathname === t.href ? '#1A73E8' : '#F1F3F4',
            color: pathname === t.href ? '#FFFFFF' : '#3C4043',
            transition: 'background 0.15s',
          }}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
