import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Zameendar() {
  const [kisaans, setKisaans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', area: '', notes: '' });

  useEffect(() => { fetchKisaans(); }, []);

  async function fetchKisaans() {
    setLoading(true);
    const { data, error } = await supabase
      .from('kisaans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching kisaans:", error);
    setKisaans(data || []);
    setLoading(false);
  }

  async function handleSaveKisaan(e) {
    e.preventDefault();
    if (!form.name) return alert("Zameendar / Kisaan ka naam likhna zaroori hai");

    const payload = {
      name: form.name,
      phone: form.phone || '',
      area: form.area || '',
      notes: form.notes || ''
    };

    if (editingId) {
      // Edit Kisaan Entry
      const { error } = await supabase.from('kisaans').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchKisaans();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      // Add New Kisaan Entry
      const { error } = await supabase.from('kisaans').insert([payload]);
      if (!error) {
        resetForm();
        fetchKisaans();
      } else {
        alert("Error adding: " + error.message);
      }
    }
  }

  function resetForm() {
    setForm({ name: '', phone: '', area: '', notes: '' });
  }

  function handleEdit(kisaan) {
    setEditingId(kisaan.id);
    setForm({
      name: kisaan.name || '',
      phone: kisaan.phone || '',
      area: kisaan.area || '',
      notes: kisaan.notes || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is Zameendar/Kisaan ko delete karna chahte hain?")) {
      const { error } = await supabase.from('kisaans').delete().eq('id', id);
      if (!error) fetchKisaans();
      else alert("Error deleting: " + error.message);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Zameendar / Kisaan List 🚜</h2>

      {/* Form */}
      <form onSubmit={handleSaveKisaan} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Zameendar Edit Karein' : '➕ Naya Zameendar Add Karein'}
          </h3>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); resetForm(); }} className="text-[10px] text-rose-600 font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <input 
          type="text" 
          placeholder="Zameendar / Kisaan Name *" 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
          required 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none" 
        />

        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={form.phone} 
            onChange={e => setForm({...form, phone: e.target.value})} 
            className="p-2.5 text-xs border rounded-lg focus:outline-none" 
          />
          <input 
            type="text" 
            placeholder="Raqba / Area (e.g. 10 Acre)" 
            value={form.area} 
            onChange={e => setForm({...form, area: e.target.value})} 
            className="p-2.5 text-xs border rounded-lg focus:outline-none" 
          />
        </div>

        <input 
          type="text" 
          placeholder="Notes / Extra Details" 
          value={form.notes} 
          onChange={e => setForm({...form, notes: e.target.value})} 
          className="w-full p-2.5 text-xs border rounded-lg focus:outline-none" 
        />

        <button type="submit" className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-lg shadow-md">
          {editingId ? 'Update Zameendar Save Karein' : '+ Add Zameendar'}
        </button>
      </form>

      {/* Zameendar List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Mawjooda Zameendar</h3>

        {loading ? (
          <p className="text-xs text-stone-400">Loading...</p>
        ) : kisaans.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl bg-white">
            <p className="text-xs text-stone-500">Koi Zameendar add nahi hai</p>
          </div>
        ) : (
          kisaans.map(k => (
            <div key={k.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="font-bold text-stone-800">{k.name}</p>
                <p className="text-stone-500">
                  {k.phone ? `📞 ${k.phone}` : ''} {k.area ? `| 🌾 ${k.area}` : ''}
                </p>
                {k.notes && <p className="text-[10px] text-stone-400">{k.notes}</p>}
                
                <div className="flex gap-3 pt-1">
                  <button onClick={() => handleEdit(k)} className="text-[10px] text-blue-600 font-bold hover:underline">✏️ Edit</button>
                  <button onClick={() => handleDelete(k.id)} className="text-[10px] text-rose-600 font-bold hover:underline">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
