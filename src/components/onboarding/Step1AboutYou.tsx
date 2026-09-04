import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { 
  PersonaType, 
  savePersonaSelection, 
  getUserProfile, 
  skipOnboarding 
} from '../../services/userService';
import { 
  StudentDevIllustration, 
  BusyProIllustration, 
  PersonalGrowthIllustration, 
  BotanicalBranch3D 
} from './PersonaIllustrations';

// 3D Avatar Assets generated to match the exact uploaded design
import studentDevImg from '../../assets/images/student_developer_avatar_1788530257638.jpg';
import busyProImg from '../../assets/images/busy_professional_avatar_1788530290495.jpg';
import growthSeekerImg from '../../assets/images/growth_seeker_avatar_1788530305362.jpg';
import silkBgImg from '../../assets/images/luma_silk_background_1788530324776.jpg';

interface Step1AboutYouProps {
  onNextStep?: (persona: PersonaType) => void;
  onSkip?: () => void;
  onRedirectToLogin?: () => void;
  onRedirectToDashboard?: () => void;
}

interface PersonaOption {
  id: PersonaType;
  title: string;
  description: string;
  tags: string[];
  imageSrc: string;
  fallbackIllustration: React.ReactNode;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'STUDENT_DEV',
    title: 'Students & Developers',
    description: 'To log daily coding progress, track project ideas, and review weekly achievements.',
    tags: ['Coding', 'Projects', 'Growth'],
    imageSrc: studentDevImg,
    fallbackIllustration: <StudentDevIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
  },
  {
    id: 'BUSY_PRO',
    title: 'Busy Professionals',
    description: 'To record daily work wins so they can easily write end-of-year performance reviews.',
    tags: ['Productivity', 'Work', 'Success'],
    imageSrc: busyProImg,
    fallbackIllustration: <BusyProIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
  },
  {
    id: 'GROWTH_SEEKER',
    title: 'Personal Growth Seekers',
    description: 'People tracking mental health, stress levels, or daily habits over time.',
    tags: ['Mindfulness', 'Habits', 'Wellness'],
    imageSrc: growthSeekerImg,
    fallbackIllustration: <PersonalGrowthIllustration className="w-24 h-24 sm:w-28 sm:h-28" />
  }
];

