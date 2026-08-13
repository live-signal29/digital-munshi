import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKisaans: 0,
    tijoriIn: 0,
    tijoriOut: 0,
    totalKhataEntries: 0
  });

  const [stockSummary, setStockSummary] = useState([]);
  const [openStockDetail, setOpenStockDetail] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      // 1. Kisaans Count (sirf category = 'kisaan' wale, Zameendar exclude)
      const { data: kisaans, error: kisaanErr } = await supabase
        .from('kisaans')
        .select('id')
        .eq('category', 'kisaan');
      if (kisaanErr) console.error("Kisaan Fetch Error:", kisaanErr);

      // 2. Tijori Data
      const { data: tijori, error: tijoriErr } = await supabase.from('tijori_cash').select('*');
      if (tijoriErr) console.error("Tijori Fetch Error:", tijoriErr);

      const tIn = tijori?.filter(t => t.direction === 'in').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
      const tOut = tijori?.filter(t => t.direction === 'out').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;

      // 3. KhataBook Count
      const { data: khata, error: khataErr } = await supabase.from('khata_book').select('id');
      if (khataErr) console.error("Khata Fetch Error:", khataErr);

      // 4. Godaam Stock Data
      const { data: godaam, error: godaamErr } = await supabase.from('godaam_stock').select('*');
      if (godaamErr) console.error("Godaam Fetch Error:", godaamErr);

      // 5. Kisaan Issued Items Data
      const { data: kisaanItems, error: entriesErr } = await supabase.from('kisaan_items').select('*');
      if (entriesErr) console.error("Kisaan Items Fetch Error:", entriesErr);

      // Stock In/Out Calculations
      const itemMap = {};

      // Stock In from Godaam
      godaam?.forEach(g => {
        const name = g.item_name ? g.item_name.toString().trim() : 'Unassigned Item';
        if (!itemMap[name]) {
          itemMap[name] = { total_in: 0, issued: 0, unit: g.unit || 'Bori' };
        }
        itemMap[name].total_in += Number(g.quantity_in || 0);
      });

      // Issued Stock from Kisaan Items
      kisaanItems?.forEach(k => {
        const name = k.item_name ? k.item_name.toString().trim() : 'Unassigned Item';
        if (itemMap[name]) {
          itemMap[name].issued += Number(k.quantity || 0);
        } else {
          itemMap[name] = { total_in: 0, issued: Number(k.quantity || 0), unit: k.unit || 'Item' };
        }
      });

      // Format Summary List
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
        totalKhataEntries: khata?.length || 0
      });

      setStockSummary(summaryList);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 bg-stone-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1e3a29]">Dashboard</h1>
        <p className="text-xs text-stone-500">Aap ki zameendari ka mukammal khulasa</p>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">🌾 Total Kisaan</p>
          <p className="text-2xl font-bold font-serif text-[#1e3a29] mt-1">{stats.totalKisaans}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">💰 Tijori Safi Balance</p>
          <p className="text-xl font-bold font-serif text-emerald-700 mt-1">
            Rs {(stats.tijoriIn - stats.tijoriOut).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tijori Summary Card */}
      <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
            📦 Tijori Khulasa
          </h3>
        </div>
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

      {/* Godaam & Khaad Summary Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div 
          onClick={() => setOpenStockDetail(!openStockDetail)}
          className="flex justify-between items-center cursor-pointer select-none"
        >
          <div>
            <h3 className="font-bold text-sm text-[#1e3a29] flex items-center gap-2">
              🏬 Godaam & Khaad Stock
            </h3>
            <p className="text-[10px] text-stone-500">
              Click karke DAP, Urea, Spray ka hisab dekhein
            </p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
            {openStockDetail ? '▲ Band Karein' : '▼ Details Dekhein'}
          </span>
        </div>

        {openStockDetail && (
          <div className="pt-2 space-y-2 border-t border-stone-100 transition-all">
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
                      Baqi Stock: {item.remaining} {item.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 text-stone-600 border-t border-stone-200/60">
                    <div>
                      <span className="block text-stone-400">Total Stock Aaya</span>
                      <span className="font-bold">{item.total_in} {item.unit}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400">Kisaanon ko Diya</span>
                      <span className="font-bold text-amber-700">{item.issued} {item.unit}</span>
                    </div>
                    <div>
                      <span className="block text-stone-400">Godaam me Baqi</span>
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
