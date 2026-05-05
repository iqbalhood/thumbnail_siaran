'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ThumbnailPreview } from '@/components/generator/ThumbnailPreview';
import { SpeakerSelect } from '@/components/generator/SpeakerSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Loader2, 
  Download, 
  Type, 
  UserCircle2, 
  Image as ImageIcon, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { exportToPng } from '@/lib/utils/export';

export default function GeneratorPage() {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Form State
  const [title, setTitle] = useState('DIALOG INTERAKTIF: PEMUDA DAN MASA DEPAN ACEH');
  const [selectedPresenterId, setSelectedPresenterId] = useState<string>('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes, bRes] = await Promise.all([
        supabase.from('presenters').select('*').order('name'),
        supabase.from('speakers').select('*').order('full_name'),
        supabase.from('branding_settings').select('*').single(),
      ]);

      setPresenters(pRes.data || []);
      setSpeakers(sRes.data || []);
      setBranding(bRes.data);

      if (pRes.data && pRes.data.length > 0) {
        setSelectedPresenterId(pRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching generator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPresenter = presenters.find((p) => p.id === selectedPresenterId);
  const selectedSpeaker = speakers.find((s) => s.id === selectedSpeakerId);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const fileName = `thumbnail-${title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}-${Date.now()}`;
      await exportToPng('thumbnail-svg', fileName);
    } catch (error: any) {
      alert(`Gagal download: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Menyiapkan Mesin Generator...
        </p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left: Configuration Form */}
        <div className="lg:col-span-5 space-y-8">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={24} className="text-orange-500" />
              Thumbnail Generator
            </h1>
            <p className="text-sm text-slate-500 italic">Isi form di bawah untuk membuat thumbnail dialog.</p>
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
            
            {/* 1. Judul Dialog */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                <Type size={16} className="text-slate-400" />
                Judul Dialog
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul dialog..."
                className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium resize-none"
              />
              <p className="text-[10px] text-slate-400 italic text-right">Maksimum 3 baris untuk hasil terbaik.</p>
            </div>

            {/* 2. Pilih Presenter (Background) */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                <ImageIcon size={16} className="text-slate-400" />
                Pilih Presenter
              </label>
              <div className="grid grid-cols-2 gap-3">
                {presenters.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPresenterId(p.id)}
                    className={`p-3 rounded-2xl border-2 transition-all text-left space-y-2 ${
                      selectedPresenterId === p.id
                        ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-500/10'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="w-full aspect-[3/2] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      {p.background_url ? (
                        <img src={p.background_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider block text-center ${
                      selectedPresenterId === p.id ? 'text-orange-600' : 'text-slate-500'
                    }`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pilih Narasumber */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                <UserCircle2 size={16} className="text-slate-400" />
                Data Narasumber
              </label>
              <SpeakerSelect
                speakers={speakers}
                selectedSpeakerId={selectedSpeakerId}
                onSelect={(speaker) => setSelectedSpeakerId(speaker?.id || null)}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 font-bold group"
              >
                {isExporting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    Download PNG
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Live Preview</h2>
            <button 
              onClick={fetchInitialData}
              className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={14} />
              REFRESH DATA
            </button>
          </div>

          <div className="sticky top-28">
            <ThumbnailPreview
              data={{
                title,
                speakerName: selectedSpeaker?.full_name || 'NAMA NARASUMBER',
                speakerPosition: selectedSpeaker?.position || 'JABATAN NARASUMBER',
                presenterBgUrl: selectedPresenter?.background_url || null,
                speakerPhotoUrl: selectedSpeaker?.photo_url || null,
                rriLogoUrl: branding?.rri_logo_url || null,
                pro1LogoUrl: branding?.pro1_logo_url || null,
              }}
            />
            
            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <RefreshCw size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900">Real-time Rendering</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pratinjau di atas menggunakan teknologi SVG. Apapun yang Anda ketik atau pilih akan langsung terlihat hasilnya secara akurat sebelum diunduh.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
