import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, ArrowRight, ArrowLeft, Search, Shield, Printer, MessageSquare } from 'lucide-react';
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { PhoneInput } from './PhoneInput';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  agreedToTerms: boolean;
  selectedService: string;
  fullName: string;
  phoneNumber: string;
  selectedDate: Date | null;
  selectedTime: string;
}

interface TimeSlot {
  time: string;
  available: number;
  total: number;
}

export const UserOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    agreedToTerms: false,
    selectedService: '',
    fullName: '',
    phoneNumber: '',
    selectedDate: null,
    selectedTime: ''
  });

  const [phoneError, setPhoneError] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [smsConfirmation, setSmsConfirmation] = useState(true);

  // Generate captcha on component mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaCode('');
    setCaptchaVerified(false);
  };

  const services = [
    {
      id: 'immigration-visa-renewal',
      name: 'Immigration - Visa Renewal',
      description: 'Renewal of existing visa applications and status updates',
      duration: '30 minutes',
      icon: '🛂',
      location: 'Immigration Office - Downtown'
    },
    {
      id: 'passport-application',
      name: 'Passport Application',
      description: 'New passport applications and renewals',
      duration: '45 minutes',
      icon: '📘',
      location: 'Passport Office - Main Branch'
    },
    {
      id: 'medical-consultation',
      name: 'Medical Consultation',
      description: 'General medical consultation and health checkups',
      duration: '30 minutes',
      icon: '🏥',
      location: 'City General Hospital'
    },
    {
      id: 'pharmacy-prescription',
      name: 'Pharmacy - Prescription Pickup',
      description: 'Prescription medication pickup and consultation',
      duration: '15 minutes',
      icon: '💊',
      location: 'Central Pharmacy'
    },
    {
      id: 'bank-account-services',
      name: 'Bank Account Services',
      description: 'Account opening, loan applications, and financial services',
      duration: '45 minutes',
      icon: '🏦',
      location: 'First National Bank'
    },
    {
      id: 'government-document-verification',
      name: 'Government - Document Verification',
      description: 'Official document verification and certification',
      duration: '20 minutes',
      icon: '📋',
      location: 'Government Services Center'
    }
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneChange = (phone: string, isValid: boolean) => {
    setData(prev => ({ ...prev, phoneNumber: phone }));
    setPhoneValid(isValid);
    setPhoneError(isValid || !phone ? '' : 'Please enter a valid phone number');
  };

  const verifyCaptcha = () => {
    if (captchaCode.toUpperCase() === generatedCaptcha) {
      setCaptchaVerified(true);
      return true;
    }
    return false;
  };

  // Generate time slots for selected date
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 12) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = Math.floor(Math.random() * 4); // 0-3 available slots
        const total = 3;
        
        slots.push({
          time: timeString,
          available,
          total
        });
      }
    }
    
    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    const oneYearFromNow = addDays(today, 365);
    return !isBefore(date, today) && isBefore(date, oneYearFromNow);
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    setConfirmationSent(true);
    // Simulate sending confirmation
    setTimeout(() => {
      onComplete(data);
    }, 2000);
  };

  const printReservation = () => {
    const selectedServiceData = services.find(s => s.id === data.selectedService);
    const confirmationCode = `SE${Date.now().toString().slice(-6)}`;
    
    const printContent = `
      SLOTEASE RESERVATION CONFIRMATION
      ================================
      
      Service: ${selectedServiceData?.name}
      Location: ${selectedServiceData?.location}
      Name: ${data.fullName}
      Phone: ${data.phoneNumber}
      Date: ${data.selectedDate ? format(data.selectedDate, 'MMMM d, yyyy') : ''}
      Time: ${data.selectedTime}
      Duration: ${selectedServiceData?.duration}
      Confirmation Code: ${confirmationCode}
      
      IMPORTANT NOTES:
      - Please arrive 15 minutes early
      - Bring valid identification
      - Keep this confirmation for your records
      
      Generated: ${new Date().toLocaleString()}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; padding: 20px;">${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const canProceedFromStep4 = () => {
    return data.fullName.trim() && 
           data.phoneNumber && 
           phoneValid && 
           captchaVerified;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber < step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 6 && (
                  <div className={`w-12 h-1 mx-2 ${
                    stepNumber < step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Welcome</span>
            <span>Terms</span>
            <span>Service</span>
            <span>Info</span>
            <span>Schedule</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step 1: Welcome Screen */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <Calendar className="h-16 w-16 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to SlotEase.AI
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Your Universal Reservation Assistant
              </p>
              <p className="text-gray-500">
                Book appointments with hospitals, government offices, clinics, services & more — all in one place.
              </p>
            </div>

            <div className="bg-primary-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-primary-800 mb-3">Why Choose SlotEase?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-primary-700">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>One platform for all services</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Real-time availability</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Instant confirmations</span>
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
            >
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Terms & Consent */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up">
            <div className="text-center mb-8">
              <Shield className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms of Use & Legal Acknowledgement</h2>
              <p className="text-gray-600">Please review and accept our terms to continue</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Important Note for Reservation</h3>
              
              <div className="space-y-4 text-sm text-red-700">
                <div className="flex items-start">
                  <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  <p>The Ministry of Justice plans to regularly check the internet IP of reservation applicants. Please note that criminal penalties will be imposed for act of reserving too many slots by illegally using others' personal information.</p>
                </div>
                
                <div className="flex items-start">
                  <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  <p>If you have paid health insurance premiums in arrears within the last 5 days through a utility bill payment machine or Internet Giro (www.giro.or.kr), be sure to bring the receipt.</p>
                </div>
                
                <div className="flex items-start">
                  <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <p className="font-semibold">Please make a reservation for the date before the expiry date of the period of stay or the statutory reporting period.</p>
                    <div className="ml-6 mt-2 space-y-1">
                      <p>- If you visit after the expiry date of your stay or the statutory reporting period, a penalty (or fine) may be imposed.</p>
                      <p>- If there is no date available for reservation within the expiration date of the period of stay or within the statutory reporting period, please visit a jurisdictional immigration office before the reporting period ends.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="bg-red-200 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                  <p>Please note that applying for a visit reservation is merely an act of making an appointment to visit an immigration office for the date, and does not mean a 'receipt of your petition'.</p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Privacy Policy Summary</h4>
                  <p className="text-gray-700 text-sm">
                    We collect and process your personal information solely for appointment booking purposes. 
                    Your data is encrypted, securely stored, and will be deleted after your appointment unless 
                    required for legal compliance. We do not share your information with third parties without consent.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={data.agreedToTerms}
                onChange={(e) => setData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                I have read and agree to the terms of service and privacy policy
              </label>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!data.agreedToTerms}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                I Agree & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Service Selection */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Selection</h2>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by service name or type (e.g. passport, doctor, pharmacy)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setData(prev => ({ ...prev, selectedService: service.id }))}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    data.selectedService === service.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-3xl">{service.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                        <p className="text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration}
                          </div>
                          <div className="flex items-center">
                            <span>📍 {service.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      data.selectedService === service.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {data.selectedService === service.id && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!data.selectedService}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Personal Information */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* International Phone Input */}
              <PhoneInput
                value={data.phoneNumber}
                onChange={handlePhoneChange}
                error={phoneError}
                placeholder="Enter your phone number"
              />

              {/* SMS Confirmation Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsConfirmation"
                  checked={smsConfirmation}
                  onChange={(e) => setSmsConfirmation(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="smsConfirmation" className="ml-3 text-sm text-gray-700">
                  Receive confirmation by SMS
                </label>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Verification *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg font-mono text-lg tracking-wider border-2 border-dashed border-gray-300">
                    {generatedCaptcha}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setCaptchaCode(value);
                    if (value === generatedCaptcha) {
                      setCaptchaVerified(true);
                    } else {
                      setCaptchaVerified(false);
                    }
                  }}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter the code above"
                  maxLength={6}
                />
                {captchaVerified && (
                  <div className="mt-2 flex items-center text-sm text-accent-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verification successful
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceedFromStep4()}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Appointment Scheduling Interface */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date/Time for Visit Reservation</h2>
            
            {/* Reservation Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Number of Visitors</span>
                <div className="font-medium">1</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration</span>
                <div className="font-medium">
                  {services.find(s => s.id === data.selectedService)?.duration || '30 minutes'}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Notice</span>
                <div className="text-sm text-red-600">
                  Can reserve from {format(new Date(), 'yyyy-MM-dd')} ~ {format(addDays(new Date(), 365), 'yyyy-MM-dd')} is available.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, 'yyyy년 M월')}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date) => {
                    const isAvailable = isDateAvailable(date);
                    const isSelected = data.selectedDate && format(date, 'yyyy-MM-dd') === format(data.selectedDate, 'yyyy-MM-dd');
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => isAvailable && setData(prev => ({ ...prev, selectedDate: date }))}
                        disabled={!isAvailable}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : isAvailable
                            ? 'hover:bg-gray-100 text-gray-900'
                            : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        } ${isToday(date) ? 'ring-2 ring-primary-300' : ''}`}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary-600 rounded mr-2"></div>
                    <span>Selected Date</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-800 rounded mr-2"></div>
                    <span>Reservation Unavailable (Reservation expiration)</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    ※ Time schedules, which are already reserved, are grayed out
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                {data.selectedDate && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">
                      Selected Date: {format(data.selectedDate, 'yyyy-MM-dd')}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {generateTimeSlots(data.selectedDate).map((slot) => {
                        const isAvailable = slot.available > 0;
                        const isSelected = data.selectedTime === slot.time;
                        
                        return (
                          <button
                            key={slot.time}
                            onClick={() => isAvailable && setData(prev => ({ ...prev, selectedTime: slot.time }))}
                            disabled={!isAvailable}
                            className={`p-3 text-sm rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white border-primary-600'
                                : isAvailable
                                ? 'bg-white border-gray-300 hover:border-primary-300 text-gray-900'
                                : 'bg-gray-800 text-gray-400 border-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {slot.time} ({slot.available}/{slot.total})
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {!data.selectedDate && (
                  <div className="text-center text-gray-500 py-8">
                    Please select a date to view available time slots
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!data.selectedDate || !data.selectedTime}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Confirm
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-slide-up">
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-accent-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Confirmed!</h2>
              <p className="text-gray-600">Your appointment has been successfully scheduled</p>
            </div>

            <div className="bg-accent-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-accent-900 mb-4">Reservation Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-accent-700">Service:</span>
                  <span className="font-medium text-accent-900">
                    {services.find(s => s.id === data.selectedService)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Location:</span>
                  <span className="font-medium text-accent-900">
                    {services.find(s => s.id === data.selectedService)?.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Name:</span>
                  <span className="font-medium text-accent-900">{data.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Phone:</span>
                  <span className="font-medium text-accent-900">{data.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Date:</span>
                  <span className="font-medium text-accent-900">
                    {data.selectedDate ? format(data.selectedDate, 'MMMM d, yyyy') : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Time:</span>
                  <span className="font-medium text-accent-900">{data.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-accent-700">Confirmation Code:</span>
                  <span className="font-medium text-accent-900">SE{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>

            {!confirmationSent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  {smsConfirmation && (
                    <button
                      onClick={handleConfirm}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS Confirmation
                    </button>
                  )}
                  
                  <button
                    onClick={printReservation}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Reservation Sheet
                  </button>
                </div>
                
                <p className="text-center text-sm text-gray-600">
                  Please arrive 15 minutes early and bring valid identification
                </p>

                <div className="text-center">
                  <button
                    onClick={() => onComplete(data)}
                    className="px-8 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <MessageSquare className="h-8 w-8 text-primary-600 mx-auto" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">Sending confirmation...</p>
                <p className="text-sm text-gray-600">
                  You will receive a confirmation message at {data.phoneNumber}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};