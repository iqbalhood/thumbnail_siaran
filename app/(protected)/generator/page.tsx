'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ThumbnailPreview } from '@/components/generator/ThumbnailPreview';
import { PosterPreview } from '@/components/generator/PosterPreview';
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
  Check,
  ShieldCheck,
  Move,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Copy,
  Layers,
  Columns2,
  Rows2
} from 'lucide-react';

import { exportToPng } from '@/lib/utils/export';
import { uploadFile } from '@/lib/storage/upload';

export interface FormatStyleConfig {
  showRriLogo: boolean;
  showProgramLogo: boolean;
  showSocialMediaLogo: boolean;
  showHutRiLogo: boolean;
  showEventName: boolean;
  rriLogoPosition: 'left' | 'right';
  programLogoPosition: 'left' | 'right';
  rriLogoTheme: 'white' | 'dark';
  programLogoTheme: 'white' | 'dark';
  hutRiLogoTheme: 'white' | 'dark';
  rriLogoScale: number;
  programLogoScale: number;
  titleColor: string;
  infoColor: string;
  speakerColor: string;
  promoColor: string;
  titleXOffset: number;
  titleYOffset: number;
  speakerXOffset: number;
  speakerSpacingOffset: number;
  speakerYOffset: number;
  speakerTextOffset: number;
  speakerTextYOffset: number;
  speakerLayoutMode: 'row' | 'grid';
  speakerRowSpacingOffset: number;
  eventInfoYOffset: number;
  eventInfoXSpacing: number;
  socialMediaXOffset: number;
  socialMediaYOffset: number;
  promoXOffset: number;
  promoYOffset: number;
}

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

const createDefaultFormatStyle = (): FormatStyleConfig => {
  const isAug = new Date().toLocaleDateString('id-ID', { month: 'long' }).toUpperCase().includes('AGUSTUS');
  return {
    showRriLogo: true,
    showProgramLogo: true,
    showSocialMediaLogo: true,
    showHutRiLogo: isAug,
    showEventName: true,
    rriLogoPosition: 'left',
    programLogoPosition: 'right',
    rriLogoTheme: 'white',
    programLogoTheme: 'white',
    hutRiLogoTheme: 'white',
    rriLogoScale: 100,
    programLogoScale: 100,
    titleColor: '#FFFFFF',
    infoColor: '#FFFFFF',
    speakerColor: '#FFFFFF',
    promoColor: '#FFFFFF',
    titleXOffset: 0,
    titleYOffset: 0,
    speakerXOffset: 0,
    speakerSpacingOffset: 0,
    speakerYOffset: 0,
    speakerTextOffset: 0,
    speakerTextYOffset: 0,
    speakerLayoutMode: 'row',
    speakerRowSpacingOffset: 0,
    eventInfoYOffset: 0,
    eventInfoXSpacing: 0,
    socialMediaXOffset: 0,
    socialMediaYOffset: 0,
    promoXOffset: 0,
    promoYOffset: 0,
  };
};

const extractFormatStyleFromObject = (raw: any, fallback: FormatStyleConfig): FormatStyleConfig => {
  if (!raw || typeof raw !== 'object') return { ...fallback };
  return {
    showRriLogo: raw.showRriLogo !== undefined ? raw.showRriLogo : fallback.showRriLogo,
    showProgramLogo: raw.showProgramLogo !== undefined ? raw.showProgramLogo : fallback.showProgramLogo,
    showSocialMediaLogo: raw.showSocialMediaLogo !== undefined ? raw.showSocialMediaLogo : fallback.showSocialMediaLogo,
    showHutRiLogo: raw.showHutRiLogo !== undefined ? raw.showHutRiLogo : fallback.showHutRiLogo,
    showEventName: raw.showEventName !== undefined ? raw.showEventName : fallback.showEventName,
    rriLogoPosition: raw.rriLogoPosition || fallback.rriLogoPosition,
    programLogoPosition: raw.programLogoPosition || fallback.programLogoPosition,
    rriLogoTheme: raw.rriLogoTheme || fallback.rriLogoTheme,
    programLogoTheme: raw.programLogoTheme || fallback.programLogoTheme,
    hutRiLogoTheme: raw.hutRiLogoTheme || fallback.hutRiLogoTheme,
    rriLogoScale: raw.rriLogoScale !== undefined ? Number(raw.rriLogoScale) : fallback.rriLogoScale,
    programLogoScale: raw.programLogoScale !== undefined ? Number(raw.programLogoScale) : fallback.programLogoScale,
    titleColor: raw.titleColor || fallback.titleColor,
    infoColor: raw.infoColor || fallback.infoColor,
    speakerColor: raw.speakerColor || fallback.speakerColor,
    promoColor: raw.promoColor || fallback.promoColor,
    titleXOffset: raw.titleXOffset !== undefined ? Number(raw.titleXOffset) : fallback.titleXOffset,
    titleYOffset: raw.titleYOffset !== undefined ? Number(raw.titleYOffset) : fallback.titleYOffset,
    speakerXOffset: raw.speakerXOffset !== undefined ? Number(raw.speakerXOffset) : fallback.speakerXOffset,
    speakerSpacingOffset: raw.speakerSpacingOffset !== undefined ? Number(raw.speakerSpacingOffset) : fallback.speakerSpacingOffset,
    speakerYOffset: raw.speakerYOffset !== undefined ? Number(raw.speakerYOffset) : fallback.speakerYOffset,
    speakerTextOffset: raw.speakerTextOffset !== undefined ? Number(raw.speakerTextOffset) : fallback.speakerTextOffset,
    speakerTextYOffset: raw.speakerTextYOffset !== undefined ? Number(raw.speakerTextYOffset) : fallback.speakerTextYOffset,
    speakerLayoutMode:
      raw.speakerLayoutMode === 'grid' || raw.speakerLayoutMode === 'row'
        ? raw.speakerLayoutMode
        : fallback.speakerLayoutMode,
    speakerRowSpacingOffset:
      raw.speakerRowSpacingOffset !== undefined
        ? Number(raw.speakerRowSpacingOffset)
        : fallback.speakerRowSpacingOffset,
    eventInfoYOffset: raw.eventInfoYOffset !== undefined ? Number(raw.eventInfoYOffset) : fallback.eventInfoYOffset,
    eventInfoXSpacing: raw.eventInfoXSpacing !== undefined ? Number(raw.eventInfoXSpacing) : fallback.eventInfoXSpacing,
    socialMediaXOffset: raw.socialMediaXOffset !== undefined ? Number(raw.socialMediaXOffset) : fallback.socialMediaXOffset,
    socialMediaYOffset: raw.socialMediaYOffset !== undefined ? Number(raw.socialMediaYOffset) : fallback.socialMediaYOffset,
    promoXOffset: raw.promoXOffset !== undefined ? Number(raw.promoXOffset) : fallback.promoXOffset,
    promoYOffset: raw.promoYOffset !== undefined ? Number(raw.promoYOffset) : fallback.promoYOffset,
  };
};

