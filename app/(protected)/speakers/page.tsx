'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SpeakerCard } from '@/components/speakers/SpeakerCard';
import { SpeakerForm } from '@/components/speakers/SpeakerForm';
import { SpeakerSearch } from '@/components/speakers/SpeakerSearch';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, Users, Database } from 'lucide-react';

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [filteredSpeakers, setFilteredSpeakers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<any>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  useEffect(() => {
    const filtered = speakers.filter((s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.position && s.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredSpeakers(filtered);
  }, [searchQuery, speakers]);

  const fetchSpeakers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      setSpeakers(data || []);
    } catch (error) {
      console.error('Error fetching speakers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakerSubmit = async (data: any) => {
    try {
      if (editingSpeaker) {
        const { error } = await (supabase
          .from('speakers') as any)
          .update(data)
          .eq('id', editingSpeaker.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('speakers') as any)
          .insert([data]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingSpeaker(null);
      fetchSpeakers();
    } catch (error: any) {
      alert(`Gagal menyimpan pembicara: ${error.message}`);
    }
  };

  const handleDeleteSpeaker = async (id: string, path: string | null) => {
    if (!confirm('Yakin ingin menghapus pembicara ini?')) return;

    try {
      if (path) {
        await supabase.storage.from('speakers').remove([path]);
      }
      const { error } = await supabase.from('speakers').delete().eq('id', id);
      if (error) throw error;
      fetchSpeakers();
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} className="text-orange-500" />
            Database Pembicara
          </h1>
          <p className="text-sm text-slate-500">Daftar narasumber dialog yang terdaftar di sistem.</p>
        </div>
        
        <Button
          onClick={() => {
            setEditingSpeaker(null);
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all shrink-0"
        >
          <Plus size={18} />
          Tambah Pembicara
        </Button>
      </header>

      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <SpeakerSearch value={searchQuery} onChange={setSearchQuery} />
        
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <Database size={14} />
            <span>Total: {speakers.length}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span>RRI Banda Aceh</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p className="text-sm text-slate-500 font-medium animate-pulse">Memuat data pembicara...</p>
        </div>
      ) : filteredSpeakers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpeakers.map((s) => (
            <SpeakerCard
              key={s.id}
              speaker={s}
              onEdit={() => {
                setEditingSpeaker(s);
                setIsModalOpen(true);
              }}
              onDelete={() => handleDeleteSpeaker(s.id, s.photo_path)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md text-slate-300">
            <Users size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? 'Pembicara tidak ditemukan' : 'Database masih kosong'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              {searchQuery 
                ? `Tidak ada hasil untuk "${searchQuery}". Coba kata kunci lain.`
                : 'Mulai dengan menambahkan pembicara baru ke dalam sistem.'}
            </p>
          </div>
          {!searchQuery && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Tambah Sekarang
            </Button>
          )}
        </div>
      )}

      {/* Speaker Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpeaker ? 'Edit Data Pembicara' : 'Tambah Pembicara Baru'}
      >
        <SpeakerForm
          initialData={editingSpeaker}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSpeakerSubmit}
        />
      </Modal>
    </main>
  );
}
