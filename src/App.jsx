import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // Make sure Supabase client path is correct
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
  const [loading, setLoading] = useState(true); // 👈 Session check loading state
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedKisaanId, setSelectedKisaanId] = useState(null);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Auto-restore login session on Refresh
  useEffect(() => {
    // 1. Initial Load: Check saved session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Real-time Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout Functionality
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDrawerOpen(false);
    setActiveTab('home');
  };

  // Function to open specific Kisaan Detail
  const handleSelectKisaan = (id) => {
    setSelectedKisaanId(id);
    setActiveTab('kisaan');
  };

  // Show Loading Spinner while verifying session on Refresh
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

  // Policy View Before Login or Inside App
  if (activeTab === 'privacy') return <PrivacyPolicy onBack={() => setActiveTab('home')} />;
  if (activeTab === 'terms') return <Terms onBack={() => setActiveTab('home')} />;

  // Show Landing Page if not logged in
  if (!user) {
    return (
      <LandingPage 
        onLogin={(userData) => setUser(userData)} 
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
