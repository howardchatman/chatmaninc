'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  totalContacts: number;
  totalRevenue: number;
  pendingInvoices: number;
  upcomingMeetings: number;
}

interface RecentLead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'hot' | 'warm' | 'cold';
  source: string;
  created_at: string;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  guest_name: string;
  guest_email: string;
  start_time: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    totalContacts: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    upcomingMeetings: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentLeads(data.recentLeads);
        setUpcomingMeetings(data.upcomingMeetings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={stats.totalLeads}
          icon={<UsersIcon />}
          color="gold"
        />
        <StatCard
          label="Hot Leads"
          value={stats.hotLeads}
          icon={<FireIcon />}
          color="red"
        />
        <StatCard
          label="Warm Leads"
          value={stats.warmLeads}
          icon={<SunIcon />}
          color="orange"
        />
        <StatCard
          label="Cold Leads"
          value={stats.coldLeads}
          icon={<SnowflakeIcon />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Contacts"
          value={stats.totalContacts}
          icon={<ContactIcon />}
          color="purple"
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarIcon />}
          color="green"
        />
        <StatCard
          label="Pending Invoices"
          value={stats.pendingInvoices}
          icon={<InvoiceIcon />}
          color="yellow"
        />
        <StatCard
          label="Upcoming Meetings"
          value={stats.upcomingMeetings}
          icon={<CalendarIcon />}
          color="cyan"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-dark border border-gray-dark/30 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-dark/30 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
            <a href="/admin/leads" className="text-sm text-gold hover:text-gold-light transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-gray-dark/30">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{lead.name}</p>
                    <p className="text-sm text-gray-muted">
                      {lead.company || lead.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${statusColors[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                    <span className="text-xs text-gray-muted">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-muted">
                No leads yet. They will appear here when visitors submit the form or chat.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-dark border border-gray-dark/30 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-dark/30 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
            <a href="/admin/calendar" className="text-sm text-gold hover:text-gold-light transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-gray-dark/30">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{meeting.title}</p>
                    <p className="text-sm text-gray-muted">{meeting.guest_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">
                      {new Date(meeting.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-muted">
                      {new Date(meeting.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-muted">
                No upcoming meetings. Connect your calendar in Settings.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/leads/new"
            className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
          >
            + Add Lead
          </a>
          <a
            href="/admin/contacts/new"
            className="px-4 py-2 bg-dark-light text-white border border-gray-dark/30 rounded-lg hover:border-gold/50 transition-colors"
          >
            + Add Contact
          </a>
          <a
            href="/admin/invoices/new"
            className="px-4 py-2 bg-dark-light text-white border border-gray-dark/30 rounded-lg hover:border-gold/50 transition-colors"
          >
            + Create Invoice
          </a>
          <a
            href="/admin/settings"
            className="px-4 py-2 bg-dark-light text-white border border-gray-dark/30 rounded-lg hover:border-gold/50 transition-colors"
          >
            ⚙ Settings
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    gold: 'bg-gold/10 text-gold',
    red: 'bg-red-500/10 text-red-400',
    orange: 'bg-orange-500/10 text-orange-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-green-500/10 text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <div className="bg-dark border border-gray-dark/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-muted">{label}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Icons
function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function SnowflakeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18M3 12l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
