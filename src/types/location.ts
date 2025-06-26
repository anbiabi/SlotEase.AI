export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationPermission {
  state: 'granted' | 'denied' | 'prompt' | 'unknown';
  timestamp: number;
}

export interface TimeZoneInfo {
  timeZone: string;
  offset: number;
  abbreviation: string;
  isDST: boolean;
  utcOffset: string;
}

export interface PublicService {
  id: string;
  name: string;
  type: ServiceType;
  category: ServiceCategory;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    formatted: string;
  };
  coordinates: Coordinates;
  distance: number; // in meters
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
      breaks?: { start: string; end: string }[];
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  availability: ServiceAvailability;
  rating: {
    average: number;
    count: number;
  };
  features: string[];
  accessibility: AccessibilityFeatures;
  lastUpdated: Date;
}

export type ServiceType = 
  | 'hospital' 
  | 'clinic' 
  | 'bank' 
  | 'government' 
  | 'immigration' 
  | 'dmv' 
  | 'courthouse' 
  | 'post_office' 
  | 'library' 
  | 'social_services'
  | 'emergency_services';

export type ServiceCategory = 
  | 'healthcare' 
  | 'financial' 
  | 'government' 
  | 'emergency' 
  | 'education' 
  | 'social';

export interface ServiceAvailability {
  status: 'open' | 'closed' | 'busy' | 'limited' | 'emergency_only';
  currentCapacity: number;
  maxCapacity: number;
  estimatedWaitTime: number; // in minutes
  nextAvailableSlot?: Date;
  queueLength: number;
  lastUpdated: Date;
}

export interface AccessibilityFeatures {
  wheelchairAccessible: boolean;
  hearingAssistance: boolean;
  visualAssistance: boolean;
  signLanguage: boolean;
  elevatorAccess: boolean;
  parkingAvailable: boolean;
  publicTransportAccess: boolean;
}

export interface ConnectionProtocol {
  serviceId: string;
  endpoint: string;
  authMethod: 'oauth2' | 'api_key' | 'jwt' | 'basic';
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    token?: string;
  };
  timeout: number;
  retryAttempts: number;
  rateLimit: {
    requests: number;
    window: number; // in seconds
  };
  lastConnection?: Date;
  connectionState: 'connected' | 'disconnected' | 'error' | 'pending';
  errorCount: number;
}

export interface ConnectionLog {
  id: string;
  serviceId: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error' | 'timeout';
  method: string;
  endpoint: string;
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
  requestData?: any;
  responseData?: any;
}

export interface AIServiceRequest {
  id: string;
  serviceId: string;
  userId: string;
  type: 'booking' | 'availability' | 'status' | 'cancellation' | 'modification';
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: any;
  processingTime?: number;
}

export interface ServiceFeedback {
  id: string;
  serviceId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    waitTime: number;
    serviceQuality: number;
    accessibility: number;
    staff: number;
  };
  timestamp: Date;
  verified: boolean;
}

export interface GeofenceArea {
  id: string;
  name: string;
  center: Coordinates;
  radius: number; // in meters
  type: 'service_area' | 'notification_zone' | 'restricted_area';
  active: boolean;
  triggers: GeofenceTrigger[];
}

export interface GeofenceTrigger {
  event: 'enter' | 'exit' | 'dwell';
  action: 'notify' | 'update_availability' | 'auto_checkin' | 'send_reminder';
  conditions?: {
    timeOfDay?: string;
    dayOfWeek?: string[];
    userType?: string;
  };
}