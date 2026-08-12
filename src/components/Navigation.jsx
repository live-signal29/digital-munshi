import React from 'react';

export default function Navigation({ activeTab, setActiveTab, toggleDrawer }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'kisaan', label: 'Kisaan', icon: '🚜' },
    { id: 'godaam', label: 'Godaam', icon: '🏪' },
    { id: 'tijori', label: 'Tijori', icon: '🔒' },
    { id: 'khatabook', label: 'Khata Book', icon: '📚' }, // 👈 Added Khata Book
    { id: 'zameendar', label: 'Zameendar', icon: '👤' },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="bg-[#1e3a29] text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={toggleDrawer} className="text-xl p-1 focus:outline-none">
            ☰
          </button>
          <div>
            <h1 className="font-serif font-bold text-base leading-none">Digital Munshi</h1>
            <span className="text-[10px] text-emerald-200 font-medium">Haji Noor Kissan</span>
          </div>
        </div>
        <div className="bg-emerald-800/60 text-emerald-100 text-xs px-2.5 py-1 rounded-full border border-emerald-700/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Online</span>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-2 py-2 z-40 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition-all ${
                  isActive ? 'text-[#1e3a29] font-bold scale-105' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="text-[9px] mt-1 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
