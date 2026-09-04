import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LumaSplashScreenProps {
  onComplete: () => void;
}

export const LumaSplashScreen: React.FC<LumaSplashScreenProps> = ({ onComplete }) => {
  const [skipRequested, setSkipRequested] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setSkipRequested(true);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-[#FAF8F5] text-[#1A1C1C] select-none cursor-pointer"
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      {/* Background Layer: Silky luminous glass ribbons and golden light streams */}
      <div 
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url('/luma-splash-bg.jpg'), url('/luma-login-bg.jpg')` }}
      />

      {/* Luminous ambient overlay: Warm pearl white center glow fading into edges */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75)_0%,rgba(248,244,238,0.45)_55%,rgba(238,231,221,0.25)_100%)]" />

      {/* Top-Right Status: "Starting Luma... 🟠" */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute top-6 right-7 sm:top-8 sm:right-10 z-30 flex items-center space-x-2 text-xs font-normal text-stone-600 tracking-wide select-none"
      >
        <span>Starting Luma...</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD6B31] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FD6B31] shadow-[0_0_8px_#FD6B31]"></span>
        </span>
      </motion.div>

      {/* Centerpiece Halo: Large delicate luminous circular light ring */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Large outer circular ring with amber light edge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute w-[460px] h-[460px] sm:w-[580px] sm:h-[580px] lg:w-[650px] lg:h-[650px] rounded-full border border-amber-200/50 shadow-[0_0_60px_rgba(253,107,49,0.06)]"
        />

        {/* Soft inner radial illumination */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.45, scale: 1.05 }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.15 }}
          className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tr from-amber-100/40 via-orange-50/20 to-transparent blur-2xl"
        />

        {/* Tiny floating golden star/dot on the upper-right of the circular ring */}
        <motion.div
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-[22%] right-[18%] sm:right-[20%] w-2 h-2 rounded-full bg-[#FD6B31] shadow-[0_0_8px_#FD6B31]"
        />
      </div>

      {/* Floating Glass Spheres with Rings (matching the reference image left & right) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
        {/* Left floating orb with glass ring */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute left-[5%] sm:left-[8%] lg:left-[11%] top-[45%] -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-full border border-orange-200/60 flex items-center justify-center p-2 backdrop-blur-[1px] shadow-[0_0_24px_rgba(253,107,49,0.12)]">
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-gradient-to-br from-[#FD6B31] via-[#F46427] to-[#D94E18] shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.25),0_0_15px_rgba(253,107,49,0.45)]" />
          </div>
        </motion.div>

        {/* Right floating orb with delicate glass ring */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute right-[5%] sm:right-[8%] lg:right-[11%] top-[48%] -translate-y-1/2 flex items-center justify-center"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border border-orange-200/50 flex items-center justify-center p-1 backdrop-blur-[1px]">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 rounded-full bg-gradient-to-br from-[#FD6B31]/80 to-amber-200 shadow-[0_0_10px_rgba(253,107,49,0.35)]" />
          </div>
        </motion.div>
      </div>

      {/* Main Center Content: Brand Lockup, Tagline, & Description */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto w-full pt-10 sm:pt-6">
        
        {/* Logo Emblem with 4-Point Golden Star Accent */}
        <div className="relative mb-2 sm:mb-3 flex flex-col items-center justify-center">
          {/* Subtle warm orange glow halo directly behind emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.1, 0.95] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.2 }}
            className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-gradient-to-tr from-[#FD6B31]/30 via-[#FFB000]/20 to-transparent blur-2xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* The iconic LUMA emblem */}
            <img
              src="/luma-emblem.png"
              alt="LUMA Emblem"
              className="h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-sm select-none"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to luma-logo.png if emblem is not found
                e.currentTarget.src = '/luma-logo.png';
              }}
            />

            {/* Glowing 4-pointed golden sparkle star accent at top-right corner */}
            <motion.div
              animate={{ opacity: [0.75, 1, 0.75], scale: [0.95, 1.18, 0.95] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-[#FD6B31]"
            >
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_0_10px_rgba(253,107,49,0.9)]" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* LUMA Wordmark: High-contrast serif typography with generous tracking */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative flex items-center justify-center"
        >
          <h1 className="font-serif-luma text-4xl sm:text-5xl md:text-6xl font-normal text-[#1A1C1C] tracking-[0.22em] select-none pl-3">
            LUMA
          </h1>
        </motion.div>

        {/* Small Golden Diamond Star Accent below LUMA wordmark */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="my-3 sm:my-3.5 flex items-center justify-center"
        >
          <svg 
            className="w-3.5 h-3.5 text-[#FD6B31] drop-shadow-[0_0_8px_rgba(253,107,49,0.8)]" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>

        {/* Three-Line Tagline in Caslon Serif */}
        <div className="space-y-0.5 text-center font-serif-luma text-lg sm:text-[21px] text-[#1A1C1C] leading-snug">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            Capture today.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            Understand tomorrow.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="text-[#FD6B31] font-normal"
          >
            Grow every day.
          </motion.div>
        </div>

        {/* Supporting description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-3 sm:mt-3.5 text-center text-xs sm:text-[13px] text-stone-500 font-normal leading-relaxed max-w-sm mx-auto"
        >
          <p>Your private AI journaling companion</p>
          <p>that listens, understands, and helps you grow.</p>
        </motion.div>
      </div>

      {/* Lower Section: Glowing Arc Spinner & Loading Prompt resting above glass waves */}
      <div className="relative w-full pb-8 sm:pb-10 pt-2 flex flex-col items-center justify-end z-20 overflow-hidden">
        
        {/* Loading Indicator Near Bottom Center */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="relative z-30 flex flex-col items-center space-y-2.5"
        >
          {/* Smooth Glowing Orange Arc Progress Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Ambient amber glow behind spinner */}
            <div className="absolute inset-0 rounded-full bg-orange-400/20 blur-md pointer-events-none" />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              className="w-11 h-11"
            >
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                {/* Faint subtle background track */}
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  fill="none"
                  stroke="rgba(253, 107, 49, 0.15)"
                  strokeWidth="3"
                />
                {/* Glowing active orange gradient arc */}
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  fill="none"
                  stroke="url(#lumaSpinnerGradient)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray="60 110"
                />
                <defs>
                  <linearGradient id="lumaSpinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FD6B31" />
                    <stop offset="100%" stopColor="#FFA24C" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

          <div className="text-center space-y-0.5">
            <p className="text-xs sm:text-[13px] font-medium text-stone-800 tracking-wide">
              Loading your space...
            </p>
            <p className="text-[11px] sm:text-xs text-stone-400 font-normal">
              Please wait a moment
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

