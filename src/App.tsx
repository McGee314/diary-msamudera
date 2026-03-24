import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut, onSnapshot, collection, db, query, orderBy, where, Timestamp } from './lib/firebase';
import { Toaster, toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-400 font-serif italic">Loading Samudera...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-serif tracking-tight hover:opacity-70 transition-opacity">
              Diary Samudera
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
              <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
              {user ? (
                <>
                  <Link to="/admin" className="hover:text-stone-900 transition-colors">Dashboard</Link>
                  <button 
                    onClick={() => signOut(auth)}
                    className="hover:text-stone-900 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/admin" className="hover:text-stone-900 transition-colors">Admin</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<DiaryFeed />} />
            <Route path="/admin" element={user ? <AdminDashboard /> : <Login />} />
            <Route path="/admin/new" element={user ? <PostEditor /> : <Login />} />
            <Route path="/admin/edit/:id" element={user ? <PostEditor /> : <Login />} />
          </Routes>
        </main>

        <footer className="border-t border-stone-200 py-12 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center text-stone-400 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Diary Samudera &bull; Built with Heart
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}
