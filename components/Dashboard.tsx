
import React, { useMemo } from 'react';
import { Property, Room, Booking, BookingStatus } from '../types';
import { 
  Users, 
  Bed, 
  TrendingUp, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface DashboardProps {
  property: Property;
  rooms: Room[];
  bookings: Booking[];
}

const Dashboard: React.FC<DashboardProps> = ({ property, rooms, bookings }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkinsToday = bookings.filter(b => b.checkInDate === today && b.status !== BookingStatus.CANCELLED);
    const checkoutsToday = bookings.filter(b => b.checkOutDate === today && b.status !== BookingStatus.CANCELLED);
    const activeBookings = bookings.filter(b => b.status === BookingStatus.CHECKED_IN);
    const occupancyRate = rooms.length > 0 ? (activeBookings.length / rooms.length) * 100 : 0;
    const totalRevenue = bookings
      .filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      checkinsToday: checkinsToday.length,
      checkoutsToday: checkoutsToday.length,
      occupancyRate: Math.round(occupancyRate),
      totalRevenue: totalRevenue.toLocaleString(),
      totalRooms: rooms.length,
      availableRooms: rooms.length - activeBookings.length
    };
  }, [bookings, rooms]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayRevenue = bookings
        .filter(b => b.createdAt.startsWith(dateStr) && b.status !== BookingStatus.CANCELLED)
        .reduce((sum, b) => sum + b.totalAmount, 0);
        
      data.push({ name: dayName, revenue: dayRevenue });
    }
    return data;
  }, [bookings]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Operational Real-Time Status</p>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {property.name.split(' ')[0]} <span className="text-blue-600">Overview</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold text-xs">
            <CalendarIcon size={14} className="text-blue-500" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <button className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
            <Zap size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Clock size={20} />} 
          label="Check-ins" 
          sub="Expecting Today"
          value={stats.checkinsToday.toString()} 
          color="blue"
        />
        <StatCard 
          icon={<CheckCircle2 size={20} />} 
          label="Check-outs" 
          sub="Confirmed Today"
          value={stats.checkoutsToday.toString()} 
          color="emerald"
        />
        <StatCard 
          icon={<TrendingUp size={20} />} 
          label="Occupancy" 
          sub="Live Capacity"
          value={`${stats.occupancyRate}%`} 
          color="violet"
        />
        <StatCard 
          icon={<TrendingUp size={20} />} 
          label="Gross Revenue" 
          sub="Accumulated Total"
          value={`R ${stats.totalRevenue}`} 
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Stream</h3>
              <p className="text-slate-400 text-xs font-medium">Weekly financial velocity</p>
            </div>
            <div className="flex gap-2">
              <span className="h-8 px-4 bg-blue-50 text-blue-600 rounded-full flex items-center text-[10px] font-black uppercase tracking-widest">
                Growth +12%
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col shadow-2xl shadow-slate-900/20 text-white">
          <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
            Recent Activity
            <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">View All</button>
          </h3>
          <div className="space-y-4 flex-1">
            {bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN).slice(-4).reverse().map((b) => (
              <div key={b.id} className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{b.guestName}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 tracking-wider">{b.reference}</p>
                </div>
                <div className="text-right flex flex-col justify-between">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                    b.status === BookingStatus.CHECKED_IN ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {b.status}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">R {b.totalAmount}</p>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 h-full text-center">
                <AlertCircle size={48} />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em]">Queue Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, sub: string, value: string, color: string }> = ({ icon, label, sub, value, color }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  };

  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="mt-6">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
        <div className="flex items-baseline justify-between mt-1">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          <div className="flex items-center text-[10px] font-bold text-emerald-500">
            <ArrowUpRight size={14} />
          </div>
        </div>
        <p className="text-[9px] font-semibold text-slate-400 mt-2 flex items-center gap-1.5 uppercase">
           {sub}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
