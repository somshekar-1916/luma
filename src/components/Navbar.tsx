import React, { useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from '../lib/firebase';
import { Layers, Shield, Database, Cpu, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dbStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, dbStatus }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoadingAuth(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Auth error:", err);
      alert("Authentication pop-up failed or was cancelled. Please check Firebase configuration.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">MERN + Firebase Workspace</h1>
              <p className="text-xs text-stone-500 font-medium">Enterprise Full-Stack Architecture</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 bg-stone-100 p-1 rounded-xl">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'tasks', label: 'MongoDB Tasks' },
              { id: 'chat', label: 'Real-Time Sync' },
              { id: 'ai', label: 'Gemini Architect' },
              { id: 'guide', label: 'Architecture & Deploy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Status & Auth */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{dbStatus}</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-stone-200">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-stone-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-stone-800 truncate max-w-[120px]">{user.displayName || user.email}</p>
                    <p className="text-[10px] text-emerald-600 font-medium">Firebase Auth Active</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={loadingAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>{loadingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex overflow-x-auto space-x-1 p-2 bg-stone-100 border-t border-stone-200">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'chat', label: 'Real-Time' },
          { id: 'ai', label: 'AI' },
          { id: 'guide', label: 'Guide & Deploy' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
