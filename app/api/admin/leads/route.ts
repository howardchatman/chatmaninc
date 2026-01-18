import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data: leads, error } = await query;

    if (error) throw error;

    return NextResponse.json({ leads: leads || [] });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ leads: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        status: body.status || 'warm',
        source: body.source || 'manual',
        interest: body.interest || null,
        notes: body.notes || null,
        score: 50, // Default score
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
