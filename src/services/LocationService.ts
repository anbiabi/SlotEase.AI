import { Coordinates, LocationPermission, TimeZoneInfo, PublicService, ServiceType } from '../types/location';

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentPosition: Coordinates | null = null;
  private permissionStatus: LocationPermission | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permission and get current position
   */
  public async requestLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };

          this.currentPosition = coords;
          this.updatePermissionStatus('granted');
          resolve(coords);
        },
        (error) => {
          this.handleLocationError(error);
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Start watching position changes
   */
  public startWatching(callback: (position: Coordinates) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };

        this.currentPosition = coords;
        callback(coords);
      },
      (error) => this.handleLocationError(error),
      options
    );
  }

  /**
   * Stop watching position changes
   */
  public stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get current timezone information
   */
  public async getTimeZoneInfo(coordinates?: Coordinates): Promise<TimeZoneInfo> {
    const coords = coordinates || this.currentPosition;
    
    if (!coords) {
      throw new Error('No coordinates available');
    }

    try {
      // Use browser's Intl API for timezone detection
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const offset = now.getTimezoneOffset();
      
      // Get timezone abbreviation
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(now);
      const abbreviation = parts.find(part => part.type === 'timeZoneName')?.value || '';

      // Check if DST is active
      const january = new Date(now.getFullYear(), 0, 1);
      const july = new Date(now.getFullYear(), 6, 1);
      const isDST = Math.max(january.getTimezoneOffset(), july.getTimezoneOffset()) !== now.getTimezoneOffset();

      return {
        timeZone,
        offset: -offset, // Convert to positive offset
        abbreviation,
        isDST,
        utcOffset: this.formatUTCOffset(-offset)
      };
    } catch (error) {
      console.error('Error getting timezone info:', error);
      throw new Error('Failed to get timezone information');
    }
  }

  /**
   * Find nearby public services within specified radius
   */
  public async findNearbyServices(
    coordinates: Coordinates,
    radius: number = 5000, // 5km default
    serviceTypes?: ServiceType[]
  ): Promise<PublicService[]> {
    try {
      // This would typically call a backend API or external service
      // For demo purposes, we'll simulate with mock data
      const mockServices = await this.getMockNearbyServices(coordinates, radius, serviceTypes);
      
      // Calculate distances and sort by proximity
      const servicesWithDistance = mockServices.map(service => ({
        ...service,
        distance: this.calculateDistance(coordinates, service.coordinates)
      })).filter(service => service.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return servicesWithDistance;
    } catch (error) {
      console.error('Error finding nearby services:', error);
      throw new Error('Failed to find nearby services');
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  public calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Check if coordinates are within a geofence
   */
  public isWithinGeofence(
    userCoords: Coordinates,
    centerCoords: Coordinates,
    radius: number
  ): boolean {
    const distance = this.calculateDistance(userCoords, centerCoords);
    return distance <= radius;
  }

  /**
   * Get current position (cached)
   */
  public getCurrentPosition(): Coordinates | null {
    return this.currentPosition;
  }

  /**
   * Get permission status
   */
  public getPermissionStatus(): LocationPermission | null {
    return this.permissionStatus;
  }

  private handleLocationError(error: GeolocationPositionError): void {
    let permissionState: LocationPermission['state'] = 'unknown';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        permissionState = 'denied';
        console.error('Location access denied by user');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location information unavailable');
        break;
      case error.TIMEOUT:
        console.error('Location request timed out');
        break;
      default:
        console.error('Unknown location error:', error.message);
        break;
    }

    this.updatePermissionStatus(permissionState);
  }

  private updatePermissionStatus(state: LocationPermission['state']): void {
    this.permissionStatus = {
      state,
      timestamp: Date.now()
    };
  }

  private formatUTCOffset(offsetMinutes: number): string {
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? '+' : '-';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private async getMockNearbyServices(
    coordinates: Coordinates,
    radius: number,
    serviceTypes?: ServiceType[]
  ): Promise<PublicService[]> {
    // Mock data - in production, this would call external APIs
    const mockServices: PublicService[] = [
      {
        id: 'service-1',
        name: 'City General Hospital',
        type: 'hospital',
        category: 'healthcare',
        address: {
          street: '123 Medical Center Dr',
          city: 'Downtown',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
          formatted: '123 Medical Center Dr, Downtown, CA 90210'
        },
        coordinates: {
          latitude: coordinates.latitude + 0.01,
          longitude: coordinates.longitude + 0.01,
          timestamp: Date.now()
        },
        distance: 0,
        operatingHours: {
          Monday: { open: '00:00', close: '23:59', isOpen: true },
          Tuesday: { open: '00:00', close: '23:59', isOpen: true },
          Wednesday: { open: '00:00', close: '23:59', isOpen: true },
          Thursday: { open: '00:00', close: '23:59', isOpen: true },
          Friday: { open: '00:00', close: '23:59', isOpen: true },
          Saturday: { open: '00:00', close: '23:59', isOpen: true },
          Sunday: { open: '00:00', close: '23:59', isOpen: true }
        },
        contact: {
          phone: '+1-555-HOSPITAL',
          email: 'appointments@cityhospital.com',
          website: 'https://cityhospital.com'
        },
        availability: {
          status: 'open',
          currentCapacity: 45,
          maxCapacity: 100,
          estimatedWaitTime: 25,
          queueLength: 12,
          lastUpdated: new Date()
        },
        rating: {
          average: 4.2,
          count: 1247
        },
        features: ['Emergency Care', 'Specialist Consultations', 'Lab Services', 'Pharmacy'],
        accessibility: {
          wheelchairAccessible: true,
          hearingAssistance: true,
          visualAssistance: false,
          signLanguage: true,
          elevatorAccess: true,
          parkingAvailable: true,
          publicTransportAccess: true
        },
        lastUpdated: new Date()
      },
      {
        id: 'service-2',
        name: 'First National Bank',
        type: 'bank',
        category: 'financial',
        address: {
          street: '456 Finance St',
          city: 'Downtown',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
          formatted: '456 Finance St, Downtown, CA 90210'
        },
        coordinates: {
          latitude: coordinates.latitude - 0.005,
          longitude: coordinates.longitude + 0.008,
          timestamp: Date.now()
        },
        distance: 0,
        operatingHours: {
          Monday: { open: '09:00', close: '17:00', isOpen: true },
          Tuesday: { open: '09:00', close: '17:00', isOpen: true },
          Wednesday: { open: '09:00', close: '17:00', isOpen: true },
          Thursday: { open: '09:00', close: '17:00', isOpen: true },
          Friday: { open: '09:00', close: '18:00', isOpen: true },
          Saturday: { open: '09:00', close: '13:00', isOpen: true },
          Sunday: { open: '00:00', close: '00:00', isOpen: false }
        },
        contact: {
          phone: '+1-555-BANKING',
          email: 'service@firstnational.com',
          website: 'https://firstnational.com'
        },
        availability: {
          status: 'open',
          currentCapacity: 8,
          maxCapacity: 15,
          estimatedWaitTime: 12,
          queueLength: 3,
          lastUpdated: new Date()
        },
        rating: {
          average: 3.8,
          count: 892
        },
        features: ['Personal Banking', 'Business Services', 'Loans', 'Investment Advice'],
        accessibility: {
          wheelchairAccessible: true,
          hearingAssistance: true,
          visualAssistance: true,
          signLanguage: false,
          elevatorAccess: false,
          parkingAvailable: true,
          publicTransportAccess: true
        },
        lastUpdated: new Date()
      },
      {
        id: 'service-3',
        name: 'Immigration Services Office',
        type: 'immigration',
        category: 'government',
        address: {
          street: '789 Government Plaza',
          city: 'Downtown',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
          formatted: '789 Government Plaza, Downtown, CA 90210'
        },
        coordinates: {
          latitude: coordinates.latitude + 0.008,
          longitude: coordinates.longitude - 0.003,
          timestamp: Date.now()
        },
        distance: 0,
        operatingHours: {
          Monday: { open: '08:00', close: '16:30', isOpen: true },
          Tuesday: { open: '08:00', close: '16:30', isOpen: true },
          Wednesday: { open: '08:00', close: '16:30', isOpen: true },
          Thursday: { open: '08:00', close: '16:30', isOpen: true },
          Friday: { open: '08:00', close: '16:30', isOpen: true },
          Saturday: { open: '00:00', close: '00:00', isOpen: false },
          Sunday: { open: '00:00', close: '00:00', isOpen: false }
        },
        contact: {
          phone: '+1-555-IMMIGRATION',
          email: 'appointments@immigration.gov',
          website: 'https://immigration.gov'
        },
        availability: {
          status: 'busy',
          currentCapacity: 28,
          maxCapacity: 30,
          estimatedWaitTime: 45,
          queueLength: 18,
          lastUpdated: new Date()
        },
        rating: {
          average: 3.2,
          count: 567
        },
        features: ['Visa Services', 'Citizenship Applications', 'Document Review', 'Consultations'],
        accessibility: {
          wheelchairAccessible: true,
          hearingAssistance: true,
          visualAssistance: true,
          signLanguage: true,
          elevatorAccess: true,
          parkingAvailable: false,
          publicTransportAccess: true
        },
        lastUpdated: new Date()
      }
    ];

    // Filter by service types if specified
    if (serviceTypes && serviceTypes.length > 0) {
      return mockServices.filter(service => serviceTypes.includes(service.type));
    }

    return mockServices;
  }
}