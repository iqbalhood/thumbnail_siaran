'use client';

import { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Calendar,
  Clock,
  Mic2
} from 'lucide-react';

import { exportToPng } from '@/lib/utils/export';

// Helper to format Date string (YYYY-MM-DD) to Indonesian format (HARI, DD BULAN YYYY)
const formatIndonesianDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const dateObj = new Date(year, month, day);
  if (isNaN(dateObj.getTime())) return dateString;

  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const months = [
    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
  ];

  const dayName = days[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];

  return `${dayName}, ${day} ${monthName} ${year}`;
};

// Helper to parse Indonesian date format back to YYYY-MM-DD for the native date input
const parseIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const cleanStr = dateStr.toUpperCase().replace(/,/g, '');
    const parts = cleanStr.split(/\s+/);
    
    let dayStr = '';
    let monthStr = '';
    let yearStr = '';
    
    if (parts.length === 4) {
      dayStr = parts[1];
      monthStr = parts[2];
      yearStr = parts[3];
    } else if (parts.length === 3) {
      dayStr = parts[0];
      monthStr = parts[1];
      yearStr = parts[2];
    } else {
      return '';
    }
    
    const months = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    
    const monthIndex = months.indexOf(monthStr);
    if (monthIndex === -1) return '';
    
    const formattedDay = dayStr.padStart(2, '0');
    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    
    if (!/^\d{4}$/.test(yearStr)) return '';
    
    return `${yearStr}-${formattedMonth}-${formattedDay}`;
  } catch (e) {
    return '';
  }
};

