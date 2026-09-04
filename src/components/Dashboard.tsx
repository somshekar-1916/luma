import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Home,
  BookOpen,
  Sparkles,
  Target,
  Sprout,
  Settings,
  LogOut,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Mic,
  MicOff,
  FileText,
  Upload,
  ArrowRight,
  Code2,
  Calendar,
  MoreVertical,
  Check,
  CheckCircle2,
  Loader2,
  X,
  Send,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { getUserProfile, PersonaType } from '../services/userService';
import {
  JournalEntry,
  DEFAULT_JOURNAL_ITEMS,
  subscribeToJournals,
  createJournalEntry,
  deleteJournalEntry,
  logUserMood,
  subscribeToLatestMood,
  fetchAggregatedInsights,
  DashboardInsights
} from '../services/dashboardService';

// Visual Assets
import studentDeskSceneImg from '../assets/images/luma_student_desk_scene_1788531139567.jpg';
import silkBgImg from '../assets/images/luma_silk_background_1788530324776.jpg';
import studentAvatarImg from '../assets/images/student_developer_avatar_1788530257638.jpg';

interface DashboardProps {
  onLogout?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface MoodItem {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  score: number;
}

const MOODS_LIST: MoodItem[] = [
  { id: 'Amazing', name: 'Amazing', emoji: '😍', bgColor: 'bg-amber-50 text-amber-500', score: 95 },
  { id: 'Good', name: 'Good', emoji: '🙂', bgColor: 'bg-yellow-50 text-yellow-500', score: 85 },
  { id: 'Calm', name: 'Calm', emoji: '😌', bgColor: 'bg-orange-50 text-orange-500', score: 80 },
  { id: 'Stressed', name: 'Stressed', emoji: '😰', bgColor: 'bg-amber-50 text-amber-600', score: 50 },
  { id: 'Sad', name: 'Sad', emoji: '😢', bgColor: 'bg-blue-50 text-blue-500', score: 40 },
  { id: 'Angry', name: 'Angry', emoji: '😡', bgColor: 'bg-red-50 text-red-500', score: 30 }
];

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Profile & Realtime Data State
  const [persona, setPersona] = useState<PersonaType>('STUDENT_DEV');
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string>('Alex Sharma');

  // Mood State
  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [isLoggingMood, setIsLoggingMood] = useState<boolean>(false);

  // Journals State
  const [journals, setJournals] = useState<JournalEntry[]>(DEFAULT_JOURNAL_ITEMS);
  const [activeEntryMenu, setActiveEntryMenu] = useState<string | null>(null);

  // Insights State
  const [insights, setInsights] = useState<DashboardInsights>({
    productivityScore: 78,
    scoreDelta: 12,
    distribution: [
      { label: 'Focused', percentage: 42, color: '#EA580C' },
      { label: 'Learning', percentage: 28, color: '#3B82F6' },
      { label: 'Planning', percentage: 18, color: '#F43F5E' },
      { label: 'Other', percentage: 12, color: '#9CA3AF' }
    ]
  });

  // Modal / Interaction States
  const [showNewJournalModal, setShowNewJournalModal] = useState<boolean>(false);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [journalMood, setJournalMood] = useState<string>('Calm');
  const [savingJournal, setSavingJournal] = useState<boolean>(false);

  // AI Companion State
  const [aiCompanionPrompt, setAiCompanionPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponseModal, setAiResponseModal] = useState<{ title: string; content: string } | null>(null);

