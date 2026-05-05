'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/storage/upload';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  label: string;
  currentUrl: string | null;
  currentPath: string | null;
  onUploadSuccess: (url: string, path: string) => void;
  onDeleteSuccess: () => void;
  bucket: 'logos';
}

export function LogoUpload({
  label,
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
      const fileName = `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const { publicUrl, storagePath } = await uploadFile(bucket, fileName, file);
      
      onUploadSuccess(publicUrl, storagePath);
    } catch (error: any) {
      alert(`Gagal upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPath || !confirm(`Hapus logo ${label}?`)) return;

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
      
      <div className="relative aspect-[3/1] bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden group border border-slate-800">
        {currentUrl ? (
          <>
            <img 
              src={currentUrl} 
              alt={label} 
              className="max-w-[80%] max-h-[80%] object-contain"
            />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
          <div className="text-slate-500 flex flex-col items-center gap-2">
            <ImageIcon size={24} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Belum ada logo</span>
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
          className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          {currentUrl ? 'Ganti Logo' : 'Upload Logo'}
        </Button>
      </div>
    </div>
  );
}
