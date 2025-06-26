import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Star, Navigation, Filter, Search, Loader } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { PublicService, ServiceType } from '../types/location';
import { ConnectionService } from '../services/ConnectionService';
import { AIIntegrationService } from '../services/AIIntegrationService';

export const LocationServiceFinder: React.FC = () => {
  const {
    currentPosition,
    permissionStatus,
    timeZoneInfo,
    nearbyServices,
    loading,
    error,
    requestLocation,
    findNearbyServices
  } = useLocation();

  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<Map<string, string>>(new Map());

  const connectionService = ConnectionService.getInstance();
  const aiService = AIIntegrationService.getInstance();

  useEffect(() => {
    if (currentPosition) {
      findNearbyServices(searchRadius, serviceTypeFilter.length > 0 ? serviceTypeFilter : undefined);
    }
  }, [currentPosition, searchRadius, serviceTypeFilter, findNearbyServices]);

  useEffect(() => {
    // Check connection status for all services
    nearbyServices.forEach(async (service) => {
      try {
        const isHealthy = await connectionService.checkServiceHealth(service.id);
        setConnectionStatus(prev => new Map(prev.set(service.id, isHealthy ? 'connected' : 'disconnected')));
      } catch (error) {
        setConnectionStatus(prev => new Map(prev.set(service.id, 'error')));
      }
    });
  }, [nearbyServices]);

  const handleServiceSelect = async (service: PublicService) => {
    setSelectedService(service);
    
    // Register service connection if not already registered
    connectionService.registerService({
      serviceId: service.id,
      endpoint: `https://api.${service.name.toLowerCase().replace(/\s+/g, '')}.com`,
      authMethod: 'oauth2',
      credentials: {
        clientId: 'slotease_client',
        clientSecret: 'secure_secret'
      },
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: {
        requests: 100,
        window: 60
      },
      connectionState: 'pending',
      errorCount: 0
    });

    // Get real-time availability
    try {
      const availability = await connectionService.getAvailability(service.id);
      console.log('Service availability:', availability);
    } catch (error) {
      console.error('Failed to get availability:', error);
    }
  };

  const handleBookService = async (service: PublicService) => {
    try {
      const requestId = await aiService.submitServiceRequest({
        serviceId: service.id,
        userId: 'current_user_id',
        type: 'booking',
        data: {
          serviceType: service.type,
          preferredTime: new Date(),
          duration: 30
        },
        priority: 'medium'
      });

      console.log('Booking request submitted:', requestId);
      alert('Booking request submitted successfully!');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to submit booking request');
    }
  };

  const filteredServices = nearbyServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-accent-600';
      case 'busy': return 'text-warning-600';
      case 'closed': return 'text-error-600';
      case 'limited': return 'text-secondary-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-accent-500';
      case 'disconnected': return 'bg-error-500';
      case 'error': return 'bg-warning-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading && !currentPosition) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-primary-600 mr-3" />
        <span className="text-gray-600">Getting your location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-error-800 mb-2">Location Error</h3>
        <p className="text-error-700 mb-4">{error}</p>
        <button
          onClick={requestLocation}
          className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nearby Services</h2>
          <p className="text-gray-600">
            {currentPosition && timeZoneInfo && (
              <>
                Current location • {timeZoneInfo.timeZone} ({timeZoneInfo.utcOffset})
              </>
            )}
          </p>
        </div>
        <button
          onClick={requestLocation}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Update Location
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              onChange={(e) => {
                const value = e.target.value as ServiceType;
                if (value && !serviceTypeFilter.includes(value)) {
                  setServiceTypeFilter([...serviceTypeFilter, value]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="bank">Bank</option>
              <option value="government">Government</option>
              <option value="immigration">Immigration</option>
              <option value="dmv">DMV</option>
              <option value="post_office">Post Office</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {serviceTypeFilter.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {serviceTypeFilter.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                {type}
                <button
                  onClick={() => setServiceTypeFilter(serviceTypeFilter.filter(t => t !== type))}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{service.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor(connectionStatus.get(service.id) || 'unknown')}`} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{service.address.formatted}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatDistance(service.distance)}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {service.rating.average} ({service.rating.count})
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={getStatusColor(service.availability.status)}>
                      {service.availability.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Wait Time:</span>
                  <span className="font-medium ml-2">{service.availability.estimatedWaitTime}m</span>
                </div>
                <div>
                  <span className="text-gray-600">Queue:</span>
                  <span className="font-medium ml-2">{service.availability.queueLength} people</span>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium ml-2">
                    {service.availability.currentCapacity}/{service.availability.maxCapacity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Next Slot:</span>
                  <span className="font-medium ml-2">
                    {service.availability.nextAvailableSlot 
                      ? new Date(service.availability.nextAvailableSlot).toLocaleTimeString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {service.features.slice(0, 3).map((feature) => (
                  <span
                    key={feature}
                    className="inline-block px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-md"
                  >
                    {feature}
                  </span>
                ))}
                {service.features.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{service.features.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => handleServiceSelect(service)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                View Details
              </button>
              <button
                onClick={() => handleBookService(service)}
                className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
              >
                Book Now
              </button>
              {service.contact.phone && (
                <button
                  onClick={() => window.open(`tel:${service.contact.phone}`)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">
            Try adjusting your search radius or filters to find more services.
          </p>
        </div>
      )}

      {/* Selected Service Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">{selectedService.name}</h3>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {selectedService.address.formatted}</p>
                    {selectedService.contact.phone && (
                      <p><strong>Phone:</strong> {selectedService.contact.phone}</p>
                    )}
                    {selectedService.contact.email && (
                      <p><strong>Email:</strong> {selectedService.contact.email}</p>
                    )}
                    {selectedService.contact.website && (
                      <p><strong>Website:</strong> 
                        <a 
                          href={selectedService.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 ml-1"
                        >
                          {selectedService.contact.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Operating Hours</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedService.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}:</span>
                        <span className={hours.isOpen ? 'text-gray-900' : 'text-error-600'}>
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessibility Features */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Accessibility</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedService.accessibility).map(([feature, available]) => (
                      <div key={feature} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${available ? 'bg-accent-500' : 'bg-gray-300'}`} />
                        <span className={available ? 'text-gray-900' : 'text-gray-500'}>
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleBookService(selectedService)}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};