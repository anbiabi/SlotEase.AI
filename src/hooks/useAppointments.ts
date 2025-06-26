import { useState, useEffect } from 'react';
import { Appointment, ServiceProvider, Service, User, QueueItem } from '../types';
import { addDays, format, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';

// Mock data for demonstration
const mockProvider: ServiceProvider = {
  id: 'provider-1',
  name: 'City Medical Center',
  type: 'hospital',
  description: 'Primary healthcare services with specialized departments',
  address: '123 Healthcare Ave, Medical District',
  phone: '+1-555-MEDICAL',
  email: 'appointments@citymedical.com',
  services: [
    {
      id: 'service-1',
      name: 'General Consultation',
      description: 'Initial consultation with primary care physician',
      duration: 30,
      price: 75,
      category: 'Primary Care',
      requiresPreparation: false,
      maxAdvanceBooking: 30,
      allowWalkIn: true,
      priority: 'medium'
    },
    {
      id: 'service-2',
      name: 'Specialist Consultation',
      description: 'Consultation with specialist physician',
      duration: 45,
      price: 150,
      category: 'Specialist Care',
      requiresPreparation: true,
      maxAdvanceBooking: 60,
      allowWalkIn: false,
      priority: 'high'
    },
    {
      id: 'service-3',
      name: 'Lab Tests',
      description: 'Blood work and diagnostic tests',
      duration: 15,
      price: 25,
      category: 'Diagnostics',
      requiresPreparation: true,
      maxAdvanceBooking: 14,
      allowWalkIn: true,
      priority: 'low'
    }
  ],
  workingHours: {
    Monday: { open: '08:00', close: '17:00', isOpen: true },
    Tuesday: { open: '08:00', close: '17:00', isOpen: true },
    Wednesday: { open: '08:00', close: '17:00', isOpen: true },
    Thursday: { open: '08:00', close: '17:00', isOpen: true },
    Friday: { open: '08:00', close: '17:00', isOpen: true },
    Saturday: { open: '09:00', close: '13:00', isOpen: true },
    Sunday: { open: '09:00', close: '13:00', isOpen: false }
  },
  holidays: ['2024-12-25', '2024-01-01'],
  settings: {
    allowOnlineBooking: true,
    allowPhoneBooking: true,
    allowWalkIn: true,
    requiresIdentityVerification: false,
    autoConfirmBookings: true,
    sendReminders: true,
    reminderTiming: 24,
    maxBookingsPerUser: 3,
    cancellationPolicy: '24 hours notice required',
    accessibilitySupport: true
  },
  createdAt: new Date('2024-01-01')
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentProvider, setCurrentProvider] = useState<ServiceProvider>(mockProvider);
  const [loading, setLoading] = useState(false);

  // Generate mock appointments
  useEffect(() => {
    const generateMockAppointments = () => {
      const mockAppointments: Appointment[] = [];
      const today = new Date();
      
      for (let i = 0; i < 20; i++) {
        const date = addDays(today, Math.floor(Math.random() * 14));
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.random() > 0.5 ? 0 : 30;
        
        mockAppointments.push({
          id: `appointment-${i + 1}`,
          providerId: mockProvider.id,
          serviceId: mockProvider.services[Math.floor(Math.random() * mockProvider.services.length)].id,
          userId: `user-${i + 1}`,
          date,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          duration: [15, 30, 45][Math.floor(Math.random() * 3)],
          status: ['scheduled', 'confirmed', 'completed'][Math.floor(Math.random() * 3)] as any,
          bookingChannel: ['web', 'phone', 'walk-in'][Math.floor(Math.random() * 3)] as any,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          queuePosition: Math.floor(Math.random() * 10) + 1,
          estimatedWaitTime: Math.floor(Math.random() * 60) + 15,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        });
      }
      
      setAppointments(mockAppointments);
    };

    generateMockAppointments();
  }, []);

  const bookAppointment = async (appointmentData: Partial<Appointment>): Promise<string> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAppointment: Appointment = {
      id: `appointment-${Date.now()}`,
      providerId: currentProvider.id,
      serviceId: appointmentData.serviceId || currentProvider.services[0].id,
      userId: appointmentData.userId || `user-${Date.now()}`,
      date: appointmentData.date || new Date(),
      time: appointmentData.time || '09:00',
      duration: appointmentData.duration || 30,
      status: 'scheduled',
      bookingChannel: 'web',
      priority: appointmentData.priority || 'medium',
      queuePosition: appointments.length + 1,
      estimatedWaitTime: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...appointmentData
    };

    setAppointments(prev => [...prev, newAppointment]);
    setLoading(false);
    
    return newAppointment.id;
  };

  const cancelAppointment = async (appointmentId: string): Promise<void> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled', updatedAt: new Date() }
          : apt
      )
    );
    
    setLoading(false);
  };

  const getAvailableSlots = (serviceId: string, date: Date): string[] => {
    const service = currentProvider.services.find(s => s.id === serviceId);
    if (!service) return [];

    const dayName = format(date, 'EEEE');
    const workingHours = currentProvider.workingHours[dayName];
    
    if (!workingHours?.isOpen) return [];

    const slots: string[] = [];
    const [openHour, openMinute] = workingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = workingHours.close.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(openHour, openMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(closeHour, closeMinute, 0, 0);

    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Check if slot is already booked
      const isBooked = appointments.some(apt => 
        apt.date.toDateString() === date.toDateString() && 
        apt.time === timeString &&
        apt.status !== 'cancelled'
      );
      
      if (!isBooked) {
        slots.push(timeString);
      }
      
      currentTime = addMinutes(currentTime, 30); // 30-minute slots
    }

    return slots;
  };

  const checkIn = async (appointmentId: string): Promise<void> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmed', checkInTime: new Date(), updatedAt: new Date() }
          : apt
      )
    );
    
    setLoading(false);
  };

  return {
    appointments,
    queue,
    currentProvider,
    loading,
    bookAppointment,
    cancelAppointment,
    getAvailableSlots,
    checkIn,
    setCurrentProvider
  };
};