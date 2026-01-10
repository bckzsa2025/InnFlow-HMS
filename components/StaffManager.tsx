
import React, { useState } from 'react';
import { UserRole, StaffMember } from '../types';
import { Shield, Plus, Mail, ShieldAlert, Trash2, Edit2, X, Save, User as UserIcon } from 'lucide-react';

interface StaffManagerProps {
  staff: StaffMember[];
  onUpdate: (staff: StaffMember[]) => void;
  onLog: (action: string, details: string) => void;
}

const StaffManager: React.FC<StaffManagerProps> = ({ staff, onUpdate, onLog }) => {
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);

  const handleSaveStaff = () => {
    if (!editingStaff) return;
    if (editingStaff.id) {
      onUpdate(staff.map(s => s.id === editingStaff.id ? (editingStaff as StaffMember) : s));
      onLog('STAFF_UPDATED', `Updated details for ${editingStaff.name}`);
    } else {
      const newStaff: StaffMember = {
        ...(editingStaff as StaffMember),
        id: `s_${Math.random().toString(36).substr(2, 9)}`,
        lastLogin: 'Never',
        access: editingStaff.access || ['General']
      } as StaffMember;
      onUpdate([...staff, newStaff]);
      onLog('STAFF_CREATED', `Invited new staff member: ${newStaff.name}`);
    }
    setEditingStaff(null);
  };

  const removeStaff = (id: string, name: string) => {
    if(confirm(`Are you sure you want to revoke access for ${name}?`)) {
      onUpdate(staff.filter(s => s.id !== id));
      onLog('STAFF_REMOVED', `Revoked access for user: ${name}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-blue-600" /> Staff & Access Control
          </h1>
          <p className="text-slate-500 text-sm">Control guesthouse management access.</p>
        </div>
        <button 
          onClick={() => setEditingStaff({ name: '', email: '', role: UserRole.STAFF, access: ['Bookings'] })}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition shadow-xl"
        >
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${s.role === UserRole.BUSINESS_ADMIN ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Shield size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${s.role === UserRole.BUSINESS_ADMIN ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                  {s.role.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">{s.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mt-1">
                <Mail size={12} /> {s.email}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permitted Access</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.access.map(a => (
                    <span key={a} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <button onClick={() => setEditingStaff(s)} className="flex-1 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition border border-slate-200">
                Edit Permissions
              </button>
              <button onClick={() => removeStaff(s.id, s.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-bold uppercase tracking-tight">{editingStaff.id ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button onClick={() => setEditingStaff(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveStaff(); }} className="p-8 space-y-6">
              <div className="space-y-4">
                <InputGroup label="Full Name" value={editingStaff.name || ''} onChange={v => setEditingStaff({...editingStaff, name: v})} />
                <InputGroup label="Email Address" type="email" value={editingStaff.email || ''} onChange={v => setEditingStaff({...editingStaff, email: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                  <select 
                    value={editingStaff.role} 
                    onChange={e => setEditingStaff({...editingStaff, role: e.target.value as UserRole})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                  >
                    <option value={UserRole.STAFF}>Regular Staff</option>
                    <option value={UserRole.BUSINESS_ADMIN}>Business Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2">
                <Save size={20} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default StaffManager;
