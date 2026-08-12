
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Tijori() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ direction: 'in', amount: '', source: '' });

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    const { data } = await supabase.from('tijori_cash').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
  }

  async function handleAddCash(e) {
    e.preventDefault();
    await supabase.from('tijori_cash').insert([{
      direction: form.direction, amount: parseFloat(form.amount), source: form.source
    }]);
    setForm({ direction: 'in', amount: '', source: '' });
    fetchEntries();
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Tijori (Cash Safe)</h2>

      <form onSubmit={handleAddCash} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <select value={form.direction} onChange={e => setForm({...form, direction: e.target.value})} className="w-full p-2 text-xs border rounded bg-stone-50">
          <option value="in">Cash In (+ Safe me daala)</option>
          <option value="out">Cash Out (- Nikala/Kharch)</option>
        </select>
        <input type="number" placeholder="Amount (Rs)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className="w-full p-2 text-xs border rounded" />
        <input type="text" placeholder="Source / Details" value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full p-2 text-xs border rounded" />
        <button type="submit" className="w-full py-2 bg-[#1e3a29] text-white text-xs font-bold rounded shadow">Save Transaction</button>
      </form>

      {entries.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl bg-white"><p className="text-xs text-stone-500">Koi entry darj nahi hai</p></div>
      ) : (
        entries.map(e => (
          <div key={e.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
            <div><p className="font-bold">{e.source || 'Cash Entry'}</p></div>
            <p className={`font-bold ${e.direction === 'in' ? 'text-emerald-700' : 'text-rose-600'}`}>{e.direction === 'in' ? '+' : '-'} Rs {Number(e.amount).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
