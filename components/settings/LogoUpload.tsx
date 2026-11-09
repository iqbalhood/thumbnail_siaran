'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/storage/upload';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload, Trash2, Image as ImageIcon, Sun, Moon } from 'lucide-react';

interface LogoUploadProps {
  label: string;
  sublabel?: string;
  variant?: 'white' | 'dark';
  currentUrl: string | null;
  currentPath: string | null;
  onUploadSuccess: (url: string, path: string) => void;
  onDeleteSuccess: () => void;
  bucket: 'logos';
}

export function LogoUpload({
  label,
  sublabel,
  variant = 'white',
  currentUrl,
  currentPath,
  onUploadSuccess,
  onDeleteSuccess,
  bucket,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${label.toLowerCase().replace(/\s+/g, '-')}-${variant}-${Date.now()}`;
      const { publicUrl, storagePath } = await uploadFile(bucket, fileName, file);
      
      onUploadSuccess(publicUrl, storagePath);
    } catch (error: any) {
      alert(`Gagal upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPath || !confirm(`Hapus logo ${label} (${variant === 'dark' ? 'Dark' : 'White'})?`)) return;

    setIsDeleting(true);
    try {
      await supabase.storage.from(bucket).remove([currentPath]);
      onDeleteSuccess();
    } catch (error: any) {
      alert(`Gagal hapus: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const isDarkVariant = variant === 'dark';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-1">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-slate-800 truncate" title={label}>{label}</h3>
          {sublabel && <p className="text-[10px] text-slate-400">{sublabel}</p>}
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
            isDarkVariant
              ? 'bg-slate-800 text-slate-200 border-slate-700'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isDarkVariant ? <Moon size={10} /> : <Sun size={10} />}
          {isDarkVariant ? 'Dark' : 'White'}
        </span>
      </div>
      
      <div
        className={`relative aspect-[3/1] rounded-lg flex items-center justify-center overflow-hidden group border transition-all ${
          isDarkVariant
            ? 'bg-slate-100 border-slate-200 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px]'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {currentUrl ? (
          <>
            <img 
              src={currentUrl} 
              alt={`${label} (${variant})`} 
              className="max-w-[85%] max-h-[85%] object-contain"
            />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${
              isDarkVariant ? 'bg-slate-900/50' : 'bg-slate-900/60'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-white hover:text-red-400 hover:bg-white/10"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-1">
            <ImageIcon size={20} />
            <span className="text-[9px] uppercase font-bold tracking-wider">Belum ada logo</span>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-orange-500" />
          </div>
        )}
      </div>

      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <Button
          className="w-full h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
        >
          <Upload size={13} />
          {currentUrl ? 'Ganti Logo' : 'Upload Logo'}
        </Button>
      </div>
    </div>
  );
}
