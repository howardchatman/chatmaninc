// Pure pricing engine for Tessara Systems internal quoting
// No side effects — takes inputs, returns pricing breakdown

export interface PricingInput {
  // Company basics
  companyName: string;
  industry: string;
  employeeCount: string; // '1-5' | '6-20' | '21-50' | '51-200' | '200+'

  // Complexity drivers
  channels: string[]; // ['voice', 'chat', 'sms', 'email']
  integrations: string[]; // ['crm', 'calendar', 'payment', 'custom_api']
  customWorkflows: number; // 0-10+
  aiPersonality: boolean; // custom tone/script
  multiLanguage: boolean;

  // Lead volume signals
  monthlyLeads: string; // '<50' | '50-200' | '200-500' | '500+'
  avgCallDuration: string; // '<2min' | '2-5min' | '5-10min' | '10min+'

  // Optional add-ons
  dedicatedSupport: boolean;
  analyticsPackage: boolean;
  whiteLabel: boolean;
  slaGuarantee: boolean;
}

export interface PricingOutput {
  // Tier
  recommendedTier: 'Starter' | 'Growth' | 'Enterprise';
  tierReason: string;

  // Monthly costs
  baseMonthlyCost: number;
  channelCost: number;
  integrationCost: number;
  workflowCost: number;
  volumeCost: number;
  addonCost: number;

  // Totals
  monthlyTotal: number;
  setupFee: number;
  annualTotal: number;
  annualDiscount: number; // 10% for annual

  // Breakdown details
  lineItems: LineItem[];

  // Confidence
  confidence: 'high' | 'medium' | 'low';
  notes: string[];
}

export interface LineItem {
  category: string;
  item: string;
  monthlyCost: number;
  oneTimeCost: number;
}

// ============================================
// PRICING CONSTANTS
// ============================================

const BASE_PRICES = {
  Starter: 497,
  Growth: 1497,
  Enterprise: 2997,
};

const SETUP_FEES = {
  Starter: 500,
  Growth: 1500,
  Enterprise: 3500,
};

const CHANNEL_PRICES: Record<string, number> = {
  voice: 200,
  chat: 100,
  sms: 150,
  email: 75,
};

const INTEGRATION_PRICES: Record<string, number> = {
  crm: 100,
  calendar: 50,
  payment: 150,
  custom_api: 300,
};

const VOLUME_MULTIPLIERS: Record<string, number> = {
  '<50': 1.0,
  '50-200': 1.15,
  '200-500': 1.35,
  '500+': 1.6,
};

const WORKFLOW_PRICE_PER = 75; // per custom workflow

const ADDON_PRICES: Record<string, number> = {
  dedicatedSupport: 300,
  analyticsPackage: 200,
  whiteLabel: 500,
  slaGuarantee: 250,
};

const INDUSTRY_MODIFIERS: Record<string, number> = {
  'Real Estate': 1.0,
  'Insurance': 1.1,
  'Home Services': 0.95,
  'Healthcare': 1.15,
  'Legal': 1.2,
  'Childcare': 0.9,
  'Financial Services': 1.15,
  'Technology': 1.05,
  'Other': 1.0,
};

// ============================================
// MAIN PRICING FUNCTION
// ============================================

