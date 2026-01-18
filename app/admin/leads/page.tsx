'use client';

import { useEffect, useState } from 'react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: 'hot' | 'warm' | 'cold' | 'converted' | 'lost';
  source: string;
  interest: string | null;
  notes: string | null;
  score: number;
  created_at: string;
  last_activity_at: string | null;
}

type StatusFilter = 'all' | 'hot' | 'warm' | 'cold' | 'converted' | 'lost';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/leads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const statusColors: Record<Lead['status'], string> = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    converted: 'bg-green-500/20 text-green-400 border-green-500/30',
    lost: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const sourceLabels: Record<string, string> = {
    website_form: 'Website Form',
    chat_widget: 'Chat Widget',
    voice_call: 'Voice Call',
    referral: 'Referral',
    manual: 'Manual Entry',
  };

  const filteredLeads = leads.filter((lead) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="text-gray-muted mt-1">
            Manage and track your leads pipeline
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
        >
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'hot', 'warm', 'cold', 'converted', 'lost'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-gold text-dark'
                  : 'bg-dark-light text-gray-muted hover:text-white border border-gray-dark/30'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-dark border border-gray-dark/30 rounded-lg text-white placeholder-gray-muted focus:border-gold focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-light border-b border-gray-dark/30">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Source
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-dark/30">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-dark-light/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-muted">{lead.email}</p>
                        {lead.company && (
                          <p className="text-sm text-gray-muted">{lead.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full border ${statusColors[lead.status]}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-muted">
                      {sourceLabels[lead.source] || lead.source}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-dark-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full"
                            style={{ width: `${Math.min(lead.score, 100)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-muted">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-muted">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className="px-2 py-1 text-xs bg-dark border border-gray-dark/30 rounded text-white focus:border-gold focus:outline-none"
                        >
                          <option value="hot">Hot</option>
                          <option value="warm">Warm</option>
                          <option value="cold">Cold</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-muted">
            <p>No leads found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Add your first lead
            </button>
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(status) => updateLeadStatus(selectedLead.id, status)}
          statusColors={statusColors}
        />
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}

function LeadDetailDrawer({
  lead,
  onClose,
  onStatusChange,
  statusColors,
}: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (status: Lead['status']) => void;
  statusColors: Record<Lead['status'], string>;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-dark border-l border-gray-dark/30 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-dark/30 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lead Details</h2>
            <button onClick={onClose} className="text-gray-muted hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-muted uppercase tracking-wider mb-3">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-muted">Name</p>
                  <p className="text-white">{lead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-muted">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-gold hover:text-gold-light">
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div>
                    <p className="text-sm text-gray-muted">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-gold hover:text-gold-light">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.company && (
                  <div>
                    <p className="text-sm text-gray-muted">Company</p>
                    <p className="text-white">{lead.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-muted uppercase tracking-wider mb-3">
                Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {(['hot', 'warm', 'cold', 'converted', 'lost'] as Lead['status'][]).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      lead.status === status
                        ? statusColors[status]
                        : 'border-gray-dark/30 text-gray-muted hover:text-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest */}
            {lead.interest && (
              <div>
                <h3 className="text-sm font-medium text-gray-muted uppercase tracking-wider mb-3">
                  Interest
                </h3>
                <p className="text-white">{lead.interest}</p>
              </div>
            )}

            {/* Notes */}
            {lead.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-muted uppercase tracking-wider mb-3">
                  Notes
                </h3>
                <p className="text-white whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-dark/30 flex items-center justify-between">
            <button className="px-4 py-2 bg-dark-light text-white border border-gray-dark/30 rounded-lg hover:border-gold/50 transition-colors">
              Add Note
            </button>
            <button className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors">
              Convert to Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddLeadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'warm' as Lead['status'],
    source: 'manual',
    interest: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-dark border border-gray-dark/30 rounded-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-muted mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-muted mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-muted mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-muted mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-muted mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              >
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-muted mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              >
                <option value="manual">Manual Entry</option>
                <option value="website_form">Website Form</option>
                <option value="chat_widget">Chat Widget</option>
                <option value="voice_call">Voice Call</option>
                <option value="referral">Referral</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-muted mb-1">Interest</label>
            <input
              type="text"
              value={formData.interest}
              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
              placeholder="What are they interested in?"
              className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-muted mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-light text-white border border-gray-dark/30 rounded-lg hover:border-gold/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
