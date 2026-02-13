import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

// Verify Retell webhook signature
function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Parse lead data from Retell's post-call analysis or transcript
function parseLeadData(
  analysis: Record<string, unknown> | null,
  transcript: string
): Record<string, string> | null {
  const leadData: Record<string, string> = {};

  // Priority 1: Use Retell's post-call analysis (most reliable)
  if (analysis) {
    if (analysis.caller_name) leadData.name = String(analysis.caller_name);
    if (analysis.caller_email) leadData.email = String(analysis.caller_email);
    if (analysis.caller_phone) leadData.phone = String(analysis.caller_phone);
    if (analysis.company_name) leadData.company = String(analysis.company_name);
    if (analysis.project_interest) leadData.interest = String(analysis.project_interest);
    if (analysis.budget_range && analysis.budget_range !== 'not discussed') {
      leadData.budget = String(analysis.budget_range);
    }
    if (analysis.timeline && analysis.timeline !== 'not discussed') {
      leadData.timeline = String(analysis.timeline);
    }
    if (analysis.lead_quality) leadData.quality = String(analysis.lead_quality);
    if (analysis.next_steps) leadData.next_steps = String(analysis.next_steps);
    if (analysis.key_notes) leadData.notes = String(analysis.key_notes);
  }

  // Priority 2: Fallback to parsing [LEAD_DATA] blocks from transcript
  if (!leadData.email) {
    const leadDataMatch = transcript.match(/\[LEAD_DATA\]([\s\S]*?)\[\/LEAD_DATA\]/);
    if (leadDataMatch) {
      const leadDataStr = leadDataMatch[1];
      const lines = leadDataStr.split('\n').filter(line => line.trim());
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim().toLowerCase();
          const value = line.slice(colonIndex + 1).trim();
          if (value && value !== 'not provided' && value !== 'not discussed') {
            if (!leadData[key]) leadData[key] = value;
          }
        }
      }
    }
  }

  // Priority 3: Try to extract email from transcript if still missing
  if (!leadData.email) {
    const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    if (emailMatch) leadData.email = emailMatch[0];
  }

  return Object.keys(leadData).length > 0 ? leadData : null;
}

// Determine lead status based on conversation signals
function determineLeadStatus(leadData: Record<string, string>, transcript: string): 'hot' | 'warm' | 'cold' {
  // Priority 1: Use Retell's analysis quality if available
  if (leadData.quality) {
    const quality = leadData.quality.toLowerCase();
    if (quality === 'hot') return 'hot';
    if (quality === 'warm') return 'warm';
    if (quality === 'cold') return 'cold';
  }

  const lowerTranscript = transcript.toLowerCase();

  // Hot signals
  const hotSignals = [
    'schedule a call',
    'book a meeting',
    'ready to start',
    'when can we begin',
    'send me a proposal',
    'what are next steps',
    'budget is',
    'timeline is',
    'let\'s do it',
    'sign me up',
  ];

  if (hotSignals.some(signal => lowerTranscript.includes(signal))) {
    return 'hot';
  }

  // Has budget or timeline = warm at minimum
  if (leadData.budget || leadData.timeline) {
    return 'warm';
  }

  // Has email = warm
  if (leadData.email) {
    return 'warm';
  }

  return 'cold';
}

// Calculate lead score based on data completeness and signals
function calculateLeadScore(leadData: Record<string, string>, transcript: string): number {
  let score = 0;

  // Data completeness
  if (leadData.name) score += 10;
  if (leadData.email) score += 20;
  if (leadData.phone) score += 10;
  if (leadData.company) score += 15;
  if (leadData.interest) score += 15;
  if (leadData.budget) score += 15;
  if (leadData.timeline) score += 15;

  // Conversation signals
  const lowerTranscript = transcript.toLowerCase();
  if (lowerTranscript.includes('schedule') || lowerTranscript.includes('book')) score += 20;
  if (lowerTranscript.includes('budget')) score += 10;
  if (lowerTranscript.includes('timeline') || lowerTranscript.includes('urgent')) score += 10;
  if (lowerTranscript.includes('decision maker') || lowerTranscript.includes('ceo') || lowerTranscript.includes('owner')) score += 15;

  return Math.min(score, 100);
}