export function calculatePricing(input: PricingInput): PricingOutput {
  const lineItems: LineItem[] = [];
  const notes: string[] = [];

  // 1. Determine tier
  const { tier, tierReason } = determineTier(input);

  // 2. Base cost
  const baseMonthlyCost = BASE_PRICES[tier];
  lineItems.push({
    category: 'Base',
    item: `${tier} Plan`,
    monthlyCost: baseMonthlyCost,
    oneTimeCost: 0,
  });

  // 3. Channel costs
  let channelCost = 0;
  for (const channel of input.channels) {
    const cost = CHANNEL_PRICES[channel] || 0;
    channelCost += cost;
    if (cost > 0) {
      lineItems.push({
        category: 'Channels',
        item: formatChannelName(channel),
        monthlyCost: cost,
        oneTimeCost: 0,
      });
    }
  }

  // 4. Integration costs
  let integrationCost = 0;
  for (const integration of input.integrations) {
    const cost = INTEGRATION_PRICES[integration] || 0;
    integrationCost += cost;
    if (cost > 0) {
      lineItems.push({
        category: 'Integrations',
        item: formatIntegrationName(integration),
        monthlyCost: cost,
        oneTimeCost: integration === 'custom_api' ? 500 : 0,
      });
    }
  }

  // 5. Workflow costs
  const workflowCost = input.customWorkflows * WORKFLOW_PRICE_PER;
  if (input.customWorkflows > 0) {
    lineItems.push({
      category: 'Workflows',
      item: `${input.customWorkflows} Custom Workflow${input.customWorkflows > 1 ? 's' : ''}`,
      monthlyCost: workflowCost,
      oneTimeCost: 0,
    });
  }

  // 6. AI personality
  if (input.aiPersonality) {
    lineItems.push({
      category: 'Customization',
      item: 'Custom AI Personality / Script',
      monthlyCost: 100,
      oneTimeCost: 250,
    });
  }

  // 7. Multi-language
  if (input.multiLanguage) {
    lineItems.push({
      category: 'Customization',
      item: 'Multi-Language Support',
      monthlyCost: 200,
      oneTimeCost: 0,
    });
  }

  // 8. Volume multiplier
  const volumeMultiplier = VOLUME_MULTIPLIERS[input.monthlyLeads] || 1.0;
  const subtotalBeforeVolume = baseMonthlyCost + channelCost + integrationCost + workflowCost
    + (input.aiPersonality ? 100 : 0)
    + (input.multiLanguage ? 200 : 0);
  const volumeCost = Math.round((subtotalBeforeVolume * volumeMultiplier) - subtotalBeforeVolume);

  if (volumeCost > 0) {
    lineItems.push({
      category: 'Volume',
      item: `Volume Adjustment (${input.monthlyLeads} leads/mo)`,
      monthlyCost: volumeCost,
      oneTimeCost: 0,
    });
  }

  // 9. Add-ons
  let addonCost = 0;
  if (input.dedicatedSupport) {
    addonCost += ADDON_PRICES.dedicatedSupport;
    lineItems.push({ category: 'Add-ons', item: 'Dedicated Support', monthlyCost: ADDON_PRICES.dedicatedSupport, oneTimeCost: 0 });
  }
  if (input.analyticsPackage) {
    addonCost += ADDON_PRICES.analyticsPackage;
    lineItems.push({ category: 'Add-ons', item: 'Analytics Package', monthlyCost: ADDON_PRICES.analyticsPackage, oneTimeCost: 0 });
  }
  if (input.whiteLabel) {
    addonCost += ADDON_PRICES.whiteLabel;
    lineItems.push({ category: 'Add-ons', item: 'White Label', monthlyCost: ADDON_PRICES.whiteLabel, oneTimeCost: 1000 });
  }
  if (input.slaGuarantee) {
    addonCost += ADDON_PRICES.slaGuarantee;
    lineItems.push({ category: 'Add-ons', item: 'SLA Guarantee', monthlyCost: ADDON_PRICES.slaGuarantee, oneTimeCost: 0 });
  }

  // 10. Industry modifier
  const industryMod = INDUSTRY_MODIFIERS[input.industry] || 1.0;

  // 11. Calculate totals
  const rawMonthly = subtotalBeforeVolume + volumeCost + addonCost;
  const monthlyTotal = Math.round(rawMonthly * industryMod);

  // Setup fee
  const baseSetup = SETUP_FEES[tier];
  const oneTimeItems = lineItems.reduce((sum, li) => sum + li.oneTimeCost, 0);
  const setupFee = baseSetup + oneTimeItems;
  lineItems.unshift({
    category: 'Setup',
    item: `${tier} Setup Fee`,
    monthlyCost: 0,
    oneTimeCost: baseSetup,
  });

  // Annual
  const annualRaw = monthlyTotal * 12;
  const annualDiscount = Math.round(annualRaw * 0.10);
  const annualTotal = annualRaw - annualDiscount;

  // Industry note
  if (industryMod !== 1.0) {
    const pct = Math.round((industryMod - 1) * 100);
    if (pct > 0) {
      notes.push(`${input.industry} industry modifier: +${pct}% applied`);
    } else {
      notes.push(`${input.industry} industry modifier: ${pct}% applied`);
    }
  }

  // Confidence
  const confidence = determineConfidence(input);

  // Guardrails
  if (monthlyTotal < 497) {
    notes.push('Floor price: $497/mo minimum applies');
  }
  if (monthlyTotal > 10000) {
    notes.push('High-value quote — recommend custom enterprise proposal');
  }

  return {
    recommendedTier: tier,
    tierReason,
    baseMonthlyCost,
    channelCost,
    integrationCost,
    workflowCost,
    volumeCost,
    addonCost,
    monthlyTotal: Math.max(monthlyTotal, 497),
    setupFee,
    annualTotal,
    annualDiscount,
    lineItems,
    confidence,
    notes,
  };
}

