import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  IndianRupee, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  History, 
  ArrowDownLeft, 
  CreditCard, 
  Users,
  Search,
  Filter,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';

const TYPE_BADGE = { 
  Salary: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
  Advance: 'bg-indigo-50 text-indigo-700 border-indigo-100', 
  Collection: 'bg-blue-50 text-blue-700 border-blue-100' 
};

const TYPE_ICONS = {
  Salary: <History size={14} />,
  Advance: <ArrowUpRight size={14} />,
  Collection: <ArrowDownLeft size={14} />
};

const TransactionModule = () => {
  const { api } = useAuth();
  const [txns, setTxns] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ userId: '', amount: '', type: 'Salary', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try { 
      const [t, u] = await Promise.all([
        api('get', '/api/admin/transactions'), 
        api('get', '/api/admin/users')
      ]); 
      setTxns(t.data); 
      setStaff(u.data.filter(u => u.role === 'Staff')); 
    } catch {
      console.error('Finance sync failed');
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.userId || !form.amount) return setError('Staff and Amount are mandatory');
    setSaving(true);
    setError('');
    try { 
      await api('post', '/api/admin/transactions', form); 
      setModal(false); 
      setForm({ userId: '', amount: '', type: 'Salary', description: '' }); 
      await load(); 
    } catch (e) { 
      setError(e.response?.data?.message || 'Transaction authorization failed'); 
    } finally { 
      setSaving(false); 
    }
  };

  const totalSalary = txns.filter(t => t.type === 'Salary').reduce((s, t) => s + t.amount, 0);
  const totalAdvance = txns.filter(t => t.type === 'Advance').reduce((s, t) => s + t.amount, 0);
  const totalColl = txns.filter(t => t.type === 'Collection').reduce((s, t) => s + t.amount, 0);

  const filteredTxns = txns.filter(t => 
    t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
             <IndianRupee size={32} className="text-blue-600" /> Fiscal Command
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Corporate financial ledger for <span className="text-blue-600 font-bold">Pradeep Enterprises</span></p>
        </div>
        <button 
           className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95"
           onClick={() => { setModal(true); setError(''); }}
        >
           <Plus size={22} /> INITIATE TRANSFER
        </button>
      </div>

      {/* Financial Health Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Outbound Salary', value: totalSalary, icon: <CreditCard size={28} />, color: 'emerald' },
          { label: 'Field Advances', value: totalAdvance, icon: <ArrowUpRight size={28} />, color: 'indigo' },
          { label: 'Net Collections', value: totalColl, icon: <ArrowDownLeft size={28} />, color: 'blue' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${s.color}-50 rounded-full opacity-50 group-hover:scale-125 transition-transform`}></div>
            <div className={`w-14 h-14 bg-${s.color}-50 text-${s.color}-600 rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 relative z-10">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 relative z-10">₹{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Transaction Control Board */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <History size={22} className="text-blue-600" /> Transaction Registry
           </h3>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ledger..." 
                className="pl-12 pr-6 py-3.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl w-full text-sm font-bold outline-none transition-all shadow-inner"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <th className="px-10 py-6">Beneficiary Personnel</th>
                    <th className="px-10 py-6">Transfer Class</th>
                    <th className="px-10 py-6">Capital Value</th>
                    <th className="px-10 py-6">Operational Context</th>
                    <th className="px-10 py-6 text-right">Auth Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {filteredTxns.length === 0 && (
                    <tr><td colSpan={5} className="px-10 py-32 text-center text-gray-300 font-bold italic">Zero fiscal movements detected.</td></tr>
                 )}
                 {filteredTxns.map(t => (
                    <tr key={t._id} className="group hover:bg-gray-50 transition-colors">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                                {t.userId?.name?.[0]}
                             </div>
                             <div>
                                <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{t.userId?.name || 'Unknown'}</p>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">PRADEEP ENTERPRISES</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 border w-fit ${TYPE_BADGE[t.type] || 'bg-gray-50 text-gray-500'}`}>
                             {TYPE_ICONS[t.type]} {t.type}
                          </span>
                       </td>
                       <td className="px-10 py-6">
                          <p className={`text-lg font-black ${t.type === 'Collection' ? 'text-blue-600' : 'text-gray-900'}`}>₹{Number(t.amount).toLocaleString()}</p>
                       </td>
                       <td className="px-10 py-6">
                          <p className="text-xs text-gray-500 font-bold max-w-[200px] truncate" title={t.description}>{t.description || 'Corporate Settlement'}</p>
                       </td>
                       <td className="px-10 py-6 text-right font-black text-gray-300 text-xs">
                          {new Date(t.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Initiate Transaction Modal */}
      {modal && (
         <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95">
               <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h3 className="text-2xl font-black text-gray-900 tracking-tight">Financial Authorizer</h3>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execute Authorized Capital Movement</p>
                  </div>
                  <button onClick={() => setModal(false)} className="p-3 bg-white hover:bg-gray-100 rounded-2xl text-gray-400 border border-gray-100 shadow-sm transition">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="p-10 space-y-8">
                  {error && <div className="bg-red-50 text-red-600 p-5 rounded-[2rem] border border-red-100 flex items-center gap-4 text-sm font-black"><AlertCircle size={20} /> {error}</div>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Personnel</label>
                        <select 
                           className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl p-4 text-gray-900 font-black outline-none transition-all appearance-none"
                           value={form.userId} 
                           onChange={e => setForm(x => ({...x, userId: e.target.value}))}
                        >
                           <option value="">Select Staff</option>
                           {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Transfer Class</label>
                        <select 
                           className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-black outline-none transition-all appearance-none"
                           value={form.type} 
                           onChange={e => setForm(x => ({...x, type: e.target.value}))}
                        >
                           <option>Salary</option>
                           <option>Advance</option>
                           <option>Collection</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Capital Value (₹)</label>
                     <input 
                        type="number" 
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl p-5 text-2xl font-black text-gray-900 outline-none transition-all placeholder:text-gray-300" 
                        value={form.amount} 
                        onChange={e => setForm(x => ({...x, amount: e.target.value}))}
                        placeholder="0.00"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Payment Reference / Context</label>
                     <textarea 
                        rows={3} 
                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl p-5 text-gray-900 font-bold outline-none transition-all placeholder:text-gray-300"
                        value={form.description} 
                        onChange={e => setForm(x => ({...x, description: e.target.value}))}
                        placeholder="e.g. Monthly salary for March 2024"
                     />
                  </div>
               </div>

               <div className="p-10 bg-gray-50/50 border-t border-gray-50 flex gap-6">
                  <button className="flex-1 bg-white hover:bg-gray-100 text-gray-500 font-black py-5 rounded-[1.5rem] border border-gray-100 shadow-sm transition-all" onClick={() => setModal(false)}>CANCEL</button>
                  <button 
                     className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all font-black uppercase tracking-[0.2em]" 
                     onClick={handleCreate} 
                     disabled={saving}
                  >
                     {saving ? 'PROCESSING FISCAL SYNC...' : 'AUTHORIZE SETTLEMENT'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TransactionModule;
