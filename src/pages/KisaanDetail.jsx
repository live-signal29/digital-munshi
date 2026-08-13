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

  const [showAddKisaan, setShowAddKisaan] = useState(false);
  const [newKisaanForm, setNewKisaanForm] = useState({ name: '', zameen_acre: '' });

  const [showEntryForm, setShowEntryForm] = useState(false);
  const [hideEntries, setHideEntries] = useState(false);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('kisaans')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', 'kisaan')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Kisaans Error:', error);
      alert('Error loading kisaans: ' + error.message);
      return;
    }
    
    if (data && data.length > 0) {
      setKisaans(data);
      setSelectedKisaanId((prev) => prev || data[0].id);
    } else {
      setKisaans([]);
      setSelectedKisaanId('');
    }
  }

  async function fetchEntries(kisaanId) {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('kisaan_items')
      .select('*')
      .eq('kisaan_id', kisaanId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Entries Error:', error);
      alert('Error loading entries: ' + error.message);
    }

    setEntries(data || []);
    setLoading(false);
  }

  const selectedKisaan = kisaans.find((k) => k.id === selectedKisaanId);

  async function handleAddKisaan(e) {
    e.preventDefault();
    if (!newKisaanForm.name.trim()) return alert('Kisaan ka naam likhna zaroori hai');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User session nahi mila, dobara login karein.");

    const acreValue = parseFloat(newKisaanForm.zameen_acre) || 0;

    const { data, error } = await supabase
      .from('kisaans')
      .insert([
        {
          name: newKisaanForm.name.trim(),
          zameen_acre: acreValue,
          category: 'kisaan',
          user_id: user.id
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
    if (!form.item_name.trim()) return alert('Item name likhna zaroori hai');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User session nahi mila, dobara login karein.");

    const finalUnit = form.unit === 'Custom' ? form.custom_unit.trim() || 'Unit' : form.unit;
    const qty = parseFloat(form.quantity) || 0;
    const rate = parseFloat(form.rate) || 0;
    const total = qty * rate;

    const entryData = {
      item_name: form.item_name.trim(),
      unit: finalUnit,
      quantity: qty,
      rate: rate,
      total_amount: total,
      type: form.type,
      user_id: user.id
    };

    if (editingEntryId) {
      const { error } = await supabase
        .from('kisaan_items')
        .update(entryData)
        .eq('id', editingEntryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Update Entry Error:', error);
        alert('Error updating: ' + error.message);
        return;
      }

      setEditingEntryId(null);
      resetForm();
      setShowEntryForm(false);
      fetchEntries(selectedKisaanId);
    } else {
      const { error } = await supabase.from('kisaan_items').insert([
        {
          kisaan_id: selectedKisaanId,
          ...entryData,
        },
      ]);

      if (error) {
        console.error('Insert Entry Error:', error);
        alert('Error adding entry: ' + error.message);
        return;
      }

      resetForm();
      setShowEntryForm(false);
      fetchEntries(selectedKisaanId);
    }
  }

  function resetForm() {
    setForm({ type: 'kharch', item_name: '', unit: 'Bori', custom_unit: '', quantity: '', rate: '' });
  }

  function handleEditEntry(item) {
    setEditingEntryId(item.id);
    setShowEntryForm(true);
    const isStandardUnit = ['Bori', 'Liter', 'Acre', 'Ghanti', 'Kg'].includes(item.unit);
    setForm({
      type: item.type || 'kharch',
      item_name: item.item_name || '',
      unit: isStandardUnit ? item.unit : 'Custom',
      custom_unit: isStandardUnit ? '' : item.unit || '',
      quantity: item.quantity ?? '',
      rate: item.rate ?? '',
    });
  }

  async function handleDeleteEntry(id) {
    if (window.confirm('Kya aap is entry ko delete karna chahte hain?')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('kisaan_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const acreValue = parseFloat(kisaanEditForm.zameen_acre) || 0;

    const { error } = await supabase
      .from('kisaans')
      .update({
        name: kisaanEditForm.name.trim(),
        zameen_acre: acreValue,
      })
      .eq('id', selectedKisaanId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Kisaan Update Error:', error);
      alert('Error updating kisaan: ' + error.message);
      return;
    }

    setIsEditingKisaan(false);
    fetchKisaans();
  }

  const totalKharch = entries
    .filter((e) => e.type === 'kharch')
    .reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

  const totalAamdani = entries
    .filter((e) => e.type === 'aamdani')
    .reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);

  const netBalance = totalAamdani - totalKharch;

  const itemBreakdown = {};
  entries.forEach((e) => {
    const key = (e.item_name || 'Ather').trim().toUpperCase();
    if (!itemBreakdown[key]) {
      itemBreakdown[key] = { quantity: 0, unit: e.unit || '', amount: 0, type: e.type };
    }
    itemBreakdown[key].quantity += Number(e.quantity || 0);
    itemBreakdown[key].amount += Number(e.total_amount || 0);
  });

  const itemBreakdownList = Object.keys(itemBreakdown).map((name) => ({
    name,
    ...itemBreakdown[name],
  }));

  function exportToCSV() {
    if (!entries.length) return alert('Koi entry nahi hai export karne ke liye');
    const headers = ['Item Name', 'Type', 'Quantity', 'Unit', 'Rate', 'Total Amount'];
    const rows = entries.map((e) => [
      `"${e.item_name}"`,
      e.type,
      e.quantity,
      `"${e.unit}"`,
      e.rate,
      e.total_amount
    ]);
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedKisaan?.name || 'kisaan'}_entries.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
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
              type="number"
              step="any"
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
                type="number"
                step="any"
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
                        setKisaanEditForm({ name: selectedKisaan.name, zameen_acre: selectedKisaan.zameen_acre || '' });
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

      {selectedKisaan && (
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm text-center">
            <p className="text-[8px] text-stone-500 font-bold uppercase">Entries</p>
            <p className="text-xs font-bold text-[#1e3a29] mt-0.5">{entries.length}</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm text-center">
            <p className="text-[8px] text-stone-500 font-bold uppercase">Kharch</p>
            <p className="text-xs font-bold text-rose-600 mt-0.5">Rs {totalKharch.toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm text-center">
            <p className="text-[8px] text-stone-500 font-bold uppercase">Aamdani</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">Rs {totalAamdani.toLocaleString()}</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm text-center">
            <p className="text-[8px] text-stone-500 font-bold uppercase">Balance</p>
            <p className={`text-xs font-bold mt-0.5 ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              Rs {netBalance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {selectedKisaan && itemBreakdownList.length > 0 && (
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-stone-600 uppercase mb-2">📦 Item Wise Khulasa</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {itemBreakdownList.map((item, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-[10px] ${
                  item.type === 'aamdani' ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <p className="font-bold text-stone-800 truncate">{item.name}</p>
                <p className="text-stone-500">
                  {item.quantity} {item.unit}
                </p>
                <p className={`font-bold ${item.type === 'aamdani' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  Rs {item.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingEntryId ? '✍️ Entry Edit Karein' : '➕ Nayi Entry Add Karein'}
          </h3>
          <button
            type="button"
            onClick={() => {
              if (editingEntryId) {
                setEditingEntryId(null);
                resetForm();
                setShowEntryForm(false);
              } else {
                setShowEntryForm(!showEntryForm);
              }
            }}
            className="text-[10px] font-bold text-emerald-700 hover:underline"
          >
            {showEntryForm || editingEntryId ? 'Band Karein' : 'Entry Add +'}
          </button>
        </div>

        {(showEntryForm || editingEntryId) && (
          <form onSubmit={handleSaveEntry} className="space-y-3 pt-3">
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
                step="any"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
              />
              <input
                type="number"
                step="any"
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
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-stone-700">Khata Entries</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1 text-[10px] text-stone-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hideEntries}
                onChange={(e) => setHideEntries(e.target.checked)}
              />
              Hide List
            </label>
            <button onClick={exportToCSV} className="text-[10px] font-bold text-emerald-700 hover:underline">
              📊 Export to Excel / CSV
            </button>
          </div>
        </div>

        {!hideEntries && (
          <>
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
                      Rs {Number(item.total_amount || 0).toLocaleString()}
                    </p>
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
