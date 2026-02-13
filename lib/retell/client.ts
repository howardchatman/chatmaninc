// Retell.ai Integration for AI Chat and Voice Calls
// Server-side utilities for Retell API

const RETELL_API_KEY = process.env.RETELL_API_KEY;

export interface RetellChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RetellChatResponse {
  response: string;
}

export interface RetellWebCallResponse {
  call_id: string;
  access_token: string;
}

/**
 * Send a chat message to Retell AI
 * @param messages - Conversation history in Retell format
 * @param agentId - Retell chat agent ID
 * @returns AI response text
 */
export async function sendChatMessage(
  messages: RetellChatMessage[],
  agentId: string
): Promise<string> {
  if (!RETELL_API_KEY) {
    throw new Error('RETELL_API_KEY not configured');
  }

  const response = await fetch('https://api.retellai.com/v2/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      messages: messages,
      metadata: {
        source: 'tessara-systems-website',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Retell Chat API error:', errorText);
    throw new Error(`Retell chat failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response || data.content || data.message || '';
}

/**
 * Create a web call (browser-based voice call)
 * For future voice implementation
 * @param agentId - Retell voice agent ID
 * @returns Call ID and access token for WebRTC connection
 */
export async function createWebCall(agentId: string): Promise<RetellWebCallResponse> {
  if (!RETELL_API_KEY) {
    throw new Error('RETELL_API_KEY not configured');
  }

  const response = await fetch('https://api.retellai.com/v2/create-web-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      metadata: {
        source: 'tessara-systems-website',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Retell Web Call API error:', errorText);
    throw new Error(`Failed to create web call: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    call_id: data.call_id,
    access_token: data.access_token,
  };
}

/**
 * Get call details (for analytics/webhooks)
 * @param callId - Retell call ID
 */
export async function getCallDetails(callId: string) {
  if (!RETELL_API_KEY) {
    throw new Error('RETELL_API_KEY not configured');
  }

  const response = await fetch(`https://api.retellai.com/v2/get-call/${callId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get call details: ${response.statusText}`);
  }

  return response.json();
}
