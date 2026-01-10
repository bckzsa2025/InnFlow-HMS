
import React, { useState } from 'react';
import { MessageSquare, Bell, X, ChevronUp, ChevronDown, CheckCheck } from 'lucide-react';

interface NotificationCenterProps {
  notifications: any[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExpanded ? 'w-80 h-96' : 'w-14 h-14'}`}>
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform relative"
        >
          <MessageSquare size={24} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {notifications.length}
            </span>
          )}
        </button>
      ) : (
        <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in duration-200">
          <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <h4 className="text-sm font-bold uppercase tracking-tight">WhatsApp Logs</h4>
            </div>
            <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-white/10 rounded"><ChevronDown size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {notifications.map(n => (
              <div key={n.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{n.recipient}</span>
                  <span className="text-[8px] text-slate-400 font-bold">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-tight italic">"{n.message}"</p>
                <div className="flex justify-end mt-2 text-emerald-500">
                  <CheckCheck size={12} />
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-slate-900 italic text-sm">
                <Bell size={32} className="mb-2" />
                <p>No messages sent yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
