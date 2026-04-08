"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, 
  isWithinInterval, isToday, startOfDay 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, StickyNote, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface Note {
  id: string;
  range: { start: Date; end: Date };
  text: string;
  color: string;
}

const HOLIDAYS = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-07-04', name: "Independence Day" },
  { date: '2026-12-25', name: "Christmas" },
];

const NOTE_COLORS = ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200'];

export default function WallCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selection, setSelection] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('calendar_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed.map((n: any) => ({
          ...n, 
          range: { start: new Date(n.range.start), end: new Date(n.range.end) }
        })));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('calendar_notes', JSON.stringify(notes));
    }
  }, [notes]);

  const calendarGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    const normalizedDate = startOfDay(date);
    
    // Logic: If no start or already have a full range, start fresh
    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: normalizedDate, end: null });
    } else {
      // If clicking a date before the start, make that the new start
      if (normalizedDate < selection.start) {
        setSelection({ start: normalizedDate, end: selection.start });
      } else {
        setSelection({ ...selection, end: normalizedDate });
      }
    }
  };

  const addNote = () => {
    if (!noteInput || !selection.start || !selection.end) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      range: { start: selection.start, end: selection.end },
      text: noteInput,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
    };
    setNotes([newNote, ...notes]);
    setNoteInput("");
  };

  const deleteNote = (id: string) => setNotes(notes.filter(n => n.id !== id));

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
      
      {/* Hero Section */}
      <section className="relative lg:w-1/3 bg-stone-900 min-h-[200px]">
        <motion.img 
          key={currentMonth.getMonth()}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800&sig=${currentMonth.getMonth()}`}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          alt="Season"
        />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <h1 className="text-6xl font-serif">{format(currentMonth, 'MMMM')}</h1>
          <p className="text-2xl font-light opacity-80">{format(currentMonth, 'yyyy')}</p>
        </div>
      </section>

      {/* Grid Section */}
      <main className="flex-1 p-8 flex flex-col bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={18} /> Calendar
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ChevronLeft /></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><ChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-stone-200 border border-stone-200 rounded-xl overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-stone-50 py-3 text-center text-[10px] font-bold text-stone-400 uppercase">{d}</div>
          ))}
          {calendarGrid.map((date, i) => {
            const isStart = selection.start && isSameDay(date, selection.start);
            const isEnd = selection.end && isSameDay(date, selection.end);
            const inRange = selection.start && selection.end && isWithinInterval(date, { start: selection.start, end: selection.end });
            const isHovering = selection.start && !selection.end && hoverDate && 
                               isWithinInterval(date, { 
                                 start: selection.start < hoverDate ? selection.start : hoverDate, 
                                 end: selection.start < hoverDate ? hoverDate : selection.start 
                               });

            return (
              <div 
                key={i}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                className={`h-20 md:h-24 p-2 bg-white cursor-pointer relative transition-all
                  ${date.getMonth() !== currentMonth.getMonth() ? 'text-stone-300' : 'text-stone-700'}
                  ${inRange || isHovering ? 'bg-blue-50' : ''}
                  ${isStart || isEnd ? '!bg-stone-800 !text-white z-10' : ''}
                `}
              >
                <span className={`text-sm font-semibold ${isToday(date) ? 'text-blue-600 underline decoration-2' : ''}`}>
                  {format(date, 'd')}
                </span>
                {HOLIDAYS.find(h => isSameDay(new Date(h.date), date)) && (
                  <div className="w-1 h-1 bg-red-400 rounded-full mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Notes Section */}
      <aside className="lg:w-80 bg-stone-50 p-8 border-l border-stone-200">
        <h3 className="font-bold mb-6 flex items-center gap-2"><StickyNote size={18}/> Notes</h3>
        
        <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto">
          {notes.map(note => (
            <div key={note.id} className={`${note.color} p-4 rounded-xl shadow-sm relative group`}>
              <button onClick={() => deleteNote(note.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
              <p className="text-[10px] font-bold opacity-50">{format(note.range.start, 'MMM d')} - {format(note.range.end, 'MMM d')}</p>
              <p className="text-sm font-medium">{note.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <textarea 
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            disabled={!selection.end}
            placeholder={selection.end ? "Type note here..." : "Select a range first"}
            className="w-full text-sm border-none focus:ring-0 h-20 resize-none"
          />
          <button 
            onClick={addNote}
            disabled={!noteInput || !selection.end}
            className="w-full mt-2 bg-stone-800 text-white py-2 rounded-xl text-xs font-bold disabled:opacity-20"
          >
            Save Note
          </button>
        </div>
      </aside>
    </div>
  );
}