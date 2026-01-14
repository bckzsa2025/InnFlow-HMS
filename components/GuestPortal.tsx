
import React, { useState, useMemo, useEffect } from 'react';
import { Property, Room, Booking, BookingStatus, PaymentStatus, PaymentMethod, User } from '../types';
import { MapPin, CheckCircle2, BedDouble, ArrowLeft, Grid3X3, CreditCard, ArrowRightLeft, Wallet, ShieldCheck, Phone, Mail, LogOut, ChevronLeft, ChevronRight, Edit2, UserSquare2, Users, Receipt } from 'lucide-react';
import AssistantChat from './AssistantChat';

interface GuestPortalProps {
  property: Property;
  rooms: Room[];
  bookings: Booking[];
  onBook: (booking: Booking) => void;
  onLogout: () => void;
  calculateTotal: (roomId: string, checkIn: string, checkOut: string) => number;
  user?: User;
  onGetReference: () => string;
}

const GuestPortal: React.FC<GuestPortalProps> = ({ property, rooms, bookings, onBook, onLogout, calculateTotal, user, onGetReference }) => {
  const [step, setStep] = useState<'browsing' | 'details' | 'payment' | 'confirm'>('browsing');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string>('');

  // Load dates from session storage
  const [dates, setDates] = useState(() => {
    const saved = sessionStorage.getItem('innflex_guest_dates');
    return saved ? JSON.parse(saved) : { checkIn: '', checkOut: '' };
  });
  
  // Load form data from session storage or default to user details
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('innflex_guest_form');
    if (saved) return JSON.parse(saved);
    if (user) return { name: user.name, email: user.email, phone: '', idNumber: '', guestCount: 1 };
    return { name: '', email: '', phone: '', idNumber: '', guestCount: 1 };
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_ARRIVAL);

  // Persist form data to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('innflex_guest_form', JSON.stringify(formData));
  }, [formData]);

  // Persist dates to session storage whenever they change
  useEffect(() => {
    sessionStorage.setItem('innflex_guest_dates', JSON.stringify(dates));
  }, [dates]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Validate dates: Check-out must be after Check-in
  const isDateLogicValid = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return false;
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    return end > start;
  }, [dates]);

  // Validate room availability
  const isAvailable = useMemo(() => {
    if (!selectedRoomId || !isDateLogicValid) return false;
    const cin = new Date(dates.checkIn);
    const cout = new Date(dates.checkOut);
    
    return !bookings.some(b => {
      if (b.roomId !== selectedRoomId || b.status === BookingStatus.CANCELLED) return false;
      const bIn = new Date(b.checkInDate);
      const bOut = new Date(b.checkOutDate);
      return (cin < bOut && cout > bIn);
    });
  }, [selectedRoomId, dates, bookings, isDateLogicValid]);

  const currentTotal = useMemo(() => {
    if (!selectedRoomId || !isDateLogicValid) return 0;
    return calculateTotal(selectedRoomId, dates.checkIn, dates.checkOut);
  }, [selectedRoomId, dates, isDateLogicValid, calculateTotal]);

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !selectedRoom) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      setCurrentImageIndex(prev => (prev === selectedRoom.images.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      setCurrentImageIndex(prev => (prev === 0 ? selectedRoom.images.length - 1 : prev - 1));
    }
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedRoom) {
      setCurrentImageIndex(prev => (prev === selectedRoom.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedRoom) {
      setCurrentImageIndex(prev => (prev === 0 ? selectedRoom.images.length - 1 : prev - 1));
    }
  };

  const handleBooking = () => {
    if (!selectedRoom || !isAvailable) return;

    // Generate reference immediately for display
    const newRef = onGetReference();
    setConfirmedRef(newRef);
    
    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      propertyId: property.id,
      reference: newRef,
      guestName: formData.name,
      guestId: formData.idNumber || user?.id || 'GUEST_SELF',
      guestEmail: formData.email,
      guestPhone: formData.phone,
      guestCount: formData.guestCount,
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
    // Clear session storage on successful booking
    sessionStorage.removeItem('innflex_guest_form');
    sessionStorage.removeItem('innflex_guest_dates');
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-lg bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl animate-in zoom-in duration-700 flex flex-col items-center">
          <div className="h-20 w-20 md:h-24 md:w-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 rotate-12">
            <CheckCircle2 size={48} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-2">Secure Provision</h2>
          <p className="text-sm md:text-lg text-slate-400 font-medium italic mb-8">Your stay is provisionally locked.</p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Receipt size={100} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Booking Reference</p>
             <p className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter">{confirmedRef}</p>
          </div>

          <div className="w-full space-y-3 mb-10 text-left">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="h-10 w-10 bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><Mail size={18} /></div>
                  <div>
                      <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Confirmation Sent</p>
                      <p className="text-xs font-bold text-blue-900 truncate">{formData.email}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="h-10 w-10 bg-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0"><Phone size={18} /></div>
                  <div>
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Payment Link Sent</p>
                      <p className="text-xs font-bold text-emerald-900 truncate">{formData.phone}</p>
                  </div>
              </div>
          </div>

          <button 
            onClick={() => { 
              setStep('browsing'); 
              setSelectedRoomId(null); 
              setFormData({ name: user?.name || '', email: user?.email || '', phone: '', idNumber: '', guestCount: 1 }); 
              setDates({ checkIn: '', checkOut: '' });
              setConfirmedRef('');
            }} 
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img src={property.headerImageUrl} alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-50"></div>
        <nav className="absolute top-0 left-0 right-0 p-6 md:p-8 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-xl shadow-xl">I</div>
                 <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">InnFlex<span className="text-blue-500 italic">™</span></h2>
            </div>
            <div className="flex items-center gap-4">
                {user && <span className="text-white font-bold text-sm hidden md:block">Welcome, {user.name}</span>}
                <button onClick={onLogout} className="px-4 py-2 md:px-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <LogOut size={14} /> <span className="hidden md:inline">Log Out</span>
                </button>
            </div>
        </nav>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 md:mb-6 drop-shadow-2xl">{property.name}</h1>
          <p className="text-slate-200 text-lg md:text-xl font-medium flex items-center gap-3"><MapPin size={24} className="text-blue-500" /> {property.address}</p>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-4 md:px-8 py-12 md:py-24 -mt-24 md:-mt-32 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 space-y-8 md:space-y-12">
          <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <Grid3X3 className="text-blue-600" size={24} /> Schematic Room Selector
              </h2>
            </div>
            <div className="relative bg-slate-50 rounded-[2rem] p-4 md:p-8 min-h-[300px] md:min-h-[500px] grid grid-cols-6 grid-rows-6 gap-2 md:gap-3">
              {property.layoutGrid.map((pos) => {
                const room = rooms.find(r => r.id === pos.roomId);
                if (!room) return null;
                const isSelected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => { setSelectedRoomId(room.id); setCurrentImageIndex(0); }}
                    style={{ gridColumn: `span ${pos.w}`, gridRow: `span ${pos.h}` }}
                    className={`relative rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center p-2 md:p-4 group ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-105 z-10' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400'
                    }`}
                  >
                    <BedDouble size={isSelected ? 24 : 18} className="mb-1 md:mb-2" />
                    <span className="text-sm md:text-xl font-black">{room.roomNumber}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedRoom && (
            <div className="bg-slate-900 text-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-6 md:gap-10 animate-in slide-in-from-bottom-8 duration-700">
              <div 
                className="w-full md:w-1/3 h-[250px] md:h-[300px] rounded-[2rem] overflow-hidden relative group touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img 
                  src={selectedRoom.images[currentImageIndex]} 
                  alt="Room" 
                  className="w-full h-full object-cover transition-all duration-500" 
                />
                
                {selectedRoom.images.length > 1 && (
                    <>
                        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={prevImage} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-md transition-all"><ChevronLeft size={24} /></button>
                            <button onClick={nextImage} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-md transition-all"><ChevronRight size={24} /></button>
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {selectedRoom.images.map((_, i) => (
                                <button 
                                    key={i} 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/80'}`} 
                                />
                            ))}
                        </div>
                    </>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 md:mb-4">{selectedRoom.roomType}</h3>
                <p className="text-slate-400 text-sm md:text-lg font-medium mb-6 md:mb-8 italic">"{selectedRoom.description}"</p>
                <div className="flex items-center justify-center md:justify-start gap-8 md:gap-10">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pricing</p>
                      <p className="text-2xl md:text-3xl font-black">R {selectedRoom.pricePerNight}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Max Load</p>
                      <p className="text-2xl md:text-3xl font-black">{selectedRoom.capacity} People</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <aside className="sticky top-12 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter mb-6 md:mb-8 uppercase">Stay Architect</h3>
            
            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <DateInput label="Check-in Date" value={dates.checkIn} onChange={v => setDates({...dates, checkIn: v})} />
                <DateInput label="Check-out Date" value={dates.checkOut} onChange={v => setDates({...dates, checkOut: v})} />
                {!isDateLogicValid && dates.checkIn && dates.checkOut && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-[10px] font-bold">
                    Check-out date must be after Check-in date.
                  </div>
                )}
              </div>

              {currentTotal > 0 && isDateLogicValid && (
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Total</span>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter mt-1">R {currentTotal.toLocaleString()}</p>
                </div>
              )}

              {step === 'browsing' ? (
                <button 
                  disabled={!selectedRoomId || !isAvailable || !isDateLogicValid}
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
                    <InputField placeholder="ID Number / Passport" value={formData.idNumber} onChange={v => setFormData({...formData, idNumber: v})} icon={<UserSquare2 size={14}/>} />
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Users size={14}/> Guests (Max {selectedRoom?.capacity})</label>
                      <input 
                        type="number" 
                        min={1}
                        max={selectedRoom?.capacity}
                        value={formData.guestCount} 
                        onChange={e => setFormData({...formData, guestCount: Math.min(parseInt(e.target.value) || 1, selectedRoom?.capacity || 1) })} 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>

                    <InputField placeholder="Email Address" value={formData.email} onChange={v => setFormData({...formData, email: v})} />
                    <InputField placeholder="WhatsApp Contact Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} />
                  </div>
                  <button 
                    onClick={() => setStep('payment')}
                    disabled={!formData.name || !formData.email || !formData.phone || !formData.idNumber || !formData.guestCount}
                    className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Select Payment Node
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <button onClick={() => setStep('details')} className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 mb-4 hover:text-slate-900"><ArrowLeft size={14} /> Back to Details</button>
                  
                  <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-200 relative group transition-all hover:bg-blue-50/50 hover:border-blue-200">
                     <button onClick={() => setStep('details')} className="absolute top-4 right-4 text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-all">
                        <Edit2 size={16} />
                     </button>
                     <div className="space-y-3">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guest Identity</p>
                            <p className="text-sm font-bold text-slate-900">{formData.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {formData.idNumber}</p>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guests</p>
                                <p className="text-xs font-bold text-slate-900">{formData.guestCount}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</p>
                                <p className="text-xs font-semibold text-slate-600">{formData.phone}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                            <p className="text-xs font-semibold text-slate-600 truncate">{formData.email}</p>
                        </div>
                     </div>
                  </div>

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
            // Generate ref for AI booking
            const newRef = onGetReference();
            setConfirmedRef(newRef);
            
            onBook({
              id: `ai_${Date.now()}`,
              propertyId: property.id,
              reference: newRef,
              guestName: data.guest_name,
              guestId: 'AI_RECEPTIONIST',
              guestEmail: data.email,
              guestPhone: data.phone,
              guestCount: 1, // Default for AI bookings
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

const InputField = ({ placeholder, value, onChange, icon }: any) => (
  <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 ${icon ? 'pl-12' : ''}`} 
      />
  </div>
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
