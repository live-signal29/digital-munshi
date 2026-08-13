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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Kisaans Count
      const { data: kisaans, error: kisaanErr } = await supabase
        .from('kisaans')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'kisaan');
      if (kisaanErr) console.error("Kisaan Fetch Error:", kisaanErr);

      // 2. Tijori Data
      const { data: tijori, error: tijoriErr } = await supabase
        .from('tijori_cash')
        .select('*')
        .eq('user_id', user.id);
      if (tijoriErr) console.error("Tijori Fetch Error:", tijoriErr);

      const tIn = tijori?.filter(t => t.direction === 'in').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
      const tOut = tijori?.filter(t => t.direction === 'out').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;

      // 3. KhataBook Count
      const { data: khata, error: khataErr } = await supabase
        .from('khata_book')
        .select('id')
        .eq('user_id', user.id);
      if (khataErr) console.error("Khata Fetch Error:", khataErr);

      // 4. Godaam Stock Data
      const { data: godaam, error: godaamErr } = await supabase
        .from('godaam_stock')
        .select('*')
        .eq('user_id', user.id);
      if (godaamErr) console.error("Godaam Fetch Error:", godaamErr);

      // 5. Kisaan Issued Items Data
      const { data: kisaanItems, error: entriesErr } = await supabase
        .from('kisaan_items')
        .select('*')
        .eq('user_id', user.id);
      if (entriesErr) console.error("Kisaan Items Fetch Error:", entriesErr);

      // Calculate Stock Balance (In from Godaam vs Out via Kisaan Items)
      const itemMap = {};

      godaam?.forEach(g => {
        const name = g.item_name ? g.item_name.toString().trim().toUpperCase() : 'UNASSIGNED';
        if (!itemMap[name]) {
          itemMap[name] = { totalIn: 0, totalOut: 0, unit: g.unit || '' };
        }
        itemMap[name].totalIn += Number(g.quantity_in || 0);
      });

      kisaanItems?.filter(i => i.type === 'kharch').forEach(i => {
        const name = i.item_name ? i.item_name.toString().trim().toUpperCase() : 'UNASSIGNED';
        if (!itemMap[name]) {
          itemMap[name] = { totalIn: 0, totalOut: 0, unit: i.unit || '' };
        }
        itemMap[name].totalOut += Number(i.quantity || 0);
      });

      const summaryList = Object.keys(itemMap).map(key => ({
        name: key,
        unit: itemMap[key].unit,
        totalIn: itemMap[key].totalIn,
        totalOut: itemMap[key].totalOut,
        remaining: itemMap[key].totalIn - itemMap[key].totalOut
      }));

      setStats({
        totalKisaans: kisaans?.length || 0,
        tijoriIn: tIn,
        tijoriOut: tOut,
        totalKhataEntries: khata?.length || 0
      });

      setStockSummary(summaryList);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  const tijoriBalance = stats.tijoriIn - stats.tijoriOut;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-1">
        <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Overview
        </span>
        <div className="flex justify-between items-end mt-1">
          <div>
            <h2 className="text-xl font-bold font-serif">Kisan Hisab Dashboard 🌾</h2>
            <p className="text-xs text-emerald-200">Tamam Khate Aur Stock Ka Khulasa</p>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-stone-400">Loading Dashboard...</p>
      ) : (
        <>
          {/* Main Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <p className="text-[9px] font-bold text-stone-500 uppercase">Tijori Balance</p>
              <p className={`text-base font-bold ${tijoriBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                Rs {tijoriBalance.toLocaleString()}
              </p>
              <p className="text-[10px] text-stone-400">In: +{stats.tijoriIn.toLocaleString()}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <p className="text-[9px] font-bold text-stone-500 uppercase">Kul Active Kisaan</p>
              <p className="text-base font-bold text-[#1e3a29]">{stats.totalKisaans} Kisaan</p>
              <p className="text-[10px] text-stone-400">Registered Accounts</p>
            </div>
          </div>

          {/* Stock Summary Component */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-[#1e3a29]">📦 Godaam Vs Issued Stock</h3>
              <button 
                onClick={() => setOpenStockDetail(!openStockDetail)}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                {openStockDetail ? 'Chupayein' : 'Tafseel Dekhein'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {stockSummary.length === 0 ? (
                <p className="text-xs text-stone-400">Koi stock record darj nahi hai.</p>
              ) : (
                stockSummary.map((st, idx) => (
                  <div key={idx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-stone-800">{st.name}</p>
                      {openStockDetail && (
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          In: {st.totalIn} | Out: {st.totalOut} {st.unit}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${st.remaining >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {st.remaining} {st.unit}
                      </span>
                      <p className="text-[9px] text-stone-400 uppercase">Baqaya</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
