import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onSnapshot, collection, db, query, orderBy, where, Timestamp } from './lib/firebase';
import { Toaster, toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { DayPicker } from 'react-day-picker';

import { isAuthenticated, logout } from './lib/localAuth';

// Types
interface Post {
  id: string;
  title: string;
  content: string;
  photoUrl?: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorUid: string;
}

// Components
import DiaryFeed from './components/DiaryFeed';
import AdminDashboard from './components/AdminDashboard';
import PostEditor from './components/PostEditor';
import Login from './components/Login';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative text-[#64748B] hover:text-[#1E293B] transition-colors duration-200 text-[0.8125rem] font-medium group"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#0D9488] transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsAdmin(isAuthenticated());
    setLoading(false);

    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAdmin(false);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[#14B8A6]"
              style={{ animation: `pulse-soft 1.2s ease-in-out ${i * 0.18}s infinite` }}
            />
          ))}
        </div>
        <p className="text-[#94A3B8] font-serif italic text-sm">Loading Samudera…</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F7F9FC] text-[#1E293B] font-sans selection:bg-[#0D9488] selection:text-white">
        {/* Header */}
        <header
          className="sticky top-0 z-50 transition-all duration-300"
          style={{
            background: scrolled
              ? 'rgba(247,249,252,0.9)'
              : 'rgba(247,249,252,0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: scrolled
              ? '1px solid rgba(226,232,240,0.8)'
              : '1px solid rgba(226,232,240,0.35)',
            boxShadow: scrolled
              ? '0 2px 24px rgba(30,41,59,0.06)'
              : 'none',
          }}
        >
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2.5"
            >
              {/* Logo mark */}
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                  boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
                }}
              >
                S
              </span>
              <span className="text-xl font-serif tracking-tight text-[#1E293B] group-hover:text-[#0D9488] transition-colors duration-200">
                Diary Samudera
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              <NavLink to="/">Home</NavLink>
              {isAdmin ? (
                <>
                  <NavLink to="/admin">Dashboard</NavLink>
                  <button
                    onClick={handleLogout}
                    className="relative text-[#64748B] hover:text-[#EF4444] transition-colors duration-200 text-[0.8125rem] font-medium group"
                  >
                    Logout
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#EF4444] transition-all duration-300 group-hover:w-full" />
                  </button>
                </>
              ) : (
                <NavLink to="/admin">Admin</NavLink>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
          <Routes>
            <Route path="/" element={<DiaryFeed />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Login />} />
            <Route path="/admin/new" element={isAdmin ? <PostEditor /> : <Login />} />
            <Route path="/admin/edit/:id" element={isAdmin ? <PostEditor /> : <Login />} />
          </Routes>
        </main>

        <footer className="mt-20 border-t border-[#E2E8F0]/70 py-10 bg-white/40">
          <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-3">
            <span
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}
            >
              S
            </span>
            <p className="text-[#94A3B8] text-[0.6875rem] tracking-[0.2em] uppercase">
              © {new Date().getFullYear()} Diary Samudera · Built with Heart
            </p>
          </div>
        </footer>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(226,232,240,0.7)',
              color: '#1E293B',
              borderRadius: '0.875rem',
              fontSize: '0.875rem',
            },
          }}
        />
      </div>
    </Router>
  );
}
