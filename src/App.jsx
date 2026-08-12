import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Drawer from './components/Drawer';
import Dashboard from './pages/Dashboard';
import KisaanDetail from './pages/KisaanDetail';
import Godaam from './pages/Godaam';
import Tijori from './pages/Tijori';
import Zameendar from './pages/Zameendar';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Show Landing / Login Page if not logged in
  if (!user) {
    return <LandingPage onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} toggleDrawer={toggleDrawer} />
      <Drawer isOpen={isDrawerOpen} toggleDrawer={toggleDrawer} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'home' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'kisaan' && <KisaanDetail />}
        {activeTab === 'godaam' && <Godaam />}
        {activeTab === 'tijori' && <Tijori />}
        {activeTab === 'zameendar' && <Zameendar />}
      </main>
    </div>
  );
}
