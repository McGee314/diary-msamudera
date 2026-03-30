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
    return <div className="text-center py-20 text-[#AEB784] italic">Reading entries...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
      <div className="space-y-16">
        {selectedDate && (
          <div className="flex items-center justify-between border-b border-[#E8DFD2] pb-4">
            <h2 className="text-xl font-serif italic text-[#3E3B37]">
              Entries for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <button 
              onClick={() => setSelectedDate(undefined)}
              className="text-xs uppercase tracking-widest text-[#AEB784] hover:text-[#94A86B] transition-colors"
            >
              Show All
            </button>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article key={post.id} className="group">
              <header className="mb-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[#AEB784] mb-2">
                  {format(post.publishedAt.toDate(), 'MMMM d, yyyy')}
                </div>
                <h2 className="text-3xl font-serif leading-tight group-hover:text-[#94A86B] transition-colors text-[#3E3B37]">
                  {post.title}
                </h2>
              </header>
              <div className="prose max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-p:text-[#3E3B37] prose-a:text-[#AEB784] hover:prose-a:text-[#94A86B]">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
              <div className="mt-8 pt-8 border-t border-[#E8DFD2] flex items-center gap-2 text-[#C9846C]">
                <div className="h-px w-8 bg-[#C9846C]" />
                <span className="text-[10px] uppercase tracking-widest">End of Entry</span>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 text-[#8B8680] italic">
            No entries found for this date.
          </div>
        )}
      </div>

      <aside className="space-y-8">
        <div className="bg-[#FFFBF5] p-6 rounded-2xl border border-[#E8DFD2] shadow-sm">
          <div className="flex items-center gap-2 text-[#AEB784] mb-4 px-2">
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
              hasPost: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#C9846C] after:rounded-full"
            }}
            className="border-none"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              caption: "flex justify-between items-center px-2 py-1",
              caption_label: "text-sm font-serif italic text-[#3E3B37]",
              nav: "flex items-center gap-1",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity text-[#3E3B37]"
              ),
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-[#AEB784] rounded-md w-9 font-normal text-[10px] uppercase",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#F0EBD9] rounded-full transition-colors text-[#3E3B37]"
              ),
              day_selected: "bg-[#AEB784] text-[#3E3B37] hover:bg-[#94A86B] hover:text-[#3E3B37] focus:bg-[#AEB784] focus:text-[#3E3B37]",
              day_today: "bg-[#F0EBD9] text-[#3E3B37]",
              day_outside: "text-[#E8DFD2] opacity-50",
              day_disabled: "text-[#E8DFD2] opacity-50",
              day_hidden: "invisible",
            }}
          />
        </div>

        <div className="bg-[#94A86B] text-white p-8 rounded-2xl shadow-md">
          <h3 className="font-serif italic text-xl mb-4">About Samudera</h3>
          <p className="text-sm text-white/90 leading-relaxed">
            Welcome to my personal corner of the web. Here I share thoughts, 
            moments, and reflections on life, technology, and everything in between.
          </p>
        </div>
      </aside>
    </div>
  );
}
