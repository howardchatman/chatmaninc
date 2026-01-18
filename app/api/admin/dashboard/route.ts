import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get lead stats
    const { data: leads } = await supabase.from('leads').select('status');

    const leadStats = {
      totalLeads: leads?.length || 0,
      hotLeads: leads?.filter((l) => l.status === 'hot').length || 0,
      warmLeads: leads?.filter((l) => l.status === 'warm').length || 0,
      coldLeads: leads?.filter((l) => l.status === 'cold').length || 0,
    };

    // Get contact count
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Get revenue from paid invoices
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid');

    const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

    // Get pending invoices count
    const { count: pendingInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get upcoming meetings count
    const { count: upcomingMeetings } = await supabase
      .from('calendar_bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', new Date().toISOString())
      .eq('status', 'confirmed');

    // Get recent leads
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('id, name, email, company, status, source, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get upcoming meetings
    const { data: upcomingMeetingsList } = await supabase
      .from('calendar_bookings')
      .select('id, title, guest_name, guest_email, start_time')
      .gte('start_time', new Date().toISOString())
      .eq('status', 'confirmed')
      .order('start_time', { ascending: true })
      .limit(5);

    return NextResponse.json({
      stats: {
        ...leadStats,
        totalContacts: totalContacts || 0,
        totalRevenue,
        pendingInvoices: pendingInvoices || 0,
        upcomingMeetings: upcomingMeetings || 0,
      },
      recentLeads: recentLeads || [],
      upcomingMeetings: upcomingMeetingsList || [],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    // Return empty data if tables don't exist yet
    return NextResponse.json({
      stats: {
        totalLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        totalContacts: 0,
        totalRevenue: 0,
        pendingInvoices: 0,
        upcomingMeetings: 0,
      },
      recentLeads: [],
      upcomingMeetings: [],
    });
  }
}
