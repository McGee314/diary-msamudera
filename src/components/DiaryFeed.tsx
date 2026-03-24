import React, { useState, useEffect } from 'react';
import { collection, db, query, orderBy, onSnapshot, Timestamp } from '../lib/firebase';
import { format, isSameDay } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: Timestamp;
}

export default function DiaryFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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

  const filteredPosts = selectedDate 
    ? posts.filter(post => isSameDay(post.publishedAt.toDate(), selectedDate))
    : posts;

  const postDates = posts.map(post => post.publishedAt.toDate());

  if (loading) {
    return <div className="text-center py-20 text-stone-400 italic">Reading entries...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
      <div className="space-y-16">
        {selectedDate && (
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-serif italic">
              Entries for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <button 
              onClick={() => setSelectedDate(undefined)}
              className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
            >
              Show All
            </button>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article key={post.id} className="group">
              <header className="mb-6">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
                  {format(post.publishedAt.toDate(), 'MMMM d, yyyy')}
                </div>
                <h2 className="text-3xl font-serif leading-tight group-hover:text-stone-600 transition-colors">
                  {post.title}
                </h2>
              </header>
              <div className="prose prose-stone max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-p:text-stone-700">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
              <div className="mt-8 pt-8 border-t border-stone-100 flex items-center gap-2 text-stone-300">
                <div className="h-px w-8 bg-stone-200" />
                <span className="text-[10px] uppercase tracking-widest">End of Entry</span>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 text-stone-400 italic">
            No entries found for this date.
          </div>
        )}
      </div>

      <aside className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-stone-400 mb-4 px-2">
            <CalendarIcon size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Calendar</span>
          </div>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasPost: postDates
            }}
            modifiersClassNames={{
              hasPost: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-stone-400 after:rounded-full"
            }}
            className="border-none"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-between items-center px-2 py-1",
              caption_label: "text-sm font-serif italic",
              nav: "flex items-center gap-1",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity"
              ),
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-stone-400 rounded-md w-9 font-normal text-[10px] uppercase",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-stone-100 rounded-full transition-colors"
              ),
              day_selected: "bg-stone-900 text-white hover:bg-stone-800 hover:text-white focus:bg-stone-900 focus:text-white",
              day_today: "bg-stone-100 text-stone-900",
              day_outside: "text-stone-300 opacity-50",
              day_disabled: "text-stone-300 opacity-50",
              day_hidden: "invisible",
            }}
          />
        </div>

        <div className="bg-stone-900 text-white p-8 rounded-2xl">
          <h3 className="font-serif italic text-xl mb-4">About Samudera</h3>
          <p className="text-sm text-stone-400 leading-relaxed">
            Welcome to my personal corner of the web. Here I share thoughts, 
            moments, and reflections on life, technology, and everything in between.
          </p>
        </div>
      </aside>
    </div>
  );
}
