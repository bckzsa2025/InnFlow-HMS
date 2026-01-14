
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
import { ShieldCheck, Building, Briefcase, Zap, Star, UserPlus, LogIn, Lock, Mail, User as UserIcon, Phone, Users } from 'lucide-react';

const DEFAULT_USERS: User[] = [
  { id: 'admin_01', username: 'Admin', password: 'A.dmin@2026', role: UserRole.BUSINESS_ADMIN, name: 'System Administrator', email: 'admin@innflex.com' },
  { id: 'staff_01', username: 'Staff', password: 'S.taff@2026', role: UserRole.STAFF, name: 'Reception Desk', email: 'staff@innflex.com' },
  { id: 'guest_01', username: 'Guest', password: 'G.uest@2026', role: UserRole.GUEST, name: 'Guest User', email: 'guest@innflex.com' },
  { id: 'dev_01', username: 'Sudo', password: 'S.udo@2026', role: UserRole.DEVELOPER, name: 'Lead Developer', email: 'dev@innflex.com' }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('innflex_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('innflex_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      const customUsers = parsed.filter((u: User) => !DEFAULT_USERS.some(d => d.id === u.id));
      return [...DEFAULT_USERS, ...customUsers];
    }
    return DEFAULT_USERS;
  });

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', username: '', email: '', password: '', role: UserRole.GUEST });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('innflex_users')) {
      localStorage.setItem('innflex_users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('innflex_users', JSON.stringify(users));
  }, [users]);

  const [property, setProperty] = useState<Property>(() => {
    const saved = localStorage.getItem('innflex_property');
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
    const saved = localStorage.getItem('innflex_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('innflex_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('innflex_staff');
    return saved ? JSON.parse(saved) : [
      { id: 's1', name: 'John Doe', email: 'john@oceanwhisper.com', role: UserRole.STAFF, lastLogin: '2 hours ago', access: ['Bookings', 'Calendar'] },
      { id: 's2', name: 'Sarah Miller', email: 'sarah@oceanwhisper.com', role: UserRole.BUSINESS_ADMIN, lastLogin: '10 mins ago', access: ['Full System'] }
    ];
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('innflex_tenants');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Ocean Whisper Lodge', status: 'Active', plan: 'Enterprise', users: 12 },
      { id: '2', name: 'Mountain Retreat B&B', status: 'Trialing', plan: 'Starter', users: 3 }
    ];
  });

  const [cashUps, setCashUps] = useState<CashUpRecord[]>(() => {
    const saved = localStorage.getItem('innflex_cashups');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('innflex_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', property.primaryColor);
    localStorage.setItem('innflex_property', JSON.stringify(property));
    localStorage.setItem('innflex_rooms', JSON.stringify(rooms));
    localStorage.setItem('innflex_bookings', JSON.stringify(bookings));
    localStorage.setItem('innflex_staff', JSON.stringify(staff));
    localStorage.setItem('innflex_tenants', JSON.stringify(tenants));
    localStorage.setItem('innflex_cashups', JSON.stringify(cashUps));
    localStorage.setItem('innflex_audit', JSON.stringify(auditLogs));
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
    const paymentLink = `https://pay.innflex.com/${booking.reference}`;
    const messageText = property.whatsappTemplate
      .replace('{{guest}}', booking.guestName)
      .replace('{{ref}}', booking.reference)
      .replace('{{property}}', property.name)
      .replace('{{date}}', booking.checkInDate)
      .replace('{{link}}', paymentLink);

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
            name: "innflex_booking_confirmed",
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
    // If reference is already generated by GuestPortal, use it, otherwise generate one
    const ref = newBooking.reference || generateReference();
    const bookingWithRef = { ...newBooking, reference: ref };

    setBookings(prev => [...prev, bookingWithRef]);
    addAuditLog('BOOKING_CREATED', `Confirmed stay ${ref} for ${newBooking.guestName}`);
    triggerWhatsAppWebhook(bookingWithRef);
  }, [generateReference, triggerWhatsAppWebhook, addAuditLog]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => 
      u.username.toLowerCase() === loginCreds.username.toLowerCase() && 
      u.password === loginCreds.password
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('innflex_session', JSON.stringify(user));
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Please verify your access.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.username.toLowerCase() === registerData.username.toLowerCase())) {
      setAuthError('Username already exists in the local registry.');
      return;
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      propertyId: property.id,
      username: registerData.username,
      password: registerData.password,
      name: registerData.name,
      email: registerData.email,
      role: registerData.role
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('innflex_session', JSON.stringify(newUser));
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('innflex_session');
    setLoginCreds({ username: '', password: '' });
  };

  // Robust, timezone-safe total calculation
  const calculateTotal = useCallback((roomId: string, checkIn: string, checkOut: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    
    // Parse dates (assumes YYYY-MM-DD input, treated as UTC by Date constructor often, but we handle iteration safely)
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return 0;

    let total = 0;
    const current = new Date(start);

    // Iterate day by day using UTC methods to ensure strict 24h steps without timezone interference
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      const rate = property.seasonalRates.find(r => dateStr >= r.startDate && dateStr <= r.endDate);
      const multiplier = rate ? rate.multiplier : 1;
      
      // Calculate per room night (Ignore guest count)
      total += room.pricePerNight * multiplier;
      
      // Advance one day safely
      current.setUTCDate(current.getUTCDate() + 1);
    }
    
    return Math.round(total);
  }, [rooms, property.seasonalRates]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex bg-white overflow-hidden safe-pt safe-pb">
        <div className="hidden lg:flex lg:w-3/5 relative bg-slate-950">
          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hospitality" />
          <div className="relative z-10 p-24 flex flex-col justify-between h-full text-white">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-2xl">I</div>
                <h1 className="text-3xl font-black tracking-tighter">InnFlex<span className="text-blue-500">™</span></h1>
              </div>
              <h2 className="text-7xl font-black tracking-tighter leading-tight max-w-2xl">SaaS <span className="text-blue-500 italic">Hospitality</span> Solutions.</h2>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Bookings</p>
                <p className="text-2xl font-black">{bookings.length}</p>
              </div>
              <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Rooms</p>
                <p className="text-2xl font-black">{rooms.filter(r => r.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-2/5 p-8 md:p-16 lg:p-24 flex flex-col justify-center animate-in slide-in-from-right duration-700 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {authMode === 'LOGIN' ? <Lock className="text-blue-600" /> : <UserPlus className="text-blue-600" />}
                {authMode === 'LOGIN' ? 'Secure Access' : 'Client Registration'}
              </h3>
              <p className="text-slate-400 mt-2 font-medium italic">
                {authMode === 'LOGIN' ? 'Authenticate to access your managed environment.' : 'Create a local identity to interact with the platform.'}
              </p>
            </div>

            {authError && (
               <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                 <ShieldCheck size={16} /> {authError}
               </div>
            )}

            {authMode === 'LOGIN' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button 
                    type="button"
                    onClick={() => setLoginCreds({ username: 'Guest', password: 'G.uest@2026' })}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UserIcon size={16} />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Portal</p>
                    <p className="text-sm font-bold text-slate-900">Guest Access</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setLoginCreds({ username: '', password: '' })}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Briefcase size={16} />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Portal</p>
                    <p className="text-sm font-bold text-slate-900">Admin Ops</p>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setLoginCreds({ username: '', password: '' })}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Users size={16} />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Portal</p>
                    <p className="text-sm font-bold text-slate-900">Staff Desk</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setLoginCreds({ username: '', password: '' })}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-800 hover:shadow-md transition-all text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={16} />
                    </div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Portal</p>
                    <p className="text-sm font-bold text-slate-900">Developer</p>
                  </button>
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 border-t border-slate-100"></div>
                    <span className="relative bg-white px-2 text-[10px] uppercase font-black tracking-widest text-slate-300">Or Manual Entry</span>
                </div>

                <InputGroup label="System Username" value={loginCreds.username} onChange={v => setLoginCreds({...loginCreds, username: v})} icon={<UserIcon size={14} />} autoComplete="username" />
                <InputGroup label="Access Key" type="password" value={loginCreds.password} onChange={v => setLoginCreds({...loginCreds, password: v})} icon={<Lock size={14} />} autoComplete="current-password" />
                
                <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                  <LogIn size={20} /> Authenticate
                </button>

                <div className="pt-2 text-center">
                  <button type="button" onClick={() => setAuthMode('REGISTER')} className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                    Register New Account
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Full Name" value={registerData.name} onChange={v => setRegisterData({...registerData, name: v})} icon={<UserIcon size={14} />} />
                  <InputGroup label="Username" value={registerData.username} onChange={v => setRegisterData({...registerData, username: v})} icon={<Zap size={14} />} autoComplete="username" />
                </div>
                <InputGroup label="Email Address" type="email" value={registerData.email} onChange={v => setRegisterData({...registerData, email: v})} icon={<Mail size={14} />} autoComplete="email" />
                <InputGroup label="Create Password" type="password" value={registerData.password} onChange={v => setRegisterData({...registerData, password: v})} icon={<Lock size={14} />} autoComplete="new-password" />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRegisterData({...registerData, role: UserRole.GUEST})} className={`p-3 rounded-xl border text-xs font-bold transition-all ${registerData.role === UserRole.GUEST ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>Guest</button>
                    <button type="button" onClick={() => setRegisterData({...registerData, role: UserRole.BUSINESS_ADMIN})} className={`p-3 rounded-xl border text-xs font-bold transition-all ${registerData.role === UserRole.BUSINESS_ADMIN ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>Admin</button>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.25rem] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95 mt-4">
                  Create Identity
                </button>
                
                <div className="pt-4 text-center">
                   <button type="button" onClick={() => setAuthMode('LOGIN')} className="text-xs font-bold text-slate-500 hover:text-slate-900">Cancel Registration</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === UserRole.GUEST) {
    return <GuestPortal 
      user={currentUser} 
      property={property} 
      rooms={rooms.filter(r => r.status === 'ACTIVE')} 
      bookings={bookings} 
      onBook={handleBook} 
      onLogout={handleLogout} 
      calculateTotal={calculateTotal} 
      onGetReference={generateReference}
    />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden safe-pb">
        <Sidebar role={currentUser.role} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header user={currentUser} property={property} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard property={property} rooms={rooms} bookings={bookings} />} />
              <Route path="/calendar" element={<CalendarView rooms={rooms} bookings={bookings} onBookingUpdate={() => {}} onAddBooking={handleBook} calculateTotal={calculateTotal} />} />
              <Route path="/rooms" element={<RoomManager rooms={rooms} onUpdate={setRooms} />} />
              <Route path="/bookings" element={<BookingManager bookings={bookings} rooms={rooms} onUpdate={setBookings} onCreate={handleBook} onLog={addAuditLog} calculateTotal={calculateTotal} />} />
              <Route path="/financials" element={<Financials bookings={bookings} cashUps={cashUps} onAddCashUp={(c) => setCashUps([c, ...cashUps])} propertyId={property.id} onLog={addAuditLog} />} />
              <Route path="/settings" element={<Settings property={property} userRole={currentUser.role} onUpdate={setProperty} onLog={addAuditLog} rooms={rooms} />} />
              <Route path="/staff" element={<StaffManager staff={staff} onUpdate={setStaff} onLog={addAuditLog} />} />
              <Route path="/logs" element={<AuditLogViewer logs={auditLogs} />} />
              <Route path="/developer" element={<DeveloperPortal tenants={tenants} onUpdate={setTenants} onImpersonate={(name) => { setProperty(p => ({...p, name})); }} onLog={addAuditLog} onLogout={handleLogout} />} />
            </Routes>
          </main>
          <NotificationCenter notifications={notifications} />
        </div>
      </div>
    </HashRouter>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, type?: string, icon?: React.ReactNode, autoComplete?: string }> = ({ label, value, onChange, type = "text", icon, autoComplete }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">{icon} {label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
      required
      autoComplete={autoComplete}
    />
  </div>
);

export default App;
