
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Godaam() {
  const [stock, setStock] = useState([]);
  const [form, setForm] = useState({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });

  useEffect(() => { fetchStock(); }, []);

  async function fetchStock() {
    const { data } = await supabase.from('godaam_stock').select('*');
    setStock(data || []);
  }

  async function handleAddStock(e) {
    e.preventDefault();
    await supabase.from('godaam_stock').insert([{
      item_name: form.item_name, quantity_in: parseFloat(form.quantity_in),
      unit: form.unit, rate_per_unit: form.rate_per_unit ? parseFloat(form.rate_per_unit) : null
    }]);
    setForm({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });
    fetchStock();
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Godaam Stock</h2>

      <form onSubmit={handleAddStock} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <h3 className="font-bold text-xs text-[#1e3a29]">Add New Stock In</h3>
        <input type="text" placeholder="Item Name (e.g. DAP)" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} required className="w-full p-2 text-xs border rounded" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Quantity In" value={form.quantity_in} onChange={e => setForm({...form, quantity_in: e.target.value})} required className="p-2 text-xs border rounded" />
          <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="p-2 text-xs border rounded bg-stone-50">
            <option>Bori</option><option>Kilo</option><option>Botal</option><option>Adad</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 bg-[#1e3a29] text-white text-xs font-bold rounded shadow">+ Add Stock</button>
      </form>

      {stock.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl bg-white"><p className="text-xs text-stone-500">Koi entry darj nahi hai</p></div>
      ) : (
        stock.map(s => (
          <div key={s.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
            <div><p className="font-bold">{s.item_name}</p><p className="text-stone-500">Aaya: {s.quantity_in} {s.unit}</p></div>
          </div>
        ))
      )}
    </div>
  );
}
