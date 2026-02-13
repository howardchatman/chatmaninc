import { NextRequest, NextResponse } from 'next/server';

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_CHAT_AGENT_ID = process.env.NEXT_PUBLIC_RETELL_CHAT_AGENT_ID;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback responses when Retell is unavailable
const FALLBACK_RESPONSES: Record<string, string> = {
  approach: "At Tessara Systems, we architect AI systems that transform operational complexity into competitive advantage. Our approach focuses on identifying high-leverage decision points where intelligence creates the most value.",
  industries: "We work across industries where operational complexity creates opportunity: real estate, insurance, healthcare, financial services, and professional services. Each engagement is tailored to the specific decision architecture of your business.",
  project: "Every engagement begins with understanding your operational landscape. We identify where decisions bottleneck, where data sits unused, and where intelligence can create leverage. Would you like to discuss your specific challenge?",
  default: "I can discuss our approach to AI architecture, the industries we serve, or explore how we might help with your specific operational challenges. What interests you most?",
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('approach') || lowerMessage.includes('how') || lowerMessage.includes('method')) {
    return FALLBACK_RESPONSES.approach;
  }
  if (lowerMessage.includes('industr') || lowerMessage.includes('serve') || lowerMessage.includes('work with')) {
    return FALLBACK_RESPONSES.industries;
  }
  if (lowerMessage.includes('project') || lowerMessage.includes('discuss') || lowerMessage.includes('help')) {
    return FALLBACK_RESPONSES.project;
  }

  return FALLBACK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // If Retell is not configured, use fallback responses
    if (!RETELL_API_KEY || !RETELL_CHAT_AGENT_ID) {
      console.log('Retell not configured, using fallback response');
      return NextResponse.json({
        success: true,
        data: {
          response: getFallbackResponse(message),
        },
      });
    }

    // Format conversation history for Retell
    const messages: ChatMessage[] = conversationHistory.map((msg: { sender: string; text: string }) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Retell chat API
    const response = await fetch('https://api.retellai.com/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: RETELL_CHAT_AGENT_ID,
        messages: messages,
        metadata: {
          source: 'tessara-systems-website',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell Chat API error:', errorText);
      // Fall back to local response
      return NextResponse.json({
        success: true,
        data: {
          response: getFallbackResponse(message),
        },
      });
    }

    const data = await response.json();
    const aiResponse = data.response || data.content || data.message;

    if (!aiResponse) {
      return NextResponse.json({
        success: true,
        data: {
          response: getFallbackResponse(message),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
