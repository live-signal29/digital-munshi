
import React from 'react';

export default function Navigation({ activeTab, setActiveTab, toggleDrawer }) {
  return (
    <>
      {/* TOP HEADER */}
      <header class="bg-[#1e3a29] text-white p-4 sticky top-0 z-40 shadow-md flex justify-between items-center">
        <div class="flex items-center gap-3">
          <button onClick={toggleDrawer} class="text-xl p-1">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div>
            <h1 class="font-serif font-bold text-lg leading-tight">Digital Munshi</h1>
            <p class="text-xs text-emerald-200">Haji Noor Kissan</p>
          </div>
        </div>
      </header>

      {/* BOTTOM NAVIGATION BAR */}
      <nav class="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 z-40 flex justify-around p-2 text-center text-xs">
        <button 
          onClick={() => setActiveTab('home')} 
          class={`nav-btn ${activeTab === 'home' ? 'text-emerald-900 font-bold' : 'text-stone-500'}`}
        >
          <i class="fa-solid fa-house text-base block mb-0.5"></i> Home
        </button>

        <button 
          onClick={() => setActiveTab('kisaan')} 
          class={`nav-btn ${activeTab === 'kisaan' ? 'text-emerald-900 font-bold' : 'text-stone-500'}`}
        >
          <i class="fa-solid fa-tractor text-base block mb-0.5"></i> Kisaan
        </button>

        <button 
          onClick={() => setActiveTab('godaam')} 
          class={`nav-btn ${activeTab === 'godaam' ? 'text-emerald-900 font-bold' : 'text-stone-500'}`}
        >
          <i class="fa-solid fa-warehouse text-base block mb-0.5"></i> Godaam
        </button>

        <button 
          onClick={() => setActiveTab('tijori')} 
          class={`nav-btn ${activeTab === 'tijori' ? 'text-emerald-900 font-bold' : 'text-stone-500'}`}
        >
          <i class="fa-solid fa-vault text-base block mb-0.5"></i> Tijori
        </button>

        <button 
          onClick={() => setActiveTab('zameendar')} 
          class={`nav-btn ${activeTab === 'zameendar' ? 'text-emerald-900 font-bold' : 'text-stone-500'}`}
        >
          <i class="fa-solid fa-user-tie text-base block mb-0.5"></i> Zameendar
        </button>
      </nav>
    </>
  );
}
