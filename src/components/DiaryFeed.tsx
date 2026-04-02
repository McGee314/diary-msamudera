import React, { useState, useEffect } from 'react';
import { collection, db, query, orderBy, onSnapshot, Timestamp } from '../lib/firebase';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Calendar as CalendarIcon, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: Timestamp;
}

function SkeletonEntry() {
  return (
    <div className="entry-card space-y-5 pointer-events-none">
      <div className="space-y-3">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-8 w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/6" />
      </div>
    </div>
  );
}

// ─── Custom Calendar ───────────────────────────────────────────────
interface MiniCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  postDates: Date[];
}

function MiniCalendar({ selected, onSelect, postDates }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());

  // Build the grid: full weeks for the current month view
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const hasPost = (day: Date) =>
    postDates.some(d => isSameDay(d, day));

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, viewMonth)) return;
    if (selected && isSameDay(day, selected)) {
      onSelect(undefined);
    } else {
      onSelect(day);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Navigation row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: 'rgba(240,235,217,0)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3E3B37', opacity: 0.5, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,235,217,0.8)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,235,217,0)'; }}
        >
          <ChevronLeft size={14} />
        </button>

        <span style={{ fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: '0.875rem', color: '#3E3B37' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </span>

        <button
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: 'rgba(240,235,217,0)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3E3B37', opacity: 0.5, transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,235,217,0.8)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,235,217,0)'; }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <div
            key={d}
            style={{
              textAlign: 'center', fontSize: '0.5625rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#AEB784', paddingBottom: 6,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {days.map(day => {
          const inMonth = isSameMonth(day, viewMonth);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isCurrentDay = isToday(day);
          const hasDot = hasPost(day);

          let bg = 'transparent';
          let color = inMonth ? '#3E3B37' : '#C9BFB5';
          let fontWeight: number | string = 400;
          let boxShadow = 'none';

          if (isSelected) {
            bg = 'linear-gradient(135deg, #94A86B 0%, #AEB784 100%)';
            color = '#fff';
            fontWeight = 600;
            boxShadow = '0 2px 8px rgba(148,168,107,0.35)';
          } else if (isCurrentDay) {
            bg = 'rgba(240,235,217,0.9)';
            boxShadow = 'inset 0 0 0 1.5px rgba(174,183,132,0.5)';
            fontWeight = 600;
          }

          return (
            <div
              key={day.toISOString()}
              style={{ position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <button
                onClick={() => handleDayClick(day)}
                disabled={!inMonth}
                style={{
                  width: '100%', height: '100%', border: 'none', cursor: inMonth ? 'pointer' : 'default',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: bg, color, fontWeight, boxShadow,
                  fontSize: '0.8rem', fontFamily: 'inherit',
                  opacity: inMonth ? 1 : 0.35,
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isSelected && inMonth) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,235,217,0.8)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected && inMonth) {
                    (e.currentTarget as HTMLButtonElement).style.background = isCurrentDay ? 'rgba(240,235,217,0.9)' : 'transparent';
                  }
                }}
              >
                {format(day, 'd')}
              </button>
              {/* Post indicator dot */}
              {hasDot && inMonth && !isSelected && (
                <span style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: '#C9846C',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────
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
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div className="space-y-8">
          <SkeletonEntry />
          <SkeletonEntry />
        </div>
        <aside>
          <div className="glass-card p-6 skeleton" style={{ height: 280 }} />
        </aside>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
      {/* Feed */}
      <div className="space-y-8 stagger">
        {selectedDate && (
          <div
            className="flex items-center justify-between px-5 py-3.5 rounded-xl animate-fade-in"
            style={{
              background: 'rgba(174,183,132,0.1)',
              border: '1px solid rgba(174,183,132,0.25)',
            }}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon size={13} className="text-[#AEB784]" />
              <h2 className="text-sm font-medium text-[#3E3B37]">
                Entries for{' '}
                <span className="font-serif italic">{format(selectedDate, 'MMMM d, yyyy')}</span>
              </h2>
            </div>
            <button
              onClick={() => setSelectedDate(undefined)}
              className="text-[10px] uppercase tracking-widest text-[#AEB784] hover:text-[#94A86B] transition-colors font-semibold"
            >
              Show All
            </button>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => (
            <article
              key={post.id}
              className="entry-card group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <header className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#AEB784] inline-block"
                      style={{ animation: 'floatDot 2.5s ease-in-out infinite' }}
                    />
                    {format(post.publishedAt.toDate(), 'MMMM d, yyyy')}
                  </span>
                </div>
                <h2 className="text-[1.75rem] font-serif leading-snug text-[#3E3B37] group-hover:text-[#94A86B] transition-colors duration-300">
                  {post.title}
                </h2>
              </header>

              <div className="prose max-w-none prose-headings:font-serif prose-p:leading-[1.85] prose-p:text-[#3E3B37] prose-a:text-[#AEB784] hover:prose-a:text-[#94A86B]">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              <div className="entry-divider">
                <div className="entry-divider-dot" />
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#C9846C] font-semibold">
                  End of Entry
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(174,183,132,0.12)', border: '1px solid rgba(174,183,132,0.2)' }}
            >
              <BookOpen size={22} className="text-[#AEB784]" />
            </div>
            <p className="text-[#8B8680] italic text-sm">No entries found for this date.</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-24 self-start animate-slide-right">
        {/* Calendar card */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-[#AEB784] mb-4">
            <CalendarIcon size={13} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Browse by Date</span>
          </div>
          <MiniCalendar
            selected={selectedDate}
            onSelect={setSelectedDate}
            postDates={postDates}
          />
        </div>

        {/* About card */}
        <div
          className="rounded-[1.25rem] p-6 overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #94A86B 0%, #AEB784 60%, #C4D4A8 100%)',
            boxShadow: '0 4px 24px rgba(148,168,107,0.3), 0 1px 0 rgba(255,255,255,0.25) inset',
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          />
          <div
            className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-15"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          />

          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <BookOpen size={16} className="text-white" />
            </div>
            <h3 className="font-serif italic text-lg text-white mb-2 leading-snug">
              About Samudera
            </h3>
            <p className="text-[0.8125rem] text-white/85 leading-relaxed">
              Welcome to my personal corner of the web. Here I share thoughts,
              moments, and reflections on life, technology, and everything in between.
            </p>
          </div>
        </div>

        {/* Stats pill */}
        {posts.length > 0 && (
          <div
            className="px-5 py-3.5 rounded-xl flex items-center justify-between animate-fade-in"
            style={{
              background: 'rgba(255,251,245,0.7)',
              border: '1px solid rgba(232,223,210,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-[0.75rem] text-[#8B8680]">Total entries</span>
            <span className="text-lg font-serif font-bold text-[#94A86B]">{posts.length}</span>
          </div>
        )}
      </aside>
    </div>
  );
}
