import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lock, Image as ImageIcon, Settings as SettingsIcon, Users, LayoutGrid,
  Download, Plus, Edit2, Trash2, X, Upload, LogOut, Calendar, Clock,
  Eye, EyeOff, Radio, Mic, Check, AlertCircle, Search, ChevronDown
} from 'lucide-react';

// ============================================
// KONSTANTA & DATA AWAL (Mockup — nanti dari Firebase)
// ============================================
const DEFAULT_PASSWORD = 'admin123';

const SAMPLE_SPEAKERS = [
  {
    id: 's1',
    fullName: 'Dr. Yusran Asnawi, S.Pd. M.Pd.',
    position: 'Wakil Dekan Bidang Kemahasiswaan dan Kerjasama Fakultas Tarbiyah dan Keguruan UIN Ar-Raniry Banda Aceh',
    photoUrl: null,
  },
  {
    id: 's2',
    fullName: 'Syarwan Joni, S.Pd., M.Pd',
    position: 'Kepala Bidang Pembinaan SMA & PKLK pada Dinas Pendidikan Aceh',
    photoUrl: null,
  },
  {
    id: 's3',
    fullName: 'Dr. Muslem Yacob, S.Ag, M.Pd',
    position: 'Kepala Dinas Sosial Aceh',
    photoUrl: null,
  },
];

const SAMPLE_PRESENTERS = [
  { id: 'pr1', name: 'Dimas', backgroundUrl: null },
  { id: 'pr2', name: 'Ammar', backgroundUrl: null },
];

