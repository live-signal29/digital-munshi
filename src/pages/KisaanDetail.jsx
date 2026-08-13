import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function KisaanDetail() {
  const [kisaans, setKisaans] = useState([]);
  const [selectedKisaanId, setSelectedKisaanId] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isEditingKisaan, setIsEditingKisaan] = useState(false);
  const [kisaanEditForm, setKisaanEditForm] = useState({ name: '', zameen_acre: '' });
  const [editingEntryId, setEditingEntryId] = useState(null);

  // Naya Kisaan Add Karne Ke Liye State
  const [showAddKisaan, setShowAddKisaan] = useState(false);
  const [newKisaanForm, setNewKisaanForm] = useState({ name: '', zameen_acre: '' });

  const [form, setForm] = useState({
    type: 'kharch',
    item_name: '',
    unit: 'Bori',
    custom_unit: '',
    quantity: '',
    rate: '',
  });

  useEffect(() => {
    fetchKisaans();
  }, []);

  useEffect(() => {
    if (selectedKisaanId) {
      fetchEntries(selectedKisaanId);
    } else {
      setEntries([]);
    }
  }, [selectedKisaanId]);

  async function fetchKisaans() {
    const { data, error } = await supabase
      .from('kisaans')
      .select('*')
      .eq('category', 'kisaan')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Kisaans Error:', error);
      alert('Error loading kisaans: ' + error.message);
      return;
    }
    if (data && data.length > 0) {
      setKisaans(data);
      if (!selectedKisaanId) setSelectedKisaanId(data[0].id);
    } else {
      setKisaans([]);
      setSelectedKisaanId('');
    }
  }

  async function fetchEntries(kisaanId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('kisaan_items')
      .select('*')
      .eq('kisaan_id', kisaanId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Entries Error:', error);
      alert('Error loading entries: ' + error.message);
    }

    setEntries(data || []);
    setLoading(false);
  }

  const selectedKisaan = kisaans.find((k) => k.id === selectedKisaanId);

  // Naya Kisaan Save Karna
  async function handleAddKisaan(e) {
    e.preventDefault();
    if (!newKisaanForm.name) return alert('Kisaan ka naam likhna zaroori hai');

    const { data, error } = await supabase
      .from('kisaans')
      .insert([
        {
          name: newKisaanForm.name,
          zameen_acre: newKisaanForm.zameen_acre || 0,
          category: 'kisaan',
        },
      ])
      .select();

    if (error) {
      console.error('Add Kisaan Error:', error);
      alert('Error adding kisaan: ' + error.message);
      return;
    }

    setNewKisaanForm({ name: '', zameen_acre: '' });
    setShowAddKisaan(false);
    await fetchKisaans();
    if (data && data[0]) setSelectedKisaanId(data[0].id);
  }

  async function handleSaveEntry(e) {
    e.preventDefault();
    if (!selectedKisaanId) return alert('Pehle Kisaan select karein');
    if (!form.item_name) return alert('Item name likhna zaroori hai');

    const finalUnit = form.unit === 'Custom' ? form.custom_unit || 'Unit' : form.unit;
    const qty = parseFloat(form.quantity || 0);
    const rate = parseFloat(form.rate || 0);
    const total = qty * rate;

    if (editingEntryId) {
      const { error } = await supabase
        .from('kisaan_items')
        .update({
          item_name: form.item_name,
          unit: finalUnit,
          quantity: qty,
          rate: rate,
          total_amount: total,
          type: form.type,
        })
        .eq('id', editingEntryId);

      if (error) {
        console.error('Update Entry Error:', error);
        alert('Error updating: ' + error.message);
        return;
      }

      setEditingEntryId(null);
      resetForm();
      fetchEntries(selectedKisaanId);
    } else {
      const { error } = await supabase.from('kisaan_items').insert([
        {
          kisaan_id: selectedKisaanId,
          item_name: form.item_name,
          unit: finalUnit,
          quantity: qty,
          rate: rate,
          total_amount: total,
          type: form.type,
        },
      ]);

      if (error) {
        console.error('Insert Entry Error:', error);
        alert('Error adding entry: ' + error.message);
        return;
      }

      resetForm();
      fetchEntries(selectedKisaanId);
    }
  }

  function resetForm() {
    setForm({ type: 'kharch', item_name: '', unit: 'Bori', custom_unit: '', quantity: '', rate: '' });
  }

  function handleEditEntry(item) {
    setEditingEntryId(item.id);
    const isStandardUnit = ['Bori', 'Liter', 'Acre', 'Ghanti', 'Kg'].includes(item.unit);
    setForm({
      type: item.type || 'kharch',
      item_name: item.item_name,
      unit: isStandardUnit ? item.unit : 'Custom',
      custom_unit: isStandardUnit ? '' : item.unit,
      quantity: item.quantity,
      rate: item.rate,
    });
  }

  async function handleDeleteEntry(id) {
    if (window.confirm('Kya aap is entry ko delete karna chahte hain?')) {
      const { error } = await supabase.from('kisaan_items').delete().eq('id', id);
      if (error) {
        console.error('Delete Entry Error:', error);
        alert('Error deleting: ' + error.message);
        return;
      }
      fetchEntries(selectedKisaanId);
    }
  }

  async function handleUpdateKisaan(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('kisaans')
      .update({
        name: kisaanEditForm.name,
        zameen_acre: kisaanEditForm.zameen_acre,
      })
      .eq('id', selectedKisaanId);

    if (error) {
      console.error('Kisaan Update Error:', error);
      alert('Error updating kisaan: ' + error.message);
      return;
    }

    setIsEditingKisaan(false);
    fetchKisaans();
  }

  const totalKharch = entries.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Naya Kisaan Add Karein Button + Form */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">➕ Naya Kisaan Add Karein</h3>
          <button
            type="button"
            onClick={() => setShowAddKisaan(!showAddKisaan)}
            className="text-[10px] font-bold text-emerald-700 hover:underline"
          >
            {showAddKisaan ? 'Band Karein' : 'Naya Kisaan +'}
          </button>
        </div>

        {showAddKisaan && (
          <form onSubmit={handleAddKisaan} className="space-y-2 pt-3">
            <input
              type="text"
              placeholder="Kisaan Name *"
              value={newKisaanForm.name}
              onChange={(e) => setNewKisaanForm({ ...newKisaanForm, name: e.target.value })}
              required
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
            />
            <input
              type="text"
              placeholder="Zameen Acre (optional)"
              value={newKisaanForm.zameen_acre}
              onChange={(e) => setNewKisaanForm({ ...newKisaanForm, zameen_acre: e.target.value })}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
            >
              Kisaan Save Karein
            </button>
          </form>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={selectedKisaanId}
          onChange={(e) => setSelectedKisaanId(e.target.value)}
          className="w-full p-2.5 bg-white text-xs font-bold border border-stone-300 rounded-xl focus:outline-none"
        >
          {kisaans.length === 0 && <option value="">Koi Kisaan Nahi Hai</option>}
          {kisaans.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name} ({k.zameen_acre || 0} Acre)
            </option>
          ))}
        </select>
      </div>

      {selectedKisaan && (
        <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-2">
          {isEditingKisaan ? (
            <form onSubmit={handleUpdateKisaan} className="space-y-2 pt-1">
              <input
                type="text"
                value={kisaanEditForm.name}
                onChange={(e) => setKisaanEditForm({ ...kisaanEditForm, name: e.target.value })}
                placeholder="Kisaan Name"
                className="w-full p-2 text-xs text-stone-800 rounded-lg"
                required
              />
              <input
                type="text"
                value={kisaanEditForm.zameen_acre}
                onChange={(e) => setKisaanEditForm({ ...kisaanEditForm, zameen_acre: e.target.value })}
                placeholder="Zameen Acre"
                className="w-full p-2 text-xs text-stone-800 rounded-lg"
              />
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-amber-400 text-stone-900 font-bold px-3 py-1 rounded text-xs">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingKisaan(false)}
                  className="bg-emerald-800 text-white px-3 py-1 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold">
                    Active Kashtkaar
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h2 className="text-xl font-bold font-serif">{selectedKisaan.name}</h2>
                    <button
                      onClick={() => {
                        setIsEditingKisaan(true);
                        setKisaanEditForm({ name: selectedKisaan.name, zameen_acre: selectedKisaan.zameen_acre });
                      }}
                      className="text-xs bg-emerald-800 hover:bg-emerald-700 p-1 rounded-md text-amber-300"
                      title="Edit Kisaan"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  <p className="text-xs text-emerald-200">Zameen: {selectedKisaan.zameen_acre || 0} Acre</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-200">Kul Kharch Balance</span>
                  <p className="text-xl font-bold font-serif text-amber-300">Rs {totalKharch.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSaveEntry} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingEntryId ? '✍️ Entry Edit Karein' : 'Nayi Entry Add Karein'}
          </h3>
          {editingEntryId && (
            <button type="button" onClick={() => { setEditingEntryId(null); resetForm(); }} className="text-[10px] text-rose-600 font-bold">
              Cancel Edit
            </button>
          )}
        </div>

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
        >
          <option value="kharch">Kharch (DAP, Spray, Beej, Tractor)</option>
          <option value="aamdani">Paidawar / Aamdani (Gandum, Kapaas)</option>
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Item Name (e.g DAP)"
            value={form.item_name}
            onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            required
            className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
          />

          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none bg-stone-50"
          >
            <option value="Bori">Bori</option>
            <option value="Liter">Liter</option>
            <option value="Acre">Acre</option>
            <option value="Ghanti">Ghanti (Tractor)</option>
            <option value="Kg">Kg</option>
            <option value="Custom">Custom (Apna Likhain)</option>
          </select>
        </div>

        {form.unit === 'Custom' && (
          <input
            type="text"
            placeholder="Custom Unit (e.g. Nag / Ghoni / Cart)"
            value={form.custom_unit}
            onChange={(e) => setForm({ ...form, custom_unit: e.target.value })}
            className="w-full p-2.5 text-xs border border-amber-300 bg-amber-50 rounded-xl focus:outline-none"
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
          />
          <input
            type="number"
            placeholder="Rate/Unit"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
            className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
        >
          {editingEntryId ? 'Update Entry Save Karein' : 'Record Entry Save Karein'}
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-700">Khata Entries</h3>

        {loading ? (
          <p className="text-xs text-stone-400">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center border border-dashed rounded-2xl bg-white">
            <p className="text-xs text-stone-500">Is kisaan ki koi entry nahi hai.</p>
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center"
            >
              <div className="space-y-1">
                <p className="font-bold text-xs text-stone-800 uppercase">{item.item_name}</p>
                <p className="text-[11px] text-stone-500">
                  {item.quantity} {item.unit} × Rs {item.rate}
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleEditEntry(item)}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(item.id)}
                    className="text-[10px] text-rose-600 font-bold hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold text-sm ${item.type === 'aamdani' ? 'text-emerald-700' : 'text-stone-800'}`}>
                  Rs {Number(item.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
