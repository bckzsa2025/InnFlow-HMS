import React, { useState } from 'react';
import { Room, Booking, BookingStatus, PaymentStatus } from '../types';
// Added Plus to the import list
import { ChevronLeft, ChevronRight, User, X, Check, Save, TrendingUp, Calendar as CalIcon, Filter, Plus } from 'lucide-react';

interface CalendarViewProps {
  rooms: Room[];
  bookings: Booking[];
  onBookingUpdate: (id: string, update: Partial<Booking>) => void;
  onAddBooking: (booking: Booking) => void;
  calculateTotal: (roomId: string, checkIn: string, checkOut: string) => number;
}

const CalendarView: React.FC<CalendarViewProps> = ({ rooms, bookings, onBookingUpdate, onAddBooking, calculateTotal }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [drawerData, setDrawerData] = useState<{ room: Room, date: string } | null>(null);
  const [formData, setFormData] = useState({ guestName: '', phone: '' });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  const getBookingForDayAndRoom = (roomId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.find(b => b.roomId === roomId && b.status !== BookingStatus.CANCELLED && dateStr >= b.checkInDate && dateStr < b.checkOutDate);
  };

  const handleCellClick = (room: Room, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const booking = getBookingForDayAndRoom(room.id, day);
    if (!booking) {
      setDrawerData({ room, date: dateStr });
    }
  };

  const nextDayStr = drawerData ? (() => {
    const d = new Date(drawerData.date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })() : '';

  const estimatedTotal = drawerData ? calculateTotal(drawerData.room.id, drawerData.date, nextDayStr) : 0;
  const isPeak = drawerData && estimatedTotal > drawerData.room.pricePerNight;

  const handleQuickBook = () => {
    if (!drawerData) return;
    
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      propertyId: drawerData.room.propertyId,
      reference: `ADMIN-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      guestName: formData.guestName || 'Walk-in Guest',
      guestId: 'N/A',
      guestEmail: 'walkin@guest.com',
      guestPhone: formData.phone || '+27 00 000 0000',
      roomId: drawerData.room.id,
      checkInDate: drawerData.date,
      checkOutDate: nextDayStr,
      totalAmount: estimatedTotal,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    onAddBooking(newBooking);
    setDrawerData(null);
    setFormData({ guestName: '', phone: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Occupancy <span className="text-blue-600">Planner</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Visual cluster scheduling and walk-in provisioning.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={24} /></button>
          <div className="flex items-center gap-3 px-6 min-w-[200px] justify-center">
             <CalIcon size={18} className="text-blue-500" />
             <span className="font-black text-slate-900 uppercase tracking-widest text-[11px]">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </span>
          </div>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={24} /></button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white">
                <th className="p-8 text-left font-black uppercase text-[10px] tracking-[0.3em] sticky left-0 z-20 bg-slate-950 min-w-[240px] border-r border-white/5">Inventory Matrix</th>
                {days.map(d => (
                  <th key={d} className="p-3 text-center text-[10px] font-black border-l border-white/5 min-w-[48px] opacity-60">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <tr key={room.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-6 sticky left-0 z-10 bg-inherit border-r border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white text-[11px] font-black flex items-center justify-center shadow-lg">{room.roomNumber}</div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{room.roomType}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Floor {room.roomNumber.charAt(0)}</p>
                      </div>
                    </div>
                  </td>
                  {days.map(d => {
                    const booking = getBookingForDayAndRoom(room.id, d);
                    const isToday = d === new Date().getDate() && month === new Date().getMonth();
                    return (
                      <td 
                        key={d} 
                        onClick={() => handleCellClick(room, d)}
                        className={`p-1 border-l border-slate-100 relative group h-20 cursor-pointer transition-all ${isToday ? 'bg-blue-50/30' : ''}`}
                      >
                        {booking ? (
                          <div className={`h-full w-full rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                            booking.status === BookingStatus.CHECKED_IN ? 'bg-blue-600' : 
                            booking.status === BookingStatus.PROVISIONAL ? 'bg-amber-400' : 'bg-emerald-500'
                          } hover:scale-[1.05] relative z-10`}>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                              <User size={16} className="text-white" />
                              <span className="text-[7px] text-white font-black uppercase mt-1">Guest</span>
                            </div>
                            {/* Visual indicator for check-in/out boundaries */}
                            {booking.checkInDate.endsWith(`-${String(d).padStart(2, '0')}`) && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white/40 rounded-r-full"></div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full w-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                             <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Plus size={14} /></div>
                          </div>
                        )}
                        {isToday && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-8 justify-center p-8 bg-white rounded-[2rem] border border-slate-200">
          <LegendItem color="bg-blue-600" label="Checked-In" />
          <LegendItem color="bg-emerald-500" label="Confirmed" />
          <LegendItem color="bg-amber-400" label="Provisional" />
          <LegendItem color="bg-slate-100" label="Available" />
      </div>

      {drawerData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-300">
          <div className="w-[450px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Walk-in Logic</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manual Provisioning for Room {drawerData.room.roomNumber}</p>
              </div>
              <button onClick={() => setDrawerData(null)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 p-10 space-y-10 overflow-y-auto">
              <section className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Temporal Segment</label>
                <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-100 shadow-2xl text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 h-32 w-32 bg-blue-600/20 blur-[60px]"></div>
                  <div className="relative z-10">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Selected Date Period</p>
                    <p className="text-3xl font-black mt-2">{drawerData.date} <span className="text-blue-500">→</span> {nextDayStr}</p>
                    <div className="mt-6 flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                       <span className="text-[10px] font-black uppercase tracking-widest">1 Night Availability Confirmed</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Live Valuation</span>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter mt-1">R {estimatedTotal}</p>
                </div>
                {isPeak && (
                  <div className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center float-animation shadow-lg shadow-blue-600/20">
                    <TrendingUp size={24} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <InputGroup label="Legal Full Name" value={formData.guestName} onChange={v => setFormData({...formData, guestName: v})} />
                <InputGroup label="Identity / Contact (WhatsApp)" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
              </div>

              <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2rem] flex items-start gap-5">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                   <Check size={20} />
                </div>
                <p className="text-xs leading-relaxed font-bold text-slate-500">
                  By confirming, the guest will receive an encrypted WhatsApp invitation. Total amount is calculated based on current seasonal multipliers.
                </p>
              </div>
            </div>
            <div className="p-10 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={handleQuickBook} 
                disabled={!formData.guestName || !formData.phone}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-2xl active:scale-95"
              >
                <Save size={24} /> Finalize Provisioning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`h-3 w-3 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

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

export default CalendarView;