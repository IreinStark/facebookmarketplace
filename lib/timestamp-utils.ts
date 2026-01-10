import { format, formatDistanceToNow } from 'date-fns';

/**
 * Safely formats a timestamp from Firestore or regular Date
 * @param timestamp - Firestore timestamp, Date object, or timestamp number
 * @param formatString - Date-fns format string (default: 'MMM d, h:mm a')
 * @returns Formatted date string or fallback text
 */
export function formatTimestamp(timestamp: any, formatString: string = 'MMM d, h:mm a'): string {
  try {
    if (!timestamp) return 'No date';
    
    let date: Date;
    
    // Handle Firestore Timestamp with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp number or string
    else {
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Invalid date';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting timestamp:', error, timestamp);
    return 'Invalid date';
  }
}

/**
 * Safely formats a timestamp as relative time (e.g., "2 hours ago")
 * @param timestamp - Firestore timestamp, Date object, or timestamp number
 * @param options - formatDistanceToNow options
 * @returns Relative time string or fallback text
 */
export function formatRelativeTime(timestamp: any, options?: { addSuffix?: boolean }): string {
  try {
    if (!timestamp) return 'No date';
    
    let date: Date;
    
    // Handle Firestore Timestamp with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp number or string
    else {
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp for relative time:', timestamp);
      return 'Invalid date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, ...options });
  } catch (error) {
    console.error('Error formatting relative time:', error, timestamp);
    return 'Invalid date';
  }
}

/**
 * Safely converts a timestamp to a Date object
 * @param timestamp - Firestore timestamp, Date object, or timestamp number
 * @returns Date object or null if invalid
 */
export function toDate(timestamp: any): Date | null {
  try {
    if (!timestamp) return null;
    
    let date: Date;
    
    // Handle Firestore Timestamp with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } 
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle timestamp number or string
    else {
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error converting timestamp to Date:', error, timestamp);
    return null;
  }
}