// Tessara Systems agent IDs - add your agent IDs here
const CHATMAN_AGENT_IDS = [
  process.env.NEXT_PUBLIC_RETELL_CHAT_AGENT_ID,
  process.env.NEXT_PUBLIC_RETELL_AGENT_ID,
  process.env.CHATMAN_RETELL_AGENT_ID, // Optional: additional agent ID
].filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-retell-signature');

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.RETELL_WEBHOOK_SECRET;
    if (webhookSecret && !verifySignature(payload, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(payload);

    // Check if this call is for a Tessara Systems agent
    const call = data.call || data;
    const agentId = call.agent_id;

    if (agentId && CHATMAN_AGENT_IDS.length > 0 && !CHATMAN_AGENT_IDS.includes(agentId)) {
      // Not a Tessara agent, ignore (let other webhook handle it)
      console.log('Ignoring webhook for non-Tessara agent:', agentId);
      return NextResponse.json({ success: true, message: 'Not a Tessara agent, ignored' });
    }

    // Retell sends different event types
    const eventType = data.event;

    // We mainly care about call_ended or call_analyzed events
    if (eventType !== 'call_ended' && eventType !== 'call_analyzed') {
      return NextResponse.json({ success: true, message: 'Event type ignored' });
    }

    // call is already defined above for agent check
    const callId = call.call_id;
    const transcript = call.transcript || '';
    const callType = call.call_type || 'web_call'; // web_call, phone_call
    const duration = call.duration_ms ? Math.round(call.duration_ms / 1000 / 60) : null;
    const recordingUrl = call.recording_url;

    // Build full transcript from messages if available
    let fullTranscript = transcript;
    if (call.transcript_object && Array.isArray(call.transcript_object)) {
      fullTranscript = call.transcript_object
        .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    // Get post-call analysis if available (from Retell's analysis feature)
    const analysis = call.analysis || call.call_analysis || null;

    // Parse lead data from analysis first, then transcript as fallback
    const leadData = parseLeadData(analysis, fullTranscript);

    if (!leadData || !leadData.email) {
      // No lead data captured, just log the conversation
      console.log('No lead data captured from call:', callId);

      // Still save the conversation for analytics
      await supabase.from('chat_conversations').insert({
        session_id: callId,
        status: 'completed',
        ended_at: new Date().toISOString(),
        metadata: {
          source: 'retell_' + callType,
          duration_minutes: duration,
          recording_url: recordingUrl,
          transcript: fullTranscript,
        },
      });

      return NextResponse.json({ success: true, message: 'Conversation logged, no lead captured' });
    }

    // Determine lead status and score
    const status = determineLeadStatus(leadData, fullTranscript);
    const score = calculateLeadScore(leadData, fullTranscript);

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, score, notes')
      .eq('email', leadData.email)
      .single();

    let leadId: string;

    if (existingLead) {
      // Update existing lead
      const updateData: Record<string, unknown> = {
        status: status === 'hot' ? 'hot' : existingLead.score > score ? undefined : status,
        score: Math.max(existingLead.score || 0, score),
        last_activity_at: new Date().toISOString(),
        metadata: {
          last_retell_call_id: callId,
          last_call_type: callType,
        },
      };

      // Append to notes
      const newNote = `\n\n[${new Date().toISOString()}] Retell ${callType}:\nInterest: ${leadData.interest || 'Not specified'}\nBudget: ${leadData.budget || 'Not discussed'}\nTimeline: ${leadData.timeline || 'Not discussed'}`;
      updateData.notes = (existingLead.notes || '') + newNote;

      // Update other fields if provided
      if (leadData.phone) updateData.phone = leadData.phone;
      if (leadData.company) updateData.company = leadData.company;

      await supabase
        .from('leads')
        .update(updateData)
        .eq('id', existingLead.id);

      leadId = existingLead.id;
      console.log('Updated existing lead:', leadId);
    } else {
      // Create new lead
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          name: leadData.name || 'Unknown',
          email: leadData.email,
          phone: leadData.phone || null,
          company: leadData.company || null,
          status,
          source: callType === 'phone_call' ? 'voice_call' : 'chat_widget',
          interest: leadData.interest || null,
          budget_range: leadData.budget || null,
          timeline: leadData.timeline || null,
          notes: leadData.notes || `Lead captured from Retell ${callType}`,
          score,
          last_activity_at: new Date().toISOString(),
          metadata: {
            retell_call_id: callId,
            call_type: callType,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        throw error;
      }

      leadId = newLead.id;
      console.log('Created new lead:', leadId);
    }

    // Log the interaction
    await supabase.from('interactions').insert({
      lead_id: leadId,
      type: callType === 'phone_call' ? 'voice_call' : 'chat',
      subject: `Retell ${callType === 'phone_call' ? 'Voice' : 'Web'} Conversation`,
      content: fullTranscript,
      duration_minutes: duration,
      outcome: status === 'hot' ? 'qualified' : 'engaged',
      logged_by: 'retell_webhook',
      metadata: {
        call_id: callId,
        recording_url: recordingUrl,
      },
    });

    // Save chat conversation record
    await supabase.from('chat_conversations').insert({
      lead_id: leadId,
      session_id: callId,
      visitor_name: leadData.name,
      visitor_email: leadData.email,
      status: 'completed',
      ended_at: new Date().toISOString(),
      metadata: {
        source: 'retell_' + callType,
        duration_minutes: duration,
        recording_url: recordingUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        leadId,
        status,
        score,
        isNewLead: !existingLead,
      },
    });
  } catch (error) {
    console.error('Retell webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Retell may send GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Retell webhook endpoint active' });
}
