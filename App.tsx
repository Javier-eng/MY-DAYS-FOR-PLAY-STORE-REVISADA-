
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, LayoutGrid, Home, Calendar as CalendarIcon, 
  Settings as SettingsIcon, Bell, ChevronRight, ChevronLeft,
  Search, Sparkles, Languages, CreditCard, 
  X, Zap, Volume2, Mail, Smartphone, Repeat, User as UserIcon,
  Sun, Moon, Shield, Download, Clock, ChevronUp, ChevronDown, Trash2, Info,
  CheckCircle2, Star, ShieldAlert, Timer, StickyNote, Users as UsersIcon, Edit2, Save,
  Cake, Share2, Globe, Copy, Crown, Check, AlertCircle, DollarSign, Wallet, PieChart, RefreshCw, CloudOff, Cloud,
  Gift, PartyPopper, Award, Receipt, History, Palette, Loader2, MousePointer2, Camera, Upload, Mic, Square, Play, Pause, FileSpreadsheet, FileText as FileTextIcon, FileCode, Image as ImageIcon
} from 'lucide-react';
import { CategoryType, SubCategoryType, ReminderDate, View, AppState, TimeUnit, LanguageCode, Expense, ExpenseCategory } from './types';
import { TRANSLATIONS, CATEGORY_DETAILS, SUB_CATEGORY_DETAILS, SUB_MAP, LANGUAGE_NAMES } from './constants';

const SHARED_GLOW_EFFECT = "shadow-[0_0_40px_-5px_rgba(255,255,255,0.22),0_0_15px_-2px_rgba(255,255,255,0.15)]";
const APP_URL = "https://play.google.com/store/apps/details?id=com.mydays&myexpenses.app"; 
const GITHUB_WALLPAPER_URL = "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/DESK2.png";

