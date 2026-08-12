
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function KisaanDetail({ partyId = "kisaan-1" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ item_type: 'kharch', item_name: '', quantity: '', unit: 'Bori', rate_per_unit: '', notes: '' });

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from('kisaan_items').select('*').eq('party_id', partyId).order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const qty = parseFloat(form.quantity) || 0;
    const rate = form.rate_per_unit ? parseFloat(form.rate_per_unit) : null;
    const total = rate ? qty * rate : 0;

    await supabase.from('kisaan_items').insert([{
      party_id: partyId, item_type: form.item_type, item_name: form.item_name,
      quantity: qty, unit: form.unit, rate_per_unit: rate, total_amount: total, notes: form.notes
    }]);

    setForm({ item_type: 'kharch', item_name: '', quantity: '', unit: 'Bori', rate_per_unit: '', notes: '' });
    fetchItems();
  }

  const grandTotalKharch = items.filter(i => i.item_type === 'kharch').reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-[#1e3a29] text-white p-4 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">Active Farmer</span>
          <h2 className="text-xl font-bold mt-1">Kisaan Akbar</h2>
          <p className="text-xs text-emerald-200">Zameen: 25 Acre</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-200">Kul Kharch Balance</span>
          <p className="text-xl font-bold font-serif text-amber-300">Rs {grandTotalKharch.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <h3 className="font-bold text-xs text-[#1e3a29]">Nayi Item Entry</h3>
        <select value={form.item_type} onChange={e => setForm({...form, item_type: e.target.value})} className="w-full p-2 text-xs border rounded bg-stone-50">
          <option value="kharch">Kharch (DAP, Spray, Beej, Guard)</option>
          <option value="paidawar">Paidawar (Rice Crop Yield)</option>
          <option value="tractor">Tractor (Hal / Bijai)</option>
          <option value="qarz_jins">Qarz Jins (Udhaar Jins)</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Item Name" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required className="p-2 text-xs border rounded" />
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="p-2 text-xs border rounded bg-stone-50">
            <option>Bori</option><option>Kilo</option><option>Botal</option><option>Maund</option><option>Ghanta</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required className="p-2 text-xs border rounded" />
          <input type="number" placeholder="Rate/Unit (Optional)" value={form.rate_per_unit} onChange={e => setForm({...form, rate_per_unit: e.target.value})} className="p-2 text-xs border rounded" />
        </div>
        <button type="submit" className="w-full py-2 bg-[#1e3a29] text-white text-xs font-bold rounded shadow">Save Entry</button>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Item-wise Summary</h3>
        {loading ? <p className="text-xs text-stone-400">Loading...</p> : items.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-xl bg-white"><p className="text-xs text-stone-500">Koi entry darj nahi hai</p></div>
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
