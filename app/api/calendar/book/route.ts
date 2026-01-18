import { NextRequest, NextResponse } from 'next/server';
import { bookSlot } from '@/lib/calendar/service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { date, time, duration, name, email, phone, company, notes, timezone } = body;

    if (!date || !time || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: date, time, name, email' },
        { status: 400 }
      );
    }

    // Book the slot
    const result = await bookSlot({
      date,
      time,
      duration: duration || 30,
      name,
      email,
      phone,
      company,
      notes,
      timezone: timezone || 'America/New_York',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Create a lead from the booking
    try {
      const startTime = new Date(`${date}T${time}:00`);
      const endTime = new Date(startTime.getTime() + (duration || 30) * 60 * 1000);

      // Create calendar booking record
      await supabase.from('calendar_bookings').insert({
        title: 'Strategy Call',
        guest_name: name,
        guest_email: email,
        guest_phone: phone || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        timezone: timezone || 'America/New_York',
        status: 'confirmed',
        google_event_id: result.calendarEventId || null,
        meeting_link: result.meetingLink || null,
        metadata: { company, notes, booking_id: result.bookingId },
      });

      // Create or update lead
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .single();

      if (existingLead) {
        // Update existing lead
        await supabase.from('leads').update({
          status: 'hot',
          last_activity_at: new Date().toISOString(),
          notes: notes ? `${notes}\n\nBooked strategy call for ${date} at ${time}` : `Booked strategy call for ${date} at ${time}`,
        }).eq('id', existingLead.id);
      } else {
        // Create new lead
        await supabase.from('leads').insert({
          name,
          email,
          phone: phone || null,
          company: company || null,
          status: 'hot',
          source: 'chat_widget',
          interest: 'Strategy Call',
          notes: notes || `Booked strategy call for ${date} at ${time}`,
          score: 80,
        });
      }

      // Log interaction
      const leadId = existingLead?.id;
      if (leadId) {
        await supabase.from('interactions').insert({
          lead_id: leadId,
          type: 'meeting',
          subject: 'Strategy Call Booked',
          content: `Scheduled for ${date} at ${time}. ${notes || ''}`,
          outcome: 'booked',
          logged_by: 'system',
        });
      }
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue - booking was successful even if DB save failed
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.bookingId,
        meetingLink: result.meetingLink,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to book slot' },
      { status: 500 }
    );
  }
}
