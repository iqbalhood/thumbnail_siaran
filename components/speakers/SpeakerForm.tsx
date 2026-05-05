'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { uploadFile } from '@/lib/storage/upload';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface SpeakerFormProps {
  initialData?: {
    id: string;
    full_name: string;
    position: string | null;
    photo_url: string | null;
    photo_path: string | null;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function SpeakerForm({ initialData, onSubmit, onCancel }: SpeakerFormProps) {
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [photoUrl, setPhotoUrl] = useState(initialData?.photo_url || '');
  const [photoPath, setPhotoPath] = useState(initialData?.photo_path || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `speaker-${fullName.toLowerCase().replace(/\s+/g, '-') || 'photo'}-${Date.now()}`;
      const { publicUrl, storagePath } = await uploadFile('speakers', fileName, file);
      setPhotoUrl(publicUrl);
      setPhotoPath(storagePath);
    } catch (error: any) {
      alert(`Gagal upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        full_name: fullName,
        position,
        photo_url: photoUrl,
        photo_path: photoPath,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Nama Lengkap & Gelar</label>
          <Input
            placeholder="Contoh: Dr. Yusran Asnawi, S.Pd. M.Pd."
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Jabatan / Instansi</label>
          <Input
            placeholder="Contoh: Kepala Dinas Sosial Aceh"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Foto Pembicara (Rasio 1:1 / Kotak)</label>
        <div className="relative w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group mx-auto">
          {photoUrl ? (
            <img src={photoUrl} alt="Speaker Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-1">
              <ImageIcon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Photo</span>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          )}

          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer bg-white text-slate-900 p-2 rounded-full shadow-xl flex items-center justify-center">
              <Upload size={16} />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-500 italic mt-2">
          Format PNG/JPG kotak lebih disukai untuk hasil thumbnail terbaik.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg font-medium"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading || !fullName}
          className="flex-1 h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium shadow-lg shadow-slate-900/10"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Pembicara'}
        </Button>
      </div>
    </form>
  );
}
