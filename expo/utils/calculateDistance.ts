/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in miles
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Radius of the Earth in miles
  const R = 3958.8;
  
  // Convert latitude and longitude from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Formats a distance in miles to a readable string
 * @param distance Distance in miles
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 0.1) {
    // Convert to feet (1 mile = 5280 feet)
    const feet = Math.round(distance * 5280);
    return `${feet} feet`;
  } else if (distance < 10) {
    // Show one decimal place for distances under 10 miles
    return `${distance.toFixed(1)} miles`;
  } else {
    // Round to nearest mile for larger distances
    return `${Math.round(distance)} miles`;
  }
};