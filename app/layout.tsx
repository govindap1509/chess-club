import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'School Chess Club',
  description: 'Manage your school chess club — events, ratings, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen bg-white">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              color: '#202124',
              border: '1px solid #DADCE0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            },
          }}
        />
      </body>
    </html>
  );
}