// ============================================
// UTIL: Convert file -> base64 (untuk mockup, di Firebase nanti pakai Storage)
// ============================================
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ============================================
// LOGIN SCREEN
// ============================================
const LoginScreen = ({ onLogin, savedPassword }) => {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === savedPassword) {
      setError('');
      onLogin();
    } else {
      setError('Password salah. Coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at top, #1e3a8a 0%, #0c1e4a 60%, #060f2c 100%)',
        fontFamily: 'Inter, sans-serif'
      }}>
      {/* Decorative triangles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-10 left-10 opacity-30" width="120" height="120" viewBox="0 0 100 100">
          <polygon points="50,10 90,80 10,80" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
        </svg>
        <svg className="absolute bottom-20 right-20 opacity-30" width="100" height="100" viewBox="0 0 100 100">
          <polygon points="50,10 90,80 10,80" fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
        </svg>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, #84cc16 0%, transparent 70%)', opacity: 0.25, filter: 'blur(40px)' }}/>
      </div>

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
            <Radio className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Thumbnail Generator
          </h1>
          <p className="text-slate-500 text-sm mt-1">RRI PRO 1 Banda Aceh 97.7 FM</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Admin</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>
              <span>{error}</span>
            </div>
          )}

          <button onClick={handleSubmit}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors">
            Masuk
          </button>

          <p className="text-xs text-center text-slate-400">
            Default password: <code className="bg-slate-100 px-1.5 py-0.5 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// THUMBNAIL PREVIEW (SVG-based, scalable)
// ============================================
const ThumbnailPreview = ({ data, presenter, logos, scale = 1 }) => {
  const W = 1280, H = 720;
  const speakers = data.speakers || [];
  const count = speakers.length;

  // Layout positions for speakers (max 4)
  const speakerLayouts = {
    1: [{ x: 380, y: 380 }],
    2: [{ x: 290, y: 380 }, { x: 470, y: 380 }],
    3: [{ x: 200, y: 380 }, { x: 380, y: 380 }, { x: 560, y: 380 }],
    4: [{ x: 130, y: 380 }, { x: 290, y: 380 }, { x: 450, y: 380 }, { x: 610, y: 380 }],
  };
  const positions = speakerLayouts[count] || [];
  const circleR = count <= 2 ? 70 : count === 3 ? 65 : 55;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * scale} height={H * scale}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
      xmlns="http://www.w3.org/2000/svg">
      {/* === BACKGROUND === Pakai image dari setting presenter, atau fallback */}
      <defs>
        <linearGradient id="circleRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#1e40af"/>
        </linearGradient>
        <radialGradient id="fallbackBg" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#1e3a8a"/>
          <stop offset="60%" stopColor="#0c1e4a"/>
          <stop offset="100%" stopColor="#060f2c"/>
        </radialGradient>
      </defs>

      {presenter && presenter.backgroundUrl ? (
        <image href={presenter.backgroundUrl} x={0} y={0} width={W} height={H}
          preserveAspectRatio="xMidYMid slice"/>
      ) : (
        <g>
          <rect width={W} height={H} fill="url(#fallbackBg)"/>
          <text x={W/2} y={H/2 - 10} textAnchor="middle" fill="white" opacity="0.4"
            fontSize="22" fontFamily="Inter" fontWeight="600">
            Background presenter belum di-upload
          </text>
          <text x={W/2} y={H/2 + 18} textAnchor="middle" fill="white" opacity="0.3"
            fontSize="14" fontFamily="Inter">
            Upload di menu Setting → Presenter
          </text>
        </g>
      )}

      {/* === HEADER LEFT: Logo RRI === */}
      {logos.rri ? (
        <image href={logos.rri} x={80} y={50} width={140} height={70} preserveAspectRatio="xMidYMid meet"/>
      ) : (
        <g>
          <rect x={80} y={50} width={140} height={70} fill="white" opacity="0.1" rx="6" strokeDasharray="4 4" stroke="white" strokeOpacity="0.3"/>
          <text x={150} y={92} textAnchor="middle" fill="white" opacity="0.5" fontSize="12" fontFamily="Inter">[Logo RRI]</text>
        </g>
      )}

      {/* === HEADER RIGHT: Logo PRO 1 === */}
      {logos.pro1 ? (
        <image href={logos.pro1} x={1080} y={45} width={140} height={70} preserveAspectRatio="xMidYMid meet"/>
      ) : (
        <g>
          <rect x={1080} y={45} width={140} height={70} fill="white" opacity="0.1" rx="6" strokeDasharray="4 4" stroke="white" strokeOpacity="0.3"/>
          <text x={1150} y={87} textAnchor="middle" fill="white" opacity="0.5" fontSize="12" fontFamily="Inter">[Logo PRO 1]</text>
        </g>
      )}

      {/* === TITLE === */}
      <g fontFamily="Space Grotesk, sans-serif" fontWeight="700" fill="white">
        {(data.title || '').split('\n').slice(0, 2).map((line, i) => (
          <text key={i} x={80} y={180 + i * 50} fontSize="36" letterSpacing="0.5">
            {line.toUpperCase()}
          </text>
        ))}
      </g>

      {/* === EVENT NAME + SCHEDULE === */}
      <g fontFamily="Inter, sans-serif" fill="white">
        <text x={80} y={295} fontSize="22" fontWeight="700" letterSpacing="1">
          {(data.eventName || 'BANDA ACEH MENYAPA').toUpperCase()}
        </text>

        {/* Date with icon */}
        <g transform="translate(420, 275)">
          <rect x={0} y={0} width={20} height={22} rx={3} fill="none" stroke="white" strokeWidth="2"/>
          <line x1={0} y1={8} x2={20} y2={8} stroke="white" strokeWidth="2"/>
          <line x1={6} y1={0} x2={6} y2={4} stroke="white" strokeWidth="2"/>
          <line x1={14} y1={0} x2={14} y2={4} stroke="white" strokeWidth="2"/>
          <text x={32} y={18} fontSize="20" fontWeight="700">
            {(data.date || 'TANGGAL ACARA').toUpperCase()}
          </text>
        </g>

        {/* Time with icon */}
        <g transform="translate(750, 273)">
          <circle cx={12} cy={12} r={11} fill="none" stroke="white" strokeWidth="2"/>
          <line x1={12} y1={12} x2={12} y2={5} stroke="white" strokeWidth="2"/>
          <line x1={12} y1={12} x2={17} y2={14} stroke="white" strokeWidth="2"/>
          <text x={32} y={20} fontSize="20" fontWeight="700">
            {data.time || '00:00 – 00:00 WIB'}
          </text>
        </g>
      </g>

      {/* === SPEAKERS === */}
      {speakers.map((sp, i) => {
        const pos = positions[i];
        if (!pos) return null;
        return (
          <g key={sp.id || i}>
            <circle cx={pos.x} cy={pos.y} r={circleR + 5} fill="none" stroke="url(#circleRing)" strokeWidth="4"/>
            <clipPath id={`clip-${i}`}>
              <circle cx={pos.x} cy={pos.y} r={circleR}/>
            </clipPath>
            {sp.photoUrl ? (
              <image href={sp.photoUrl} x={pos.x - circleR} y={pos.y - circleR}
                width={circleR * 2} height={circleR * 2}
                preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-${i})`}/>
            ) : (
              <g clipPath={`url(#clip-${i})`}>
                <circle cx={pos.x} cy={pos.y} r={circleR} fill="#cbd5e1"/>
                <text x={pos.x} y={pos.y + 6} textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="Inter">No Photo</text>
              </g>
            )}

            {/* Name */}
            <text x={pos.x} y={pos.y + circleR + 30} textAnchor="middle"
              fill="white" fontSize={count === 4 ? "13" : "15"} fontWeight="700" fontFamily="Inter">
              {sp.fullName}
            </text>

            {/* Position (wrap to 3 lines max) */}
            <foreignObject x={pos.x - (count === 4 ? 75 : 95)} y={pos.y + circleR + 40}
              width={count === 4 ? 150 : 190} height={70}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{
                color: 'white', fontSize: count === 4 ? '10px' : '11px',
                fontFamily: 'Inter, sans-serif', textAlign: 'center',
                lineHeight: '1.3', textTransform: 'uppercase', fontWeight: 500
              }}>
                {sp.position}
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* === PRESENTER (foto presenter ada di dalam background, tidak di-render terpisah) === */}

      {/* === FOOTER === */}
      {/* Social media pill */}
      <g transform="translate(80, 615)">
        <rect x={0} y={0} width={310} height={48} rx={24} fill="white"/>
        <g fill="#0c1e4a" transform="translate(15, 14)">
          {/* IG */}
          <rect x={0} y={0} width={20} height={20} rx={5} fill="none" stroke="#0c1e4a" strokeWidth="2"/>
          <circle cx={10} cy={10} r={4.5} fill="none" stroke="#0c1e4a" strokeWidth="2"/>
          <circle cx={15.5} cy={4.5} r={1.2} fill="#0c1e4a"/>
          {/* FB */}
          <path d="M 35 0 a 10 10 0 1 1 -0.01 0 M 38 7 v 4 h -2 v 2 h 2 v 7 h 2 v -7 h 2 l 0.5 -2 h -2.5 v -1.5 c 0 -0.5 0.3 -1 1 -1 h 1.5 v -2 h -2 c -1.5 0 -2.5 1 -2.5 2.5 z" fill="#0c1e4a"/>
          {/* TT */}
          <text x={67} y={16} fontSize="20" fontWeight="900" fontFamily="Arial">♪</text>
          {/* YT */}
          <rect x={87} y={3} width={22} height={14} rx={3} fill="#0c1e4a"/>
          <polygon points="94,7 102,10 94,13" fill="white"/>
        </g>
        <text x={130} y={31} fill="#0c1e4a" fontSize="18" fontWeight="700" fontFamily="Inter">
          @rri_bandaaceh
        </text>
      </g>

      {/* Info Promosi & Kerjasama */}
      <g transform="translate(440, 615)">
        <circle cx={24} cy={24} r={20} fill="#22c55e"/>
        <path d="M 18 17 c 0 -1 1 -2 2 -2 h 2 l 2 4 l -2 1.5 c 1 2 3 4 5 5 l 1.5 -2 l 4 2 v 2 c 0 1 -1 2 -2 2 c -7 0 -12.5 -5.5 -12.5 -12.5 z" fill="white"/>
        <text x={56} y={20} fill="white" fontSize="16" fontWeight="700" fontFamily="Inter">
          INFO PROMOSI &amp; KERJASAMA
        </text>
        <text x={56} y={40} fill="white" fontSize="16" fontWeight="700" fontFamily="Inter">
          0811 6881 2123
        </text>
      </g>

      {/* Nama presenter di footer juga sudah include di background */}
    </svg>
  );
};

