import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Update last_activity_at when status changes
    const updateData: Record<string, unknown> = { ...body };
    if (body.status) {
      updateData.last_activity_at = new Date().toISOString();
    }
    if (body.status === 'converted') {
      updateData.converted_at = new Date().toISOString();
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { error } = await supabase.from('leads').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
