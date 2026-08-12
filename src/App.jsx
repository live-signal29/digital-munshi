import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Drawer from './components/Drawer';
import Dashboard from './pages/Dashboard';
import KisaanDetail from './pages/KisaanDetail';
import Godaam from './pages/Godaam';
import Tijori from './pages/Tijori';
import Zameendar from './pages/Zameendar';
import KhataBook from './pages/KhataBook'; // 👈 Added KhataBook
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

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
        onLogout={() => { setUser(null); setIsDrawerOpen(false); }} 
      />

      <main>
        {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'kisaan' && <KisaanDetail />}
        {activeTab === 'godaam' && <Godaam />}
        {activeTab === 'tijori' && <Tijori />}
        {activeTab === 'zameendar' && <Zameendar />}
        {activeTab === 'khatabook' && <KhataBook />} {/* 👈 Added KhataBook Screen */}
      </main>
    </div>
  );
}
