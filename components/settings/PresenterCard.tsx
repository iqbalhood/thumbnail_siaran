'use client';

import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

interface PresenterCardProps {
  presenter: {
    id: string;
    name: string;
    background_url: string | null;
    background_path: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function PresenterCard({ presenter, onEdit, onDelete }: PresenterCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {presenter.background_url ? (
          <img 
            src={presenter.background_url} 
            alt={presenter.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-1">
            <ImageIcon size={24} />
            <span className="text-[10px] uppercase font-bold tracking-widest">No Background</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute bottom-3 left-3">
          <h4 className="text-white font-bold text-sm drop-shadow-md">{presenter.name}</h4>
        </div>
      </div>
      <div className="p-3 flex items-center justify-end gap-2 bg-slate-50/50">
        <Button
          size="icon"
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:shadow-sm transition-all"
        >
          <Edit2 size={14} stroke="#FFFFFF" className="!text-white" />
        </Button>
        <Button
          size="icon"
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-600 hover:shadow-sm transition-all"
        >
          <Trash2 size={14} stroke="#FFFFFF" className="!text-white" />
        </Button>
      </div>
    </div>
  );
}
