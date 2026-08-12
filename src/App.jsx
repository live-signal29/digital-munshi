
import Home from './pages/Home';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// --- HOME / DASHBOARD COMPONENT ---
function HomeDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalKisaans: 0, tijoriIn: 0, tijoriOut: 0 });
  const [stockSummary, setStockSummary] = useState([]);
  const [openStockDetail, setOpenStockDetail] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    // 1. Kisaans Count
    const { data: kisaans } = await supabase.from('kisaans').select('id');
    
    // 2. Tijori Data
    const { data: tijori } = await supabase.from('tijori_cash').select('*');
    const tIn = tijori?.filter(t => t.direction === 'in').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
    const tOut = tijori?.filter(t => t.direction === 'out').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;

    // 3. Godaam Stock Data
    const { data: godaam } = await supabase.from('godaam_stock').select('*');
    
    // 4. Kisaan Entries Data
    const { data: kisaanEntries } = await supabase.from('kisaan_entries').select('*');

    // Grouping Stock
    const itemMap = {};

    godaam?.forEach(g => {
      const name = g.item_name.trim();
      if (!itemMap[name]) itemMap[name] = { total_in: 0, issued: 0, unit: g.unit || 'Bori' };
      itemMap[name].total_in += Number(g.quantity_in || 0);
    });

    kisaanEntries?.forEach(k => {
      const name = k.item_name.trim();
      if (itemMap[name]) {
        itemMap[name].issued += Number(k.amount || 0);
      } else {
        itemMap[name] = { total_in: 0, issued: Number(k.amount || 0), unit: 'Item' };
      }
    });

    const summaryList = Object.keys(itemMap).map(itemName => ({
      name: itemName,
      total_in: itemMap[itemName].total_in,
      issued: itemMap[itemName].issued,
      remaining: itemMap[itemName].total_in - itemMap[itemName].issued,
      unit: itemMap[itemName].unit
    }));

    setStats({
      totalKisaans: kisaans?.length || 0,
      tijoriIn: tIn,
      tijoriOut: tOut,
    });

    setStockSummary(summaryList);
    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 bg-stone-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1e3a29]">Dashboard</h1>
        <p className="text-xs text-stone-500">Aap ki zameendari ka mukammal khulasa</p>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-500 uppercase">🌾 Total Kisaan</p>
          <p className="text-2xl font-bold font-serif text-[#1e3a29] mt-1">{stats.totalKisaans}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-500 uppercase">💰 Tijori Balance</p>
          <p className="text-xl font-bold font-serif text-emerald-700 mt-1">
            Rs {(stats.tijoriIn - stats.tijoriOut).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tijori Summary Card */}
      <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-2">
        <h3 className="font-bold text-xs text-amber-900">📦 Tijori Khulasa</h3>
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white p-2 rounded-xl border border-amber-100">
            <p className="text-[9px] text-stone-500">Total Daala</p>
            <p className="text-xs font-bold text-emerald-700">Rs {stats.tijoriIn.toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-amber-100">
            <p className="text-[9px] text-stone-500">Total Kharch</p>
            <p className="text-xs font-bold text-rose-600">Rs {stats.tijoriOut.toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-amber-100">
            <p className="text-[9px] text-stone-500">Baqi Safe</p>
            <p className="text-xs font-bold text-amber-800">Rs {(stats.tijoriIn - stats.tijoriOut).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Interactive Stock Breakdown Dropdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div 
          onClick={() => setOpenStockDetail(!openStockDetail)}
          className="flex justify-between items-center cursor-pointer select-none"
        >
          <div>
            <h3 className="font-bold text-sm text-[#1e3a29]">🏬 Godaam & Khaad Stock</h3>
            <p className="text-[10px] text-stone-500">Click karke DAP, Urea, Spray ka hisab dekhein</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
            {openStockDetail ? '▲ Band Karein' : '▼ Details Dekhein'}
          </span>
        </div>

        {openStockDetail && (
          <div className="pt-2 space-y-2 border-t border-stone-100">
            {loading ? (
              <p className="text-xs text-stone-400">Loading stock details...</p>
            ) : stockSummary.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-2">Godaam me koi stock entry nahi hai</p>
            ) : (
              stockSummary.map((item, idx) => (
                <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold text-stone-800">
                    <span className="text-sm">🌱 {item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${item.remaining < 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                      Baqi: {item.remaining} {item.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 text-stone-600 border-t border-stone-200/60">
                    <div>
                      <span className="block text-stone-400">Total Stock</span>
                      <span className="font-bold">{item.total_in} {item.unit}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400">Kisaan Ko Diya</span>
                      <span className="font-bold text-amber-700">{item.issued} {item.unit}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400">Baqi Stock</span>
                      <span className="font-bold text-emerald-700">{item.remaining} {item.unit}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN APP ENTRY ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      <header className="bg-[#1e3a29] text-white p-4 shadow-md sticky top-0 z-50">
        <h1 className="text-xl font-bold font-serif tracking-wide">Digital Munshi</h1>
        <p className="text-[10px] text-emerald-200">Haji Noor Kissan</p>
      </header>

      <main>
        {activeTab === 'home' && <HomeDashboard />}
        {/* Aapke doosre pages yahan load honge */}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 py-2 px-4 flex justify-around items-center shadow-lg z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-lg">🏠</span> Home
        </button>
        <button onClick={() => setActiveTab('kisaan')} className={`flex flex-col items-center text-xs ${activeTab === 'kisaan' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-lg">🚜</span> Kisaan
        </button>
        <button onClick={() => setActiveTab('godaam')} className={`flex flex-col items-center text-xs ${activeTab === 'godaam' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-lg">🏪</span> Godaam
        </button>
        <button onClick={() => setActiveTab('tijori')} className={`flex flex-col items-center text-xs ${activeTab === 'tijori' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-lg">🍱</span> Tijori
        </button>
        <button onClick={() => setActiveTab('zameendar')} className={`flex flex-col items-center text-xs ${activeTab === 'zameendar' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-lg">👤</span> Zameendar
        </button>
      </nav>
    </div>
  );
}
