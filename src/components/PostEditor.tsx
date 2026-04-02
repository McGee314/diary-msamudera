import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, collection, doc, getDoc, setDoc, updateDoc, Timestamp } from '../lib/firebase';
import { toast } from 'sonner';
import { Save, ArrowLeft, Eye, Edit3, FileText } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-36 rounded-full" />
          <div className="flex gap-3">
            <div className="skeleton h-9 w-24 rounded-full" />
            <div className="skeleton h-9 w-28 rounded-full" />
          </div>
        </div>
        <div className="glass-card p-10 space-y-6">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-10 w-2/3" />
          <div className="border-t border-[#E8DFD2]/50 pt-6 space-y-3">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formData.content.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin')}
          className="group flex items-center gap-1.5 text-[0.8125rem] text-[#8B8680] hover:text-[#3E3B37] transition-colors duration-200"
        >
          <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPreview(!preview)}
            className="btn-ghost"
          >
            {preview ? <Edit3 size={14} /> : <Eye size={14} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white inline-block"
                style={{ animation: 'spin 0.7s linear infinite' }}
              />
            ) : (
              <Save size={14} />
            )}
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Editor card */}
      <div className="glass-card overflow-hidden">
        {preview ? (
          /* Preview */
          <div className="p-12 min-h-[500px] animate-fade-in">
            <header className="mb-8">
              <div className="badge mb-3">
                {format(new Date(formData.publishedAt), 'MMMM d, yyyy')}
              </div>
              <h1 className="text-4xl font-serif text-[#3E3B37] leading-tight">
                {formData.title || 'Untitled Entry'}
              </h1>
            </header>
            <div className="prose max-w-none prose-headings:font-serif prose-p:leading-[1.85] prose-p:text-[#3E3B37] prose-a:text-[#AEB784] hover:prose-a:text-[#94A86B]">
              <ReactMarkdown>{formData.content || '*No content yet*'}</ReactMarkdown>
            </div>
          </div>
        ) : (
          /* Edit form */
          <form className="divide-y divide-[#E8DFD2]/50">
            {/* Title section */}
            <div className="px-8 pt-8 pb-6 space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784] flex items-center gap-1.5">
                <FileText size={10} />
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Entry Title"
                className="w-full text-[1.625rem] font-serif bg-transparent border-none outline-none placeholder:text-[#E8DFD2] text-[#3E3B37] focus:ring-0 leading-snug"
              />
            </div>

            {/* Date section */}
            <div className="px-8 py-4">
              <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784] block mb-2">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="input-modern w-auto text-sm"
              />
            </div>

            {/* Content section */}
            <div className="px-8 pt-6 pb-4 space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#AEB784]">
                Content (Markdown)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your thoughts here…"
                rows={18}
                className="w-full text-[#3E3B37] bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-[#E8DFD2]/80 leading-[1.85] text-[0.9375rem]"
              />
            </div>

            {/* Status bar */}
            <div
              className="px-8 py-3 flex items-center gap-4 text-[10px] text-[#8B8680]"
              style={{ background: 'rgba(240,235,217,0.3)' }}
            >
              <span>{wordCount} words</span>
              <span className="opacity-40">·</span>
              <span>{charCount} characters</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
