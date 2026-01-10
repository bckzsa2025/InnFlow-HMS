
import React, { useState, useMemo } from 'react';
import { Booking, Room, BookingStatus, PaymentStatus, PaymentMethod } from '../types';
import { Search, Plus, Eye, X, Trash2, Save, CreditCard, DollarSign, Wallet, ArrowRightLeft, Mail, Phone } from 'lucide-react';

interface BookingManagerProps {
  bookings: Booking[];
  rooms: Room[];
  onUpdate: (bookings: Booking[]) => void;
  onLog?: (action: string, details: string) => void;
}

const BookingManager: React.FC<BookingManagerProps> = ({ bookings, rooms, onUpdate, onLog }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING,
    // Fix: PaymentMethod.CASH does not exist, using PaymentMethod.CASH_ON_ARRIVAL instead.
    paymentMethod: PaymentMethod.CASH_ON_ARRIVAL
  });
  
  const getRoomNumber = (roomId: string) => rooms.find(r => r.id === roomId)?.roomNumber || 'N/A';

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.reference.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();
  }, [bookings, searchQuery]);

  const handleCreateBooking = () => {
    const room = rooms.find(r => r.id === newBooking.roomId);
    if (!room) return;
    
    const booking: Booking = {
      ...(newBooking as Booking),
      id: `b_${Date.now()}`,
      propertyId: room.propertyId,
      reference: '', // App.tsx will generate the INF-YYYY-XXXX ref
      totalAmount: room.pricePerNight, 
      createdAt: new Date().toISOString(),
      guestId: 'ADM-INPUT'
    } as Booking;
    
    // We call the same central book handler in App via prop if possible, 
    // but here we just pass it up to the parent array update.
    onUpdate([...bookings, booking]);
    onLog?.('BOOKING_CREATED', `Direct admin booking created for ${booking.guestName}`);
    setIsCreating(false);
  };

  const updateBookingField = (id: string, updates: Partial<Booking>) => {
    const b = bookings.find(x => x.id === id);
    const updatedBookings = bookings.map(b => b.id === id ? { ...b, ...updates } : b);
    onUpdate(updatedBookings);
    
    if (updates.status) onLog?.('BOOKING_STATUS_CHANGE', `Booking ${b?.reference} changed status to ${updates.status}`);
    if (updates.paymentStatus) onLog?.('PAYMENT_STATUS_CHANGE', `Booking ${b?.reference} payment status changed to ${updates.paymentStatus}`);
    
    if(selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, ...updates });
  };

  const deleteBooking = (id: string) => {
    if(confirm('Permanently delete this booking?')) {
      const b = bookings.find(x => x.id === id);
      onUpdate(bookings.filter(b => b.id !== id));
      onLog?.('BOOKING_DELETED', `Deleted booking record ${b?.reference}`);
      setSelectedBooking(null);
    }
  };

  const getPaymentIcon = (method?: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CARD_ON_ARRIVAL:
      case PaymentMethod.IKHOKHA: return <CreditCard size={14} />;
      case PaymentMethod.EFT: return <ArrowRightLeft size={14} />;
      // Fix: PaymentMethod.CASH does not exist, using PaymentMethod.CASH_ON_ARRIVAL instead.
      case PaymentMethod.CASH_ON_ARRIVAL: return <Wallet size={14} />;
      default: return <DollarSign size={14} />;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case BookingStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      case BookingStatus.CHECKED_IN: return 'bg-blue-50 text-blue-700 border-blue-100';
      case BookingStatus.CHECKED_OUT: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-emerald-500 text-white';
      case PaymentStatus.PARTIALLY_PAID: return 'bg-amber-400 text-white';
      case PaymentStatus.REFUNDED: return 'bg-slate-400 text-white';
      default: return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">
          <Plus size={20} /> New Reservation
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full md:w-80">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or reference..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Guest & Ref</th>
                <th className="px-6 py-4">Stay & Room</th>
                <th className="px-6 py-4">Financials</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{b.guestName}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider">{b.reference || 'REF-PENDING'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-7 w-7 bg-slate-900 rounded text-[10px] font-black text-white">
                        {getRoomNumber(b.roomId)}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-600">{b.checkInDate}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">to {b.checkOutDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-black text-slate-900">R {b.totalAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${getPaymentColor(b.paymentStatus)}`}>
                          {b.paymentStatus.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {getPaymentIcon(b.paymentMethod)}
                          {b.paymentMethod?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedBooking(b)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all border border-transparent hover:border-slate-200">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <h3 className="text-xl font-bold uppercase tracking-tight">Manual Reservation</h3>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleCreateBooking(); }} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Guest Name" value={newBooking.guestName || ''} onChange={v => setNewBooking({...newBooking, guestName: v})} />
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocate Room</label>
                  <select 
                    required
                    value={newBooking.roomId || ''} 
                    onChange={e => setNewBooking({...newBooking, roomId: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Room...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType})</option>)}
                  </select>
                </div>
                <InputGroup label="Check-In" type="date" value={newBooking.checkInDate || ''} onChange={v => setNewBooking({...newBooking, checkInDate: v})} />
                <InputGroup label="Check-Out" type="date" value={newBooking.checkOutDate || ''} onChange={v => setNewBooking({...newBooking, checkOutDate: v})} />
              </div>
              <button type="submit" disabled={!newBooking.roomId} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2">
                <Save size={20} /> Create Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Booking Details</h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">{selectedBooking.reference || 'TBC'}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <section>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Guest Profile</p>
                  <p className="text-xl font-black text-slate-900 leading-none">{selectedBooking.guestName}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-slate-500 flex items-center gap-2"><Mail size={12} /> {selectedBooking.guestEmail}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2"><Phone size={12} /> {selectedBooking.guestPhone}</p>
                  </div>
                </section>
                
                <section>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Stay Info</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                      {getRoomNumber(selectedBooking.roomId)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedBooking.checkInDate}</p>
                      <p className="text-xs text-slate-500">to {selectedBooking.checkOutDate}</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Financials</p>
                <div className="grid grid-cols-2 gap-6 items-end">
                  <div>
                    <p className="text-3xl font-black text-slate-900">R {selectedBooking.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold">{selectedBooking.paymentStatus}</span></p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Update Payment</label>
                    <select 
                      value={selectedBooking.paymentStatus}
                      onChange={(e) => updateBookingField(selectedBooking.id, { paymentStatus: e.target.value as PaymentStatus })}
                      className="w-full p-2.5 rounded-xl font-bold text-xs border"
                    >
                      {Object.values(PaymentStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => updateBookingField(selectedBooking.id, { status: BookingStatus.CHECKED_IN })} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700">Check-In</button>
                <button onClick={() => updateBookingField(selectedBooking.id, { status: BookingStatus.CHECKED_OUT })} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Check-Out</button>
                <button onClick={() => deleteBooking(selectedBooking.id)} className="ml-auto p-2 text-slate-300 hover:text-red-500"><Trash2 size={20} /></button>
              </div>
            </div>
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

export default BookingManager;
