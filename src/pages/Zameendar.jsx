import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Zameendar() {
  const [kisaans, setKisaans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    kharcha_type: 'Diesel',
    amount: '',
    notes: ''
  });

  useEffect(() => { 
    fetchKisaans(); 
  }, []);

  async function fetchKisaans() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('kisaans')
      .select('*')
      .eq('user_id', user.id)
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
    if (!form.name.trim()) return alert("Zameendar / Kisaan ka naam likhna zaroori hai");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User session nahi mila, dobara login karein.");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || '',
      area: form.area.trim() || '',
      kharcha_type: form.kharcha_type,
      amount: form.amount ? parseFloat(form.amount) : 0,
      notes: form.notes.trim() || '',
      category: 'zameendar',
      user_id: user.id
    };

    if (editingId) {
      const { error } = await supabase
        .from('kisaans')
        .update(payload)
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (!error) {
        setEditingId(null);
        resetForm();
        setShowForm(false);
        fetchKisaans();
      } else {
        alert("Error updating: " + error.message);
      }
    } else {
      const { error } = await supabase.from('kisaans').insert([payload]);
      if (!error) {
        resetForm();
        setShowForm(false);
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
    setShowForm(true);
    setForm({
      name: kisaan.name || '',
      phone: kisaan.phone || '',
      area: kisaan.area || '',
      kharcha_type: kisaan.kharcha_type || 'Diesel',
      amount: kisaan.amount ?? '',
      notes: kisaan.notes || ''
    });
  }

  async function handleDelete(id) {
    if (window.confirm("Kya aap is entry ko delete karna chahte hain?")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('kisaans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) fetchKisaans();
      else alert("Error deleting: " + error.message);
    }
  }

  const totalKharcha = kisaans.reduce((sum, k) => sum + (Number(k.amount) || 0), 0);
  
  const filteredKisaans = kisaans.filter(k => {
    if (activeTab === 'all') return true;
    return k.kharcha_type === activeTab;
  });

  function exportToCSV() {
    if (!kisaans.length) return alert('Export karne ke liye koi record nahi hai');
    const headers = ['Tareekh', 'Naam', 'Phone', 'Raqba (Area)', 'Kharcha Type', 'Amount (Rs)', 'Notes'];
    const rows = kisaans.map((k) => [
      `"${new Date(k.created_at).toLocaleDateString()}"`,
      `"${k.name || ''}"`,
      `"${k.phone || ''}"`,
      `"${k.area || ''}"`,
      `"${k.kharcha_type || ''}"`,
      k.amount || 0,
      `"${k.notes || ''}"`
    ]);
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zameendar_khata_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Agricultural Ledger
          </span>
          <span className="text-[10px] text-emerald-200 font-medium">
            Kul Record: {kisaans.length}
          </span>
        </div>
        <div className="flex justify-between items-end mt-2">
          <div>
            <h2 className="text-xl font-bold font-serif">Zameendar Khata 🚜</h2>
            <p className="text-xs text-emerald-200">Kisaan & Agri Expenses Record</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200">Kul Kharcha</span>
            <p className="text-xl font-bold font-serif text-amber-300">
              Rs {totalKharcha.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Kul Indraj</p>
          <p className="text-xs font-bold text-stone-800 mt-0.5">
            {kisaans.length} Entries
          </p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Kul Kharcha Amount</p>
          <p className="text-xs font-bold text-rose-600 mt-0.5">
            Rs {totalKharcha.toLocaleString()}
          </p>
        </div>
      </div>

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
          <form onSubmit={handleSaveKisaan} className="space-y-3 pt-3">
            <input 
              type="text" 
              placeholder="Zameendar / Kisaan Name *" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
            />

            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Phone Number" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
              />
              <input 
                type="text" 
                placeholder="Raqba / Area (e.g. 10 Acre)" 
                value={form.area} 
                onChange={e => setForm({...form, area: e.target.value})} 
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
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
                step="any"
                placeholder="Amount (Rs)" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1">
                📝 Extra Notes / Diary Text Box:
              </label>
              <textarea 
                placeholder="Yahan aap Zameendar ya kharche ki koi bhi tafseel, hisab, tareekh ya note likh sakte hain..." 
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
                rows="3"
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none resize-none bg-stone-50" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
            >
              {editingId ? 'Update Karein' : '+ Save Zameendar Record'}
            </button>
          </form>
        )}
      </div>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl text-[10px] font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'all' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Sab ({kisaans.length})
        </button>
        <button
          onClick={() => setActiveTab('Diesel')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'Diesel' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Diesel
        </button>
        <button
          onClick={() => setActiveTab('Tube Well')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'Tube Well' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Tube Well
        </button>
        <button
          onClick={() => setActiveTab('Tractor')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'Tractor' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Tractor
        </button>
        <button
          onClick={() => setActiveTab('Khaad / Beej')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'Khaad / Beej' ? 'bg-white text-[#1e3a29] shadow-sm' : 'text-stone-500'
          }`}
        >
          Khaad/Beej
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-stone-700">Mawjooda Zameendar Khata</h3>
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
              <p className="text-xs text-stone-400">Loading data...</p>
            ) : filteredKisaans.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-300 rounded-2xl bg-white">
                <p className="text-xs text-stone-500">Is filter mein koi entry darj nahi hai</p>
              </div>
            ) : (
              filteredKisaans.map(k => (
                <div 
                  key={k.id} 
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-stone-800 text-sm">{k.name}</p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {k.phone ? `📞 ${k.phone}` : ''} {k.area ? `| 🌾 ${k.area}` : ''}
                      </p>
                    </div>
                    {k.amount > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase">
                          {k.kharcha_type || 'Kharcha'}
                        </span>
                        <p className="font-bold text-rose-600 mt-1 text-sm">
                          Rs {Number(k.amount).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {k.notes && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-700 text-[11px] whitespace-pre-wrap">
                      📝 <span className="font-medium">{k.notes}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                    <span className="text-[9px] text-stone-400">
                      {new Date(k.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(k)} 
                        className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(k.id)} 
                        className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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