// ============================================
// HELPERS
// ============================================

function determineTier(input: PricingInput): { tier: PricingOutput['recommendedTier']; tierReason: string } {
  let score = 0;

  // Channel count
  if (input.channels.length >= 3) score += 3;
  else if (input.channels.length >= 2) score += 1;

  // Integration count
  if (input.integrations.length >= 3) score += 3;
  else if (input.integrations.length >= 2) score += 1;
  if (input.integrations.includes('custom_api')) score += 2;

  // Workflows
  if (input.customWorkflows >= 5) score += 3;
  else if (input.customWorkflows >= 2) score += 1;

  // Volume
  if (input.monthlyLeads === '500+') score += 3;
  else if (input.monthlyLeads === '200-500') score += 2;
  else if (input.monthlyLeads === '50-200') score += 1;

  // Customization
  if (input.aiPersonality) score += 1;
  if (input.multiLanguage) score += 1;

  // Employee count
  if (input.employeeCount === '200+') score += 2;
  else if (input.employeeCount === '51-200') score += 1;

  // Add-ons
  if (input.whiteLabel) score += 2;
  if (input.slaGuarantee) score += 1;

  if (score >= 10) {
    return { tier: 'Enterprise', tierReason: `Complexity score ${score}/20 — multi-channel, high-volume, or advanced integrations detected` };
  }
  if (score >= 5) {
    return { tier: 'Growth', tierReason: `Complexity score ${score}/20 — moderate channel/integration needs` };
  }
  return { tier: 'Starter', tierReason: `Complexity score ${score}/20 — straightforward setup with limited channels` };
}

function determineConfidence(input: PricingInput): PricingOutput['confidence'] {
  if (input.integrations.includes('custom_api') || input.customWorkflows > 5) return 'low';
  if (input.channels.length >= 3 || input.monthlyLeads === '500+') return 'medium';
  return 'high';
}

function formatChannelName(channel: string): string {
  const names: Record<string, string> = {
    voice: 'Voice (AI Phone)',
    chat: 'Web Chat',
    sms: 'SMS / Text',
    email: 'Email',
  };
  return names[channel] || channel;
}

function formatIntegrationName(integration: string): string {
  const names: Record<string, string> = {
    crm: 'CRM Integration',
    calendar: 'Calendar Sync',
    payment: 'Payment Processing',
    custom_api: 'Custom API Integration',
  };
  return names[integration] || integration;
}

// ============================================
// COPY-READY OUTPUT GENERATORS
// ============================================

export function generateSMSQuote(input: PricingInput, output: PricingOutput): string {
  return `Hi ${input.companyName} — here's your Tessara quote:\n\n` +
    `Plan: ${output.recommendedTier}\n` +
    `Monthly: $${output.monthlyTotal.toLocaleString()}/mo\n` +
    `Setup: $${output.setupFee.toLocaleString()} one-time\n` +
    `Annual (10% off): $${output.annualTotal.toLocaleString()}/yr\n\n` +
    `Ready to move forward? Reply YES or call us.`;
}

