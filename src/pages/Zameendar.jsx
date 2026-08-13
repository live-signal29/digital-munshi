import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Zameendar() {
  const [kisaans, setKisaans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    kharcha_type: 'Diesel',
    amount: '',
    notes: ''
  });

  useEffect(() => { fetchKisaans(); }, []);

  async function fetchKisaans() {
    setLoading(true);
    const { data, error } = await supabase
      .from('kisaans')
      .select('*')
      .eq('category', 'zameendar')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching kisaans:", error);
      alert("Error loading data: " + error.message);
    }
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
      kharcha_type: form.kharcha_type,
      amount: form.amount ? parseFloat(form.amount) : 0,
      notes: form.notes || '',
      category: 'zameendar'
    };

    if (editingId) {
      const { error } = await supabase.from('kisaans').update(payload).eq('id', editingId);
      if (!error) {
        setEditingId(null);
        resetForm();
        fetchKisaans();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
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
    setForm({ name: '', phone: '', area: '', kharcha_type: 'Diesel', amount: '', notes: '' });
  }

  function handleEdit(kisaan) {
    setEditingId(kisaan.id);
    setForm({
      name: kisaan.name || '',
      phone: kisaan.phone || '',
      area: kisaan.area || '',
      kharcha_type: kisaan.kharcha_type || 'Diesel',
      amount: kisaan.amount || '',
      notes: kisaan.notes || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is entry ko delete karna chahte hain?")) {
      const { error } = await supabase.from('kisaans').delete().eq('id', id);
      if (!error) fetchKisaans();
      else alert("Error deleting: " + error.message);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-serif font-bold text-[#1e3a29]">Zameendar & Kharcha Khata 🚜</h2>

      <form onSubmit={handleSaveKisaan} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Entry Edit Karein' : '➕ Nayi Entry Add Karein'}
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
          className="w-full p-2.5 text-xs border rounded-xl focus:outline-none" 
        />

        <div className="grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={form.phone} 
            onChange={e => setForm({...form, phone: e.target.value})} 
            className="p-2.5 text-xs border rounded-xl focus:outline-none" 
          />
          <input 
            type="text" 
            placeholder="Raqba / Area (e.g. 10 Acre)" 
            value={form.area} 
            onChange={e => setForm({...form, area: e.target.value})} 
            className="p-2.5 text-xs border rounded-xl focus:outline-none" 
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select 
            value={form.kharcha_type} 
            onChange={e => setForm({...form, kharcha_type: e.target.value})} 
            className="p-2.5 text-xs border border-stone-300 rounded-xl bg-stone-50 focus:outline-none"
          >
            <option value="Diesel">⛽ Diesel / Petrol</option>
            <option value="Tube Well">🌊 Tube Well</option>
            <option value="Tractor">🚜 Tractor / Plough</option>
            <option value="Khaad / Beej">🌱 Khaad / Beej</option>
            <option value="Ather Kharcha">📋 Ather Kharcha</option>
          </select>

          <input 
            type="number" 
            placeholder="Amount (Rs)" 
            value={form.amount} 
            onChange={e => setForm({...form, amount: e.target.value})} 
            className="p-2.5 text-xs border rounded-xl focus:outline-none" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-stone-600 mb-1">📝 Extra Notes / Diary Text Box:</label>
          <textarea 
            placeholder="Yahan aap Zameendar ya kharche ki koi bhi tafseel, hisab, tareekh ya note likh sakte hain..." 
            value={form.notes} 
            onChange={e => setForm({...form, notes: e.target.value})} 
            rows="3"
            className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none resize-none bg-stone-50" 
          />
        </div>

        <button type="submit" className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md">
          {editingId ? 'Update Karein' : '+ Save Zameendar Record'}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Mawjooda Zameendar Khata</h3>

        {loading ? (
          <p className="text-xs text-stone-400">Loading...</p>
        ) : kisaans.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-stone-300 rounded-2xl bg-white">
            <p className="text-xs text-stone-500">Koi entry darj nahi hai</p>
          </div>
        ) : (
          kisaans.map(k => (
            <div key={k.id} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-stone-800 text-sm">{k.name}</p>
                  <p className="text-stone-500 text-[11px]">
                    {k.phone ? `📞 ${k.phone}` : ''} {k.area ? `| 🌾 ${k.area}` : ''}
                  </p>
                </div>
                {k.amount > 0 && (
                  <div className="text-right">
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      {k.kharcha_type || 'Kharcha'}
                    </span>
                    <p className="font-bold text-rose-600 mt-0.5">Rs {Number(k.amount).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {k.notes && (
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-700 text-[11px] whitespace-pre-wrap">
                  📝 <span className="font-medium">{k.notes}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1 border-t border-stone-100">
                <button onClick={() => handleEdit(k)} className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(k.id)} className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
