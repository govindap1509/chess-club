'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

type Mode = 'login' | 'register' | 'reset';

const btnLink: React.CSSProperties = {
  fontSize: 14, fontWeight: 500, color: '#1A73E8',
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', display: 'block', width: '100%',
  textAlign: 'center', padding: '4px 0',
};

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = '/dashboard';
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        window.location.href = '/dashboard';
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
        setErrorMsg('✓ Check your email to confirm your account before signing in.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profile`,
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Sign in',
    register: 'Create account',
    reset: 'Reset password',
  };
  const subtitles: Record<Mode, string> = {
    login: 'Welcome back to Chess Club',
    register: 'Join the Chess Club today',
    reset: "We'll send you a reset link",
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* LEFT — chess photo panel */}
      <div style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'none',
        position: 'relative',
        backgroundImage: 'url(https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1400&auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
        className="login-photo-panel"
      >
        {/* dark gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,71,161,0.85) 0%, rgba(0,0,0,0.65) 100%)' }} />
        {/* content over photo */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '48px 52px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>♟</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, marginBottom: 12 }}>
            School<br />Chess Club
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: 320 }}>
            Track your rating, register for events, challenge teammates and climb the leaderboard.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
            {[['♟', 'Events'], ['🏆', 'Rankings'], ['📈', 'Progress']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', background: '#F8F9FA' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo lockup */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>♟</div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#5F6368', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              School Chess Club
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124', marginBottom: 4 }}>
            {titles[mode]}
          </h1>
          <p style={{ fontSize: 14, color: '#5F6368', marginBottom: errorMsg ? 16 : 28, lineHeight: 1.5 }}>
            {subtitles[mode]}
          </p>

          {errorMsg && (
            <div style={{ background: errorMsg.startsWith('✓') ? '#E6F4EA' : '#FCE8E6', color: errorMsg.startsWith('✓') ? '#137333' : '#C5221F', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 20, lineHeight: 1.5 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign in'
                : mode === 'register' ? 'Create account'
                : 'Send reset link'}
            </button>
          </form>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('register')} style={btnLink}>
                  Don&apos;t have an account? Register
                </button>
                <button onClick={() => setMode('reset')} style={{ ...btnLink, color: '#5F6368', fontWeight: 400, fontSize: 13 }}>
                  Forgot password?
                </button>
              </>
            )}
            {(mode === 'register' || mode === 'reset') && (
              <button onClick={() => setMode('login')} style={btnLink}>
                ← Back to sign in
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
