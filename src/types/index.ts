export interface ServiceProvider {
  id: string;
  name: string;
  type: 'hospital' | 'bank' | 'government' | 'clinic' | 'other';
  description: string;
  address: string;
  phone: string;
  email: string;
  services: Service[];
  workingHours: WorkingHours;
  holidays: string[];
  settings: ProviderSettings;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price?: number;
  category: string;
  requiresPreparation: boolean;
  maxAdvanceBooking: number; // days
  allowWalkIn: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
    breaks?: { start: string; end: string }[];
  };
}

export interface ProviderSettings {
  allowOnlineBooking: boolean;
  allowPhoneBooking: boolean;
  allowWalkIn: boolean;
  requiresIdentityVerification: boolean;
  autoConfirmBookings: boolean;
  sendReminders: boolean;
  reminderTiming: number; // hours before appointment
  maxBookingsPerUser: number;
  cancellationPolicy: string;
  accessibilitySupport: boolean;
}

export interface Appointment {
  id: string;
  providerId: string;
  serviceId: string;
  userId: string;
  date: Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  bookingChannel: 'web' | 'phone' | 'walk-in' | 'sms' | 'voice';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  checkInTime?: Date;
  completedTime?: Date;
  queuePosition?: number;
  estimatedWaitTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  dateOfBirth?: Date;
  accessibilityNeeds?: string[];
  preferredLanguage: string;
  bookingHistory: string[];
  isGuest: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  createdAt: Date;
}

export interface QueueItem {
  appointmentId: string;
  userId: string;
  serviceId: string;
  estimatedTime: Date;
  actualWaitTime?: number;
  position: number;
  status: 'waiting' | 'called' | 'in-service' | 'completed' | 'no-show';
  checkInTime: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AIRecommendation {
  id: string;
  type: 'schedule_optimization' | 'capacity_adjustment' | 'service_improvement' | 'peak_prediction';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  suggestedActions: string[];
  implementationDate?: Date;
  status: 'pending' | 'implemented' | 'dismissed';
  createdAt: Date;
}

export interface Analytics {
  totalBookings: number;
  completedBookings: number;
  noShowRate: number;
  averageWaitTime: number;
  peakHours: { hour: number; bookings: number }[];
  popularServices: { serviceId: string; count: number }[];
  bookingChannels: { channel: string; count: number }[];
  userSatisfaction: number;
  revenueGenerated?: number;
}