'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogoUpload } from '@/components/settings/LogoUpload';
import { PresenterCard } from '@/components/settings/PresenterCard';
import { PresenterForm } from '@/components/settings/PresenterForm';
import { DialogForm } from '@/components/settings/DialogForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RRI_SOCIAL_MEDIA_IMAGE_PATH } from '@/lib/constants/socialMedia';
import { Loader2, Plus, Settings as SettingsIcon, ExternalLink, Info, Mic2, Edit, Trash, Phone, Sparkles, RotateCcw, LayoutGrid, Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const [branding, setBranding] = useState<any>(null);
  const [presenters, setPresenters] = useState<any[]>([]);
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoTab, setLogoTab] = useState<'all' | 'white' | 'dark'>('all');
  
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
      setPhoneNumber((bData as any)?.phone_number || '0811 6881 2123');

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

  const getBrandingField = (key: string) => {
    if (branding?.[key] !== undefined && branding?.[key] !== null) {
      return branding[key];
    }
    return branding?.thumbnail_settings?.branding_assets?.[key] ?? null;
  };

  const updateBranding = async (updates: any) => {
    try {
      const existingThumbSettings =
        branding?.thumbnail_settings && typeof branding.thumbnail_settings === 'object'
          ? branding.thumbnail_settings
          : {};
      const existingAssets =
        existingThumbSettings.branding_assets && typeof existingThumbSettings.branding_assets === 'object'
          ? existingThumbSettings.branding_assets
          : {};

      const mergedThumbSettings = {
        ...existingThumbSettings,
        branding_assets: {
          ...existingAssets,
          ...updates,
        },
      };

      // Try updating both top-level columns and thumbnail_settings.branding_assets
      const { error } = await (supabase
        .from('branding_settings') as any)
        .update({
          ...updates,
          thumbnail_settings: mergedThumbSettings,
        })
        .eq('id', branding.id);

      if (error) {
        // Fallback if a new column (e.g. social_media_logo_url) hasn't been migrated yet:
        // store inside existing thumbnail_settings JSONB column
        const { error: fallbackErr } = await (supabase
          .from('branding_settings') as any)
          .update({ thumbnail_settings: mergedThumbSettings })
          .eq('id', branding.id);
        if (fallbackErr) throw fallbackErr;
      }

      setBranding({
        ...branding,
        ...updates,
        thumbnail_settings: mergedThumbSettings,
      });
    } catch (error: any) {
      alert(`Gagal update branding: ${error.message}`);
    }
  };

  const handleSavePhone = async () => {
    await updateBranding({ phone_number: phoneNumber });
  };

  const inferDefaultProgram = (dialogName: string): 'PRO 1' | 'PRO 2' | 'PRO 4' => {
    const dUpper = (dialogName || '').toUpperCase();
    if (dUpper.includes('PRO 2') || dUpper.includes('PRO2') || dUpper.includes('OSSI') || dUpper.includes('CEK CERITA')) {
      return 'PRO 2';
    }
    if (dUpper.includes('PRO 4') || dUpper.includes('PRO4')) {
      return 'PRO 4';
    }
    return 'PRO 1';
  };

  const getDialogSavedPreset = (dialog: any) => {
    if (
      dialog?.thumbnail_settings &&
      typeof dialog.thumbnail_settings === 'object' &&
      Object.keys(dialog.thumbnail_settings).length > 0
    ) {
      return dialog.thumbnail_settings;
    }
    const dialogsMap = branding?.thumbnail_settings?.dialogs;
    if (dialogsMap && typeof dialogsMap === 'object') {
      return dialogsMap[dialog.id] || dialogsMap[dialog.name] || null;
    }
    return null;
  };

  const handleResetSingleDialogDefault = async (dialog: any) => {
    if (!confirm(`Reset settingan default untuk acara "${dialog.name}" ke setelan bawaan sistem?`)) return;
    try {
      const existingAssets = branding?.thumbnail_settings?.branding_assets;
      const existingDialogsMap = { ...(branding?.thumbnail_settings?.dialogs || {}) };
      delete existingDialogsMap[dialog.id];
      if (dialog.name) {
        delete existingDialogsMap[dialog.name];
      }

      const newSettingsPayload = {
        ...(existingAssets ? { branding_assets: existingAssets } : {}),
        dialogs: existingDialogsMap,
      };

      try {
        await (supabase.from('dialogs') as any)
          .update({ thumbnail_settings: null })
          .eq('id', dialog.id);
      } catch (e) {
        // Non-blocking if column not migrated yet
      }

      const { error } = await (supabase.from('branding_settings') as any)
        .update({ thumbnail_settings: newSettingsPayload })
        .eq('id', branding.id);
      if (error) throw error;

      setBranding({ ...branding, thumbnail_settings: newSettingsPayload });
      setDialogs((prev) =>
        prev.map((d) => (d.id === dialog.id ? { ...d, thumbnail_settings: null } : d))
      );
    } catch (err: any) {
      alert(`Gagal mereset settingan "${dialog.name}": ${err.message}`);
    }
  };

  const handleResetThumbnailDefaults = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua settingan default acara dan mengembalikan semuanya ke setelan awal sistem?')) return;
    try {
      const existingAssets = branding?.thumbnail_settings?.branding_assets;
      const newSettingsPayload = {
        ...(existingAssets ? { branding_assets: existingAssets } : {}),
        dialogs: {},
      };

      const { error } = await (supabase.from('branding_settings') as any)
        .update({ thumbnail_settings: newSettingsPayload })
        .eq('id', branding.id);
      if (error) throw error;

      try {
        for (const d of dialogs) {
          await (supabase.from('dialogs') as any)
            .update({ thumbnail_settings: null })
            .eq('id', d.id);
        }
      } catch (e) {
        // Non-blocking
      }

      setBranding({ ...branding, thumbnail_settings: newSettingsPayload });
      setDialogs((prev) => prev.map((d) => ({ ...d, thumbnail_settings: null })));
      alert('Semua settingan default acara berhasil di-reset ke setelan awal sistem.');
    } catch (err: any) {
      alert(`Gagal mereset: ${err.message}`);
    }
  };

  const handlePresenterSubmit = async (data: any) => {
    try {
      if (editingPresenter?.id) {
        // UPDATE existing presenter
        const { error } = await (supabase
          .from('presenters') as any)
          .update(data)
          .eq('id', editingPresenter.id);
        if (error) throw error;
      } else {
        // INSERT new presenter
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

  const handleDeletePresenter = async (id: string, path: string | null, portraitPath?: string | null) => {
    if (!confirm('Yakin ingin menghapus presenter ini?')) return;

    try {
      const pathsToDelete = [path, portraitPath].filter(Boolean) as string[];
      if (pathsToDelete.length > 0) {
        await supabase.storage.from('presenters').remove(pathsToDelete);
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

      {/* A. Logo Header Section (White & Dark) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Logo Header (Varian White & Dark)
            </h2>
            <p className="text-xs text-slate-500">
              Upload varian Putih (untuk background gelap) dan varian Dark (untuk background terang/putih).
            </p>
          </div>
          
          {/* Tabs Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setLogoTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                logoTab === 'all'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua Logo
            </button>
            <button
              type="button"
              onClick={() => setLogoTab('white')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                logoTab === 'white'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun size={12} />
              White / Terang
            </button>
            <button
              type="button"
              onClick={() => setLogoTab('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                logoTab === 'dark'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Moon size={12} />
              Dark / Gelap
            </button>
          </div>
        </div>

        {/* Logo Cards / Groups */}
        <div className="space-y-6">
          {/* 1. Logo RRI Banda Aceh */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Logo RRI Banda Aceh
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Logo stasiun utama</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(logoTab === 'all' || logoTab === 'white') && (
                <LogoUpload
                  label="Logo RRI"
                  sublabel="Varian White / Terang (PNG transparan)"
                  variant="white"
                  currentUrl={branding?.rri_logo_url}
                  currentPath={branding?.rri_logo_path}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ rri_logo_url: url, rri_logo_path: path })}
                  onDeleteSuccess={() => updateBranding({ rri_logo_url: null, rri_logo_path: null })}
                />
              )}
              {(logoTab === 'all' || logoTab === 'dark') && (
                <LogoUpload
                  label="Logo RRI"
                  sublabel="Varian Dark / Gelap (PNG transparan)"
                  variant="dark"
                  currentUrl={getBrandingField('rri_logo_dark_url')}
                  currentPath={getBrandingField('rri_logo_dark_path')}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ rri_logo_dark_url: url, rri_logo_dark_path: path })}
                  onDeleteSuccess={() => updateBranding({ rri_logo_dark_url: null, rri_logo_dark_path: null })}
                />
              )}
            </div>
          </div>

          {/* 2. Logo PRO 1 97.7 FM */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Logo Programa 1 (PRO 1 97.7 FM)
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Kanal Berita & Informasi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(logoTab === 'all' || logoTab === 'white') && (
                <LogoUpload
                  label="Logo PRO 1"
                  sublabel="Varian White / Terang (PNG transparan)"
                  variant="white"
                  currentUrl={branding?.pro1_logo_url}
                  currentPath={branding?.pro1_logo_path}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro1_logo_url: url, pro1_logo_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro1_logo_url: null, pro1_logo_path: null })}
                />
              )}
              {(logoTab === 'all' || logoTab === 'dark') && (
                <LogoUpload
                  label="Logo PRO 1"
                  sublabel="Varian Dark / Gelap (PNG transparan)"
                  variant="dark"
                  currentUrl={getBrandingField('pro1_logo_dark_url')}
                  currentPath={getBrandingField('pro1_logo_dark_path')}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro1_logo_dark_url: url, pro1_logo_dark_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro1_logo_dark_url: null, pro1_logo_dark_path: null })}
                />
              )}
            </div>
          </div>

          {/* 3. Logo PRO 2 92.6 FM */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Logo Programa 2 (PRO 2 92.6 FM)
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Kanal Kreativitas Anak Muda</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(logoTab === 'all' || logoTab === 'white') && (
                <LogoUpload
                  label="Logo PRO 2"
                  sublabel="Varian White / Terang (PNG transparan)"
                  variant="white"
                  currentUrl={branding?.pro2_logo_url}
                  currentPath={branding?.pro2_logo_path}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro2_logo_url: url, pro2_logo_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro2_logo_url: null, pro2_logo_path: null })}
                />
              )}
              {(logoTab === 'all' || logoTab === 'dark') && (
                <LogoUpload
                  label="Logo PRO 2"
                  sublabel="Varian Dark / Gelap (PNG transparan)"
                  variant="dark"
                  currentUrl={getBrandingField('pro2_logo_dark_url')}
                  currentPath={getBrandingField('pro2_logo_dark_path')}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro2_logo_dark_url: url, pro2_logo_dark_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro2_logo_dark_url: null, pro2_logo_dark_path: null })}
                />
              )}
            </div>
          </div>

          {/* 4. Logo PRO 4 87.6 FM */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Logo Programa 4 (PRO 4 87.6 FM)
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Kanal Budaya & Musik Tradisional</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(logoTab === 'all' || logoTab === 'white') && (
                <LogoUpload
                  label="Logo PRO 4"
                  sublabel="Varian White / Terang (PNG transparan)"
                  variant="white"
                  currentUrl={branding?.pro4_logo_url}
                  currentPath={branding?.pro4_logo_path}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro4_logo_url: url, pro4_logo_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro4_logo_url: null, pro4_logo_path: null })}
                />
              )}
              {(logoTab === 'all' || logoTab === 'dark') && (
                <LogoUpload
                  label="Logo PRO 4"
                  sublabel="Varian Dark / Gelap (PNG transparan)"
                  variant="dark"
                  currentUrl={getBrandingField('pro4_logo_dark_url')}
                  currentPath={getBrandingField('pro4_logo_dark_path')}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ pro4_logo_dark_url: url, pro4_logo_dark_path: path })}
                  onDeleteSuccess={() => updateBranding({ pro4_logo_dark_url: null, pro4_logo_dark_path: null })}
                />
              )}
            </div>
          </div>

          {/* 5. Logo HUT RI (Kemerdekaan) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Logo Kemerdekaan (HUT RI)
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Logo peringatan kemerdekaan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(logoTab === 'all' || logoTab === 'white') && (
                <LogoUpload
                  label="Logo HUT RI"
                  sublabel="Varian White / Terang (PNG transparan)"
                  variant="white"
                  currentUrl={branding?.hut_ri_logo_url}
                  currentPath={branding?.hut_ri_logo_path}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ hut_ri_logo_url: url, hut_ri_logo_path: path })}
                  onDeleteSuccess={() => updateBranding({ hut_ri_logo_url: null, hut_ri_logo_path: null })}
                />
              )}
              {(logoTab === 'all' || logoTab === 'dark') && (
                <LogoUpload
                  label="Logo HUT RI"
                  sublabel="Varian Dark / Gelap (PNG transparan)"
                  variant="dark"
                  currentUrl={getBrandingField('hut_ri_logo_dark_url')}
                  currentPath={getBrandingField('hut_ri_logo_dark_path')}
                  bucket="logos"
                  onUploadSuccess={(url, path) => updateBranding({ hut_ri_logo_dark_url: url, hut_ri_logo_dark_path: path })}
                  onDeleteSuccess={() => updateBranding({ hut_ri_logo_dark_url: null, hut_ri_logo_dark_path: null })}
                />
              )}
            </div>
          </div>

          {/* 6. Gambar / Kontainer Sosial Media (Pojok Kiri Bawah) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                Gambar / Kontainer Sosial Media (Pojok Kiri Bawah)
              </h3>
              <span className="text-[11px] font-medium text-slate-400">Tampil langsung di pojok kiri bawah tanpa editan</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <LogoUpload
                label="Gambar Sosial Media"
                sublabel="Upload gambar kontainer sosmed (PNG/JPG). Jika dihapus, otomatis kembali ke gambar bawaan."
                variant="dark"
                currentUrl={getBrandingField('social_media_logo_url') || RRI_SOCIAL_MEDIA_IMAGE_PATH}
                currentPath={getBrandingField('social_media_logo_path')}
                bucket="logos"
                onUploadSuccess={(url, path) => updateBranding({ social_media_logo_url: url, social_media_logo_path: path })}
                onDeleteSuccess={() => updateBranding({ social_media_logo_url: null, social_media_logo_path: null })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* B. Contact Info Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Informasi Kontak</h2>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Phone size={16} className="text-slate-400" />
              Nomor Info Promosi & Kerjasama
            </label>
            <div className="flex gap-3">
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0811 6881 2123"
                className="bg-slate-50 rounded-xl"
              />
              <Button 
                onClick={handleSavePhone} 
                className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 whitespace-nowrap"
              >
                Simpan
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 italic ml-1">
              Nomor ini akan tampil di bagian bawah thumbnail promosi.
            </p>
          </div>
        </div>
      </section>

      {/* C. Dialog Section */}
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

        {dialogs.length > 0 ? (
          <div className="space-y-8">
            {dialogs.map((dialog) => {
              const dialogPresenters = presenters.filter((p) => p.dialog_id === dialog.id);
              return (
                <div key={dialog.id} className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Mic2 size={14} className="text-orange-500" />
                      {dialog.name}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingPresenter({ dialog_id: dialog.id });
                        setIsModalOpen(true);
                      }}
                      className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 hover:underline"
                    >
                      <Plus size={12} />
                      Tambah Presenter
                    </button>
                  </div>

                  {dialogPresenters.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {dialogPresenters.map((p) => (
                        <PresenterCard
                          key={p.id}
                          presenter={p}
                          onEdit={() => {
                            setEditingPresenter(p);
                            setIsModalOpen(true);
                          }}
                          onDelete={() => handleDeletePresenter(p.id, p.background_path, p.background_portrait_path)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-slate-400 italic">Belum ada presenter untuk dialog ini.</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Orphan/Legacy Presenters Group */}
            {presenters.filter((p) => !p.dialog_id).length > 0 && (
              <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    Tanpa Dialog (Legacy)
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {presenters.filter((p) => !p.dialog_id).map((p) => (
                    <PresenterCard
                      key={p.id}
                      presenter={p}
                      onEdit={() => {
                        setEditingPresenter(p);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => handleDeletePresenter(p.id, p.background_path, p.background_portrait_path)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
              <Plus size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Belum ada presenter</p>
              <p className="text-xs text-slate-500">Buat dialog terlebih dahulu untuk mulai menambahkan presenter.</p>
            </div>
          </div>
        )}
      </section>

      {/* D. Template Thumbnail Default Per Acara / Poster */}
      <section className="bg-white rounded-2xl border border-slate-100 p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-orange-500" />
              Settingan Template Default Per Acara / Poster
            </h2>
            <p className="text-xs text-slate-500">
              Setiap acara/dialog memiliki settingan default masing-masing yang otomatis dimuat saat tombol acara di-klik di Generator.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {dialogs.some((d) => Boolean(getDialogSavedPreset(d))) && (
              <Button
                variant="outline"
                onClick={handleResetThumbnailDefaults}
                className="text-xs text-slate-600 hover:text-red-600 border-slate-200"
              >
                <RotateCcw size={14} className="mr-1.5" />
                Reset Semua Acara
              </Button>
            )}
            <a
              href="/generator"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <LayoutGrid size={14} />
              Buka Generator
            </a>
          </div>
        </div>

        {dialogs.length > 0 ? (
          <div className="space-y-4">
            {dialogs.map((d) => {
              const saved = getDialogSavedPreset(d);
              const isCustomized = Boolean(saved);
              const program = saved?.selectedProgram || inferDefaultProgram(d.name);
              const formatLabel = saved?.designFormat === 'poster' ? 'Poster (4:5)' : 'YouTube (16:9)';
              const titleColorVal = saved?.titleColor || '#FFFFFF';
              const infoColorVal = saved?.infoColor || '#FFFFFF';
              const speakerColorVal = saved?.speakerColor || '#FFFFFF';
              const promoColorVal = saved?.promoColor || '#FFFFFF';
              const rriTheme = saved?.rriLogoTheme || 'white';
              const progTheme = saved?.programLogoTheme || 'white';
              const showEvent = saved?.showEventName !== undefined ? saved.showEventName : true;
              const xOffset = saved?.titleXOffset || 0;
              const yOffset = saved?.titleYOffset || 0;

              return (
                <div
                  key={d.id}
                  className={`rounded-2xl border p-5 space-y-4 transition-all ${
                    isCustomized
                      ? 'bg-orange-50/20 border-orange-200/80 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCustomized ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Mic2 size={15} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {d.name}
                      </h3>
                      {isCustomized ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ✓ Default Custom Tersimpan
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/80 text-slate-600">
                          Default Sistem ({program})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCustomized && (
                        <button
                          type="button"
                          onClick={() => handleResetSingleDialogDefault(d)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw size={12} />
                          Reset
                        </button>
                      )}
                      <a
                        href={`/generator?dialog=${encodeURIComponent(d.id)}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <LayoutGrid size={12} />
                        Atur {d.name}
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Format & Nama Acara</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {formatLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Teks Acara: <strong>{showEvent ? 'Tampil' : 'Sembunyi'}</strong>
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Programa & Tema Logo</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {program}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 capitalize">
                        RRI: <strong>{rriTheme}</strong> · Pro: <strong>{progTheme}</strong>
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Warna & Posisi Judul</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: titleColorVal }}
                          title={`Judul: ${titleColorVal}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: infoColorVal }}
                          title={`Info: ${infoColorVal}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: speakerColorVal }}
                          title={`Narasumber: ${speakerColorVal}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: promoColorVal }}
                          title={`Info & Kerjasama: ${promoColorVal}`}
                        />
                        <span className="text-[11px] font-bold text-slate-800 font-mono ml-0.5">
                          {titleColorVal}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Offset X: <strong>{xOffset}px</strong> · Y: <strong>{yOffset}px</strong>
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Terakhir Disimpan</span>
                      <span className="text-xs font-medium text-slate-700 truncate block mt-0.5">
                        {saved?.updatedBy || 'Belum diatur (Default)'}
                      </span>
                      {saved?.updatedAt && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(saved.updatedAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <Info size={16} className="text-orange-500 shrink-0" />
            <span>Belum ada dialog/acara yang terdaftar. Tambahkan dialog terlebih dahulu di atas.</span>
          </div>
        )}
      </section>

      {/* E. Admin Accounts Info */}
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
