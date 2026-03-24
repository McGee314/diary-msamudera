import React, { useState, useEffect } from 'react';
import { collection, db, query, orderBy, onSnapshot, deleteDoc, doc } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
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

  if (loading) return <div className="text-center py-20 italic">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your diary entries</p>
        </div>
        <Link 
          to="/admin/new"
          className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors"
        >
          <Plus size={16} />
          New Entry
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Date</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Title</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm text-stone-500 font-mono">
                  {format(post.publishedAt.toDate(), 'yyyy-MM-dd')}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-stone-900">{post.title}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      to={`/admin/edit/${post.id}`}
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    <Link 
                      to="/"
                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      title="View"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-stone-400 italic">
                  No entries yet. Start writing!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
