'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

interface DialogFormProps {
  initialData?: {
    id: string;
    name: string;
  };
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
}

export function DialogForm({ initialData, onSubmit, onCancel }: DialogFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim().toUpperCase(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nama Dialog / Acara</label>
        <Input
          placeholder="Contoh: BANDA ACEH MENYAPA"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="uppercase"
          required
        />
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
          disabled={isSubmitting || !name.trim()}
          className="flex-1 h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
