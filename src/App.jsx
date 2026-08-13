import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Navigation from './components/Navigation';
import Drawer from './components/Drawer';
import Dashboard from './pages/Dashboard';
import KisaanDetail from './pages/KisaanDetail';
import Godaam from './pages/Godaam';
import Tijori from './pages/Tijori';
import Zameendar from './pages/Zameendar';
import KhataBook from './pages/KhataBook';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKisaanId, setSelectedKisaanId] = useState(null);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Auto-restore login session on Refresh
  useEffect(() => {
    async function checkUserSession() {
      // 1. Supabase Auth Session Check
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
      } else {
        // 2. Fallback: Local Storage Check
        const savedUser = localStorage.getItem('munshi_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('munshi_user');
          }
        }
      }
      setLoading(false);
    }

    checkUserSession();

    // 3. Auth Listener for real-time changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('munshi_user', JSON.stringify(session.user));
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('munshi_user');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Handler from LandingPage
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('munshi_user', JSON.stringify(userData));
  };

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('munshi_user');
    setUser(null);
    setIsDrawerOpen(false);
    setActiveTab('home');
  };

  const handleSelectKisaan = (id) => {
    setSelectedKisaanId(id);
    setActiveTab('kisaan');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1e3a29] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#1e3a29]">Digital Munshi Load Ho Raha Hai...</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'privacy') return <PrivacyPolicy onBack={() => setActiveTab('home')} />;
  if (activeTab === 'terms') return <Terms onBack={() => setActiveTab('home')} />;

  if (!user) {
    return (
      <LandingPage 
        onLogin={handleLogin} 
        onOpenPolicy={(policy) => setActiveTab(policy)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} toggleDrawer={toggleDrawer} />
      <Drawer 
        isOpen={isDrawerOpen} 
        toggleDrawer={toggleDrawer} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main>
        {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} onSelectKisaan={handleSelectKisaan} />}
        {activeTab === 'kisaan' && <KisaanDetail kisaanId={selectedKisaanId} onBack={() => setActiveTab('zameendar')} />}
        {activeTab === 'godaam' && <Godaam />}
        {activeTab === 'tijori' && <Tijori />}
        {activeTab === 'zameendar' && <Zameendar onSelectKisaan={handleSelectKisaan} />}
        {activeTab === 'khatabook' && <KhataBook />}
      </main>
    </div>
  );
}
