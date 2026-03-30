import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
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
      // Reload to update auth state
      window.location.href = '/admin';
    } else {
      toast.error(result.message);
      setPassword('');
    }

    setLoading(false);
  };

  const attemptsRemaining = getAttemptsRemaining();

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-[#FFFBF5] p-12 rounded-3xl border border-[#E8DFD2] shadow-md text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic text-[#3E3B37]">Admin Access</h1>
          <p className="text-[#8B8680] text-sm">Please sign in to manage Diary Samudera</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DFD2] bg-[#F8F3E1] focus:outline-none focus:ring-2 focus:ring-[#AEB784] focus:border-transparent text-sm text-[#3E3B37] placeholder:text-[#C9846C]"
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DFD2] bg-[#F8F3E1] focus:outline-none focus:ring-2 focus:ring-[#AEB784] focus:border-transparent text-sm text-[#3E3B37] placeholder:text-[#C9846C]"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#94A86B] text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-[#AEB784] transition-all shadow-lg shadow-[#AEB784]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-[10px] text-[#AEB784] uppercase tracking-widest">
          <p>Authorized users only</p>
          {attemptsRemaining < 3 && attemptsRemaining > 0 && (
            <p className="text-[#C9846C] mt-2">
              {attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
