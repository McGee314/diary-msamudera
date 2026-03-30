import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onSnapshot, collection, db, query, orderBy, where, Timestamp } from './lib/firebase';
import { Toaster, toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isAuthenticated, logout } from './lib/localAuth';

// Types
interface Post {
  id: string;
  title: string;
  content: string;
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

export default function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local auth status
    setIsAdmin(isAuthenticated());
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAdmin(false);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3E1]">
        <div className="animate-pulse text-[#AEB784] font-serif italic">Loading Samudera...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F8F3E1] text-[#3E3B37] font-sans selection:bg-[#AEB784] selection:text-white">
        <header className="border-b border-[#E8DFD2] bg-[#FFFBF5]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-serif tracking-tight hover:opacity-70 transition-opacity text-[#3E3B37]">
              Diary Samudera
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-[#8B8680]">
              <Link to="/" className="hover:text-[#AEB784] transition-colors">Home</Link>
              {isAdmin ? (
                <>
                  <Link to="/admin" className="hover:text-[#AEB784] transition-colors">Dashboard</Link>
                  <button
                    onClick={handleLogout}
                    className="hover:text-[#AEB784] transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/admin" className="hover:text-[#AEB784] transition-colors">Admin</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<DiaryFeed />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Login />} />
            <Route path="/admin/new" element={isAdmin ? <PostEditor /> : <Login />} />
            <Route path="/admin/edit/:id" element={isAdmin ? <PostEditor /> : <Login />} />
          </Routes>
        </main>

        <footer className="border-t border-[#E8DFD2] py-12 bg-[#FFFBF5]">
          <div className="max-w-5xl mx-auto px-6 text-center text-[#AEB784] text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Diary Samudera &bull; Built with Heart
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}
