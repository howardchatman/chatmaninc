'use client';

import { useEffect, useState } from 'react';

interface CalendarSettings {
  provider: string;
  connected: boolean;
  email?: string;
  workingHours: { start: number; end: number };
  workingDays: number[];
  timezone: string;
}

interface StripeSettings {
  connected: boolean;
  accountId?: string;
}

export default function SettingsPage() {
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
    provider: 'manual',
    connected: false,
    workingHours: { start: 9, end: 17 },
    workingDays: [1, 2, 3, 4, 5],
    timezone: 'America/New_York',
  });
  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    connected: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.calendar) setCalendarSettings(data.calendar);
        if (data.stripe) setStripeSettings(data.stripe);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google-calendar';
  };

  const disconnectCalendar = async () => {
    try {
      await fetch('/api/admin/settings/calendar/disconnect', { method: 'POST' });
      setCalendarSettings({ ...calendarSettings, connected: false, email: undefined });
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  };

  const saveCalendarSettings = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings/calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingHours: calendarSettings.workingHours,
          workingDays: calendarSettings.workingDays,
          timezone: calendarSettings.timezone,
        }),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-gray-muted mt-1">
          Configure your calendar, payments, and integrations
        </p>
      </div>

      {/* Google Calendar Integration */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Google Calendar</h3>
              <p className="text-sm text-gray-muted">
                Connect your calendar to show real-time availability
              </p>
            </div>
          </div>
          {calendarSettings.connected ? (
            <button
              onClick={disconnectCalendar}
              className="px-4 py-2 bg-dark-light text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectGoogleCalendar}
              className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Connect
            </button>
          )}
        </div>

        {calendarSettings.connected && calendarSettings.email && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Connected to {calendarSettings.email}</span>
            </div>
          </div>
        )}

        {/* Working Hours */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Availability Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-muted mb-1">Start Time</label>
              <select
                value={calendarSettings.workingHours.start}
                onChange={(e) =>
                  setCalendarSettings({
                    ...calendarSettings,
                    workingHours: { ...calendarSettings.workingHours, start: parseInt(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-muted mb-1">End Time</label>
              <select
                value={calendarSettings.workingHours.end}
                onChange={(e) =>
                  setCalendarSettings({
                    ...calendarSettings,
                    workingHours: { ...calendarSettings.workingHours, end: parseInt(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-muted mb-2">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newDays = calendarSettings.workingDays.includes(index)
                      ? calendarSettings.workingDays.filter((d) => d !== index)
                      : [...calendarSettings.workingDays, index].sort();
                    setCalendarSettings({ ...calendarSettings, workingDays: newDays });
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    calendarSettings.workingDays.includes(index)
                      ? 'bg-gold text-dark border-gold'
                      : 'bg-dark-light text-gray-muted border-gray-dark/30 hover:border-gold/50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-muted mb-1">Timezone</label>
            <select
              value={calendarSettings.timezone}
              onChange={(e) => setCalendarSettings({ ...calendarSettings, timezone: e.target.value })}
              className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Phoenix">Arizona (MST)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <button
            onClick={saveCalendarSettings}
            disabled={saving}
            className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Stripe Integration */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Stripe Payments</h3>
              <p className="text-sm text-gray-muted">
                Accept payments and send invoices
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {stripeSettings.connected ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm">
                Add API keys in .env
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-dark-light rounded-lg">
          <p className="text-sm text-gray-muted">
            To enable Stripe payments, add your API keys to your environment variables:
          </p>
          <pre className="mt-2 p-3 bg-dark rounded text-xs text-gray-muted overflow-x-auto">
{`STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
          </pre>
        </div>
      </div>

      {/* Retell AI */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Retell AI Chat</h3>
              <p className="text-sm text-gray-muted">
                AI-powered chat widget for visitor engagement
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
            Active
          </span>
        </div>
      </div>

      {/* Admin User */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Admin Access</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-light rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <span className="text-gold font-medium">H</span>
              </div>
              <div>
                <p className="text-white font-medium">Howard Chatman</p>
                <p className="text-sm text-gray-muted">howard@chatmaninc.com</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
