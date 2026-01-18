import { NextRequest, NextResponse } from 'next/server';

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.NEXT_PUBLIC_RETELL_AGENT_ID;

/**
 * Web Call API Route (Voice)
 *
 * This endpoint is a placeholder for future voice call implementation.
 * When voice is ready, this will:
 * 1. Create a Retell web call
 * 2. Return access_token for WebRTC connection
 * 3. Client uses retell-client-js-sdk to connect
 */
export async function POST(request: NextRequest) {
  try {
    // Voice not yet implemented
    if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
      return NextResponse.json(
        {
          success: false,
          error: 'Voice calling is coming soon. Please use text chat for now.',
          comingSoon: true,
        },
        { status: 501 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: RETELL_AGENT_ID,
        metadata: {
          source: 'chatman-inc-website',
          user_name: body.name || 'Website Visitor',
          user_email: body.email || '',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell Web Call API error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to start voice call' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        call_id: data.call_id,
        access_token: data.access_token,
      },
    });
  } catch (error) {
    console.error('Error creating web call:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start voice call' },
      { status: 500 }
    );
  }
}