const calculateDaysUntil = (item: ReminderDate) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const itemDate = new Date(item.date);
  itemDate.setHours(0,0,0,0);

  if (item.repeatYearly) {
    let nextOccur = new Date(today.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    if (nextOccur < today) nextOccur.setFullYear(today.getFullYear() + 1);
    return Math.floor((nextOccur.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  const diffTime = itemDate.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const formatDateForInput = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatTimeTo12h = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const SHARE_MESSAGE_CUMPLEAÑOS = (lang: LanguageCode, userDob: string) => {
  const formattedDob = userDob ? new Date(userDob).toLocaleDateString(lang, { day: 'numeric', month: 'long' }) : '###';
  if (lang === 'es') {
    return `Hola, acabo de instalarme una aplicación para recordar la fecha de cumpleaños de mis amigos, recuérdame cuándo es tu cumpleaños por favor.\n\nTe dejo el link de la aplicación por si quieres recordar el mío que es el ${formattedDob}.\n\nLa app sirve también para recordarte otras cosas importantes y es gratis. ${APP_URL} `;
  }
  return `Hi! I just installed an app to remember my friends' birthdays. Could you please remind me when yours is?\n\nI'll leave the app link here in case you want to remember mine, which is on ${formattedDob}.\n\nThe app also helps you remember other important things and it's free. ${APP_URL} `;
};

const DateCard: React.FC<{ item: ReminderDate, language: LanguageCode, theme: 'light' | 'dark', wallpaper?: string, onCardClick: (item: ReminderDate) => void, onDeleteClick: (id: string) => void }> = ({ item, language, theme, wallpaper, onCardClick, onDeleteClick }) => {
  const isNote = item.category === CategoryType.NOTES; 
  const days = !isNote ? calculateDaysUntil(item) : 0;
  const themeKey = isNote ? (item.noteColor || CategoryType.NOTES) : item.category;
  let themeDetails = { ...CATEGORY_DETAILS[themeKey] };

  if (isNote && themeKey === CategoryType.BIRTHDAYS) {
    themeDetails.textColor = 'text-pink-600';
    themeDetails.lightColor = 'bg-pink-50';
  }

  const isPast = !isNote && days < 0;
  const displayIcon = isNote ? <StickyNote className={`w-[21.2px] h-[21.2px] ${themeDetails.textColor}`} strokeWidth={1.5} /> : (item.category === CategoryType.BIRTHDAYS ? React.cloneElement(themeDetails.icon as React.ReactElement<any>, { className: "w-[21.2px] h-[21.2px]", strokeWidth: 1.5 }) : (SUB_CATEGORY_DETAILS[item.subCategory]?.icon || themeDetails.icon));
  
  return (
    <div onClick={() => onCardClick(item)} className={`rounded-[2.2rem] p-4 mb-2 border flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer relative z-10 ${theme === 'dark' ? (wallpaper ? 'bg-slate-800/70 border-slate-700 backdrop-blur-md' : 'bg-slate-800 border-slate-700') : (wallpaper ? 'bg-white/70 border-slate-100 shadow-sm backdrop-blur-md' : 'bg-white border-slate-100 shadow-sm')}`}>
      <div className="flex items-center gap-5 flex-1 pointer-events-none">
        <div className={`w-[51px] h-[51px] rounded-2xl flex items-center justify-center shrink-0 ${themeDetails.lightColor} ${themeDetails.textColor}`}>{isNote ? displayIcon : React.cloneElement(displayIcon as React.ReactElement<any>, { className: "w-[21.2px] h-[21.2px]", strokeWidth: 1.5 })}</div>
        <div className="flex-1">
          <h3 className={`font-black text-[17.5px] legacy-tight ${theme === 'dark' ? 'text-white' : (isNote ? themeDetails.textColor : 'text-slate-600')}`}>{item.title}</h3>
          <p className={`text-[12.5px] font-bold uppercase tracking-widest mt-1 ${isNote ? themeDetails.textColor : 'text-slate-400'}`}>
            {new Date(item.date).toLocaleDateString(language, { day: '2-digit', month: '2-digit', year: (item.repeatYearly && !isNote) ? undefined : 'numeric' })} {item.category === CategoryType.APPOINTMENTS && item.time ? `- ${formatTimeTo12h(item.time)}` : ''} {isNote && '• NOTE'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isNote && <div className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${isPast ? 'bg-rose-100 text-rose-950 border-rose-900' : 'bg-indigo-50 text-indigo-600 border-transparent'}`}>{isPast ? 'EXPIRED' : (days === 0 ? 'TODAY' : `${days} d`)}</div>}
        <button onClick={(e) => { e.stopPropagation(); onDeleteClick(item.id); }} className={`p-2 transition-colors relative z-20 ${isNote ? themeDetails.textColor : 'text-slate-700 dark:text-slate-500 hover:text-rose-500'}`}><Trash2 className="w-5 h-5" strokeWidth={1.5} /></button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
  const [onboardingStep, setOnboardingStep] = useState<'splash' | 'carousel' | 'hidden'>(() => {
    return localStorage.getItem('vitaldates_onboarding_v1') ? 'hidden' : 'splash';
  });
  const [carouselIndex, setCarouselIndex] = useState(0);

  const onboardingImages = browserLang === 'es' ? [
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/C2.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/C3.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/C4.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/C5.png"
  ] : [
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/B2.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/B3.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/B4.png",
    "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/B5.png"
  ];

  const splashImg = browserLang === 'es' 
    ? "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/C1.png"
    : "https://raw.githubusercontent.com/Javier-eng/MYDAYSPICS/refs/heads/main/B1.png";

  useEffect(() => {
    if (onboardingStep === 'splash') {
      onboardingImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
      const timer = setTimeout(() => {
        setOnboardingStep('carousel');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep]);

  const handleSkip = () => {
    localStorage.setItem('vitaldates_onboarding_v1', 'true');
    setOnboardingStep('hidden');
  };

  const handleNext = () => {
    if (carouselIndex < onboardingImages.length - 1) {
      setCarouselIndex(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const expenseFileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  const [isPreloading, setIsPreloading] = useState(false);
  const [isDirectOnce, setIsDirectOnce] = useState(false);

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('vitaldates_v32_state');
    const cachedWallpaper = localStorage.getItem('vitaldates_wallpaper_cache');
    
    const defaults: AppState = {
      dates: [],
      expenses: [],
      language: browserLang as LanguageCode,
      isPro: false,
      theme: 'light',
      user: { 
        name: 'User', 
        email: 'hello@mail.com', 
        subscription: 'free', 
        dateOfBirth: '1995-01-01', 
        currency: '$', 
        showProfileImage: true, 
        wallpaperOpacity: 0.5,
        wallpaper: cachedWallpaper || undefined
      },
      globalSettings: {
        categoryConfigs: {
          [CategoryType.BIRTHDAYS]: { daysBefore: 1, notificationTime: '08:00' }, 
          [CategoryType.DOCUMENTS]: { daysBefore: 30, notificationTime: '12:00' }, 
          [CategoryType.SUBSCRIPTIONS]: { daysBefore: 7, notificationTime: '12:00' },
          [CategoryType.APPOINTMENTS]: { daysBefore: 2, notificationTime: '12:00' },
          [CategoryType.NOTES]: { daysBefore: 0, notificationTime: '00:00' },
          [CategoryType.VIOLET]: { daysBefore: 0, notificationTime: '00:00' }
        },
        reminderMethod: 'push',
        repetitionCount: 1,
        autoDeleteExpired: false,
        defaultNotificationTime: '09:00'
      }
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          user: { ...defaults.user, ...parsed.user, wallpaper: cachedWallpaper || parsed.user.wallpaper },
          globalSettings: { ...defaults.globalSettings, ...parsed.globalSettings },
          expenses: parsed.expenses || [], 
          dates: parsed.dates || []
        };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  useEffect(() => {
    const cached = localStorage.getItem('vitaldates_wallpaper_cache');
    if (!cached) {
      setIsPreloading(true);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = GITHUB_WALLPAPER_URL;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/png');
            localStorage.setItem('vitaldates_wallpaper_cache', dataUrl);
            setState(prev => ({ ...prev, user: { ...prev.user, wallpaper: dataUrl } }));
          } catch (e) {
            setState(prev => ({ ...prev, user: { ...prev.user, wallpaper: GITHUB_WALLPAPER_URL } }));
          }
        }
        setIsPreloading(false);
      };
      img.onerror = () => setIsPreloading(false);
    }
  }, []);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryType | null>(null);
  const [dashboardFilter, setDashboardFilter] = useState<CategoryType | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsModalOpenExpense] = useState(false);
  const [isViewExpensesModalOpen, setIsViewExpensesModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);
  const [isDeleteExpenseConfirmOpen, setIsDeleteExpenseConfirmOpen] = useState<string | null>(null);
  const [isContactConfirmOpen, setIsContactConfirmOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isAutoDeleteConfirmOpen, setIsAutoDeleteConfirmOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isEmailAlertConfirmOpen, setIsEmailAlertConfirmOpen] = useState(false);
  const [isDirectModeConfirmOpen, setIsDirectModeConfirmOpen] = useState(false);
  const [isNotifTimeModalOpen, setIsNotifTimeModalOpen] = useState(false);
  const [isWallpaperDeleteConfirmOpen, setIsWallpaperDeleteConfirmOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<ReminderDate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(new Date());
  const [isDirectAddMode, setIsDirectAddMode] = useState(false); 
  const [expandedExpenseCat, setExpandedExpenseCat] = useState<string | null>(null);
  
  const [repeatYearly, setRepeatYearly] = useState(false);
  
  const [modalNotifyValue, setModalNotifyValue] = useState(1);
  const [detailNotifyValue, setDetailNotifyValue] = useState(1);
  const [detailNotes, setDetailNotes] = useState('');
  const [noteIconColor, setNoteIconColor] = useState<CategoryType>(CategoryType.NOTES);

  const [apptHour, setApptHour] = useState('12');
  const [apptMin, setApptMin] = useState('00');
  const [apptAmPm, setApptAmPm] = useState<'AM' | 'PM'>('AM');

  const [notifHour, setNotifHour] = useState('09');
  const [notifMin, setNotifMin] = useState('00');
  const [notifAmPm, setNotifAmPm] = useState<'AM' | 'PM'>('AM');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [attachedFileBase64, setAttachedFileBase64] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [expensePhotoBase64, setExpensePhotoBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);

  const [cardExpMonth, setCardExpMonth] = useState('01');
  const [cardExpYear, setCardExpYear] = useState(new Date().getFullYear().toString());

  const [birthDay, setBirthDay] = useState('01');
  const [birthMonth, setBirthMonth] = useState('01');

  useEffect(() => {
    localStorage.setItem('vitaldates_v32_state', JSON.stringify(state));
  }, [state]);

  const getDayEvents = (date: Date) => {
    return state.dates.filter(item => {
      const d = new Date(item.date);
      if (item.repeatYearly && item.category !== CategoryType.NOTES) {
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
      }
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
  };

  const handleToggleTheme = () => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleToggleAutoDelete = () => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    if (!state.globalSettings.autoDeleteExpired) {
      setIsAutoDeleteConfirmOpen(true);
    } else {
      setState(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, autoDeleteExpired: false } }));
    }
  };

  const confirmAutoDeleteEnable = () => {
    setState(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, autoDeleteExpired: true } }));
    setIsAutoDeleteConfirmOpen(false);
  };

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        try {
          localStorage.setItem('vitaldates_wallpaper_cache', base64);
          setState(prev => ({ ...prev, user: { ...prev.user, wallpaper: base64 } }));
        } catch (err) {
          setState(prev => ({ ...prev, user: { ...prev.user, wallpaper: base64 } }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, user: { ...prev.user, profileImage: reader.result as string } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpensePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setExpensePhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!state.isPro) { 
      setIsPaywallOpen(true); 
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      return; 
    }
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedFileBase64(reader.result);
        }
      };
      reader.onerror = () => {
        console.error("FileReader Error");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleLogin = () => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    setIsSyncing(true);
    setTimeout(() => {
      setIsGoogleLoggedIn(true);
      setIsSyncing(false);
    }, 1500);
  };

  const activatePremium = () => {
    setState(prev => ({ 
      ...prev, 
      isPro: true, 
      user: { ...prev.user, subscription: 'lifetime', purchaseDate: new Date().toLocaleDateString() } 
    }));
    setIsPaywallOpen(false);
  };

  const handleImportContacts = () => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setIsContactConfirmOpen(false);
      alert(state.language === 'es' ? 'Contactos importados con éxito.' : 'Contacts imported successfully.');
    }, 2000);
  };

  const startRecording = async () => {
    if (!state.isPro) { setIsPaywallOpen(true); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/mp4';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => setAudioBase64(reader.result as string);
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      const intervalId = window.setInterval(() => {
        setRecordingTime(t => {
          if (t >= 30) { stopRecording(); window.clearInterval(intervalId); return 30; }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDownloadFile = (data: string, name: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNotifTime = () => {
    let h = parseInt(notifHour);
    if (notifAmPm === 'PM' && h < 12) h += 12;
    if (notifAmPm === 'AM' && h === 12) h = 0;
    const time24 = `${String(h).padStart(2, '0')}:${notifMin}`;
    setState(p => ({...p, globalSettings: {...p.globalSettings, defaultNotificationTime: time24}}));
    setIsNotifTimeModalOpen(false);
  };

  const t = TRANSLATIONS[state.language] || TRANSLATIONS.en;

  const uiBaseOpacity = state.user.wallpaper ? (1 - state.user.wallpaperOpacity * 0.7) : 1;
  const section1BgStyle = state.user.wallpaper ? { backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})` } : {};
  const section2BgStyle = state.user.wallpaper ? { backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity * 0.7})` : `rgba(255, 255, 255, ${uiBaseOpacity * 0.7})` } : {};
  
  const getSubtleBgStyle = (cat: CategoryType) => {
    const opacity = state.user.wallpaper ? (uiBaseOpacity * 0.60) : 1;
    const rgbMap: Record<string, string> = {
      BIRTHDAYS: '255, 241, 242',      // Rose 50
      DOCUMENTS: '239, 246, 255',      // Blue 50
      SUBSCRIPTIONS: '255, 251, 235',  // Amber 50
      APPOINTMENTS: '236, 253, 245',   // Emerald 50
      NOTES: '248, 250, 252',          // Slate 50
      VIOLET: '245, 243, 255'          // Violet 50
    };
    const darkRgbMap: Record<string, string> = {
      BIRTHDAYS: '69, 10, 31',         // Dark Rose
      DOCUMENTS: '23, 37, 84',         // Dark Blue
      SUBSCRIPTIONS: '69, 26, 3',      // Dark Amber
      APPOINTMENTS: '2, 44, 34',       // Dark Emerald
      NOTES: '30, 41, 59',             // Slate 800
      VIOLET: '46, 16, 101'            // Dark Violet
    };
    const rgb = state.theme === 'dark' ? darkRgbMap[cat] : rgbMap[cat];
    return { backgroundColor: `rgba(${rgb}, ${opacity})` };
  };

  const modalBgStyle = { 
    backgroundColor: state.theme === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(255, 255, 255)' 
  };

  const getMonthlyExpenses = useMemo(() => {
    const month = calendarDate.getMonth();
    const year = calendarDate.getFullYear();
    const monthName = calendarDate.toLocaleString(state.language, { month: 'long' });
    const filtered = state.expenses.filter(exp => {
      const parts = exp.date.split('-');
      return parseInt(parts[1]) - 1 === month && parseInt(parts[0]) === year;
    });
    const total = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const grouped = filtered.reduce((acc, curr) => {
      if (!acc[curr.category]) acc[curr.category] = { total: 0, items: [] };
      acc[curr.category].total += curr.amount;
      acc[curr.category].items.push(curr);
      return acc;
    }, {} as Record<string, { total: number, items: Expense[] }>);
    return { monthName, total, grouped, itemsRaw: filtered };
  }, [state.expenses, calendarDate, state.language]);

  const handleExport = (format: 'csv' | 'txt') => {
    let content = `${t.expensesOf} ${getMonthlyExpenses.monthName}\n\n`;
    (Object.entries(getMonthlyExpenses.grouped) as [string, { total: number, items: Expense[] }][]).forEach(([cat, data]) => {
      content += `--- ${t.expenseCategories[cat].toUpperCase()} ---\n`;
      data.items.forEach(it => {
        content += `${it.date} ${it.time} | ${it.amount} ${state.user.currency}\n`;
      });
      content += `Total: ${data.total.toFixed(2)} ${state.user.currency}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expenses_${getMonthlyExpenses.monthName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  const filteredDates = useMemo(() => {
    let result = state.dates.filter(d => d.category !== CategoryType.NOTES).sort((a, b) => calculateDaysUntil(a) - calculateDaysUntil(b));
    if (searchQuery) result = result.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (dashboardFilter) result = result.filter(d => d.category === dashboardFilter);
    return result;
  }, [state.dates, searchQuery, dashboardFilter]);

  const openEventDetails = (item: ReminderDate) => {
    setSelectedEvent(item); setDetailNotes(item.notes || '');
    const currentAdvance = item.notifyDaysBefore[0];
    if (item.category === CategoryType.APPOINTMENTS) {
      if (currentAdvance === 0.25) setDetailNotifyValue(0); else if (currentAdvance === 0.5) setDetailNotifyValue(1);
      else if (currentAdvance > 24) setDetailNotifyValue(Math.floor(currentAdvance / 24) + 25); else setDetailNotifyValue(Math.floor(currentAdvance) + 1);
    } else setDetailNotifyValue(Math.floor(currentAdvance));
    setIsDetailModalOpen(true); setIsDayModalOpen(false); 
  };

  const getAdvanceLabel = (cat: CategoryType | null, value: number) => {
    if (cat === CategoryType.APPOINTMENTS) {
      if (value === 0) return `15 ${t.min_suffix}`; if (value === 1) return `30 ${t.min_suffix}`;
      if (value <= 25) { const h = value - 1; return `${h} ${h === 1 ? 'HOUR' : t.hour_suffix}`; }
      const d = value - 25; return `${d} ${d === 1 ? t.day_suffix : t.days_suffix}`;
    }
    if (value === 0) return t.sameDay;
    return value === 1 ? `1 ${t.day_suffix}` : `${value} ${t.days_suffix}`;
  };

  const handleUpdateReminder = () => {
    if (!selectedEvent) return;
    let finalAdvance = detailNotifyValue;
    if (selectedEvent.category === CategoryType.APPOINTMENTS) {
       if (detailNotifyValue === 0) finalAdvance = 0.25; else if (detailNotifyValue === 1) finalAdvance = 0.5;
       else if (detailNotifyValue <= 25) finalAdvance = detailNotifyValue - 1; else finalAdvance = (detailNotifyValue - 25) * 24;
    }
    setState(prev => ({ ...prev, dates: prev.dates.map(d => d.id === selectedEvent.id ? { ...d, notes: detailNotes, notifyDaysBefore: [finalAdvance] } : d) }));
    setIsDetailModalOpen(false);
  };

  const changeCalendarMonth = (offset: number) => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));

  const renderCalendar = () => {
    const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
    const prevMonthDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 0).getDate();
    const days = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, prevMonthDays - i) });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, currentMonth: true, date: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i) });
    const weekDays = state.language === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="animate-in fade-in duration-500 relative z-10 mt-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => changeCalendarMonth(-1)} className={`p-3 rounded-2xl ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 text-slate-400 backdrop-blur-sm' : 'bg-slate-800 text-slate-400') : (state.user.wallpaper ? 'bg-white/70 text-slate-600 backdrop-blur-sm shadow-sm' : 'bg-slate-50 text-slate-600')} active:scale-90 transition-all`}><ChevronLeft className="w-5 h-5" strokeWidth={1.5} /></button>
          <h3 className="text-sm font-black uppercase tracking-widest">{calendarDate.toLocaleDateString(state.language, { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => changeCalendarMonth(1)} className={`p-3 rounded-2xl ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 text-slate-400 backdrop-blur-sm' : 'bg-slate-800 text-slate-400') : (state.user.wallpaper ? 'bg-white/70 text-slate-600 backdrop-blur-sm shadow-sm' : 'bg-slate-50 text-slate-600')} active:scale-90 transition-all`}><ChevronRight className="w-5 h-5" strokeWidth={1.5} /></button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDays.map(d => <div key={d} className="text-center text-[10px] font-black text-slate-400 py-2">{d}</div>)}
          {days.map((d, idx) => {
            const events = getDayEvents(d.date); 
            const isSelected = selectedCalendarDay && selectedCalendarDay.getDate() === d.date.getDate() && selectedCalendarDay.getMonth() === d.date.getMonth() && selectedCalendarDay.getFullYear() === d.date.getFullYear();
            const categories = new Set(events.map(e => e.category));
            return (
              <button key={idx} onClick={() => { if(d.currentMonth) { setSelectedCalendarDay(new Date(d.date)); setIsDayModalOpen(true); } }} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${!d.currentMonth ? 'opacity-20 pointer-events-none' : ''} ${isSelected ? 'bg-indigo-600 text-white shadow-lg scale-105 z-10' : (state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/50 backdrop-blur-sm' : 'bg-slate-800') : (state.user.wallpaper ? 'bg-white/50 shadow-sm border border-slate-100 backdrop-blur-sm' : 'bg-slate-50 shadow-sm border border-slate-100 dark:border-slate-700'))}`}>
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {categories.has(CategoryType.BIRTHDAYS) && <div className={`w-2 h-2 rounded-full border border-white/30 ${isSelected ? 'bg-white' : 'bg-rose-500'}`}></div>}
                  {categories.has(CategoryType.DOCUMENTS) && <div className={`w-2 h-2 rounded-full border border-white/30 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                </div>
                <span className="text-[14px] font-black">{d.day}</span>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {categories.has(CategoryType.SUBSCRIPTIONS) && <div className={`w-2 h-2 rounded-full border border-white/30 ${isSelected ? 'bg-white' : 'bg-amber-500'}`}></div>}
                  {categories.has(CategoryType.APPOINTMENTS) && <div className={`w-2 h-2 rounded-full border border-white/30 ${isSelected ? 'bg-white' : 'bg-emerald-50'}`}></div>}
                  {categories.has(CategoryType.NOTES) && <div className={`w-2 h-2 rounded-none border border-white/30 ${isSelected ? 'bg-white' : 'bg-slate-400'}`}></div>}
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={() => { if(!state.isPro) setIsPaywallOpen(true); else setIsViewExpensesModalOpen(true); }} className={`w-full p-6 rounded-[2rem] border flex items-center justify-between shadow-sm active:scale-95 transition-all ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 border-slate-700 backdrop-blur-md' : 'bg-slate-800 border-slate-700') : (state.user.wallpaper ? 'bg-white/70 border-white shadow-sm backdrop-blur-md' : 'bg-indigo-50 border-indigo-100')}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Wallet className="w-6 h-6" strokeWidth={1.5} /></div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.viewMyExpenses}</p>
              <p className={`text-sm font-black uppercase ${state.theme === 'dark' ? 'text-white' : 'text-indigo-600'}`}>{getMonthlyExpenses.monthName}</p>
            </div>
          </div>
          <div className="text-right">
            {!state.isPro && <Crown className="w-4 h-4 text-amber-500 mb-1 ml-auto" strokeWidth={1.5} />}
            <p className="text-[9px] font-black text-slate-400 uppercase">{t.totalMonthly}</p>
            <p className={`text-lg font-black ${state.theme === 'dark' ? 'text-white' : 'text-indigo-600'}`}>
              {(getMonthlyExpenses.total || 0).toFixed(2)} {state.user.currency || '$'}
            </p>
          </div>
        </button>
      </div>
    );
  };

  const getDynamicModalStyles = (category: CategoryType | null, noteColor?: CategoryType, forNote: boolean = false) => {
    const baseCategory = forNote ? (noteColor || CategoryType.NOTES) : category;
    
    if (!baseCategory) return { light: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600', focus: 'focus:border-indigo-500', accent: 'accent-indigo-600', label: 'text-slate-400', saveBtn: 'bg-indigo-600' };

    if (forNote && baseCategory === CategoryType.BIRTHDAYS) {
      return { 
        light: 'bg-pink-50 border-pink-100', 
        text: 'text-pink-600', 
        focus: 'focus:border-pink-300', 
        accent: 'accent-pink-600', 
        label: 'text-pink-500', 
        saveBtn: 'bg-pink-600' 
      };
    }

    if (!forNote && baseCategory === CategoryType.BIRTHDAYS) {
      return { 
        light: 'bg-indigo-50 border-indigo-100', 
        text: 'text-indigo-600', 
        focus: 'focus:border-pink-300', 
        accent: 'accent-indigo-600', 
        label: 'text-indigo-500', 
        saveBtn: 'bg-indigo-600' 
      };
    }
    
    if (baseCategory === CategoryType.SUBSCRIPTIONS) {
      return { 
        light: 'bg-orange-50 border-orange-100', 
        text: 'text-orange-700', 
        focus: 'focus:border-orange-300', 
        accent: 'accent-orange-600', 
        label: 'text-orange-600', 
        saveBtn: 'bg-orange-600' 
      };
    }

    const baseColorName = baseCategory === CategoryType.DOCUMENTS ? 'blue' : baseCategory === CategoryType.APPOINTMENTS ? 'emerald' : baseCategory === CategoryType.VIOLET ? 'violet' : 'slate';
    
    return { 
      light: baseCategory === CategoryType.DOCUMENTS ? 'bg-blue-50 border-blue-100' : 
             baseCategory === CategoryType.APPOINTMENTS ? 'bg-emerald-50 border-emerald-100' :
             baseCategory === CategoryType.VIOLET ? 'bg-violet-50 border-violet-100' :
             'bg-slate-50 border-slate-100', 
      text: baseCategory === CategoryType.DOCUMENTS ? 'text-blue-700' : 
            baseCategory === CategoryType.APPOINTMENTS ? 'text-emerald-700' :
            baseCategory === CategoryType.VIOLET ? 'text-violet-700' :
            'text-slate-700', 
      focus: `focus:border-${baseColorName}-300`, 
      accent: `accent-${baseColorName}-600`, 
      label: `text-${baseColorName}-400`, 
      saveBtn: `bg-${baseColorName}-600` 
    };
  };

  const createModalStyles = getDynamicModalStyles(activeCategory, noteIconColor, activeCategory === CategoryType.NOTES);
  const detailModalStyles = getDynamicModalStyles(selectedEvent?.category || null, selectedEvent?.noteColor, selectedEvent?.category === CategoryType.NOTES);

  if (onboardingStep !== 'hidden') {
    return (
      <div className="fixed inset-0 z-[9999] bg-white overflow-hidden flex flex-col items-center justify-center">
        {onboardingStep === 'splash' ? (
          <div className="w-screen h-screen transition-opacity duration-1000 animate-in fade-in" style={{ backgroundImage: `url(${splashImg})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100vw', height: '100vh' }} />
        ) : (
          <div className="relative w-screen h-screen overflow-hidden">
            <div onClick={handleNext} className="w-full h-full cursor-pointer transition-all duration-500 ease-in-out" style={{ backgroundImage: `url(${onboardingImages[carouselIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100vw', height: '100vh' }} />
            <button onClick={(e) => { e.stopPropagation(); handleSkip(); }} className="absolute bottom-10 left-10 px-8 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-slate-700 font-black uppercase text-sm tracking-widest active:scale-90 transition-all z-[10000]">{browserLang === 'es' ? 'SALTAR' : 'SKIP'}</button>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-[10000]">
              {onboardingImages.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col transition-colors mx-auto w-full max-w-xl overflow-hidden relative ${state.theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      {isPreloading && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading experience...</p>
          </div>
        </div>
      )}
      {state.user.wallpaper && <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700" style={{ backgroundImage: `url(${state.user.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: state.user.wallpaperOpacity }} />}
      <header style={section1BgStyle} className={`px-[30.36px] pt-8 pb-4 flex items-center justify-between shrink-0 z-10 relative backdrop-blur-sm border-b border-white/10`}>
        <div onClick={() => setCurrentView('dashboard')} className="cursor-pointer flex items-center gap-4">
          {state.user.showProfileImage && (
            <div className="w-[42px] h-[42px] rounded-full ring-[0.5px] ring-white p-[1px] shadow-sm flex items-center justify-center shrink-0 bg-white">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {state.user.profileImage ? ( <img src={state.user.profileImage} alt="User Profile" className="w-full h-full object-cover" /> ) : ( <UserIcon className="text-violet-500 w-6 h-6" strokeWidth={1.5} /> )}
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-baseline"><h1 className="text-[29.25px] font-black uppercase tracking-[0.05em] leading-none text-slate-700 dark:text-slate-300">{t.appName}</h1></div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/50"></div>
              <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.allImportant}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            {isSyncing ? <RefreshCw className="w-[17px] h-[17px] text-indigo-500 animate-spin" strokeWidth={1.5} /> : (isGoogleLoggedIn ? <Cloud className="w-[17px] h-[17px] text-emerald-500" strokeWidth={1.5} /> : <CloudOff className="w-[17px] h-[17px] text-slate-300" strokeWidth={1.5} />)}
            {state.isPro && <Star className="w-[17px] h-[17px] text-amber-400 fill-amber-400 animate-pulse" strokeWidth={1.5} />}
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsModalOpenExpense(true); }} className={`w-[42.1px] h-[42.1px] ${state.theme === 'dark' ? 'bg-slate-700/80' : 'bg-slate-100/80'} rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all relative`}>
            <Wallet className={`w-[23.1px] h-[23.1px] ${state.isPro ? 'text-blue-600' : (state.theme === 'dark' ? 'text-white' : 'text-[#6b6d8a]')}`} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main style={section2BgStyle} className={`flex-1 flex flex-col overflow-hidden relative z-10 backdrop-blur-[2px] transition-colors`}>
        {currentView === 'dashboard' && (
          <div className="h-full flex flex-col">
            <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-2 shrink-0 z-10">
              <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.upcoming} className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-xs outline-none border border-transparent focus:border-indigo-500/50 transition-all ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/50 text-white' : 'bg-slate-800 text-white') : (state.user.wallpaper ? 'bg-white/50 text-slate-900' : 'bg-slate-50 shadow-inner')}`} /></div>
              <div className="flex justify-between mb-4">{Object.values(CategoryType).filter(c => c !== CategoryType.NOTES && c !== CategoryType.VIOLET).map(cat => (
                <div key={cat} className="w-[31.25%] flex flex-col items-center">
                  <button 
                    onClick={() => setDashboardFilter(dashboardFilter === cat ? null : cat)} 
                    style={dashboardFilter === cat ? {} : getSubtleBgStyle(cat)}
                    className={`w-[90%] aspect-[1/0.38] rounded-2xl flex items-center justify-center transition-all ${dashboardFilter === cat ? `bg-gradient-to-br ${CATEGORY_DETAILS[cat].color} text-white shadow-lg scale-105` : (state.theme === 'dark' ? `backdrop-blur-sm ${SHARED_GLOW_EFFECT}` : (state.user.wallpaper ? `backdrop-blur-sm shadow-sm` : ''))}`}>
                    <div className={dashboardFilter === cat ? 'text-white' : CATEGORY_DETAILS[cat].textColor}>
                      {React.cloneElement(CATEGORY_DETAILS[cat].icon as React.ReactElement<any>, { className: "w-[34.96px] h-[34.96px]", strokeWidth: 1.5 })}
                    </div>
                  </button>
                  {dashboardFilter === cat && <span className={`text-[15.1px] font-black uppercase tracking-tighter mt-1 text-center whitespace-nowrap w-full ${CATEGORY_DETAILS[cat].textColor}`}>{cat === CategoryType.DOCUMENTS ? t.homeDocuments : (t as any)[cat.toLowerCase()]}</span>}
                </div>))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-[30.36px] pt-4 pb-28 scroll-smooth relative z-10 animate-in fade-in duration-500">{filteredDates.map(item => <DateCard key={item.id} item={item} language={state.language} theme={state.theme} wallpaper={state.user.wallpaper} onCardClick={openEventDetails} onDeleteClick={(id) => setIsDeleteConfirmOpen(id)} />)}</div>
          </div>
        )}
        {currentView === 'categories' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-4 shrink-0 z-10">
              <div className="flex items-center justify-between"><h2 className="text-xs font-black tracking-widest text-slate-500 uppercase">{t.categories}</h2><div className="flex items-center gap-3"><span className="text-xs font-black tracking-widest uppercase text-slate-500">{state.language === 'es' ? 'MODO DIRECTO' : 'DIRECT MODE'}</span><button onClick={() => { if (!isDirectAddMode) setIsDirectModeConfirmOpen(true); else setIsDirectAddMode(false); }} className={`w-[33.6px] h-[16.8px] rounded-full relative transition-all ${isDirectAddMode ? 'bg-emerald-50 border-[0.5px] border-emerald-600' : 'bg-slate-300'} flex items-center shadow-sm active:scale-95`}><div className={`absolute w-[12px] h-[12px] rounded-full bg-white shadow-md transition-all ${isDirectAddMode ? 'right-[2px] border border-emerald-600' : 'left-[2px]'}`} /></button></div></div>
            </div>
            <div className="flex-1 overflow-y-auto px-[30.36px] pt-6 pb-28 animate-in fade-in duration-500 relative z-10">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {Object.values(CategoryType).filter(c => c !== CategoryType.NOTES && c !== CategoryType.VIOLET).map(cat => (
                  <button key={cat} 
                    onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); if (isDirectAddMode || isDirectOnce) { if (cat === CategoryType.BIRTHDAYS) { setRepeatYearly(true); setModalNotifyValue(1); setIsModalOpen(true); setIsDirectOnce(false); } else setCurrentView('sub-categories'); } else { if (cat === CategoryType.BIRTHDAYS) setCurrentView('category-detail'); else setCurrentView('sub-categories'); } }} 
                    style={getSubtleBgStyle(cat)} 
                    className={`aspect-square rounded-[2rem] p-6 flex flex-col items-center justify-center border-[1.4px] transition-all active:scale-95 backdrop-blur-md ${CATEGORY_DETAILS[cat].textColor.replace('text-', 'border-')}`}>
                    <div className={`mb-4 ${CATEGORY_DETAILS[cat].textColor}`}>{React.cloneElement(CATEGORY_DETAILS[cat].icon as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.05 })}</div>
                    <span className={`font-black text-[12.5px] uppercase tracking-widest text-center ${CATEGORY_DETAILS[cat].textColor}`}>{(t as any)[cat.toLowerCase()]}</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { setActiveCategory(CategoryType.NOTES); if (isDirectAddMode || isDirectOnce) { setNoteIconColor(CategoryType.NOTES); setRepeatYearly(false); setIsModalOpen(true); setIsDirectOnce(false); } else { setCurrentView('category-detail'); } }} 
                style={getSubtleBgStyle(CategoryType.NOTES)} 
                className={`w-full h-[70px] rounded-[2rem] border-[1.4px] border-slate-400 flex items-center justify-center gap-4 transition-all active:scale-95 backdrop-blur-md text-slate-500`}>
                <StickyNote className="w-8 h-8" strokeWidth={1.05} />
                <span className={`font-black text-[12.5px] uppercase tracking-widest ${CATEGORY_DETAILS[CategoryType.NOTES].textColor}`}>{t.notes}</span>
              </button>
            </div>
          </div>
        )}
        {currentView === 'sub-categories' && activeCategory && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-4 shrink-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><button onClick={() => setCurrentView('categories')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-90 ${state.user.wallpaper ? 'bg-slate-100/60 backdrop-blur-sm' : 'bg-slate-100 dark:bg-slate-800'}`}><ChevronLeft className="text-slate-600" strokeWidth={1.5} /></button><h2 className="text-xs font-black uppercase">{(t as any)[activeCategory.toLowerCase()]}</h2></div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black tracking-widest uppercase text-slate-500">{state.language === 'es' ? 'MODO DIRECTO' : 'DIRECT MODE'}</span>
                  <button onClick={() => { if (!isDirectAddMode) setIsDirectModeConfirmOpen(true); else setIsDirectAddMode(false); }} className={`w-[33.6px] h-[16.8px] rounded-full relative transition-all ${isDirectAddMode ? 'bg-emerald-50 border-[0.5px] border-emerald-600' : 'bg-slate-300'} flex items-center shadow-sm active:scale-95`}><div className={`absolute w-[12px] h-[12px] rounded-full bg-white shadow-md transition-all ${isDirectAddMode ? 'right-[2px] border border-emerald-600' : 'left-[2px]'}`} /></button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-[30.36px] pt-6 pb-28 animate-in slide-in-from-right duration-500 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                {SUB_MAP[activeCategory].map(sub => (
                  <button key={sub} onClick={() => { setActiveSubCategory(sub); if (isDirectAddMode || isDirectOnce) { const notifyVal = activeCategory === CategoryType.DOCUMENTS ? 30 : (activeCategory === CategoryType.APPOINTMENTS ? 2 : 7); setModalNotifyValue(notifyVal); setRepeatYearly(false); setIsModalOpen(true); setIsDirectOnce(false); } else setCurrentView('category-detail'); }} className={`aspect-square rounded-[2rem] ${activeCategory === CategoryType.SUBSCRIPTIONS ? 'bg-gradient-to-br from-amber-400 to-amber-600' : `bg-gradient-to-br ${CATEGORY_DETAILS[activeCategory].color}`} p-5 flex flex-col items-center justify-between border border-white/20 active:scale-95 transition-all shadow-lg`}>
                    <div className="flex-1 flex items-start justify-center pt-2"><div className="p-4 bg-white/20 rounded-xl text-white">{React.cloneElement(SUB_CATEGORY_DETAILS[sub].icon as React.ReactElement<any>, { strokeWidth: 1.5 })}</div></div>
                    <span className="text-white font-black text-[13.8px] uppercase tracking-widest text-center pb-2">{(t as any)[SUB_CATEGORY_DETAILS[sub].labelKey]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {currentView === 'category-detail' && activeCategory && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-6 shrink-0 z-10 border-b border-black/5 dark:border-white/5 relative">
              <div className="flex items-center gap-3 overflow-hidden mb-6">
                <button onClick={() => { if(activeCategory === CategoryType.BIRTHDAYS || activeCategory === CategoryType.NOTES) setCurrentView('categories'); else setCurrentView('sub-categories'); }} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all ${state.user.wallpaper ? 'bg-slate-100/60 backdrop-blur-sm' : 'bg-slate-100 dark:bg-slate-800'}`}><ChevronLeft className="text-slate-600" strokeWidth={1.5} /></button>
                <div className="flex items-center gap-4 truncate">
                  <div className={activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : (activeCategory === CategoryType.NOTES ? 'text-slate-500' : CATEGORY_DETAILS[activeCategory].textColor)}>
                    {activeSubCategory && SUB_CATEGORY_DETAILS[activeSubCategory] ? React.cloneElement(SUB_CATEGORY_DETAILS[activeSubCategory].icon as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.5 }) : (activeCategory === CategoryType.NOTES ? <StickyNote className="w-12 h-12" strokeWidth={1.5} /> : React.cloneElement(CATEGORY_DETAILS[activeCategory].icon as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.5 }))}
                  </div>
                  <h2 className={`text-[26.5px] font-black uppercase leading-tight truncate ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : (activeCategory === CategoryType.NOTES ? 'text-slate-500' : CATEGORY_DETAILS[activeCategory].textColor)}`}>
                    {activeCategory === CategoryType.BIRTHDAYS ? t.birthdays : (activeSubCategory && SUB_CATEGORY_DETAILS[activeSubCategory] ? (t as any)[SUB_CATEGORY_DETAILS[activeSubCategory].labelKey] : (t as any)[activeCategory!.toLowerCase()])}
                  </h2>
                </div>
              </div>
              <button onClick={() => { if (activeCategory === CategoryType.BIRTHDAYS) setRepeatYearly(true); else if (activeCategory === CategoryType.NOTES) { setNoteIconColor(CategoryType.NOTES); setRepeatYearly(false); } else setRepeatYearly(false); setModalNotifyValue(activeCategory === CategoryType.DOCUMENTS ? 30 : (activeCategory === CategoryType.APPOINTMENTS ? 2 : 7)); setIsModalOpen(true); }} className={`w-full py-[18px] rounded-3xl font-black text-[13.5px] uppercase tracking-[0.1em] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-white ${activeCategory === CategoryType.BIRTHDAYS ? 'bg-indigo-600' : `bg-gradient-to-br ${CATEGORY_DETAILS[activeCategory].color}`}`}>
                <Plus className="w-5 h-5" strokeWidth={2.5} /> {activeCategory === CategoryType.NOTES ? t.addNote : t.addDate}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-[30.36px] pt-6 pb-28 animate-in slide-in-from-right duration-500 relative z-10">
              {activeCategory === CategoryType.BIRTHDAYS && (
                <div className={`mb-6 p-5 border rounded-[2.5rem] flex flex-col gap-3 relative z-10 shadow-sm ${state.user.wallpaper ? (state.theme === 'dark' ? 'bg-indigo-900/40 border-indigo-800' : 'bg-indigo-50/70 border-indigo-100 backdrop-blur-md') : 'bg-indigo-50/80 border-indigo-100'}`}>
                  <button onClick={() => setIsShareModalOpen(true)} className="w-full py-[13.34px] rounded-2xl bg-indigo-400 text-white font-black uppercase text-[11.6px] tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"><Share2 className="w-[18.56px] h-[18.56px]" strokeWidth={1.5} /> {t.askFriends}</button>
                  <button onClick={() => { if (!state.isPro) setIsPaywallOpen(true); else setIsContactConfirmOpen(true); }} className="w-full py-[13.34px] rounded-2xl bg-indigo-400 text-white font-black uppercase text-[11.6px] tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                    {!state.isPro && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}
                    <UsersIcon className="w-[18.56px] h-[18.56px]" strokeWidth={1.5} /> {t.contactsLabel.replace('\n', ' ')}
                  </button>
                </div>
              )}
              <div style={modalBgStyle} className={`mb-6 p-6 rounded-[2.5rem] border flex gap-4 items-start ${activeCategory === CategoryType.BIRTHDAYS ? 'bg-indigo-50 border-indigo-100' : getDynamicModalStyles(activeCategory).light}`}>
                <Info className={`w-5 h-5 ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : getDynamicModalStyles(activeCategory).text} shrink-0 mt-0.5`} strokeWidth={1.5} />
                <p className={`text-[13.2px] font-bold leading-relaxed tracking-wider ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-500' : getDynamicModalStyles(activeCategory).label}`}>
                  {(activeCategory === CategoryType.NOTES ? t.desc_NOTES : (activeSubCategory ? (t as any)[`desc_${activeSubCategory}`] : (activeCategory ? (t as any)[`desc_${activeCategory}`] : ''))).split('\n').map((line: string, i: number) => (
                    <span key={i} className={`${line.toUpperCase().includes('IMPORTAN') ? 'italic block' : 'block'}`}>{line}</span>
                  ))}
                </p>
              </div>
              <div className="space-y-1 relative z-10">{state.dates.filter(d => d.category === activeCategory && (!activeSubCategory || d.subCategory === activeSubCategory)).map(item => <DateCard key={item.id} item={item} language={state.language} theme={state.theme} wallpaper={state.user.wallpaper} onCardClick={openEventDetails} onDeleteClick={(id) => setIsDeleteConfirmOpen(id)} />)}</div>
            </div>
          </div>
        )}
        {currentView === 'calendar' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-2 shrink-0 relative z-10"><h2 className="text-xs font-black text-slate-500 uppercase">{t.calendar}</h2></div>
            <div className="flex-1 overflow-y-auto px-[30.36px] pt-4 pb-28 animate-in fade-in duration-500 relative">{renderCalendar()}</div>
          </div>
        )}
        {currentView === 'settings' && (
          <div className="flex-1 flex flex-col overflow-hidden">
             <div style={state.user.wallpaper ? {backgroundColor: state.theme === 'dark' ? `rgba(15, 23, 42, ${uiBaseOpacity})` : `rgba(255, 255, 255, ${uiBaseOpacity})`} : {}} className="px-[30.36px] pt-4 pb-2 shrink-0 relative z-10"><h2 className="text-xs font-black text-slate-500 uppercase">{t.settings}</h2></div>
             <div className="flex-1 overflow-y-auto px-[30.36px] pt-4 pb-28 animate-in fade-in duration-500 relative z-10">
               <div className="space-y-6">
                 <div onClick={() => setIsProfileModalOpen(true)} className={`rounded-[2rem] p-7 border transition-all cursor-pointer relative overflow-hidden ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 backdrop-blur-md border-slate-700' : 'bg-slate-800 border-slate-700') : (state.user.wallpaper ? 'bg-white/70 backdrop-blur-md border-slate-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm')}`}><div className="flex items-center gap-4 relative z-10"><div className="w-14 h-14 bg-violet-500 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/20">{state.user.showProfileImage && state.user.profileImage ? <img src={state.user.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon strokeWidth={1.5} />}</div><div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-black text-sm uppercase">{state.user.name}</h3>{state.isPro && <span className="bg-amber-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Crown className="w-2 h-2" strokeWidth={1.5} /> GOLD</span>}</div><p className="text-[10px] text-slate-400 font-bold">{state.user.email}</p></div><Edit2 className="w-4 h-4 text-slate-300" strokeWidth={1.5} /></div></div>
                 
                 <div className={`rounded-[2.5rem] p-6 border ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 backdrop-blur-md border-slate-700' : 'bg-slate-800 border-slate-700') : (state.user.wallpaper ? 'bg-white/70 border-slate-100 backdrop-blur-md' : 'bg-white border-slate-100 shadow-sm')} space-y-6 shadow-sm`}><div className="flex items-center justify-between cursor-pointer" onClick={() => setIsLangModalOpen(true)}><div className="flex items-center gap-3"><Globe className="text-indigo-600" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase">{t.language}</span></div><span className="text-[11px] font-black text-indigo-600 dark:text-white uppercase">{LANGUAGE_NAMES[state.language]}</span></div><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Moon strokeWidth={1.5} /><span className="text-[11px] font-black uppercase">{t.theme}</span>{!state.isPro && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}</div><button onClick={handleToggleTheme} className={`w-12 h-6 rounded-full relative transition-all ${state.theme === 'dark' ? 'bg-emerald-50' : 'bg-slate-300'} flex items-center`}><div className={`absolute w-4 h-4 rounded-full bg-white shadow-md transition-all ${state.theme === 'dark' ? 'right-1' : 'left-1'}`} /></button></div><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Trash2 className="text-rose-500 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase leading-tight">{t.autoDelete}</span>{!state.isPro && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}</div><button onClick={handleToggleAutoDelete} className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${state.globalSettings.autoDeleteExpired ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center`} ><div className={`absolute w-4 h-4 rounded-full bg-white transition-all shadow-md ${state.globalSettings.autoDeleteExpired ? 'right-1' : 'left-1'}`} /></button></div><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Mail className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase leading-tight">{t.notifyMethod}</span>{!state.isPro && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}</div><button onClick={() => { if (!state.isPro) setIsPaywallOpen(true); else if (state.globalSettings.reminderMethod === 'mail') setState(p => ({...p, globalSettings: {...p.globalSettings, reminderMethod: 'push'}})); else setIsEmailAlertConfirmOpen(true); }} className={`w-12 h-6 rounded-full relative transition-all shrink-0 ${state.globalSettings.reminderMethod === 'mail' ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center`} ><div className={`absolute w-4 h-4 rounded-full bg-white transition-all shadow-md ${state.globalSettings.reminderMethod === 'mail' ? 'right-1' : 'left-1'}`} /></button></div><div className="flex items-center justify-between cursor-pointer" onClick={() => { 
                   const [h24, m] = state.globalSettings.defaultNotificationTime.split(':');
                   let h = parseInt(h24);
                   const ampm = h >= 12 ? 'PM' : 'AM';
                   h = h % 12 || 12;
                   setNotifHour(String(h).padStart(2, '0'));
                   setNotifMin(m);
                   setNotifAmPm(ampm);
                   setIsNotifTimeModalOpen(true);
               }}><div className="flex items-center gap-3"><Clock className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase leading-tight">{t.generalNotifTime}</span></div><span className="text-[11px] font-black text-indigo-600 dark:text-white uppercase">{formatTimeTo12h(state.globalSettings.defaultNotificationTime)}</span></div><div className="flex items-center justify-between cursor-pointer" onClick={() => setIsInfoModalOpen(true)}><div className="flex items-center gap-3"><Info className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase leading-tight">{t.info}</span></div><ChevronRight className="w-4 h-4 text-slate-300" strokeWidth={1.5} /></div></div><div className={`rounded-[2.5rem] p-6 border ${state.theme === 'dark' ? (state.user.wallpaper ? 'bg-slate-800/70 backdrop-blur-md border-slate-700' : 'bg-slate-800 border-slate-700') : (state.user.wallpaper ? 'bg-white/70 border-slate-100 backdrop-blur-md' : 'bg-white border-slate-100 shadow-sm')} space-y-6 shadow-sm`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><ImageIcon className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase leading-tight">{state.language === 'es' ? 'FONDO DE PANTALLA' : 'WALLPAPER'}</span>{!state.isPro && <Crown className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />}</div><div className="flex items-center gap-2">{state.user.wallpaper && <button onClick={() => setIsWallpaperDeleteConfirmOpen(true)} className="p-2 text-rose-500 rounded-full active:scale-90 transition-all"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>}<button onClick={() => { if (!state.isPro) setIsPaywallOpen(true); else wallpaperInputRef.current?.click(); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-md">{state.user.wallpaper ? (state.language === 'es' ? 'CAMBIAR' : 'CHANGE') : (state.language === 'es' ? 'SUBIR FOTO' : 'UPLOAD')}</button><input type="file" ref={wallpaperInputRef} onChange={handleWallpaperUpload} accept="image/*" className="hidden" /></div></div>{state.user.wallpaper && (<div className="space-y-2 animate-in slide-in-from-top duration-300"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{state.language === 'es' ? 'OPACIDAD DEL FONDO' : 'WALLPAPER OPACITY'}</label><input type="range" min="0" max="1" step="0.01" value={state.user.wallpaperOpacity} onChange={(e) => { if (!state.isPro) setIsPaywallOpen(true); else setState(p => ({...p, user: {...p.user, wallpaperOpacity: parseFloat(e.target.value)}})); }} className="w-full h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" /></div>)}</div>
               
                 {!state.isPro && (
                   <div onClick={() => setIsPaywallOpen(true)} className="rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 text-white relative overflow-hidden shadow-xl active:scale-[0.98] transition-all cursor-pointer group animate-in zoom-in duration-500">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Crown size={120} strokeWidth={1} /></div>
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-inner"><Crown className="text-amber-400" strokeWidth={2} /></div>
                        <h3 className="font-black text-xl mb-2 tracking-tighter italic">{t.goldBannerTitle}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-6 px-4">{t.goldBannerText}</p>
                        <div className="px-8 py-3 bg-white text-indigo-600 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">{t.unlockPremium}</div>
                      </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}
      </main>

      <nav style={section1BgStyle} className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl flex justify-around items-center py-6 z-50 px-[30.36px] mx-auto w-full max-w-xl border-white/10`}>
        {[ { icon: <Home />, view: 'dashboard' as View }, { icon: <LayoutGrid />, view: 'categories' as View }, { icon: <CalendarIcon />, view: 'calendar' as View }, { icon: <SettingsIcon />, view: 'settings' as View } ].map(item => {
          const isActive = currentView === item.view;
          return ( <button key={item.view} onClick={() => { setCurrentView(item.view); setActiveCategory(null); setActiveSubCategory(null); setDashboardFilter(null); setSelectedCalendarDay(new Date()); setIsDirectOnce(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-500'}`}>{React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-8 h-8", strokeWidth: 1.5 })}</button> );
        })}
      </nav>

      {/* MODALS SECTION */}
      {isDayModalOpen && selectedCalendarDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[80vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}><div className="flex justify-between items-center mb-8"><div><h2 className="text-xl font-black uppercase tracking-widest">{t.eventsForDay}</h2><p className="text-[22.68px] font-bold text-slate-600 mt-1 uppercase tracking-widest leading-tight">{selectedCalendarDay.toLocaleDateString(state.language, { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><button onClick={() => setIsDayModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full shadow-sm active:scale-75 transition-all"><X className="w-5 h-5 text-slate-900 dark:text-white"/></button></div><div className="space-y-2 mb-8">{getDayEvents(selectedCalendarDay).length > 0 ? getDayEvents(selectedCalendarDay).map(item => <DateCard key={item.id} item={item} language={state.language} theme={state.theme} wallpaper={state.user.wallpaper} onCardClick={openEventDetails} onDeleteClick={(id) => setIsDeleteConfirmOpen(id)} />) : <div className="py-10 text-center opacity-30"><CalendarIcon className="mx-auto mb-2 w-8 h-8" strokeWidth={1.5} /><p className="text-[10px] font-black uppercase tracking-widest">{t.noEventsToday}</p></div>}</div><button onClick={() => { if(!state.isPro) setIsPaywallOpen(true); else { setIsDayModalOpen(false); setIsDirectOnce(true); setCurrentView('categories'); } }} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-0 active:scale-95 transition-all relative">
            {!state.isPro && <Crown className="w-4 h-4 text-amber-500 absolute top-1 right-2" strokeWidth={1.5} />}
            <Plus className="w-9 h-9" strokeWidth={2.5} /> 
            <span className="text-[13px]">{`${t.addDate} ${state.language === 'es' ? 'O NOTA' : 'OR NOTE'}`}</span>
          </button></div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-6">
              {activeCategory === CategoryType.NOTES ? (
                <div className="flex items-center gap-3 w-full">
                  <div className={createModalStyles.text}><StickyNote className="w-12 h-12" strokeWidth={1.5} /></div>
                  <h2 className={`${createModalStyles.text} text-[26.5px] font-black uppercase leading-tight`}>{t.addNote}</h2>
                </div>
              ) : (
                <div className="flex flex-col w-full"><p className="text-[20.1px] font-black uppercase text-slate-400 leading-tight text-left mb-2">{t.addDate}</p><div className="flex items-center gap-4"><div className={activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : createModalStyles.text}>{activeSubCategory ? React.cloneElement(SUB_CATEGORY_DETAILS[activeSubCategory].icon as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.5 }) : React.cloneElement(CATEGORY_DETAILS[(activeCategory as any) || CategoryType.BIRTHDAYS].icon as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.5 })}</div><h2 className={`${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : createModalStyles.text} text-[26.5px] font-black uppercase leading-tight`}>{(activeCategory as any) === CategoryType.BIRTHDAYS ? t.birthdays : (activeSubCategory ? (t as any)[SUB_CATEGORY_DETAILS[activeSubCategory].labelKey] : (t as any)[activeCategory!.toLowerCase()])}</h2></div></div>
              )}
              <button onClick={() => { setIsModalOpen(false); setIsRecording(false); setAudioBase64(null); setAttachedFileBase64(null); }} className="p-3 bg-slate-100 dark:bg-slate-200 rounded-full active:scale-75 transition-all"><X className="w-5 h-5 text-slate-900"/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); 
              let finalDate = fd.get('date') as string;
              if (activeCategory === CategoryType.BIRTHDAYS) {
                const year = repeatYearly ? 2000 : new Date().getFullYear();
                finalDate = `${year}-${birthMonth}-${birthDay}`;
              } else if (activeSubCategory === 'BANCO_TARJETAS') {
                finalDate = `${cardExpYear}-${cardExpMonth}-01`;
              }
              const finalTime = activeCategory === CategoryType.APPOINTMENTS ? (() => {
                let h = parseInt(apptHour);
                if (apptAmPm === 'PM' && h < 12) h += 12;
                if (apptAmPm === 'AM' && h === 12) h = 0;
                return `${String(h).padStart(2, '0')}:${apptMin}`;
              })() : undefined;
              const item: ReminderDate = { 
                id: Math.random().toString(36).substring(2), 
                title: fd.get('title') as string, 
                date: finalDate, 
                time: finalTime,
                category: activeCategory || CategoryType.BIRTHDAYS, 
                subCategory: activeSubCategory || 'OTRO', 
                reminderFrequency: 'one-time', 
                notifyDaysBefore: [modalNotifyValue], 
                notes: fd.get('notes') as string, 
                audioData: audioBase64 || undefined, 
                fileData: attachedFileBase64 || undefined, 
                fileName: attachedFileName || undefined, 
                repeatYearly: activeCategory === CategoryType.BIRTHDAYS ? repeatYearly : repeatYearly, 
                noteColor: activeCategory === CategoryType.NOTES ? noteIconColor : undefined 
              }; 
              setState(prev => ({...prev, dates: [...prev.dates, item]})); 
              setIsModalOpen(false); setAudioBase64(null); setAttachedFileBase64(null); setAttachedFileName(null); 
            }} className="space-y-6 pb-12">
              <div className="space-y-2"><label className={`text-[10px] font-black uppercase tracking-widest px-1 ${createModalStyles.text}`}>{t.title}</label><input required name="title" autoFocus className={`w-full p-6 rounded-[2.2rem] font-bold text-[18.5px] outline-none border transition-all ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 focus:border-indigo-400` : `bg-slate-50 border-slate-100 focus:border-indigo-300`} ${activeCategory === CategoryType.NOTES ? createModalStyles.text : 'text-slate-900 dark:text-white'}`} /></div>
              
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${createModalStyles.text}`}>{t.notes}</label>
                <textarea name="notes" className={`w-full p-6 rounded-[2.2rem] font-bold text-[18.5px] resize-none outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 focus:border-slate-500` : `bg-slate-50 border-slate-100 focus:border-slate-300`} ${createModalStyles.text}`} rows={4} />
              </div>

              {activeCategory === CategoryType.NOTES && (
                <div className="p-8 rounded-[2.5rem] bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-500/20">
                  <label className="text-[11px] font-black text-violet-600 dark:text-violet-300 uppercase tracking-widest px-1 block mb-6 text-center">{t.chooseColor}</label>
                  <div className="flex items-center justify-between w-full">
                    {[
                      { type: CategoryType.BIRTHDAYS, color: '#ec4899' }, 
                      { type: CategoryType.DOCUMENTS, color: '#3b82f6' }, 
                      { type: CategoryType.SUBSCRIPTIONS, color: '#f97316' }, 
                      { type: CategoryType.APPOINTMENTS, color: '#10b981' }, 
                      { type: CategoryType.VIOLET, color: '#8b5cf6' },      
                      { type: CategoryType.NOTES, color: '#64748b' }        
                    ].map(item => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setNoteIconColor(item.type)}
                        className={`w-10 h-10 rounded-full shrink-0 border-4 transition-all ${noteIconColor === item.type ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        style={{ backgroundColor: item.color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeCategory !== CategoryType.NOTES && (
                <div className="space-y-2"><label className={`text-[10px] font-black uppercase tracking-widest px-1 ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-500' : createModalStyles.label}`}>{t.date}</label>
                  {activeCategory === CategoryType.BIRTHDAYS ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`}>
                          {Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`}>
                          {Array.from({length: 12}, (_, i) => {
                             const m = String(i + 1).padStart(2, '0');
                             const label = new Date(2000, i, 1).toLocaleString(state.language, { month: 'long' });
                             return <option key={m} value={m}>{label.toUpperCase()}</option>
                          })}
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-[2.2rem] border bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <Repeat className={`w-5 h-5 ${repeatYearly ? 'text-indigo-600' : 'text-slate-400'}`} strokeWidth={1.5} />
                          <span className={`text-xs font-black uppercase ${repeatYearly ? 'text-indigo-600' : 'text-slate-400'}`}>{t.repeatYearly}</span>
                        </div>
                        <button type="button" onClick={() => setRepeatYearly(!repeatYearly)} className={`w-12 h-6 rounded-full relative transition-all ${repeatYearly ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center`}>
                          <div className={`absolute w-4 h-4 rounded-full bg-white shadow-md transition-all ${repeatYearly ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  ) : activeSubCategory === 'BANCO_TARJETAS' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <select value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`}>
                        {Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`}>
                        {Array.from({length: 2101 - new Date().getFullYear()}, (_, i) => String(new Date().getFullYear() + i)).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  ) : (
                    <input required name="date" type="date" defaultValue={selectedCalendarDay ? formatDateForInput(selectedCalendarDay) : formatDateForInput(new Date())} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`} />
                  )}
                </div>
              )}
              
              {activeCategory === CategoryType.APPOINTMENTS && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${createModalStyles.label}`}>{t.time}</label>
                  <div className="grid grid-cols-[1fr_1fr_1fr] gap-3">
                    <select value={apptHour} onChange={(e) => setApptHour(e.target.value)} className={`w-full p-5 rounded-3xl font-black outline-none border text-center ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                      {Array.from({length: 12}, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select value={apptMin} onChange={(e) => setApptMin(e.target.value)} className={`w-full p-5 rounded-3xl font-black outline-none border text-center ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                      {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button type="button" onClick={() => setApptAmPm(prev => prev === 'AM' ? 'PM' : 'AM')} className={`w-full p-5 rounded-3xl font-black outline-none border transition-all ${apptAmPm === 'AM' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' : 'bg-indigo-600 text-white border-indigo-700 shadow-md'}`}>
                      {apptAmPm}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-2 ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-1.5"><p className="text-[10.7px] font-black text-slate-400 uppercase">{t.audioNote}</p>{!state.isPro && <Crown className="w-2.5 h-2.5 text-amber-500" />}</div>
                  {audioBase64 ? (
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><button type="button" onClick={() => setAudioBase64(null)} className="text-rose-500 p-1"><X className="w-4 h-4" /></button></div>
                  ) : (
                    <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 animate-pulse scale-110' : 'bg-indigo-600'} text-white shadow-lg`}>{isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}</button>
                  )}
                  {isRecording && <p className="text-[8px] font-black text-rose-500">{recordingTime}s / 30s</p>}
                </div>
                <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-2 ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-1.5"><p className="text-[10.7px] font-black text-slate-400 uppercase">{t.addFile}</p>{!state.isPro && <Crown className="w-2.5 h-2.5 text-amber-500" />}</div>
                  {attachedFileBase64 ? (
                    <div className="flex items-center gap-2 overflow-hidden"><FileTextIcon className="w-4 h-4 text-emerald-500" /><p className="text-[8px] truncate max-w-[50px] font-bold">{attachedFileName}</p><button type="button" onClick={() => { setAttachedFileBase64(null); setAttachedFileName(null); }} className="text-rose-500 p-1"><X className="w-3 h-3" /></button></div>
                  ) : (
                    <button type="button" onClick={() => attachmentInputRef.current?.click()} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-95 shadow-md"><Upload className="w-5 h-5" /></button>
                  )}
                  <input type="file" ref={attachmentInputRef} onChange={handleAttachmentUpload} className="hidden" />
                </div>
              </div>

              {activeCategory !== CategoryType.NOTES && (
                <div className={`p-6 rounded-[2.2rem] border relative ${activeCategory === CategoryType.BIRTHDAYS ? 'bg-indigo-50 border-indigo-100' : createModalStyles.light} transition-all`}>
                  <label className={`text-[11.2px] font-black uppercase tracking-widest text-center block mb-4 italic ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-500' : createModalStyles.label}`}>{t.howMuchAdvance}</label>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase ${activeCategory === CategoryType.BIRTHDAYS ? 'text-indigo-600' : createModalStyles.text}`}>{t.alertPrefix} {getAdvanceLabel(activeCategory, modalNotifyValue)} {modalNotifyValue !== 0 || activeCategory === CategoryType.APPOINTMENTS ? t.beforeSuffix : ''}</span>
                  </div>
                  <input type="range" min="0" max={activeCategory === CategoryType.APPOINTMENTS ? "55" : (activeCategory === CategoryType.DOCUMENTS ? "90" : "60")} step="1" value={modalNotifyValue} onChange={(e) => setModalNotifyValue(parseInt(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${activeCategory === CategoryType.BIRTHDAYS ? 'accent-indigo-600' : createModalStyles.accent} bg-slate-200 dark:bg-slate-600`} />
                </div>
              )}

              {activeCategory === CategoryType.NOTES && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest px-1 ${createModalStyles.text}`}>{t.date}</label>
                  <input required name="date" type="date" defaultValue={selectedCalendarDay ? formatDateForInput(selectedCalendarDay) : formatDateForInput(new Date())} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 focus:border-slate-500` : `bg-slate-50 border-slate-100 focus:border-slate-300`} ${createModalStyles.text}`} />
                </div>
              )}

              <button type="submit" className={`w-full ${activeCategory === CategoryType.BIRTHDAYS ? 'bg-indigo-600' : createModalStyles.saveBtn} text-white py-[26px] rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl mt-4 active:scale-95 transition-all text-[15px] flex items-center justify-center gap-3`}><Save className="w-6 h-6" strokeWidth={1.5} /> {t.save}</button>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[300] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[88vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-4 mb-2">
                  <div className={selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-600' : detailModalStyles.text}>
                    {selectedEvent.category === CategoryType.NOTES ? ( <StickyNote className="w-12 h-12" strokeWidth={1.5} /> ) : ( React.cloneElement((selectedEvent.category === CategoryType.BIRTHDAYS ? CATEGORY_DETAILS[selectedEvent.category].icon : (SUB_CATEGORY_DETAILS[selectedEvent.subCategory]?.icon || CATEGORY_DETAILS[selectedEvent.category].icon)) as React.ReactElement<any>, { className: "w-12 h-12", strokeWidth: 1.5 }) )}
                  </div>
                  <h2 className={`text-[26.5px] font-black uppercase leading-tight ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-600' : detailModalStyles.text}`}>{selectedEvent.category === CategoryType.BIRTHDAYS ? t.birthdays : selectedEvent.category === CategoryType.NOTES ? t.notes : (selectedEvent.subCategory ? (t as any)[SUB_CATEGORY_DETAILS[selectedEvent.subCategory].labelKey] : (t as any)[selectedEvent.category.toLowerCase()])}</h2>
                </div>
                <h2 className={`text-[26.5px] font-black uppercase leading-tight mb-2 mt-6 ${selectedEvent.category === CategoryType.NOTES ? detailModalStyles.text : 'text-slate-700 dark:text-white'}`}>{selectedEvent.title}</h2>
              </div>
              <button onClick={() => { setIsDetailModalOpen(false); setIsPlaying(false); if (audioPreviewRef.current) { audioPreviewRef.current.pause(); audioPreviewRef.current = null; } }} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full active:scale-75 transition-all"><X className="w-5 h-5 text-slate-700 dark:text-white"/></button>
            </div>
            <div className="space-y-6 pb-12">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-500' : detailModalStyles.label}`}>{t.date}</p>
                <p className={`font-bold text-[23.6px] uppercase ${selectedEvent.category === CategoryType.NOTES ? detailModalStyles.text : 'text-slate-700 dark:text-white'}`}>{new Date(selectedEvent.date).toLocaleDateString(state.language, { day: 'numeric', month: 'long', year: selectedEvent.repeatYearly ? undefined : 'numeric' })} {selectedEvent.time ? `- ${formatTimeTo12h(selectedEvent.time)}` : ''}</p>
              </div>

              {selectedEvent.notes && (
                <div className="p-6 rounded-[2.2rem] bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-3 opacity-60 ${detailModalStyles.text}`}>{t.notes}</p>
                  <p className={`text-[26px] font-medium leading-relaxed whitespace-pre-wrap ${selectedEvent.category === CategoryType.NOTES ? detailModalStyles.text : 'text-slate-700 dark:text-white'}`}>{selectedEvent.notes}</p>
                </div>
              )}

              {selectedEvent.category !== CategoryType.NOTES && (
                <div style={modalBgStyle} className={`p-6 rounded-[2.2rem] border relative shadow-sm`}>
                  <Edit2 className={`absolute top-4 right-4 w-3 h-3 ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-600' : detailModalStyles.text} opacity-60`} strokeWidth={1.5} />
                  <label className={`text-[13.2px] font-black uppercase tracking-widest text-center block mb-4 italic ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-600' : detailModalStyles.text}`}>{t.howMuchAdvance}</label>
                  <div className="flex items-center justify-between mb-3"><div className={`flex items-center gap-2 ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'text-indigo-600' : detailModalStyles.text}`}><span className="text-sm font-black uppercase">{t.alertPrefix} {getAdvanceLabel(selectedEvent.category, detailNotifyValue)} {(selectedEvent.category === CategoryType.APPOINTMENTS || detailNotifyValue !== 0) ? t.beforeSuffix : ''}</span></div></div>
                  <input type="range" min="0" max={selectedEvent.category === CategoryType.APPOINTMENTS ? "55" : (selectedEvent.category === CategoryType.DOCUMENTS ? "90" : "60")} step="1" value={detailNotifyValue} onChange={(e) => setDetailNotifyValue(parseInt(e.target.value))} className={`w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'accent-indigo-600' : detailModalStyles.accent}`} />
                </div>
              )}

              {selectedEvent.audioData && (
                <div className="p-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3"><Volume2 className="text-indigo-600" /><p className="text-[10px] font-black uppercase text-indigo-600 dark:text-white">{t.audioNote}</p></div>
                   <button onClick={() => {
                     if (!audioPreviewRef.current) { audioPreviewRef.current = new Audio(selectedEvent.audioData); audioPreviewRef.current.onended = () => setIsPlaying(false); }
                     if (isPlaying) { audioPreviewRef.current.pause(); setIsPlaying(false); }
                     else { audioPreviewRef.current.play(); setIsPlaying(true); }
                   }} className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center active:scale-90 transition-all">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}</button>
                </div>
              )}
              {selectedEvent.fileData && (
                <div className="p-5 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                   <div className="flex items-center gap-3 overflow-hidden"><FileTextIcon className="text-emerald-600" /><p className="text-[10px] font-black uppercase text-emerald-600 dark:text-white truncate">{selectedEvent.fileName || t.attachedFile}</p></div>
                   <button onClick={() => handleDownloadFile(selectedEvent.fileData!, selectedEvent.fileName || 'file')} className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-all shadow-md"><Download className="w-5 h-5" /></button>
                </div>
              )}
              <button onClick={handleUpdateReminder} className={`w-full py-5 rounded-[2rem] ${selectedEvent.category === CategoryType.BIRTHDAYS ? 'bg-indigo-600' : detailModalStyles.saveBtn} text-white font-black uppercase text-[15.6px] tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3`}><Save className="w-6.5 h-6.5" strokeWidth={1.5} /> {t.save}</button>
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-sm rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 ${state.theme === 'dark' ? 'text-white' : 'text-slate-700'} shadow-2xl`}>
            <div className="w-18 h-18 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Info className="w-10 h-10" strokeWidth={1.5} /></div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter italic">{t.appName}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.version}: 1.0.0 (Production Build)</p>
            <div className="space-y-4">
              <button onClick={() => { setIsInfoModalOpen(false); setOnboardingStep('carousel'); setCarouselIndex(0); }} className="w-full py-5 rounded-[1.8rem] bg-emerald-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3"><Play className="w-4 h-4 fill-white" /> {t.seeTutorial}</button>
              <button onClick={() => setIsInfoModalOpen(false)} className="w-full py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg">{t.thanks}</button>
            </div>
          </div>
        </div>
      )}

      {isNotifTimeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-sm rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 ${state.theme === 'dark' ? 'text-white' : 'text-slate-700'} shadow-2xl`}>
            <div className="flex justify-between items-start mb-6">
              <div className="text-left"><h3 className="text-xl font-black uppercase tracking-tighter italic">{t.generalNotifTime}</h3><p className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-tight">{t.generalNotifTimeDesc}</p></div>
              <button onClick={() => setIsNotifTimeModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="py-6 flex flex-col items-center gap-6">
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 w-full">
                <select value={notifHour} onChange={(e) => setNotifHour(e.target.value)} className={`w-full p-5 rounded-3xl font-black outline-none border text-center ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>{Array.from({length: 12}, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}</select>
                <select value={notifMin} onChange={(e) => setNotifMin(e.target.value)} className={`w-full p-5 rounded-3xl font-black outline-none border text-center ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>{Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}</select>
                <button type="button" onClick={() => setNotifAmPm(prev => prev === 'AM' ? 'PM' : 'AM')} className={`w-full p-5 rounded-3xl font-black outline-none border transition-all ${notifAmPm === 'AM' ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' : 'bg-indigo-600 text-white border-indigo-700 shadow-md'}`}>{notifAmPm}</button>
              </div>
            </div>
            <button onClick={handleSaveNotifTime} className="w-full py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg mt-4 flex items-center justify-center gap-3"><Save className="w-4 h-4" strokeWidth={1.5} /> {t.save}</button>
          </div>
        </div>
      )}

      {isLangModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 ${state.theme === 'dark' ? 'text-white' : 'text-slate-700'} shadow-2xl`}>
            <div className="w-18 h-18 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Globe className="w-10 h-10" strokeWidth={1.5} /></div>
            <h3 className="text-xl font-black mb-8 uppercase tracking-tighter italic">{t.selectLanguage}</h3>
            <div className="space-y-4">
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <button key={code} onClick={() => { setState(p => ({ ...p, language: code as LanguageCode })); setIsLangModalOpen(false); }} className={`w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all ${state.language === code ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{name}</button>
              ))}
            </div>
            <button onClick={() => setIsLangModalOpen(false)} className="mt-6 font-black text-[10px] uppercase text-slate-400">{t.no}</button>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[650] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[95vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-8">
              <div><h2 className="text-2xl font-black uppercase tracking-widest leading-tight">{t.myAccount}</h2><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 italic">{t.manageData}</p></div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full transition-transform active:scale-75 shadow-sm"><X className="w-5 h-5 text-slate-900 dark:text-white"/></button>
            </div>
            <div className={`p-6 rounded-[2.5rem] mb-6 border flex flex-col items-center gap-4 transition-all ${isGoogleLoggedIn ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              {!isGoogleLoggedIn ? (
                <><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">{t.secureDates}</p><button onClick={() => { if(!state.isPro) setIsPaywallOpen(true); else handleGoogleLogin(); }} className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-[1.8rem] font-bold text-sm flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all">{!state.isPro && <Crown className="w-4 h-4 text-amber-500" strokeWidth={1.5} />}<img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />{t.googleLogin}</button></>
              ) : (
                <div className="flex items-center gap-4 w-full"><div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">{state.user.name.substring(0,2).toUpperCase()}</div><div className="flex-1"><p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{t.syncActive}</p><p className="text-xs font-bold truncate">{state.user.name}</p></div><CheckCircle2 className="w-6 h-6 text-emerald-500" strokeWidth={1.5} /></div>
              )}
            </div>
            <div className={`p-6 rounded-[2.5rem] mb-6 border ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 shadow-sm'} space-y-4`}>
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Camera className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase">{t.profilePhoto}</span></div><button onClick={() => setState(p => ({...p, user: {...p.user, showProfileImage: !p.user.showProfileImage}}))} className={`w-12 h-6 rounded-full relative transition-all ${state.user.showProfileImage ? 'bg-indigo-600' : 'bg-slate-300'} flex items-center`}><div className={`absolute w-4 h-4 rounded-full bg-white shadow-md transition-all ${state.user.showProfileImage ? 'right-1' : 'left-1'}`} /></button></div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200">{state.user.profileImage ? <img src={state.user.profileImage} alt="Preview" className="w-full h-full object-cover" /> : <UserIcon className="text-slate-400 w-6 h-6" />}</div><button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"><Upload className="w-3 h-3" /> {t.uploadPhoto}</button><input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" /></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{t.photoResolutionNote}</p>
              </div>
            </div>
            <div className={`p-6 rounded-[2.5rem] mb-6 border ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100 shadow-sm'} space-y-4`}>
               <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Award className="text-amber-500 w-5 h-5" strokeWidth={1.5} /><span className="text-[11px] font-black uppercase">{t.currentPlan}</span></div><span className={`text-[10px] font-black px-3 py-1 rounded-full ${state.isPro ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>{state.isPro ? t.goldPlan : t.freePlan}</span></div>
               {state.isPro && (<div className="pt-2 border-t border-slate-200 dark:border-slate-600 space-y-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.purchaseDate}</p><p className="text-xs font-bold">{state.user.purchaseDate || 'N/A'}</p></div>)}
               {!state.isPro && (<button onClick={() => { setIsProfileModalOpen(false); setIsPaywallOpen(true); }} className="w-full bg-amber-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"><Zap className="w-3 h-3 fill-white" /> {t.upgradeToGold}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setState(prev => ({ ...prev, user: { ...prev.user, name: fd.get('name') as string, email: fd.get('email') as string, dateOfBirth: fd.get('dob') as string } })); setIsProfileModalOpen(false); }} className="space-y-6 pb-12">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.title}</label><input required name="name" defaultValue={state.user.name} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border transition-all ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white focus:border-indigo-500` : `bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-300`}`} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label><input required name="email" defaultValue={state.user.email} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border transition-all ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white focus:border-indigo-500` : `bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-300`}`} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t.birthdays}</label><input required name="dob" type="date" defaultValue={state.user.dateOfBirth} className={`w-full p-6 rounded-[2.2rem] font-bold outline-none border transition-all ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white focus:border-indigo-500` : `bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-300`}`} /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl mt-6 active:scale-95 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" strokeWidth={1.5} /> {t.saveChanges}</button>
            </form>
          </div>
        </div>
      )}

      {isEmailAlertConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Mail className="w-8 h-8" /></div>
            <h3 className="text-sm font-black mb-4 uppercase tracking-tighter">{t.emailConfirmTitle}</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-8 leading-relaxed">{t.emailConfirmText}</p>
            <div className="grid grid-cols-2 gap-4"><button onClick={() => setIsEmailAlertConfirmOpen(false)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={() => { setState(p => ({...p, globalSettings: {...p.globalSettings, reminderMethod: 'mail'}})); setIsEmailAlertConfirmOpen(false); }} className="py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></div>
          </div>
        </div>
      )}

      {isAutoDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Trash2 className="w-8 h-8" /></div>
            <h3 className="text-sm font-black mb-10 uppercase tracking-tighter">{t.autoDeleteConfirm}</h3>
            <div className="grid grid-cols-2 gap-4"><button onClick={() => setIsAutoDeleteConfirmOpen(false)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={confirmAutoDeleteEnable} className="py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></div>
          </div>
        </div>
      )}

      {isContactConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><UsersIcon className="w-8 h-8" /></div>
            <h3 className="text-sm font-black mb-10 uppercase tracking-tighter leading-relaxed">{t.importContactsConfirm}</h3>
            <div className="grid grid-cols-2 gap-4">{isImporting ? <div className="col-span-2 py-5 flex items-center justify-center gap-3"><Loader2 className="animate-spin text-indigo-600" /> <p className="text-[10px] font-black uppercase">{t.syncing}</p></div> : <><button onClick={() => setIsContactConfirmOpen(false)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={handleImportContacts} className="py-5 rounded-[1.8rem] bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></>}</div>
          </div>
        </div>
      )}

      {isDirectModeConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Zap className="w-8 h-8" /></div>
            <h3 className="text-sm font-black mb-10 uppercase tracking-tighter leading-relaxed">{state.language === 'es' ? '¿ACTIVAR MODO DIRECTO PARA AÑADIR RECORDATORIOS RÁPIDAMENTE?' : 'ENABLE DIRECT MODE TO ADD REMINDERS QUICKLY?'}</h3>
            <div className="grid grid-cols-2 gap-4"><button onClick={() => setIsDirectModeConfirmOpen(false)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={() => { setIsDirectAddMode(true); setIsDirectModeConfirmOpen(false); }} className="py-5 rounded-[1.8rem] bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></div>
          </div>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[750] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-6">
              <div><h2 className="text-2xl font-black uppercase tracking-widest leading-tight">{t.askFriends}</h2><p className="text-[11px] font-bold uppercase tracking-tight mt-3 leading-relaxed">{t.askFriendsSub}</p></div>
              <button onClick={() => setIsShareModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full active:scale-75 transition-all"><X className="w-5 h-5 text-slate-900 dark:text-white"/></button>
            </div>
            <div className="space-y-6 pb-12">
              <div className={`p-6 rounded-[2.2rem] border transition-all ${state.theme === 'dark' ? 'bg-violet-900/20 border-violet-500/30' : 'bg-violet-50 border-violet-100 shadow-sm'}`}>
                 <label className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-2 block">{t.yourBirthday}</label>
                 <div className="flex items-center gap-4">
                   <input type="date" value={state.user.dateOfBirth} onChange={(e) => setState(p => ({...p, user: {...p.user, dateOfBirth: e.target.value}}))} className={`flex-1 p-4 rounded-2xl font-bold bg-white dark:bg-slate-800 border dark:border-slate-700 outline-none focus:border-violet-400 text-black`} />
                   <div className="p-4 rounded-2xl bg-violet-600 text-white shadow-md"><CheckCircle2 className="w-5 h-5" /></div>
                 </div>
              </div>
              <div className={`p-6 rounded-[2rem] border transition-all ${state.theme === 'dark' ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                <p className={`text-[16.8px] font-medium leading-relaxed mb-4 italic whitespace-pre-line break-words ${state.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>"{SHARE_MESSAGE_CUMPLEAÑOS(state.language, state.user.dateOfBirth || '')}"</p>
                <button onClick={() => { navigator.clipboard.writeText(SHARE_MESSAGE_CUMPLEAÑOS(state.language, state.user.dateOfBirth || '')); alert(t.copiedToClipboard); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"><Copy className="w-4 h-4" strokeWidth={1.5} /> {t.copyText}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPaywallOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[1200] flex items-center justify-center p-6">
          <div style={modalBgStyle} className={`w-full max-md rounded-[3.5rem] p-9 relative animate-in zoom-in duration-300 overflow-y-auto max-h-[95vh]`}><button onClick={() => setIsPaywallOpen(false)} className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-slate-200 rounded-full shadow-sm active:scale-75 transition-all"><X className="w-4 h-4 text-slate-900 dark:text-white" /></button><div className="text-center mb-8"><div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20 rotate-3"><Crown className="text-white w-10 h-10" strokeWidth={1.5} /></div><h2 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">{t.appName} <span className="text-amber-500">GOLD</span></h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lifetimeSub}</p></div><div className="space-y-4 mb-8">{t.goldFeatures.map((v: string, i: number) => (<div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-2xl"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" strokeWidth={1.5} /><span className="text-xs font-bold uppercase tracking-tight">{v}</span></div>))}</div><button onClick={activatePremium} className="w-full bg-violet-950 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-xs">{t.activateFor}</button></div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1250] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}><div className="w-18 h-18 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 className="w-10 h-10" strokeWidth={1.5} /></div><h3 className="text-xl font-black mb-10 italic uppercase tracking-tighter">{t.deleteConfirm}</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => setIsDeleteConfirmOpen(null)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={() => { setState(p => ({...p, dates: p.dates.filter(d => d.id !== isDeleteConfirmOpen)})); setIsDeleteConfirmOpen(null); }} className="py-5 rounded-[1.8rem] bg-rose-500 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></div></div>
        </div>
      )}

      {isDeleteExpenseConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1250] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}><div className="w-18 h-18 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Trash2 className="w-10 h-10" strokeWidth={1.5} /></div><h3 className="text-xl font-black mb-10 italic uppercase tracking-tighter">{t.deleteConfirm}</h3><div className="grid grid-cols-2 gap-4"><button onClick={() => setIsDeleteExpenseConfirmOpen(null)} className="py-5 rounded-[1.8rem] bg-slate-100 dark:bg-slate-700 font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm">{t.no}</button><button onClick={() => { setState(p => ({...p, expenses: p.expenses.filter(e => e.id !== isDeleteExpenseConfirmOpen)})); setIsDeleteExpenseConfirmOpen(null); }} className="py-5 rounded-[1.8rem] bg-rose-500 text-white font-black text-[11px] uppercase tracking-widest shadow-xl">{t.yes}</button></div></div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[550] flex items-end justify-center">
          <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
            <div className="flex justify-between items-start mb-8"><h2 className="text-2xl font-black uppercase tracking-widest leading-tight">{t.dailyExpenses}</h2><button onClick={() => setIsModalOpenExpense(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full active:scale-75 transition-all"><X className="w-5 h-5 text-slate-900 dark:text-white"/></button></div>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const amountVal = parseFloat(fd.get('amount') as string); if (isNaN(amountVal)) return; const exp: Expense = { id: Math.random().toString(36).substring(2), amount: amountVal, category: fd.get('category') as ExpenseCategory, date: fd.get('date') as string, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: fd.get('note') as string, fileData: expensePhotoBase64 || undefined }; setState(p => ({...p, expenses: [...p.expenses, exp]})); setIsModalOpenExpense(false); setExpensePhotoBase64(null); }} className="space-y-6 pb-12">
              <div className="grid grid-cols-[1.6fr_1fr] gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.amount}</label><input required name="amount" type="number" step="0.01" className={`w-full p-8 rounded-[2.5rem] font-bold text-[22px] outline-none border transition-all ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 focus:border-violet-500 text-white' : 'bg-slate-50 border-slate-100 focus:border-violet-300 text-slate-900'}`} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.currencyLabel}</label><input required defaultValue={state.user.currency} onChange={(e) => setState(p => ({...p, user: {...p.user, currency: e.target.value}}))} className={`w-full p-8 rounded-[2.5rem] font-bold text-[22px] outline-none border text-center ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 focus:border-violet-500 text-white' : 'bg-slate-50 border-slate-100 focus:border-violet-300 text-slate-900'}`} /></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category}</label><select name="category" className={`w-full p-6 rounded-[2.2rem] font-black text-[120%] outline-none border appearance-none ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>{Object.keys(t.expenseCategories).map(catKey => <option key={catKey} value={catKey}>{t.expenseCategories[catKey].toUpperCase()}</option>)}</select></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}</label><input required name="date" type="date" defaultValue={formatDateForInput(new Date())} className={`w-full p-6 rounded-[2.2rem] font-black text-[120%] outline-none border ${state.theme === 'dark' ? `bg-slate-700 border-slate-600 text-white` : `bg-slate-50 border-slate-100 text-slate-900`}`} /></div>
              <div className={`p-4 rounded-3xl border flex flex-col items-center justify-center gap-2 ${state.theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10.4px] font-black text-slate-400 uppercase">{state.language === 'es' ? 'FOTO DEL GASTO' : 'EXPENSE PHOTO'}</p>
                  {!state.isPro && <Crown className="w-2.5 h-2.5 text-amber-500" strokeWidth={1.5} />}
                </div>
                {expensePhotoBase64 ? (
                  <div className="flex items-center gap-2"><img src={expensePhotoBase64} className="w-10 h-10 object-cover rounded-lg border border-indigo-200" /><button type="button" onClick={() => setExpensePhotoBase64(null)} className="text-rose-500 p-1"><X className="w-4 h-4" /></button></div>
                ) : (
                  <button type="button" onClick={() => { if(!state.isPro) setIsPaywallOpen(true); else expenseFileInputRef.current?.click(); }} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-95 shadow-md"><Camera className="w-5 h-5" /></button>
                )}
                <input type="file" ref={expenseFileInputRef} onChange={handleExpensePhotoUpload} accept="image/*" capture="environment" className="hidden" />
              </div>
              <div className="space-y-4 pt-4">
                <button type="submit" className="w-full bg-violet-950 text-white py-[30px] rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl mt-4 active:scale-95 transition-all text-[15px] flex items-center justify-center gap-3"><Save className="w-6 h-6" strokeWidth={1.5} /> {t.save}</button>
                <button type="button" onClick={() => { if(!state.isPro) setIsPaywallOpen(true); else { setIsModalOpenExpense(false); setIsViewExpensesModalOpen(true); } }} className="w-full bg-violet-950 text-white py-[20px] rounded-[2.5rem] font-black uppercase tracking-[0.1em] shadow-xl active:scale-95 transition-all text-[12px] flex items-center justify-center gap-3">{!state.isPro && <Crown className="w-3 h-3 text-amber-500" />} {t.viewMyExpenses}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewExpensesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[560] flex items-end justify-center">
           <div style={modalBgStyle} className={`w-full max-w-xl rounded-t-[3.5rem] p-9 animate-in slide-in-from-bottom h-[90vh] overflow-y-auto ${state.theme === 'dark' ? 'text-white' : 'text-slate-700 shadow-2xl'}`}>
             <div className="flex justify-between items-start mb-8"><h2 className="text-2xl font-black uppercase tracking-widest leading-tight">{t.expensesOf} {getMonthlyExpenses.monthName}</h2><button onClick={() => setIsViewExpensesModalOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full active:scale-75 transition-all"><X className="w-5 h-5 text-slate-900 dark:text-white"/></button></div>
             <div className="bg-indigo-600 rounded-[2.5rem] p-8 mb-8 text-white shadow-xl flex flex-col items-center gap-2"><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t.totalMonthly}</p><h2 className="text-[44.5px] font-black leading-none">{getMonthlyExpenses.total.toFixed(2)} {state.user.currency}</h2></div>
             <div className="space-y-4 pb-12">
               {(Object.entries(getMonthlyExpenses.grouped) as [string, { total: number, items: Expense[] }][]).map(([catKey, data]) => {
                 const isExpanded = expandedExpenseCat === catKey;
                 return (
                   <div key={catKey} className={`rounded-[2.2rem] border transition-all overflow-hidden ${state.theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                     <button onClick={() => setExpandedExpenseCat(isExpanded ? null : catKey)} className="w-full p-6 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors">
                       <div className="flex items-center gap-3"><PieChart className="text-indigo-600 w-5 h-5" strokeWidth={1.5} /><span className="font-black text-sm uppercase">{t.expenseCategories[catKey].toUpperCase()}</span></div>
                       <div className="flex items-center gap-3"><span className="font-black text-indigo-600">{data.total.toFixed(2)} {state.user.currency}</span>{isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-white" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-white" />}</div>
                     </button>
                     {isExpanded && (
                       <div className="px-6 pb-6 pt-2 space-y-3 animate-in slide-in-from-top duration-300">
                         {data.items.map(item => (
                           <div key={item.id} className="flex items-center justify-between py-3 border-t border-slate-50 dark:border-slate-700">
                             <div><p className="text-[10px] font-black uppercase text-slate-400">{new Date(item.date).toLocaleDateString(state.language, { day: '2-digit', month: '2-digit' })} • {item.time}</p><p className="text-sm font-bold">{item.amount.toFixed(2)} {state.user.currency}</p></div>
                             <div className="flex items-center gap-2">{item.fileData && (<button onClick={() => handleDownloadFile(item.fileData!, 'expense_photo')} className="p-2 text-indigo-600 active:scale-75 transition-all"><ImageIcon className="w-4 h-4" strokeWidth={1.5} /></button>)}<button onClick={() => setIsDeleteExpenseConfirmOpen(item.id)} className="p-2 text-rose-500 active:scale-75 transition-all"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button></div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
             <button onClick={() => setIsExportModalOpen(true)} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all mb-20"><Download className="w-4 h-4" /> {t.exportExpenses}</button>
           </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1300] flex items-center justify-center p-8">
          <div style={modalBgStyle} className={`w-full max-w-xs rounded-[3.5rem] p-9 text-center animate-in zoom-in duration-300 shadow-2xl`}>
             <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Download className="w-8 h-8" /></div>
             <h3 className="text-sm font-black mb-8 uppercase tracking-tighter">{t.selectFormat}</h3>
             <div className="space-y-3">
               <button onClick={() => handleExport('csv')} className="w-full py-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 font-bold text-xs flex items-center justify-center gap-3"><FileSpreadsheet className="w-4 h-4 text-emerald-500" /> {t.excelFormat}</button>
               <button onClick={() => handleExport('txt')} className="w-full py-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 font-bold text-xs flex items-center justify-center gap-3"><FileTextIcon className="w-4 h-4 text-rose-500" /> {t.pdfFormat}</button>
               <button onClick={() => handleExport('txt')} className="w-full py-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 font-bold text-xs flex items-center justify-center gap-3"><FileCode className="w-4 h-4 text-slate-500" /> {t.textFormat}</button>
             </div>
             <button onClick={() => setIsExportModalOpen(false)} className="mt-8 font-black text-[10px] uppercase text-slate-400">{t.no}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
