import React, { useState } from 'react';
import { Clock, User, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { ServiceProvider } from '../types';
import { format, addDays } from 'date-fns';
import { useAppointments } from '../hooks/useAppointments';
import { processBookingWithAI } from '../ai/AIBackgroundProcessor';
import enUS from 'date-fns/locale/en-US';

interface BookingFormProps {
  provider: ServiceProvider;
  onBookingComplete: (appointmentId: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ provider, onBookingComplete }) => {
  const { bookAppointment, getAvailableSlots, loading } = useAppointments();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    accessibilityNeeds: [] as string[],
    preferredLanguage: 'en',
    isGuest: true
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId }));
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
    const selectedDate = new Date(date);
    const slots = getAvailableSlots(formData.serviceId, selectedDate);
    setAvailableSlots(slots);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appointmentId = await bookAppointment({
        serviceId: formData.serviceId,
        date: new Date(formData.date),
        time: formData.time,
        notes: formData.notes,
        priority: 'medium'
      });

      // --- AI Background Processing ---
      processBookingWithAI({
        userId: 'current_user_id', // Replace with actual user ID if available
        serviceType: selectedService?.name || '',
        date: formData.date,
        time: formData.time,
        specialRequirements: formData.notes,
        contactInfo: { phone: formData.phone, email: formData.email },
        channel: 'web'
      });
      // --- End AI Background Processing ---

      setBookingStatus('success');
      setTimeout(() => {
        onBookingComplete(appointmentId);
      }, 2000);
    } catch {
      setBookingStatus('error');
    }
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(currentDate, i);
      const dayName = format(date, 'EEEE');
      const workingHours = provider.workingHours[dayName];
      
      if (workingHours?.isOpen) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const selectedService = provider.services.find(s => s.id === formData.serviceId);

  if (bookingStatus === 'success') {
    return (
      <div className="text-center py-12 animate-fade-in">
        <CheckCircle className="h-16 w-16 text-accent-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-6">
          Your appointment has been successfully scheduled. You'll receive a confirmation message shortly.
        </p>
        <div className="bg-accent-50 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-sm text-accent-800">
            <p><strong>Service:</strong> {selectedService?.name}</p>
            <p><strong>Date:</strong> {format(new Date(formData.date), 'MMMM d, yyyy', { locale: enUS })}</p>
            <p><strong>Time:</strong> {formData.time}</p>
            <p><strong>Duration:</strong> {selectedService?.duration} minutes</p>
          </div>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'error') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h3>
        <p className="text-gray-600 mb-6">
          We couldn't complete your booking. Please try again or contact support.
        </p>
        <button
          onClick={() => setBookingStatus('idle')}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber <= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`w-24 h-1 mx-2 ${
                  stepNumber < step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Select Service</span>
          <span>Choose Date</span>
          <span>Pick Time</span>
          <span>Your Details</span>
        </div>
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {provider.services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} min
                  </div>
                  {service.price && (
                    <div className="text-primary-600 font-semibold">
                      ${service.price}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    service.priority === 'high' ? 'bg-error-100 text-error-800' :
                    service.priority === 'medium' ? 'bg-warning-100 text-warning-800' :
                    'bg-accent-100 text-accent-800'
                  }`}>
                    {service.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date Selection */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Date</h2>
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
            {getNextAvailableDates().map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date.toISOString().split('T')[0])}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-center"
              >
                <div className="text-sm text-gray-500">{format(date, 'EEE', { locale: enUS })}</div>
                <div className="text-lg font-semibold text-gray-900">{format(date, 'd', { locale: enUS })}</div>
                <div className="text-sm text-gray-500">{format(date, 'MMM', { locale: enUS })}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Time Selection */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pick a Time</h2>
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
            {availableSlots.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-center font-medium"
              >
                {time}
              </button>
            ))}
          </div>
          {availableSlots.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No available slots for this date. Please select another date.</p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Choose Different Date
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: User Details */}
      {step === 4 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  id="language"
                  value={formData.preferredLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Any special requirements or notes for your appointment"
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};