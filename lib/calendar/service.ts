import {
  CalendarConfig,
  CalendarAvailability,
  AvailabilitySlot,
  BookingRequest,
  BookingConfirmation,
  DEFAULT_CALENDAR_CONFIG,
} from './types';

/**
 * Calendar Service
 *
 * Handles availability calculation and booking for multiple providers.
 * Currently supports:
 * - Manual mode (generates slots from config, no external calendar)
 * - Google Calendar (requires GOOGLE_CALENDAR_* env vars)
 * - Outlook (requires OUTLOOK_CALENDAR_* env vars)
 */

// Get config from environment or use defaults
export function getCalendarConfig(): CalendarConfig {
  return {
    provider: (process.env.CALENDAR_PROVIDER as CalendarConfig['provider']) || DEFAULT_CALENDAR_CONFIG.provider,
    workingHours: {
      start: parseInt(process.env.CALENDAR_WORK_START || '9'),
      end: parseInt(process.env.CALENDAR_WORK_END || '17'),
    },
    workingDays: process.env.CALENDAR_WORK_DAYS
      ? process.env.CALENDAR_WORK_DAYS.split(',').map(Number)
      : DEFAULT_CALENDAR_CONFIG.workingDays,
    durations: process.env.CALENDAR_DURATIONS
      ? process.env.CALENDAR_DURATIONS.split(',').map(Number)
      : DEFAULT_CALENDAR_CONFIG.durations,
    defaultDuration: parseInt(process.env.CALENDAR_DEFAULT_DURATION || '30'),
    buffer: parseInt(process.env.CALENDAR_BUFFER || '15'),
    maxAdvanceDays: parseInt(process.env.CALENDAR_MAX_ADVANCE_DAYS || '14'),
    minNoticeHours: parseInt(process.env.CALENDAR_MIN_NOTICE_HOURS || '24'),
    timezone: process.env.CALENDAR_TIMEZONE || DEFAULT_CALENDAR_CONFIG.timezone,
  };
}

/**
 * Generate available time slots for a date range
 */
export async function getAvailability(
  startDate: Date,
  endDate: Date,
  duration: number = 30
): Promise<CalendarAvailability> {
  const config = getCalendarConfig();

  // Get busy times from calendar provider
  const busyTimes = await getBusyTimes(startDate, endDate, config);

  // Generate all possible slots
  const slots: AvailabilitySlot[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const now = new Date();
  const minNoticeTime = new Date(now.getTime() + config.minNoticeHours * 60 * 60 * 1000);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();

    // Check if it's a working day
    if (config.workingDays.includes(dayOfWeek)) {
      // Generate slots for this day
      for (let hour = config.workingHours.start; hour < config.workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += duration) {
          // Skip if slot would extend past working hours
          const slotEnd = hour * 60 + minute + duration;
          if (slotEnd > config.workingHours.end * 60) continue;

          const slotStart = new Date(current);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEndTime = new Date(slotStart);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);

          // Check if slot is in the past or within minimum notice
          if (slotStart < minNoticeTime) continue;

          // Check if slot conflicts with busy times
          const isAvailable = !busyTimes.some(
            (busy) => slotStart < busy.end && slotEndTime > busy.start
          );

          slots.push({
            date: formatDate(slotStart),
            time: formatTime24(slotStart),
            displayTime: formatTime12(slotStart),
            duration,
            available: isAvailable,
          });
        }
      }
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return {
    slots: slots.filter((s) => s.available),
    timezone: config.timezone,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get busy times from calendar provider
 */
async function getBusyTimes(
  startDate: Date,
  endDate: Date,
  config: CalendarConfig
): Promise<Array<{ start: Date; end: Date }>> {
  switch (config.provider) {
    case 'google':
      return getGoogleBusyTimes(startDate, endDate);
    case 'outlook':
      return getOutlookBusyTimes(startDate, endDate);
    case 'manual':
    default:
      // Manual mode - no external calendar, all slots available
      return [];
  }
}

/**
 * Google Calendar Integration
 */
async function getGoogleBusyTimes(
  startDate: Date,
  endDate: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Google Calendar not configured, using manual mode');
    return [];
  }

  try {
    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Query freebusy
    const freebusyResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: calendarId }],
        }),
      }
    );

    const freebusyData = await freebusyResponse.json();
    const busySlots = freebusyData.calendars?.[calendarId]?.busy || [];

    return busySlots.map((slot: { start: string; end: string }) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar:', error);
    return [];
  }
}

/**
 * Outlook Calendar Integration
 */
