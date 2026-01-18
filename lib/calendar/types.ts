/**
 * Calendar Service Types
 *
 * Supports multiple calendar providers:
 * - Google Calendar
 * - Microsoft Outlook/365
 * - Custom/Manual availability
 */

export type CalendarProvider = 'google' | 'outlook' | 'manual';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  displayTime: string; // "9:00 AM"
  duration: number; // minutes
  available: boolean;
}

export interface BookingRequest {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  timezone: string;
}

export interface BookingConfirmation {
  success: boolean;
  bookingId?: string;
  calendarEventId?: string;
  message: string;
  meetingLink?: string;
}

export interface CalendarConfig {
  provider: CalendarProvider;
  // Working hours (in owner's timezone)
  workingHours: {
    start: number; // 9 = 9:00 AM
    end: number; // 17 = 5:00 PM
  };
  // Days available (0 = Sunday, 1 = Monday, etc.)
  workingDays: number[];
  // Meeting duration options in minutes
  durations: number[];
  // Default meeting duration
  defaultDuration: number;
  // Buffer between meetings in minutes
  buffer: number;
  // How far in advance can book (days)
  maxAdvanceDays: number;
  // Minimum notice required (hours)
  minNoticeHours: number;
  // Timezone
  timezone: string;
}

export interface CalendarAvailability {
  slots: AvailabilitySlot[];
  timezone: string;
  generatedAt: string;
}

// Default configuration
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  provider: 'manual',
  workingHours: {
    start: 9,
    end: 17,
  },
  workingDays: [1, 2, 3, 4, 5], // Monday - Friday
  durations: [30, 60],
  defaultDuration: 30,
  buffer: 15,
  maxAdvanceDays: 14,
  minNoticeHours: 24,
  timezone: 'America/New_York',
};
