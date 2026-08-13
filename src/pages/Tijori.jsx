import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Tijori() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);

  const [form, setForm] = useState({ 
    direction: 'in', 
    amount: '', 
    source: '' 
  });

  useEffect(() => { 
    fetchEntries(); 
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tijori_cash')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching tijori:", error);
      alert("Error loading cash history: " + error.message);
    }
    setEntries(data || []);
    setLoading(false);
  }

  async function handleSaveCash(e) {
    e.preventDefault();
    const parsedAmount = parseFloat(form.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return alert("Baraye karam durust Amount (Rs) likhein");
    }

    const payload = {
      direction: form.direction,
      amount: parsedAmount,
      source: form.source.trim() || 'Cash Entry'
    };

    if (editingId) {
      // Edit Transaction Entry
      const { error } = await supabase.from('tijori_cash').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        setShowForm(false);
        fetchEntries();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      // New Transaction Entry
      const { error } = await supabase.from('tijori_cash').insert([payload]);
      if (!error) {
        resetForm();
        setShowForm(false);
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
    setShowForm(true);
    setForm({
      direction: item.direction || 'in',
      amount: item.amount || '',
      source: item.source || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is cash transaction ko delete karna chahte hain?")) {
      const { error } = await supabase.from('tijori_cash').delete().eq('id', id);
      if (!error) fetchEntries();
      else alert("Error deleting: " + error.message);
    }
  }

  // Dashboard Calculations
  const totalIn = entries
    .filter(e => e.direction === 'in')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalOut = entries
    .filter(e => e.direction === 'out')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalBalance = totalIn - totalOut;

  // CSV Export Functionality
  function exportToCSV() {
    if (!entries.length) return alert('Koi cash record nahi hai export karne ke liye');
    const headers = ['Tareekh', 'Kisam (In/Out)', 'Tafseel / Source', 'Amount (Rs)'];
    const rows = entries.map((e) => [
      `"${new Date(e.created_at).toLocaleDateString()}"`,
      e.direction === 'in' ? '"Cash In (+)"' : '"Cash Out (-)"',
      `"${e.source || 'Cash Entry'}"`,
      e.amount || 0
    ]);
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tijori_cash_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Top Main Balance Card */}
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Safe Vault / Tijori
          </span>
          <span className="text-[10px] text-emerald-200 font-medium">
            Entries: {entries.length}
          </span>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <h2 className="text-xl font-bold font-serif">Tijori Cash 💰</h2>
            <p className="text-xs text-emerald-200">Kul Mawjood Balance</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold font-serif ${totalBalance >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
              Rs {totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mini Dashboard - Stats Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Total Cash In</p>
          <p className="text-xs font-bold text-emerald-700 mt-0.5">
            + Rs {totalIn.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Total Cash Out</p>
          <p className="text-xs font-bold text-rose-600 mt-0.5">
            - Rs {totalOut.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Net Balance</p>
          <p className={`text-xs font-bold mt-0.5 ${totalBalance >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
            Rs {totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Cash Entry Edit Karein' : '➕ Nayi Cash Entry Add Karein'}
          </h3>
          <button 
            type="button" 
            onClick={() => { 
              if (editingId) {
                setEditingId(null);
                resetForm();
                setShowForm(false);
              } else {
                setShowForm(!showForm);
              }
            }} 
            className="text-[10px] font-bold text-emerald-700 hover:underline"
          >
            {showForm || editingId ? 'Band Karein' : 'Add Cash +'}
          </button>
        </div>

        {(showForm || editingId) && (
          <form onSubmit={handleSaveCash} className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'in' })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  form.direction === 'in'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                + Cash In (Aamad)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'out' })}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  form.direction === 'out'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                - Cash Out (Kharch)
              </button>
            </div>

            <input 
              type="number" 
              step="any"
              placeholder="Amount (Rs) *" 
              value={form.amount} 
              onChange={e => setForm({...form, amount: e.target.value})} 
              required 
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
            />

            <input 
              type="text" 
              placeholder="Source / Tafseel (e.g. Fasal Ki Kamai / Bank Withdrawal)" 
              value={form.source} 
              onChange={e => setForm({...form, source: e.target.value})} 
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
            />

            <button 
              type="submit" 
              className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
            >
              {editingId ? 'Update Transaction Save Karein' : 'Record Save Karein'}
            </button>
          </form>
        )}
      </div>

      {/* Cash History Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-stone-700">Tijori Cash History</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[10px] text-stone-600 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={hideHistory} 
                onChange={(e) => setHideHistory(e.target.checked)} 
              />
              Hide List
            </label>
            <button 
              onClick={exportToCSV} 
              className="text-[10px] font-bold text-emerald-700 hover:underline"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {!hideHistory && (
          <>
            {loading ? (
              <p className="text-xs text-stone-400">Loading history...</p>
            ) : entries.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-2xl bg-white">
                <p className="text-xs text-stone-500">Tijori me koi transaction darj nahi hai.</p>
              </div>
            ) : (
              entries.map(e => {
                const isIn = e.direction === 'in';
                return (
                  <div 
                    key={e.id} 
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          isIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isIn ? 'CASH IN' : 'CASH OUT'}
                        </span>
                        <p className="font-bold text-xs text-stone-800">{e.source || 'Cash Entry'}</p>
                      </div>
                      <p className="text-[10px] text-stone-400">
                        {new Date(e.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-3 pt-0.5">
                        <button 
                          onClick={() => handleEdit(e)} 
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(e.id)} 
                          className="text-[10px] text-rose-600 font-bold hover:underline"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold text-sm ${isIn ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isIn ? '+' : '-'} Rs {Number(e.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
}
