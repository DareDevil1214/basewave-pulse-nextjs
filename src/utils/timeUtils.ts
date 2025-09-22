// src/utils/timeUtils.ts

/**
 * Format a date to UTC ISO string
 */
export const formatUTCTime = (date: Date): string => {
  return date.toISOString();
};

/**
 * Parse a UTC string to Date object
 */
export const parseUTCTime = (utcString: string): Date => {
  return new Date(utcString);
};

/**
 * Format a UTC string to local time string
 */
export const formatLocalTime = (utcString: string): string => {
  return new Date(utcString).toLocaleString();
};

/**
 * Create a UTC DateTime string from date and time strings (UTC only)
 * @param date format: YYYY-MM-DD
 * @param time format: HH:MM
 */
export const createUTCDateTime = (date: string, time: string): string => {
  // Treat as UTC time directly
  return `${date}T${time}:00.000Z`;
};

/**
 * Create a UTC DateTime string (UTC only)
 * @param date format: YYYY-MM-DD
 * @param time format: HH:MM
 */
export const createTimezoneAwareUTCDateTime = (date: string, time: string, timezone: string = 'UTC'): string => {
  // Always treat as UTC time
  return `${date}T${time}:00.000Z`;
};

/**
 * Get timezone offset in minutes
 */
const getTimezoneOffset = (timezone: string): number => {
  const timezoneOffsets: { [key: string]: number } = {
    'UTC': 0,
    'Asia/Karachi': 300,       // UTC+5 (PKT)
    'America/New_York': -300,  // UTC-5
    'America/Chicago': -360,   // UTC-6
    'America/Denver': -420,    // UTC-7
    'America/Los_Angeles': -480, // UTC-8
    'Europe/London': 0,        // UTC+0
    'Europe/Paris': 60,        // UTC+1
    'Asia/Tokyo': 540,         // UTC+9
    'Asia/Shanghai': 480,      // UTC+8
    'Australia/Sydney': 600,   // UTC+10
  };
  
  return timezoneOffsets[timezone] || 0;
};

/**
 * Validate if a date and time is valid and in the future (UTC only)
 */
export const validateDateTime = (date: string, time: string, timezone: string = 'UTC'): { isValid: boolean; error?: string } => {
  try {
    const dateTime = createTimezoneAwareUTCDateTime(date, time, 'UTC');
    const parsed = new Date(dateTime);
    
    if (isNaN(parsed.getTime())) {
      return { isValid: false, error: 'Invalid date or time format' };
    }
    
    const now = new Date();
    if (parsed <= now) {
      return { isValid: false, error: 'Please select a future date and time' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Failed to validate date and time' };
  }
};

/**
 * Get current UTC time
 */
export const getCurrentTimeInTimezone = (timezone: string = 'UTC'): Date => {
  // Always return current UTC time
  return new Date();
};

/**
 * Get current UTC time as formatted string
 */
export const getCurrentUTCTimeString = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get current UTC time as formatted string with seconds
 */
export const getCurrentUTCTimeStringWithSeconds = (): string => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Get UTC timezone option only
 */
export const getTimezoneOptions = (): Array<{ value: string; label: string; offset: string }> => {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  ];
};

/**
 * Format a date for display (UTC ONLY)
 */
export const formatDisplayDate = (timestamp: string | Date | null): string => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // Force UTC display
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Convert a date to a cron expression for one-time schedules (UTC ONLY)
 */
export const dateToOnTimeCron = (date: Date): string => {
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const dayOfWeek = '*';
  
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
};

/**
 * Convert a date to a cron expression based on frequency (UTC ONLY)
 */
export const dateToCronExpression = (
  date: Date, 
  frequency: 'once' | 'daily' | 'weekly' | 'monthly',
  dayOfWeek?: number,
  dayOfMonth?: number
): string => {
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  
  switch (frequency) {
    case 'once':
      return dateToOnTimeCron(date);
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      const weekDay = dayOfWeek !== undefined ? dayOfWeek : date.getUTCDay();
      return `${minute} ${hour} * * ${weekDay}`;
    case 'monthly':
      const monthDay = dayOfMonth !== undefined ? dayOfMonth : date.getUTCDate();
      return `${minute} ${hour} ${monthDay} * *`;
    default:
      return dateToOnTimeCron(date);
  }
};
