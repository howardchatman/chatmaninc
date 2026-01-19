'use client';

import { useState, useEffect } from 'react';
import { submitLead, type LeadFormData, type SubmitLeadResult } from '@/app/actions/submitLead';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const initialFormData: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  industry: '',
  goal: '',
  urgency: '',
  currentTools: '',
  wantsDemo: false,
};

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => {
        setFormData(initialFormData);
        setStatus('idle');
        setErrorMessage('');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const result: SubmitLeadResult = await submitLead(formData);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-dark border border-gray-dark/50 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-muted hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-white mb-3">Request Received</h3>
              <p className="text-gray-muted mb-6">
                We&apos;ll review your submission and reach out within 24-48 hours to discuss your systems audit.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full mb-4">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  <span className="text-xs text-gold">Systems Audit</span>
                </div>
                <h2 id="modal-title" className="text-2xl md:text-3xl font-serif text-white mb-2">
                  Request a Discovery Call
                </h2>
                <p className="text-gray-muted">
                  Let&apos;s map your decision points and identify where AI creates operational leverage.
                </p>
              </div>

              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-muted mb-1.5">
                      Name <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm text-gray-muted mb-1.5">
                      Company <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                      placeholder="Your company"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-muted mb-1.5">
                      Email <span className="text-gold">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-muted mb-1.5">
                      Phone <span className="text-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-sm text-gray-muted mb-1.5">
                      Industry <span className="text-gold">*</span>
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="">Select industry</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Home Services">Home Services / Contractors</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Legal">Legal</option>
                      <option value="Childcare">Childcare / Education</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="urgency" className="block text-sm text-gray-muted mb-1.5">
                      Timeline
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediate">Immediate (this month)</option>
                      <option value="quarter">This quarter</option>
                      <option value="planning">Planning phase</option>
                      <option value="exploring">Just exploring</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="goal" className="block text-sm text-gray-muted mb-1.5">
                    Primary Goal <span className="text-gold">*</span>
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                  >
                    <option value="">What&apos;s your primary goal?</option>
                    <option value="qualify_leads">Qualify leads automatically</option>
                    <option value="reduce_missed_calls">Reduce missed calls</option>
                    <option value="automate_scheduling">Automate scheduling</option>
                    <option value="automate_intake">Automate intake / onboarding</option>
                    <option value="workflow_automation">Workflow automation</option>
                    <option value="custom_system">Custom AI system</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currentTools" className="block text-sm text-gray-muted mb-1.5">
                    Current Tools (optional)
                  </label>
                  <input
                    type="text"
                    id="currentTools"
                    name="currentTools"
                    value={formData.currentTools}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                    placeholder="CRM, phone system, scheduling software..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="wantsDemo"
                    name="wantsDemo"
                    checked={formData.wantsDemo}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    className="w-5 h-5 mt-0.5 bg-dark-light border border-gray-dark/50 rounded text-gold focus:ring-gold disabled:opacity-50"
                  />
                  <label htmlFor="wantsDemo" className="text-sm text-gray-muted">
                    I want a demo of AIVA Connect or an industry-specific agent
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Request Systems Audit'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-muted mt-4">
                Serious inquiries only. Your information stays private.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
