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
    <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

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
  );
}
