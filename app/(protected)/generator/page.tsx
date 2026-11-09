'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ThumbnailPreview } from '@/components/generator/ThumbnailPreview';
import { PosterPreview } from '@/components/generator/PosterPreview';
import { SpeakerSelect } from '@/components/generator/SpeakerSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
  Mic2,
  Tv,
  Smartphone,
  Layout,
  Upload,
  Eye,
  EyeOff,
  Palette,
  ArrowLeftRight,
  RotateCcw,
  Save,
  Lock,
  Check,
  ShieldCheck,
  KeyRound,
  Move,
  Sun,
  Moon
} from 'lucide-react';

import { exportToPng } from '@/lib/utils/export';
import { uploadFile } from '@/lib/storage/upload';

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

const COLOR_PRESETS = [
  { name: 'Hitam', hex: '#000000' },
  { name: 'Putih', hex: '#FFFFFF' },
  { name: 'Kuning', hex: '#FACC15' },
  { name: 'Oranye', hex: '#FB923C' },
  { name: 'Biru', hex: '#38BDF8' },
  { name: 'Hijau', hex: '#34D399' },
  { name: 'Merah', hex: '#F87171' },
];

const ADMIN_EMAILS = [
  'iqbalrri25@gmail.com',
];

const checkIsUserAdmin = (user: any): boolean => {
  if (!user) return false;
  const email = (user.email || '').toLowerCase().trim();
  const userMeta = (user.user_metadata || {}) as any;
  const appMeta = (user.app_metadata || {}) as any;
  
  return (
    ADMIN_EMAILS.includes(email) ||
    email.includes('admin') ||
    userMeta.role === 'admin' ||
    appMeta.role === 'admin' ||
    userMeta.is_admin === true
  );
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
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<(string | null)[]>([null, null, null, null, null]);
  const [speakerSpacingOffset, setSpeakerSpacingOffset] = useState<number>(0);
  const [speakerYOffset, setSpeakerYOffset] = useState<number>(0);
  const [eventInfoYOffset, setEventInfoYOffset] = useState<number>(0);
  const [eventInfoXSpacing, setEventInfoXSpacing] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<'PRO 1' | 'PRO 2' | 'PRO 4'>('PRO 1');
  const [designFormat, setDesignFormat] = useState<'youtube' | 'poster'>('youtube');
  const [customPortraitBg, setCustomPortraitBg] = useState<string | null>(null);
  const [isUploadingPortraitBg, setIsUploadingPortraitBg] = useState(false);

  // Logo visibility & position controls
  const [showRriLogo, setShowRriLogo] = useState(true);
  const [showProgramLogo, setShowProgramLogo] = useState(true);
  const [showHutRiLogo, setShowHutRiLogo] = useState<boolean>(() => 
    new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase().includes('AGUSTUS')
  );
  const [showEventName, setShowEventName] = useState(true);
  const [rriLogoPosition, setRriLogoPosition] = useState<'left' | 'right'>('left');
  const [programLogoPosition, setProgramLogoPosition] = useState<'left' | 'right'>('right');

  // Logo Theme (White vs Dark)
  const [rriLogoTheme, setRriLogoTheme] = useState<'white' | 'dark'>('white');
  const [programLogoTheme, setProgramLogoTheme] = useState<'white' | 'dark'>('white');
  const [hutRiLogoTheme, setHutRiLogoTheme] = useState<'white' | 'dark'>('white');

  // Text color customization
  const [titleColor, setTitleColor] = useState('#FFFFFF');
  const [infoColor, setInfoColor] = useState('#FFFFFF');
  const [speakerColor, setSpeakerColor] = useState('#FFFFFF');

  // Title Position Offsets (Horizontal & Vertikal)
  const [titleXOffset, setTitleXOffset] = useState<number>(0);
  const [titleYOffset, setTitleYOffset] = useState<number>(0);

  // Admin & Thumbnail Settings states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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

  // Apply saved or inferred settings for a specific Dialog / Acara
  const applyDialogSettings = (
    dialogId: string, 
    dialogName: string, 
    customSettingsSource?: any
  ) => {
    const rootSettings = customSettingsSource || (branding as any)?.thumbnail_settings;
    
    // 1. Check if dialog has specific saved preset settings (by ID or by Name)
    const dialogsMap = (rootSettings && typeof rootSettings === 'object') ? (rootSettings.dialogs || {}) : {};
    const saved = dialogsMap[dialogId] || dialogsMap[dialogName];

    if (saved && typeof saved === 'object') {
      if (saved.designFormat) setDesignFormat(saved.designFormat);
      if (saved.selectedProgram) setSelectedProgram(saved.selectedProgram);
      if (saved.showRriLogo !== undefined) setShowRriLogo(saved.showRriLogo);
      if (saved.showProgramLogo !== undefined) setShowProgramLogo(saved.showProgramLogo);
      if (saved.showHutRiLogo !== undefined) setShowHutRiLogo(saved.showHutRiLogo);
      if (saved.showEventName !== undefined) setShowEventName(saved.showEventName);
      if (saved.rriLogoPosition) setRriLogoPosition(saved.rriLogoPosition);
      if (saved.programLogoPosition) setProgramLogoPosition(saved.programLogoPosition);
      if (saved.rriLogoTheme) setRriLogoTheme(saved.rriLogoTheme);
      if (saved.programLogoTheme) setProgramLogoTheme(saved.programLogoTheme);
      if (saved.hutRiLogoTheme) setHutRiLogoTheme(saved.hutRiLogoTheme);
      if (saved.titleColor) setTitleColor(saved.titleColor);
      if (saved.infoColor) setInfoColor(saved.infoColor);
      if (saved.speakerColor) setSpeakerColor(saved.speakerColor);
      if (saved.titleXOffset !== undefined) setTitleXOffset(saved.titleXOffset);
      if (saved.titleYOffset !== undefined) setTitleYOffset(saved.titleYOffset);
      if (saved.speakerSpacingOffset !== undefined) setSpeakerSpacingOffset(saved.speakerSpacingOffset);
      if (saved.speakerYOffset !== undefined) setSpeakerYOffset(saved.speakerYOffset);
      if (saved.eventInfoYOffset !== undefined) setEventInfoYOffset(saved.eventInfoYOffset);
      if (saved.eventInfoXSpacing !== undefined) setEventInfoXSpacing(saved.eventInfoXSpacing);
      return;
    }

    // 2. If no custom settings for this dialog, infer program from dialog name
    const dUpper = (dialogName || '').toUpperCase();
    if (dUpper.includes('PRO 2') || dUpper.includes('PRO2') || dUpper.includes('OSSI')) {
      setSelectedProgram('PRO 2');
    } else if (dUpper.includes('PRO 4') || dUpper.includes('PRO4')) {
      setSelectedProgram('PRO 4');
    } else if (dUpper.includes('PRO 1') || dUpper.includes('PRO1') || dUpper.includes('MENYAPA')) {
      setSelectedProgram('PRO 1');
    }

    // 3. Fallback to global defaults for colors & alignment if available
    const globalSaved = rootSettings?.global || (rootSettings?.titleColor ? rootSettings : null);
    if (globalSaved && typeof globalSaved === 'object') {
      if (globalSaved.designFormat) setDesignFormat(globalSaved.designFormat);
      if (globalSaved.showRriLogo !== undefined) setShowRriLogo(globalSaved.showRriLogo);
      if (globalSaved.showProgramLogo !== undefined) setShowProgramLogo(globalSaved.showProgramLogo);
      if (globalSaved.showHutRiLogo !== undefined) setShowHutRiLogo(globalSaved.showHutRiLogo);
      if (globalSaved.showEventName !== undefined) setShowEventName(globalSaved.showEventName);
      if (globalSaved.rriLogoPosition) setRriLogoPosition(globalSaved.rriLogoPosition);
      if (globalSaved.programLogoPosition) setProgramLogoPosition(globalSaved.programLogoPosition);
      if (globalSaved.rriLogoTheme) setRriLogoTheme(globalSaved.rriLogoTheme);
      if (globalSaved.programLogoTheme) setProgramLogoTheme(globalSaved.programLogoTheme);
      if (globalSaved.hutRiLogoTheme) setHutRiLogoTheme(globalSaved.hutRiLogoTheme);
      if (globalSaved.titleColor) setTitleColor(globalSaved.titleColor);
      if (globalSaved.infoColor) setInfoColor(globalSaved.infoColor);
      if (globalSaved.speakerColor) setSpeakerColor(globalSaved.speakerColor);
      if (globalSaved.titleXOffset !== undefined) setTitleXOffset(globalSaved.titleXOffset);
      if (globalSaved.titleYOffset !== undefined) setTitleYOffset(globalSaved.titleYOffset);
      if (globalSaved.speakerSpacingOffset !== undefined) setSpeakerSpacingOffset(globalSaved.speakerSpacingOffset);
      if (globalSaved.speakerYOffset !== undefined) setSpeakerYOffset(globalSaved.speakerYOffset);
      if (globalSaved.eventInfoYOffset !== undefined) setEventInfoYOffset(globalSaved.eventInfoYOffset);
      if (globalSaved.eventInfoXSpacing !== undefined) setEventInfoXSpacing(globalSaved.eventInfoXSpacing);
    }
  };

  // When dialog changes, auto-select first presenter and set eventName and load settings
  useEffect(() => {
    if (!selectedDialogId) return;
    const dialog = dialogs.find((d) => d.id === selectedDialogId);
    if (dialog) {
      setEventName(dialog.name);
      applyDialogSettings(dialog.id, dialog.name);
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

      // Check user role
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user || null;
        setCurrentUser(user);
        setIsAdmin(checkIsUserAdmin(user));
      } catch (authErr) {
        console.warn('Auth user fetch note:', authErr);
      }

      // Auto-select first dialog and apply its saved/default settings
      if (fetchedDialogs.length > 0) {
        const firstDialog = fetchedDialogs[0];
        setSelectedDialogId(firstDialog.id);
        setEventName(firstDialog.name);
        applyDialogSettings(firstDialog.id, firstDialog.name, (bRes.data as any)?.thumbnail_settings);
      } else {
        // Fallback to root thumbnail_settings if no dialogs
        const saved = (bRes.data as any)?.thumbnail_settings;
        if (saved && typeof saved === 'object') {
          if (saved.designFormat) setDesignFormat(saved.designFormat);
          if (saved.selectedProgram) setSelectedProgram(saved.selectedProgram);
          if (saved.showRriLogo !== undefined) setShowRriLogo(saved.showRriLogo);
          if (saved.showProgramLogo !== undefined) setShowProgramLogo(saved.showProgramLogo);
          if (saved.showHutRiLogo !== undefined) setShowHutRiLogo(saved.showHutRiLogo);
          if (saved.showEventName !== undefined) setShowEventName(saved.showEventName);
          if (saved.rriLogoPosition) setRriLogoPosition(saved.rriLogoPosition);
          if (saved.programLogoPosition) setProgramLogoPosition(saved.programLogoPosition);
          if (saved.rriLogoTheme) setRriLogoTheme(saved.rriLogoTheme);
          if (saved.programLogoTheme) setProgramLogoTheme(saved.programLogoTheme);
          if (saved.hutRiLogoTheme) setHutRiLogoTheme(saved.hutRiLogoTheme);
          if (saved.titleColor) setTitleColor(saved.titleColor);
          if (saved.infoColor) setInfoColor(saved.infoColor);
          if (saved.speakerColor) setSpeakerColor(saved.speakerColor);
          if (saved.titleXOffset !== undefined) setTitleXOffset(saved.titleXOffset);
          if (saved.titleYOffset !== undefined) setTitleYOffset(saved.titleYOffset);
          if (saved.speakerSpacingOffset !== undefined) setSpeakerSpacingOffset(saved.speakerSpacingOffset);
          if (saved.speakerYOffset !== undefined) setSpeakerYOffset(saved.speakerYOffset);
          if (saved.eventInfoYOffset !== undefined) setEventInfoYOffset(saved.eventInfoYOffset);
          if (saved.eventInfoXSpacing !== undefined) setEventInfoXSpacing(saved.eventInfoXSpacing);
        }
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

  const handleSaveThumbnailSettings = async (saveMode: 'dialog' | 'global' = 'dialog') => {
    if (!isAdmin) {
      alert('Hanya akun Admin yang memiliki akses untuk menyimpan settingan thumbnail.');
      return;
    }

    setIsSavingSettings(true);
    setSaveSuccessMsg(null);
    try {
      const currentConfig = {
        designFormat,
        selectedProgram,
        showRriLogo,
        showProgramLogo,
        showHutRiLogo,
        showEventName,
        rriLogoPosition,
        programLogoPosition,
        rriLogoTheme,
        programLogoTheme,
        hutRiLogoTheme,
        titleColor,
        infoColor,
        speakerColor,
        titleXOffset,
        titleYOffset,
        speakerSpacingOffset,
        speakerYOffset,
        eventInfoYOffset,
        eventInfoXSpacing,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'Admin',
      };

      const existingSettings = ((branding as any)?.thumbnail_settings && typeof (branding as any)?.thumbnail_settings === 'object') 
        ? (branding as any).thumbnail_settings 
        : {};

      const existingDialogsMap = existingSettings.dialogs || {};
      const currentDialog = dialogs.find((d) => d.id === selectedDialogId);
      const activeDialogName = currentDialog?.name || eventName || 'Acara Ini';

      let newSettingsPayload: any;

      if (saveMode === 'dialog' && selectedDialogId) {
        newSettingsPayload = {
          ...existingSettings,
          ...currentConfig,
          dialogs: {
            ...existingDialogsMap,
            [selectedDialogId]: currentConfig,
            ...(currentDialog?.name ? { [currentDialog.name]: currentConfig } : {})
          }
        };

        // Try updating dialogs table directly too if column exists
        try {
          await (supabase.from('dialogs') as any)
            .update({ thumbnail_settings: currentConfig })
            .eq('id', selectedDialogId);
        } catch (dialogUpdateErr) {
          // Non-blocking if column not yet migrated
        }
      } else {
        // Global default
        newSettingsPayload = {
          ...existingSettings,
          ...currentConfig,
          global: currentConfig,
          dialogs: existingDialogsMap,
        };
      }

      if (branding?.id) {
        const { error } = await (supabase.from('branding_settings') as any)
          .update({ thumbnail_settings: newSettingsPayload })
          .eq('id', branding.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase.from('branding_settings') as any)
          .insert([{ thumbnail_settings: newSettingsPayload }])
          .select()
          .single();
        if (error) throw error;
        setBranding(data);
      }

      setBranding((prev: any) => ({
        ...(prev || {}),
        thumbnail_settings: newSettingsPayload,
      }));

      const msg = saveMode === 'dialog'
        ? `Settingan default untuk acara "${activeDialogName}" berhasil disimpan!`
        : 'Settingan default umum (semua acara) berhasil disimpan!';
      setSaveSuccessMsg(msg);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan settingan: ${err.message || err}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const selectedPresenter = allPresenters.find((p) => p.id === selectedPresenterId);
  const currentDialog = dialogs.find((d) => d.id === selectedDialogId);
  const activeDialogName = currentDialog?.name || eventName || 'Acara Ini';
  
  // Resolve speakers for the preview
  const resolvedSpeakers = selectedSpeakerIds.slice(0, speakerCount).map((id) => {
    const speaker = speakers.find((s) => s.id === id);
    return {
      name: speaker?.full_name || 'NAMA NARASUMBER',
      position: speaker?.position || 'JABATAN NARASUMBER',
      photoUrl: speaker?.photo_url || null,
    };
  });

  const handlePortraitBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Immediate preview using FileReader DataURL so it shows up instantly
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomPortraitBg(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to Supabase storage in background for persistent public URL
    setIsUploadingPortraitBg(true);
    try {
      const fileName = `portrait-bg-${Date.now()}`;
      const { publicUrl } = await uploadFile('presenters', fileName, file);
      setCustomPortraitBg(publicUrl);
    } catch (err) {
      console.warn('Storage upload note:', err);
    } finally {
      setIsUploadingPortraitBg(false);
    }
  };

  const portraitBgUrl = customPortraitBg || selectedPresenter?.background_portrait_url || null;

  const brandingAny = branding as any;

  // Resolve Logo URLs based on dark/white theme selection (with clean fallbacks)
  const resolvedRriLogoUrl = rriLogoTheme === 'dark'
    ? (brandingAny?.rri_logo_dark_url || branding?.rri_logo_url || null)
    : (branding?.rri_logo_url || brandingAny?.rri_logo_dark_url || null);

  const resolvedProgramLogoUrl = (() => {
    if (selectedProgram === 'PRO 2') {
      return programLogoTheme === 'dark'
        ? (brandingAny?.pro2_logo_dark_url || branding?.pro2_logo_url || null)
        : (branding?.pro2_logo_url || brandingAny?.pro2_logo_dark_url || null);
    }
    if (selectedProgram === 'PRO 4') {
      return programLogoTheme === 'dark'
        ? (brandingAny?.pro4_logo_dark_url || branding?.pro4_logo_url || null)
        : (branding?.pro4_logo_url || brandingAny?.pro4_logo_dark_url || null);
    }
    return programLogoTheme === 'dark'
      ? (brandingAny?.pro1_logo_dark_url || branding?.pro1_logo_url || null)
      : (branding?.pro1_logo_url || brandingAny?.pro1_logo_dark_url || null);
  })();

  const resolvedHutRiLogoUrl = hutRiLogoTheme === 'dark'
    ? (brandingAny?.hut_ri_logo_dark_url || branding?.hut_ri_logo_url || null)
    : (branding?.hut_ri_logo_url || brandingAny?.hut_ri_logo_dark_url || null);

  const basePreviewData = {
    title,
    eventName,
    date,
    time,
    speakers: resolvedSpeakers,
    rriLogoUrl: resolvedRriLogoUrl,
    programLogoUrl: resolvedProgramLogoUrl,
    hutRiLogoUrl: resolvedHutRiLogoUrl,
    showRriLogo,
    showProgramLogo,
    showHutRiLogo,
    showEventName,
    rriLogoPosition,
    programLogoPosition,
    rriLogoTheme,
    programLogoTheme,
    hutRiLogoTheme,
    titleColor,
    infoColor,
    speakerColor,
    titleXOffset,
    titleYOffset,
    speakerSpacingOffset,
    speakerYOffset,
    eventInfoYOffset,
    eventInfoXSpacing,
    phoneNumber: branding?.phone_number || '0811 6881 2123',
  };

  const youtubePreviewData = {
    ...basePreviewData,
    presenterBgUrl: selectedPresenter?.background_url || null,
  };

  const posterPreviewData = {
    ...basePreviewData,
    presenterBgUrl: portraitBgUrl,
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const isPoster = designFormat === 'poster';
      const prefix = isPoster ? 'poster' : 'thumbnail';
      const resSuffix = isPoster ? '1080x1350' : '1280x720';
      const svgId = isPoster ? 'poster-svg' : 'thumbnail-svg';
      const width = isPoster ? 1080 : 1280;
      const height = isPoster ? 1350 : 720;
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
      const fileName = `${prefix}-${cleanTitle}-${resSuffix}-${Date.now()}`;
      await exportToPng(svgId, fileName, width, height);
    } catch (error: any) {
      alert(`Gagal download: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBoth = async () => {
    setIsExporting(true);
    try {
      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
      const timestamp = Date.now();
      await exportToPng('thumbnail-svg', `thumbnail-${cleanTitle}-1280x720-${timestamp}`, 1280, 720);
      // Brief delay so browser triggers separate downloads reliably
      await new Promise((r) => setTimeout(r, 450));
      await exportToPng('poster-svg', `poster-${cleanTitle}-1080x1350-${timestamp}`, 1080, 1350);
    } catch (error: any) {
      alert(`Gagal download kedua format: ${error.message}`);
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
              Thumbnail & Poster Generator
            </h1>
            <p className="text-sm text-slate-500 italic">Buat thumbnail YouTube (16:9) atau poster siaran (4:5) secara instan.</p>
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Format Desain Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Layout size={12} className="text-slate-400" />
                Pilih Format Desain
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDesignFormat('youtube')}
                  className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                    designFormat === 'youtube'
                      ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-500/10'
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Tv size={15} className={designFormat === 'youtube' ? 'text-orange-500' : 'text-slate-400'} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${designFormat === 'youtube' ? 'text-orange-700' : 'text-slate-700'}`}>
                      YouTube
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">1280 × 720 (16:9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDesignFormat('poster')}
                  className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                    designFormat === 'poster'
                      ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-500/10'
                      : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Smartphone size={15} className={designFormat === 'poster' ? 'text-orange-500' : 'text-slate-400'} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${designFormat === 'poster' ? 'text-orange-700' : 'text-slate-700'}`}>
                      Poster Siaran
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">1080 × 1350 (4:5)</span>
                </button>
              </div>
            </div>

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

              {/* Atur Posisi Judul (Horizontal & Vertikal) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Move size={13} className="text-orange-500" />
                    Atur Posisi Judul
                  </span>
                  {(titleXOffset !== 0 || titleYOffset !== 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTitleXOffset(0);
                        setTitleYOffset(0);
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Reset Posisi
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kiri / Kanan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>↔️ Kiri / Kanan</span>
                      <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px]">
                        {titleXOffset > 0 ? `+${titleXOffset}` : titleXOffset} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="400"
                      step="5"
                      value={titleXOffset}
                      onChange={(e) => setTitleXOffset(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* Atas / Bawah */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>↕️ Atas / Bawah</span>
                      <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px]">
                        {titleYOffset > 0 ? `+${titleYOffset}` : titleYOffset} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="200"
                      step="5"
                      value={titleYOffset}
                      onChange={(e) => setTitleYOffset(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Dialog, Tanggal, Jam */}
            <div className="space-y-4">
              {/* Pilih Dialog */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <Mic2 size={12} className="text-slate-400" />
                    Nama Acara / Dialog
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEventName(!showEventName)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                      showEventName 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                    title={showEventName ? 'Sembunyikan Nama Acara di thumbnail' : 'Tampilkan Nama Acara di thumbnail'}
                  >
                    {showEventName ? <Eye size={12} /> : <EyeOff size={12} />}
                    {showEventName ? 'Tampil' : 'Sembunyi'}
                  </button>
                </div>
                {dialogs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {dialogs.map((d) => {
                      const isSelected = selectedDialogId === d.id;
                      const hasCustomPreset = Boolean(
                        (branding as any)?.thumbnail_settings?.dialogs?.[d.id] ||
                        (branding as any)?.thumbnail_settings?.dialogs?.[d.name]
                      );
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedDialogId(d.id);
                            setEventName(d.name);
                            applyDialogSettings(d.id, d.name);
                          }}
                          className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 text-center flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-500/10 shadow-xs'
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <span>{d.name}</span>
                          {hasCustomPreset && (
                            <span className={`text-[9px] font-semibold tracking-normal normal-case flex items-center gap-0.5 ${
                              isSelected ? 'text-orange-600' : 'text-slate-400'
                            }`}>
                              <Sparkles size={9} /> Preset Tersimpan
                            </span>
                          )}
                        </button>
                      );
                    })}
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

              {/* Pilih Programa */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                  <Mic2 size={12} className="text-slate-400" />
                  Pilih Programa
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PRO 1', 'PRO 2', 'PRO 4'] as const).map((prog) => (
                    <button
                      key={prog}
                      onClick={() => setSelectedProgram(prog)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                        selectedProgram === prog
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-500/10'
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                      }`}
                    >
                      {prog}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pengaturan Logo RRI & Programa & HUT RI */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-slate-400" />
                    Posisi & Varian Logo
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRriLogoTheme('white');
                        setProgramLogoTheme('white');
                        setHutRiLogoTheme('white');
                      }}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 border border-slate-200"
                      title="Setel semua logo ke varian Putih (White)"
                    >
                      <Sun size={11} className="text-amber-500" />
                      Semua Putih
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRriLogoTheme('dark');
                        setProgramLogoTheme('dark');
                        setHutRiLogoTheme('dark');
                      }}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 border border-slate-200"
                      title="Setel semua logo ke varian Gelap (Dark)"
                    >
                      <Moon size={11} className="text-indigo-500" />
                      Semua Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRriLogoPosition((prev) => (prev === 'left' ? 'right' : 'left'));
                        setProgramLogoPosition((prev) => (prev === 'left' ? 'right' : 'left'));
                      }}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50 border border-orange-200/60"
                      title="Tukar posisi Logo RRI dan Logo Programa"
                    >
                      <ArrowLeftRight size={12} />
                      Tukar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* Logo RRI */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Logo RRI</span>
                      <button
                        type="button"
                        onClick={() => setShowRriLogo(!showRriLogo)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          showRriLogo 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        {showRriLogo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {showRriLogo ? 'Tampil' : 'Sembunyi'}
                      </button>
                    </div>

                    {showRriLogo && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        {/* Posisi */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-400 mr-auto">Posisi:</span>
                          <button
                            type="button"
                            onClick={() => setRriLogoPosition('left')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              rriLogoPosition === 'left'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Kiri
                          </button>
                          <button
                            type="button"
                            onClick={() => setRriLogoPosition('right')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              rriLogoPosition === 'right'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Kanan
                          </button>
                        </div>

                        {/* Varian Tema (Putih / Dark) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-400 mr-auto">Varian:</span>
                          <button
                            type="button"
                            onClick={() => setRriLogoTheme('white')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              rriLogoTheme === 'white'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Sun size={10} className="text-amber-500" />
                            Putih
                          </button>
                          <button
                            type="button"
                            onClick={() => setRriLogoTheme('dark')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              rriLogoTheme === 'dark'
                                ? 'bg-slate-900 text-white shadow-xs border border-slate-800'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Moon size={10} className="text-indigo-400" />
                            Dark
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Programa */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Logo {selectedProgram}</span>
                      <button
                        type="button"
                        onClick={() => setShowProgramLogo(!showProgramLogo)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          showProgramLogo 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        {showProgramLogo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {showProgramLogo ? 'Tampil' : 'Sembunyi'}
                      </button>
                    </div>

                    {showProgramLogo && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        {/* Posisi */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-400 mr-auto">Posisi:</span>
                          <button
                            type="button"
                            onClick={() => setProgramLogoPosition('left')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              programLogoPosition === 'left'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Kiri
                          </button>
                          <button
                            type="button"
                            onClick={() => setProgramLogoPosition('right')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                              programLogoPosition === 'right'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Kanan
                          </button>
                        </div>

                        {/* Varian Tema (Putih / Dark) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-400 mr-auto">Varian:</span>
                          <button
                            type="button"
                            onClick={() => setProgramLogoTheme('white')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              programLogoTheme === 'white'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Sun size={10} className="text-amber-500" />
                            Putih
                          </button>
                          <button
                            type="button"
                            onClick={() => setProgramLogoTheme('dark')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              programLogoTheme === 'dark'
                                ? 'bg-slate-900 text-white shadow-xs border border-slate-800'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Moon size={10} className="text-indigo-400" />
                            Dark
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logo Kemerdekaan / HUT RI */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Logo HUT RI</span>
                      <button
                        type="button"
                        onClick={() => setShowHutRiLogo(!showHutRiLogo)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          showHutRiLogo 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        {showHutRiLogo ? <Eye size={12} /> : <EyeOff size={12} />}
                        {showHutRiLogo ? 'Tampil' : 'Sembunyi'}
                      </button>
                    </div>

                    {showHutRiLogo && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        {/* Varian Tema (Putih / Dark) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-slate-400 mr-auto">Varian:</span>
                          <button
                            type="button"
                            onClick={() => setHutRiLogoTheme('white')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              hutRiLogoTheme === 'white'
                                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Sun size={10} className="text-amber-500" />
                            Putih
                          </button>
                          <button
                            type="button"
                            onClick={() => setHutRiLogoTheme('dark')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                              hutRiLogoTheme === 'dark'
                                ? 'bg-slate-900 text-white shadow-xs border border-slate-800'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Moon size={10} className="text-indigo-400" />
                            Dark
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">Posisi otomatis di sudut kanan atas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warna Font & Teks */}
            <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Palette size={16} className="text-orange-500" />
                  Warna Font & Teks
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTitleColor('#FFFFFF');
                    setInfoColor('#FFFFFF');
                    setSpeakerColor('#FFFFFF');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50"
                  title="Kembalikan semua warna teks ke Putih"
                >
                  <RotateCcw size={12} />
                  Reset Putih
                </button>
              </div>

              <div className="space-y-2.5">
                {/* 1. Judul Dialog */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0" style={{ backgroundColor: titleColor }} />
                    <span className="text-xs font-semibold text-slate-700">Judul Dialog</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setTitleColor(c.hex)}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          titleColor.toUpperCase() === c.hex.toUpperCase()
                            ? 'scale-125 ring-2 ring-orange-500 ring-offset-1 z-10 border-white'
                            : 'border-slate-300 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <label className="relative cursor-pointer ml-1" title="Pilih warna custom">
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="sr-only"
                      />
                      <div className="w-6 h-6 rounded-md border border-slate-300 flex items-center justify-center text-xs bg-white hover:border-slate-400 shadow-xs">
                        🎨
                      </div>
                    </label>
                  </div>
                </div>

                {/* 2. Info Acara & Tanggal */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0" style={{ backgroundColor: infoColor }} />
                    <span className="text-xs font-semibold text-slate-700">Info & Tanggal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setInfoColor(c.hex)}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          infoColor.toUpperCase() === c.hex.toUpperCase()
                            ? 'scale-125 ring-2 ring-orange-500 ring-offset-1 z-10 border-white'
                            : 'border-slate-300 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <label className="relative cursor-pointer ml-1" title="Pilih warna custom">
                      <input
                        type="color"
                        value={infoColor}
                        onChange={(e) => setInfoColor(e.target.value)}
                        className="sr-only"
                      />
                      <div className="w-6 h-6 rounded-md border border-slate-300 flex items-center justify-center text-xs bg-white hover:border-slate-400 shadow-xs">
                        🎨
                      </div>
                    </label>
                  </div>
                </div>

                {/* 3. Nama & Jabatan Pembicara */}
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0" style={{ backgroundColor: speakerColor }} />
                    <span className="text-xs font-semibold text-slate-700">Nama Pembicara</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSpeakerColor(c.hex)}
                        className={`w-5 h-5 rounded-full border transition-all ${
                          speakerColor.toUpperCase() === c.hex.toUpperCase()
                            ? 'scale-125 ring-2 ring-orange-500 ring-offset-1 z-10 border-white'
                            : 'border-slate-300 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <label className="relative cursor-pointer ml-1" title="Pilih warna custom">
                      <input
                        type="color"
                        value={speakerColor}
                        onChange={(e) => setSpeakerColor(e.target.value)}
                        className="sr-only"
                      />
                      <div className="w-6 h-6 rounded-md border border-slate-300 flex items-center justify-center text-xs bg-white hover:border-slate-400 shadow-xs">
                        🎨
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Background Section */}
            {designFormat === 'poster' ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                      <ImageIcon size={16} className="text-slate-400" />
                      Background Poster Portrait (1080×1350)
                    </label>
                    {portraitBgUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomPortraitBg(null)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Reset ke Hitam Polos
                      </button>
                    )}
                  </div>

                  {portraitBgUrl ? (
                    <div className="relative aspect-[4/5] max-h-52 w-auto mx-auto rounded-2xl overflow-hidden border-2 border-orange-500 shadow-md group">
                      <img src={portraitBgUrl} alt="Background Portrait" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-100 transition-all">
                          <Upload size={14} />
                          Ganti Background
                          <input type="file" accept="image/*" onChange={handlePortraitBgUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCustomPortraitBg(null)}
                          className="bg-red-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg hover:bg-red-700 transition-all"
                        >
                          Pakai Hitam Polos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50/80 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-3">
                      <div className="flex items-center gap-2 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Hitam Polos (Aktif)
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                        Background belum di-upload. Sesuai pengaturan, poster otomatis menggunakan warna hitam polos.
                      </p>
                      <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all">
                        {isUploadingPortraitBg ? (
                          <Loader2 size={14} className="animate-spin text-orange-500" />
                        ) : (
                          <Upload size={14} className="text-orange-400" />
                        )}
                        <span>Upload Background Portrait (1080×1350)</span>
                        <input type="file" accept="image/*" onChange={handlePortraitBgUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>

                {/* Presenter picker for dialog presenter context */}
                {presenters.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <UserCircle2 size={12} className="text-slate-400" />
                      Presenter Acara (Opsional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {presenters.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPresenterId(p.id)}
                          className={`p-2.5 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                            selectedPresenterId === p.id
                              ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {p.background_portrait_url || p.background_url ? (
                              <img src={p.background_portrait_url || p.background_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">🎙️</div>
                            )}
                          </div>
                          <span className="text-xs uppercase truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* YouTube presenter background selection */
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                  <ImageIcon size={16} className="text-slate-400" />
                  Pilih Presenter (Background 16:9)
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
            )}

            {/* 4. Pilih Narasumber */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                  <UserCircle2 size={16} className="text-slate-400" />
                  Jumlah Pembicara
                </label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {[1, 2, 3, 4, 5].map((n) => (
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
            <div className="space-y-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              {speakerCount > 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                      <span className="text-slate-400">↔️</span>
                      Jarak Antar Pembicara (Horizontal)
                    </label>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{speakerSpacingOffset > 0 ? `+${speakerSpacingOffset}` : speakerSpacingOffset} px</span>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-slate-400">↕️</span>
                    Jarak Vertikal Foto (Atas/Bawah)
                  </label>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{speakerYOffset > 0 ? `+${speakerYOffset}` : speakerYOffset} px</span>
                </div>
                <input 
                  type="range" 
                  min="-150" 
                  max="150" 
                  step="5"
                  value={speakerYOffset} 
                  onChange={(e) => setSpeakerYOffset(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-slate-400">↕️</span>
                    Jarak Vertikal Info Acara (Atas/Bawah)
                  </label>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{eventInfoYOffset > 0 ? `+${eventInfoYOffset}` : eventInfoYOffset} px</span>
                </div>
                <input 
                  type="range" 
                  min="-150" 
                  max="150" 
                  step="5"
                  value={eventInfoYOffset} 
                  onChange={(e) => setEventInfoYOffset(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 ml-1">
                    <span className="text-slate-400">↔️</span>
                    Jarak Horizontal Info Acara (Merenggang)
                  </label>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{eventInfoXSpacing > 0 ? `+${eventInfoXSpacing}` : eventInfoXSpacing} px</span>
                </div>
                <input 
                  type="range" 
                  min="-150" 
                  max="150" 
                  step="5"
                  value={eventInfoXSpacing} 
                  onChange={(e) => setEventInfoXSpacing(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            {/* Settingan Default Template Card (Hanya Tampil di Akun Admin) */}
            {isAdmin && (
              <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3.5 shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Settingan Template Default
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Admin
                  </span>
                </div>

                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <span className="text-[10px] text-slate-400 block">Acara Aktif:</span>
                  <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Mic2 size={12} /> {activeDialogName}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Simpan konfigurasi saat ini (pilihan Program {selectedProgram}, format, logo, warna, dan posisi) sebagai default yang otomatis muncul saat acara ini di-klik.
                </p>

                {saveSuccessMsg && (
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => handleSaveThumbnailSettings('dialog')}
                    disabled={isSavingSettings}
                    className="w-full h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                  >
                    {isSavingSettings ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>Simpan Default untuk "{activeDialogName}"</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleSaveThumbnailSettings('global')}
                    disabled={isSavingSettings}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1 underline underline-offset-2"
                  >
                    Atau simpan sebagai default semua acara (Global)
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2.5">
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
                    <span>
                      Download {designFormat === 'poster' ? 'Poster Siaran (1080 × 1350)' : 'Thumbnail YouTube (1280 × 720)'}
                    </span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleDownloadBoth}
                disabled={isExporting}
                variant="outline"
                className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
              >
                <Sparkles size={14} className="text-orange-500" />
                Download Keduanya (YouTube + Poster Sekaligus)
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                Live Preview ({designFormat === 'poster' ? '1080 × 1350' : '1280 × 720'})
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-orange-100 text-orange-700">
                {designFormat === 'poster' ? 'Poster 4:5' : 'Thumbnail 16:9'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick toggle tab */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDesignFormat('youtube')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    designFormat === 'youtube'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Thumbnail YouTube (1280x720)"
                >
                  <Tv size={12} />
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => setDesignFormat('poster')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    designFormat === 'poster'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Poster Siaran (1080x1350)"
                >
                  <Smartphone size={12} />
                  4:5
                </button>
              </div>

              {/* Tombol Simpan Default (Hanya Muncul di Akun Admin) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleSaveThumbnailSettings('dialog')}
                  disabled={isSavingSettings}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-orange-200 bg-white hover:bg-orange-50 text-orange-600 shadow-xs transition-all"
                  title={`Simpan settingan generator saat ini sebagai default untuk acara ${activeDialogName}`}
                >
                  <Save size={13} />
                  <span>Simpan Default ({activeDialogName})</span>
                </button>
              )}

              <button 
                onClick={fetchInitialData}
                className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <RefreshCw size={14} />
                REFRESH
              </button>
            </div>
          </div>

          <div className="sticky top-28 space-y-4">
            {designFormat === 'youtube' ? (
              <ThumbnailPreview
                data={youtubePreviewData}
                id="thumbnail-svg"
              />
            ) : (
              <PosterPreview
                data={posterPreviewData}
                id="poster-svg"
              />
            )}

            {/* Hidden off-screen instance of the other format so downloading either/both works instantly */}
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
              {designFormat === 'youtube' ? (
                <PosterPreview data={posterPreviewData} id="poster-svg" />
              ) : (
                <ThumbnailPreview data={youtubePreviewData} id="thumbnail-svg" />
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
