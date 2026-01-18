import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-calendar/callback`;

const supabase = createClient(
  process.env.CHATMAN_SUPABASE_URL || '',
  process.env.CHATMAN_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Google Calendar OAuth error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=calendar_auth_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/settings?error=no_code', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token exchange error:', tokens.error);
      return NextResponse.redirect(
        new URL('/admin/settings?error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      );
    }

    // Get user info to get email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

    // Store tokens securely (in a settings table or encrypted storage)
    // For now, we'll store in environment-like settings
    // In production, use a secure secrets manager or encrypted database field

    // Store in Supabase settings table (create if doesn't exist)
    try {
      await supabase.from('admin_settings').upsert({
        key: 'google_calendar',
        value: {
          connected: true,
          email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
    } catch (dbError) {
      // Table might not exist, log but continue
      console.log('Could not save to database, tokens available in response');
    }

    // Also log the refresh token for manual setup if needed
    console.log('=== GOOGLE CALENDAR CONNECTED ===');
    console.log('Email:', userInfo.email);
    console.log('Refresh Token (save this in GOOGLE_CALENDAR_REFRESH_TOKEN):', tokens.refresh_token);
    console.log('================================');

    return NextResponse.redirect(
      new URL('/admin/settings?success=calendar_connected', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  } catch (error) {
    console.error('Calendar connection error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=connection_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }
}
