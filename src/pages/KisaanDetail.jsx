import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function KisaanDetail() {
  const [kisaans, setKisaans] = useState([]);
  const [selectedKisaan, setSelectedKisaan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Kisaan Modal State
  const [showAddKisaan, setShowAddKisaan] = useState(false);
  const [newKisaan, setNewKisaan] = useState({ name: '', acres: '', phone: '' });

  // Entry Form State
  const [form, setForm] = useState({ item_type: 'kharch', item_name: '', quantity: '', unit: 'Bori', rate_per_unit: '', notes: '' });

  useEffect(() => {
    fetchKisaans();
  }, []);

  useEffect(() => {
    if (selectedKisaan) {
      fetchItems(selectedKisaan.id);
    }
  }, [selectedKisaan]);

  async function fetchKisaans() {
    const { data, error } = await supabase.from('kisaans').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setKisaans(data);
      if (!selectedKisaan) setSelectedKisaan(data[0]);
    }
  }

  async function fetchItems(kisaanId) {
    setLoading(true);
    const { data } = await supabase.from('kisaan_items').select('*').eq('kisaan_id', kisaanId).order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleCreateKisaan(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('kisaans').insert([{
      name: newKisaan.name,
      acres: parseFloat(newKisaan.acres || 0),
      phone: newKisaan.phone
    }]).select();

    if (!error && data) {
      setNewKisaan({ name: '', acres: '', phone: '' });
      setShowAddKisaan(false);
      fetchKisaans();
      setSelectedKisaan(data[0]);
    } else {
      alert("Error adding Kisaan: " + error?.message);
    }
  }

  async function handleSubmitItem(e) {
    e.preventDefault();
    if (!selectedKisaan) return alert("Pehle Kisaan select/add karein");

    const qty = parseFloat(form.quantity) || 0;
    const rate = form.rate_per_unit ? parseFloat(form.rate_per_unit) : null;
    const total = rate ? qty * rate : 0;

    const { error } = await supabase.from('kisaan_items').insert([{
      kisaan_id: selectedKisaan.id,
      item_type: form.item_type,
      item_name: form.item_name,
      quantity: qty,
      unit: form.unit,
      rate_per_unit: rate,
      total_amount: total,
      notes: form.notes
    }]);

    if (!error) {
      setForm({ item_type: 'kharch', item_name: '', quantity: '', unit: 'Bori', rate_per_unit: '', notes: '' });
      fetchItems(selectedKisaan.id);
    } else {
      alert("Error adding item: " + error.message);
    }
  }

  const grandTotalKharch = items.filter(i => i.item_type === 'kharch').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Kisaan Selector Header */}
      <div className="flex justify-between items-center">
        <select 
          value={selectedKisaan?.id || ''} 
          onChange={(e) => setSelectedKisaan(kisaans.find(k => k.id === e.target.value))}
          className="p-2 border border-stone-300 rounded-lg text-xs font-bold text-[#1e3a29] bg-white shadow-sm flex-1 mr-2"
        >
          {kisaans.length === 0 && <option value="">Koi Kisaan Nahi Hai</option>}
          {kisaans.map(k => <option key={k.id} value={k.id}>{k.name} ({k.acres} Acre)</option>)}
        </select>
        <button 
          onClick={() => setShowAddKisaan(true)} 
          className="bg-[#1e3a29] text-white text-xs px-3 py-2 rounded-lg font-bold shadow-sm whitespace-nowrap"
        >
          + Naya Kisaan
        </button>
      </div>

      {/* Selected Kisaan Card */}
      {selectedKisaan && (
        <div className="bg-[#1e3a29] text-white p-4 rounded-xl shadow-md flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">Active Kashtkaar</span>
            <h2 className="text-xl font-bold mt-1">{selectedKisaan.name}</h2>
            <p className="text-xs text-emerald-200">Zameen: {selectedKisaan.acres} Acre</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200">Kul Kharch Balance</span>
            <p className="text-xl font-bold font-serif text-amber-300">Rs {grandTotalKharch.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Modal: Add New Kisaan */}
      {showAddKisaan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateKisaan} className="bg-white p-5 rounded-xl border w-full max-w-xs space-y-3 shadow-xl">
            <h3 className="font-bold text-sm text-[#1e3a29]">Naya Kisaan Add Karein</h3>
            <input type="text" placeholder="Kisaan Ka Naam" value={newKisaan.name} onChange={e => setNewKisaan({...newKisaan, name: e.target.value})} required className="w-full p-2 text-xs border rounded" />
            <input type="number" placeholder="Kul Zameen (Acres)" value={newKisaan.acres} onChange={e => setNewKisaan({...newKisaan, acres: e.target.value})} className="w-full p-2 text-xs border rounded" />
            <input type="text" placeholder="Phone Number" value={newKisaan.phone} onChange={e => setNewKisaan({...newKisaan, phone: e.target.value})} className="w-full p-2 text-xs border rounded" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#1e3a29] text-white py-2 text-xs font-bold rounded">Save Kisaan</button>
              <button type="button" onClick={() => setShowAddKisaan(false)} className="flex-1 bg-stone-200 text-stone-700 py-2 text-xs font-bold rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Item Entry Form */}
      <form onSubmit={handleSubmitItem} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <h3 className="font-bold text-xs text-[#1e3a29]">Nayi Entry Add Karein</h3>
        <select value={form.item_type} onChange={e => setForm({...form, item_type: e.target.value})} className="w-full p-2 text-xs border rounded bg-stone-50">
          <option value="kharch">Kharch (DAP, Spray, Beej)</option>
          <option value="paidawar">Paidawar (Crop Yield)</option>
          <option value="tractor">Tractor (Hal / Bijai)</option>
          <option value="qarz_jins">Qarz Jins (Udhaar)</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Item Name (e.g DAP)" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required className="p-2 text-xs border rounded" />
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="p-2 text-xs border rounded bg-stone-50">
            <option>Bori</option><option>Kilo</option><option>Botal</option><option>Maund</option><option>Ghanta</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required className="p-2 text-xs border rounded" />
          <input type="number" placeholder="Rate/Unit" value={form.rate_per_unit} onChange={e => setForm({...form, rate_per_unit: e.target.value})} className="p-2 text-xs border rounded" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded shadow">Record Entry Save Karein</button>
      </form>

      {/* Ledger List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Khata Entries</h3>
        {loading ? <p className="text-xs text-stone-400">Loading...</p> : items.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-xl bg-white"><p className="text-xs text-stone-500">Is kisaan ka koi record nahi hai</p></div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-stone-800">{item.item_name}</p>
                <p className="text-stone-500">{item.quantity} {item.unit} {item.rate_per_unit ? `× Rs ${item.rate_per_unit}` : ''}</p>
              </div>
              <p className="font-bold text-[#1e3a29]">{item.total_amount ? `Rs ${item.total_amount.toLocaleString()}` : `${item.quantity} ${item.unit}`}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
