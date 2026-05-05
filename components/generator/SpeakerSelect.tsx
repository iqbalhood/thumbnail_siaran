'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Search, User, Check, ChevronsUpDown, Loader2 } from 'lucide-react';

interface Speaker {
  id: string;
  full_name: string;
  position: string | null;
  photo_url: string | null;
}

interface SpeakerSelectProps {
  speakers: Speaker[];
  selectedSpeakerId: string | null;
  onSelect: (speaker: Speaker | null) => void;
  isLoading?: boolean;
}

export function SpeakerSelect({ speakers, selectedSpeakerId, onSelect, isLoading }: SpeakerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSpeaker = speakers.find((s) => s.id === selectedSpeakerId) || null;

  const filteredSpeakers = speakers.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-sm font-semibold text-slate-700 block mb-2 ml-1">
        Pilih Pembicara
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 h-12 bg-white border border-slate-200 rounded-xl hover:border-orange-300 transition-all text-left shadow-sm focus:ring-2 focus:ring-orange-500/20"
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Memuat data...</span>
          </div>
        ) : selectedSpeaker ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
              {selectedSpeaker.photo_url ? (
                <img src={selectedSpeaker.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={16} />
                </div>
              )}
            </div>
            <span className="truncate text-sm font-medium text-slate-900">{selectedSpeaker.full_name}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm italic">Cari narasumber...</span>
        )}
        <ChevronsUpDown size={18} className="text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                autoFocus
                placeholder="Cari nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 focus:ring-orange-500 rounded-xl text-sm"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {filteredSpeakers.length > 0 ? (
              filteredSpeakers.map((speaker) => (
                <button
                  key={speaker.id}
                  type="button"
                  onClick={() => {
                    onSelect(speaker);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedSpeakerId === speaker.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                      {speaker.photo_url ? (
                        <img src={speaker.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-bold truncate">{speaker.full_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                        {speaker.position || 'Narasumber'}
                      </p>
                    </div>
                  </div>
                  {selectedSpeakerId === speaker.id && (
                    <div className="bg-orange-500 text-white rounded-full p-1 shadow-sm shadow-orange-500/20">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-slate-500 italic">Tidak menemukan "{searchQuery}"</p>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    // This could link to speakers page
                  }}
                  className="text-xs font-bold text-orange-600 uppercase tracking-widest hover:underline"
                >
                  Kelola Database →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
