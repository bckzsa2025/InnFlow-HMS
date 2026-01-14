
import React from 'react';
import { User, Property } from '../types';
import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  property: Property;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, property, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {property.logoUrl ? (
          <img src={property.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded-lg shadow-sm border border-slate-100" />
        ) : (
          <div className="h-8 w-8 bg-[var(--primary-color)]/10 rounded-lg flex items-center justify-center">
            <span className="text-[var(--primary-color)] font-bold">{property.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 leading-none">{property.name}</h2>
          <span className="text-[11px] text-slate-400 uppercase font-medium">Active Property</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all w-64"
          />
        </div>

        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{user.role.replace('_', ' ')}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 overflow-hidden">
            <UserIcon size={20} />
          </div>
          <button 
            onClick={onLogout} 
            className="ml-2 h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
