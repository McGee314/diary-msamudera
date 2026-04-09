import React, { useState, useEffect } from 'react';
import { collection, db, query, orderBy, onSnapshot, deleteDoc, doc } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, ExternalLink, LayoutDashboard, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  photoUrl?: string;
  publishedAt: any;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteDoc(doc(db, 'posts', id));
        toast.success('Entry deleted successfully');
      } catch (error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-48" />
            <div className="skeleton h-4 w-36" />
          </div>
          <div className="skeleton h-9 w-32 rounded-full" />
        </div>
        <div className="glass-card overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 border-b border-[#E2E8F0]/50 last:border-none"
            >
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
              boxShadow: '0 3px 12px rgba(13,148,136,0.3)',
            }}
          >
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#1E293B]">Admin Dashboard</h1>
            <p className="text-[#64748B] text-[0.8125rem] mt-0.5">
              {posts.length} {posts.length === 1 ? 'entry' : 'entries'} total
            </p>
          </div>
        </div>
        <Link
          to="/admin/new"
          className="btn-primary"
        >
          <Plus size={15} />
          New Entry
        </Link>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr
              style={{
                background: 'rgba(241,245,249,0.7)',
                borderBottom: '1px solid rgba(226,232,240,0.7)',
              }}
            >
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#94A3B8]">
                Date
              </th>
              <th className="px-4 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#94A3B8] text-center w-16">
                Photo
              </th>
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#94A3B8]">
                Title
              </th>
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#94A3B8] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]/50">
            {posts.map((post, i) => (
              <tr
                key={post.id}
                className="group transition-colors duration-150 hover:bg-[#F7F9FC]/80"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <td className="px-6 py-4">
                  <span className="badge font-mono text-[0.6875rem] tracking-tight normal-case">
                    {format(post.publishedAt.toDate(), 'dd MMM yyyy')}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {post.photoUrl ? (
                    <div className="dashboard-thumb">
                      <img
                        src={post.photoUrl}
                        alt=""
                        className="dashboard-thumb-img"
                      />
                    </div>
                  ) : (
                    <div className="dashboard-thumb-empty">
                      <ImageIcon size={12} className="text-[#CBD5E1]" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[0.875rem] font-medium text-[#1E293B] line-clamp-1">
                    {post.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <Link
                      to={`/admin/edit/${post.id}`}
                      className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D9488] transition-all duration-150"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg text-[#EF4444] hover:text-white hover:bg-[#EF4444] transition-all duration-150"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      to="/"
                      className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D9488] transition-all duration-150"
                      title="View on site"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#94A3B8]">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(13, 148, 136, 0.06)',
                        border: '1px solid rgba(13, 148, 136, 0.15)',
                      }}
                    >
                      <Plus size={20} className="text-[#0D9488]" />
                    </div>
                    <p className="text-sm italic">No entries yet. Start writing!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
