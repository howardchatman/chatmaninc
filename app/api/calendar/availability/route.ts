import { NextRequest, NextResponse } from 'next/server';
import { getAvailability, getCalendarConfig } from '@/lib/calendar/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const durationParam = searchParams.get('duration');

    const config = getCalendarConfig();
    const days = Math.min(parseInt(daysParam || '7'), config.maxAdvanceDays);
    const duration = parseInt(durationParam || String(config.defaultDuration));

    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const availability = await getAvailability(startDate, endDate, duration);

    // Group slots by date for easier frontend consumption
    const slotsByDate: Record<string, typeof availability.slots> = {};
    for (const slot of availability.slots) {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    }

    return NextResponse.json({
      success: true,
      data: {
        slots: availability.slots,
        slotsByDate,
        timezone: availability.timezone,
        config: {
          workingHours: config.workingHours,
          workingDays: config.workingDays,
          durations: config.durations,
          defaultDuration: config.defaultDuration,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
