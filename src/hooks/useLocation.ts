import { useState, useEffect, useCallback } from 'react';
import { Coordinates, LocationPermission, TimeZoneInfo, PublicService, ServiceType } from '../types/location';
import { LocationService } from '../services/LocationService';

export const useLocation = () => {
  const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermission | null>(null);
  const [timeZoneInfo, setTimeZoneInfo] = useState<TimeZoneInfo | null>(null);
  const [nearbyServices, setNearbyServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationService = LocationService.getInstance();

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await locationService.requestLocation();
      setCurrentPosition(position);
      
      // Get timezone info
      const timezone = await locationService.getTimeZoneInfo(position);
      setTimeZoneInfo(timezone);
      
      // Update permission status
      const permission = locationService.getPermissionStatus();
      setPermissionStatus(permission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [locationService]);

  const findNearbyServices = useCallback(async (
    radius: number = 5000,
    serviceTypes?: ServiceType[]
  ) => {
    if (!currentPosition) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const services = await locationService.findNearbyServices(
        currentPosition,
        radius,
        serviceTypes
      );
      setNearbyServices(services);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find nearby services');
    } finally {
      setLoading(false);
    }
  }, [currentPosition, locationService]);

  const startWatching = useCallback(() => {
    locationService.startWatching((position) => {
      setCurrentPosition(position);
    });
  }, [locationService]);

  const stopWatching = useCallback(() => {
    locationService.stopWatching();
  }, [locationService]);

  const calculateDistance = useCallback((
    coord1: Coordinates,
    coord2: Coordinates
  ): number => {
    return locationService.calculateDistance(coord1, coord2);
  }, [locationService]);

  const isWithinGeofence = useCallback((
    centerCoords: Coordinates,
    radius: number
  ): boolean => {
    if (!currentPosition) return false;
    return locationService.isWithinGeofence(currentPosition, centerCoords, radius);
  }, [currentPosition, locationService]);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    currentPosition,
    permissionStatus,
    timeZoneInfo,
    nearbyServices,
    loading,
    error,
    requestLocation,
    findNearbyServices,
    startWatching,
    stopWatching,
    calculateDistance,
    isWithinGeofence
  };
};