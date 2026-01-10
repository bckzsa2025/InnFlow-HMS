
import React, { useState, useMemo } from 'react';
import { Property, Room, Booking, BookingStatus, PaymentStatus, PaymentMethod } from '../types';
import { MapPin, CheckCircle2, BedDouble, ArrowLeft, Grid3X3, CreditCard, ArrowRightLeft, Wallet, ShieldCheck, Phone, Mail } from 'lucide-react';
import AssistantChat from './AssistantChat';

interface GuestPortalProps {
  property: Property;
  rooms: Room[];
  bookings: Booking[];
  onBook: (booking: Booking) => void;
  onLogout: () => void;
  calculateTotal: (roomId: string, checkIn: string, checkOut: string) => number;
}

const GuestPortal: React.FC<GuestPortalProps> = ({ property, rooms, bookings, onBook, onLogout, calculateTotal }) => {
  const [step, setStep] = useState<'browsing' | 'details' | 'payment' | 'confirm'>('browsing');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', idNumber: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_ARRIVAL);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const isAvailable = useMemo(() => {
    if (!selectedRoomId || !dates.checkIn || !dates.checkOut) return true;
    const cin = new Date(dates.checkIn);
    const cout = new Date(dates.checkOut);
    
    return !bookings.some(b => {
      if (b.roomId !== selectedRoomId || b.status === BookingStatus.CANCELLED) return false;
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);
      return (cin < bOut && cout > bIn);
    });
  }, [selectedRoomId, dates, bookings]);

  const currentTotal = useMemo(() => {
    if (!selectedRoomId || !dates.checkIn || !dates.checkOut) return 0;
    return calculateTotal(selectedRoomId, dates.checkIn, dates.checkOut);
  }, [selectedRoomId, dates, calculateTotal]);

  const handleBooking = () => {
    if (!selectedRoom || !isAvailable) return;
    
    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      propertyId: property.id,
      reference: '', // App will generate sequential reference
      guestName: formData.name,
      guestId: formData.idNumber || 'GUEST_SELF',
      guestEmail: formData.email,
      guestPhone: formData.phone,
      roomId: selectedRoom.id,
      checkInDate: dates.checkIn,
      checkOutDate: dates.checkOut,
      totalAmount: currentTotal,
      status: paymentMethod === PaymentMethod.IKHOKHA ? BookingStatus.CONFIRMED : BookingStatus.PROVISIONAL,
      paymentStatus: paymentMethod === PaymentMethod.IKHOKHA ? PaymentStatus.PAID : PaymentStatus.PENDING,
      paymentMethod: paymentMethod,
      createdAt: new Date().toISOString()
    };
    
    onBook(newBooking);
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-16 shadow-2xl animate-in zoom-in duration-700">
          <div className="h-24 w-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/20 rotate-12">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">Secure Provision</h2>
          <p className="text-slate-400 mt-6 text-lg font-medium italic">
            Your stay is provisionally locked. A confirmation alert with your payment link has been dispatched to your WhatsApp.
          </p>
          <button 
            onClick={() => { setStep('browsing'); setSelectedRoomId(null); }} 
            className="mt-12 w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="relative h-[500px] overflow-hidden">
        <img src={property.headerImageUrl} alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-50"></div>
        <nav className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-xl shadow-xl">I</div>
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase">InnFlow<span className="text-blue-500 italic">™</span></h2>
            </div>
            <button onClick={onLogout} className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all">Exit Portal</button>
        </nav>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-6 drop-shadow-2xl">{property.name}</h1>
          <p className="text-slate-200 text-xl font-medium flex items-center gap-3"><MapPin size={24} className="text-blue-500" /> {property.address}</p>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-8 py-24 -mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <Grid3X3 className="text-blue-600" size={24} /> Schematic Room Selector
              </h2>
            </div>
            <div className="relative bg-slate-50 rounded-[2rem] p-8 min-h-[500px] grid grid-cols-6 grid-rows-6 gap-3">
              {property.layoutGrid.map((pos) => {
                const room = rooms.find(r => r.id === pos.roomId);
                if (!room) return null;
                const isSelected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    style={{ gridColumn: `span ${pos.w}`, gridRow: `span ${pos.h}` }}
                    className={`relative rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-4 group ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-105 z-10' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400'
                    }`}
                  >
                    <BedDouble size={isSelected ? 28 : 20} className="mb-2" />
                    <span className="text-xl font-black">{room.roomNumber}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedRoom && (
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-10 animate-in slide-in-from-bottom-8 duration-700">
              <div className="w-full md:w-1/3 h-[300px] rounded-[2rem] overflow-hidden">
                <img src={selectedRoom.images[0]} alt="Room" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-5xl font-black tracking-tighter mb-4">{selectedRoom.roomType}</h3>
                <p className="text-slate-400 text-lg font-medium mb-8 italic">"{selectedRoom.description}"</p>
                <div className="flex items-center gap-10">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pricing</p>
                      <p className="text-3xl font-black">R {selectedRoom.pricePerNight}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Max Load</p>
                      <p className="text-3xl font-black">{selectedRoom.capacity} People</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <aside className="sticky top-12 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8 uppercase">Stay Architect</h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <DateInput label="Check-in Date" value={dates.checkIn} onChange={v => setDates({...dates, checkIn: v})} />
                <DateInput label="Check-out Date" value={dates.checkOut} onChange={v => setDates({...dates, checkOut: v})} />
              </div>

              {currentTotal > 0 && (
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Total</span>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter mt-1">R {currentTotal.toLocaleString()}</p>
                </div>
              )}

              {step === 'browsing' ? (
                <button 
                  disabled={!selectedRoomId || !dates.checkIn || !dates.checkOut || !isAvailable}
                  onClick={() => setStep('details')}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                >
                  Confirm Availability
                </button>
              ) : step === 'details' ? (
                <div className="space-y-6">
                  <button onClick={() => setStep('browsing')} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-4 hover:text-slate-900"><ArrowLeft size={14} /> Back to Map</button>
                  <div className="space-y-4">
                    <InputField placeholder="Guest Legal Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} />
                    <InputField placeholder="Email Address" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                    <InputField placeholder="WhatsApp Contact Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                  </div>
                  <button 
                    onClick={() => setStep('payment')}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Select Payment Node
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <button onClick={() => setStep('details')} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-4 hover:text-slate-900"><ArrowLeft size={14} /> Back to Details</button>
                  <div className="space-y-3">
                    <PaymentOption icon={<CreditCard size={18} />} label="iKhokha Terminal" sub="Verified Card Gateway" active={paymentMethod === PaymentMethod.IKHOKHA} onClick={() => setPaymentMethod(PaymentMethod.IKHOKHA)} />
                    <PaymentOption icon={<ArrowRightLeft size={18} />} label="Bank EFT" sub="Manual Bank Verification" active={paymentMethod === PaymentMethod.EFT} onClick={() => setPaymentMethod(PaymentMethod.EFT)} />
                    <PaymentOption icon={<Wallet size={18} />} label="Payment on Arrival" sub="Verify at Guesthouse" active={paymentMethod === PaymentMethod.CASH_ON_ARRIVAL} onClick={() => setPaymentMethod(PaymentMethod.CASH_ON_ARRIVAL)} />
                  </div>
                  <button 
                    onClick={handleBooking}
                    className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                  >
                    <ShieldCheck size={24} /> Secure My Provision
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <AssistantChat rooms={rooms} seasonalRates={property.seasonalRates} onBookingIntent={(data) => {
          const room = rooms.find(r => r.id === data.room_id);
          if (room) {
            onBook({
              id: `ai_${Date.now()}`,
              propertyId: property.id,
              reference: '',
              guestName: data.guest_name,
              guestId: 'AI_RECEPTIONIST',
              guestEmail: data.email,
              guestPhone: data.phone,
              roomId: room.id,
              checkInDate: data.check_in,
              checkOutDate: data.check_out,
              totalAmount: calculateTotal(room.id, data.check_in, data.check_out),
              status: BookingStatus.PROVISIONAL,
              paymentStatus: PaymentStatus.PENDING,
              createdAt: new Date().toISOString()
            });
            setStep('confirm');
          }
      }} />
    </div>
  );
};

const DateInput = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input type="date" value={value} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
  </div>
);

const InputField = ({ placeholder, value, onChange }: any) => (
  <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
);

const PaymentOption = ({ icon, label, sub, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
      active ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-900 hover:border-blue-200'
    }`}
  >
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{icon}</div>
    <div>
      <p className="text-xs font-black uppercase tracking-tight leading-none">{label}</p>
      <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${active ? 'text-white/60' : 'text-slate-400'}`}>{sub}</p>
    </div>
  </button>
);

export default GuestPortal;
