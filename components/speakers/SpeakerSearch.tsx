'use client';

import { Input } from '@/components/ui/Input';
import { Search, X } from 'lucide-react';

interface SpeakerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function SpeakerSearch({ value, onChange }: SpeakerSearchProps) {
  return (
    <div className="relative group max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
        <Search size={18} />
      </div>
      <Input
        type="text"
        placeholder="Cari nama pembicara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
