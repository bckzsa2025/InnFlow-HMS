
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';
import { NAV_ITEMS } from '../constants';
import { LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout }) => {
  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="w-72 bg-slate-950 text-slate-400 flex flex-col h-full border-r border-white/5 relative z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12 group cursor-default">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 group-hover:rotate-12 transition-transform">
            I
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white leading-none tracking-tighter">
              InnFlow<span className="text-blue-500">™</span>
            </h1>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Core Engine</span>
          </div>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) => 
                `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/25' 
                    : 'hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              <div className="transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <span className="font-bold text-sm tracking-tight flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-6">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-600/10 blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Account Level</p>
          <p className="text-sm font-bold text-white mt-1 relative z-10">Enterprise</p>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-red-400/20"
        >
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
