import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Zameendar() {
  const [expenses, setExpenses] = useState([]);
  const [kisaanCount, setKisaanCount] = useState(0);
  const [form, setForm] = useState({ category: '', amount: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: kData } = await supabase.from('kisaans').select('id');
    if (kData) setKisaanCount(kData.length);

    const { data: eData } = await supabase.from('zameendar_expenses').select('*').order('created_at', { ascending: false });
    setExpenses(eData || []);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!form.category || !form.amount) return alert("Category aur Amount zaroori hai");

    const { error } = await supabase.from('zameendar_expenses').insert([{
      category: form.category,
      amount: parseFloat(form.amount),
      notes: form.notes
    }]);

    if (!error) {
      setForm({ category: '', amount: '', notes: '' });
      fetchData();
    }
  }

  const totalZameendarKharch = expenses.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-[#1e3a29] text-white p-4 rounded-xl shadow-md">
        <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">Zameendar Control Board</span>
        <h2 className="text-xl font-bold mt-1">Zameendari Overview</h2>
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-800 text-xs">
          <div>
            <p className="text-emerald-200">Kul Kashtkaar</p>
            <p className="text-lg font-bold text-white">{kisaanCount} Kisaan</p>
          </div>
          <div>
            <p className="text-emerald-200">Personal Kharch</p>
            <p className="text-lg font-bold text-amber-300">Rs {totalZameendarKharch.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Add Direct Zameendar Expense */}
      <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <h3 className="font-bold text-xs text-[#1e3a29]">Zameendar Level Kharch (Tubewell / Bijli / Fuel)</h3>
        <input 
          type="text" 
          placeholder="Kharch Ki Qism (e.g. Bijli Bill / Diesel Tanki)" 
          value={form.category} 
          onChange={e => setForm({ ...form, category: e.target.value })} 
          required 
          className="w-full p-2 text-xs border rounded" 
        />
        <input 
          type="number" 
          placeholder="Raqam (Rs)" 
          value={form.amount} 
          onChange={e => setForm({ ...form, amount: e.target.value })} 
          required 
          className="w-full p-2 text-xs border rounded" 
        />
        <input 
          type="text" 
          placeholder="Notes (Optional)" 
          value={form.notes} 
          onChange={e => setForm({ ...form, notes: e.target.value })} 
          className="w-full p-2 text-xs border rounded" 
        />
        <button type="submit" className="w-full py-2 bg-[#1e3a29] text-white text-xs font-bold rounded shadow">Save Kharch</button>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Zameendar Expense History</h3>
        {expenses.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-stone-800">{item.category}</p>
              <p className="text-[10px] text-stone-500">{item.notes}</p>
            </div>
            <p className="font-bold text-rose-700">Rs {Number(item.amount).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
