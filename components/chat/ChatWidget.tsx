'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  options?: string[];
}

interface ChatWidgetProps {
  onOpenLeadModal: () => void;
  schedulingUrl?: string;
}

// Default scheduling URL (can be overridden with Calendly, Cal.com, etc.)
const DEFAULT_SCHEDULING_URL = '#contact';

// High-intent phrases that trigger the lead CTA
const HIGH_INTENT_PHRASES = [
  'pricing', 'cost', 'price', 'quote', 'budget',
  'build', 'develop', 'create', 'implement',
  'project', 'engagement', 'scope', 'proposal',
  'timeline', 'deadline', 'when can', 'how long',
  'ready to start', "let's discuss", 'talk to someone',
  'get started', 'next steps', 'move forward',
];

// Architecture-first initial message
const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    text: "I'm the Chatman AI assistant. I can discuss AI architecture, operational systems, and how we approach complex business challenges. How can I help?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    options: [
      'Tell me about your approach',
      'What industries do you serve?',
      'Schedule a strategy call',
    ],
  },
];

// Fallback responses for common topics
const fallbackResponses: Record<string, { text: string; options?: string[] }> = {
  approach: {
    text: "At Chatman Inc, we architect AI systems that transform operational complexity into competitive advantage. Our approach focuses on identifying high-leverage decision points where intelligence creates the most value. We don't just implement AI—we redesign how decisions flow through your organization.",
    options: ['What industries do you serve?', 'Schedule a strategy call', 'I have a challenge to discuss'],
  },
  industries: {
    text: "We work across industries where operational complexity creates opportunity: real estate, insurance, healthcare, financial services, and professional services. Each engagement is tailored to the specific decision architecture of your business.",
    options: ['Tell me about your approach', 'Schedule a strategy call', 'Discuss my industry'],
  },
  project: {
    text: "Every engagement begins with understanding your operational landscape. We identify where decisions bottleneck, where data sits unused, and where intelligence can create leverage. What challenge are you looking to solve?",
    options: ['Operational efficiency', 'Customer experience', 'Schedule a strategy call'],
  },
  default: {
    text: "I can discuss our approach to AI architecture, the industries we serve, or explore how we might help with your specific operational challenges. What interests you most?",
    options: ['Tell me about your approach', 'What industries do you serve?', 'Schedule a strategy call'],
  },
};

