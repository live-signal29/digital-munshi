import React from 'react';

export default function Drawer({ isOpen, toggleDrawer, setActiveTab, onLogout }) {
  if (!isOpen) return null;

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    toggleDrawer();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={toggleDrawer}></div>
      <div className="relative bg-[#1e3a29] text-white w-72 max-w-[80%] h-full p-5 overflow-y-auto z-10 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-emerald-800 mb-4">
            <div>
              <h2 className="font-serif font-bold text-xl">Digital Munshi</h2>
              <p className="text-xs text-emerald-300">Haji Noor Kissan</p>
            </div>
            <button onClick={toggleDrawer} className="text-white text-xl">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <nav className="space-y-1 text-sm">
            <button onClick={() => handleMenuClick('home')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-amber-300">
              <span className="flex items-center gap-3"><i className="fa-solid fa-gauge w-5"></i> Dashboard</span>
            </button>
            <button onClick={() => handleMenuClick('kisaan')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span className="flex items-center gap-3"><i className="fa-solid fa-tractor w-5"></i> Kisaan</span>
            </button>
            <button onClick={() => handleMenuClick('godaam')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span className="flex items-center gap-3"><i className="fa-solid fa-warehouse w-5"></i> Godaam</span>
            </button>
            <button onClick={() => handleMenuClick('tijori')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span className="flex items-center gap-3"><i className="fa-solid fa-vault w-5"></i> Tijori</span>
            </button>
            <button onClick={() => handleMenuClick('zameendar')} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span className="flex items-center gap-3"><i className="fa-solid fa-user-tie w-5"></i> Zameendar</span>
            </button>
          </nav>

          <div className="mt-8 pt-4 border-t border-emerald-800/80 space-y-1 text-xs">
            <button onClick={() => handleMenuClick('privacy')} className="w-full text-left p-2 text-emerald-300 hover:text-white block">
              🔒 Privacy Policy
            </button>
            <button onClick={() => handleMenuClick('terms')} className="w-full text-left p-2 text-emerald-300 hover:text-white block">
              📜 Terms of Service
            </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full mt-6 bg-rose-700/80 hover:bg-rose-700 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    </div>
  );
}
