import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Godaam() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });

  useEffect(() => { fetchStock(); }, []);

  async function fetchStock() {
    setLoading(true);
    const { data, error } = await supabase.from('godaam_stock').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching stock:", error);
    setStock(data || []);
    setLoading(false);
  }

  async function handleSaveStock(e) {
    e.preventDefault();
    if (!form.item_name || !form.quantity_in) return alert("Item Name aur Quantity likhna zaroori hai");

    const payload = {
      item_name: form.item_name,
      quantity_in: parseFloat(form.quantity_in),
      unit: form.unit,
      rate_per_unit: form.rate_per_unit ? parseFloat(form.rate_per_unit) : null
    };

    if (editingId) {
      // Edit Stock Entry
      const { error } = await supabase.from('godaam_stock').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchStock();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      // Add New Stock Entry
      const { error } = await supabase.from('godaam_stock').insert([payload]);
      if (!error) {
        resetForm();
        fetchStock();
      } else {
        alert("Error adding: " + error.message);
      }
    }
  }

  function resetForm() {
    setForm({ item_name: '', quantity_in: '', unit: 'Bori', rate_per_unit: '' });
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      item_name: item.item_name,
      quantity_in: item.quantity_in,
      unit: item.unit || 'Bori',
      rate_per_unit: item.rate_per_unit || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is stock entry ko delete karna chahte hain?")) {
      const { error } = await supabase.from('godaam_stock').delete().eq('id', id);
      if (!error) fetchStock();
      else alert("Error deleting: " + error.message);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Godaam Stock 🏪</h2>

      {/* Form */}
      <form onSubmit={handleSaveStock} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Stock Edit Karein' : '➕ Add New Stock In'}
          </h3>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="text-[10px] text-rose-600 font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <input 
          type="text" 
          placeholder="Item Name (e.g. DAP / Beej)" 
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
          <select 
            value={form.unit} 
            onChange={e => setForm({...form, unit: e.target.value})} 
            className="p-2.5 text-xs border rounded-lg bg-stone-50"
          >
            <option>Bori</option>
            <option>Kilo</option>
            <option>Botal</option>
            <option>Adad</option>
            <option>Liter</option>
          </select>
        </div>

        <input 
          type="number" 
          placeholder="Rate Per Unit (Optional)" 
          value={form.rate_per_unit} 
          onChange={e => setForm({...form, rate_per_unit: e.target.value})} 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none" 
        />

        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg shadow-md">
          {editingId ? 'Update Stock Save Karein' : '+ Add Stock'}
        </button>
      </form>

      {/* Stock History */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Mawjooda Stock History</h3>
        {loading ? (
          <p className="text-xs text-stone-400">Loading stock...</p>
        ) : stock.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl bg-white">
            <p className="text-xs text-stone-500">Godaam me koi entry darj nahi hai</p>
          </div>
        ) : (
          stock.map(s => (
            <div key={s.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-stone-800">{s.item_name}</p>
                <p className="text-stone-500">Aaya: {s.quantity_in} {s.unit} {s.rate_per_unit ? `(@ Rs ${s.rate_per_unit})` : ''}</p>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => handleEdit(s)} className="text-[10px] text-blue-600 font-bold hover:underline">✏️ Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-[10px] text-rose-600 font-bold hover:underline">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
