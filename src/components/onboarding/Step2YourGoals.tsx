import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Briefcase, 
  Sprout, 
  Target, 
  BarChart3, 
  Star, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Pencil, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { 
  PersonaType, 
  getUserProfile, 
  saveUserGoals, 
  skipOnboarding 
} from '../../services/userService';
import { BotanicalBranch3D } from './PersonaIllustrations';

// 3D Visual Assets matching the design
import studentDeskSceneImg from '../../assets/images/luma_student_desk_scene_1788531139567.jpg';
import silkBgImg from '../../assets/images/luma_silk_background_1788530324776.jpg';

interface Step2YourGoalsProps {
  selectedPersona?: PersonaType | null;
  onPrevStep?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
}

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'track-coding-progress',
    title: 'Track Coding Progress',
    description: 'Log daily coding, project ideas, and review weekly achievements.',
    icon: (
      <div className="flex items-center text-xs font-mono font-bold tracking-tight text-[#EA580C]">
        <span>&lt;/&gt;</span>
      </div>
    )
  },
  {
    id: 'record-work-wins',
    title: 'Record Work Wins',
    description: 'Capture daily achievements and make end-of-year reviews effortless.',
    icon: <Briefcase className="w-5 h-5 text-[#EA580C] stroke-[2]" />
  },
  {
    id: 'improve-mental-health',
    title: 'Improve Mental Health',
    description: 'Track your mood, stress levels, and emotional well-being.',
    icon: <Sprout className="w-5 h-5 text-[#EA580C] stroke-[2]" />
  },
  {
    id: 'build-better-habits',
    title: 'Build Better Habits',
    description: 'Stay consistent with your goals and create a better you.',
    icon: <Target className="w-5 h-5 text-[#EA580C] stroke-[2]" />
  },
  {
    id: 'gain-personal-insights',
    title: 'Gain Personal Insights',
    description: 'Understand patterns in your thoughts, behavior, and growth over time.',
    icon: <BarChart3 className="w-5 h-5 text-[#EA580C] stroke-[2]" />
  },
  {
    id: 'something-else',
    title: 'Something Else',
    description: 'I have a different goal in mind.',
    icon: <Star className="w-5 h-5 text-[#EA580C] stroke-[2]" />
  }
];

