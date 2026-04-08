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
              className="flex items-center gap-4 px-6 py-4 border-b border-[#E8DFD2]/50 last:border-none"
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
              background: 'linear-gradient(135deg, #94A86B 0%, #AEB784 100%)',
              boxShadow: '0 3px 12px rgba(148,168,107,0.3)',
            }}
          >
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#3E3B37]">Admin Dashboard</h1>
            <p className="text-[#8B8680] text-[0.8125rem] mt-0.5">
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
                background: 'rgba(240,235,217,0.5)',
                borderBottom: '1px solid rgba(232,223,210,0.6)',
              }}
            >
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784]">
                Date
              </th>
              <th className="px-4 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784] text-center w-16">
                Photo
              </th>
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784]">
                Title
              </th>
              <th className="px-6 py-3.5 text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DFD2]/50">
            {posts.map((post, i) => (
              <tr
                key={post.id}
                className="group transition-colors duration-150 hover:bg-[#F8F3E1]/60"
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
                      <ImageIcon size={12} className="text-[#C9BFB5]" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-[0.875rem] font-medium text-[#3E3B37] line-clamp-1">
                    {post.title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                    <Link
                      to={`/admin/edit/${post.id}`}
                      className="p-2 rounded-lg text-[#AEB784] hover:text-white hover:bg-[#94A86B] transition-all duration-150"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg text-[#C9846C] hover:text-white hover:bg-[#C9846C] transition-all duration-150"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Link
                      to="/"
                      className="p-2 rounded-lg text-[#AEB784] hover:text-white hover:bg-[#94A86B] transition-all duration-150"
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
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#8B8680]">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'rgba(174,183,132,0.1)',
                        border: '1px solid rgba(174,183,132,0.2)',
                      }}
                    >
                      <Plus size={20} className="text-[#AEB784]" />
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