export default function GeneratorPage() {
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [allPresenters, setAllPresenters] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [branding, setBranding] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Navigation & View UI State
  const [activeEditorTab, setActiveEditorTab] = useState<'all' | 'konten' | 'media' | 'logo_warna' | 'posisi'>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    konten: true,
    media: true,
    logo_warna: true,
    posisi: true,
  });
  const [editTarget, setEditTarget] = useState<'both' | 'youtube' | 'poster'>('both');
  const [previewLayout, setPreviewLayout] = useState<'side_by_side' | 'stacked'>('side_by_side');

  // Shared Broadcast Content State
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
  const [selectedProgram, setSelectedProgram] = useState<'PRO 1' | 'PRO 2' | 'PRO 4'>('PRO 1');
  const [customPortraitBg, setCustomPortraitBg] = useState<string | null>(null);
  const [isUploadingPortraitBg, setIsUploadingPortraitBg] = useState(false);
  const [customSocialMediaLogo, setCustomSocialMediaLogo] = useState<string | null>(null);
  const [isUploadingSocialMedia, setIsUploadingSocialMedia] = useState(false);

  // Separate Visual & Layout States for 16:9 (YouTube) and 4:5 (Poster)
  const [youtubeConfig, setYoutubeConfig] = useState<FormatStyleConfig>(() => createDefaultFormatStyle());
  const [posterConfig, setPosterConfig] = useState<FormatStyleConfig>(() => createDefaultFormatStyle());

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

  // Active style config displayed in the left panel controls based on editTarget
  const activeStyle: FormatStyleConfig = editTarget === 'poster' ? posterConfig : youtubeConfig;

  const updateStyle = (patch: Partial<FormatStyleConfig>) => {
    if (editTarget === 'both' || editTarget === 'youtube') {
      setYoutubeConfig((prev) => ({ ...prev, ...patch }));
    }
    if (editTarget === 'both' || editTarget === 'poster') {
      setPosterConfig((prev) => ({ ...prev, ...patch }));
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Infer default Programa from dialog name when no custom preset exists yet
  const inferProgramFromDialogName = (dialogName: string): 'PRO 1' | 'PRO 2' | 'PRO 4' => {
    const dUpper = (dialogName || '').toUpperCase();
    if (dUpper.includes('PRO 2') || dUpper.includes('PRO2') || dUpper.includes('OSSI') || dUpper.includes('CEK CERITA')) {
      return 'PRO 2';
    }
    if (dUpper.includes('PRO 4') || dUpper.includes('PRO4')) {
      return 'PRO 4';
    }
    return 'PRO 1';
  };

  // Resolve saved preset ONLY for the specified dialog (never falls back to global/other dialog)
  const resolveSavedDialogPreset = (
    dialogId: string,
    dialogName: string,
    customSettingsSource?: any,
    customDialogsList?: any[]
  ) => {
    const list = customDialogsList || dialogs;
    const dialogObj = list.find((d) => d.id === dialogId || d.name === dialogName);
    if (
      dialogObj?.thumbnail_settings &&
      typeof dialogObj.thumbnail_settings === 'object' &&
      Object.keys(dialogObj.thumbnail_settings).length > 0
    ) {
      return dialogObj.thumbnail_settings;
    }

    const rootSettings = customSettingsSource !== undefined ? customSettingsSource : (branding as any)?.thumbnail_settings;
    const dialogsMap =
      rootSettings && typeof rootSettings === 'object' && rootSettings.dialogs && typeof rootSettings.dialogs === 'object'
        ? rootSettings.dialogs
        : {};

    return dialogsMap[dialogId] || dialogsMap[dialogName] || null;
  };

  // Apply saved preset (both 16:9 and 4:5) or clean system defaults for a specific Dialog / Acara
  const applyDialogSettings = (
    dialogId: string,
    dialogName: string,
    customSettingsSource?: any,
    customDialogsList?: any[]
  ) => {
    const baseStyle = createDefaultFormatStyle();
    const defaultProg = inferProgramFromDialogName(dialogName);
    const saved = resolveSavedDialogPreset(dialogId, dialogName, customSettingsSource, customDialogsList);

    if (!saved || typeof saved !== 'object') {
      setSelectedProgram(defaultProg);
      setYoutubeConfig({ ...baseStyle });
      setPosterConfig({ ...baseStyle });
      setCustomPortraitBg(null);
      return;
    }

    setSelectedProgram(saved.selectedProgram || defaultProg);

    // Extract top-level legacy settings as fallback for both 16:9 and 4:5
    const topLevelStyle = extractFormatStyleFromObject(saved, baseStyle);
    const resolvedYoutube = extractFormatStyleFromObject(saved.youtube, topLevelStyle);
    const resolvedPoster = extractFormatStyleFromObject(saved.poster, topLevelStyle);

    setYoutubeConfig(resolvedYoutube);
    setPosterConfig(resolvedPoster);

    if (saved.portraitBgUrl !== undefined) {
      setCustomPortraitBg(saved.portraitBgUrl || null);
    } else {
      setCustomPortraitBg(null);
    }

    if (saved.startTime && saved.endTime) {
      setStartTime(saved.startTime);
      setEndTime(saved.endTime);
      setTime(`${saved.startTime} – ${saved.endTime} WIB`);
    }
  };

  // When dialog changes, auto-select saved presenter or first presenter for that dialog
  useEffect(() => {
    if (!selectedDialogId) return;
    const dialogPresenters = allPresenters.filter((p) => p.dialog_id === selectedDialogId);
    const currentDialogObj = dialogs.find((d) => d.id === selectedDialogId);
    const savedPreset = currentDialogObj
      ? resolveSavedDialogPreset(currentDialogObj.id, currentDialogObj.name)
      : null;

    if (savedPreset?.selectedPresenterId && dialogPresenters.some((p) => p.id === savedPreset.selectedPresenterId)) {
      setSelectedPresenterId(savedPreset.selectedPresenterId);
    } else if (dialogPresenters.length > 0) {
      setSelectedPresenterId(dialogPresenters[0].id);
    } else {
      setSelectedPresenterId('');
    }
  }, [selectedDialogId, allPresenters]);

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

      // Check if URL has ?dialog=<id> query param (from Settings page)
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const requestedDialogId = urlParams?.get('dialog');

      if (fetchedDialogs.length > 0) {
        const targetDialog =
          (requestedDialogId && fetchedDialogs.find((d) => d.id === requestedDialogId || d.name === requestedDialogId)) ||
          fetchedDialogs[0];
        setSelectedDialogId(targetDialog.id);
        setEventName(targetDialog.name);
        applyDialogSettings(
          targetDialog.id,
          targetDialog.name,
          (bRes.data as any)?.thumbnail_settings,
          fetchedDialogs
        );
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

  // Save settings for 16:9, 4:5, or both into the active dialog preset
  const handleSaveThumbnailSettings = async (targetFormat: 'both' | 'youtube' | 'poster' = 'both') => {
    if (!isAdmin) {
      alert('Hanya akun Admin yang memiliki akses untuk menyimpan settingan thumbnail.');
      return;
    }

    if (!selectedDialogId) {
      alert('Pilih acara / dialog terlebih dahulu.');
      return;
    }

    setIsSavingSettings(true);
    setSaveSuccessMsg(null);
    try {
      const currentDialog = dialogs.find((d) => d.id === selectedDialogId);
      const activeDialogName = currentDialog?.name || eventName || 'Acara Ini';
      const existingSaved = resolveSavedDialogPreset(selectedDialogId, activeDialogName) || {};

      const baseFallback = createDefaultFormatStyle();
      const prevYoutube = extractFormatStyleFromObject(
        existingSaved.youtube || existingSaved,
        baseFallback
      );
      const prevPoster = extractFormatStyleFromObject(
        existingSaved.poster || existingSaved,
        baseFallback
      );

      const nextYoutube = targetFormat === 'poster' ? prevYoutube : youtubeConfig;
      const nextPoster = targetFormat === 'youtube' ? prevPoster : posterConfig;
      const nextPortraitBg =
        targetFormat === 'youtube'
          ? (existingSaved.portraitBgUrl ?? customPortraitBg ?? null)
          : (customPortraitBg ?? null);

      const currentConfig = {
        ...existingSaved,
        // Top-level fields kept synced with 16:9 for backwards compatibility
        ...nextYoutube,
        dialogId: selectedDialogId,
        dialogName: activeDialogName,
        designFormat: targetFormat === 'poster' ? 'poster' : 'youtube',
        selectedProgram,
        selectedPresenterId: selectedPresenterId || null,
        portraitBgUrl: nextPortraitBg,
        youtube: nextYoutube,
        poster: nextPoster,
        startTime,
        endTime,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'Admin',
      };

      const existingSettings =
        (branding as any)?.thumbnail_settings && typeof (branding as any)?.thumbnail_settings === 'object'
          ? (branding as any).thumbnail_settings
          : {};

      const existingDialogsMap =
        existingSettings.dialogs && typeof existingSettings.dialogs === 'object'
          ? existingSettings.dialogs
          : {};

      const newDialogsMap = {
        ...existingDialogsMap,
        [selectedDialogId]: currentConfig,
        ...(currentDialog?.name ? { [currentDialog.name]: currentConfig } : {}),
      };

      // Store strictly inside dialogs map while preserving branding_assets
      const newSettingsPayload = {
        ...(existingSettings.branding_assets ? { branding_assets: existingSettings.branding_assets } : {}),
        dialogs: newDialogsMap,
      };

      // Try updating dialogs table directly too if column exists
      try {
        await (supabase.from('dialogs') as any)
          .update({ thumbnail_settings: currentConfig })
          .eq('id', selectedDialogId);
      } catch (dialogUpdateErr) {
        // Non-blocking if column not yet migrated
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

      setDialogs((prev) =>
        prev.map((d) => (d.id === selectedDialogId ? { ...d, thumbnail_settings: currentConfig } : d))
      );

      const labelFormat =
        targetFormat === 'youtube'
          ? '16:9 (YouTube)'
          : targetFormat === 'poster'
          ? '4:5 (Poster)'
          : '16:9 & 4:5';

      setSaveSuccessMsg(`Settingan ${labelFormat} untuk "${activeDialogName}" berhasil disimpan!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal menyimpan settingan: ${err.message || err}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetCurrentDialogSettings = async () => {
    if (!isAdmin || !selectedDialogId) return;
    const currentDialog = dialogs.find((d) => d.id === selectedDialogId);
    const activeDialogName = currentDialog?.name || eventName || 'Acara Ini';
    if (!confirm(`Reset settingan default (16:9 & 4:5) untuk "${activeDialogName}" ke setelan bawaan sistem?`)) return;

    setIsSavingSettings(true);
    try {
      const existingSettings =
        (branding as any)?.thumbnail_settings && typeof (branding as any)?.thumbnail_settings === 'object'
          ? (branding as any).thumbnail_settings
          : {};

      const existingDialogsMap = { ...(existingSettings.dialogs || {}) };
      delete existingDialogsMap[selectedDialogId];
      if (currentDialog?.name) {
        delete existingDialogsMap[currentDialog.name];
      }

      const newSettingsPayload = {
        ...(existingSettings.branding_assets ? { branding_assets: existingSettings.branding_assets } : {}),
        dialogs: existingDialogsMap,
      };

      try {
        await (supabase.from('dialogs') as any)
          .update({ thumbnail_settings: null })
          .eq('id', selectedDialogId);
      } catch (e) {
        // Non-blocking
      }

      if (branding?.id) {
        const { error } = await (supabase.from('branding_settings') as any)
          .update({ thumbnail_settings: newSettingsPayload })
          .eq('id', branding.id);
        if (error) throw error;
      }

      setBranding((prev: any) => ({
        ...(prev || {}),
        thumbnail_settings: newSettingsPayload,
      }));

      const updatedDialogs = dialogs.map((d) =>
        d.id === selectedDialogId ? { ...d, thumbnail_settings: null } : d
      );
      setDialogs(updatedDialogs);

      applyDialogSettings(selectedDialogId, activeDialogName, newSettingsPayload, updatedDialogs);
      setSaveSuccessMsg(`Settingan "${activeDialogName}" berhasil di-reset ke default sistem.`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal mereset settingan: ${err.message || err}`);
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
      const { publicUrl, storagePath } = await uploadFile('presenters', fileName, file);
      setCustomPortraitBg(publicUrl);

      // Also persist to the selected presenter record if one is selected
      if (selectedPresenterId) {
        await (supabase.from('presenters') as any)
          .update({
            background_portrait_url: publicUrl,
            background_portrait_path: storagePath,
          })
          .eq('id', selectedPresenterId);

        setAllPresenters((prev) =>
          prev.map((p) =>
            p.id === selectedPresenterId
              ? { ...p, background_portrait_url: publicUrl, background_portrait_path: storagePath }
              : p
          )
        );
      }
    } catch (err) {
      console.warn('Storage upload note:', err);
    } finally {
      setIsUploadingPortraitBg(false);
    }
  };

  const portraitBgUrl = customPortraitBg || selectedPresenter?.background_portrait_url || null;

  const brandingAny = branding as any;

  const getBrandingField = (key: string) => {
    if (brandingAny?.[key] !== undefined && brandingAny?.[key] !== null) {
      return brandingAny[key];
    }
    return brandingAny?.thumbnail_settings?.branding_assets?.[key] ?? null;
  };

  const handleSocialMediaLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate preview via DataURL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomSocialMediaLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingSocialMedia(true);
    try {
      const fileName = `social-media-${Date.now()}`;
      const { publicUrl, storagePath: path } = await uploadFile('logos', fileName, file);
      setCustomSocialMediaLogo(publicUrl);

      // Persist in branding_settings so it stays saved across reloads
      if (branding?.id) {
        const existingThumb =
          brandingAny?.thumbnail_settings && typeof brandingAny.thumbnail_settings === 'object'
            ? brandingAny.thumbnail_settings
            : {};
        const mergedThumb = {
          ...existingThumb,
          branding_assets: {
            ...(existingThumb.branding_assets || {}),
            social_media_logo_url: publicUrl,
            social_media_logo_path: path,
          },
        };
        const { error } = await (supabase.from('branding_settings') as any)
          .update({
            social_media_logo_url: publicUrl,
            social_media_logo_path: path,
            thumbnail_settings: mergedThumb,
          })
          .eq('id', branding.id);
        if (error) {
          await (supabase.from('branding_settings') as any)
            .update({ thumbnail_settings: mergedThumb })
            .eq('id', branding.id);
        }
        setBranding({
          ...branding,
          social_media_logo_url: publicUrl,
          social_media_logo_path: path,
          thumbnail_settings: mergedThumb,
        });
      }
    } catch (err) {
      console.warn('Social media image upload note:', err);
    } finally {
      setIsUploadingSocialMedia(false);
    }
  };

  const handleResetSocialMediaLogo = async () => {
    setCustomSocialMediaLogo(null);
    if (!branding?.id) return;
    try {
      const existingThumb =
        brandingAny?.thumbnail_settings && typeof brandingAny.thumbnail_settings === 'object'
          ? brandingAny.thumbnail_settings
          : {};
      const mergedThumb = {
        ...existingThumb,
        branding_assets: {
          ...(existingThumb.branding_assets || {}),
          social_media_logo_url: null,
          social_media_logo_path: null,
        },
      };
      const { error } = await (supabase.from('branding_settings') as any)
        .update({
          social_media_logo_url: null,
          social_media_logo_path: null,
          thumbnail_settings: mergedThumb,
        })
        .eq('id', branding.id);
      if (error) {
        await (supabase.from('branding_settings') as any)
          .update({ thumbnail_settings: mergedThumb })
          .eq('id', branding.id);
      }
      setBranding({
        ...branding,
        social_media_logo_url: null,
        social_media_logo_path: null,
        thumbnail_settings: mergedThumb,
      });
    } catch (err) {
      console.warn('Reset social media logo note:', err);
    }
  };

  // Helper to resolve logo URLs for a given FormatStyleConfig (16:9 or 4:5)
  const buildFormatPreviewData = (styleCfg: FormatStyleConfig, bgUrl: string | null) => {
    const rriUrl = styleCfg.rriLogoTheme === 'dark'
      ? (getBrandingField('rri_logo_dark_url') || getBrandingField('rri_logo_url') || null)
      : (getBrandingField('rri_logo_url') || getBrandingField('rri_logo_dark_url') || null);

    const progUrl = (() => {
      if (selectedProgram === 'PRO 2') {
        return styleCfg.programLogoTheme === 'dark'
          ? (getBrandingField('pro2_logo_dark_url') || getBrandingField('pro2_logo_url') || null)
          : (getBrandingField('pro2_logo_url') || getBrandingField('pro2_logo_dark_url') || null);
      }
      if (selectedProgram === 'PRO 4') {
        return styleCfg.programLogoTheme === 'dark'
          ? (getBrandingField('pro4_logo_dark_url') || getBrandingField('pro4_logo_url') || null)
          : (getBrandingField('pro4_logo_url') || getBrandingField('pro4_logo_dark_url') || null);
      }
      return styleCfg.programLogoTheme === 'dark'
        ? (getBrandingField('pro1_logo_dark_url') || getBrandingField('pro1_logo_url') || null)
        : (getBrandingField('pro1_logo_url') || getBrandingField('pro1_logo_dark_url') || null);
    })();

    const hutUrl = styleCfg.hutRiLogoTheme === 'dark'
      ? (getBrandingField('hut_ri_logo_dark_url') || getBrandingField('hut_ri_logo_url') || null)
      : (getBrandingField('hut_ri_logo_url') || getBrandingField('hut_ri_logo_dark_url') || null);

    const socUrl = customSocialMediaLogo || getBrandingField('social_media_logo_url') || null;

    return {
      title,
      eventName,
      date,
      time,
      speakers: resolvedSpeakers,
      presenterBgUrl: bgUrl,
      rriLogoUrl: rriUrl,
      programLogoUrl: progUrl,
      hutRiLogoUrl: hutUrl,
      socialMediaLogoUrl: socUrl,
      ...styleCfg,
      phoneNumber: branding?.phone_number || '0811 6881 2123',
    };
  };

  const youtubePreviewData = buildFormatPreviewData(
    youtubeConfig,
    selectedPresenter?.background_url || null
  );

  const posterPreviewData = buildFormatPreviewData(
    posterConfig,
    portraitBgUrl
  );

  const handleDownloadSingle = async (format: 'youtube' | 'poster') => {
    setIsExporting(true);
    try {
      const isPoster = format === 'poster';
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

  // Reusable Target Switcher bar for visual & layout sections
  const renderFormatTargetBar = () => (
    <div className="p-2.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Layers size={13} className="text-orange-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-200">Target Edit:</span>
      </div>
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setEditTarget('both')}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
            editTarget === 'both'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          🔗 Keduanya (16:9 & 4:5)
        </button>
        <button
          type="button"
          onClick={() => setEditTarget('youtube')}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
            editTarget === 'youtube'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Tv size={10} />
          16:9
        </button>
        <button
          type="button"
          onClick={() => setEditTarget('poster')}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
            editTarget === 'poster'
              ? 'bg-orange-500 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone size={10} />
          4:5
        </button>
      </div>
      {editTarget !== 'both' && (
        <button
          type="button"
          onClick={() => {
            if (editTarget === 'youtube') {
              setPosterConfig({ ...youtubeConfig });
            } else {
              setYoutubeConfig({ ...posterConfig });
            }
          }}
          className="text-[10px] font-bold text-orange-300 hover:text-orange-200 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
          title={editTarget === 'youtube' ? 'Salin settingan 16:9 ini ke 4:5' : 'Salin settingan 4:5 ini ke 16:9'}
        >
          <Copy size={10} />
          {editTarget === 'youtube' ? ' Terapkan ke 4:5' : ' Terapkan ke 16:9'}
        </button>
      )}
    </div>
  );

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

  const showKonten = activeEditorTab === 'all' || activeEditorTab === 'konten';
  const showMedia = activeEditorTab === 'all' || activeEditorTab === 'media';
  const showLogoWarna = activeEditorTab === 'all' || activeEditorTab === 'logo_warna';
  const showPosisi = activeEditorTab === 'all' || activeEditorTab === 'posisi';

  return (
    <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6">
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Ergonomic & Structured Editor */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col lg:max-h-[calc(100vh-5.5rem)] lg:sticky lg:top-20">
          
          {/* Sticky Top Header + Quick Category Tabs */}
          <div className="p-4 sm:p-5 bg-white border-b border-slate-100 space-y-3 shrink-0 z-20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={19} className="text-orange-500 shrink-0" />
                  Panel Editor Thumbnail & Poster
                </h1>
                <p className="text-xs text-slate-500">
                  Acara aktif: <strong className="text-orange-600">{activeDialogName}</strong> ({selectedProgram})
                </p>
              </div>
              <button
                type="button"
                onClick={fetchInitialData}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                title="Muat ulang data dari server"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Category Navigation Tabs */}
            <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'konten', label: '1. Konten' },
                { id: 'media', label: '2. Foto/BG' },
                { id: 'logo_warna', label: '3. Logo/Warna' },
                { id: 'posisi', label: '4. Posisi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveEditorTab(tab.id as any)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                    activeEditorTab === tab.id
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* SECTION 1: ACARA, JUDUL & JADWAL */}
            {showKonten && (
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleSection('konten')}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Acara, Judul & Jadwal Siaran
                    </span>
                  </div>
                  {activeEditorTab === 'all' && (
                    openSections.konten ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {(activeEditorTab !== 'all' || openSections.konten) && (
                  <div className="p-4 space-y-4">
                    {/* Pilih Acara / Dialog */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Mic2 size={12} className="text-orange-500" />
                          Pilih Acara / Dialog
                        </label>
                        <button
                          type="button"
                          onClick={() => updateStyle({ showEventName: !activeStyle.showEventName })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            activeStyle.showEventName 
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                              : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                          }`}
                          title="Tampilkan/sembunyikan nama acara di thumbnail & poster"
                        >
                          {activeStyle.showEventName ? <Eye size={11} /> : <EyeOff size={11} />}
                          {activeStyle.showEventName ? 'Teks Acara: Tampil' : 'Teks Acara: Sembunyi'}
                        </button>
                      </div>

                      {dialogs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-1.5">
                          {dialogs.map((d) => {
                            const isSelected = selectedDialogId === d.id;
                            const savedPreset = resolveSavedDialogPreset(d.id, d.name);
                            const hasCustomPreset = Boolean(savedPreset);
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => {
                                  setSelectedDialogId(d.id);
                                  setEventName(d.name);
                                  applyDialogSettings(d.id, d.name);
                                }}
                                className={`px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border-2 text-center flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/10'
                                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white'
                                }`}
                              >
                                <span className="line-clamp-1">{d.name}</span>
                                {hasCustomPreset && (
                                  <span className={`text-[9px] font-semibold tracking-normal normal-case flex items-center gap-0.5 ${
                                    isSelected ? 'text-orange-600' : 'text-emerald-600'
                                  }`}>
                                    <Sparkles size={9} /> {savedPreset?.selectedProgram || 'Custom'} · 16:9 & 4:5
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <Input
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          className="bg-slate-50 rounded-xl"
                          placeholder="Nama acara..."
                        />
                      )}
                    </div>

                    {/* Pilih Programa */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Tv size={12} className="text-orange-500" />
                        Kanal Programa
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['PRO 1', 'PRO 2', 'PRO 4'] as const).map((prog) => (
                          <button
                            key={prog}
                            type="button"
                            onClick={() => setSelectedProgram(prog)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                              selectedProgram === prog
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-white'
                            }`}
                          >
                            {prog}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Judul Dialog */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Type size={12} className="text-orange-500" />
                        Judul Topik / Dialog (Tekan ENTER untuk baris baru)
                      </label>
                      <textarea
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Masukkan judul dialog..."
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs font-semibold resize-none uppercase leading-relaxed"
                      />
                    </div>

                    {/* Tanggal & Jam Siaran (Side-by-Side) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tanggal */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar size={12} className="text-orange-500" />
                          Tanggal
                        </label>
                        <div className="relative flex items-center">
                          <Input
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-slate-50 rounded-xl pr-9 uppercase font-semibold text-xs h-10"
                            placeholder="SELASA, 29 JULI 2025"
                          />
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
                            className="absolute right-2.5 flex items-center justify-center p-1 rounded-lg hover:bg-orange-50 transition-colors group"
                            title="Pilih dari kalender"
                          >
                            <Calendar size={15} className="text-slate-400 group-hover:text-orange-500" />
                          </button>
                        </div>
                      </div>

                      {/* Jam Siaran */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock size={12} className="text-orange-500" />
                          Jam Siaran (WIB)
                        </label>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 h-10 rounded-xl">
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStartTime(val);
                              setTime(`${val} – ${endTime} WIB`);
                            }}
                            className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none cursor-pointer"
                            style={{ colorScheme: 'light' }}
                          />
                          <span className="text-slate-400 font-bold text-xs">–</span>
                          <input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEndTime(val);
                              setTime(`${startTime} – ${val} WIB`);
                            }}
                            className="bg-transparent text-slate-700 font-bold text-xs focus:outline-none cursor-pointer"
                            style={{ colorScheme: 'light' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: NARASUMBER & BACKGROUND (16:9 DAN 4:5) */}
            {showMedia && (
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleSection('media')}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Narasumber & Background (16:9 & 4:5)
                    </span>
                  </div>
                  {activeEditorTab === 'all' && (
                    openSections.media ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {(activeEditorTab !== 'all' || openSections.media) && (
                  <div className="p-4 space-y-5">
                    {/* A. Pilih Narasumber (1-5) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCircle2 size={14} className="text-orange-500" />
                          Jumlah & Data Narasumber
                        </label>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setSpeakerCount(n)}
                              className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                                speakerCount === n ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {Array.from({ length: speakerCount }).map((_, i) => (
                          <SpeakerSelect
                            key={i}
                            speakers={speakers}
                            selectedSpeakerId={selectedSpeakerIds[i]}
                            onSelect={(speaker) => handleSpeakerSelect(i, speaker?.id || null)}
                          />
                        ))}
                      </div>

                      {/* Quick Speaker Photo Location & Text Distance Controls right under Speaker selection */}
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Move size={13} className="text-orange-500" />
                            Atur Lokasi Foto & Teks Narasumber
                          </span>
                          <div className="flex items-center gap-1">
                            {(['both', 'youtube', 'poster'] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setEditTarget(t)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                  editTarget === t
                                    ? 'bg-orange-500 text-white shadow-2xs'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {t === 'both' ? '16:9 & 4:5' : t === 'youtube' ? '16:9' : '4:5'}
                              </button>
                            ))}
                            {(activeStyle.speakerXOffset !== 0 ||
                              activeStyle.speakerYOffset !== 0 ||
                              activeStyle.speakerSpacingOffset !== 0 ||
                              activeStyle.speakerRowSpacingOffset !== 0 ||
                              activeStyle.speakerTextOffset !== 0 ||
                              activeStyle.speakerTextYOffset !== 0) && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStyle({
                                    speakerXOffset: 0,
                                    speakerYOffset: 0,
                                    speakerSpacingOffset: 0,
                                    speakerRowSpacingOffset: 0,
                                    speakerTextOffset: 0,
                                    speakerTextYOffset: 0,
                                  })
                                }
                                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 ml-1"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mode Susunan Foto (Baris Sejajar vs Mode Grid) saat Narasumber > 2 */}
                        {speakerCount > 2 && (
                          <div className="p-2.5 bg-white border border-orange-200/80 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <Layout size={12} className="text-orange-500" />
                                Mode Susunan Foto ({speakerCount} Narasumber)
                              </span>
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                {activeStyle.speakerLayoutMode === 'grid' ? 'Mode Grid (2 Baris)' : 'Baris Sejajar'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => updateStyle({ speakerLayoutMode: 'row' })}
                                className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                  activeStyle.speakerLayoutMode !== 'grid'
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span>↔️ Baris Sejajar (1 Baris)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStyle({ speakerLayoutMode: 'grid' })}
                                className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                  activeStyle.speakerLayoutMode === 'grid'
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span>⊞ Mode Grid (2 Baris)</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Lokasi Foto Kiri / Kanan */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>↔️ Lokasi Foto (Kiri / Kanan)</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {activeStyle.speakerXOffset > 0 ? `+${activeStyle.speakerXOffset}` : activeStyle.speakerXOffset} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-350"
                              max="600"
                              step="5"
                              value={activeStyle.speakerXOffset}
                              onChange={(e) => updateStyle({ speakerXOffset: Number(e.target.value) })}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>

                          {/* Lokasi Foto Atas / Bawah */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>↕️ Lokasi Foto (Atas / Bawah)</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {activeStyle.speakerYOffset > 0 ? `+${activeStyle.speakerYOffset}` : activeStyle.speakerYOffset} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-400"
                              max="400"
                              step="5"
                              value={activeStyle.speakerYOffset}
                              onChange={(e) => updateStyle({ speakerYOffset: Number(e.target.value) })}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 border-t border-slate-200/60">
                          {/* Jarak Foto ke Teks (Kiri/Kanan) */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>↔️ Jarak Foto & Teks</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {activeStyle.speakerTextOffset > 0 ? `+${activeStyle.speakerTextOffset}` : activeStyle.speakerTextOffset} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-150"
                              max="250"
                              step="5"
                              value={activeStyle.speakerTextOffset}
                              onChange={(e) => updateStyle({ speakerTextOffset: Number(e.target.value) })}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>

                          {/* Posisi Vertikal Teks terhadap Foto */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>↕️ Posisi Teks (Atas / Bawah)</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {activeStyle.speakerTextYOffset > 0 ? `+${activeStyle.speakerTextYOffset}` : activeStyle.speakerTextYOffset} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-150"
                              max="150"
                              step="5"
                              value={activeStyle.speakerTextYOffset}
                              onChange={(e) => updateStyle({ speakerTextYOffset: Number(e.target.value) })}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>
                        </div>

                        {speakerCount > 1 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5 border-t border-slate-200/60">
                            <div className={`space-y-1 ${speakerCount > 2 && activeStyle.speakerLayoutMode === 'grid' ? '' : 'sm:col-span-2'}`}>
                              <div className="flex items-center justify-between text-[11px] text-slate-600">
                                <span>↔️ Jarak Antar Kolom Foto</span>
                                <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                  {activeStyle.speakerSpacingOffset > 0 ? `+${activeStyle.speakerSpacingOffset}` : activeStyle.speakerSpacingOffset} px
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="150"
                                step="5"
                                value={activeStyle.speakerSpacingOffset}
                                onChange={(e) => updateStyle({ speakerSpacingOffset: Number(e.target.value) })}
                                className="w-full accent-orange-500 cursor-pointer"
                              />
                            </div>

                            {speakerCount > 2 && activeStyle.speakerLayoutMode === 'grid' && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-600">
                                  <span>↕️ Jarak Antar Baris Grid</span>
                                  <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                    {activeStyle.speakerRowSpacingOffset > 0 ? `+${activeStyle.speakerRowSpacingOffset}` : activeStyle.speakerRowSpacingOffset} px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="-100"
                                  max="150"
                                  step="5"
                                  value={activeStyle.speakerRowSpacingOffset}
                                  onChange={(e) => updateStyle({ speakerRowSpacingOffset: Number(e.target.value) })}
                                  className="w-full accent-orange-500 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* B. Background 16:9 (Presenter Landscape) */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Tv size={13} className="text-orange-500" />
                        Background 16:9 — Pilih Presenter
                      </label>
                      {presenters.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {presenters.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPresenterId(p.id)}
                              className={`p-2 rounded-xl border-2 transition-all text-left space-y-1.5 ${
                                selectedPresenterId === p.id
                                  ? 'border-orange-500 bg-orange-50/70'
                                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                              }`}
                            >
                              <div className="w-full aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                                {p.background_url ? (
                                  <img src={p.background_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon size={16} />
                                  </div>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider block text-center truncate ${
                                selectedPresenterId === p.id ? 'text-orange-700' : 'text-slate-600'
                              }`}>
                                {p.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Belum ada presenter untuk acara ini.</p>
                      )}
                    </div>

                    {/* C. Background 4:5 (Poster Portrait 1080x1350) */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Smartphone size={13} className="text-orange-500" />
                          Background 4:5 — Poster Portrait (1080×1350)
                        </label>
                        {customPortraitBg && (
                          <button
                            type="button"
                            onClick={() => setCustomPortraitBg(null)}
                            className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Reset ke BG Presenter
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="w-14 aspect-[4/5] rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0 flex items-center justify-center">
                          {portraitBgUrl ? (
                            <img src={portraitBgUrl} alt="BG 4:5" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <p className="text-xs font-bold text-slate-700">
                            {customPortraitBg
                              ? 'Background Custom 4:5 Aktif'
                              : selectedPresenter?.background_portrait_url
                              ? `Background 4:5 Presenter (${selectedPresenter.name})`
                              : 'Belum Ada Background 4:5'}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            Pilih presenter di atas atau upload gambar 1080×1350 khusus untuk tampilan 4:5.
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all">
                              {isUploadingPortraitBg ? (
                                <Loader2 size={12} className="animate-spin text-orange-400" />
                              ) : (
                                <Upload size={12} className="text-orange-400" />
                              )}
                              <span>{portraitBgUrl ? 'Ganti Background 4:5' : 'Upload Background 4:5'}</span>
                              <input type="file" accept="image/*" onChange={handlePortraitBgUpload} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: LOGO & WARNA TEKS */}
            {showLogoWarna && (
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleSection('logo_warna')}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Ukuran Logo, Varian & Warna Teks
                    </span>
                  </div>
                  {activeEditorTab === 'all' && (
                    openSections.logo_warna ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {(activeEditorTab !== 'all' || openSections.logo_warna) && (
                  <div className="p-4 space-y-4">
                    {renderFormatTargetBar()}

                    {/* Quick Actions for Logos */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Pengaturan Logo Header
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateStyle({ rriLogoTheme: 'white', programLogoTheme: 'white', hutRiLogoTheme: 'white' })}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 border border-slate-200"
                        >
                          <Sun size={10} className="text-amber-500" />
                          Semua Putih
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStyle({ rriLogoTheme: 'dark', programLogoTheme: 'dark', hutRiLogoTheme: 'dark' })}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 border border-slate-200"
                        >
                          <Moon size={10} className="text-indigo-500" />
                          Semua Dark
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStyle({
                              rriLogoPosition: activeStyle.rriLogoPosition === 'left' ? 'right' : 'left',
                              programLogoPosition: activeStyle.programLogoPosition === 'left' ? 'right' : 'left',
                            })
                          }
                          className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 border border-orange-200/60"
                        >
                          <ArrowLeftRight size={11} />
                          Tukar Posisi
                        </button>
                      </div>
                    </div>

                    {/* Grid Logo RRI & Logo Programa */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Logo RRI */}
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Logo RRI</span>
                          <button
                            type="button"
                            onClick={() => updateStyle({ showRriLogo: !activeStyle.showRriLogo })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              activeStyle.showRriLogo 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {activeStyle.showRriLogo ? <Eye size={11} /> : <EyeOff size={11} />}
                            {activeStyle.showRriLogo ? 'Tampil' : 'Sembunyi'}
                          </button>
                        </div>

                        {activeStyle.showRriLogo && (
                          <div className="space-y-2 pt-1.5 border-t border-slate-200/60">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-400 mr-auto">Posisi:</span>
                              {(['left', 'right'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => updateStyle({ rriLogoPosition: pos })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    activeStyle.rriLogoPosition === pos
                                      ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  {pos === 'left' ? 'Kiri' : 'Kanan'}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-400 mr-auto">Varian:</span>
                              <button
                                type="button"
                                onClick={() => updateStyle({ rriLogoTheme: 'white' })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  activeStyle.rriLogoTheme === 'white'
                                    ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                    : 'text-slate-500'
                                }`}
                              >
                                <Sun size={10} className="text-amber-500" /> Putih
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStyle({ rriLogoTheme: 'dark' })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  activeStyle.rriLogoTheme === 'dark'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-500'
                                }`}
                              >
                                <Moon size={10} className="text-indigo-400" /> Dark
                              </button>
                            </div>

                            {/* Ukuran Logo RRI */}
                            <div className="space-y-1 pt-1 border-t border-slate-200/50">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Ukuran Logo:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
                                    {activeStyle.rriLogoScale}%
                                  </span>
                                  {activeStyle.rriLogoScale !== 100 && (
                                    <button
                                      type="button"
                                      onClick={() => updateStyle({ rriLogoScale: 100 })}
                                      className="text-[9px] font-bold text-slate-400 hover:text-orange-600"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={200}
                                step={5}
                                value={activeStyle.rriLogoScale}
                                onChange={(e) => updateStyle({ rriLogoScale: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                              />
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
                            onClick={() => updateStyle({ showProgramLogo: !activeStyle.showProgramLogo })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              activeStyle.showProgramLogo 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {activeStyle.showProgramLogo ? <Eye size={11} /> : <EyeOff size={11} />}
                            {activeStyle.showProgramLogo ? 'Tampil' : 'Sembunyi'}
                          </button>
                        </div>

                        {activeStyle.showProgramLogo && (
                          <div className="space-y-2 pt-1.5 border-t border-slate-200/60">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-400 mr-auto">Posisi:</span>
                              {(['left', 'right'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => updateStyle({ programLogoPosition: pos })}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    activeStyle.programLogoPosition === pos
                                      ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                      : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  {pos === 'left' ? 'Kiri' : 'Kanan'}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-medium text-slate-400 mr-auto">Varian:</span>
                              <button
                                type="button"
                                onClick={() => updateStyle({ programLogoTheme: 'white' })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  activeStyle.programLogoTheme === 'white'
                                    ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                                    : 'text-slate-500'
                                }`}
                              >
                                <Sun size={10} className="text-amber-500" /> Putih
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStyle({ programLogoTheme: 'dark' })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  activeStyle.programLogoTheme === 'dark'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-500'
                                }`}
                              >
                                <Moon size={10} className="text-indigo-400" /> Dark
                              </button>
                            </div>

                            {/* Ukuran Logo Programa */}
                            <div className="space-y-1 pt-1 border-t border-slate-200/50">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-500">Ukuran Logo:</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/60">
                                    {activeStyle.programLogoScale}%
                                  </span>
                                  {activeStyle.programLogoScale !== 100 && (
                                    <button
                                      type="button"
                                      onClick={() => updateStyle({ programLogoScale: 100 })}
                                      className="text-[9px] font-bold text-slate-400 hover:text-orange-600"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                type="range"
                                min={50}
                                max={200}
                                step={5}
                                value={activeStyle.programLogoScale}
                                onChange={(e) => updateStyle({ programLogoScale: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo HUT RI & Sosial Media (Compact Row) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Logo HUT RI */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Logo HUT RI</span>
                          <button
                            type="button"
                            onClick={() => updateStyle({ showHutRiLogo: !activeStyle.showHutRiLogo })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              activeStyle.showHutRiLogo ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {activeStyle.showHutRiLogo ? <Eye size={11} /> : <EyeOff size={11} />}
                            {activeStyle.showHutRiLogo ? 'Tampil' : 'Sembunyi'}
                          </button>
                        </div>
                        {activeStyle.showHutRiLogo && (
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-400 mr-auto">Varian:</span>
                            <button
                              type="button"
                              onClick={() => updateStyle({ hutRiLogoTheme: 'white' })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                activeStyle.hutRiLogoTheme === 'white' ? 'bg-white text-orange-600 border border-slate-200' : 'text-slate-500'
                              }`}
                            >
                              Putih
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStyle({ hutRiLogoTheme: 'dark' })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                activeStyle.hutRiLogoTheme === 'dark' ? 'bg-slate-900 text-white' : 'text-slate-500'
                              }`}
                            >
                              Dark
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Gambar Sosial Media */}
                      <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Gambar Sosmed</span>
                          <button
                            type="button"
                            onClick={() => updateStyle({ showSocialMediaLogo: !activeStyle.showSocialMediaLogo })}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                              activeStyle.showSocialMediaLogo ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {activeStyle.showSocialMediaLogo ? <Eye size={11} /> : <EyeOff size={11} />}
                            {activeStyle.showSocialMediaLogo ? 'Tampil' : 'Sembunyi'}
                          </button>
                        </div>
                        {activeStyle.showSocialMediaLogo && (
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/60">
                            <label className="cursor-pointer px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold inline-flex items-center gap-1">
                              {isUploadingSocialMedia ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                              <span>Ganti</span>
                              <input type="file" accept="image/*" onChange={handleSocialMediaLogoUpload} className="hidden" />
                            </label>
                            {(customSocialMediaLogo || getBrandingField('social_media_logo_url')) && (
                              <button
                                type="button"
                                onClick={handleResetSocialMediaLogo}
                                className="text-[10px] font-bold text-slate-500 hover:text-red-600"
                              >
                                Reset Bawaan
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Posisi Sosmed & Info Kerjasama di Section 3 */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Move size={13} className="text-orange-500" />
                          Posisi Sosmed & Info Kerjasama
                        </span>
                        {(activeStyle.socialMediaXOffset !== 0 ||
                          activeStyle.socialMediaYOffset !== 0 ||
                          activeStyle.promoXOffset !== 0 ||
                          activeStyle.promoYOffset !== 0) && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStyle({
                                socialMediaXOffset: 0,
                                socialMediaYOffset: 0,
                                promoXOffset: 0,
                                promoYOffset: 0,
                              })
                            }
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                          >
                            Reset Posisi
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Sosmed (Kiri / Kanan)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.socialMediaXOffset > 0 ? `+${activeStyle.socialMediaXOffset}` : activeStyle.socialMediaXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-200"
                            max="600"
                            step="5"
                            value={activeStyle.socialMediaXOffset}
                            onChange={(e) => updateStyle({ socialMediaXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Sosmed (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.socialMediaYOffset > 0 ? `+${activeStyle.socialMediaYOffset}` : activeStyle.socialMediaYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-400"
                            max="120"
                            step="5"
                            value={activeStyle.socialMediaYOffset}
                            onChange={(e) => updateStyle({ socialMediaYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Info Kerjasama (Kiri / Kanan)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.promoXOffset > 0 ? `+${activeStyle.promoXOffset}` : activeStyle.promoXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-500"
                            max="600"
                            step="5"
                            value={activeStyle.promoXOffset}
                            onChange={(e) => updateStyle({ promoXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Info Kerjasama (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.promoYOffset > 0 ? `+${activeStyle.promoYOffset}` : activeStyle.promoYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-450"
                            max="150"
                            step="5"
                            value={activeStyle.promoYOffset}
                            onChange={(e) => updateStyle({ promoYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Warna Font & Teks */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Palette size={13} className="text-orange-500" />
                          Warna Font & Teks
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateStyle({
                              titleColor: '#FFFFFF',
                              infoColor: '#FFFFFF',
                              speakerColor: '#FFFFFF',
                              promoColor: '#FFFFFF',
                            })
                          }
                          className="text-[10px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1"
                        >
                          <RotateCcw size={11} /> Reset Putih
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {[
                          { label: 'Judul Dialog', key: 'titleColor' as const, val: activeStyle.titleColor },
                          { label: 'Info & Tanggal', key: 'infoColor' as const, val: activeStyle.infoColor },
                          { label: 'Nama Pembicara', key: 'speakerColor' as const, val: activeStyle.speakerColor },
                          { label: 'Info & Kerjasama', key: 'promoColor' as const, val: activeStyle.promoColor },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.val }} />
                              <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {COLOR_PRESETS.map((c) => (
                                <button
                                  key={c.hex}
                                  type="button"
                                  onClick={() => updateStyle({ [item.key]: c.hex })}
                                  className={`w-4 h-4 rounded-full border transition-all ${
                                    item.val.toUpperCase() === c.hex.toUpperCase()
                                      ? 'scale-125 ring-2 ring-orange-500 ring-offset-1 border-white'
                                      : 'border-slate-300 hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                              <label className="relative cursor-pointer ml-1" title="Pilih warna bebas">
                                <input
                                  type="color"
                                  value={item.val}
                                  onChange={(e) => updateStyle({ [item.key]: e.target.value })}
                                  className="sr-only"
                                />
                                <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-[10px] bg-white">
                                  🎨
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: POSISI & TATA LETAK (16:9 & 4:5) */}
            {showPosisi && (
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleSection('posisi')}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Posisi Judul, Foto & Jarak Elemen
                    </span>
                  </div>
                  {activeEditorTab === 'all' && (
                    openSections.posisi ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {(activeEditorTab !== 'all' || openSections.posisi) && (
                  <div className="p-4 space-y-4">
                    {renderFormatTargetBar()}

                    {/* A. Posisi Judul */}
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Move size={13} className="text-orange-500" />
                          Posisi Judul Dialog
                        </span>
                        {(activeStyle.titleXOffset !== 0 || activeStyle.titleYOffset !== 0) && (
                          <button
                            type="button"
                            onClick={() => updateStyle({ titleXOffset: 0, titleYOffset: 0 })}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                          >
                            Reset Judul
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Horizontal (X)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.titleXOffset > 0 ? `+${activeStyle.titleXOffset}` : activeStyle.titleXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-200"
                            max="400"
                            step="5"
                            value={activeStyle.titleXOffset}
                            onChange={(e) => updateStyle({ titleXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Vertikal (Y)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.titleYOffset > 0 ? `+${activeStyle.titleYOffset}` : activeStyle.titleYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-120"
                            max="200"
                            step="5"
                            value={activeStyle.titleYOffset}
                            onChange={(e) => updateStyle({ titleYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* B. Posisi & Jarak Foto Pembicara */}
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Lokasi Foto & Jarak Teks Narasumber</span>
                        {(activeStyle.speakerXOffset !== 0 ||
                          activeStyle.speakerSpacingOffset !== 0 ||
                          activeStyle.speakerRowSpacingOffset !== 0 ||
                          activeStyle.speakerYOffset !== 0 ||
                          activeStyle.speakerTextOffset !== 0 ||
                          activeStyle.speakerTextYOffset !== 0) && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStyle({
                                speakerXOffset: 0,
                                speakerSpacingOffset: 0,
                                speakerRowSpacingOffset: 0,
                                speakerYOffset: 0,
                                speakerTextOffset: 0,
                                speakerTextYOffset: 0,
                              })
                            }
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                          >
                            Reset Narasumber
                          </button>
                        )}
                      </div>

                      {speakerCount > 2 && (
                        <div className="p-2.5 bg-white border border-orange-200/80 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                              <Layout size={12} className="text-orange-500" />
                              Mode Susunan Foto ({speakerCount} Narasumber)
                            </span>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                              {activeStyle.speakerLayoutMode === 'grid' ? 'Mode Grid (2 Baris)' : 'Baris Sejajar'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateStyle({ speakerLayoutMode: 'row' })}
                              className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                activeStyle.speakerLayoutMode !== 'grid'
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>↔️ Baris Sejajar (1 Baris)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStyle({ speakerLayoutMode: 'grid' })}
                              className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                activeStyle.speakerLayoutMode === 'grid'
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span>⊞ Mode Grid (2 Baris)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Lokasi Foto (Kiri / Kanan)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.speakerXOffset > 0 ? `+${activeStyle.speakerXOffset}` : activeStyle.speakerXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-350"
                            max="600"
                            step="5"
                            value={activeStyle.speakerXOffset}
                            onChange={(e) => updateStyle({ speakerXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Lokasi Foto (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.speakerYOffset > 0 ? `+${activeStyle.speakerYOffset}` : activeStyle.speakerYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-400"
                            max="400"
                            step="5"
                            value={activeStyle.speakerYOffset}
                            onChange={(e) => updateStyle({ speakerYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Jarak Antara Foto dan Teks Narasumber */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Jarak Foto & Teks</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.speakerTextOffset > 0 ? `+${activeStyle.speakerTextOffset}` : activeStyle.speakerTextOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-150"
                            max="250"
                            step="5"
                            value={activeStyle.speakerTextOffset}
                            onChange={(e) => updateStyle({ speakerTextOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Posisi Teks (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.speakerTextYOffset > 0 ? `+${activeStyle.speakerTextYOffset}` : activeStyle.speakerTextYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            step="5"
                            value={activeStyle.speakerTextYOffset}
                            onChange={(e) => updateStyle({ speakerTextYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {speakerCount > 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                          <div className={`space-y-1 ${speakerCount > 2 && activeStyle.speakerLayoutMode === 'grid' ? '' : 'sm:col-span-2'}`}>
                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>↔️ Jarak Antar Kolom Foto</span>
                              <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                {activeStyle.speakerSpacingOffset > 0 ? `+${activeStyle.speakerSpacingOffset}` : activeStyle.speakerSpacingOffset} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-100"
                              max="150"
                              step="5"
                              value={activeStyle.speakerSpacingOffset}
                              onChange={(e) => updateStyle({ speakerSpacingOffset: Number(e.target.value) })}
                              className="w-full accent-orange-500 cursor-pointer"
                            />
                          </div>

                          {speakerCount > 2 && activeStyle.speakerLayoutMode === 'grid' && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-600">
                                <span>↕️ Jarak Antar Baris Grid</span>
                                <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                                  {activeStyle.speakerRowSpacingOffset > 0 ? `+${activeStyle.speakerRowSpacingOffset}` : activeStyle.speakerRowSpacingOffset} px
                                </span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="150"
                                step="5"
                                value={activeStyle.speakerRowSpacingOffset}
                                onChange={(e) => updateStyle({ speakerRowSpacingOffset: Number(e.target.value) })}
                                className="w-full accent-orange-500 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* C. Posisi Info Acara (Tanggal & Jam) */}
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Posisi Baris Info Acara (Tanggal & Jam)</span>
                        {(activeStyle.eventInfoYOffset !== 0 || activeStyle.eventInfoXSpacing !== 0) && (
                          <button
                            type="button"
                            onClick={() => updateStyle({ eventInfoYOffset: 0, eventInfoXSpacing: 0 })}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                          >
                            Reset Info
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Vertikal Info</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.eventInfoYOffset > 0 ? `+${activeStyle.eventInfoYOffset}` : activeStyle.eventInfoYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            step="5"
                            value={activeStyle.eventInfoYOffset}
                            onChange={(e) => updateStyle({ eventInfoYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Renggang Info</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.eventInfoXSpacing > 0 ? `+${activeStyle.eventInfoXSpacing}` : activeStyle.eventInfoXSpacing} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-150"
                            max="150"
                            step="5"
                            value={activeStyle.eventInfoXSpacing}
                            onChange={(e) => updateStyle({ eventInfoXSpacing: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* D. Posisi Sosial Media & Info Promosi Kerjasama */}
                    <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Posisi Sosmed & Info Kerjasama</span>
                        {(activeStyle.socialMediaXOffset !== 0 ||
                          activeStyle.socialMediaYOffset !== 0 ||
                          activeStyle.promoXOffset !== 0 ||
                          activeStyle.promoYOffset !== 0) && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStyle({
                                socialMediaXOffset: 0,
                                socialMediaYOffset: 0,
                                promoXOffset: 0,
                                promoYOffset: 0,
                              })
                            }
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700"
                          >
                            Reset Sosmed & Info
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Sosmed (Kiri / Kanan)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.socialMediaXOffset > 0 ? `+${activeStyle.socialMediaXOffset}` : activeStyle.socialMediaXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-200"
                            max="600"
                            step="5"
                            value={activeStyle.socialMediaXOffset}
                            onChange={(e) => updateStyle({ socialMediaXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Sosmed (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.socialMediaYOffset > 0 ? `+${activeStyle.socialMediaYOffset}` : activeStyle.socialMediaYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-400"
                            max="120"
                            step="5"
                            value={activeStyle.socialMediaYOffset}
                            onChange={(e) => updateStyle({ socialMediaYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↔️ Info Kerjasama (Kiri / Kanan)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.promoXOffset > 0 ? `+${activeStyle.promoXOffset}` : activeStyle.promoXOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-500"
                            max="600"
                            step="5"
                            value={activeStyle.promoXOffset}
                            onChange={(e) => updateStyle({ promoXOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>↕️ Info Kerjasama (Atas / Bawah)</span>
                            <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                              {activeStyle.promoYOffset > 0 ? `+${activeStyle.promoYOffset}` : activeStyle.promoYOffset} px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-450"
                            max="150"
                            step="5"
                            value={activeStyle.promoYOffset}
                            onChange={(e) => updateStyle({ promoYOffset: Number(e.target.value) })}
                            className="w-full accent-orange-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar (Save Preset 16:9 & 4:5 + Download Buttons) */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-2.5 shrink-0 z-20">
            {saveSuccessMsg && (
              <div className="p-2 bg-emerald-500 text-white rounded-xl text-xs flex items-center gap-2 font-bold shadow-xs">
                <Check size={14} className="shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Admin Preset Save Bar (Saves Both 16:9 & 4:5 or Individually) */}
            {isAdmin && (
              <div className="p-2.5 bg-slate-900 text-white rounded-2xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-orange-400" />
                    Preset Default: <strong className="text-orange-400">{activeDialogName}</strong>
                  </span>
                  {Boolean(selectedDialogId && resolveSavedDialogPreset(selectedDialogId, activeDialogName)) && (
                    <button
                      type="button"
                      onClick={handleResetCurrentDialogSettings}
                      disabled={isSavingSettings}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                      title="Reset settingan default acara ini ke bawaan sistem"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSaveThumbnailSettings('both')}
                    disabled={isSavingSettings}
                    className="col-span-6 py-2 px-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    {isSavingSettings ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    <span>Simpan 16:9 & 4:5</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveThumbnailSettings('youtube')}
                    disabled={isSavingSettings}
                    className="col-span-3 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-700 transition-all"
                    title="Simpan khusus settingan 16:9 (YouTube) untuk acara ini"
                  >
                    <Tv size={11} className="text-orange-400" />
                    <span>Simpan 16:9</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveThumbnailSettings('poster')}
                    disabled={isSavingSettings}
                    className="col-span-3 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-700 transition-all"
                    title="Simpan khusus settingan 4:5 (Poster) untuk acara ini"
                  >
                    <Smartphone size={11} className="text-orange-400" />
                    <span>Simpan 4:5</span>
                  </button>
                </div>
              </div>
            )}

            {/* Download Buttons */}
            <div className="grid grid-cols-12 gap-2">
              <Button
                type="button"
                onClick={handleDownloadBoth}
                disabled={isExporting}
                className="col-span-6 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                {isExporting ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                <span>Download Keduanya</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadSingle('youtube')}
                disabled={isExporting}
                className="col-span-3 h-11 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold px-2"
              >
                <Tv size={13} className="text-orange-500 shrink-0" />
                <span>16:9</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadSingle('poster')}
                disabled={isExporting}
                className="col-span-3 h-11 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold px-2"
              >
                <Smartphone size={13} className="text-orange-500 shrink-0" />
                <span>4:5</span>
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Simultaneous 16:9 AND 4:5 Live Previews */}
        <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-20">
          {/* Top Preview Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Preview Sekaligus (16:9 & 4:5)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Switch between Side-by-Side vs Stacked Large View */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewLayout('side_by_side')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewLayout === 'side_by_side'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilkan 16:9 dan 4:5 berdampingan"
                >
                  <Columns2 size={12} />
                  Berdampingan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLayout('stacked')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    previewLayout === 'stacked'
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilkan ukuran besar atas-bawah"
                >
                  <Rows2 size={12} />
                  Ukuran Besar
                </button>
              </div>
            </div>
          </div>

          {/* Both Previews Rendered Simultaneously */}
          <div
            className={
              previewLayout === 'side_by_side'
                ? 'grid grid-cols-1 xl:grid-cols-12 gap-5 items-start'
                : 'space-y-6'
            }
          >
            {/* 1. THUMBNAIL YOUTUBE (16:9) CARD */}
            <div
              className={`${
                previewLayout === 'side_by_side' ? 'xl:col-span-7' : 'w-full'
              } bg-white rounded-3xl border-2 transition-all p-4 space-y-3 shadow-lg ${
                editTarget === 'youtube'
                  ? 'border-orange-500 ring-4 ring-orange-500/10'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Tv size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Thumbnail YouTube (16:9)
                    </h3>
                    <p className="text-[10px] font-medium text-slate-400">Resolusi 1280 × 720 px</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditTarget(editTarget === 'youtube' ? 'both' : 'youtube')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      editTarget === 'youtube'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {editTarget === 'youtube' ? '✓ Sedang Diedit Khusus 16:9' : 'Edit Khusus 16:9'}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleSaveThumbnailSettings('youtube')}
                      disabled={isSavingSettings}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 transition-all"
                      title="Simpan settingan 16:9 ini sebagai default"
                    >
                      <Save size={11} className="text-orange-400" />
                      Simpan 16:9
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle('youtube')}
                    disabled={isExporting}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 transition-all"
                  >
                    <Download size={11} />
                    PNG
                  </button>
                </div>
              </div>

              <ThumbnailPreview data={youtubePreviewData} id="thumbnail-svg" />
            </div>

            {/* 2. POSTER SIARAN (4:5) CARD */}
            <div
              className={`${
                previewLayout === 'side_by_side' ? 'xl:col-span-5' : 'w-full'
              } bg-white rounded-3xl border-2 transition-all p-4 space-y-3 shadow-lg ${
                editTarget === 'poster'
                  ? 'border-orange-500 ring-4 ring-orange-500/10'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Smartphone size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Poster Siaran (4:5)
                    </h3>
                    <p className="text-[10px] font-medium text-slate-400">Resolusi 1080 × 1350 px</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditTarget(editTarget === 'poster' ? 'both' : 'poster')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      editTarget === 'poster'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {editTarget === 'poster' ? '✓ Sedang Diedit Khusus 4:5' : 'Edit Khusus 4:5'}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleSaveThumbnailSettings('poster')}
                      disabled={isSavingSettings}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 transition-all"
                      title="Simpan settingan 4:5 ini sebagai default"
                    >
                      <Save size={11} className="text-orange-400" />
                      Simpan 4:5
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle('poster')}
                    disabled={isExporting}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 transition-all"
                  >
                    <Download size={11} />
                    PNG
                  </button>
                </div>
              </div>

              <PosterPreview data={posterPreviewData} id="poster-svg" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
