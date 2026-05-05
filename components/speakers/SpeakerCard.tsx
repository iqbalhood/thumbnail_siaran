'use client';

import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, User } from 'lucide-react';

interface SpeakerCardProps {
  speaker: {
    id: string;
    full_name: string;
    position: string | null;
    photo_url: string | null;
    photo_path: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function SpeakerCard({ speaker, onEdit, onDelete }: SpeakerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
      <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100">
        {speaker.photo_url ? (
          <img 
            src={speaker.photo_url} 
            alt={speaker.full_name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <User className="text-slate-300" size={32} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 truncate" title={speaker.full_name}>
          {speaker.full_name}
        </h4>
        <p className="text-xs text-slate-500 truncate" title={speaker.position || ''}>
          {speaker.position || '—'}
        </p>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 hover:bg-slate-700 transition-all shadow-sm"
        >
          <Edit2 size={14} stroke="#FFFFFF" className="!text-white" />
        </Button>
        <Button
          size="icon"
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 hover:bg-red-600 transition-all shadow-sm"
        >
          <Trash2 size={14} stroke="#FFFFFF" className="!text-white" />
        </Button>
      </div>
    </div>
  );
}
