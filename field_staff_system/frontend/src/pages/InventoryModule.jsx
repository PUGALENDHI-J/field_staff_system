import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Trash2, 
  Search, 
  Plus, 
  ArrowRight, 
  RefreshCcw,
  AlertCircle,
  X,
  History,
  TrendingDown
} from 'lucide-react';

const InventoryModule = () => {
  const { api } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ itemName: '', quantity: 0, price: 0, minLevel: 5 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api('get', '/api/admin/stocks');
      setStocks(data);
    } catch {
      console.error('Stock fetch fail');
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.itemName) return setError('Item name is required');
    if (form.price <= 0) return setError('Price must be greater than 0');
    setSaving(true);
    try { await api('post', '/api/admin/stocks', form); setModal(false); setForm({ itemName: '', quantity: 0, price: 0, minLevel: 5 }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => { if (window.confirm('Delete item?')) { await api('delete', `/api/admin/stocks/${id}`); await load(); } };

  const addQty = async (id, amount) => {
    try {
      await api('put', `/api/admin/stocks/${id}`, { quantity: amount });
      await load();
    } catch {
      console.error('Quantity update failed');
    }
  };

  const filtered = stocks.filter(s => s.itemName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
             <Package size={32} className="text-blue-600" /> Asset Control
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage hardware and field equipment</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all font-bold"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <button 
              className="bg-gray-900 hover:bg-black text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-xl transition-all active:scale-95"
              onClick={() => { setModal(true); setError(''); }}
           >
              <Plus size={20} /> REGISTER ASSET
           </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s => (
          <div key={s._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {s.quantity <= s.minLevel && (
               <div className="absolute top-0 right-0 p-3 bg-red-500 text-white rounded-bl-3xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                  LOW STOCK
               </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.quantity <= s.minLevel ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Package size={28} />
               </div>
               <button onClick={() => del(s._id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
               </button>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1">{s.itemName}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
               <History size={12} /> RE-ORDER LEVEL: {s.minLevel}
            </p>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Available</p>
                  <p className={`text-4xl font-black ${s.quantity <= s.minLevel ? 'text-red-600' : 'text-gray-900'}`}>{s.quantity}</p>
               </div>
               <div className="flex flex-col gap-2">
                  <button onClick={() => addQty(s._id, 1)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                     <Plus size={20} />
                  </button>
                  <button onClick={() => addQty(s._id, -1)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                     <TrendingDown size={20} className="rotate-90" />
                  </button>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
               <span>Pradeep Enterprises</span>
               <span className="flex items-center gap-1">SYNCED <RefreshCcw size={10} /></span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="lg:col-span-3 py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
              <Package size={48} className="text-gray-200" />
              <p className="font-bold text-gray-400">No matching assets found in local registry.</p>
           </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight">New Asset</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory Registry Control</p>
                  </div>
                  <button onClick={() => setModal(false)} className="p-3 bg-white hover:bg-gray-100 rounded-2xl text-gray-400 border border-gray-100 shadow-sm transition">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="p-10 space-y-6">
                  {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-black"><AlertCircle size={18} /> {error}</div>}
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Hardware / Part Name</label>
                     <input className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all placeholder:text-gray-300" value={form.itemName} onChange={e => setForm(x => ({...x, itemName: e.target.value}))} placeholder="e.g. Wi-Fi Router Model X" />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Initial Qty</label>
                        <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.quantity} onChange={e => setForm(x => ({...x, quantity: parseInt(e.target.value)}))} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Price (₹)</label>
                        <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.price} onChange={e => setForm(x => ({...x, price: parseFloat(e.target.value)}))} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min Level (Alert)</label>
                        <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.minLevel} onChange={e => setForm(x => ({...x, minLevel: parseInt(e.target.value)}))} />
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
                  <button className="flex-1 bg-white hover:bg-gray-100 text-gray-500 font-black py-4 rounded-2xl border border-gray-100 shadow-sm" onClick={() => setModal(false)}>CANCEL</button>
                  <button className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all font-black uppercase tracking-widest" onClick={handleCreate} disabled={saving}>{saving ? 'PROCESSING...' : 'AUTHORIZE ENTRY'}</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default InventoryModule;
