import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function KhataBook() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [form, setForm] = useState({ title: '', amount: '', type: 'kharch', notes: '' });

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data } = await supabase.from('khata_book').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return alert("Unwan / Title likhna zaroori hai");

    if (editingId) {
      // Edit / Update
      const { error } = await supabase.from('khata_book').update({
        title: form.title,
        amount: parseFloat(form.amount || 0),
        type: form.type,
        notes: form.notes
      }).eq('id', editingId);

      if (!error) {
        setEditingId(null);
        setForm({ title: '', amount: '', type: 'kharch', notes: '' });
        fetchEntries();
      }
    } else {
      // Add New
      const { error } = await supabase.from('khata_book').insert([{
        title: form.title,
        amount: parseFloat(form.amount || 0),
        type: form.type,
        notes: form.notes
      }]);

      if (!error) {
        setForm({ title: '', amount: '', type: 'kharch', notes: '' });
        fetchEntries();
      }
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: item.amount || '',
      type: item.type || 'kharch',
      notes: item.notes || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is entry ko delete karna chahte hain?")) {
      const { error } = await supabase.from('khata_book').delete().eq('id', id);
      if (!error) fetchEntries();
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif">Aam Khata Book 📚</h2>
          <p className="text-xs text-emerald-200">Ghair-mutaalqa ya Aam Yaaddasht Record</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-200">Kul Indraj</span>
          <p className="text-xl font-bold font-serif text-amber-300">{entries.length}</p>
        </div>
      </div>

      {/* Entry Form (Add & Edit) */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Entry Edit Karein' : '➕ Nayi Entry Add Karein'}
          </h3>
          {editingId && (
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setForm({ title: '', amount: '', type: 'kharch', notes: '' }); }}
              className="text-[10px] text-rose-600 font-bold"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <input 
          type="text" 
          placeholder="Unwan (e.g., Petrol Tanki / Mazdoori)" 
          value={form.title} 
          onChange={e => setForm({ ...form, title: e.target.value })} 
          required 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:border-[#1e3a29]" 
        />

        <div className="grid grid-cols-2 gap-2">
          <input 
            type="number" 
            placeholder="Raqam (Rs)" 
            value={form.amount} 
            onChange={e => setForm({ ...form, amount: e.target.value })} 
            className="p-2.5 text-xs border rounded-lg focus:outline-none" 
          />
          <select 
            value={form.type} 
            onChange={e => setForm({ ...form, type: e.target.value })} 
            className="p-2.5 text-xs border rounded-lg bg-stone-50"
          >
            <option value="kharch">Kharch (Out)</option>
            <option value="aamdani">Aamdani (In)</option>
            <option value="note">Sirf Note (Tafseel)</option>
          </select>
        </div>

        <textarea 
          placeholder="Mazeed Tafseel / Details (Optional)" 
          value={form.notes} 
          onChange={e => setForm({ ...form, notes: e.target.value })} 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none h-16"
        ></textarea>

        <button 
          type="submit" 
          className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg shadow-md"
        >
          {editingId ? 'Update Entry' : 'Khata Book Me Save Karein'}
        </button>
      </form>

      {/* Entries List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Tamam Record</h3>
        {loading ? (
          <p className="text-xs text-stone-400">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-xl bg-white">
            <p className="text-xs text-stone-500">Khata book me abhi koi entry nahi hai.</p>
          </div>
        ) : (
          entries.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-start text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    item.type === 'aamdani' ? 'bg-emerald-100 text-emerald-800' :
                    item.type === 'kharch' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  <p className="font-bold text-stone-800">{item.title}</p>
                </div>
                {item.notes && <p className="text-[11px] text-stone-500">{item.notes}</p>}
                <p className="text-[9px] text-stone-400">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>

              <div className="text-right space-y-1">
                {item.amount > 0 && (
                  <p className={`font-bold ${item.type === 'aamdani' ? 'text-emerald-700' : 'text-stone-800'}`}>
                    Rs {Number(item.amount).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2 justify-end pt-1">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline text-[10px]">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:underline text-[10px]">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
