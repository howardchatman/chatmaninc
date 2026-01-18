import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-calendar/callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

export async function GET() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google Calendar not configured. Add GOOGLE_CALENDAR_CLIENT_ID to environment.' },
      { status: 500 }
    );
  }

  // Build OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', 'calendar_connect');

  return NextResponse.redirect(authUrl.toString());
}
