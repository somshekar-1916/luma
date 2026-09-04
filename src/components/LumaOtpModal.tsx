import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, X, ExternalLink, RefreshCw } from 'lucide-react';

interface LumaOtpModalProps {
  isOpen: boolean;
  email: string;
  onVerify: (otp: string) => Promise<boolean | void> | boolean | void;
  onCheckEmailLink?: () => Promise<boolean | void>;
  onResend: () => Promise<void> | void;
  onClose: () => void;
  isLoading?: boolean;
}

export const LumaOtpModal: React.FC<LumaOtpModalProps> = ({
  isOpen,
  email,
  onVerify,
  onCheckEmailLink,
  onResend,
  onClose,
  isLoading = false,
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(45);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [checkingLink, setCheckingLink] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset and auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setInfoMsg('');
      setIsSuccess(false);
      setResendCountdown(45);
      setCanResend(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (!isOpen) return;

    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [isOpen, resendCountdown]);

  // Auto-detect if user clicks verification link in their email
  useEffect(() => {
    if (!isOpen || !onCheckEmailLink || isSuccess) return;

    const interval = setInterval(async () => {
      try {
        const verified = await onCheckEmailLink();
        if (verified) {
          setIsSuccess(true);
          setInfoMsg('Email confirmed! Welcome to LUMA.');
        }
      } catch {
        // silent check
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, onCheckEmailLink, isSuccess]);

  const handleInputChange = (index: number, value: string) => {
    setErrorMsg('');
    setInfoMsg('');

    // Handle paste of multiple characters
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setOtpDigits(newDigits);
        const nextFocusIndex = Math.min(cleaned.length, 5);
        inputRefs.current[nextFocusIndex]?.focus();
      }
      return;
    }

    // Only allow single numeric digit
    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input if digit entered, and auto-verify on 6th digit
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    const nextFocusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleResendClick = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      await onResend();
      setOtpDigits(['', '', '', '', '', '']);
      setResendCountdown(45);
      setCanResend(false);
      setInfoMsg('A fresh verification code and email link have been sent to your inbox.');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend email. Please check your network and try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckEmailLink = async () => {
    if (!onCheckEmailLink || checkingLink) return;
    setCheckingLink(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const verified = await onCheckEmailLink();
      if (verified) {
        setIsSuccess(true);
      } else {
        setInfoMsg('Email link not confirmed yet. Please click the link in your inbox or enter the 6-digit OTP code below.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification check failed. Please enter the 6-digit OTP code directly.');
    } finally {
      setCheckingLink(false);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    const enteredOtp = (typeof codeOverride === 'string' ? codeOverride : otpDigits.join('')).trim();
    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');

    try {
      const ok = await onVerify(enteredOtp);
      if (ok !== false) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Incorrect verification code. Please check your email and try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="otp-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/65 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading && !isSuccess && !checkingLink) {
            onClose();
          }
        }}
      >
        {/* Modal Container */}
        <motion.div
          id="otp-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-stone-200 text-left overflow-hidden select-none my-auto"
        >
          {/* Top Decorative Amber Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#FD6B31] to-amber-500" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-52 h-52 rounded-full bg-gradient-to-b from-[#FD6B31]/15 to-transparent blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            id="otp-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={isLoading || isSuccess || checkingLink}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close OTP Modal"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Modal Header - Clean and Simple */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center mb-3 text-[#FD6B31]">
              {isSuccess ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2]" />
              ) : (
                <Mail className="w-6 h-6 stroke-[2]" />
              )}
            </div>

            <h3 className="font-serif-luma text-xl sm:text-2xl font-normal text-[#1A1C1C] tracking-tight">
              {isSuccess ? 'Account Verified' : 'Verify Your Email'}
            </h3>

            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Enter the 6-digit confirmation code sent to <strong className="text-stone-800 font-medium">{email}</strong>
            </p>
          </div>

          {/* 6 OTP Input Boxes */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-stone-600 mb-2 text-center">
              Enter 6-digit confirmation code
            </label>
            <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading || isSuccess || checkingLink}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-semibold rounded-xl border transition-all outline-none ${
                    digit
                      ? 'border-[#FD6B31] bg-orange-50/20 text-[#1A1C1C] shadow-[0_0_8px_rgba(253,107,49,0.15)]'
                      : 'border-stone-200 bg-stone-50/50 text-stone-800 focus:border-[#FD6B31] focus:bg-white focus:ring-2 focus:ring-[#FD6B31]/20'
                  } ${errorMsg ? 'border-red-300 bg-red-50/20' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Info / Success Message */}
          {infoMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{infoMsg}</span>
            </motion.div>
          )}

          {/* Primary Action: Verify Code */}
          <button
            id="otp-verify-submit-btn"
            type="button"
            onClick={() => handleVerify()}
            disabled={isLoading || isSuccess || checkingLink || otpDigits.join('').length < 6}
            className="w-full py-3 px-4 rounded-xl bg-[#0F1011] hover:bg-black text-white text-sm font-medium transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Verifying...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified!</span>
              </>
            ) : (
              <>
                <span>Confirm & Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>

          {/* Resend Footer */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Didn't get the code?</span>
            {canResend ? (
              <button
                type="button"
                id="otp-resend-btn"
                onClick={handleResendClick}
                disabled={resending}
                className="inline-flex items-center gap-1 font-semibold text-[#FD6B31] hover:underline cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : 'Resend code'}</span>
              </button>
            ) : (
              <span className="font-mono text-stone-400">
                Resend in <strong className="text-stone-600 font-semibold">{resendCountdown}s</strong>
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
