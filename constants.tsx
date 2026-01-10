
import React from 'react';
import { 
  Hotel, 
  LayoutDashboard, 
  Calendar, 
  BedDouble, 
  Users, 
  CreditCard, 
  Settings, 
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  History,
  Shield
} from 'lucide-react';

export const COLORS = {
  primary: '#0F172A',
  secondary: '#334155',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['BUSINESS_ADMIN', 'STAFF'] },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, roles: ['BUSINESS_ADMIN', 'STAFF'] },
  { id: 'rooms', label: 'Rooms', icon: <BedDouble size={20} />, roles: ['BUSINESS_ADMIN'] },
  { id: 'bookings', label: 'Bookings', icon: <Users size={20} />, roles: ['BUSINESS_ADMIN', 'STAFF'] },
  { id: 'financials', label: 'Financials', icon: <CreditCard size={20} />, roles: ['BUSINESS_ADMIN'] },
  { id: 'staff', label: 'Staff Management', icon: <Shield size={20} />, roles: ['BUSINESS_ADMIN'] },
  { id: 'logs', label: 'Audit Logs', icon: <History size={20} />, roles: ['BUSINESS_ADMIN'] },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} />, roles: ['BUSINESS_ADMIN'] },
  { id: 'developer', label: 'Platform Management', icon: <ShieldCheck size={20} />, roles: ['DEVELOPER'] },
];

export const MOCK_PROPERTY_ID = 'prop_001';

export const INITIAL_ROOMS = [
  { id: 'r1', propertyId: 'prop_001', roomNumber: '101', roomType: 'Deluxe Suite', capacity: 2, pricePerNight: 1200, status: 'ACTIVE', description: 'Sea facing view with private balcony.', images: ['https://picsum.photos/400/300?random=1'] },
  { id: 'r2', propertyId: 'prop_001', roomNumber: '102', roomType: 'Standard Room', capacity: 2, pricePerNight: 850, status: 'ACTIVE', description: 'Cozy room with double bed.', images: ['https://picsum.photos/400/300?random=2'] },
  { id: 'r3', propertyId: 'prop_001', roomNumber: '103', roomType: 'Family Suite', capacity: 4, pricePerNight: 1800, status: 'ACTIVE', description: 'Large unit with kitchenette.', images: ['https://picsum.photos/400/300?random=3'] },
  { id: 'r4', propertyId: 'prop_001', roomNumber: '201', roomType: 'Executive King', capacity: 2, pricePerNight: 1500, status: 'ACTIVE', description: 'Premium luxury for business travelers.', images: ['https://picsum.photos/400/300?random=4'] },
];

export const INITIAL_LAYOUT = [
  { roomId: 'r1', x: 0, y: 0, w: 2, h: 2 },
  { roomId: 'r2', x: 2, y: 0, w: 2, h: 2 },
  { roomId: 'r3', x: 0, y: 2, w: 4, h: 2 },
  { roomId: 'r4', x: 4, y: 0, w: 2, h: 4 },
];
