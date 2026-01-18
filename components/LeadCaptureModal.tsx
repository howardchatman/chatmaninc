'use client';

import { useState, useEffect, useCallback } from 'react';
import { submitLead, type LeadFormData, type SubmitLeadResult } from '@/app/actions/submitLead';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function LeadCaptureModal({ isOpen, onClose }: LeadCaptureModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    company: '',
    industry: '',
    goal: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation
      const timeout = setTimeout(() => {
        setFormData({ name: '', email: '', company: '', industry: '', goal: '' });
        setStatus('idle');
        setErrorMessage('');
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-dark border border-gray-dark/50 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-muted hover:text-white transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          {status === 'success' ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif text-white mb-3">Request Received</h3>
              <p className="text-gray-muted mb-6">
                We&apos;ll review your submission and reach out within 24-48 hours to discuss your architecture needs.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gold text-dark font-medium rounded-sm hover:bg-gold-light transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            // Form State
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full mb-4">
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                  <span className="text-xs text-gold">Architecture Review</span>
                </div>
                <h2 id="modal-title" className="text-2xl md:text-3xl font-serif text-white mb-2">
                  Architect Your AI Operations
                </h2>
                <p className="text-gray-muted">
                  Tell us where complexity is slowing your business. We&apos;ll identify where intelligence creates leverage.
                </p>
              </div>

              {/* Error Message */}
              {status === 'error' && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Form */}
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm text-gray-muted mb-1.5">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm text-gray-muted mb-1.5">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
                    >
                      <option value="">Select industry</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Technology">Technology</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="goal" className="block text-sm text-gray-muted mb-1.5">
                    What operational challenge are you facing? <span className="text-gold">*</span>
                  </label>
                  <textarea
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-dark-light border border-gray-dark/50 rounded-sm text-white placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors resize-none disabled:opacity-50"
                    placeholder="Describe your bottleneck, inefficiency, or growth challenge..."
                  />
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
                    'Request Architecture Review'
                  )}
                </button>
              </form>

              {/* Footer microcopy */}
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