  // Speech Recognition (Voice Entry)
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Notification Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Sync User Profile from Firestore / Auth
  useEffect(() => {
    if (!user) return;

    // Set display name from Firebase auth or email fallback
    if (user.displayName) {
      setDisplayName(user.displayName);
    } else if (user.email) {
      const namePart = user.email.split('@')[0];
      setDisplayName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
    }

    let isMounted = true;
    getUserProfile(user.uid)
      .then((profileData) => {
        if (isMounted && profileData?.profile) {
          if (profileData.profile.persona) {
            setPersona(profileData.profile.persona);
          }
          if (Array.isArray(profileData.profile.goals)) {
            setUserGoals(profileData.profile.goals);
          }
        }
      })
      .catch((err) => console.warn('Profile fetch notice:', err));

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Real-time Subscriptions for Journals & Moods
  useEffect(() => {
    if (!user?.uid) return;

    const unsubJournals = subscribeToJournals(user.uid, (entries) => {
      setJournals(entries);
    });

    const unsubMood = subscribeToLatestMood(user.uid, (latestMood) => {
      if (latestMood) setSelectedMood(latestMood);
    });

    fetchAggregatedInsights(user.uid).then(setInsights);

    return () => {
      unsubJournals();
      unsubMood();
    };
  }, [user?.uid]);

  // Handle Mood Selection
  const handleMoodSelect = async (moodName: string, score: number) => {
    setSelectedMood(moodName);
    setIsLoggingMood(true);
    showToast(`Logged mood as ${moodName}`);
    if (user?.uid) {
      try {
        await logUserMood(user.uid, moodName, score);
        const updated = await fetchAggregatedInsights(user.uid);
        setInsights(updated);
      } catch (err) {
        console.warn('Mood save notice:', err);
      } finally {
        setIsLoggingMood(false);
      }
    } else {
      setIsLoggingMood(false);
    }
  };

  // Handle New Journal Submission
  const handleSaveJournal = async () => {
    if (!journalTitle.trim() || !journalContent.trim()) {
      showToast('Please enter both a title and reflection content.');
      return;
    }

    setSavingJournal(true);
    try {
      if (user?.uid) {
        await createJournalEntry(user.uid, {
          title: journalTitle,
          content: journalContent,
          mood: journalMood,
          tag: journalMood
        });
      } else {
        // Local fallback
        const newLocal: JournalEntry = {
          id: Date.now().toString(),
          title: journalTitle,
          content: journalContent,
          preview: journalContent.slice(0, 55) + '...',
          mood: journalMood,
          tag: journalMood,
          formattedDate: 'Today, Just now'
        };
        setJournals((prev) => [newLocal, ...prev]);
      }

      showToast('Journal entry saved successfully!');
      setShowNewJournalModal(false);
      setJournalTitle('');
      setJournalContent('');
      setJournalMood('Calm');
    } catch (err) {
      console.error('Error saving journal:', err);
      showToast('Failed to save journal entry.');
    } finally {
      setSavingJournal(false);
    }
  };

  // Handle Voice Entry via Web Speech API
  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      showToast('Voice recording stopped.');
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          showToast('Listening... Speak your thoughts clearly.');
          setShowNewJournalModal(true);
          if (!journalTitle) setJournalTitle('Voice Reflection');
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setJournalContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition activation notice:', err);
        setIsListening(false);
      }
    }
  };

  // Handle File Upload for thoughts / notes
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const titleFromName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setJournalTitle(titleFromName.charAt(0).toUpperCase() + titleFromName.slice(1));
        setJournalContent(content);
        setShowNewJournalModal(true);
        showToast(`Imported ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Trigger Gemini AI Assistance
  const handleAskLumaAI = async (customPrompt?: string) => {
    const promptToSend = customPrompt || aiCompanionPrompt;
    if (!promptToSend.trim()) return;

    setAiLoading(true);
    setAiCompanionPrompt('');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: `User persona: ${persona}. Goals: ${userGoals.join(', ')}. Act as LUMA AI, a warm, supportive, and precise mindfulness and productivity companion.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponseModal({
          title: promptToSend,
          content: data.result || 'Here is your thoughtful response from LUMA AI.'
        });
      } else {
        setAiResponseModal({
          title: promptToSend,
          content: `LUMA Reflection on "${promptToSend}":\n\nTake a deep breath. Focus on one intentional task at a time, celebrate micro-wins, and trust the process of daily compounding progress.`
        });
      }
    } catch (err) {
      console.warn('AI generate error fallback:', err);
      setAiResponseModal({
        title: promptToSend,
        content: `LUMA Reflection on "${promptToSend}":\n\nTake a deep breath. Focus on one intentional task at a time, celebrate micro-wins, and trust the process of daily compounding progress.`
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Persona-adaptive prompt chips matching the exact requirements
  const getPersonaChips = () => {
    if (persona === 'STUDENT_DEV') {
      return [
        {
          id: 'code-commits',
          label: "Summarize today's code commits",
          icon: <Code2 className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: "Summarize today's software code commits and technical achievements into a clear developer standup."
        },
        {
          id: 'project-standup',
          label: 'Draft project standup note',
          icon: <FileText className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Draft an agile daily standup note: what was completed, what is in progress, and potential blockers.'
        },
        {
          id: 'bug-resolution',
          label: 'Log bug resolution',
          icon: <Target className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Help me document a bug resolution reflection: the root cause, fix applied, and lessons learned.'
        }
      ];
    } else if (persona === 'BUSY_PRO') {
      return [
        {
          id: 'work-wins',
          label: 'Compile daily work wins',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Help me compile today’s executive work wins and strategic impact.'
        },
        {
          id: 'weekly-review',
          label: 'Draft weekly review',
          icon: <FileText className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Draft a structured weekly review highlighting milestones and upcoming focus areas.'
        },
        {
          id: 'work-life',
          label: 'Track work-life balance',
          icon: <Sprout className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Guide a quick 3-minute evening boundary check to transition smoothly from work to rest.'
        }
      ];
    } else {
      return [
        {
          id: 'affirmation',
          label: 'Suggest daily affirmation',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Suggest a grounded, authentic daily affirmation based on intentional self-growth.'
        },
        {
          id: 'stress-reflection',
          label: 'Reflect on current stress',
          icon: <Sprout className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Guide a mindful reflection on acknowledging and gently releasing current stressors.'
        },
        {
          id: 'mindfulness-prompt',
          label: 'Guided mindfulness prompt',
          icon: <Target className="w-3.5 h-3.5 text-[#EA580C]" />,
          prompt: 'Provide a thoughtful 5-minute journaling prompt to cultivate inner clarity.'
        }
      ];
    }
  };

  const getPersonaSubtitle = () => {
    if (persona === 'STUDENT_DEV') return 'Your personal coding productivity partner';
    if (persona === 'BUSY_PRO') return 'Your personal executive productivity partner';
    return 'Your personal mindfulness & growth partner';
  };

  // Filter journals based on search query
  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF7F2] text-neutral-900 flex flex-row overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900 relative">
      
      {/* Hidden File Input for Upload button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.md,.json"
        className="hidden"
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-1/2 translate-x-1/2 z-50 bg-neutral-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-neutral-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FD6B31]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR                                           */}
      {/* ========================================================= */}
      <aside className="w-56 xl:w-60 h-full bg-[#FAF7F2] border-r border-neutral-200/70 flex flex-col justify-between shrink-0 p-4 relative z-20 select-none">
        
        {/* Top: Hamburger + Official LUMA Logo */}
        <div>
          <div className="flex items-center gap-3 mb-6 px-1">
            <button
              type="button"
              className="text-neutral-700 hover:text-neutral-900 p-1 rounded-md hover:bg-neutral-200/50 cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/luma-emblem.png"
                alt="LUMA"
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/luma-logo.png';
                }}
              />
              <span className="font-serif-luma font-bold text-xl tracking-[0.16em] text-[#1A1C1C]">
                LUMA
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              id="sidebar-nav-dashboard"
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'dashboard'
                  ? 'bg-[#FFF2E8] text-[#EA580C] shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <Home className={`w-4 h-4 ${activeNav === 'dashboard' ? 'text-[#EA580C]' : 'text-neutral-500'}`} />
              <span>Dashboard</span>
            </button>

            <button
              id="sidebar-nav-journals"
              onClick={() => {
                setActiveNav('journals');
                setShowNewJournalModal(true);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'journals'
                  ? 'bg-[#FFF2E8] text-[#EA580C]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-neutral-500" />
              <span>My Journals</span>
            </button>

            <button
              id="sidebar-nav-insights"
              onClick={() => {
                setActiveNav('insights');
                handleAskLumaAI("Show my weekly productivity insights and positive habit suggestions.");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'insights'
                  ? 'bg-[#FFF2E8] text-[#EA580C]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-neutral-500" />
              <span>AI Insights</span>
            </button>

            <button
              id="sidebar-nav-goals"
              onClick={() => {
                setActiveNav('goals');
                showToast("Viewing active goals: " + (userGoals.length ? userGoals.join(', ') : 'Track Coding Progress'));
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'goals'
                  ? 'bg-[#FFF2E8] text-[#EA580C]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <Target className="w-4 h-4 text-neutral-500" />
              <span>Goals</span>
            </button>

            <button
              id="sidebar-nav-mindfulness"
              onClick={() => {
                setActiveNav('mindfulness');
                handleAskLumaAI("Guide a 2-minute breathing and mindfulness break.");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'mindfulness'
                  ? 'bg-[#FFF2E8] text-[#EA580C]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <Sprout className="w-4 h-4 text-neutral-500" />
              <span>Mindfulness</span>
            </button>

            <button
              id="sidebar-nav-settings"
              onClick={() => {
                setActiveNav('settings');
                showToast("Settings: Preferences synced with Cloud Firestore.");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'settings'
                  ? 'bg-[#FFF2E8] text-[#EA580C]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
              }`}
            >
              <Settings className="w-4 h-4 text-neutral-500" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Middle Upgrade Pro Card */}
        <div className="my-2 bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
            <span>LUMA Pro</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FD6B31]" />
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight mt-1 mb-2.5">
            Unlock advanced AI insights and more.
          </p>
          <button
            id="sidebar-upgrade-pro-btn"
            type="button"
            onClick={() => showToast("LUMA Pro is currently active for your workspace!")}
            className="w-full py-1.5 px-3 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-[11px] transition-colors cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>

        {/* Bottom Actions Row: Logout & Theme Toggle */}
        <div className="pt-2 border-t border-neutral-200/70 flex items-center justify-between px-1">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDarkMode(!darkMode);
              showToast(darkMode ? "Switched to Light Sanctuary" : "Switched to Twilight Calm");
            }}
            className="p-1 text-neutral-500 hover:text-neutral-800 rounded-md hover:bg-neutral-200/50 cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bottom 3D Desk Character Illustration with Cursive Script */}
        <div className="relative mt-2 pt-2 flex flex-col items-center">
          <div className="relative w-full rounded-xl overflow-hidden bg-white/40 border border-neutral-200/60 shadow-2xs">
            <img
              src={studentDeskSceneImg}
              alt="Student Desk"
              className="w-full h-auto object-cover select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="font-script-luma text-xs text-[#C25E2E] font-semibold text-center mt-1 leading-tight select-none">
            Build Learn Grow<br />Every Day ♡
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Header Bar: Search Bar, Notifications, Sparkle Badge, User Menu */}
        <header className="h-14 bg-[#FAF7F2] border-b border-neutral-200/70 px-6 flex items-center justify-between shrink-0 select-none z-10">
          
          {/* Search Input with Ctrl K shortcut badge */}
          <div className="relative w-72 sm:w-84 xl:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="dashboard-search-input"
              type="text"
              placeholder="Search your thoughts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200/90 rounded-full pl-9 pr-14 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-all shadow-2xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 font-mono bg-neutral-50">
              Ctrl K
            </span>
          </div>

          {/* Right Header Icons & Profile */}
          <div className="flex items-center gap-3">
            {/* Bell Notification */}
            <button
              type="button"
              onClick={() => showToast("All notifications caught up!")}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-200/40 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
            </button>

            {/* Sparkle badge in peach circle */}
            <button
              type="button"
              onClick={() => handleAskLumaAI("What is my mindful focus for today?")}
              className="w-7 h-7 rounded-full bg-[#FFF2E8] border border-orange-200 flex items-center justify-center text-[#EA580C] hover:bg-orange-100 transition-colors cursor-pointer shadow-2xs"
              title="Daily Sparkle"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-full hover:bg-neutral-200/40 transition-colors cursor-pointer select-none"
              >
                <img
                  src={studentAvatarImg}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-orange-200"
                />
                <span className="text-xs font-bold text-neutral-800">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl border border-neutral-200 shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-neutral-100 text-neutral-500">
                    Signed in as <br />
                    <strong className="text-neutral-800">{user?.email || displayName}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      showToast(`Persona: ${persona}`);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 text-neutral-700 cursor-pointer"
                  >
                    Profile Preferences
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout?.();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </header>

        {/* Dashboard Main Grid Area: Left Column & Right Column */}
        <main className="flex-1 p-4 xl:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 min-h-0">
          
          {/* ======================================================= */}
          {/* LEFT 7-COL: Hero Banner, Mood Picker, Recent Journals   */}
          {/* ======================================================= */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* 1. Dynamic Hero Banner with Silk Texture and Luxury Pen */}
            <div className="relative rounded-3xl overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-[#FFF5EE] via-[#FFEFE4] to-[#FCE7D7] border border-[#F5DAC6] shadow-[0_4px_20px_rgba(234,88,12,0.04)] flex flex-col justify-between shrink-0">
              
              {/* Background Silk Texture Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply">
                <img
                  src={silkBgImg}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Top Row: Greeting & Cursive Callout */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h1 className="font-serif-luma text-2xl sm:text-3xl font-normal text-[#1A1C1C] tracking-tight leading-tight flex items-center gap-2">
                    <span>Good morning, {displayName}</span>
                    <span className="text-2xl">👋</span>
                  </h1>
                  <p className="text-neutral-600 text-xs sm:text-sm font-normal mt-1">
                    Let&apos;s capture your thoughts and make today meaningful.
                  </p>
                </div>

                {/* Cursive terracota callout */}
                <div className="hidden sm:block font-script-luma text-base xl:text-lg text-[#C25E2E] font-semibold leading-tight select-none rotate-[-4deg] text-right pr-2">
                  Small Steps<br />Big Changes
                </div>
              </div>

              {/* Action Buttons Row & 3D Pen Graphic */}
              <div className="relative z-10 flex items-center justify-between mt-5 pt-1">
                
                {/* 4 Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="hero-new-journal-btn"
                    type="button"
                    onClick={() => setShowNewJournalModal(true)}
                    className="py-2 px-4 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-xs shadow-sm hover:shadow flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>New Journal</span>
                  </button>

                  <button
                    id="hero-voice-entry-btn"
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`py-2 px-3.5 rounded-full border text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5 text-neutral-600" />}
                    <span>{isListening ? 'Listening...' : 'Voice Entry'}</span>
                  </button>

                  <button
                    id="hero-quick-note-btn"
                    type="button"
                    onClick={() => {
                      setJournalTitle('Quick Thought');
                      setShowNewJournalModal(true);
                    }}
                    className="py-2 px-3.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Quick Note</span>
                  </button>

                  <button
                    id="hero-upload-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* Realistic Luxury Fountain Pen Illustration */}
                <div className="relative hidden xl:block w-36 h-12 pointer-events-none select-none -mt-4">
                  <svg className="w-full h-full drop-shadow-md" viewBox="0 0 160 50" fill="none">
                    {/* Pen barrel in gloss black with gold ring & gold nib */}
                    <g transform="rotate(-28 80 25)">
                      <rect x="25" y="18" width="85" height="12" rx="2" fill="#1C1917" />
                      <rect x="110" y="17" width="20" height="14" rx="1.5" fill="#1C1917" />
                      {/* Gold bands */}
                      <rect x="108" y="17" width="3" height="14" fill="#EAB308" />
                      <rect x="24" y="18" width="3" height="12" fill="#EAB308" />
                      {/* Gold Clip */}
                      <rect x="112" y="13" width="14" height="2" fill="#FACC15" />
                      {/* Gold Nib */}
                      <polygon points="24,19 8,24 24,29" fill="#EAB308" stroke="#CA8A04" strokeWidth="0.8" />
                      <line x1="14" y1="24" x2="23" y2="24" stroke="#78350F" strokeWidth="0.8" />
                    </g>
                  </svg>
                </div>

              </div>

            </div>

            {/* 2. Interactive Mood Picker: "How are you feeling today?" */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  How are you feeling today?
                </h2>
                <button
                  type="button"
                  onClick={() => showToast("Viewing mood history...")}
                  className="group flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#C25E2E] transition-colors cursor-pointer"
                >
                  <span>View History</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* 6 Mood Emoji Buttons */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {MOODS_LIST.map((m) => {
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      id={`mood-btn-${m.id.toLowerCase()}`}
                      type="button"
                      onClick={() => handleMoodSelect(m.id, m.score)}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 ${
                          isSelected
                            ? 'border-2 border-[#FD6B31] shadow-[0_4px_16px_rgba(253,107,49,0.25)] ring-2 ring-[#FD6B31]/20 scale-105 bg-white'
                            : 'bg-neutral-50 hover:bg-orange-50/50 border border-neutral-200/80 group-hover:border-orange-200 group-hover:scale-102'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FD6B31] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[11px] transition-colors leading-tight ${
                          isSelected ? 'font-bold text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-800'
                        }`}
                      >
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* 3. Recent Journals Stream */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
              
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Recent Journals
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewJournalModal(true)}
                  className="group flex items-center gap-1 text-xs font-semibold text-[#EA580C] hover:text-[#C25E2E] transition-colors cursor-pointer"
                >
                  <span>See All</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Journal List Items */}
              <div className="space-y-2.5">
                {filteredJournals.slice(0, 4).map((entry, idx) => {
                  // Varied colors matching the screenshot
                  const getIconDesign = (index: number) => {
                    switch (index % 4) {
                      case 0:
                        return {
                          bg: 'bg-[#FFF2E8] border-[#FFE4D6]',
                          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                          icon: <Sprout className="w-4 h-4 text-[#EA580C]" />
                        };
                      case 1:
                        return {
                          bg: 'bg-sky-50 border-sky-100',
                          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                          icon: <Code2 className="w-4 h-4 text-sky-600" />
                        };
                      case 2:
                        return {
                          bg: 'bg-amber-50 border-amber-100',
                          badge: 'bg-orange-50 text-orange-700 border-orange-200/60',
                          icon: <BookOpen className="w-4 h-4 text-amber-600" />
                        };
                      default:
                        return {
                          bg: 'bg-purple-50 border-purple-100',
                          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
                          icon: <Target className="w-4 h-4 text-purple-600" />
                        };
                    }
                  };

                  const design = getIconDesign(idx);

                  return (
                    <div
                      key={entry.id}
                      id={`journal-row-${entry.id}`}
                      className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-neutral-50/80 border border-neutral-100 transition-all cursor-pointer"
                      onClick={() => {
                        setAiResponseModal({
                          title: entry.title,
                          content: `${entry.content}\n\n[Mood: ${entry.mood} | ${entry.formattedDate}]\n\nLUMA AI Insight:\n${entry.aiInsight || 'You maintained consistent momentum. Reflecting regularly solidifies long-term mental resilience.'}`
                        });
                      }}
                    >
                      {/* Left: Icon, Title & Truncated Preview */}
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${design.bg}`}
                        >
                          {design.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                            {entry.title}
                          </h3>
                          <p className="text-[11px] text-neutral-500 truncate leading-tight mt-0.5">
                            {entry.preview}
                          </p>
                        </div>
                      </div>

                      {/* Right: Timestamp, Mood Badge Pill, Menu */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-neutral-400 hidden sm:inline-block">
                          {entry.formattedDate}
                        </span>

                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${design.badge}`}
                        >
                          {entry.mood}
                        </span>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEntryMenu(activeEntryMenu === entry.id ? null : entry.id);
                            }}
                            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-200/50 cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeEntryMenu === entry.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl border border-neutral-200 shadow-md py-1 z-30 text-xs">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActiveEntryMenu(null);
                                  if (user?.uid) {
                                    await deleteJournalEntry(user.uid, entry.id);
                                    showToast('Journal entry deleted.');
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* ======================================================= */}
          {/* RIGHT 4-COL: LUMA AI Companion & Your Insights Donut    */}
          {/* ======================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* 1. LUMA AI Companion Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
              
              {/* Header: Title & Subtitle + 3D Glowing Sphere with Emblem */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                    <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                    <span>LUMA AI Companion</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {getPersonaSubtitle()}
                  </p>
                </div>

                {/* 3D Glowing Floating Sphere with LUMA Logo */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE7D6] via-[#FFD2B8] to-[#EA580C]/30 ring-2 ring-orange-200/60 shadow-[0_4px_16px_rgba(234,88,12,0.25)] flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute top-1 left-2 w-3 h-1.5 rounded-full bg-white/70 blur-[0.3px]" />
                  <img
                    src="/luma-emblem.png"
                    alt=""
                    className="w-5 h-auto object-contain drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/luma-logo.png';
                    }}
                  />
                </div>
              </div>

              {/* Input: How can I help you today? with mic button */}
              <div className="relative mb-3">
                <input
                  id="ai-companion-prompt-input"
                  type="text"
                  placeholder="How can I help you today?"
                  value={aiCompanionPrompt}
                  onChange={(e) => setAiCompanionPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskLumaAI();
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200/80 rounded-full pl-3.5 pr-10 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition-all shadow-2xs"
                />
                <button
                  id="ai-companion-send-btn"
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAskLumaAI()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
                </button>
              </div>

              {/* 3 Persona-Adaptive Prompt Action Chips */}
              <div className="space-y-2">
                {getPersonaChips().map((chip) => (
                  <button
                    key={chip.id}
                    id={`ai-chip-${chip.id}`}
                    type="button"
                    onClick={() => handleAskLumaAI(chip.prompt)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 hover:bg-orange-50/50 border border-neutral-200/70 hover:border-orange-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div className="shrink-0">{chip.icon}</div>
                      <span className="text-xs font-semibold text-neutral-800 truncate group-hover:text-neutral-900">
                        {chip.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#EA580C] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

            </div>

            {/* 2. Your Insights Card with Donut Chart */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex-1 flex flex-col justify-between">
              
              {/* Header with "This Week v" Dropdown */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                  Your Insights
                </h2>
                <div className="flex items-center gap-1 text-xs font-medium text-neutral-500 bg-neutral-50 border border-neutral-200/70 rounded-lg px-2 py-0.5 cursor-pointer">
                  <span>This Week</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Donut Chart & Legend */}
              <div className="flex items-center justify-between gap-3 my-2">
                
                {/* SVG Donut Chart with Centered Score */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F3F4F6"
                      strokeWidth="10"
                      fill="none"
                    />

                    {/* Segment 1: Focused (42%) - Orange */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#EA580C"
                      strokeWidth="10"
                      strokeDasharray="100 138"
                      strokeDashoffset="0"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Segment 2: Learning (28%) - Blue */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#3B82F6"
                      strokeWidth="10"
                      strokeDasharray="67 171"
                      strokeDashoffset="-105"
                      fill="none"
                    />

                    {/* Segment 3: Planning (18%) - Coral */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F43F5E"
                      strokeWidth="10"
                      strokeDasharray="43 195"
                      strokeDashoffset="-176"
                      fill="none"
                    />

                    {/* Segment 4: Other (12%) - Gray */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#9CA3AF"
                      strokeWidth="10"
                      strokeDasharray="29 209"
                      strokeDashoffset="-222"
                      fill="none"
                    />
                  </svg>

                  {/* Center Metric Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-neutral-900 leading-none">
                      {insights.productivityScore}%
                    </span>
                    <span className="text-[8px] font-semibold text-neutral-500 leading-tight mt-0.5">
                      Productivity Score
                    </span>
                    <span className="text-[7.5px] text-emerald-600 font-bold mt-0.5">
                      +{insights.scoreDelta}% from last week
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 flex-1 pl-2">
                  {insights.distribution.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] font-medium text-neutral-700">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-900">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Quote Block */}
              <div className="bg-[#FFF8F2] border border-[#FFE7D6] rounded-2xl p-3 flex items-start gap-1.5 mt-2">
                <span className="text-lg font-serif leading-none text-[#EA580C] font-bold select-none">
                  “
                </span>
                <div className="flex flex-col">
                  <p className="text-[10.5px] text-neutral-800 font-medium leading-tight">
                    Consistent progress today leads to extraordinary results tomorrow.
                  </p>
                  <span className="text-[9.5px] text-neutral-400 mt-1">
                    — LUMA AI
                  </span>
                </div>
                <span className="text-lg font-serif leading-none text-[#EA580C] font-bold select-none ml-auto">
                  ”
                </span>
              </div>

            </div>

          </div>

        </main>

      </div>

      {/* ========================================================= */}
      {/* 3. NEW JOURNAL MODAL                                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showNewJournalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-neutral-200 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF2E8] flex items-center justify-center text-[#EA580C]">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">New Journal Entry</h3>
                    <p className="text-[11px] text-neutral-500">Capture your reflection and insights</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewJournalModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Deep Work Session & Wins"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Your Reflection</label>
                  <textarea
                    rows={4}
                    placeholder="Write what you accomplished, what challenged you, and what you are grateful for..."
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">Mood Tag</label>
                  <div className="flex gap-2">
                    {['Calm', 'Motivated', 'Happy', 'Focused'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setJournalMood(m)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          journalMood === m
                            ? 'bg-[#EA580C] text-white border-[#EA580C] font-semibold'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewJournalModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  id="save-new-journal-btn"
                  type="button"
                  disabled={savingJournal}
                  onClick={handleSaveJournal}
                  className="px-6 py-2 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {savingJournal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Journal</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. AI COMPANION RESPONSE MODAL                            */}
      {/* ========================================================= */}
      <AnimatePresence>
        {aiResponseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-neutral-200 relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF2E8] flex items-center justify-center text-[#EA580C]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 truncate max-w-xs">{aiResponseModal.title}</h3>
                    <p className="text-[10px] text-neutral-500">LUMA AI Companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setAiResponseModal(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 overflow-y-auto pr-1 text-xs text-neutral-800 leading-relaxed whitespace-pre-line bg-neutral-50/70 p-4 rounded-2xl border border-neutral-200/60 font-mono">
                {aiResponseModal.content}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setJournalTitle(aiResponseModal.title);
                    setJournalContent(aiResponseModal.content);
                    setAiResponseModal(null);
                    setShowNewJournalModal(true);
                  }}
                  className="text-xs text-[#EA580C] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Save as Journal Entry</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setAiResponseModal(null)}
                  className="px-5 py-2 rounded-full bg-black text-white text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