export function generateEmailQuote(input: PricingInput, output: PricingOutput): string {
  const lines = output.lineItems
    .filter(li => li.monthlyCost > 0)
    .map(li => `  • ${li.item}: $${li.monthlyCost}/mo`)
    .join('\n');

  const setupLines = output.lineItems
    .filter(li => li.oneTimeCost > 0)
    .map(li => `  • ${li.item}: $${li.oneTimeCost}`)
    .join('\n');

  return `Subject: Your Tessara Systems Quote — ${output.recommendedTier} Plan\n\n` +
    `Hi ${input.companyName},\n\n` +
    `Thank you for your interest in Tessara. Based on our discovery call, here's what we recommend:\n\n` +
    `RECOMMENDED PLAN: ${output.recommendedTier}\n` +
    `${output.tierReason}\n\n` +
    `MONTHLY BREAKDOWN:\n${lines}\n\n` +
    `MONTHLY TOTAL: $${output.monthlyTotal.toLocaleString()}/mo\n\n` +
    (setupLines ? `ONE-TIME SETUP:\n${setupLines}\nSETUP TOTAL: $${output.setupFee.toLocaleString()}\n\n` : '') +
    `ANNUAL OPTION (10% discount):\n` +
    `  $${output.annualTotal.toLocaleString()}/yr (save $${output.annualDiscount.toLocaleString()})\n\n` +
    `Next step: Schedule your onboarding call and we'll have your system live within 2 weeks.\n\n` +
    `— The Tessara Systems Team`;
}

export function generateProposalSummary(input: PricingInput, output: PricingOutput): string {
  return `CHATMAN INC — PROPOSAL SUMMARY\n` +
    `${'='.repeat(40)}\n\n` +
    `Client: ${input.companyName}\n` +
    `Industry: ${input.industry}\n` +
    `Team Size: ${input.employeeCount}\n` +
    `Monthly Lead Volume: ${input.monthlyLeads}\n\n` +
    `RECOMMENDED: ${output.recommendedTier} Plan\n` +
    `${output.tierReason}\n\n` +
    `PRICING:\n` +
    `  Monthly: $${output.monthlyTotal.toLocaleString()}\n` +
    `  Setup: $${output.setupFee.toLocaleString()}\n` +
    `  Annual: $${output.annualTotal.toLocaleString()} (save $${output.annualDiscount.toLocaleString()})\n\n` +
    `CHANNELS: ${input.channels.map(formatChannelName).join(', ') || 'None selected'}\n` +
    `INTEGRATIONS: ${input.integrations.map(formatIntegrationName).join(', ') || 'None selected'}\n` +
    `WORKFLOWS: ${input.customWorkflows}\n\n` +
    (output.notes.length > 0 ? `NOTES:\n${output.notes.map(n => `  • ${n}`).join('\n')}\n\n` : '') +
    `Confidence: ${output.confidence.toUpperCase()}`;
}

export function generateInternalNotes(input: PricingInput, output: PricingOutput): string {
  return `INTERNAL QUOTE NOTES\n` +
    `${'='.repeat(40)}\n\n` +
    `Company: ${input.companyName}\n` +
    `Industry: ${input.industry} (modifier: ${INDUSTRY_MODIFIERS[input.industry] || 1.0}x)\n` +
    `Size: ${input.employeeCount} employees\n` +
    `Volume: ${input.monthlyLeads} leads/mo\n` +
    `Avg Call: ${input.avgCallDuration}\n\n` +
    `Tier: ${output.recommendedTier} (${output.tierReason})\n` +
    `Confidence: ${output.confidence}\n\n` +
    `Monthly: $${output.monthlyTotal.toLocaleString()}\n` +
    `Setup: $${output.setupFee.toLocaleString()}\n` +
    `Annual: $${output.annualTotal.toLocaleString()}\n\n` +
    `LINE ITEMS:\n` +
    output.lineItems.map(li => {
      const parts = [];
      if (li.monthlyCost > 0) parts.push(`$${li.monthlyCost}/mo`);
      if (li.oneTimeCost > 0) parts.push(`$${li.oneTimeCost} setup`);
      return `  [${li.category}] ${li.item}: ${parts.join(' + ')}`;
    }).join('\n') +
    '\n\n' +
    (output.notes.length > 0 ? `FLAGS:\n${output.notes.map(n => `  ⚠ ${n}`).join('\n')}` : 'No flags.');
}
