'use client';

import { useEffect, useState } from 'react';

interface Invoice {
  id: string;
  invoice_number: string;
  contact_id: string | null;
  contact_name?: string;
  contact_email?: string;
  description: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  stripe_invoice_id: string | null;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<Invoice['status'], string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    paid: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="text-gray-muted mt-1">
            Create and manage invoices with Stripe
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
        >
          + Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark border border-gray-dark/30 rounded-lg p-4">
          <p className="text-sm text-gray-muted">Total Invoiced</p>
          <p className="text-2xl font-semibold text-white mt-1">
            ${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-dark border border-gray-dark/30 rounded-lg p-4">
          <p className="text-sm text-gray-muted">Paid</p>
          <p className="text-2xl font-semibold text-green-400 mt-1">
            ${invoices.filter((i) => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-dark border border-gray-dark/30 rounded-lg p-4">
          <p className="text-sm text-gray-muted">Pending</p>
          <p className="text-2xl font-semibold text-yellow-400 mt-1">
            ${invoices.filter((i) => i.status === 'pending').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-dark border border-gray-dark/30 rounded-lg p-4">
          <p className="text-sm text-gray-muted">Overdue</p>
          <p className="text-2xl font-semibold text-red-400 mt-1">
            ${invoices
              .filter((i) => i.status === 'pending' && i.due_at && new Date(i.due_at) < new Date())
              .reduce((sum, inv) => sum + inv.total, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-dark border border-gray-dark/30 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
          </div>
        ) : invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-light border-b border-gray-dark/30">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-dark/30">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-dark-light/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{invoice.invoice_number}</p>
                      {invoice.description && (
                        <p className="text-sm text-gray-muted truncate max-w-xs">
                          {invoice.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{invoice.contact_name || 'N/A'}</p>
                      <p className="text-sm text-gray-muted">{invoice.contact_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">${invoice.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full border ${statusColors[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-muted">
                      <p>{new Date(invoice.issued_at).toLocaleDateString()}</p>
                      {invoice.due_at && (
                        <p className="text-xs">
                          Due: {new Date(invoice.due_at).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {invoice.status === 'pending' && (
                          <button
                            onClick={() => sendInvoice(invoice.id)}
                            className="px-3 py-1 text-xs bg-gold text-dark rounded hover:bg-gold-light transition-colors"
                          >
                            Send
                          </button>
                        )}
                        <button className="px-3 py-1 text-xs bg-dark-light text-white border border-gray-dark/30 rounded hover:border-gold/50 transition-colors">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-muted">
            <p>No invoices yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Create your first invoice
            </button>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}

function CreateInvoiceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    description: '',
    items: [{ description: '', amount: '' }],
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const total = formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: formData.customerEmail,
          customerName: formData.customerName,
          description: formData.description,
          items: formData.items.map((item) => ({
            description: item.description,
            amount: parseFloat(item.amount),
          })),
          dueDate: formData.dueDate || null,
        }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-dark border border-gray-dark/30 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Create Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-muted mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-muted mb-1">Customer Email *</label>
              <input
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-muted mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Invoice description"
              className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-muted mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-muted">Line Items *</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-gold hover:text-gold-light transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                    className="flex-1 px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none text-sm"
                  />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                    placeholder="$0.00"
                    className="w-24 px-3 py-2 bg-dark-light border border-gray-dark/30 rounded-lg text-white focus:border-gold focus:outline-none text-sm"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-gray-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-dark/30">
            <span className="text-gray-muted">Total</span>
            <span className="text-xl font-semibold text-white">${total.toFixed(2)}</span>
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
              disabled={loading || total <= 0}
              className="px-4 py-2 bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
