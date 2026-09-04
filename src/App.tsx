import React, { useState, useEffect } from 'react';
import { LumaSplashScreen } from './components/LumaSplashScreen';
import { LumaLogin } from './components/LumaLogin';
import { LumaRegister } from './components/LumaRegister';
import { Dashboard } from './components/Dashboard';
import { LumaDashboard } from './components/LumaDashboard';
import { Step1AboutYou } from './components/onboarding/Step1AboutYou';
import { Step2YourGoals } from './components/onboarding/Step2YourGoals';
import { Step3Personalize } from './components/onboarding/Step3Personalize';
import { PersonaType, checkOnboardingCompleted } from './services/userService';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export type AppStep = 'splash' | 'login' | 'register' | 'onboarding-step-1' | 'onboarding-step-2' | 'onboarding-step-3' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<AppStep>('splash');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);

  // Monitor auth state on startup to restore sessions and inspect onboarding status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setStep((currentStep) => {
          if (
            currentStep === 'onboarding-step-1' || 
            currentStep === 'onboarding-step-2' || 
            currentStep === 'onboarding-step-3' || 
            currentStep === 'dashboard'
          ) {
            return 'login';
          }
          return currentStep;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSplashComplete = async () => {
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
      const completed = await checkOnboardingCompleted(auth.currentUser.uid);
      if (completed) {
        setStep('dashboard');
      } else {
        setStep('onboarding-step-1');
      }
    } else {
      setStep('login');
    }
  };

  const handleAuthSuccess = async (user: any, isNewRegistration = false) => {
    setCurrentUser(user);
    if (isNewRegistration) {
      // New user right after registration and OTP verification: display Step 1 Onboarding
      setStep('onboarding-step-1');
      return;
    }

    try {
      const completed = await checkOnboardingCompleted(user.uid);
      if (completed) {
        setStep('dashboard');
      } else {
        setStep('onboarding-step-1');
      }
    } catch {
      setStep('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPersona(null);
    setStep('login');
  };

  return (
    <>
      {step === 'splash' && (
        <LumaSplashScreen onComplete={handleSplashComplete} />
      )}

      {step === 'login' && (
        <LumaLogin
          onLoginSuccess={(user) => handleAuthSuccess(user, false)}
          onNavigateToRegister={() => setStep('register')}
        />
      )}

      {step === 'register' && (
        <LumaRegister
          onRegisterSuccess={(user) => handleAuthSuccess(user, true)}
          onNavigateToLogin={() => setStep('login')}
        />
      )}

      {step === 'onboarding-step-1' && (
        <Step1AboutYou
          onNextStep={(persona) => {
            setSelectedPersona(persona);
            setStep('onboarding-step-2');
          }}
          onSkip={() => setStep('dashboard')}
          onRedirectToLogin={() => setStep('login')}
          onRedirectToDashboard={() => setStep('dashboard')}
        />
      )}

      {step === 'onboarding-step-2' && (
        <Step2YourGoals
          selectedPersona={selectedPersona}
          onPrevStep={() => setStep('onboarding-step-1')}
          onSkip={() => setStep('dashboard')}
          onComplete={() => setStep('onboarding-step-3')}
        />
      )}

      {step === 'onboarding-step-3' && (
        <Step3Personalize
          selectedPersona={selectedPersona}
          onPrevStep={() => setStep('onboarding-step-2')}
          onSkip={() => setStep('dashboard')}
          onComplete={() => setStep('dashboard')}
        />
      )}

      {step === 'dashboard' && (
        <Dashboard
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
