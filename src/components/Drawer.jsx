
import React from 'react';

export default function Drawer({ isOpen, toggleDrawer, setActiveTab }) {
  if (!isOpen) return null;

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    toggleDrawer();
  };

  return (
    <div class="fixed inset-0 z-50 flex">
      <div class="fixed inset-0 bg-black/50" onClick={toggleDrawer}></div>
      <div class="relative bg-[#1e3a29] text-white w-72 max-w-[80%] h-full p-5 overflow-y-auto z-10 shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center pb-4 border-b border-emerald-800 mb-4">
            <div>
              <h2 class="font-serif font-bold text-xl">Digital Munshi</h2>
              <p class="text-xs text-emerald-300">Haji Noor Kissan</p>
            </div>
            <button onClick={toggleDrawer} class="text-white text-xl">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <nav class="space-y-1 text-sm">
            <button onClick={() => handleMenuClick('home')} class="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-amber-300">
              <span class="flex items-center gap-3"><i class="fa-solid fa-gauge w-5"></i> Dashboard</span>
              <span class="text-xs opacity-75">ڈیش بورڈ</span>
            </button>
            <button onClick={() => handleMenuClick('kisaan')} class="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span class="flex items-center gap-3"><i class="fa-solid fa-tractor w-5"></i> Kisaan</span>
              <span class="text-xs opacity-75">کسان</span>
            </button>
            <button onClick={() => handleMenuClick('godaam')} class="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span class="flex items-center gap-3"><i class="fa-solid fa-warehouse w-5"></i> Godaam</span>
              <span class="text-xs opacity-75">گودام</span>
            </button>
            <button onClick={() => handleMenuClick('tijori')} class="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span class="flex items-center gap-3"><i class="fa-solid fa-vault w-5"></i> Tijori</span>
              <span class="text-xs opacity-75">تجوری</span>
            </button>
            <button onClick={() => handleMenuClick('zameendar')} class="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-800 text-emerald-100">
              <span class="flex items-center gap-3"><i class="fa-solid fa-user-tie w-5"></i> Zameendar</span>
              <span class="text-xs opacity-75">زمیندار</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
