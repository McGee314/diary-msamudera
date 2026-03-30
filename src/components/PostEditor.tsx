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
          className="text-[#AEB784] hover:text-[#94A86B] flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 text-sm font-medium text-[#8B8680] hover:bg-[#F0EBD9] rounded-full flex items-center gap-2 transition-all"
          >
            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#94A86B] text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#AEB784] disabled:opacity-50 transition-all shadow-md shadow-[#AEB784]/20"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="bg-[#FFFBF5] rounded-2xl border border-[#E8DFD2] shadow-md overflow-hidden">
        {preview ? (
          <div className="p-12 min-h-[500px]">
            <header className="mb-8">
              <div className="text-xs uppercase tracking-widest text-[#AEB784] mb-2">
                {format(new Date(formData.publishedAt), 'MMMM d, yyyy')}
              </div>
              <h1 className="text-4xl font-serif text-[#3E3B37]">{formData.title || 'Untitled Entry'}</h1>
            </header>
            <div className="prose max-w-none prose-headings:font-serif prose-p:text-[#3E3B37] prose-a:text-[#AEB784] hover:prose-a:text-[#94A86B]">
              <ReactMarkdown>{formData.content || '*No content yet*'}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <form className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#AEB784] px-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Entry Title"
                className="w-full text-2xl font-serif border-none focus:ring-0 p-0 bg-[#FFFBF5] placeholder:text-[#E8DFD2] text-[#3E3B37]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#AEB784] px-1">Publish Date</label>
              <input 
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="block w-full text-sm border-[#E8DFD2] rounded-lg focus:ring-[#AEB784] focus:border-[#AEB784] bg-[#F8F3E1] text-[#3E3B37]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#AEB784] px-1">Content (Markdown)</label>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your thoughts here..."
                rows={15}
                className="w-full text-[#3E3B37] border-none focus:ring-0 p-0 bg-[#FFFBF5] resize-none placeholder:text-[#E8DFD2] leading-relaxed"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
