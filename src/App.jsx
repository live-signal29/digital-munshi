
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Drawer from './components/Drawer';
import Dashboard from './pages/Dashboard';
import KisaanDetail from './pages/KisaanDetail';
import Godaam from './pages/Godaam';
import Tijori from './pages/Tijori';
import Zameendar from './pages/Zameendar';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

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
