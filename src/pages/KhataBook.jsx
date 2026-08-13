import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function KhataBook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'kharch', 'aamdani', 'note'

  // Form State
  const [form, setForm] = useState({ title: '', amount: '', type: 'kharch', notes: '' });

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('khata_book')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching khata book:", error);
      alert("Error loading entries: " + error.message);
    }
    setEntries(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Unwan / Title likhna zaroori hai");

    const payload = {
      title: form.title.trim(),
      amount: parseFloat(form.amount || 0),
      type: form.type,
      notes: form.notes.trim()
    };

    if (editingId) {
      // Edit / Update Entry
      const { error } = await supabase
        .from('khata_book')
        .update(payload)
        .eq('id', editingId);

      if (!error) {
        setEditingId(null);
        resetForm();
        setShowForm(false);
        fetchEntries();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      // Add New Entry
      const { error } = await supabase.from('khata_book').insert([payload]);

      if (!error) {
        resetForm();
        setShowForm(false);
        fetchEntries();
      } else {
        alert("Error adding: " + error.message);
      }
    }
  }

  function resetForm() {
    setForm({ title: '', amount: '', type: 'kharch', notes: '' });
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      title: item.title || '',
      amount: item.amount ?? '',
      type: item.type || 'kharch',
      notes: item.notes || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is khata entry ko delete karna chahte hain?")) {
      const { error } = await supabase.from('khata_book').delete().eq('id', id);
      if (!error) fetchEntries();
      else alert("Error deleting: " + error.message);
    }
  }

  // Calculations for Dashboard
  const totalAamdani = entries
    .filter(e => e.type === 'aamdani')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalKharch = entries
    .filter(e => e.type === 'kharch')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const netBalance = totalAamdani - totalKharch;

  // Filtered List based on Active Tab
  const filteredEntries = entries.filter(e => {
    if (activeTab === 'all') return true;
    return e.type === activeTab;
  });

  // Export to CSV Function
  function exportToCSV() {
    if (!entries.length) return alert('Export karne ke liye koi record nahi hai');
    const headers = ['Tareekh', 'Unwan / Title', 'Kisam (Type)', 'Amount (Rs)', 'Notes'];
    const rows = entries.map((e) => [
      `"${new Date(e.created_at).toLocaleDateString()}"`,
      `"${e.title || ''}"`,
      `"${e.type.toUpperCase()}"`,
      e.amount || 0,
      `"${e.notes || ''}"`
    ]);
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `khata_book_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Header Profile / Summary Card */}
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            General Ledger
          </span>
          <span className="text-[10px] text-emerald-200 font-medium">
            Kul Indraj: {entries.length}
          </span>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <h2 className="text-xl font-bold font-serif">Aam Khata Book 📚</h2>
            <p className="text-xs text-emerald-200">Ghair-mutaalqa ya Aam Yaaddasht</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200">Safia (Net Balance)</span>
            <p className={`text-xl font-bold font-serif ${netBalance >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
              Rs {netBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mini Dashboard - Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Kul Aamdani</p>
          <p className="text-xs font-bold text-emerald-700 mt-0.5">
            + Rs {totalAamdani.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Kul Kharch</p>
          <p className="text-xs font-bold text-rose-600 mt-0.5">
            - Rs {totalKharch.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Net Balance</p>
          <p className={`text-xs font-bold mt-0.5 ${netBalance >= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
            Rs {netBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Entry Form Toggle Section */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Entry Edit Karein' : '➕ Nayi Entry Add Karein'}
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
            {showForm || editingId ? 'Band Karein' : 'Add Entry +'}
          </button>
        </div>

        {(showForm || editingId) && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-3">
            <input 
              type="text" 
              placeholder="Unwan (e.g., Petrol Tanki / Mazdoori / Dukan Becha)" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              required 
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
            />

            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                step="any"
                placeholder="Raqam (Rs)" 
                value={form.amount} 
                onChange={e => setForm({ ...form, amount: e.target.value })} 
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
              />
              <select 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })} 
                className="p-2.5 text-xs border border-stone-300 rounded-xl bg-stone-50 focus:outline-none"
              >
                <option value="kharch">Kharch (Out)</option>
                <option value="aamdani">Aamdani (In)</option>
                <option value="note">Sirf Note (Tafseel)</option>
              </select>
            </div>

            <textarea 
              placeholder="Mazeed Tafseel / Notes (Optional)" 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })} 
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none h-16"
            ></textarea>

            <button 
              type="submit" 
              className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
            >
              {editingId ? 'Update Entry Save Karein' : 'Khata Book Me Save Karein'}
            </button>
          </form>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'all' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Sab ({entries.length})
        </button>
        <button
          onClick={() => setActiveTab('kharch')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'kharch' ? 'bg-white text-rose-700 shadow-sm' : 'text-stone-500'
          }`}
        >
          Kharch
        </button>
        <button
          onClick={() => setActiveTab('aamdani')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'aamdani' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500'
          }`}
        >
          Aamdani
        </button>
        <button
          onClick={() => setActiveTab('note')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeTab === 'note' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500'
          }`}
        >
          Notes
        </button>
      </div>

      {/* History & List Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-stone-700">Khata Record History</h3>
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
              <p className="text-xs text-stone-400">Loading records...</p>
            ) : filteredEntries.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-2xl bg-white">
                <p className="text-xs text-stone-500">Is category mein koi entry nahi hai.</p>
              </div>
            ) : (
              filteredEntries.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-start text-xs"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.type === 'aamdani' ? 'bg-emerald-100 text-emerald-800' :
                        item.type === 'kharch' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.type}
                      </span>
                      <p className="font-bold text-stone-800 truncate">{item.title}</p>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-600 bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                        {item.notes}
                      </p>
                    )}

                    <p className="text-[10px] text-stone-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex gap-3 pt-0.5">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="text-[10px] text-rose-600 font-bold hover:underline"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.amount > 0 ? (
                      <p className={`font-bold text-sm ${
                        item.type === 'aamdani' ? 'text-emerald-700' : 
                        item.type === 'kharch' ? 'text-rose-600' : 'text-stone-700'
                      }`}>
                        {item.type === 'aamdani' ? '+' : item.type === 'kharch' ? '-' : ''} Rs {Number(item.amount).toLocaleString()}
                      </p>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-medium">No Amount</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