export default function GeneratorPage() {
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [allPresenters, setAllPresenters] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Form State
  const [title, setTitle] = useState('SEKOLAH RAKYAT DI ACEH:\nMENJAWAB TANTANGAN PENDIDIKAN PINGGIRAN');
  const [eventName, setEventName] = useState('BANDA ACEH MENYAPA');
  const [selectedDialogId, setSelectedDialogId] = useState<string>('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return formatIndonesianDate(`${yyyy}-${mm}-${dd}`);
  });
  const [time, setTime] = useState('09:00 – 10:00 WIB');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedPresenterId, setSelectedPresenterId] = useState<string>('');
  const [speakerCount, setSpeakerCount] = useState<number>(1);
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<(string | null)[]>([null, null, null, null]);
  const [speakerSpacingOffset, setSpeakerSpacingOffset] = useState<number>(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Presenters filtered by selected dialog
  const presenters = allPresenters.filter((p) => 
    selectedDialogId ? p.dialog_id === selectedDialogId : true
  );

  // Synchronize time picker when manually typing in time text field
  useEffect(() => {
    const match = time.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
    if (match) {
      setStartTime(match[1]);
      setEndTime(match[2]);
    }
  }, [time]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When dialog changes, auto-select first presenter and set eventName
  useEffect(() => {
    if (!selectedDialogId) return;
    const dialog = dialogs.find((d) => d.id === selectedDialogId);
    if (dialog) {
      setEventName(dialog.name);
    }
    const dialogPresenters = allPresenters.filter((p) => p.dialog_id === selectedDialogId);
    if (dialogPresenters.length > 0) {
      setSelectedPresenterId(dialogPresenters[0].id);
    } else {
      setSelectedPresenterId('');
    }
  }, [selectedDialogId, allPresenters, dialogs]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [dRes, pRes, sRes, bRes] = await Promise.all([
        supabase.from('dialogs').select('*').order('name'),
        supabase.from('presenters').select('*').order('name'),
        supabase.from('speakers').select('*').order('full_name'),
        supabase.from('branding_settings').select('*').single(),
      ]);

      const fetchedDialogs = (dRes.data || []) as any[];
      const fetchedPresenters = (pRes.data || []) as any[];

      setDialogs(fetchedDialogs);
      setAllPresenters(fetchedPresenters);
      setSpeakers(sRes.data || []);
      setBranding(bRes.data);

      // Auto-select first dialog
      if (fetchedDialogs.length > 0) {
        setSelectedDialogId(fetchedDialogs[0].id);
        setEventName(fetchedDialogs[0].name);
      }

      // If no dialogs exist yet, fallback to first presenter
      if (fetchedDialogs.length === 0 && fetchedPresenters.length > 0) {
        setSelectedPresenterId(fetchedPresenters[0].id);
      }
    } catch (error) {
      console.error('Error fetching generator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPresenter = allPresenters.find((p) => p.id === selectedPresenterId);
  
  // Resolve speakers for the preview
  const resolvedSpeakers = selectedSpeakerIds.slice(0, speakerCount).map((id) => {
    const speaker = speakers.find((s) => s.id === id);
    return {
      name: speaker?.full_name || 'NAMA NARASUMBER',
      position: speaker?.position || 'JABATAN NARASUMBER',
      photoUrl: speaker?.photo_url || null,
    };
  });

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

  const handleSpeakerSelect = (index: number, speakerId: string | null) => {
    const newIds = [...selectedSpeakerIds];
    newIds[index] = speakerId;
    setSelectedSpeakerIds(newIds);
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

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* 1. Judul Dialog */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                <Type size={16} className="text-slate-400" />
                Judul Dialog (Gunakan ENTER untuk baris baru)
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul dialog..."
                className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium resize-none uppercase"
              />
            </div>

            {/* 2. Dialog, Tanggal, Jam */}
            <div className="space-y-4">
              {/* Pilih Dialog */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Mic2 size={12} className="text-slate-400" />
                  Nama Acara / Dialog
                </label>
                {dialogs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dialogs.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDialogId(d.id)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                          selectedDialogId === d.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-500/10'
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input value={eventName} onChange={(e) => setEventName(e.target.value)} className="bg-slate-50 rounded-xl" placeholder="Nama acara..." />
                )}
              </div>

              {/* Tanggal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  Tanggal
                </label>
                <div className="relative flex items-center">
                  <Input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 rounded-xl pr-12 uppercase font-medium"
                    placeholder="SELASA, 29 JULI 2025"
                  />
                  {/* Hidden native date input — triggered programmatically via ref */}
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={parseIndonesianDate(date)}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDate(formatIndonesianDate(e.target.value));
                      }
                    }}
                    className="sr-only"
                    style={{ colorScheme: 'light' }}
                  />
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="absolute right-3 flex items-center justify-center p-1 rounded-lg hover:bg-orange-50 transition-colors group"
                    title="Pilih tanggal"
                  >
                    <Calendar size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Jam */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" />
                  Jam Siaran
                </label>
                {/* Time Range Picker */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStartTime(val);
                      setTime(`${val} – ${endTime} WIB`);
                    }}
                    className="bg-transparent text-slate-700 font-bold text-sm focus:outline-none cursor-pointer"
                    style={{ colorScheme: 'light' }}
                  />
                  <span className="text-slate-400 font-medium text-sm">–</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEndTime(val);
                      setTime(`${startTime} – ${val} WIB`);
                    }}
                    className="bg-transparent text-slate-700 font-bold text-sm focus:outline-none cursor-pointer"
                    style={{ colorScheme: 'light' }}
                  />
                  <span className="text-slate-500 font-bold text-sm bg-slate-200 px-2 py-0.5 rounded-md ml-auto">WIB</span>
                </div>
                {/* Preview text */}
                <p className="text-xs text-slate-400 ml-1">Preview: <span className="font-semibold text-slate-600">{time}</span></p>
              </div>
            </div>

            {/* 3. Pilih Presenter (Background) */}
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

            {/* 4. Pilih Narasumber */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                  <UserCircle2 size={16} className="text-slate-400" />
                  Jumlah Pembicara
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSpeakerCount(n)}
                      className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                        speakerCount === n ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: speakerCount }).map((_, i) => (
                  <SpeakerSelect
                    key={i}
                    speakers={speakers}
                    selectedSpeakerId={selectedSpeakerIds[i]}
                    onSelect={(speaker) => handleSpeakerSelect(i, speaker?.id || null)}
                  />
                ))}
              </div>
            </div>

            {/* 5. Atur Jarak Pembicara */}
            {speakerCount > 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-slate-400">↔️</span>
                    Jarak Antar Pembicara
                  </label>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{speakerSpacingOffset > 0 ? `+${speakerSpacingOffset}` : speakerSpacingOffset} px</span>
                </div>
                <input 
                  type="range" 
                  min="-100" 
                  max="100" 
                  step="5"
                  value={speakerSpacingOffset} 
                  onChange={(e) => setSpeakerSpacingOffset(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            )}

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
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Live Preview (1280 × 720)</h2>
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
                eventName,
                date,
                time,
                presenterBgUrl: selectedPresenter?.background_url || null,
                speakers: resolvedSpeakers,
                rriLogoUrl: branding?.rri_logo_url || null,
                pro1LogoUrl: branding?.pro1_logo_url || null,
                speakerSpacingOffset,
                phoneNumber: branding?.phone_number || '0811 6881 2123',
              }}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
