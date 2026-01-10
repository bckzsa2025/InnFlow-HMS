import React, { useState, useMemo } from 'react';
import { Room } from '../types';
import { Plus, Edit2, Trash2, Users, BedDouble, Search, X, Save, ShieldCheck, Waves, Wind } from 'lucide-react';

interface RoomManagerProps {
  rooms: Room[];
  onUpdate: (rooms: Room[]) => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ rooms, onUpdate }) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'BLOCKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);

  const toggleMaintenance = (id: string) => {
    onUpdate(rooms.map(r => r.id === id ? { ...r, status: r.status === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE' } : r));
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;
    
    if (editingRoom.id) {
      onUpdate(rooms.map(r => r.id === editingRoom.id ? (editingRoom as Room) : r));
    } else {
      const newRoom: Room = {
        ...(editingRoom as Room),
        id: `r_${Math.random().toString(36).substr(2, 9)}`,
        propertyId: rooms[0]?.propertyId || 'prop_001',
        status: editingRoom.status || 'ACTIVE'
      } as Room;
      onUpdate([...rooms, newRoom]);
    }
    setEditingRoom(null);
  };

  const handleDeleteRoom = (id: string) => {
    if (confirm('Are you sure you want to remove this room? Existing bookings will remain but the room will be removed from inventory.')) {
      onUpdate(rooms.filter(r => r.id !== id));
    }
  };

  const counts = useMemo(() => ({
    ALL: rooms.length,
    ACTIVE: rooms.filter(r => r.status === 'ACTIVE').length,
    MAINTENANCE: rooms.filter(r => r.status === 'MAINTENANCE').length,
    BLOCKED: rooms.filter(r => r.status === 'BLOCKED').length,
  }), [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesSearch = r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.roomType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rooms, statusFilter, searchQuery]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Inventory <span className="text-blue-600 italic">Control</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Manage and provision luxury spaces within your property cluster.</p>
        </div>
        <button 
          onClick={() => setEditingRoom({ roomNumber: '', roomType: '', capacity: 2, pricePerNight: 1000, description: '', images: ['https://picsum.photos/800/600'], status: 'ACTIVE' })}
          className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
        >
          <Plus size={20} /> Register Unit
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 flex items-center gap-3 bg-white px-6 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search catalog by identifier or classification..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none font-bold" 
          />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[1.25rem] border border-slate-200 shadow-inner">
          {(['ALL', 'ACTIVE', 'MAINTENANCE', 'BLOCKED'] as const).map((id) => (
            <button
              key={id}
              onClick={() => setStatusFilter(id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === id 
                  ? 'bg-white text-slate-900 shadow-md' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {id.replace('MAINTENANCE', 'Maint.')}
              <span className="ml-2 opacity-30">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map(room => (
          <div key={room.id} className={`group bg-white rounded-[3rem] overflow-hidden border border-slate-200 card-neo ${room.status !== 'ACTIVE' ? 'grayscale opacity-60' : ''}`}>
            <div className="h-64 relative overflow-hidden">
              <img src={room.images[0]} alt={room.roomType} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                 <span className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-xs shadow-xl">{room.roomNumber}</span>
                 {room.status === 'MAINTENANCE' && <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl">Maintenance</span>}
              </div>
              <div className="absolute bottom-6 right-6">
                 <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pricing</p>
                    <p className="text-xl font-black text-slate-900">R {room.pricePerNight}</p>
                 </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-2xl leading-none">{room.roomType}</h3>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest"><Users size={14} className="text-blue-500" /> Max {room.capacity}</span>
                    <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest"><ShieldCheck size={14} className="text-emerald-500" /> Luxury Certified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => toggleMaintenance(room.id)}
                  className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                    room.status === 'MAINTENANCE' 
                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' 
                      : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50'
                  }`}
                >
                  {room.status === 'MAINTENANCE' ? 'Set Active' : 'Enter Maintenance'}
                </button>
                <button onClick={() => setEditingRoom(room)} className="p-3.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-100 rounded-2xl transition">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteRoom(room.id)} className="p-3.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 rounded-2xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
              <h3 className="text-2xl font-black uppercase tracking-tight">{editingRoom.id ? 'Modify Unit' : 'New Provisioning'}</h3>
              <button onClick={() => setEditingRoom(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRoom(); }} className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Unit ID / Number" value={editingRoom.roomNumber || ''} onChange={v => setEditingRoom({...editingRoom, roomNumber: v})} />
                <InputGroup label="Classification Type" value={editingRoom.roomType || ''} onChange={v => setEditingRoom({...editingRoom, roomType: v})} />
                <InputGroup label="Occupancy Capacity" type="number" value={editingRoom.capacity?.toString() || '2'} onChange={v => setEditingRoom({...editingRoom, capacity: parseInt(v)})} />
                <InputGroup label="Base Rate / Night" type="number" value={editingRoom.pricePerNight?.toString() || '0'} onChange={v => setEditingRoom({...editingRoom, pricePerNight: parseInt(v)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Space Narrative</label>
                <textarea 
                  required
                  value={editingRoom.description || ''}
                  onChange={e => setEditingRoom({...editingRoom, description: e.target.value})}
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  rows={4}
                />
              </div>
              <InputGroup label="Master Asset URL" value={editingRoom.images?.[0] || ''} onChange={v => setEditingRoom({...editingRoom, images: [v]})} />
              <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 active:scale-95">
                <Save size={24} /> Commit Unit to Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{label}</label>
    <input 
      type={type} 
      required
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" 
    />
  </div>
);

export default RoomManager;