'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  calculatePricing,
  generateSMSQuote,
  generateEmailQuote,
  generateProposalSummary,
  generateInternalNotes,
  type PricingInput,
  type PricingOutput,
} from '@/lib/pricing/calculatePricing';

const defaultInput: PricingInput = {
  companyName: '',
  industry: '',
  employeeCount: '1-5',
  channels: [],
  integrations: [],
  customWorkflows: 0,
  aiPersonality: false,
  multiLanguage: false,
  monthlyLeads: '<50',
  avgCallDuration: '<2min',
  dedicatedSupport: false,
  analyticsPackage: false,
  whiteLabel: false,
  slaGuarantee: false,
};

interface SavedQuote {
  id: string;
  company_name: string;
  recommended_tier: string;
  monthly_total: number;
  created_at: string;
  pricing_input: PricingInput;
}

export default function PricingCalculatorPage() {
  const [input, setInput] = useState<PricingInput>(defaultInput);
  const [output, setOutput] = useState<PricingOutput | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSavedQuotes, setShowSavedQuotes] = useState(false);

  // Recalculate on any input change
  useEffect(() => {
    if (input.companyName || input.channels.length > 0) {
      const result = calculatePricing(input);
      setOutput(result);
    } else {
      setOutput(null);
    }
  }, [input]);

  // Load saved quotes
  useEffect(() => {
    fetchSavedQuotes();
  }, []);

  const fetchSavedQuotes = async () => {
    try {
      const res = await fetch('/api/admin/pricing-quotes');
      const data = await res.json();
      setSavedQuotes(data.quotes || []);
    } catch {
      // Table may not exist yet
    }
  };

  const handleSaveQuote = async () => {
    if (!output || !input.companyName) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: input.companyName,
          industry: input.industry,
          employeeCount: input.employeeCount,
          recommendedTier: output.recommendedTier,
          monthlyTotal: output.monthlyTotal,
          setupFee: output.setupFee,
          annualTotal: output.annualTotal,
          pricingInput: input,
          pricingOutput: output,
        }),
      });
      if (res.ok) {
        await fetchSavedQuotes();
      }
    } catch {
      // silently fail
    }
    setSaving(false);
  };

  const loadQuote = (quote: SavedQuote) => {
    setInput(quote.pricing_input);
    setShowSavedQuotes(false);
  };

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const updateInput = (field: keyof PricingInput, value: PricingInput[keyof PricingInput]) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'channels' | 'integrations', item: string) => {
    setInput(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-white">Pricing Calculator</h1>
          <p className="text-sm text-gray-muted mt-1">Internal quoting tool — build proposals in seconds</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSavedQuotes(!showSavedQuotes)}
            className="px-4 py-2 text-sm border border-gray-dark/50 text-gray-muted hover:text-white hover:border-gold/50 rounded-lg transition-colors"
          >
            {showSavedQuotes ? 'Hide' : 'Saved Quotes'} ({savedQuotes.length})
          </button>
          {output && input.companyName && (
            <button
              onClick={handleSaveQuote}
              disabled={saving}
              className="px-4 py-2 text-sm bg-gold text-dark font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          )}
        </div>
      </div>

      {/* Saved Quotes Drawer */}
      {showSavedQuotes && savedQuotes.length > 0 && (
        <div className="mb-6 bg-dark border border-gray-dark/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Recent Quotes</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {savedQuotes.map(q => (
              <button
                key={q.id}
                onClick={() => loadQuote(q)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-light transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-white text-sm">{q.company_name}</span>
                  <span className="text-gray-muted text-xs ml-2">{q.recommended_tier}</span>
                </div>
                <div className="text-right">
                  <span className="text-gold text-sm font-medium">${q.monthly_total.toLocaleString()}/mo</span>
                  <span className="text-gray-muted text-xs ml-2">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-6">
          {/* Company Basics */}
          <Section title="Company Basics">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                value={input.companyName}
                onChange={v => updateInput('companyName', v)}
                placeholder="Acme Corp"
              />
              <Select
                label="Industry"
                value={input.industry}
                onChange={v => updateInput('industry', v)}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'Real Estate', label: 'Real Estate' },
                  { value: 'Insurance', label: 'Insurance' },
                  { value: 'Home Services', label: 'Home Services' },
                  { value: 'Healthcare', label: 'Healthcare' },
                  { value: 'Legal', label: 'Legal' },
                  { value: 'Childcare', label: 'Childcare' },
                  { value: 'Financial Services', label: 'Financial Services' },
                  { value: 'Technology', label: 'Technology' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Select
                label="Team Size"
                value={input.employeeCount}
                onChange={v => updateInput('employeeCount', v)}
                options={[
                  { value: '1-5', label: '1-5' },
                  { value: '6-20', label: '6-20' },
                  { value: '21-50', label: '21-50' },
                  { value: '51-200', label: '51-200' },
                  { value: '200+', label: '200+' },
                ]}
              />
              <Select
                label="Monthly Leads"
                value={input.monthlyLeads}
                onChange={v => updateInput('monthlyLeads', v)}
                options={[
                  { value: '<50', label: 'Under 50' },
                  { value: '50-200', label: '50-200' },
                  { value: '200-500', label: '200-500' },
                  { value: '500+', label: '500+' },
                ]}
              />
            </div>
          </Section>

          {/* Channels */}
          <Section title="Channels">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'voice', label: 'Voice (AI Phone)', desc: '+$200/mo' },
                { id: 'chat', label: 'Web Chat', desc: '+$100/mo' },
                { id: 'sms', label: 'SMS / Text', desc: '+$150/mo' },
                { id: 'email', label: 'Email', desc: '+$75/mo' },
              ].map(ch => (
                <CheckboxCard
                  key={ch.id}
                  label={ch.label}
                  description={ch.desc}
                  checked={input.channels.includes(ch.id)}
                  onChange={() => toggleArrayItem('channels', ch.id)}
                />
              ))}
            </div>
          </Section>

          {/* Integrations */}
          <Section title="Integrations">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'crm', label: 'CRM', desc: '+$100/mo' },
                { id: 'calendar', label: 'Calendar Sync', desc: '+$50/mo' },
                { id: 'payment', label: 'Payment Processing', desc: '+$150/mo' },
                { id: 'custom_api', label: 'Custom API', desc: '+$300/mo + $500 setup' },
              ].map(int => (
                <CheckboxCard
                  key={int.id}
                  label={int.label}
                  description={int.desc}
                  checked={input.integrations.includes(int.id)}
                  onChange={() => toggleArrayItem('integrations', int.id)}
                />
              ))}
            </div>
          </Section>

          {/* Complexity */}
          <Section title="Complexity Drivers">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-muted mb-1.5">
                  Custom Workflows: {input.customWorkflows}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={input.customWorkflows}
                  onChange={e => updateInput('customWorkflows', parseInt(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-gray-muted mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <CheckboxCard
                  label="Custom AI Personality"
                  description="+$100/mo + $250 setup"
                  checked={input.aiPersonality}
                  onChange={() => updateInput('aiPersonality', !input.aiPersonality)}
                />
                <CheckboxCard
                  label="Multi-Language"
                  description="+$200/mo"
                  checked={input.multiLanguage}
                  onChange={() => updateInput('multiLanguage', !input.multiLanguage)}
                />
              </div>
              <Select
                label="Avg Call Duration"
                value={input.avgCallDuration}
                onChange={v => updateInput('avgCallDuration', v)}
                options={[
                  { value: '<2min', label: 'Under 2 min' },
                  { value: '2-5min', label: '2-5 min' },
                  { value: '5-10min', label: '5-10 min' },
                  { value: '10min+', label: '10+ min' },
                ]}
              />
            </div>
          </Section>

          {/* Add-ons */}
          <Section title="Optional Add-ons">
            <div className="grid grid-cols-2 gap-3">
              <CheckboxCard
                label="Dedicated Support"
                description="+$300/mo"
                checked={input.dedicatedSupport}
                onChange={() => updateInput('dedicatedSupport', !input.dedicatedSupport)}
              />
              <CheckboxCard
                label="Analytics Package"
                description="+$200/mo"
                checked={input.analyticsPackage}
                onChange={() => updateInput('analyticsPackage', !input.analyticsPackage)}
              />
              <CheckboxCard
                label="White Label"
                description="+$500/mo + $1,000 setup"
                checked={input.whiteLabel}
                onChange={() => updateInput('whiteLabel', !input.whiteLabel)}
              />
              <CheckboxCard
                label="SLA Guarantee"
                description="+$250/mo"
                checked={input.slaGuarantee}
                onChange={() => updateInput('slaGuarantee', !input.slaGuarantee)}
              />
            </div>
          </Section>
        </div>

        {/* RIGHT: Output */}
        <div className="space-y-6">
          {output ? (
            <>
              {/* Tier Recommendation */}
              <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      output.recommendedTier === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                      output.recommendedTier === 'Growth' ? 'bg-gold/20 text-gold' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {output.recommendedTier}
                    </span>
                    <span className={`ml-2 inline-block px-2 py-0.5 rounded text-xs ${
                      output.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                      output.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {output.confidence} confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-muted">{output.tierReason}</p>
              </div>

              {/* Pricing Summary */}
              <div className="bg-dark border border-gold/30 rounded-lg p-6">
                <h3 className="text-lg font-serif text-white mb-4">Pricing Summary</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">${output.monthlyTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-muted">/month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">${output.setupFee.toLocaleString()}</p>
                    <p className="text-xs text-gray-muted">setup fee</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">${output.annualTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-muted">/year (save ${output.annualDiscount.toLocaleString()})</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border-t border-gray-dark/30 pt-4">
                  <h4 className="text-sm font-medium text-gray-muted mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {output.lineItems.map((li, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-muted text-xs mr-2">[{li.category}]</span>
                          <span className="text-white">{li.item}</span>
                        </div>
                        <div className="text-right">
                          {li.monthlyCost > 0 && (
                            <span className="text-gold">${li.monthlyCost}/mo</span>
                          )}
                          {li.oneTimeCost > 0 && (
                            <span className="text-gray-muted ml-2">+${li.oneTimeCost} setup</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {output.notes.length > 0 && (
                  <div className="border-t border-gray-dark/30 pt-4 mt-4">
                    {output.notes.map((note, i) => (
                      <p key={i} className="text-sm text-yellow-400 flex items-center gap-2">
                        <span>&#9888;</span> {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy-to-Clipboard Outputs */}
              <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
                <h3 className="text-lg font-serif text-white mb-4">Quick Copy</h3>
                <div className="grid grid-cols-2 gap-3">
                  <CopyButton
                    label="SMS Quote"
                    text={generateSMSQuote(input, output)}
                    copied={copiedField === 'sms'}
                    onClick={() => copyToClipboard(generateSMSQuote(input, output), 'sms')}
                  />
                  <CopyButton
                    label="Email Quote"
                    text={generateEmailQuote(input, output)}
                    copied={copiedField === 'email'}
                    onClick={() => copyToClipboard(generateEmailQuote(input, output), 'email')}
                  />
                  <CopyButton
                    label="Proposal Summary"
                    text={generateProposalSummary(input, output)}
                    copied={copiedField === 'proposal'}
                    onClick={() => copyToClipboard(generateProposalSummary(input, output), 'proposal')}
                  />
                  <CopyButton
                    label="Internal Notes"
                    text={generateInternalNotes(input, output)}
                    copied={copiedField === 'internal'}
                    onClick={() => copyToClipboard(generateInternalNotes(input, output), 'internal')}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
                <h3 className="text-lg font-serif text-white mb-4">Preview: Email Quote</h3>
                <pre className="text-xs text-gray-muted whitespace-pre-wrap font-mono bg-dark-light p-4 rounded-lg max-h-64 overflow-y-auto">
                  {generateEmailQuote(input, output)}
                </pre>
              </div>
            </>
          ) : (
            <div className="bg-dark border border-gray-dark/30 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-serif text-lg mb-2">Start Building a Quote</h3>
              <p className="text-gray-muted text-sm">Enter a company name and select at least one channel to see pricing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Reusable sub-components
// ============================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark border border-gray-dark/30 rounded-lg p-6">
      <h3 className="text-sm font-medium text-gold mb-4 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-muted mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-dark-light border border-gray-dark/50 rounded-lg text-white text-sm placeholder-gray-muted/50 focus:border-gold focus:outline-none transition-colors"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm text-gray-muted mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-dark-light border border-gray-dark/50 rounded-lg text-white text-sm focus:border-gold focus:outline-none transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CheckboxCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`text-left p-3 rounded-lg border transition-colors ${
        checked
          ? 'border-gold/50 bg-gold/10'
          : 'border-gray-dark/50 bg-dark-light hover:border-gray-dark'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center ${
          checked ? 'bg-gold border-gold' : 'border-gray-dark/50'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm text-white">{label}</p>
          <p className="text-xs text-gray-muted">{description}</p>
        </div>
      </div>
    </button>
  );
}

function CopyButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  text: string;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
        copied
          ? 'border-green-500/50 bg-green-500/10 text-green-400'
          : 'border-gray-dark/50 bg-dark-light text-gray-muted hover:text-white hover:border-gold/50'
      }`}
    >
      {copied ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}
