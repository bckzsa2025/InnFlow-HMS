
export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  STAFF = 'STAFF',
  GUEST = 'GUEST'
}

export enum BookingStatus {
  PROVISIONAL = 'PROVISIONAL',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  IKHOKHA = 'IKHOKHA',
  EFT = 'EFT',
  CASH_ON_ARRIVAL = 'CASH_ON_ARRIVAL',
  CARD_ON_ARRIVAL = 'CARD_ON_ARRIVAL'
}

export interface SeasonalRate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  checkInTime: string;
  checkOutTime: string;
  logoUrl?: string;
  headerImageUrl?: string;
  primaryColor: string;
  whatsappTemplate: string;
  staffWhatsapp: string;
  layoutGrid: RoomPosition[];
  seasonalRates: SeasonalRate[];
  lastRefNumber: number;
  webhookUrl?: string; // WhatsApp Developer Hub Endpoint
}

export interface RoomPosition {
  roomId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  images: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'BLOCKED';
  description: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  reference: string;
  guestName: string;
  guestId: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
  access: string[];
}

export interface Tenant {
  id: string;
  name: string;
  status: 'Active' | 'Trialing' | 'Suspended';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  users: number;
}

export interface CashUpRecord {
  id: string;
  date: string;
  cash: number;
  card: number;
  eft: number;
  total: number;
  notes: string;
  reconciledBy: string;
}

export interface AuditLog {
  id: string;
  propertyId: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface User {
  id: string;
  propertyId?: string;
  email: string;
  role: UserRole;
  name: string;
}
