
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard({ setActiveTab }) {
  const [tijoriData, setTijoriData] = useState({ totalIn: 0, totalOut: 0, remaining: 0 });
  const [godaamCount, setGodaamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  async function fetchDashboardSummary() {
    setLoading(true);
    
    // Tijori Summary
    const { data: tijori } = await supabase.from('tijori_cash').select('*');
    if (tijori) {
      const totalIn = tijori.filter(t => t.direction === 'in').reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalOut = tijori.filter(t => t.direction === 'out').reduce((s, t) => s + Number(t.amount || 0), 0);
      setTijoriData({ totalIn, totalOut, remaining: totalIn - totalOut });
    }

    // Godaam Summary
    const { data: stock } = await supabase.from('godaam_stock').select('*');
    if (stock) setGodaamCount(stock.length);

    setLoading(false);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1e3a29]">Dashboard</h2>
        <p className="text-xs text-stone-600">Aap ki zameendari ka khulasa</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
            <i className="fa-solid fa-arrow-down-left"></i> KUL JAMA
          </div>
          <div className="text-xl font-bold font-serif text-stone-800">Rs {tijoriData.totalIn.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold mb-1">
            <i className="fa-solid fa-arrow-up-right"></i> KUL KHARCH
          </div>
          <div className="text-xl font-bold font-serif text-stone-800">Rs {tijoriData.totalOut.toLocaleString()}</div>
        </div>
      </div>

      {/* Tijori Summary Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-[#1e3a29] text-sm flex items-center gap-2">
            <i className="fa-solid fa-vault text-amber-700"></i> Tijori Ka Khulasa
          </span>
          <button onClick={() => setActiveTab('tijori')} className="text-xs text-emerald-800 underline font-medium">Tijori Dekhein</button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200/60">
          <div>
            <p className="text-[10px] text-stone-500">Total Daala</p>
            <p className="font-bold text-sm text-stone-800">Rs {tijoriData.totalIn.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-[10px] text-stone-500">Kul Kharch</p>
            <p class="font-bold text-sm text-rose-700">Rs {tijoriData.totalOut.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-[10px] text-stone-500">Baaqi Safe</p>
            <p class="font-bold text-sm text-emerald-800">Rs {tijoriData.remaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Godaam Summary Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-[#1e3a29] text-sm flex items-center gap-2">
            <i className="fa-solid fa-warehouse text-emerald-800"></i> Godaam Stock Summary
          </span>
          <button onClick={() => setActiveTab('godaam')} className="text-xs text-emerald-800 underline font-medium">Godaam Dekhein</button>
        </div>
        {godaamCount === 0 ? (
          <div className="text-center py-6 border border-dashed border-stone-200 rounded-lg">
            <p className="text-xs text-stone-500">Koi entry darj nahi hai</p>
          </div>
        ) : (
          <p className="text-xs text-stone-700 font-medium">Godaam me {godaamCount} items ka stock record mojood hai.</p>
        )}
      </div>
    </div>
  );
}
