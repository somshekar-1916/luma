import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar,
  Rocket, 
  FileText, 
  Target, 
  Smile, 
  BarChart3, 
  Lightbulb, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Bell, 
  LayoutDashboard, 
  BookOpen, 
  Sparkles, 
  Settings, 
  PenLine, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { 
  PersonaType, 
  getUserProfile, 
  completeUserOnboarding, 
  skipOnboarding 
} from '../../services/userService';
import { BotanicalBranch3D } from './PersonaIllustrations';

// Visual Assets
import studentDeskSceneImg from '../../assets/images/luma_student_desk_scene_1788531139567.jpg';
import silkBgImg from '../../assets/images/luma_silk_background_1788530324776.jpg';
import studentAvatarImg from '../../assets/images/student_developer_avatar_1788530257638.jpg';

interface Step3PersonalizeProps {
  selectedPersona?: PersonaType | null;
  onPrevStep?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
}

interface FrequencyOption {
  id: string;
  title: string;
  subtitle: string;
}

interface SupportOption {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { id: 'Daily', title: 'Daily', subtitle: 'Build a habit' },
  { id: 'A few times a week', title: 'A few times a week', subtitle: 'Stay consistent' },
  { id: 'Weekly', title: 'Weekly', subtitle: 'Reflect regularly' },
  { id: 'As needed', title: 'As needed', subtitle: 'Journal anytime' }
];

const SUPPORT_OPTIONS: SupportOption[] = [
  {
    id: 'motivation-encouragement',
    title: 'Motivation & Encouragement',
    icon: <Rocket className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  },
  {
    id: 'structured-reflections',
    title: 'Structured Reflections',
    icon: <FileText className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  },
  {
    id: 'goal-tracking',
    title: 'Goal Tracking',
    icon: <Target className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  },
  {
    id: 'mood-analysis',
    title: 'Mood Analysis',
    icon: <Smile className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  },
  {
    id: 'productivity-insights',
    title: 'Productivity Insights',
    icon: <BarChart3 className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  },
  {
    id: 'personalized-suggestions',
    title: 'Personalized Suggestions',
    icon: <Lightbulb className="w-4 h-4 text-[#EA580C] stroke-[2.2]" />
  }
];

