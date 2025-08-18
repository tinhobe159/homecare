/**
 * Geolocation Utility for EVV System
 * Handles GPS tracking, location validation, and address resolution
 */

// Default geolocation options
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000 // 1 minute
};

/**
 * Get current GPS location
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location data with coordinates and accuracy
 */
export const getCurrentLocation = (options = DEFAULT_OPTIONS) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Watch position for continuous tracking
 * @param {Function} callback - Called with each position update
 * @param {Function} errorCallback - Called on errors
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing the watch
 */
export const watchPosition = (callback, errorCallback, options = DEFAULT_OPTIONS) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      callback({
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        timestamp: new Date().toISOString()
      });
    },
    errorCallback,
    options
  );
};

/**
 * Clear position watch
 * @param {number} watchId - Watch ID from watchPosition
 */
export const clearWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {Object} point1 - {latitude, longitude}
 * @param {Object} point2 - {latitude, longitude}
 * @returns {number} Distance in meters
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Validate if current location is within acceptable range of target address
 * @param {Object} currentLocation - {latitude, longitude}
 * @param {Object} targetLocation - {latitude, longitude}
 * @param {number} maxDistance - Maximum allowed distance in meters (default: 100m)
 * @returns {Object} Validation result
 */
export const validateLocationProximity = (currentLocation, targetLocation, maxDistance = 100) => {
  try {
    const distance = calculateDistance(currentLocation, targetLocation);
    const isValid = distance <= maxDistance;
    
    return {
      isValid,
      distance: Math.round(distance),
      maxDistance,
      message: isValid 
        ? 'Location verified'
        : `Location is ${Math.round(distance)}m away from appointment address. Maximum allowed: ${maxDistance}m`
    };
  } catch (error) {
    return {
      isValid: false,
      distance: null,
      maxDistance,
      message: 'Unable to validate location: ' + error.message
    };
  }
};

/**
 * Reverse geocode coordinates to get address
 * Note: This uses a simplified approach. In production, you'd use Google Maps, OpenStreetMap, or similar
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Address string
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // This is a placeholder for reverse geocoding
    // In production, you would integrate with Google Maps Geocoding API, OpenStreetMap, etc.
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Format location data for EVV record
 * @param {Object} location - Location from getCurrentLocation()
 * @param {string} address - Optional address string
 * @returns {Object} Formatted location object
 */
export const formatLocationForEVV = (location, address = null) => {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    address: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
    timestamp: location.timestamp
  };
};

/**
 * Check if location permissions are granted
 * @returns {Promise<boolean>} Permission status
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    // Fallback for browsers without Permissions API
    return true;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch (error) {
    console.warn('Unable to check location permission:', error);
    return true; // Assume permission granted if we can't check
  }
};

/**
 * Request location permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermission = async () => {
  try {
    await getCurrentLocation();
    return true;
  } catch (error) {
    console.error('Location permission denied:', error);
    return false;
  }
};

// Location accuracy levels for different use cases
/**
 * Format coordinates as a string
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude) => {
  return `${latitude}, ${longitude}`;
};

export const ACCURACY_LEVELS = {
  HIGH: { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
  MEDIUM: { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
  LOW: { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 }
};

// Distance thresholds for different validation scenarios
export const DISTANCE_THRESHOLDS = {
  STRICT: 50,      // 50 meters for high-security environments
  NORMAL: 100,     // 100 meters for standard home care
  RELAXED: 200     // 200 meters for rural areas or GPS-challenging locations
};
