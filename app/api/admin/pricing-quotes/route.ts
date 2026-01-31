import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: quotes, error } = await supabase
      .from('pricing_quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ quotes: quotes || [] });
  } catch (error) {
    console.error('Error fetching pricing quotes:', error);
    return NextResponse.json({ quotes: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data: quote, error } = await supabase
      .from('pricing_quotes')
      .insert({
        company_name: body.companyName,
        industry: body.industry || null,
        employee_count: body.employeeCount || null,
        recommended_tier: body.recommendedTier,
        monthly_total: body.monthlyTotal,
        setup_fee: body.setupFee,
        annual_total: body.annualTotal,
        pricing_input: body.pricingInput,
        pricing_output: body.pricingOutput,
        created_by: session.user?.email || null,
        lead_id: body.leadId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error saving pricing quote:', error);
    return NextResponse.json({ error: 'Failed to save quote' }, { status: 500 });
  }
}
