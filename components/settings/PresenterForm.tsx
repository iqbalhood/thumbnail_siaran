'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { uploadFile } from '@/lib/storage/upload';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface PresenterFormProps {
  initialData?: {
    id: string;
    name: string;
    background_url: string | null;
    background_path: string | null;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function PresenterForm({ initialData, onSubmit, onCancel }: PresenterFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [bgUrl, setBgUrl] = useState(initialData?.background_url || '');
  const [bgPath, setBgPath] = useState(initialData?.background_path || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `bg-${name.toLowerCase().replace(/\s+/g, '-') || 'presenter'}-${Date.now()}`;
      const { publicUrl, storagePath } = await uploadFile('presenters', fileName, file);
      setBgUrl(publicUrl);
      setBgPath(storagePath);
    } catch (error: any) {
      alert(`Gagal upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        background_url: bgUrl,
        background_path: bgPath,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nama Presenter</label>
        <Input
          placeholder="Contoh: Dimas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Background Thumbnail (1280x720)</label>
        <div className="relative aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group">
          {bgUrl ? (
            <img src={bgUrl} alt="Background Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-500 flex flex-col items-center gap-2">
              <ImageIcon size={32} />
              <span className="text-xs font-medium uppercase tracking-wider">No Background</span>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          )}

          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-xl flex items-center gap-2">
              <Upload size={14} />
              {bgUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 italic">
          Rekomendasi: PNG/JPG 1280×720 dengan foto presenter di sisi kanan.
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
          disabled={isSubmitting || isUploading || !name}
          className="flex-1 h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
