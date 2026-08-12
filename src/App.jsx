import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  // Auth States
  const [session, setSession] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App Navigation States
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dashboard Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalKisaans: 0, tijoriIn: 0, tijoriOut: 0 });
  const [stockSummary, setStockSummary] = useState([]);
  const [openStockDetail, setOpenStockDetail] = useState(true);

  const categories = [
    { id: 'all', label: 'Sab' },
    { id: 'khaad', label: '🌾 Khaad & Beej' },
    { id: 'spray', label: '🧪 Spray & Dawa' },
    { id: 'diesel', label: '⛽ Diesel' },
    { id: 'tractor', label: '🚜 Tractor' },
  ];

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Dashboard Data when logged in
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        alert('Account ban gaya hai! Ab aap Login kar sakte hain.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsDrawerOpen(false);
  }

  async function fetchDashboardData() {
    setLoading(true);
    const { data: kisaans } = await supabase.from('kisaans').select('id');
    const { data: tijori } = await supabase.from('tijori_cash').select('*');
    const tIn = tijori?.filter(t => t.direction === 'in').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
    const tOut = tijori?.filter(t => t.direction === 'out').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;

    const { data: godaam } = await supabase.from('godaam_stock').select('*');
    const { data: kisaanEntries } = await supabase.from('kisaan_entries').select('*');

    const itemMap = {};
    godaam?.forEach(g => {
      const name = g.item_name ? g.item_name.trim() : 'Item';
      if (!itemMap[name]) itemMap[name] = { total_in: 0, issued: 0, unit: g.unit || 'Bori' };
      itemMap[name].total_in += Number(g.quantity_in || 0);
    });

    kisaanEntries?.forEach(k => {
      const name = k.item_name ? k.item_name.trim() : 'Item';
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

  // =========================================================
  // 1. LANDING PAGE / LOGIN / REGISTER VIEW (IF NOT LOGGED IN)
  // =========================================================
  if (!session) {
    return (
      <div className="min-h-screen bg-[#1e3a29] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-1">
            <div className="w-16 h-16 bg-emerald-100 text-[#1e3a29] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2 shadow-inner">
              🌾
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1e3a29]">Digital Munshi</h1>
            <p className="text-xs text-stone-500">Haji Noor Kissan - Zameendari Manager</p>
          </div>

          {/* Form Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${!isSignUp ? 'bg-[#1e3a29] text-white shadow' : 'text-stone-500'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${isSignUp ? 'bg-[#1e3a29] text-white shadow' : 'text-stone-500'}`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="apna-email@example.com"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required
                className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#1e3a29]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required
                className="w-full p-3 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#1e3a29]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#1e3a29] hover:bg-[#162c1f] text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 mt-2"
            >
              {authLoading ? 'Please wait...' : (isSignUp ? 'New Account Banayein' : 'Dashboard Login Karein')}
            </button>
          </form>

          <p className="text-[10px] text-center text-stone-400">
            {isSignUp ? 'Pehle se account hai? Login button par click karein.' : 'Account nahi hai? Register par click karein.'}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. MAIN APP DASHBOARD (IF LOGGED IN)
  // =========================================================
  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      
      {/* Header with Drawer Button */}
      <header className="bg-[#1e3a29] text-white p-4 shadow-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="text-xl p-1 focus:outline-none"
          >
            ☰
          </button>
          <div>
            <h1 className="text-lg font-bold font-serif tracking-wide">Digital Munshi</h1>
            <p className="text-[10px] text-emerald-200">Haji Noor Kissan</p>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b border-stone-200 px-3 py-2 flex gap-2 overflow-x-auto text-xs sticky top-[57px] z-30 shadow-sm">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-[#1e3a29] text-white font-bold' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Side Menu Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/40" />

          <div className="relative w-64 bg-white min-h-full shadow-2xl p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-stone-200">
                <h2 className="text-lg font-bold text-[#1e3a29]">Digital Munshi</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="text-xl text-stone-400 font-bold">✕</button>
              </div>

              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => { setActiveTab('home'); setIsDrawerOpen(false); }} 
                  className="w-full text-left p-2.5 rounded-lg text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] font-medium"
                >
                  🏠 Dashboard (Home)
                </button>
                <button 
                  onClick={() => { setActiveTab('kisaan'); setIsDrawerOpen(false); }} 
                  className="w-full text-left p-2.5 rounded-lg text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] font-medium"
                >
                  🚜 Kisaan Khata
                </button>
                <button 
                  onClick={() => { setActiveTab('godaam'); setIsDrawerOpen(false); }} 
                  className="w-full text-left p-2.5 rounded-lg text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] font-medium"
                >
                  🏪 Godaam Stock
                </button>
                <button 
                  onClick={() => { setActiveTab('tijori'); setIsDrawerOpen(false); }} 
                  className="w-full text-left p-2.5 rounded-lg text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] font-medium"
                >
                  🍱 Tijori Safe
                </button>
                <button 
                  onClick={() => { setActiveTab('zameendar'); setIsDrawerOpen(false); }} 
                  className="w-full text-left p-2.5 rounded-lg text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#1e3a29] font-medium"
                >
                  👤 Zameendar Entry
                </button>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2">
              <p className="text-[11px] text-stone-400">User: {session.user.email}</p>
              <button 
                onClick={handleLogout}
                className="w-full py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 text-center block"
              >
                🚪 Logout Karein
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto space-y-4">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Dashboard</h2>
              <p className="text-xs text-stone-500">Zameendari khulasa</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
                <p className="text-[10px] font-bold text-stone-500 uppercase">🌾 Total Kisaan</p>
                <p className="text-2xl font-bold font-serif text-[#1e3a29] mt-1">{stats.totalKisaans}</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm">
                <p className="text-[10px] font-bold text-stone-500 uppercase">💰 Safe Balance</p>
                <p className="text-lg font-bold font-serif text-emerald-700 mt-1">
                  Rs {(stats.tijoriIn - stats.tijoriOut).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Tijori Card */}
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-2">
              <h3 className="font-bold text-xs text-amber-900">📦 Tijori Status</h3>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-xl border border-amber-100">
                  <p className="text-[9px] text-stone-500">In</p>
                  <p className="text-xs font-bold text-emerald-700">Rs {stats.tijoriIn.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-100">
                  <p className="text-[9px] text-stone-500">Out</p>
                  <p className="text-xs font-bold text-rose-600">Rs {stats.tijoriOut.toLocaleString()}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-amber-100">
                  <p className="text-[9px] text-stone-500">Baqi</p>
                  <p className="text-xs font-bold text-amber-800">Rs {(stats.tijoriIn - stats.tijoriOut).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Stock Breakdown */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div 
                onClick={() => setOpenStockDetail(!openStockDetail)}
                className="flex justify-between items-center cursor-pointer select-none"
              >
                <div>
                  <h3 className="font-bold text-sm text-[#1e3a29]">🏬 Godaam & Khaad Stock</h3>
                  <p className="text-[10px] text-stone-500">DAP, Urea, Spray Breakdown</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
                  {openStockDetail ? '▲ Hide' : '▼ View'}
                </span>
              </div>

              {openStockDetail && (
                <div className="pt-2 space-y-2 border-t border-stone-100">
                  {loading ? (
                    <p className="text-xs text-stone-400">Loading stock...</p>
                  ) : stockSummary.length === 0 ? (
                    <p className="text-xs text-stone-500 text-center py-2">Koi stock entry nahi mili</p>
                  ) : (
                    stockSummary.map((item, idx) => (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-stone-800">
                          <span className="text-sm">🌱 {item.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${item.remaining < 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                            Baqi: {item.remaining} {item.unit}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 text-stone-600 border-t border-stone-200/60">
                          <div>
                            <span className="block text-stone-400">Total In</span>
                            <span className="font-bold">{item.total_in} {item.unit}</span>
                          </div>
                          <div>
                            <span className="block text-stone-400">Issued</span>
                            <span className="font-bold text-amber-700">{item.issued} {item.unit}</span>
                          </div>
                          <div>
                            <span className="block text-stone-400">Remaining</span>
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
        )}

        {activeTab !== 'home' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-2">
            <p className="text-2xl">📋</p>
            <h3 className="font-bold text-stone-800 capitalize">{activeTab} Page</h3>
            <p className="text-xs text-stone-500">Yeh page active hai.</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 py-2.5 px-4 flex justify-around items-center shadow-lg z-40">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-base">🏠</span> Home
        </button>
        <button onClick={() => setActiveTab('kisaan')} className={`flex flex-col items-center text-xs ${activeTab === 'kisaan' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-base">🚜</span> Kisaan
        </button>
        <button onClick={() => setActiveTab('godaam')} className={`flex flex-col items-center text-xs ${activeTab === 'godaam' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-base">🏪</span> Godaam
        </button>
        <button onClick={() => setActiveTab('tijori')} className={`flex flex-col items-center text-xs ${activeTab === 'tijori' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-base">🍱</span> Tijori
        </button>
        <button onClick={() => setActiveTab('zameendar')} className={`flex flex-col items-center text-xs ${activeTab === 'zameendar' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}>
          <span className="text-base">👤</span> Zameendar
        </button>
      </nav>

    </div>
  );
}
