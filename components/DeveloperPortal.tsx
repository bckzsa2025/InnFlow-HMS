
import React, { useState } from 'react';
import { ShieldCheck, Plus, LogIn, Activity, Cloud, X, Save, Trash2 } from 'lucide-react';
import { Tenant } from '../types';

interface DeveloperPortalProps {
  tenants: Tenant[];
  onUpdate: (tenants: Tenant[]) => void;
  onImpersonate?: (tenantName: string) => void;
  onLog?: (action: string, details: string) => void;
}

const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ tenants, onUpdate, onImpersonate, onLog }) => {
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant> | null>(null);

  const handleSaveTenant = () => {
    if (!editingTenant) return;
    if (editingTenant.id) {
      onUpdate(tenants.map(t => t.id === editingTenant.id ? (editingTenant as Tenant) : t));
      onLog?.('TENANT_UPDATED', `Updated configuration for tenant ${editingTenant.name}`);
    } else {
      const newTenant: Tenant = {
        ...(editingTenant as Tenant),
        id: Math.random().toString(36).substr(2, 9),
        users: editingTenant.users || 0
      } as Tenant;
      onUpdate([...tenants, newTenant]);
      onLog?.('TENANT_CREATED', `Created new tenant guesthouse: ${newTenant.name}`);
    }
    setEditingTenant(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-blue-600" /> Platform Admin
          </h1>
          <p className="text-slate-500">Multi-tenant infrastructure control panel.</p>
        </div>
        <button 
          onClick={() => setEditingTenant({ name: '', plan: 'Starter', status: 'Active', users: 1 })}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition"
        >
          <Plus size={20} /> New Business
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusBox icon={<Activity className="text-emerald-500" />} label="Avg Response" value="48ms" color="bg-emerald-50" />
        <StatusBox icon={<Cloud className="text-blue-500" />} label="AWS Region" value="eu-west-1" color="bg-blue-50" />
        <StatusBox icon={<Activity className="text-violet-500" />} label="Database Load" value="14%" color="bg-violet-50" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Managed Clients</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Guesthouse / Lodge</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: T-{t.id}</p>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-600">{t.plan}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditingTenant(t)} className="p-2 text-slate-400 hover:text-slate-900"><Plus size={16} /></button>
                    <button 
                      onClick={() => onImpersonate?.(t.name)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2"
                    >
                      <LogIn size={18} /> <span className="text-xs font-bold hidden md:inline">Manage</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-bold uppercase tracking-tight">{editingTenant.id ? 'Edit Tenant' : 'New Tenant'}</h3>
              <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveTenant(); }} className="p-8 space-y-6">
              <InputGroup label="Business Name" value={editingTenant.name || ''} onChange={v => setEditingTenant({...editingTenant, name: v})} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Type</label>
                  <select 
                    value={editingTenant.plan} 
                    onChange={e => setEditingTenant({...editingTenant, plan: e.target.value as any})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</label>
                  <select 
                    value={editingTenant.status} 
                    onChange={e => setEditingTenant({...editingTenant, status: e.target.value as any})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Trialing">Trialing</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2">
                <Save size={20} /> Register & Provision
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBox: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className={`p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 ${color}`}>
    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 leading-none mt-1">{value}</p>
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <input 
      type={type} 
      required
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
    />
  </div>
);

export default DeveloperPortal;