// ============================================
// SPEAKER SELECT — Searchable combobox (untuk database 100+ pembicara)
// ============================================
const SpeakerSelect = ({ speakers, value, onChange, placeholder = '— Pilih pembicara —' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const selected = speakers.find(s => s.id === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return speakers;
    const q = query.toLowerCase();
    return speakers.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      (s.position || '').toLowerCase().includes(q)
    );
  }, [speakers, query]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-left flex items-center justify-between hover:border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
        <span className={selected ? 'text-slate-900 truncate' : 'text-slate-400'}>
          {selected ? selected.fullName : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau jabatan..."
                className="w-full pl-8 pr-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {value && (
              <button type="button"
                onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
                <X className="w-3 h-3"/> Hapus pilihan
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                Tidak ada pembicara yang cocok dengan "<span className="font-semibold">{query}</span>"
              </div>
            ) : (
              filtered.map(s => (
                <button key={s.id} type="button"
                  onClick={() => { onChange(s.id); setOpen(false); setQuery(''); }}
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 flex items-start gap-2 transition-colors ${
                    value === s.id ? 'bg-blue-50' : ''
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 ring-1 ring-slate-200 mt-0.5">
                    {s.photoUrl ?
                      <img src={s.photoUrl} alt={s.fullName} className="w-full h-full object-cover"/> :
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">?</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">{s.fullName}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{s.position}</div>
                  </div>
                  {value === s.id && <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-1"/>}
                </button>
              ))
            )}
          </div>
          <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50">
            {filtered.length} dari {speakers.length} pembicara
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// PAGE: GENERATOR
// ============================================
const GeneratorPage = ({ speakers, presenters, logos }) => {
  const [form, setForm] = useState({
    title: 'Sekolah Rakyat di Aceh:\nMenjawab Tantangan Pendidikan Pinggiran',
    eventName: 'BANDA ACEH MENYAPA',
    date: 'Selasa, 29 Juli 2025',
    time: '09:00 – 10:00 WIB',
    presenterId: presenters[0]?.id || '',
    speakerIds: [speakers[0]?.id, speakers[1]?.id, speakers[2]?.id].filter(Boolean),
    speakerCount: 3,
  });
  const [downloading, setDownloading] = useState(false);
  const previewWrapRef = useRef(null);

  const selectedPresenter = presenters.find(p => p.id === form.presenterId);
  const selectedSpeakers = form.speakerIds.map(id => speakers.find(s => s.id === id)).filter(Boolean);

  const handleSpeakerCountChange = (n) => {
    const ids = [...form.speakerIds];
    while (ids.length < n) ids.push(speakers[ids.length]?.id || '');
    while (ids.length > n) ids.pop();
    setForm({ ...form, speakerCount: n, speakerIds: ids });
  };

  const updateSpeakerAt = (idx, id) => {
    const ids = [...form.speakerIds];
    ids[idx] = id;
    setForm({ ...form, speakerIds: ids });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const svgEl = previewWrapRef.current?.querySelector('svg');
      if (!svgEl) return;
      const svgClone = svgEl.cloneNode(true);
      svgClone.setAttribute('width', 1280);
      svgClone.setAttribute('height', 720);
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1280, 720);
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `thumbnail-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(url);
          setDownloading(false);
        }, 'image/png');
      };
      img.onerror = () => { setDownloading(false); alert('Gagal generate PNG. Foto eksternal mungkin perlu di-upload sebagai base64.'); };
      img.src = url;
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* FORM */}
      <div className="xl:col-span-2 space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Mic className="w-4 h-4 text-orange-500"/> Presenter
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {presenters.map(p => (
              <button key={p.id} onClick={() => setForm({ ...form, presenterId: p.id })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  form.presenterId === p.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-16 h-9 rounded bg-slate-200 overflow-hidden flex-shrink-0 ring-1 ring-slate-200">
                    {p.backgroundUrl ?
                      <img src={p.backgroundUrl} alt={p.name} className="w-full h-full object-cover"/> :
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">No BG</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">PRESENTER</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Konten Thumbnail</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Judul Program (max 2 baris)</label>
              <textarea value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nama Acara</label>
              <input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3"/> Hari & Tanggal
                </label>
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="Selasa, 29 Juli 2025"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3"/> Jam Siaran
                </label>
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="09:00 – 10:00 WIB"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500"/> Pembicara
            </h3>
            <div className="flex bg-slate-100 rounded-lg p-1">
              {[1,2,3,4].map(n => (
                <button key={n} onClick={() => handleSpeakerCountChange(n)}
                  className={`w-8 h-7 rounded text-xs font-semibold transition-colors ${
                    form.speakerCount === n ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: form.speakerCount }).map((_, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pembicara {idx + 1}</label>
                <SpeakerSelect
                  speakers={speakers}
                  value={form.speakerIds[idx] || ''}
                  onChange={(id) => updateSpeakerAt(idx, id)}
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleDownload} disabled={downloading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50">
          <Download className="w-4 h-4"/>
          {downloading ? 'Membuat PNG...' : 'Download PNG (1280×720)'}
        </button>
      </div>

      {/* PREVIEW */}
      <div className="xl:col-span-3">
        <div className="sticky top-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Preview Real-time</h3>
            <span className="text-xs text-slate-400">1280 × 720</span>
          </div>
          <div ref={previewWrapRef} className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
            <ThumbnailPreview
              data={{ ...form, speakers: selectedSpeakers }}
              presenter={selectedPresenter}
              logos={logos}
            />
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Preview akan otomatis update saat Anda mengubah form di sebelah kiri.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PAGE: PEMBICARA
// ============================================
const SpeakersPage = ({ speakers, setSpeakers }) => {
  const [editing, setEditing] = useState(null); // null | 'new' | speaker
  const [form, setForm] = useState({ fullName: '', position: '', photoUrl: null });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return speakers;
    const q = search.toLowerCase();
    return speakers.filter(s =>
      s.fullName.toLowerCase().includes(q) ||
      (s.position || '').toLowerCase().includes(q)
    );
  }, [speakers, search]);

  const open = (sp) => {
    if (sp === 'new') {
      setForm({ fullName: '', position: '', photoUrl: null });
      setEditing('new');
    } else {
      setForm({ ...sp });
      setEditing(sp);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm(f => ({ ...f, photoUrl: b64 }));
  };

  const save = () => {
    if (!form.fullName.trim()) return alert('Nama pembicara wajib diisi.');
    if (editing === 'new') {
      setSpeakers([...speakers, { ...form, id: 's' + Date.now() }]);
    } else {
      setSpeakers(speakers.map(s => s.id === editing.id ? { ...form, id: editing.id } : s));
    }
    setEditing(null);
  };

  const remove = (id) => {
    if (confirm('Hapus pembicara ini?')) {
      setSpeakers(speakers.filter(s => s.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-start md:items-center justify-between mb-5 flex-col md:flex-row gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Database Pembicara
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {speakers.length} pembicara terdaftar — kelola data untuk dialog program.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau jabatan..."
              className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"/>
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>
          <button onClick={() => open('new')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0">
            <Plus className="w-4 h-4"/> Tambah
          </button>
        </div>
      </div>

      {search && (
        <div className="mb-3 text-xs text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{filtered.length}</span> hasil dari {speakers.length} pembicara
          {filtered.length === 0 && <span> — coba kata kunci lain</span>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sp => (
          <div key={sp.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 ring-2 ring-blue-100">
                {sp.photoUrl ?
                  <img src={sp.photoUrl} alt={sp.fullName} className="w-full h-full object-cover"/> :
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm leading-tight">{sp.fullName}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-3">{sp.position}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => open(sp)} className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md flex items-center justify-center gap-1">
                <Edit2 className="w-3 h-3"/> Edit
              </button>
              <button onClick={() => remove(sp.id)} className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3"/> Hapus
              </button>
            </div>
          </div>
        ))}
        {speakers.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            Belum ada pembicara. Klik "Tambah" untuk mulai.
          </div>
        )}
        {speakers.length > 0 && filtered.length === 0 && search && (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30"/>
            Tidak ada pembicara cocok dengan "<span className="font-semibold">{search}</span>"
          </div>
        )}
      </div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {editing === 'new' ? 'Tambah Pembicara' : 'Edit Pembicara'}
              </h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap (dengan gelar)</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Dr. Nama Lengkap, S.Pd., M.Pd."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Jabatan / Instansi</label>
                <textarea value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                  rows={3} placeholder="Kepala Bidang ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Foto Pembicara</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden ring-2 ring-blue-100 flex-shrink-0">
                    {form.photoUrl ?
                      <img src={form.photoUrl} alt="preview" className="w-full h-full object-cover"/> :
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Photo</div>}
                  </div>
                  <label className="flex-1 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-3 h-3"/> Upload Foto
                    <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden"/>
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">Disarankan foto kotak/wajah jelas. Format JPG/PNG.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={save} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// PAGE: SETTING
// ============================================
const SettingsPage = ({ presenters, setPresenters, logos, setLogos, password, setPassword }) => {
  const [editingPresenter, setEditingPresenter] = useState(null);
  const [pForm, setPForm] = useState({ name: '', photoUrl: null });
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const handleLogoUpload = async (which, file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setLogos({ ...logos, [which]: b64 });
  };

  const handlePresenterBg = async (file) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setPForm(f => ({ ...f, backgroundUrl: b64 }));
  };

  const openPresenter = (p) => {
    if (p === 'new') {
      setPForm({ name: '', backgroundUrl: null });
      setEditingPresenter('new');
    } else {
      setPForm({ ...p });
      setEditingPresenter(p);
    }
  };

  const savePresenter = () => {
    if (!pForm.name.trim()) return alert('Nama presenter wajib diisi.');
    if (editingPresenter === 'new') {
      setPresenters([...presenters, { ...pForm, id: 'pr' + Date.now() }]);
    } else {
      setPresenters(presenters.map(p => p.id === editingPresenter.id ? { ...pForm, id: editingPresenter.id } : p));
    }
    setEditingPresenter(null);
  };

  const removePresenter = (id) => {
    if (confirm('Hapus presenter ini?')) setPresenters(presenters.filter(p => p.id !== id));
  };

  const changePwd = () => {
    if (newPwd.length < 4) return setPwdMsg('Password minimal 4 karakter.');
    setPassword(newPwd);
    setPwdMsg('Password berhasil diubah ✓');
    setNewPwd('');
    setTimeout(() => setPwdMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Pengaturan Aplikasi
        </h2>
        <p className="text-sm text-slate-500 mt-1">Kelola logo, presenter, dan password admin.</p>
      </div>

      {/* LOGO */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-orange-500"/> Logo Header
        </h3>
        <p className="text-xs text-slate-500 mb-4">Logo akan ditampilkan di bagian atas thumbnail.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'rri', label: 'Logo RRI Banda Aceh', side: 'kiri' },
            { key: 'pro1', label: 'Logo PRO 1 97.7 FM', side: 'kanan' },
          ].map(({ key, label, side }) => (
            <div key={key} className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-700 mb-2">{label} <span className="text-slate-400">({side})</span></div>
              <div className="bg-slate-900 rounded-lg p-4 mb-3 flex items-center justify-center min-h-[80px]">
                {logos[key] ?
                  <img src={logos[key]} alt={label} className="max-h-16 max-w-full object-contain"/> :
                  <div className="text-xs text-slate-500">Belum ada logo</div>}
              </div>
              <label className="block px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer text-center">
                <Upload className="w-3 h-3 inline mr-1"/> Upload Logo
                <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(key, e.target.files?.[0])} className="hidden"/>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* PRESENTER */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Mic className="w-4 h-4 text-orange-500"/> Presenter
            </h3>
            <p className="text-xs text-slate-500 mt-1">Tiap presenter punya background sendiri (sudah include foto presenter, label nama, glow, & triangle).</p>
          </div>
          <button onClick={() => openPresenter('new')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1">
            <Plus className="w-3 h-3"/> Tambah
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presenters.map(p => (
            <div key={p.id} className="border border-slate-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-20 h-12 rounded bg-slate-100 overflow-hidden flex-shrink-0 ring-1 ring-slate-200">
                {p.backgroundUrl ?
                  <img src={p.backgroundUrl} alt={p.name} className="w-full h-full object-cover"/> :
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No BG</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => openPresenter(p)} className="text-xs text-slate-600 hover:text-slate-900">Edit</button>
                  <button onClick={() => removePresenter(p.id)} className="text-xs text-red-600 hover:text-red-700">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PASSWORD */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-500"/> Password Admin
        </h3>
        <p className="text-xs text-slate-500 mb-4">Ubah password yang digunakan untuk login.</p>
        <div className="flex gap-2">
          <input type="text" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Password baru (min 4 karakter)"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
          <button onClick={changePwd} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium">
            Ubah
          </button>
        </div>
        {pwdMsg && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${pwdMsg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {pwdMsg.includes('✓') && <Check className="w-3 h-3"/>}
            {pwdMsg}
          </p>
        )}
      </div>

      {/* PRESENTER MODAL */}
      {editingPresenter && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {editingPresenter === 'new' ? 'Tambah Presenter' : 'Edit Presenter'}
              </h3>
              <button onClick={() => setEditingPresenter(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Presenter</label>
                <input value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
                  placeholder="Dimas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Background Thumbnail (1280×720)</label>
                <div className="space-y-2">
                  <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                    {pForm.backgroundUrl ?
                      <img src={pForm.backgroundUrl} alt="preview" className="w-full h-full object-cover"/> :
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Belum ada background</div>}
                  </div>
                  <label className="block w-full px-3 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer text-center">
                    <Upload className="w-3 h-3 inline mr-1"/> Upload Background
                    <input type="file" accept="image/*" onChange={(e) => handlePresenterBg(e.target.files?.[0])} className="hidden"/>
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">Background sudah include foto presenter, label nama, glow, & triangle. Rekomendasi 1280×720 PNG/JPG.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingPresenter(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                Batal
              </button>
              <button onClick={savePresenter} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  // Inject Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState('generator');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [speakers, setSpeakers] = useState(SAMPLE_SPEAKERS);
  const [presenters, setPresenters] = useState(SAMPLE_PRESENTERS);
  const [logos, setLogos] = useState({ rri: null, pro1: null });

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} savedPassword={password}/>;
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* TOP NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
              <Radio className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Thumbnail Generator
              </div>
              <div className="text-xs text-slate-500 -mt-0.5">RRI PRO 1 Banda Aceh</div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[
              { id: 'generator', label: 'Generator', icon: LayoutGrid },
              { id: 'speakers', label: 'Pembicara', icon: Users },
              { id: 'settings', label: 'Setting', icon: SettingsIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  page === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}>
                <Icon className="w-3.5 h-3.5"/> {label}
              </button>
            ))}
          </div>

          <button onClick={() => setLoggedIn(false)}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium">
            <LogOut className="w-3.5 h-3.5"/> Keluar
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {page === 'generator' && <GeneratorPage speakers={speakers} presenters={presenters} logos={logos}/>}
        {page === 'speakers' && <SpeakersPage speakers={speakers} setSpeakers={setSpeakers}/>}
        {page === 'settings' && (
          <SettingsPage presenters={presenters} setPresenters={setPresenters}
            logos={logos} setLogos={setLogos}
            password={password} setPassword={setPassword}/>
        )}
      </main>

      {/* FOOTER INFO */}
      <footer className="max-w-7xl mx-auto px-6 py-6 text-xs text-slate-400 text-center border-t border-slate-200 mt-8">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
          Mockup mode — data disimpan sementara. Akan di-replace dengan Firebase di Tahap 2.
        </span>
      </footer>
    </div>
  );
}