export const Step1AboutYou: React.FC<Step1AboutYouProps> = ({
  onNextStep,
  onSkip,
  onRedirectToLogin,
  onRedirectToDashboard
}) => {
  const { user, loading: authLoading } = useAuth();
  // Default to STUDENT_DEV as shown selected in the reference design
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('STUDENT_DEV');
  const [submitting, setSubmitting] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background profile check to restore prior selections without blocking UI
  useEffect(() => {
    if (authLoading || !user) return;

    let isMounted = true;
    const inspectProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (isMounted && profile) {
          if (profile.onboardingCompleted || profile.profile?.onboardingCompleted) {
            if (onRedirectToDashboard) {
              onRedirectToDashboard();
              return;
            }
          }
          if (profile.profile?.persona) {
            setSelectedPersona(profile.profile.persona);
          }
        }
      } catch (err) {
        console.warn('Profile background check notice:', err);
      }
    };

    inspectProfile();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, onRedirectToDashboard]);

  const handleSelect = (personaId: PersonaType) => {
    setSelectedPersona(personaId);
    setErrorMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, personaId: PersonaType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(personaId);
    }
  };

  const handleContinue = () => {
    if (!selectedPersona) {
      setErrorMessage('Please select an option that best describes you.');
      return;
    }

    const targetPersona = selectedPersona;

    // Persist to Firestore asynchronously without blocking navigation
    if (user?.uid) {
      savePersonaSelection(user.uid, targetPersona).catch((err) => {
        console.warn('Background persona save notice:', err);
      });
    }

    // Instant transition to next page
    if (onNextStep) {
      onNextStep(targetPersona);
    } else if (onRedirectToDashboard) {
      onRedirectToDashboard();
    } else if (onRedirectToLogin) {
      onRedirectToLogin();
    }
  };

  const handleSkip = async () => {
    if (user?.uid) {
      skipOnboarding(user.uid).catch(console.warn);
    }
    if (onSkip) {
      onSkip();
    } else if (onNextStep && selectedPersona) {
      onNextStep(selectedPersona);
    } else if (onRedirectToDashboard) {
      onRedirectToDashboard();
    }
  };

  if (authLoading || checkingProfile) {
    return (
      <div className="h-screen max-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#FD6B31] animate-spin" />
          <span className="text-neutral-600 font-medium text-sm tracking-wide">Loading your LUMA experience...</span>
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
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />

        {/* Ambient subtle glowing waves */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-orange-200/35 via-amber-100/25 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-orange-200/25 via-peach-100/20 to-transparent rounded-full blur-3xl opacity-55" />
        <div className="absolute -bottom-40 left-1/4 w-[750px] h-[450px] bg-gradient-to-t from-amber-200/25 via-orange-100/15 to-transparent rounded-full blur-3xl opacity-55" />

        {/* Floating 3D golden pearl sphere on the left */}
        <div className="absolute left-6 md:left-10 lg:left-14 top-[50%] -translate-y-1/2 hidden sm:block">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FFE0B2] via-[#FFB74D] to-[#E65100] shadow-[0_6px_16px_rgba(230,81,0,0.3)] ring-1 ring-white/60 relative overflow-hidden">
            <div className="absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full bg-white/70 blur-[0.3px]" />
          </div>
        </div>
      </div>

      {/* Top Header Bar: Logo, Stepper, and Skip for now */}
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

        {/* Center: 3-Step Progress Stepper */}
        <nav aria-label="Onboarding Progress" className="flex items-center justify-center">
          <div className="flex items-center">
            {/* Step 1: Active */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FD6B31] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                1
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#FD6B31] mt-1 whitespace-nowrap">
                About You
              </span>
            </div>

            {/* Two-tone connector line: Orange then Grey */}
            <div className="flex items-center w-10 sm:w-16 -mt-4">
              <div className="w-1/2 h-[2px] bg-[#FD6B31]" />
              <div className="w-1/2 h-[2px] bg-neutral-300" />
            </div>

            {/* Step 2: Upcoming */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-neutral-300 bg-white text-neutral-500 flex items-center justify-center text-xs font-medium">
                2
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-500 mt-1 whitespace-nowrap">
                Your Goals
              </span>
            </div>

            {/* Grey connector line */}
            <div className="w-10 sm:w-16 h-[2px] bg-neutral-300 -mt-4" />

            {/* Step 3: Upcoming */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-neutral-300 bg-white text-neutral-500 flex items-center justify-center text-xs font-medium">
                3
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-500 mt-1 whitespace-nowrap">
                Personalize
              </span>
            </div>
          </div>
        </nav>

        {/* Right: Skip for now link */}
        <div className="flex items-center justify-end">
          <button
            id="onboarding-skip-btn"
            type="button"
            onClick={handleSkip}
            className="group flex items-center gap-1 text-xs sm:text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <span>Skip for now</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-neutral-600 group-hover:text-neutral-900" />
          </button>
        </div>
      </header>

      {/* Main Content: Title, Persona Cards, CTA - Compacted to prevent page scrolling */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-1 flex-1 flex flex-col items-center justify-center min-h-0">
        
        {/* Main Headline & Subtitle */}
        <div className="text-center max-w-xl mx-auto mb-3 sm:mb-4 shrink-0">
          <h1 className="font-serif-luma text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-tight mb-1">
            Who are you?
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm font-normal leading-relaxed">
            Help us personalize your LUMA experience. Choose the option that best describes you.
          </p>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-2 p-2 px-4 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-xs flex items-center gap-2 shadow-sm max-w-md w-full shrink-0"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Selectable Persona Cards in 3 Columns - Scaled for zero-scroll fit */}
        <div 
          role="radiogroup" 
          aria-label="Select your persona"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 w-full max-w-4xl lg:max-w-5xl mb-3 sm:mb-4 shrink-0"
        >
          {PERSONA_OPTIONS.map((option) => {
            const isSelected = selectedPersona === option.id;

            return (
              <div
                key={option.id}
                id={`persona-card-${option.id.toLowerCase()}`}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(option.id)}
                onKeyDown={(e) => handleKeyDown(e, option.id)}
                className={`group relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 lg:p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none outline-none ${
                  isSelected
                    ? 'bg-white border-2 border-[#FD6B31] shadow-[0_8px_24px_rgba(253,107,49,0.14)] ring-2 ring-[#FD6B31]/15 scale-[1.01]'
                    : 'bg-white/95 hover:bg-white border border-neutral-200/90 hover:border-orange-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-sm'
                }`}
              >
                {/* Top-Right Selection Indicator */}
                <div className="absolute top-3.5 right-3.5 z-20">
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

                {/* 3D Character Avatar with soft lighting - Scaled to fit comfortably */}
                <div className="w-full flex items-center justify-center pt-1 pb-1.5 relative">
                  <img
                    src={option.imageSrc}
                    alt={option.title}
                    className="h-24 sm:h-28 lg:h-32 w-auto max-w-[130px] sm:max-w-[145px] object-contain rounded-xl drop-shadow-xs transition-transform duration-200 group-hover:scale-103"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card Title, Description, and Tags */}
                <div className="flex-1 flex flex-col justify-between pt-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight mb-1">
                      {option.title}
                    </h3>
                    <p className="text-neutral-500 text-[11px] sm:text-xs leading-snug line-clamp-2 mb-2 sm:mb-2.5 font-normal">
                      {option.description}
                    </p>
                  </div>

                  {/* Persona Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF0E6] text-[#93522C] border border-[#F3E2D3]/60 transition-colors whitespace-nowrap"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button: Continue & Security Note */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-full max-w-xs shrink-0 mb-1">
          <button
            id="onboarding-continue-btn"
            type="button"
            disabled={!selectedPersona || submitting}
            onClick={handleContinue}
            className="w-full py-2.5 sm:py-3 px-8 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving your choice...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>

          {/* Security Note under CTA with subtle lock icon */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-500 font-normal">
            <span className="w-3.5 h-3.5 rounded bg-neutral-200/80 flex items-center justify-center text-neutral-600">
              <Lock className="w-2 h-2" />
            </span>
            <span>Your information stays private and secure.</span>
          </div>
        </div>
      </main>

      {/* Footer: Quote on Bottom-Left and Handwritten Script + Botanical Branch on Bottom-Right */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pb-2.5 pt-1 flex items-center justify-between gap-4 pointer-events-none shrink-0">
        
        {/* Bottom Left Quote */}
        <div className="flex items-start gap-2.5 max-w-xs pointer-events-auto">
          <span className="text-3xl sm:text-4xl font-serif leading-none select-none text-[#1E293B] -mt-1 font-bold">
            “
          </span>
          <div className="flex flex-col">
            <p className="text-[11px] sm:text-xs text-neutral-600 font-medium leading-snug">
              Small steps today create a brighter tomorrow. <span className="text-[#FD6B31] font-serif font-bold">”</span>
            </p>
            <span className="text-[10px] text-neutral-400 mt-0.5 font-normal tracking-wide">
              — LUMA
            </span>
          </div>
        </div>

        {/* Bottom Right: Handwritten Script & 3D Botanical Leaves Branch */}
        <div className="relative flex items-center justify-end pointer-events-auto">
          <div className="relative flex flex-col items-end text-right pr-1">
            <span className="font-script-luma text-lg sm:text-xl text-[#C25E2E] font-semibold tracking-wide select-none leading-none">
              A more mindful you awaits...
            </span>
            {/* Handwritten curved underline swoop */}
            <svg className="w-24 sm:w-28 h-2 text-[#C25E2E] mt-0.5" viewBox="0 0 140 10" fill="none">
              <path d="M4 6C35 2 95 3 136 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* 3D Botanical Leaves Branch - Compact size */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 -mr-2 -mb-2 opacity-95">
            <BotanicalBranch3D className="w-full h-full" />
          </div>
        </div>
      </footer>
    </div>
  );
};
