'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogoUpload } from '@/components/settings/LogoUpload';
import { PresenterCard } from '@/components/settings/PresenterCard';
import { PresenterForm } from '@/components/settings/PresenterForm';
import { DialogForm } from '@/components/settings/DialogForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, Settings as SettingsIcon, ExternalLink, Info, Mic2, Edit, Trash } from 'lucide-react';

export default function SettingsPage() {
  const [branding, setBranding] = useState<any>(null);
  const [presenters, setPresenters] = useState<any[]>([]);
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState<any>(null);
  const [isDialogModalOpen, setIsDialogModalOpen] = useState(false);
  const [editingDialog, setEditingDialog] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch branding
      const { data: bData } = await supabase
        .from('branding_settings')
        .select('*')
        .single();
      setBranding(bData);

      // Fetch presenters
      const { data: pData } = await supabase
        .from('presenters')
        .select('*')
        .order('name');
      setPresenters(pData || []);

      // Fetch dialogs
      const { data: dData } = await supabase
        .from('dialogs')
        .select('*')
        .order('name');
      setDialogs(dData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = async (updates: any) => {
    try {
      const { error } = await (supabase
        .from('branding_settings') as any)
        .update(updates)
        .eq('id', branding.id);
      
      if (error) throw error;
      setBranding({ ...branding, ...updates });
    } catch (error: any) {
      alert(`Gagal update branding: ${error.message}`);
    }
  };

  const handlePresenterSubmit = async (data: any) => {
    try {
      if (editingPresenter) {
        const { error } = await (supabase
          .from('presenters') as any)
          .update(data)
          .eq('id', editingPresenter.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('presenters') as any)
          .insert([data]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setEditingPresenter(null);
      fetchData();
    } catch (error: any) {
      alert(`Gagal menyimpan presenter: ${error.message}`);
    }
  };

  const handleDeletePresenter = async (id: string, path: string | null) => {
    if (!confirm('Yakin ingin menghapus presenter ini?')) return;

    try {
      if (path) {
        await supabase.storage.from('presenters').remove([path]);
      }
      const { error } = await supabase.from('presenters').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  const handleDialogSubmit = async (data: { name: string }) => {
    try {
      if (editingDialog) {
        const { error } = await (supabase
          .from('dialogs') as any)
          .update(data)
          .eq('id', editingDialog.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('dialogs') as any)
          .insert([data]);
        if (error) throw error;
      }
      
      setIsDialogModalOpen(false);
      setEditingDialog(null);
      fetchData();
    } catch (error: any) {
      alert(`Gagal menyimpan dialog: ${error.message}`);
    }
  };

  const handleDeleteDialog = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dialog ini? Semua presenter terkait juga akan terhapus.')) return;

    try {
      const { error } = await supabase.from('dialogs').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert(`Gagal menghapus dialog: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon size={24} className="text-orange-500" />
          Settings & Branding
        </h1>
        <p className="text-sm text-slate-500">Kelola logo dan background presenter untuk generator thumbnail.</p>
      </header>

      {/* A. Logo Header Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Logo Header</h2>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <LogoUpload
            label="Logo RRI Banda Aceh"
            currentUrl={branding?.rri_logo_url}
            currentPath={branding?.rri_logo_path}
            bucket="logos"
            onUploadSuccess={(url, path) => updateBranding({ rri_logo_url: url, rri_logo_path: path })}
            onDeleteSuccess={() => updateBranding({ rri_logo_url: null, rri_logo_path: null })}
          />
          <LogoUpload
            label="Logo PRO 1 97.7 FM"
            currentUrl={branding?.pro1_logo_url}
            currentPath={branding?.pro1_logo_path}
            bucket="logos"
            onUploadSuccess={(url, path) => updateBranding({ pro1_logo_url: url, pro1_logo_path: path })}
            onDeleteSuccess={() => updateBranding({ pro1_logo_url: null, pro1_logo_path: null })}
          />
        </div>
      </section>

      {/* B. Dialog Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-lg font-bold text-slate-900">Database Dialog / Acara</h2>
            <div className="h-px flex-1 bg-slate-100 mr-6" />
          </div>
          <Button
            onClick={() => {
              setEditingDialog(null);
              setIsDialogModalOpen(true);
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus size={16} />
            Tambah Dialog
          </Button>
        </div>

        {dialogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dialogs.map((d) => (
              <div key={d.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                    <Mic2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide truncate" title={d.name}>
                      {d.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingDialog(d);
                      setIsDialogModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteDialog(d.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
              <Plus size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Belum ada dialog</p>
              <p className="text-xs text-slate-500">Klik tombol "Tambah Dialog" untuk mulai.</p>
            </div>
          </div>
        )}
      </section>

      {/* C. Presenter Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-lg font-bold text-slate-900">Database Presenter</h2>
            <div className="h-px flex-1 bg-slate-100 mr-6" />
          </div>
          <Button
            onClick={() => {
              setEditingPresenter(null);
              setIsModalOpen(true);
            }}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus size={16} />
            Tambah Presenter
          </Button>
        </div>

        {presenters.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presenters.map((p) => (
              <PresenterCard
                key={p.id}
                presenter={p}
                onEdit={() => {
                  setEditingPresenter(p);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDeletePresenter(p.id, p.background_path)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
              <Plus size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Belum ada presenter</p>
              <p className="text-xs text-slate-500">Klik tombol "Tambah Presenter" untuk mulai.</p>
            </div>
          </div>
        )}
      </section>

      {/* D. Admin Accounts Info */}
      <section className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <SettingsIcon size={120} />
        </div>
        <div className="max-w-md space-y-4 relative z-10">
          <div className="flex items-center gap-2 text-orange-400">
            <Info size={18} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Informasi Akun Admin</h2>
          </div>
          <h3 className="text-xl font-bold">Kelola Akun di Dashboard Supabase</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Untuk menambah, menghapus admin, atau mengubah password, silakan gunakan menu 
            <strong> Authentication</strong> di dashboard Supabase.
          </p>
          <a
            href="https://supabase.com/dashboard/project/qttheourjrhwbmycvohb/auth/users"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/10"
          >
            Buka Supabase Dashboard
            <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* Presenter Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPresenter ? 'Edit Presenter' : 'Tambah Presenter'}
      >
        <PresenterForm
          initialData={editingPresenter}
          dialogs={dialogs}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handlePresenterSubmit}
        />
      </Modal>

      {/* Dialog Modal */}
      <Modal
        isOpen={isDialogModalOpen}
        onClose={() => setIsDialogModalOpen(false)}
        title={editingDialog ? 'Edit Dialog' : 'Tambah Dialog'}
      >
        <DialogForm
          initialData={editingDialog}
          onCancel={() => setIsDialogModalOpen(false)}
          onSubmit={handleDialogSubmit}
        />
      </Modal>
    </main>
  );
}