async function getOutlookBusyTimes(
  startDate: Date,
  endDate: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const clientId = process.env.OUTLOOK_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.OUTLOOK_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.OUTLOOK_CALENDAR_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Outlook Calendar not configured, using manual mode');
    return [];
  }

  try {
    // Get access token using refresh token
    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'Calendars.Read',
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Query calendar view
    const calendarResponse = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const calendarData = await calendarResponse.json();
    const events = calendarData.value || [];

    return events
      .filter((event: { showAs: string }) => event.showAs === 'busy' || event.showAs === 'tentative')
      .map((event: { start: { dateTime: string }; end: { dateTime: string } }) => ({
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
      }));
  } catch (error) {
    console.error('Error fetching Outlook Calendar:', error);
    return [];
  }
}

/**
 * Book a time slot
 */
export async function bookSlot(request: BookingRequest): Promise<BookingConfirmation> {
  const config = getCalendarConfig();

  // Validate the slot is still available
  const slotDate = new Date(`${request.date}T${request.time}:00`);
  const slotEnd = new Date(slotDate.getTime() + request.duration * 60 * 1000);

  const availability = await getAvailability(slotDate, slotEnd, request.duration);
  const isAvailable = availability.slots.some(
    (s) => s.date === request.date && s.time === request.time && s.available
  );

  if (!isAvailable) {
    return {
      success: false,
      message: 'This time slot is no longer available. Please select another time.',
    };
  }

  // Create calendar event based on provider
  let calendarEventId: string | undefined;
  let meetingLink: string | undefined;

  try {
    switch (config.provider) {
      case 'google':
        const googleResult = await createGoogleEvent(request, slotDate, slotEnd);
        calendarEventId = googleResult.eventId;
        meetingLink = googleResult.meetingLink;
        break;
      case 'outlook':
        const outlookResult = await createOutlookEvent(request, slotDate, slotEnd);
        calendarEventId = outlookResult.eventId;
        meetingLink = outlookResult.meetingLink;
        break;
      case 'manual':
      default:
        // For manual mode, just generate a booking ID
        // You would typically save this to a database
        break;
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    // Continue - we can still confirm the booking
  }

  const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    bookingId,
    calendarEventId,
    meetingLink,
    message: `Your strategy call is confirmed for ${formatDate(slotDate)} at ${formatTime12(slotDate)}. You'll receive a confirmation email shortly.`,
  };
}

/**
 * Create Google Calendar Event
 */
async function createGoogleEvent(
  request: BookingRequest,
  start: Date,
  end: Date
): Promise<{ eventId?: string; meetingLink?: string }> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!clientId || !clientSecret || !refreshToken) {
    return {};
  }

  // Get access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Create event
  const eventResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `Strategy Call - ${request.name}${request.company ? ` (${request.company})` : ''}`,
        description: `Booked via Tessara Systems website\n\nContact: ${request.email}${request.phone ? `\nPhone: ${request.phone}` : ''}${request.notes ? `\n\nNotes: ${request.notes}` : ''}`,
        start: {
          dateTime: start.toISOString(),
          timeZone: request.timezone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: request.timezone,
        },
        attendees: [{ email: request.email }],
        conferenceData: {
          createRequest: {
            requestId: `tessara-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    }
  );

  const eventData = await eventResponse.json();

  return {
    eventId: eventData.id,
    meetingLink: eventData.hangoutLink,
  };
}

/**
 * Create Outlook Calendar Event
 */
async function createOutlookEvent(
  request: BookingRequest,
  start: Date,
  end: Date
): Promise<{ eventId?: string; meetingLink?: string }> {
  const clientId = process.env.OUTLOOK_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.OUTLOOK_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.OUTLOOK_CALENDAR_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return {};
  }

  // Get access token
  const tokenResponse = await fetch(
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'Calendars.ReadWrite OnlineMeetings.ReadWrite',
      }),
    }
  );

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Create event with Teams meeting
  const eventResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: `Strategy Call - ${request.name}${request.company ? ` (${request.company})` : ''}`,
      body: {
        contentType: 'HTML',
        content: `<p>Booked via Tessara Systems website</p><p>Contact: ${request.email}${request.phone ? `<br>Phone: ${request.phone}` : ''}${request.notes ? `</p><p>Notes: ${request.notes}` : ''}</p>`,
      },
      start: {
        dateTime: start.toISOString(),
        timeZone: request.timezone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: request.timezone,
      },
      attendees: [
        {
          emailAddress: { address: request.email, name: request.name },
          type: 'required',
        },
      ],
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    }),
  });

  const eventData = await eventResponse.json();

  return {
    eventId: eventData.id,
    meetingLink: eventData.onlineMeeting?.joinUrl,
  };
}

// Utility functions
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime24(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function formatTime12(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
