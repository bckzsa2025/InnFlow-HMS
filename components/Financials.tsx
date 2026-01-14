
import React, { useMemo, useState } from 'react';
import { Booking, PaymentStatus, BookingStatus, CashUpRecord } from '../types';
import { DollarSign, FileText, Download, PieChart as PieIcon, ArrowUpRight, TrendingUp, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface FinancialsProps {
  bookings: Booking[];
  cashUps: CashUpRecord[];
  onAddCashUp: (record: CashUpRecord) => void;
  propertyId: string;
  onLog?: (action: string, details: string) => void;
}

const Financials: React.FC<FinancialsProps> = ({ bookings, cashUps, onAddCashUp, propertyId, onLog }) => {
  const [showCashUp, setShowCashUp] = useState(false);
  const [cashUpState, setCashUpState] = useState({ cash: 0, card: 0, eft: 0, notes: '' });

  const stats = useMemo(() => {
    const validBookings = bookings.filter(b => b.status !== BookingStatus.CANCELLED);
    const revenue = validBookings.reduce((acc, b) => acc + b.totalAmount, 0);
    const paid = validBookings.filter(b => b.paymentStatus === PaymentStatus.PAID).reduce((acc, b) => acc + b.totalAmount, 0);
    const pending = revenue - paid;
    return { revenue, paid, pending };
  }, [bookings]);

  const paymentData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      const method = b.paymentMethod || 'Other';
      counts[method] = (counts[method] || 0) + b.totalAmount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const getPrimaryColor = () => getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#3B82F6';
  const COLORS = [getPrimaryColor(), '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

  const exportToCSV = () => {
    const headers = ['Reference', 'Guest Name', 'Room ID', 'Check-In', 'Check-Out', 'Total', 'Status', 'Payment Method'];
    const rows = bookings.map(b => [
      b.reference,
      `"${b.guestName}"`,
      b.roomId,
      b.checkInDate,
      b.checkOutDate,
      b.totalAmount,
      b.status,
      b.paymentMethod || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `innflex_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLog?.('FINANCIAL_EXPORT', 'Full ledger exported to CSV');
  };

  const handleCashUpSubmit = () => {
    const total = cashUpState.cash + cashUpState.card + cashUpState.eft;
    const newRecord: CashUpRecord = {
      id: `CUP-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      cash: cashUpState.cash,
      card: cashUpState.card,
      eft: cashUpState.eft,
      total: total,
      notes: cashUpState.notes,
      reconciledBy: 'Admin (Verified)'
    };
    
    onAddCashUp(newRecord);
    onLog?.('FINANCIAL_CASH_UP', `Closed register for ${newRecord.date}. Reconciled R${total.toLocaleString()}`);
    setShowCashUp(false);
    setCashUpState({ cash: 0, card: 0, eft: 0, notes: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial <span className="text-blue-600">Intelligence</span></h1>
          <p className="text-slate-400 mt-2 font-medium italic">Comprehensive ledger tracking and audited cash-up history.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-2xl border border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition shadow-sm"
          >
            <Download size={18} /> Export Master Ledger
          </button>
          <button 
            onClick={() => setShowCashUp(true)}
            className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition shadow-2xl active:scale-95"
          >
            <FileText size={18} /> Daily Reconciliation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FinancialStatCard label="Gross Projected Revenue" value={`R ${stats.revenue.toLocaleString()}`} icon={<TrendingUp className="text-blue-500" />} />
        <FinancialStatCard label="Realized Cashflow" value={`R ${stats.paid.toLocaleString()}`} icon={<CheckCircle className="text-emerald-500" />} color="bg-emerald-50" />
        <FinancialStatCard label="Outstanding Receivables" value={`R ${stats.pending.toLocaleString()}`} icon={<DollarSign className="text-amber-500" />} color="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
            <PieIcon size={24} className="text-blue-600" /> Revenue Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] flex flex-col shadow-2xl shadow-slate-900/20 text-white">
          <h3 className="text-xl font-black mb-10 flex items-center justify-between uppercase tracking-tight">
            Reconciliation Audit
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 tracking-[0.2em]">Verified History</span>
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-4 custom-scroll">
            {cashUps.map(c => (
              <div key={c.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">{c.notes || 'No discrepancies noted'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-emerald-400 leading-none">R {c.total.toLocaleString()}</p>
                  <div className="flex items-center gap-2 justify-end mt-2">
                     <ShieldCheck size={12} className="text-blue-400" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.reconciledBy}</span>
                  </div>
                </div>
              </div>
            ))}
            {cashUps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 h-full text-center">
                <FileText size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">No closed registers</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCashUp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Daily Reconciliation</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Financial Period: {new Date().toLocaleDateString()}</p>
              </div>
              <button onClick={() => setShowCashUp(false)} className="p-3 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <InputGroup label="Actual Cash on Hand" type="number" value={cashUpState.cash.toString()} onChange={v => setCashUpState({...cashUpState, cash: Number(v)})} />
                <InputGroup label="Card Terminal Totals" type="number" value={cashUpState.card.toString()} onChange={v => setCashUpState({...cashUpState, card: Number(v)})} />
                <InputGroup label="Verified Bank EFTs" type="number" value={cashUpState.eft.toString()} onChange={v => setCashUpState({...cashUpState, eft: Number(v)})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Discrepancy Notes</label>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] h-24 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none" 
                    placeholder="Audit trail notes for shift discrepancies..." 
                    value={cashUpState.notes}
                    onChange={e => setCashUpState({...cashUpState, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="p-8 bg-slate-900 rounded-[2rem] flex items-center justify-between text-white">
                <div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculated Total</span>
                   <p className="text-4xl font-black text-blue-400 tracking-tighter mt-1">R {(cashUpState.cash + cashUpState.card + cashUpState.eft).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                   <ShieldCheck size={28} />
                </div>
              </div>

              <button onClick={handleCashUpSubmit} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/30">
                <CheckCircle size={24} /> Authenticate & Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FinancialStatCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color?: string }> = ({ label, value, icon, color = 'bg-white' }) => (
  <div className={`${color} p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group`}>
    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-8 group-hover:rotate-6 transition-transform">
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
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

export default Financials;