export const Step2YourGoals: React.FC<Step2YourGoalsProps> = ({
  selectedPersona,
  onPrevStep,
  onSkip,
  onComplete
}) => {
  const { user, loading: authLoading } = useAuth();
  
  // Pre-select 'track-coding-progress' and 'build-better-habits' as shown in the reference image
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'track-coding-progress',
    'build-better-habits'
  ]);
  const [customGoalNote, setCustomGoalNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background profile sync: non-blocking
  useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;
    const inspectProfileContext = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (isMounted && profile) {
          // If user previously selected goals, restore them
          if (profile?.profile?.goals && Array.isArray(profile.profile.goals) && profile.profile.goals.length > 0) {
            setSelectedGoals(profile.profile.goals);
          }
          if (profile?.profile?.customGoalNote) {
            setCustomGoalNote(profile.profile.customGoalNote);
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

  const toggleGoal = (id: string) => {
    setErrorMessage(null);
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleGoal(id);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 200);
    setCustomGoalNote(val);
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      setErrorMessage('Please select at least one goal to personalize your LUMA experience.');
      return;
    }

    const currentGoals = [...selectedGoals];
    const note = customGoalNote;

    // Asynchronously commit to Firestore without blocking the transition
    if (user?.uid) {
      saveUserGoals(user.uid, currentGoals, note).catch((err) => {
        console.warn('Background save goals notice:', err);
      });
    }

    // Advance immediately
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = async () => {
    if (user?.uid) {
      skipOnboarding(user.uid).catch(console.warn);
    }
    if (onSkip) {
      onSkip();
    } else if (onComplete) {
      onComplete();
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen max-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#FD6B31] animate-spin" />
          <span className="text-neutral-600 font-medium text-sm tracking-wide">
            Preparing your goals...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF7F2] text-neutral-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* Background silk layer matching the uploaded design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={silkBgImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-multiply pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />

        {/* Ambient subtle warm glows */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-orange-200/35 via-amber-100/25 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-orange-200/25 via-peach-100/20 to-transparent rounded-full blur-3xl opacity-55" />
        <div className="absolute -bottom-40 left-1/4 w-[750px] h-[450px] bg-gradient-to-t from-amber-200/25 via-orange-100/15 to-transparent rounded-full blur-3xl opacity-55" />
      </div>

      {/* Top Header Bar: Logo, 3-Step Progress Stepper, and Skip for now */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pt-3 sm:pt-4 pb-1 flex items-center justify-between shrink-0">
        
        {/* Left: Official LUMA Brand Logo with Emblem & Wordmark */}
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

        {/* Center: 3-Step Progress Stepper (Step 2 Active) */}
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

            {/* Step 2: Active */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FD6B31] text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-[#FD6B31]/20">
                2
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#FD6B31] mt-1 whitespace-nowrap">
                Your Goals
              </span>
            </div>

            {/* Grey connector line */}
            <div className="w-10 sm:w-16 h-[2px] bg-neutral-300 -mt-4" />

            {/* Step 3: Upcoming */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-neutral-300 bg-white text-neutral-400 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-400 mt-1 whitespace-nowrap">
                Personalize
              </span>
            </div>
          </div>
        </nav>

        {/* Right: Skip for now link */}
        <div className="flex items-center justify-end">
          <button
            id="onboarding-step2-skip-btn"
            type="button"
            onClick={handleSkip}
            className="group flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <span>Skip for now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-neutral-600 group-hover:text-neutral-900" />
          </button>
        </div>
      </header>

      {/* Main Content Area: Split 2-Column Layout */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-1 flex-1 flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-8 min-h-0">
        
        {/* Left Column: Brand Statement, Script Accent, 3D Character Desk Scene, and Inspirational Quote */}
        <div className="w-full lg:w-[260px] xl:w-[290px] shrink-0 flex flex-col justify-between h-full py-1 hidden sm:flex">
          
          {/* Top Brand Block */}
          <div>
            <h2 className="font-serif-luma text-xl sm:text-2xl lg:text-[26px] font-normal text-[#1A1C1C] tracking-tight leading-[1.15]">
              A journal for<br />a brighter you.
            </h2>
            <p className="text-neutral-500 text-xs tracking-wide font-normal mt-1">
              Capture. Reflect. Grow.
            </p>
            {/* Subtle warm accent bar */}
            <div className="w-10 h-[2px] bg-[#E8DDD2] mt-2 mb-2" />

            {/* Handwritten terracotta cursive callout */}
            <div className="font-script-luma text-lg sm:text-xl text-[#C25E2E] font-semibold leading-tight select-none">
              Small Steps<br />Big Changes ♡
            </div>
          </div>

          {/* 3D Student Desk Scene Illustration */}
          <div className="relative my-auto py-1 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-neutral-200/70 bg-white max-w-[210px] w-full">
              <img
                src={studentDeskSceneImg}
                alt="Student Developer Desk Scene"
                className="w-full h-auto object-cover select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Bottom Left Quote Box */}
          <div className="flex items-start gap-2 max-w-xs pt-1">
            <span className="text-3xl font-serif leading-none select-none text-[#EA580C] font-bold">
              “
            </span>
            <div className="flex flex-col">
              <p className="text-[11px] text-neutral-700 font-medium leading-tight">
                Progress begins<br />
                with a single thought. <span className="text-[#EA580C] font-serif font-bold">”</span>
              </p>
              <span className="text-[10px] text-neutral-400 mt-0.5 font-normal tracking-wide">
                — LUMA
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Eyebrow, Title, 6 Goal Cards, Optional Note, & Navigation */}
        <div className="flex-1 w-full flex flex-col justify-between h-full py-1 min-w-0">
          
          {/* Eyebrow & Title */}
          <div className="mb-2 shrink-0">
            <span className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase block mb-0.5">
              STEP 2 OF 3
            </span>
            <h1 className="font-serif-luma text-2xl sm:text-3xl lg:text-[34px] font-normal text-[#1A1C1C] tracking-tight leading-tight mb-1">
              What do you want to achieve with LUMA?
            </h1>
            <p className="text-neutral-600 text-xs sm:text-sm font-normal">
              Select all that apply. We&apos;ll tailor your experience based on your goals.
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-2 p-2 px-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-xs shrink-0"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The 6 Goal Selection Cards in 3 Columns x 2 Rows */}
          <div 
            role="group"
            aria-label="Select your goals"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full my-auto shrink-0"
          >
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);

              return (
                <div
                  key={goal.id}
                  id={`goal-card-${goal.id}`}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => toggleGoal(goal.id)}
                  onKeyDown={(e) => handleKeyDown(e, goal.id)}
                  className={`group relative rounded-2xl p-3 sm:p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none outline-none ${
                    isSelected
                      ? 'bg-white border-2 border-[#FD6B31] shadow-[0_6px_20px_rgba(253,107,49,0.12)] ring-1 ring-[#FD6B31]/15'
                      : 'bg-white/95 hover:bg-white border border-neutral-200/90 hover:border-orange-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {/* Top Row: Icon badge on left, selection indicator circle on right */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF2E8] border border-[#FFE0CC]/60 flex items-center justify-center">
                      {goal.icon}
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#FD6B31] text-white shadow-xs'
                          : 'border-2 border-neutral-300 bg-white group-hover:border-neutral-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight mb-0.5">
                      {goal.title}
                    </h3>
                    <p className="text-neutral-500 text-[11px] leading-snug line-clamp-2 font-normal">
                      {goal.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Note Input Box */}
          <div className="w-full bg-white/90 border border-neutral-200/80 rounded-2xl p-2.5 sm:p-3 shadow-xs mt-2 mb-2 shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-neutral-800">
              <Pencil className="w-3.5 h-3.5 text-neutral-500" />
              <span>Tell us more (optional)</span>
            </div>
            
            <div className="relative">
              <input
                id="custom-goal-note-input"
                type="text"
                value={customGoalNote}
                onChange={handleNoteChange}
                maxLength={200}
                placeholder="e.g. I want to use LUMA to document my startup journey..."
                className="w-full bg-neutral-50/70 border border-neutral-200/70 rounded-xl px-3 py-1.5 pr-14 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#FD6B31] focus:bg-white transition-all font-normal"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-medium select-none pointer-events-none">
                {customGoalNote.length}/200
              </span>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="relative flex items-center justify-between shrink-0 pt-2 z-20 w-full">
            
            {/* Left Action: Back */}
            <button
              id="onboarding-back-btn"
              type="button"
              onClick={onPrevStep}
              className="flex items-center gap-1.5 py-2 sm:py-2.5 px-5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {/* Middle Decorative Script: gracefully positioned in the center with ample breathing room */}
            <div className="hidden md:flex items-center gap-2 select-none px-4">
              <span className="font-script-luma text-base lg:text-lg text-[#C25E2E] font-semibold leading-none">
                A more mindful you awaits...
              </span>
              <svg className="w-16 h-1.5 text-[#C25E2E]/80" viewBox="0 0 140 10" fill="none">
                <path d="M4 6C35 2 95 3 136 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            {/* Right Action: Continue - Completely unobstructed, high contrast, prominent */}
            <button
              id="onboarding-step2-continue-btn"
              type="button"
              disabled={selectedGoals.length === 0 || submitting}
              onClick={handleContinue}
              className="relative z-30 py-2.5 sm:py-3 px-8 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving your goals...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