export const Step3Personalize: React.FC<Step3PersonalizeProps> = ({
  selectedPersona,
  onPrevStep,
  onSkip,
  onComplete
}) => {
  const { user, loading: authLoading } = useAuth();

  // Section 1: Journaling Frequency (Single-select, default to 'Daily' as shown in image)
  const [selectedFrequency, setSelectedFrequency] = useState<string>('Daily');

  // Section 2: Type of Support (Multi-select, max 3, defaults matching image: motivation, goal tracking, productivity insights)
  const [selectedSupport, setSelectedSupport] = useState<string[]>([
    'motivation-encouragement',
    'goal-tracking',
    'productivity-insights'
  ]);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background profile sync: non-blocking, NO automatic redirects so user has full control
  useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;
    const inspectProfileContext = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (isMounted && profile?.profile) {
          if (profile.profile.frequency) {
            setSelectedFrequency(profile.profile.frequency);
          }
          if (Array.isArray(profile.profile.supportTypes) && profile.profile.supportTypes.length > 0) {
            setSelectedSupport(profile.profile.supportTypes.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Profile context background sync notice:', err);
      }
    };

    inspectProfileContext();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Support multi-selection logic enforcing maximum of 3 selections
  const toggleSupport = (id: string) => {
    setErrorMessage(null);
    setSelectedSupport((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        // Enforce max 3 limit
        setErrorMessage('You can select up to 3 support types.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSupportKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSupport(id);
    }
  };

  const handleFrequencyKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedFrequency(id);
    }
  };

  const handleContinue = () => {
    if (!selectedFrequency) {
      setErrorMessage('Please select how often you want to journal.');
      return;
    }
    if (selectedSupport.length === 0) {
      setErrorMessage('Please select at least one type of support.');
      return;
    }

    const freq = selectedFrequency;
    const support = [...selectedSupport];

    // Asynchronously commit to Firestore without blocking navigation
    if (user?.uid) {
      completeUserOnboarding(user.uid, freq, support).catch((err) => {
        console.warn('Background complete onboarding error:', err);
      });
    }

    // Instant transition to dashboard
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (user?.uid) {
      skipOnboarding(user.uid).catch(console.warn);
    }
    if (onSkip) {
      onSkip();
    } else if (onComplete) {
      onComplete();
    }
  };

  // Derive display name from user context, fallback to 'Sanju' matching reference image
  const rawDisplayName = user?.displayName || user?.email?.split('@')[0] || 'Sanju';
  const formattedDisplayName = rawDisplayName.charAt(0).toUpperCase() + rawDisplayName.slice(1);

  if (authLoading) {
    return (
      <div className="h-screen max-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#FD6B31] animate-spin" />
          <span className="text-neutral-600 font-medium text-sm tracking-wide">
            Loading your preferences...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF7F2] text-neutral-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* Background silk layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={silkBgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-multiply pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />
        {/* Warm ambient glows */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-orange-200/35 via-amber-100/25 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-orange-200/25 via-peach-100/20 to-transparent rounded-full blur-3xl opacity-55" />
        <div className="absolute -bottom-40 left-1/4 w-[750px] h-[450px] bg-gradient-to-t from-amber-200/25 via-orange-100/15 to-transparent rounded-full blur-3xl opacity-55" />
      </div>

      {/* Top Header Bar: Logo, 3-Step Progress Stepper (Step 3 Active), Skip link */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pt-2.5 sm:pt-3 pb-1 flex items-center justify-between shrink-0">
        
        {/* Left: Official LUMA Brand Logo */}
        <div className="flex items-center gap-2 select-none cursor-pointer">
          <img
            src="/luma-emblem.png"
            alt="LUMA"
            className="h-7 sm:h-8 w-auto object-contain drop-shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/luma-logo.png';
            }}
            referrerPolicy="no-referrer"
          />
          <span className="font-serif-luma font-bold text-xl sm:text-2xl tracking-[0.16em] text-[#1A1C1C]">
            LUMA
          </span>
        </div>

        {/* Center: 3-Step Progress Stepper (Step 3 Active) */}
        <nav aria-label="Onboarding Progress" className="flex items-center justify-center">
          <div className="flex items-center">
            {/* Step 1: Completed */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FD6B31] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#FD6B31] mt-1 whitespace-nowrap">
                About You
              </span>
            </div>

            {/* Solid orange connector line */}
            <div className="w-10 sm:w-16 h-[2px] bg-[#FD6B31] -mt-4" />

            {/* Step 2: Completed */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FD6B31] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#FD6B31] mt-1 whitespace-nowrap">
                Your Goals
              </span>
            </div>

            {/* Solid orange connector line */}
            <div className="w-10 sm:w-16 h-[2px] bg-[#FD6B31] -mt-4" />

            {/* Step 3: Active */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FD6B31] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-[#FD6B31]/20">
                3
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#FD6B31] mt-1 whitespace-nowrap">
                Personalize
              </span>
            </div>
          </div>
        </nav>

        {/* Right: Skip for now link */}
        <div className="flex items-center justify-end">
          <button
            id="onboarding-step3-skip-btn"
            type="button"
            onClick={handleSkip}
            className="group flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <span>Skip for now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-neutral-600 group-hover:text-neutral-900" />
          </button>
        </div>
      </header>

      {/* Main Content Area: 3-Column Layout (Left Story & 3D Scene | Center Options | Right Live Preview) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-1 flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-4 lg:gap-6 min-h-0">
        
        {/* Left Column: Brand Statement, Script Accent, 3D Character Desk Scene, and Quote */}
        <div className="w-full lg:w-[220px] xl:w-[240px] shrink-0 flex flex-col justify-between h-full py-1 hidden lg:flex">
          
          {/* Top Brand Block */}
          <div>
            <h2 className="font-serif-luma text-xl xl:text-2xl font-normal text-[#1A1C1C] tracking-tight leading-[1.15]">
              Your story<br />matters.
            </h2>
            <p className="text-neutral-500 text-xs tracking-wide font-normal mt-1">
              A more mindful you,<br />starts here.
            </p>
            {/* Subtle warm accent bar */}
            <div className="w-10 h-[2px] bg-[#E8DDD2] mt-2 mb-2" />

            {/* Handwritten terracotta cursive callout */}
            <div className="font-script-luma text-lg text-[#C25E2E] font-semibold leading-tight select-none">
              Small Steps<br />Big Changes ♡
            </div>
          </div>

          {/* 3D Student Desk Scene Illustration */}
          <div className="relative my-auto py-1 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-neutral-200/70 bg-white max-w-[190px] w-full">
              <img
                src={studentDeskSceneImg}
                alt="Student Developer Desk Scene"
                className="w-full h-auto object-cover select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Bottom Left Quote Box */}
          <div className="flex items-start gap-1.5 max-w-xs pt-1">
            <span className="text-2xl font-serif leading-none select-none text-[#EA580C] font-bold">
              “
            </span>
            <div className="flex flex-col">
              <p className="text-[11px] text-neutral-700 font-medium leading-tight">
                You don&apos;t have to<br />
                be perfect, just consistent. <span className="text-[#EA580C] font-serif font-bold">”</span>
              </p>
              <span className="text-[10px] text-neutral-400 mt-0.5 font-normal tracking-wide">
                — LUMA
              </span>
            </div>
          </div>
        </div>

        {/* Center Column: Questions 1 & 2 */}
        <div className="flex-1 w-full flex flex-col justify-between h-full py-0.5 min-w-0">
          
          {/* Eyebrow & Title */}
          <div className="mb-1.5 shrink-0">
            <span className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase block mb-0.5">
              STEP 3 OF 3
            </span>
            <h1 className="font-serif-luma text-2xl sm:text-3xl font-normal text-[#1A1C1C] tracking-tight leading-tight mb-0.5">
              Personalize Your Experience
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm font-normal">
              Tell us a bit more so LUMA can support you better.
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-1.5 p-1.5 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-xs shrink-0"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: How often do you want to journal? (4 Cards in a Row) */}
          <div className="shrink-0 mb-2">
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight mb-1.5">
              1. How often do you want to journal?
            </h2>

            <div 
              role="radiogroup" 
              aria-label="How often do you want to journal?"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full"
            >
              {FREQUENCY_OPTIONS.map((opt) => {
                const isSelected = selectedFrequency === opt.id;
                return (
                  <div
                    key={opt.id}
                    id={`frequency-opt-${opt.id.toLowerCase().replace(/\s+/g, '-')}`}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => {
                      setErrorMessage(null);
                      setSelectedFrequency(opt.id);
                    }}
                    onKeyDown={(e) => handleFrequencyKeyDown(e, opt.id)}
                    className={`relative rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer flex flex-col items-center text-center select-none outline-none ${
                      isSelected
                        ? 'bg-white border-2 border-[#FD6B31] shadow-[0_6px_20px_rgba(253,107,49,0.12)] ring-1 ring-[#FD6B31]/15'
                        : 'bg-white/95 hover:bg-white border border-neutral-200/90 hover:border-orange-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    {/* Top right check indicator */}
                    <div
                      className={`absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#FD6B31] text-white shadow-xs'
                          : 'border border-neutral-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>

                    {/* Calendar Icon */}
                    <div className="w-8 h-8 rounded-xl bg-[#FFF2E8] border border-[#FFE0CC]/60 flex items-center justify-center mb-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-[#EA580C] stroke-[2]" />
                    </div>

                    <h3 className="text-xs font-bold text-neutral-900 tracking-tight leading-tight">
                      {opt.title}
                    </h3>
                    <p className="text-[10.5px] text-neutral-500 font-normal mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: What type of support do you want from LUMA? (3 Columns x 2 Rows) */}
          <div className="shrink-0 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                2. What type of support do you want from LUMA?
              </h2>
              <span className="text-[11px] text-neutral-500 font-medium">
                Select up to 3
              </span>
            </div>

            <div 
              role="group"
              aria-label="Select up to 3 support types"
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 w-full"
            >
              {SUPPORT_OPTIONS.map((opt) => {
                const isSelected = selectedSupport.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    id={`support-opt-${opt.id}`}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => toggleSupport(opt.id)}
                    onKeyDown={(e) => handleSupportKeyDown(e, opt.id)}
                    className={`relative rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer flex items-center justify-between select-none outline-none ${
                      isSelected
                        ? 'bg-white border-2 border-[#FD6B31] shadow-[0_6px_20px_rgba(253,107,49,0.12)] ring-1 ring-[#FD6B31]/15'
                        : 'bg-white/95 hover:bg-white border border-neutral-200/90 hover:border-orange-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF2E8] border border-[#FFE0CC]/60 flex items-center justify-center shrink-0">
                        {opt.icon}
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 leading-snug truncate">
                        {opt.title}
                      </span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#FD6B31] text-white shadow-xs'
                          : 'border border-neutral-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions Row: Back Button on Left, Continue Button & Subtext on Right */}
          <div className="relative flex items-center justify-between shrink-0 pt-2 z-20 w-full mt-auto">
            {/* Left Action: Back */}
            <button
              id="onboarding-step3-back-btn"
              type="button"
              onClick={onPrevStep}
              className="flex items-center gap-1.5 py-2 sm:py-2.5 px-5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Right Action: Continue with "Go to your dashboard" subtitle */}
            <div className="flex flex-col items-center">
              <button
                id="onboarding-step3-continue-btn"
                type="button"
                disabled={!selectedFrequency || selectedSupport.length === 0 || submitting}
                onClick={handleContinue}
                className="py-2.5 sm:py-3 px-8 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer shrink-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Personalizing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </>
                )}
              </button>
              <span className="text-[11px] text-neutral-500 font-normal mt-1 tracking-wide">
                Go to your dashboard
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Live Miniature Dashboard Preview Widget */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col justify-between h-full py-1 relative">
          
          {/* Header above Preview Widget */}
          <div className="mb-2 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">
                Here&apos;s a preview of your LUMA space
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-[#FD6B31]" />
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">
              A personalized experience, just for you.
            </p>
          </div>

          {/* Miniature Dashboard Preview Box */}
          <div className="relative flex-1 bg-white/95 rounded-3xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden">
            
            {/* Mini Top Bar: LUMA Logo, Avatar, Greeting, Bell */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-1.5">
                <img
                  src="/luma-emblem.png"
                  alt=""
                  className="h-4 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/luma-logo.png';
                  }}
                />
                <span className="font-serif-luma font-bold text-xs tracking-wider text-[#1A1C1C]">
                  LUMA
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <img
                  src={studentAvatarImg}
                  alt={formattedDisplayName}
                  className="w-5 h-5 rounded-full object-cover border border-orange-200"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-neutral-900 leading-none">
                    Good morning, {formattedDisplayName} ☀️
                  </span>
                  <span className="text-[8px] text-neutral-400 leading-none mt-0.5">
                    Ready to capture your thoughts today?
                  </span>
                </div>
                <Bell className="w-3 h-3 text-neutral-400 ml-1" />
              </div>
            </div>

            {/* Middle Preview Content: Mini Sidebar + Action & Stats */}
            <div className="flex gap-2 my-1.5 flex-1 min-h-0">
              {/* Mini Left Sidebar */}
              <div className="w-20 shrink-0 flex flex-col gap-1 py-1 text-[9px] font-medium border-r border-neutral-100 pr-1">
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[#FFF2E8] text-[#EA580C] font-semibold">
                  <LayoutDashboard className="w-2.5 h-2.5" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-md text-neutral-500 hover:text-neutral-700">
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>My Journals</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-md text-neutral-500 hover:text-neutral-700">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-1 rounded-md text-neutral-500 hover:text-neutral-700 mt-auto">
                  <Settings className="w-2.5 h-2.5" />
                  <span>Settings</span>
                </div>
              </div>

              {/* Mini Main Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Mini + New Journal button */}
                <div className="w-full bg-neutral-50 border border-neutral-200/80 rounded-xl p-2 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-800">
                    <PenLine className="w-3 h-3 text-[#EA580C]" />
                    <span>+ New Journal</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center">
                    <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Mini 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-1.5 my-1.5">
                  <div className="bg-neutral-50/80 border border-neutral-200/70 rounded-lg p-1.5 relative flex flex-col">
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-neutral-300" />
                    <span className="text-xs font-bold text-neutral-900 leading-none">12</span>
                    <span className="text-[8px] font-semibold text-neutral-700 mt-0.5">Entries</span>
                    <span className="text-[7px] text-neutral-400">This Month</span>
                  </div>

                  <div className="bg-neutral-50/80 border border-neutral-200/70 rounded-lg p-1.5 relative flex flex-col">
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-neutral-300" />
                    <span className="text-xs font-bold text-neutral-900 leading-none">7</span>
                    <span className="text-[8px] font-semibold text-neutral-700 mt-0.5">Day Streak</span>
                    <span className="text-[7px] text-neutral-400">Keep going!</span>
                  </div>

                  <div className="bg-neutral-50/80 border border-neutral-200/70 rounded-lg p-1.5 relative flex flex-col">
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-neutral-300" />
                    <span className="text-xs font-bold text-neutral-900 leading-none">85%</span>
                    <span className="text-[8px] font-semibold text-neutral-700 mt-0.5">Well-being</span>
                    <span className="text-[7px] text-neutral-400">This Week</span>
                  </div>
                </div>

                {/* Mini Quote block */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-2 flex items-start gap-1">
                  <span className="text-sm font-serif leading-none text-[#EA580C] font-bold select-none">
                    “
                  </span>
                  <div className="flex flex-col">
                    <p className="text-[9px] text-neutral-700 font-medium leading-tight">
                      Small steps today.<br />
                      A brighter tomorrow.
                    </p>
                    <span className="text-[8px] text-neutral-400 mt-0.5">
                      — LUMA
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Right Decorative Botanical Leaves */}
          <div className="absolute -right-8 -bottom-10 w-28 h-28 opacity-90 pointer-events-none hidden xl:block">
            <BotanicalBranch3D className="w-full h-full" />
          </div>

        </div>

      </main>
    </div>
  );
};
