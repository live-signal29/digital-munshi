import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// ==========================================
// 1. HOME DASHBOARD COMPONENT
// ==========================================
function HomeDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalKisaans: 0, tijoriIn: 0, tijoriOut: 0 });
  const [stockSummary, setStockSummary] = useState([]);
  const [openStockDetail, setOpenStockDetail] = useState(true);

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
    
    // 4. Kisaan Issued Entries Data
    const { data: kisaanEntries } = await supabase.from('kisaan_entries').select('*');

    // Grouping Items Breakdown
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
          <p className="text-[10px] font-bold text-stone-500 uppercase">💰 Safe Balance</p>
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

      {/* Godaam & Khaad Interactive Stock Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div 
          onClick={() => setOpenStockDetail(!openStockDetail)}
          className="flex justify-between items-center cursor-pointer select-none"
        >
          <div>
            <h3 className="font-bold text-sm text-[#1e3a29]">🏬 Godaam & Khaad Stock</h3>
            <p className="text-[10px] text-stone-500">DAP, Urea, Spray, Beej ki tafseel</p>
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
                      Baqi Stock: {item.remaining} {item.unit}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 text-stone-600 border-t border-stone-200/60">
                    <div>
                      <span className="block text-stone-400">Total Stock</span>
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

// ==========================================
// 2. GODAAM COMPONENT
// ==========================================
function GodaamView() {
  const [stock, setStock] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });

  useEffect(() => { fetchStock(); }, []);

  async function fetchStock() {
    const { data } = await supabase.from('godaam_stock').select('*').order('created_at', { ascending: false });
    setStock(data || []);
  }

  async function handleSaveStock(e) {
    e.preventDefault();
    const payload = {
      item_name: form.item_name,
      quantity_in: parseFloat(form.quantity_in),
      unit: form.unit,
      rate_per_unit: form.rate_per_unit ? parseFloat(form.rate_per_unit) : null
    };

    if (editingId) {
      await supabase.from('godaam_stock').update(payload).eq('id', editingId);
    } else {
      await supabase.from('godaam_stock').insert([payload]);
    }
    setEditingId(null);
    setForm({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });
    fetchStock();
  }

  async function handleDelete(id) {
    if (window.confirm("Delete karna chahte hain?")) {
      await supabase.from('godaam_stock').delete().eq('id', id);
      fetchStock();
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Godaam Stock 🏪</h2>
      <form onSubmit={handleSaveStock} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <input 
          type="text" 
          placeholder="Item Name (e.g. DAP / Urea / Spray)" 
          value={form.item_name} 
          onChange={e => setForm({...form, item_name: e.target.value})} 
          required 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none" 
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="number" 
            placeholder="Quantity In" 
            value={form.quantity_in} 
            onChange={e => setForm({...form, quantity_in: e.target.value})} 
            required 
            className="p-2.5 text-xs border rounded-lg focus:outline-none" 
          />
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="p-2.5 text-xs border rounded-lg bg-stone-50">
            <option>Bori</option>
            <option>Bottle</option>
            <option>Kilo</option>
            <option>Liter</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg">
          {editingId ? 'Update Stock' : '+ Add Stock In'}
        </button>
      </form>

      <div className="space-y-2">
        {stock.map(s => (
          <div key={s.id} className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-stone-800">{s.item_name}</p>
              <p className="text-stone-500">{s.quantity_in} {s.unit}</p>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-[10px] text-rose-600 font-bold">🗑️ Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. TIJORI COMPONENT
// ==========================================
function TijoriView() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ direction: 'in', amount: '', source: '' });

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    const { data } = await supabase.from('tijori_cash').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
  }

  async function handleSaveCash(e) {
    e.preventDefault();
    await supabase.from('tijori_cash').insert([{
      direction: form.direction,
      amount: parseFloat(form.amount),
      source: form.source || 'Cash Entry'
    }]);
    setForm({ direction: 'in', amount: '', source: '' });
    fetchEntries();
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Tijori Khata 🍱</h2>
      <form onSubmit={handleSaveCash} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <select value={form.direction} onChange={e => setForm({...form, direction: e.target.value})} className="w-full p-2.5 text-xs border rounded-lg bg-stone-50">
          <option value="in">Cash In (+ Safe me daala)</option>
          <option value="out">Cash Out (- Nikala / Kharch)</option>
        </select>
        <input type="number" placeholder="Amount (Rs)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full p-2.5 text-xs border rounded-lg" />
        <input type="text" placeholder="Details / Source" value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full p-2.5 text-xs border rounded-lg" />
        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg">Save Cash Entry</button>
      </form>
    </div>
  );
}

// ==========================================
// 4. ZAMEENDAR COMPONENT (With Text Box & Edit)
// ==========================================
function ZameendarView() {
  const [kisaans, setKisaans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', area: '', kharcha_type: 'Diesel', amount: '', notes: '' });

  useEffect(() => { fetchKisaans(); }, []);

  async function fetchKisaans() {
    const { data } = await supabase.from('kisaans').select('*').order('created_at', { ascending: false });
    setKisaans(data || []);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone || '',
      area: form.area || '',
      kharcha_type: form.kharcha_type,
      amount: form.amount ? parseFloat(form.amount) : 0,
      notes: form.notes || ''
    };

    if (editingId) {
      await supabase.from('kisaans').update(payload).eq('id', editingId);
    } else {
      await supabase.from('kisaans').insert([payload]);
    }
    setEditingId(null);
    setForm({ name: '', phone: '', area: '', kharcha_type: 'Diesel', amount: '', notes: '' });
    fetchKisaans();
  }

  function handleEdit(k) {
    setEditingId(k.id);
    setForm({ name: k.name || '', phone: k.phone || '', area: k.area || '', kharcha_type: k.kharcha_type || 'Diesel', amount: k.amount || '', notes: k.notes || '' });
  }

  async function handleDelete(id) {
    if (window.confirm("Delete karna chahte hain?")) {
      await supabase.from('kisaans').delete().eq('id', id);
      fetchKisaans();
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Zameendar Category 🚜</h2>
      <form onSubmit={handleSave} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <input type="text" placeholder="Zameendar Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full p-2.5 text-xs border rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.kharcha_type} onChange={e => setForm({...form, kharcha_type: e.target.value})} className="p-2.5 text-xs border rounded-lg bg-stone-50">
            <option value="Diesel">⛽ Diesel / Petrol</option>
            <option value="Tube Well">🌊 Tube Well</option>
            <option value="Tractor">🚜 Tractor</option>
            <option value="Other">📋 Other Kharcha</option>
          </select>
          <input type="number" placeholder="Amount (Rs)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="p-2.5 text-xs border rounded-lg" />
        </div>
        <textarea placeholder="📝 Extra Notes / Details text box..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="2" className="w-full p-2.5 text-xs border rounded-lg resize-none" />
        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg">
          {editingId ? 'Update Record' : '+ Save Zameendar'}
        </button>
      </form>

      <div className="space-y-2">
        {kisaans.map(k => (
          <div key={k.id} className="bg-white p-3 rounded-xl border border-stone-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="font-bold text-stone-800">{k.name}</span>
              <span className="text-rose-600 font-bold">Rs {k.amount}</span>
            </div>
            {k.notes && <p className="text-[11px] bg-stone-50 p-2 rounded text-stone-600">📝 {k.notes}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => handleEdit(k)} className="text-[10px] text-blue-600 font-bold">✏️ Edit</button>
              <button onClick={() => handleDelete(k.id)} className="text-[10px] text-rose-600 font-bold">🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN NAVIGATION & APP CONTAINER
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Top Header Menu */}
      <header className="bg-[#1e3a29] text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-serif tracking-wide">Digital Munshi</h1>
          <p className="text-[10px] text-emerald-200">Haji Noor Kissan</p>
        </div>
      </header>

      {/* Dynamic Tab Content */}
      <main>
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'kisaan' && <ZameendarView />}
        {activeTab === 'godaam' && <GodaamView />}
        {activeTab === 'tijori' && <TijoriView />}
        {activeTab === 'zameendar' && <ZameendarView />}
      </main>

      {/* Bottom Navigation Menu Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 py-2.5 px-4 flex justify-around items-center shadow-lg z-50">
        <button 
          onClick={() => setActiveTab('home')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}
        >
          <span className="text-base">🏠</span>
          Home
        </button>

        <button 
          onClick={() => setActiveTab('kisaan')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'kisaan' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}
        >
          <span className="text-base">🚜</span>
          Kisaan
        </button>

        <button 
          onClick={() => setActiveTab('godaam')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'godaam' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}
        >
          <span className="text-base">🏪</span>
          Godaam
        </button>

        <button 
          onClick={() => setActiveTab('tijori')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'tijori' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}
        >
          <span className="text-base">🍱</span>
          Tijori
        </button>

        <button 
          onClick={() => setActiveTab('zameendar')} 
          className={`flex flex-col items-center text-xs ${activeTab === 'zameendar' ? 'text-[#1e3a29] font-bold' : 'text-stone-400'}`}
        >
          <span className="text-base">👤</span>
          Zameendar
        </button>
      </nav>
    </div>
  );
}
