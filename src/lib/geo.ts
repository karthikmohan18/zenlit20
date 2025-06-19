export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Simple wrapper to get the current geolocation of the user
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 20000
      });
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };
  } catch {
    return null;
  }
};

// Calculate distance between two coordinates in kilometers using the Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
