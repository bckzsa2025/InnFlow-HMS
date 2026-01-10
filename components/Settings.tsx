
import React, { useState } from 'react';
import { Property, Room, RoomPosition, SeasonalRate, UserRole } from '../types';
import { Save, Image as ImageIcon, MessageSquare, Calendar, Grid3X3, Plus, Trash2, MapPin, Mail, Phone, Layout, ChevronRight, Star, ShieldCheck, Globe, Maximize2 } from 'lucide-react';

interface SettingsProps {
  property: Property;
  userRole: UserRole;
  onUpdate: (property: Property) => void;
  onLog?: (action: string, details: string) => void;
  rooms: Room[];
}

const Settings: React.FC<SettingsProps> = ({ property, userRole, onUpdate, onLog, rooms }) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'notifications' | 'seasonal' | 'layout' | 'developer'>('branding');

  const handlePropertyChange = (field: keyof Property, value: any) => {
    onUpdate({ ...property, [field]: value });
  };

  const handleSave = () => {
    onLog?.('SETTINGS_UPDATED', 'Global property configuration committed');
    alert('Configuration saved to cluster!');
  };

  const addSeasonalRate = () => {
    const newRate: SeasonalRate = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Season',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      multiplier: 1.2
    };
    onUpdate({ ...property, seasonalRates: [...property.seasonalRates, newRate] });
  };

  const updateSeasonalRate = (id: string, updates: Partial<SeasonalRate>) => {
    onUpdate({
      ...property,
      seasonalRates: property.seasonalRates.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeSeasonalRate = (id: string) => {
    onUpdate({
      ...property,
      seasonalRates: property.seasonalRates.filter(r => r.id !== id)
    });
  };

  const updateRoomPosition = (roomId: string, updates: Partial<RoomPosition>) => {
    onUpdate({
      ...property,
      layoutGrid: property.layoutGrid.map(p => p.roomId === roomId ? { ...p, ...updates } : p)
    });
  };

  const tabs = [
    { id: 'branding', label: 'Identity', icon: <ImageIcon size={16} /> },
    { id: 'notifications', label: 'Comms', icon: <MessageSquare size={16} /> },
    { id: 'seasonal', label: 'Yield', icon: <Calendar size={16} /> },
    { id: 'layout', label: 'Mapping', icon: <Grid3X3 size={16} /> },
    ...(userRole === UserRole.DEVELOPER ? [{ id: 'developer', label: 'Platform', icon: <ShieldCheck size={16} /> }] : []),
  ] as const;

  return (
    <div className="max-w-[70rem] mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Cluster <span className="text-blue-600 italic">Settings</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Fine-tune branding, yield management, and operational communications.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
          <Save size={20} /> Commit Config
        </button>
      </div>

      <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm overflow-x-auto gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-3 flex-1 min-w-[140px] py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Layout size={20} /></div>
                 Master Identity Module
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Property Title" value={property.name} onChange={v => handlePropertyChange('name', v)} />
                <InputGroup label="Primary Accent Color" type="color" value={property.primaryColor} onChange={v => handlePropertyChange('primaryColor', v)} />
                <InputGroup label="Contact Email" icon={<Mail size={14}/>} value={property.contactEmail} onChange={v => handlePropertyChange('contactEmail', v)} />
                <InputGroup label="Contact WhatsApp" icon={<Phone size={14}/>} value={property.contactPhone} onChange={v => handlePropertyChange('contactPhone', v)} />
                <InputGroup label="Property Logo URL" className="md:col-span-2" value={property.logoUrl || ''} onChange={v => handlePropertyChange('logoUrl', v)} />
                <InputGroup label="Hero Header URL" className="md:col-span-2" value={property.headerImageUrl || ''} onChange={v => handlePropertyChange('headerImageUrl', v)} />
                <InputGroup label="Physical Address" icon={<MapPin size={14}/>} className="md:col-span-2" value={property.address} onChange={v => handlePropertyChange('address', v)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                 <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center"><MessageSquare size={20} /></div>
                 Automated Comms Engine
              </h3>
              <div className="grid grid-cols-1 gap-8">
                <InputGroup label="Staff Alert WhatsApp" icon={<Phone size={14} />} value={property.staffWhatsapp} onChange={v => handlePropertyChange('staffWhatsapp', v)} />
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Guest Confirmation Template</label>
                    <textarea 
                    rows={6} 
                    className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm leading-relaxed font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none shadow-inner"
                    value={property.whatsappTemplate}
                    onChange={e => handlePropertyChange('whatsappTemplate', e.target.value)}
                    />
                    <div className="flex flex-wrap gap-3 pt-4 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Dynamic Variables:</span>
                    {['guest', 'ref', 'date', 'property'].map(v => (
                        <code key={v} className="text-[11px] bg-white text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 font-black">{"{{"}{v}{"}}"}</code>
                    ))}
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seasonal' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                  <div className="h-10 w-10 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center"><Calendar size={20} /></div>
                  Yield Management Logic
                </h3>
                <button onClick={addSeasonalRate} className="flex items-center gap-3 text-blue-600 text-[10px] font-black uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-100 transition-all active:scale-95 shadow-sm">
                  <Plus size={16} /> New Rule
                </button>
              </div>
              <div className="space-y-6">
                {property.seasonalRates.map(rate => (
                  <div key={rate.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-200 items-end hover:bg-slate-50 transition-colors">
                    <InputGroup label="Season Name" value={rate.name} onChange={v => updateSeasonalRate(rate.id, { name: v })} />
                    <InputGroup label="Start Date" type="date" value={rate.startDate} onChange={v => updateSeasonalRate(rate.id, { startDate: v })} />
                    <InputGroup label="End Date" type="date" value={rate.endDate} onChange={v => updateSeasonalRate(rate.id, { endDate: v })} />
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <InputGroup label="Rate Multiplier" type="number" step="0.1" value={rate.multiplier.toString()} onChange={v => updateSeasonalRate(rate.id, { multiplier: parseFloat(v) })} />
                      </div>
                      <button onClick={() => removeSeasonalRate(rate.id)} className="mb-2 p-4 text-red-500 bg-white hover:bg-red-50 rounded-2xl border border-red-100 shadow-sm transition-all active:scale-90">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4 mb-10">
                  <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><Grid3X3 size={20} /></div>
                  Schematic Architecture Editor
               </h3>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scroll">
                    {rooms.map(room => {
                      const pos = property.layoutGrid.find(p => p.roomId === room.id) || { roomId: room.id, x: 0, y: 0, w: 1, h: 1 };
                      return (
                        <div key={room.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px]">{room.roomNumber}</span>
                            <span className="font-black text-xs uppercase tracking-tight">{room.roomType}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            <InputGroup label="X Pos" type="number" value={pos.x.toString()} onChange={v => updateRoomPosition(room.id, { x: parseInt(v) })} />
                            <InputGroup label="Y Pos" type="number" value={pos.y.toString()} onChange={v => updateRoomPosition(room.id, { y: parseInt(v) })} />
                            <InputGroup label="Width" type="number" value={pos.w.toString()} onChange={v => updateRoomPosition(room.id, { w: parseInt(v) })} />
                            <InputGroup label="Height" type="number" value={pos.h.toString()} onChange={v => updateRoomPosition(room.id, { h: parseInt(v) })} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-slate-900 rounded-[3rem] p-10 relative aspect-square overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    <div className="relative grid grid-cols-6 grid-rows-6 gap-2 h-full w-full">
                       {property.layoutGrid.map(pos => {
                         const room = rooms.find(r => r.id === pos.roomId);
                         if (!room) return null;
                         return (
                           <div 
                             key={pos.roomId}
                             style={{ gridColumn: `span ${pos.w}`, gridRow: `span ${pos.h}` }}
                             className="bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-lg backdrop-blur-sm"
                           >
                             {room.roomNumber}
                           </div>
                         );
                       })}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'developer' && userRole === UserRole.DEVELOPER && (
           <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-slate-950 p-12 rounded-[3.5rem] shadow-2xl text-white space-y-10">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30"><Globe size={20} /></div>
                    Platform Infrastructure Root
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputGroup dark label="Global App Identifier" value="INNFLOW_SaaS_01" onChange={() => {}} />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Hard Reset Reference Counter</label>
                        <button 
                            onClick={() => handlePropertyChange('lastRefNumber', 0)}
                            className="w-full p-5 bg-red-600/10 border border-red-600/30 text-red-500 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                        >
                            Reset Ref to INF-0000
                        </button>
                    </div>
                </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string, className?: string, step?: string, icon?: React.ReactNode, dark?: boolean }> = ({ label, value, onChange, type = "text", className = "", step, icon, dark }) => (
  <div className={`space-y-2 ${className}`}>
    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
      {icon} {label}
    </label>
    <input 
      type={type} 
      step={step}
      value={value} 
      onChange={e => onChange(e.target.value)}
      className={`w-full p-5 border rounded-[1.5rem] text-sm font-bold focus:ring-4 outline-none transition-all shadow-sm ${
        dark 
            ? 'bg-slate-900 border-slate-800 text-white focus:ring-blue-500/20' 
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-500/10'
      }`} 
    />
  </div>
);

export default Settings;