export default function ChatWidget({ onOpenLeadModal, schedulingUrl }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadCTA, setShowLeadCTA] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const calendarUrl = schedulingUrl || DEFAULT_SCHEDULING_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkForHighIntent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return HIGH_INTENT_PHRASES.some(phrase => lowerText.includes(phrase));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Check for high-intent phrases
    if (checkForHighIntent(text)) {
      setShowLeadCTA(true);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-10).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.response) {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: 'ai',
          text: data.data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
    } catch (error) {
      console.error('Chat error:', error);
    }

    // Fallback response
    const lowerText = text.toLowerCase();
    let response = fallbackResponses.default;

    if (lowerText.includes('approach') || lowerText.includes('how') || lowerText.includes('method')) {
      response = fallbackResponses.approach;
    } else if (lowerText.includes('industr') || lowerText.includes('serve') || lowerText.includes('work with')) {
      response = fallbackResponses.industries;
    } else if (lowerText.includes('project') || lowerText.includes('discuss') || lowerText.includes('challenge')) {
      response = fallbackResponses.project;
    }

    const aiMessage: Message = {
      id: messages.length + 2,
      sender: 'ai',
      text: response.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: response.options,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleOptionClick = (option: string) => {
    // Check if it's a scheduling request
    if (option.toLowerCase().includes('schedule')) {
      setShowScheduler(true);
      const scheduleMessage: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: option,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, scheduleMessage]);

      // AI response for scheduling
      setTimeout(() => {
        const aiMessage: Message = {
          id: messages.length + 2,
          sender: 'ai',
          text: "I'd be happy to help you schedule a strategy call. You can book a time directly below, or continue chatting if you have questions first.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);
      return;
    }
    handleSendMessage(option);
  };

  const handleLeadCTAClick = () => {
    setShowLeadCTA(false);
    onOpenLeadModal();
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 ${
          isOpen
            ? 'bg-dark-light border-2 border-gray-dark'
            : 'bg-dark border-2 border-gold'
        }`}
      >
        {isOpen ? (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Pulse effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-25" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-dark rounded-2xl shadow-2xl overflow-hidden border border-gray-dark/50 flex flex-col animate-slide-up" style={{ height: '550px' }}>
          {/* Header */}
          <div className="bg-dark border-b border-gold/30 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white">Chatman AI</h4>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                  <span className="text-xs text-gray-muted">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Schedule button */}
              <button
                onClick={() => setShowScheduler(!showScheduler)}
                title="Schedule a call"
                className={`p-2 hover:bg-gold/10 rounded-lg transition-colors ${showScheduler ? 'bg-gold/10' : ''}`}
              >
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {/* Voice button placeholder */}
              <button
                title="Voice call (coming soon)"
                className="p-2 hover:bg-gold/10 rounded-lg transition-colors opacity-50 cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              {/* Minimize button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lead Intent CTA */}
          {showLeadCTA && (
            <div className="bg-gold/10 border-b border-gold/30 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gold">Ready to discuss your project?</span>
              <button
                onClick={handleLeadCTAClick}
                className="px-3 py-1.5 bg-gold text-dark text-sm font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Request Architecture Review
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center mr-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] ${
                      message.sender === 'user'
                        ? 'bg-gold text-dark rounded-2xl rounded-tr-sm'
                        : 'bg-dark-light text-white rounded-2xl rounded-tl-sm border border-gray-dark/50'
                    } px-4 py-3`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-dark/60' : 'text-gray-muted'}`}>
                      {message.time}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-dark flex items-center justify-center ml-2 flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Quick Reply Options */}
                {message.sender === 'ai' && message.options && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-10">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="px-3 py-1.5 bg-transparent border border-gold/50 text-gold text-sm rounded-full hover:bg-gold/10 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-dark-light rounded-2xl rounded-tl-sm border border-gray-dark/50 px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Inline Scheduler */}
          {showScheduler && (
            <InlineScheduler
              calendarUrl={calendarUrl}
              onClose={() => setShowScheduler(false)}
              onOpenLeadModal={onOpenLeadModal}
              onBookingComplete={(message) => {
                setShowScheduler(false);
                const bookingMessage: Message = {
                  id: messages.length + 1,
                  sender: 'ai',
                  text: message,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, bookingMessage]);
              }}
            />
          )}

          {/* Input */}
          <div className="p-4 bg-dark border-t border-gray-dark/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-dark-light border border-gray-dark/50 rounded-xl text-sm text-white placeholder-gray-muted focus:outline-none focus:border-gold transition-colors"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className="p-3 bg-gold text-dark rounded-xl hover:bg-gold-light transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-muted mt-2 text-center">
              Powered by Chatman AI
            </p>
          </div>
        </div>
      )}

      {/* Minimized Chat */}
      {isOpen && isMinimized && (
        <div
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-28 right-6 z-50 bg-dark rounded-2xl shadow-xl p-4 cursor-pointer hover:shadow-2xl transition-all border border-gold/30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-white">Chatman AI</h4>
              <p className="text-xs text-gray-muted">Click to expand</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Inline Scheduler Component
interface AvailabilitySlot {
  date: string;
  time: string;
  displayTime: string;
  duration: number;
  available: boolean;
}

interface InlineSchedulerProps {
  calendarUrl: string;
  onClose: () => void;
  onOpenLeadModal: () => void;
  onBookingComplete: (message: string) => void;
}

function InlineScheduler({ calendarUrl, onClose, onOpenLeadModal, onBookingComplete }: InlineSchedulerProps) {
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'loading'>('date');
  const [availability, setAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/calendar/availability?days=14');
      if (response.ok) {
        const data = await response.json();
        setAvailability(data.data?.slotsByDate || {});
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot || !bookingForm.name || !bookingForm.email) {
      setError('Please fill in your name and email');
      return;
    }

    setStep('loading');
    setError('');

    try {
      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedSlot.date,
          time: selectedSlot.time,
          duration: selectedSlot.duration,
          ...bookingForm,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onBookingComplete(data.data.message);
      } else {
        setError(data.error || 'Failed to book. Please try again.');
        setStep('details');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStep('details');
    }
  };

  const dates = Object.keys(availability).slice(0, 7);

  // If external calendar URL is set, use that
  if (calendarUrl && calendarUrl !== '#contact') {
    return (
      <div className="border-t border-gold/30 bg-dark-light p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book a Strategy Call
          </h5>
          <button onClick={onClose} className="text-gray-muted hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-3 bg-gold text-dark text-sm font-medium rounded-lg text-center hover:bg-gold-light transition-colors"
        >
          Open Calendar →
        </a>
      </div>
    );
  }

  return (
    <div className="border-t border-gold/30 bg-dark-light p-4 max-h-72 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-white flex items-center gap-2">
          <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {step === 'date' && 'Select a Date'}
          {step === 'time' && 'Select a Time'}
          {step === 'details' && 'Your Details'}
          {step === 'loading' && 'Booking...'}
        </h5>
        <button onClick={onClose} className="text-gray-muted hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : step === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full mb-2" />
          <p className="text-sm text-gray-muted">Confirming your booking...</p>
        </div>
      ) : step === 'date' ? (
        <div className="space-y-2">
          {dates.length > 0 ? (
            dates.map((date) => {
              const d = new Date(date + 'T12:00:00');
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const slotsCount = availability[date]?.length || 0;

              return (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setStep('time');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-dark border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gold font-medium">{dayName}</span>
                    <span className="text-white">{monthDay}</span>
                  </div>
                  <span className="text-xs text-gray-muted">{slotsCount} slots</span>
                </button>
              );
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-muted text-sm mb-3">No availability this week</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenLeadModal();
                }}
                className="px-4 py-2 bg-gold text-dark text-sm font-medium rounded-lg hover:bg-gold-light transition-colors"
              >
                Request a Call Back
              </button>
            </div>
          )}
        </div>
      ) : step === 'time' ? (
        <div className="space-y-2">
          <button
            onClick={() => setStep('date')}
            className="text-xs text-gold hover:text-gold-light transition-colors mb-2"
          >
            ← Back to dates
          </button>
          <div className="grid grid-cols-3 gap-2">
            {availability[selectedDate]?.map((slot) => (
              <button
                key={`${slot.date}-${slot.time}`}
                onClick={() => {
                  setSelectedSlot(slot);
                  setStep('details');
                }}
                className="px-2 py-2 bg-dark border border-gold/30 text-gold text-xs rounded-lg hover:bg-gold/10 transition-colors"
              >
                {slot.displayTime}
              </button>
            ))}
          </div>
        </div>
      ) : step === 'details' ? (
        <div className="space-y-3">
          <button
            onClick={() => setStep('time')}
            className="text-xs text-gold hover:text-gold-light transition-colors"
          >
            ← Back to times
          </button>

          {selectedSlot && (
            <p className="text-xs text-gray-muted">
              {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot.displayTime}
            </p>
          )}

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <input
            type="text"
            placeholder="Your name *"
            value={bookingForm.name}
            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
            className="w-full px-3 py-2 bg-dark border border-gold/30 rounded-lg text-white text-sm placeholder-gray-muted focus:border-gold focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your email *"
            value={bookingForm.email}
            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
            className="w-full px-3 py-2 bg-dark border border-gold/30 rounded-lg text-white text-sm placeholder-gray-muted focus:border-gold focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={bookingForm.phone}
            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
            className="w-full px-3 py-2 bg-dark border border-gold/30 rounded-lg text-white text-sm placeholder-gray-muted focus:border-gold focus:outline-none"
          />
          <button
            onClick={handleBooking}
            className="w-full px-4 py-2.5 bg-gold text-dark text-sm font-medium rounded-lg hover:bg-gold-light transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      ) : null}
    </div>
  );
}
