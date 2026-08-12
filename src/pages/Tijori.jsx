import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Tijori() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ direction: 'in', amount: '', source: '' });

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tijori_cash')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) console.error("Error fetching tijori:", error);
    setEntries(data || []);
    setLoading(false);
  }

  async function handleSaveCash(e) {
    e.preventDefault();
    if (!form.amount) return alert("Amount likhna zaroori hai");

    const payload = {
      direction: form.direction,
      amount: parseFloat(form.amount),
      source: form.source || 'Cash Entry'
    };

    if (editingId) {
      // Edit Transaction Entry
      const { error } = await supabase.from('tijori_cash').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchEntries();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      // New Transaction Entry
      const { error } = await supabase.from('tijori_cash').insert([payload]);
      if (!error) {
        resetForm();
        fetchEntries();
      } else {
        alert("Error saving: " + error.message);
      }
    }
  }

  function resetForm() {
    setForm({ direction: 'in', amount: '', source: '' });
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      direction: item.direction || 'in',
      amount: item.amount || '',
      source: item.source || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is transaction ko delete karna chahte hain?")) {
      const { error } = await supabase.from('tijori_cash').delete().eq('id', id);
      if (!error) fetchEntries();
      else alert("Error deleting: " + error.message);
    }
  }

  // Live Balance Calculate Karein
  const totalIn = entries.filter(e => e.direction === 'in').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalOut = entries.filter(e => e.direction === 'out').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalBalance = totalIn - totalOut;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Top Balance Summary Card */}
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold">
            Safe Vault
          </span>
          <h2 className="text-xl font-bold font-serif mt-1">Tijori Balance</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-200">Kul Mawjood Cash</span>
          <p className="text-xl font-bold font-serif text-amber-300">
            Rs {totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveCash} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Transaction Edit Karein' : '➕ Nayi Cash Entry Add Karein'}
          </h3>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="text-[10px] text-rose-600 font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <select 
          value={form.direction} 
          onChange={e => setForm({...form, direction: e.target.value})} 
          className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-stone-50 focus:outline-none"
        >
          <option value="in">Cash In (+ Safe me daala)</option>
          <option value="out">Cash Out (- Nikala / Kharch)</option>
        </select>

        <input 
          type="number" 
          placeholder="Amount (Rs)" 
          value={form.amount} 
          onChange={e => setForm({...form, amount: e.target.value})} 
          required 
          className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
        />

        <input 
          type="text" 
          placeholder="Source / Details (e.g. Bank Withdrawal / Crop Sale)" 
          value={form.source} 
          onChange={e => setForm({...form, source: e.target.value})} 
          className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
        />

        <button type="submit" className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md">
          {editingId ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </form>

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Cash History</h3>

        {loading ? (
          <p className="text-xs text-stone-400">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-stone-300 rounded-2xl bg-white">
            <p className="text-xs text-stone-500">Tijori me koi entry darj nahi hai</p>
          </div>
        ) : (
          entries.map(e => (
            <div key={e.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="font-bold text-stone-800">{e.source || 'Cash Entry'}</p>
                <p className="text-[10px] text-stone-400">{new Date(e.created_at).toLocaleDateString()}</p>
                <div className="flex gap-3 pt-0.5">
                  <button onClick={() => handleEdit(e)} className="text-[10px] text-blue-600 font-bold hover:underline">✏️ Edit</button>
                  <button onClick={() => handleDelete(e.id)} className="text-[10px] text-rose-600 font-bold hover:underline">🗑️ Delete</button>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold text-sm ${e.direction === 'in' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {e.direction === 'in' ? '+' : '-'} Rs {Number(e.amount).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
