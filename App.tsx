
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Property, Booking, Room, BookingStatus, PaymentStatus, AuditLog, StaffMember, Tenant, CashUpRecord } from './types';
import { INITIAL_ROOMS, MOCK_PROPERTY_ID, INITIAL_LAYOUT } from './constants';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import RoomManager from './components/RoomManager';
import BookingManager from './components/BookingManager';
import Financials from './components/Financials';
import Settings from './components/Settings';
import DeveloperPortal from './components/DeveloperPortal';
import GuestPortal from './components/GuestPortal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationCenter from './components/NotificationCenter';
import AuditLogViewer from './components/AuditLogViewer';
import StaffManager from './components/StaffManager';
import { ShieldCheck, Building, Briefcase, Zap, Star } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('innflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [property, setProperty] = useState<Property>(() => {
    const saved = localStorage.getItem('innflow_property');
    return saved ? JSON.parse(saved) : {
      id: MOCK_PROPERTY_ID,
      name: 'Ocean Whisper Lodge',
      address: '123 Beachfront Dr, Cape Town',
      contactEmail: 'hello@oceanwhisper.com',
      contactPhone: '+27 82 000 0000',
      staffWhatsapp: '+27 82 111 2222',
      checkInTime: '14:00',
      checkOutTime: '10:00',
      primaryColor: '#3B82F6',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983803.png',
      headerImageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1600',
      whatsappTemplate: 'Hi {{guest}}, your booking {{ref}} at {{property}} is confirmed for {{date}}. Secure your stay: {{link}}',
      layoutGrid: INITIAL_LAYOUT as any,
      seasonalRates: [
        { id: 's1', name: 'Peak Summer', startDate: '2024-12-01', endDate: '2025-01-31', multiplier: 1.4 },
        { id: 's2', name: 'Easter Special', startDate: '2024-04-10', endDate: '2024-04-20', multiplier: 1.25 }
      ],
      lastRefNumber: 12,
      webhookUrl: 'https://graph.facebook.com/v17.0/your-phone-id/messages' 
    };
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('innflow_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('innflow_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('innflow_staff');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'John Doe', email: 'john@oceanwhisper.com', role: UserRole.STAFF, lastLogin: '2 hours ago', access: ['Bookings', 'Calendar'] },
      { id: 's2', name: 'Sarah Miller', email: 'sarah@oceanwhisper.com', role: UserRole.BUSINESS_ADMIN, lastLogin: '10 mins ago', access: ['Full System'] }
    ];
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('innflow_tenants');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Ocean Whisper Lodge', status: 'Active', plan: 'Enterprise', users: 12 },
      { id: '2', name: 'Mountain Retreat B&B', status: 'Trialing', plan: 'Starter', users: 3 }
    ];
  });

  const [cashUps, setCashUps] = useState<CashUpRecord[]>(() => {
    const saved = localStorage.getItem('innflow_cashups');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('innflow_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', property.primaryColor);
    localStorage.setItem('innflow_property', JSON.stringify(property));
    localStorage.setItem('innflow_rooms', JSON.stringify(rooms));
    localStorage.setItem('innflow_bookings', JSON.stringify(bookings));
    localStorage.setItem('innflow_staff', JSON.stringify(staff));
    localStorage.setItem('innflow_tenants', JSON.stringify(tenants));
    localStorage.setItem('innflow_cashups', JSON.stringify(cashUps));
    localStorage.setItem('innflow_audit', JSON.stringify(auditLogs));
  }, [property, rooms, bookings, staff, tenants, cashUps, auditLogs]);

  const addAuditLog = useCallback((action: string, details: string) => {
    if (!currentUser) return;
    const log: AuditLog = {
      id: Date.now().toString(),
      propertyId: property.id,
      userId: currentUser.id,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [log, ...prev].slice(0, 100));
  }, [currentUser, property.id]);

  const triggerWhatsAppWebhook = useCallback(async (booking: Booking) => {
    const paymentLink = `https://pay.innflow.com/${booking.reference}`;
    const messageText = property.whatsappTemplate
      .replace('{{guest}}', booking.guestName)
      .replace('{{ref}}', booking.reference)
      .replace('{{property}}', property.name)
      .replace('{{date}}', booking.checkInDate)
      .replace('{{link}}', paymentLink);

    // Production-ready fetch implementation for WhatsApp Developer Hub
    try {
      const response = await fetch(property.webhookUrl || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY || 'MOCK_TOKEN'}`
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: booking.guestPhone.replace(/\s+/g, ''),
          type: "template",
          template: {
            name: "innflow_booking_confirmed",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: booking.guestName },
                  { type: "text", text: booking.reference },
                  { type: "text", text: paymentLink }
                ]
              }
            ]
          }
        })
      });
      
      const success = response.ok;
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'WHATSAPP',
        message: messageText,
        recipient: booking.guestPhone,
        status: success ? 'DELIVERED' : 'FAILED',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 50));
      
      addAuditLog('WHATSAPP_DISPATCH', `Notification sent for ${booking.reference} to ${booking.guestPhone}`);
    } catch (error) {
      console.warn('WhatsApp Dispatch Simulation:', messageText);
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'WHATSAPP',
        message: messageText,
        recipient: booking.guestPhone,
        status: 'SIMULATED',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 50));
    }
  }, [property, addAuditLog]);

  const generateReference = useCallback(() => {
    const year = new Date().getFullYear();
    const nextNum = property.lastRefNumber + 1;
    setProperty(prev => ({ ...prev, lastRefNumber: nextNum }));
    return `INF-${year}-${nextNum.toString().padStart(4, '0')}`;
  }, [property.lastRefNumber]);

  const handleBook = useCallback((newBooking: Booking) => {
    const ref = newBooking.reference || generateReference();
    const bookingWithRef = { ...newBooking, reference: ref };

    setBookings(prev => [...prev, bookingWithRef]);
    addAuditLog('BOOKING_CREATED', `Confirmed stay ${ref} for ${newBooking.guestName}`);
    triggerWhatsAppWebhook(bookingWithRef);
  }, [generateReference, triggerWhatsAppWebhook, addAuditLog]);

  const handleLogin = (role: UserRole) => {
    const user = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      email: `${role.toLowerCase()}@innflow.com`,
      role,
      name: role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' '),
      propertyId: role === UserRole.DEVELOPER ? undefined : property.id
    };
    setCurrentUser(user);
    localStorage.setItem('innflow_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('innflow_user');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex bg-white overflow-hidden safe-pt safe-pb">
        <div className="hidden lg:flex lg:w-3/5 relative bg-slate-950">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hospitality" />
          <div className="relative z-10 p-24 flex flex-col justify-between h-full text-white">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl">I</div>
                <h1 className="text-3xl font-black tracking-tighter">InnFlow<span className="text-blue-500">™</span></h1>
              </div>
              <h2 className="text-7xl font-black tracking-tighter leading-tight max-w-2xl">SaaS <span className="text-blue-500 italic">Hospitality</span> Solutions.</h2>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-2/5 p-8 md:p-16 lg:p-24 flex flex-col justify-center animate-in slide-in-from-right duration-700">
          <div className="max-w-md mx-auto w-full space-y-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Portal Access</h3>
              <p className="text-slate-400 mt-4 font-medium italic">Secured terminal for <span className="text-blue-600 font-black">{property.name}</span></p>
            </div>
            <div className="space-y-4">
              <button onClick={() => handleLogin(UserRole.GUEST)} className="w-full group p-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-between hover:bg-blue-500 transition-all shadow-2xl active:scale-[0.98]">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center"><Star size={24} /></div>
                   <span>Guest Booking</span>
                </div>
                <Zap size={20} />
              </button>
              <div className="grid grid-cols-1 gap-4">
                <LoginButton icon={<Building size={20} />} label="Administrator" sub="Manage Infrastructure" onClick={() => handleLogin(UserRole.BUSINESS_ADMIN)} />
                <LoginButton icon={<Briefcase size={20} />} label="Staff Member" sub="Operational Hub" onClick={() => handleLogin(UserRole.STAFF)} />
                <LoginButton icon={<ShieldCheck size={20} />} label="Dev Ops" sub="System Root" onClick={() => handleLogin(UserRole.DEVELOPER)} minimal />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculateTotal = (roomId: string, checkIn: string, checkOut: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    let total = 0;
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const rate = property.seasonalRates.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
      total += room.pricePerNight * (rate ? rate.multiplier : 1);
    }
    return Math.round(total);
  };

  if (currentUser.role === UserRole.GUEST) {
    return <GuestPortal property={property} rooms={rooms.filter(r => r.status === 'ACTIVE')} bookings={bookings} onBook={handleBook} onLogout={handleLogout} calculateTotal={calculateTotal} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden safe-pb">
        <Sidebar role={currentUser.role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header user={currentUser} property={property} />
          <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard property={property} rooms={rooms} bookings={bookings} />} />
              <Route path="/calendar" element={<CalendarView rooms={rooms} bookings={bookings} onBookingUpdate={() => {}} onAddBooking={handleBook} calculateTotal={calculateTotal} />} />
              <Route path="/rooms" element={<RoomManager rooms={rooms} onUpdate={setRooms} />} />
              <Route path="/bookings" element={<BookingManager bookings={bookings} rooms={rooms} onUpdate={setBookings} onLog={addAuditLog} />} />
              <Route path="/financials" element={<Financials bookings={bookings} cashUps={cashUps} onAddCashUp={(c) => setCashUps([c, ...cashUps])} propertyId={property.id} onLog={addAuditLog} />} />
              <Route path="/settings" element={<Settings property={property} userRole={currentUser.role} onUpdate={setProperty} onLog={addAuditLog} rooms={rooms} />} />
              <Route path="/staff" element={<StaffManager staff={staff} onUpdate={setStaff} onLog={addAuditLog} />} />
              <Route path="/logs" element={<AuditLogViewer logs={auditLogs} />} />
              <Route path="/developer" element={<DeveloperPortal tenants={tenants} onUpdate={setTenants} onImpersonate={(name) => { setProperty(p => ({...p, name})); handleLogin(UserRole.BUSINESS_ADMIN); }} onLog={addAuditLog} />} />
            </Routes>
          </main>
          <NotificationCenter notifications={notifications} />
        </div>
      </div>
    </HashRouter>
  );
};

const LoginButton: React.FC<{ icon: React.ReactNode, label: string, sub: string, onClick: () => void, minimal?: boolean }> = ({ icon, label, sub, onClick, minimal }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all text-left group ${minimal ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-200 hover:border-blue-500 text-slate-900'}`}>
    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${minimal ? 'bg-white' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'}`}>{icon}</div>
    <div>
      <p className="text-sm font-black uppercase tracking-tight">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sub}</p>
    </div>
  </button>
);

export default App;
