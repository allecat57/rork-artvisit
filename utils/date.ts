/**
 * Format a date to a human-readable date format
 * @param date Date object or ISO date string
 * @returns Formatted date string (e.g., "Monday, January 1, 2023")
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, { 
    weekday: "long", 
    month: "long", 
    day: "numeric",
    year: "numeric"
  });
};

/**
 * Format a date to a human-readable time format
 * @param date Date object or ISO date string
 * @returns Formatted time string (e.g., "7:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(undefined, { 
    hour: "numeric", 
    minute: "2-digit"
  });
};

/**
 * Format a date to a short date format
 * @param date Date object or ISO date string
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, { 
    month: "short", 
    day: "numeric",
    year: "numeric"
  });
};

/**
 * Get relative time from now (e.g., "2 days ago", "in 3 hours")
 * @param date Date object or ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? 'tomorrow' : `in ${diffDay} days`;
  } else if (diffDay < 0) {
    return diffDay === -1 ? 'yesterday' : `${Math.abs(diffDay)} days ago`;
  } else if (diffHour > 0) {
    return diffHour === 1 ? 'in 1 hour' : `in ${diffHour} hours`;
  } else if (diffHour < 0) {
    return diffHour === -1 ? '1 hour ago' : `${Math.abs(diffHour)} hours ago`;
  } else if (diffMin > 0) {
    return diffMin === 1 ? 'in 1 minute' : `in ${diffMin} minutes`;
  } else if (diffMin < 0) {
    return diffMin === -1 ? '1 minute ago' : `${Math.abs(diffMin)} minutes ago`;
  } else {
    return 'just now';
  }
};

/**
 * Check if a date is in the past
 * @param date Date object or ISO date string
 * @returns Boolean indicating if the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj < now;
};

/**
 * Check if a date is today
 * @param date Date object or ISO date string
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj.getDate() === now.getDate() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getFullYear() === now.getFullYear();
};