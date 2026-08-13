import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Godaam() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hideStockList, setHideStockList] = useState(false);

  const [form, setForm] = useState({
    item_name: '',
    quantity_in: '',
    unit: 'Bori',
    custom_unit: '',
    rate_per_unit: '',
  });

  useEffect(() => {
    fetchStock();
  }, []);

  async function fetchStock() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('godaam_stock')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stock:', error);
      alert('Error loading stock: ' + error.message);
    }
    setStock(data || []);
    setLoading(false);
  }

  async function handleSaveStock(e) {
    e.preventDefault();
    if (!form.item_name.trim()) return alert('Item Name likhna zaroori hai');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User session nahi mila, dobara login karein.");

    const finalUnit = form.unit === 'Custom' ? form.custom_unit.trim() || 'Unit' : form.unit;
    const qty = parseFloat(form.quantity_in) || 0;
    const rate = form.rate_per_unit ? parseFloat(form.rate_per_unit) || 0 : null;
    const totalAmount = rate !== null ? qty * rate : 0;

    const payload = {
      item_name: form.item_name.trim(),
      quantity_in: qty,
      unit: finalUnit,
      rate_per_unit: rate,
      total_amount: totalAmount,
      user_id: user.id
    };

    if (editingId) {
      const { error } = await supabase
        .from('godaam_stock')
        .update(payload)
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (!error) {
        setEditingId(null);
        resetForm();
        setShowForm(false);
        fetchStock();
      } else {
        alert('Error updating: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('godaam_stock').insert([payload]);
      if (!error) {
        resetForm();
        setShowForm(false);
        fetchStock();
      } else {
        alert('Error adding: ' + error.message);
      }
    }
  }

  function resetForm() {
    setForm({ item_name: '', quantity_in: '', unit: 'Bori', custom_unit: '', rate_per_unit: '' });
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setShowForm(true);
    const isStandardUnit = ['Bori', 'Kilo', 'Botal', 'Adad', 'Liter'].includes(item.unit);
    setForm({
      item_name: item.item_name || '',
      quantity_in: item.quantity_in ?? '',
      unit: isStandardUnit ? item.unit : 'Custom',
      custom_unit: isStandardUnit ? '' : item.unit || '',
      rate_per_unit: item.rate_per_unit ?? '',
    });
  }

  async function handleDelete(id) {
    if (window.confirm('Kya aap is stock entry ko delete karna chahte hain?')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('godaam_stock')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) fetchStock();
      else alert('Error deleting: ' + error.message);
    }
  }

  const totalStockEntries = stock.length;
  
  const totalGodaamValue = stock.reduce((sum, item) => {
    const qty = Number(item.quantity_in) || 0;
    const rate = Number(item.rate_per_unit) || 0;
    const total = item.total_amount ? Number(item.total_amount) : qty * rate;
    return sum + total;
  }, 0);

  const totalQuantity = stock.reduce((sum, item) => sum + (Number(item.quantity_in) || 0), 0);

  const itemBreakdown = {};
  stock.forEach((s) => {
    const key = (s.item_name || 'Ather').trim().toUpperCase();
    const qty = Number(s.quantity_in) || 0;
    const rate = Number(s.rate_per_unit) || 0;
    const amount = s.total_amount ? Number(s.total_amount) : qty * rate;

    if (!itemBreakdown[key]) {
      itemBreakdown[key] = { quantity: 0, unit: s.unit || '', amount: 0 };
    }
    itemBreakdown[key].quantity += qty;
    itemBreakdown[key].amount += amount;
  });

  const itemBreakdownList = Object.keys(itemBreakdown).map((name) => ({
    name,
    ...itemBreakdown[name],
  }));

  function exportToCSV() {
    if (!stock.length) return alert('Koi stock entry nahi hai export karne ke liye');
    const headers = ['Item Name', 'Quantity In', 'Unit', 'Rate Per Unit', 'Total Value'];
    const rows = stock.map((s) => {
      const qty = Number(s.quantity_in) || 0;
      const rate = Number(s.rate_per_unit) || 0;
      const total = s.total_amount ? Number(s.total_amount) : qty * rate;
      return [
        `"${s.item_name}"`,
        s.quantity_in,
        `"${s.unit}"`,
        s.rate_per_unit || 0,
        total
      ];
    });
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `godaam_stock_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-[#1e3a29] text-white p-4 rounded-2xl shadow-md space-y-1">
        <span className="text-[9px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-bold">
          Inventory Management
        </span>
        <div className="flex justify-between items-end mt-1">
          <div>
            <h2 className="text-xl font-bold font-serif">Godaam Stock 🏪</h2>
            <p className="text-xs text-emerald-200">Kul Stock Entries: {totalStockEntries}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200">Kul Mal Maleyat</span>
            <p className="text-xl font-bold font-serif text-amber-300">
              Rs {totalGodaamValue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Total Entries</p>
          <p className="text-xs font-bold text-[#1e3a29] mt-0.5">{totalStockEntries}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Total Quantity</p>
          <p className="text-xs font-bold text-amber-600 mt-0.5">{totalQuantity.toLocaleString()}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm text-center">
          <p className="text-[8px] text-stone-500 font-bold uppercase">Kul Worth</p>
          <p className="text-xs font-bold text-emerald-700 mt-0.5">Rs {totalGodaamValue.toLocaleString()}</p>
        </div>
      </div>

      {itemBreakdownList.length > 0 && (
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm">
          <h4 className="text-[10px] font-bold text-stone-600 uppercase mb-2">📦 Item Wise Khulasa</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {itemBreakdownList.map((item, idx) => (
              <div key={idx} className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-[10px]">
                <p className="font-bold text-stone-800 truncate">{item.name}</p>
                <p className="text-stone-500">
                  {item.quantity} {item.unit}
                </p>
                <p className="font-bold text-emerald-700">Rs {item.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#1e3a29]">
            {editingId ? '✍️ Stock Edit Karein' : '➕ Naya Stock Add Karein'}
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
            {showForm || editingId ? 'Band Karein' : 'Add Stock +'}
          </button>
        </div>

        {(showForm || editingId) && (
          <form onSubmit={handleSaveStock} className="space-y-3 pt-3">
            <input
              type="text"
              placeholder="Item Name (e.g. DAP / Beej / Urea)"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              required
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="any"
                placeholder="Quantity In *"
                value={form.quantity_in}
                onChange={(e) => setForm({ ...form, quantity_in: e.target.value })}
                required
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
              />

              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none bg-stone-50"
              >
                <option value="Bori">Bori</option>
                <option value="Kilo">Kilo</option>
                <option value="Botal">Botal</option>
                <option value="Adad">Adad</option>
                <option value="Liter">Liter</option>
                <option value="Custom">Custom (Apna Likhain)</option>
              </select>
            </div>

            {form.unit === 'Custom' && (
              <input
                type="text"
                placeholder="Custom Unit (e.g. Cart / Packet)"
                value={form.custom_unit}
                onChange={(e) => setForm({ ...form, custom_unit: e.target.value })}
                className="w-full p-2.5 text-xs border border-amber-300 bg-amber-50 rounded-xl focus:outline-none"
              />
            )}

            <input
              type="number"
              step="any"
              placeholder="Rate Per Unit (Optional)"
              value={form.rate_per_unit}
              onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-[#1e3a29] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#162c1f]"
            >
              {editingId ? 'Update Stock Save Karein' : 'Record Stock Save Karein'}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xs font-bold text-stone-700">Mawjooda Stock History</h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-[10px] text-stone-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={hideStockList}
                onChange={(e) => setHideStockList(e.target.checked)}
              />
              Hide List
            </label>
            <button onClick={exportToCSV} className="text-[10px] font-bold text-emerald-700 hover:underline">
              📊 Export to Excel
            </button>
          </div>
        </div>

        {!hideStockList && (
          <>
            {loading ? (
              <p className="text-xs text-stone-400">Loading stock...</p>
            ) : stock.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-2xl bg-white">
                <p className="text-xs text-stone-500">Godaam me koi entry darj nahi hai.</p>
              </div>
            ) : (
              stock.map((s) => {
                const qty = Number(s.quantity_in) || 0;
                const rate = Number(s.rate_per_unit) || 0;
                const total = s.total_amount ? Number(s.total_amount) : qty * rate;

                return (
                  <div
                    key={s.id}
                    className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-stone-800 uppercase">{s.item_name}</p>
                      <p className="text-[11px] text-stone-500">
                        {s.quantity_in} {s.unit} {s.rate_per_unit ? `× Rs ${s.rate_per_unit}` : ''}
                      </p>
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="text-[10px] text-blue-600 font-bold hover:underline"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-[10px] text-rose-600 font-bold hover:underline"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-sm text-emerald-700">
                        Rs {total.toLocaleString()}
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
