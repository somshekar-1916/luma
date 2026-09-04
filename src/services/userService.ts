import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export type PersonaType = 'STUDENT_DEV' | 'BUSY_PRO' | 'GROWTH_SEEKER';

export interface UserProfileData {
  uid?: string;
  email?: string;
  displayName?: string;
  profile?: {
    persona?: PersonaType;
    goals?: string[];
    customGoalNote?: string | null;
    frequency?: string;
    supportTypes?: string[];
    onboardingCompleted?: boolean;
    currentStep?: number;
    updatedAt?: any;
  };
  onboardingCompleted?: boolean;
  updatedAt?: any;
}

/**
 * Strips all undefined properties from an object to ensure zero-crash Firestore writes
 */
function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => (value === undefined ? null : value)));
}

/**
 * Inspects user profile and onboarding status in Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfileData;
      return data;
    }

    // Check optional subcollection /users/{uid}/profile/main if structured as subdocument
    const profileSubRef = doc(db, 'users', uid, 'profile', 'main');
    const profileSnap = await getDoc(profileSubRef);
    if (profileSnap.exists()) {
      return {
        uid,
        profile: profileSnap.data() as any,
        onboardingCompleted: profileSnap.data()?.onboardingCompleted ?? false
      };
    }

    return null;
  } catch (error) {
    console.warn('Error inspecting user profile in Firestore:', error);
    return null;
  }
}

/**
 * Checks whether user has already completed onboarding
 */
export async function checkOnboardingCompleted(uid: string): Promise<boolean> {
  try {
    const profileData = await getUserProfile(uid);
    if (!profileData) return false;
    return !!(profileData.onboardingCompleted || profileData.profile?.onboardingCompleted);
  } catch {
    return false;
  }
}

/**
 * Atomically saves selected persona in Firestore under /users/{uid}
 * Strict parameterization, zero undefined properties, and owner-isolated path
 */
export async function savePersonaSelection(uid: string, persona: PersonaType): Promise<void> {
  if (!uid) {
    throw new Error('Unauthenticated: Missing user ID for persona update.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Authorization failure: Action restricted to the authenticated document owner.');
  }

  // Atomic update to root user document using merge
  const userRef = doc(db, 'users', uid);
  const payload = sanitizePayload({
    uid,
    email: currentUser.email || null,
    profile: {
      persona,
      currentStep: 1,
      updatedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });

  await setDoc(userRef, payload, { merge: true });

  // Also mirror in subcollection /users/{uid}/profile/main for subdocument readers
  try {
    const subRef = doc(db, 'users', uid, 'profile', 'main');
    await setDoc(subRef, sanitizePayload({
      uid,
      email: currentUser.email || null,
      persona,
      currentStep: 1,
      updatedAt: serverTimestamp()
    }), { merge: true });
  } catch (subErr) {
    console.warn('Subcollection profile mirror notice:', subErr);
  }
}

/**
 * Atomically saves selected goals and optional custom goal note in Firestore under /users/{uid}
 * Strict parameterization, zero undefined properties, and owner-isolated path
 */
export async function saveUserGoals(uid: string, goals: string[], customGoalNote?: string): Promise<void> {
  if (!uid) {
    throw new Error('Unauthenticated: Missing user ID for goals update.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Authorization failure: Action restricted to the authenticated document owner.');
  }

  // Atomic update to root user document using merge
  const userRef = doc(db, 'users', uid);
  const sanitizedNote = customGoalNote ? customGoalNote.trim().slice(0, 200) : null;
  const payload = sanitizePayload({
    uid,
    email: currentUser.email || null,
    profile: {
      goals,
      customGoalNote: sanitizedNote,
      currentStep: 2,
      updatedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });

  await setDoc(userRef, payload, { merge: true });

  // Also mirror in subcollection /users/{uid}/profile/main for subdocument readers
  try {
    const subRef = doc(db, 'users', uid, 'profile', 'main');
    await setDoc(subRef, sanitizePayload({
      uid,
      email: currentUser.email || null,
      goals,
      customGoalNote: sanitizedNote,
      currentStep: 2,
      updatedAt: serverTimestamp()
    }), { merge: true });
  } catch (subErr) {
    console.warn('Subcollection goals mirror notice:', subErr);
  }
}

/**
 * Marks onboarding as completed in Firestore
 */
export async function completeOnboarding(uid: string): Promise<void> {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const payload = sanitizePayload({
    profile: {
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    },
    onboardingCompleted: true,
    updatedAt: serverTimestamp()
  });
  await setDoc(userRef, payload, { merge: true });
}

/**
 * Atomically saves Step 3 Personalize preferences (frequency, supportTypes)
 * and finalizes onboarding completion in Cloud Firestore under /users/{uid}
 */
export async function completeUserOnboarding(
  uid: string,
  frequency: string,
  supportTypes: string[]
): Promise<void> {
  if (!uid) {
    throw new Error('Unauthenticated: Missing user ID for onboarding completion.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Authorization failure: Action restricted to the authenticated document owner.');
  }

  const userRef = doc(db, 'users', uid);
  const sanitizedFrequency = frequency ? String(frequency).trim() : 'Daily';
  const sanitizedSupport = Array.isArray(supportTypes)
    ? supportTypes.slice(0, 3).map((s) => String(s).trim())
    : [];

  const payload = sanitizePayload({
    uid,
    email: currentUser.email || null,
    profile: {
      frequency: sanitizedFrequency,
      supportTypes: sanitizedSupport,
      onboardingCompleted: true,
      currentStep: 3,
      updatedAt: serverTimestamp()
    },
    onboardingCompleted: true,
    updatedAt: serverTimestamp()
  });

  await setDoc(userRef, payload, { merge: true });

  // Mirror in subcollection /users/{uid}/profile/main for subdocument readers
  try {
    const subRef = doc(db, 'users', uid, 'profile', 'main');
    await setDoc(subRef, sanitizePayload({
      uid,
      email: currentUser.email || null,
      frequency: sanitizedFrequency,
      supportTypes: sanitizedSupport,
      onboardingCompleted: true,
      currentStep: 3,
      updatedAt: serverTimestamp()
    }), { merge: true });
  } catch (subErr) {
    console.warn('Subcollection onboarding mirror notice:', subErr);
  }
}

/**
 * Skips onboarding and marks default status
 */
export async function skipOnboarding(uid: string): Promise<void> {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const payload = sanitizePayload({
    profile: {
      onboardingCompleted: true,
      skipped: true,
      updatedAt: serverTimestamp()
    },
    onboardingCompleted: true,
    updatedAt: serverTimestamp()
  });
  await setDoc(userRef, payload, { merge: true });
}
