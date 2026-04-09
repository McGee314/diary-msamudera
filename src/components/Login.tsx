import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, Lock } from 'lucide-react';
import { login, getAttemptsRemaining } from '../lib/localAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = login(username, password);

    if (result.success) {
      toast.success(result.message);
      setUsername('');
      setPassword('');
      window.location.href = '/admin';
    } else {
      toast.error(result.message);
      setPassword('');
    }

    setLoading(false);
  };

  const attemptsRemaining = getAttemptsRemaining();

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="glass-card p-10 space-y-8">
          {/* Icon */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                boxShadow: '0 6px 24px rgba(13,148,136,0.35), 0 1px 0 rgba(255,255,255,0.2) inset',
              }}
            >
              <Lock size={22} className="text-white" />
            </div>
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-serif italic text-[#1E293B]">Admin Access</h1>
              <p className="text-[#64748B] text-[0.8125rem] leading-relaxed">
                Sign in to manage Diary Samudera
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] px-1">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-modern"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8] px-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white inline-block"
                  style={{ animation: 'spin 0.7s linear infinite' }}
                />
              ) : (
                <LogIn size={15} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center space-y-1.5">
            <p className="text-[10px] text-[#94A3B8] uppercase tracking-widest">
              Authorized users only
            </p>
            {attemptsRemaining < 3 && attemptsRemaining > 0 && (
              <p
                className="text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: '#EF4444' }}
              >
                {attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
