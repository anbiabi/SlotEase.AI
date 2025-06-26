import React, { useState } from 'react';
import { Building, Clock, Settings, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { ServiceProvider, Service, WorkingHours } from '../types';

export const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [providerData, setProviderData] = useState<Partial<ServiceProvider>>({
    name: '',
    type: 'clinic',
    description: '',
    address: '',
    phone: '',
    email: '',
    services: [],
    workingHours: {
      Monday: { open: '09:00', close: '17:00', isOpen: true },
      Tuesday: { open: '09:00', close: '17:00', isOpen: true },
      Wednesday: { open: '09:00', close: '17:00', isOpen: true },
      Thursday: { open: '09:00', close: '17:00', isOpen: true },
      Friday: { open: '09:00', close: '17:00', isOpen: true },
      Saturday: { open: '09:00', close: '13:00', isOpen: false },
      Sunday: { open: '09:00', close: '13:00', isOpen: false }
    },
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
    }
  });

  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    requiresPreparation: false,
    maxAdvanceBooking: 30,
    allowWalkIn: true,
    priority: 'medium'
  });

  const handleProviderUpdate = (field: string, value: any) => {
    setProviderData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkingHoursUpdate = (day: string, field: string, value: any) => {
    setProviderData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours?.[day],
          [field]: value
        }
      }
    }));
  };

  const handleSettingsUpdate = (field: string, value: any) => {
    setProviderData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const addService = () => {
    if (newService.name && newService.description) {
      const service: Service = {
        id: `service-${Date.now()}`,
        name: newService.name!,
        description: newService.description!,
        duration: newService.duration || 30,
        price: newService.price,
        category: newService.category || 'General',
        requiresPreparation: newService.requiresPreparation || false,
        maxAdvanceBooking: newService.maxAdvanceBooking || 30,
        allowWalkIn: newService.allowWalkIn || true,
        priority: newService.priority || 'medium'
      };

      setProviderData(prev => ({
        ...prev,
        services: [...(prev.services || []), service]
      }));

      setNewService({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        category: '',
        requiresPreparation: false,
        maxAdvanceBooking: 30,
        allowWalkIn: true,
        priority: 'medium'
      });
    }
  };

  const removeService = (serviceId: string) => {
    setProviderData(prev => ({
      ...prev,
      services: prev.services?.filter(s => s.id !== serviceId)
    }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishSetup = () => {
    // Here you would typically save the provider data to your backend
    console.log('Provider setup completed:', providerData);
    alert('Setup completed successfully! Your SlotEase system is now ready to use.');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
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
              {stepNumber < 5 && (
                <div className={`w-16 h-1 mx-2 ${
                  stepNumber < step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Basic Info</span>
          <span>Services</span>
          <span>Schedule</span>
          <span>Settings</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Building className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                value={providerData.name}
                onChange={(e) => handleProviderUpdate('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your organization name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type *
              </label>
              <select
                value={providerData.type}
                onChange={(e) => handleProviderUpdate('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="clinic">Medical Clinic</option>
                <option value="hospital">Hospital</option>
                <option value="bank">Bank</option>
                <option value="government">Government Office</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={providerData.description}
                onChange={(e) => handleProviderUpdate('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your services and what you do"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={providerData.phone}
                  onChange={(e) => handleProviderUpdate('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={providerData.email}
                  onChange={(e) => handleProviderUpdate('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={providerData.address}
                onChange={(e) => handleProviderUpdate('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Services */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          </div>

          {/* Existing Services */}
          {providerData.services && providerData.services.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Services</h3>
              <div className="space-y-4">
                {providerData.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{service.duration} min</span>
                        {service.price && <span>${service.price}</span>}
                        <span className="capitalize">{service.priority} priority</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeService(service.id)}
                      className="text-error-600 hover:text-error-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Service */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., General Consultation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newService.category}
                  onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Primary Care"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe what this service includes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="15"
                  step="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (optional)
                </label>
                <input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={newService.priority}
                  onChange={(e) => setNewService(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Advance Booking (days)
                </label>
                <input
                  type="number"
                  value={newService.maxAdvanceBooking}
                  onChange={(e) => setNewService(prev => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.allowWalkIn}
                  onChange={(e) => setNewService(prev => ({ ...prev, allowWalkIn: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow walk-in appointments</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newService.requiresPreparation}
                  onChange={(e) => setNewService(prev => ({ ...prev, requiresPreparation: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Requires preparation</span>
              </label>
            </div>

            <button
              onClick={addService}
              className="mt-6 px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Add Service
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Working Hours */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Clock className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Working Hours</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(providerData.workingHours || {}).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-900">{day}</span>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => handleWorkingHoursUpdate(day, 'isOpen', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Open</span>
                </label>

                {hours.isOpen && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleWorkingHoursUpdate(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleWorkingHoursUpdate(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Settings */}
      {step === 4 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Configuration Settings</h2>
          </div>

          <div className="space-y-8">
            {/* Booking Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Options</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow online booking</span>
                  <input
                    type="checkbox"
                    checked={providerData.settings?.allowOnlineBooking}
                    onChange={(e) => handleSettingsUpdate('allowOnlineBooking', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow phone booking</span>
                  <input
                    type="checkbox"
                    checked={providerData.settings?.allowPhoneBooking}
                    onChange={(e) => handleSettingsUpdate('allowPhoneBooking', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allow walk-in appointments</span>
                  <input
                    type="checkbox"
                    checked={providerData.settings?.allowWalkIn}
                    onChange={(e) => handleSettingsUpdate('allowWalkIn', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Confirmation Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmation Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-confirm bookings</span>
                  <input
                    type="checkbox"
                    checked={providerData.settings?.autoConfirmBookings}
                    onChange={(e) => handleSettingsUpdate('autoConfirmBookings', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Send appointment reminders</span>
                  <input
                    type="checkbox"
                    checked={providerData.settings?.sendReminders}
                    onChange={(e) => handleSettingsUpdate('sendReminders', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                {providerData.settings?.sendReminders && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder timing (hours before appointment)
                    </label>
                    <input
                      type="number"
                      value={providerData.settings?.reminderTiming}
                      onChange={(e) => handleSettingsUpdate('reminderTiming', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* User Limits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max bookings per user
                  </label>
                  <input
                    type="number"
                    value={providerData.settings?.maxBookingsPerUser}
                    onChange={(e) => handleSettingsUpdate('maxBookingsPerUser', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility</h3>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-700">Enable accessibility support</span>
                  <p className="text-xs text-gray-500">Includes screen reader support, high contrast mode, and keyboard navigation</p>
                </div>
                <input
                  type="checkbox"
                  checked={providerData.settings?.accessibilitySupport}
                  onChange={(e) => handleSettingsUpdate('accessibilitySupport', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <CheckCircle className="h-8 w-8 text-accent-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Review & Complete Setup</h2>
          </div>

          <div className="space-y-8">
            {/* Organization Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{providerData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium capitalize">{providerData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{providerData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{providerData.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{providerData.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Services ({providerData.services?.length || 0})
              </h3>
              <div className="space-y-3">
                {providerData.services?.map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{service.duration} min</p>
                        {service.price && <p className="text-sm font-medium">${service.price}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(providerData.workingHours || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-sm text-gray-600">{day}</span>
                      <span className="text-sm font-medium">
                        {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-accent-50 border border-accent-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-accent-600 mr-3" />
                <div>
                  <h4 className="text-lg font-semibold text-accent-900">Ready to Launch!</h4>
                  <p className="text-sm text-accent-700">
                    Your SlotEase system is configured and ready to accept appointments. 
                    You can always modify these settings later from the admin dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {step < 5 ? (
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={finishSetup}
            className="px-8 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Setup
          </button>
        )}
      </div>
    </div>
  );
};