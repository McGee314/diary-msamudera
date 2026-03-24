import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, collection, doc, getDoc, setDoc, updateDoc, Timestamp } from '../lib/firebase';
import { toast } from 'sonner';
import { Save, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishedAt: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const docRef = doc(db, 'posts', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title,
              content: data.content,
              publishedAt: data.publishedAt.toDate().toISOString().split('T')[0]
            });
          } else {
            toast.error('Post not found');
            navigate('/admin');
          }
        } catch (error) {
          toast.error('Error fetching post');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        publishedAt: Timestamp.fromDate(new Date(formData.publishedAt)),
        updatedAt: Timestamp.now(),
        authorUid: auth.currentUser?.uid
      };

      if (id) {
        await updateDoc(doc(db, 'posts', id), postData);
        toast.success('Entry updated successfully');
      } else {
        const newDocRef = doc(collection(db, 'posts'));
        await setDoc(newDocRef, {
          ...postData,
          createdAt: Timestamp.now()
        });
        toast.success('Entry created successfully');
      }
      navigate('/admin');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 italic">Loading editor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin')}
          className="text-stone-400 hover:text-stone-900 flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-full flex items-center gap-2 transition-all"
          >
            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-stone-800 disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {preview ? (
          <div className="p-12 min-h-[500px]">
            <header className="mb-8">
              <div className="text-xs uppercase tracking-widest text-stone-400 mb-2">
                {format(new Date(formData.publishedAt), 'MMMM d, yyyy')}
              </div>
              <h1 className="text-4xl font-serif">{formData.title || 'Untitled Entry'}</h1>
            </header>
            <div className="prose prose-stone max-w-none">
              <ReactMarkdown>{formData.content || '*No content yet*'}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <form className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Entry Title"
                className="w-full text-2xl font-serif border-none focus:ring-0 p-0 placeholder:text-stone-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-1">Publish Date</label>
              <input 
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="block w-full text-sm border-stone-200 rounded-lg focus:ring-stone-900 focus:border-stone-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 px-1">Content (Markdown)</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your thoughts here..."
                rows={15}
                className="w-full text-stone-700 border-none focus:ring-0 p-0 resize-none placeholder:text-stone-200 leading-relaxed"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
