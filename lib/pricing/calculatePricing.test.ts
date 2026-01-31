/**
 * Unit tests for calculatePricing()
 *
 * Run with: npx tsx lib/pricing/calculatePricing.test.ts
 * Or install jest/vitest and run normally.
 */

import { calculatePricing, type PricingInput, generateSMSQuote, generateEmailQuote } from './calculatePricing';

const baseInput: PricingInput = {
  companyName: 'Test Corp',
  industry: 'Real Estate',
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

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL: ${name}`);
    console.log(`    ${err}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log('\ncalculatePricing() Tests\n' + '='.repeat(40));

// ---- Tier determination ----

test('Minimal input → Starter tier', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'] });
  assert(result.recommendedTier === 'Starter', `Expected Starter, got ${result.recommendedTier}`);
});

test('Multiple channels + integrations → Growth tier', () => {
  const result = calculatePricing({
    ...baseInput,
    channels: ['voice', 'chat', 'sms'],
    integrations: ['crm', 'calendar'],
    customWorkflows: 3,
    monthlyLeads: '200-500',
  });
  assert(result.recommendedTier === 'Growth', `Expected Growth, got ${result.recommendedTier}`);
});

test('High complexity → Enterprise tier', () => {
  const result = calculatePricing({
    ...baseInput,
    channels: ['voice', 'chat', 'sms', 'email'],
    integrations: ['crm', 'calendar', 'payment', 'custom_api'],
    customWorkflows: 7,
    monthlyLeads: '500+',
    employeeCount: '200+',
    whiteLabel: true,
  });
  assert(result.recommendedTier === 'Enterprise', `Expected Enterprise, got ${result.recommendedTier}`);
});

// ---- Base pricing ----

test('Starter base is $497', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'] });
  assert(result.baseMonthlyCost === 497, `Expected 497, got ${result.baseMonthlyCost}`);
});

test('Growth base is $1497', () => {
  const result = calculatePricing({
    ...baseInput,
    channels: ['voice', 'chat', 'sms'],
    integrations: ['crm', 'calendar'],
    customWorkflows: 3,
    monthlyLeads: '200-500',
  });
  assert(result.baseMonthlyCost === 1497, `Expected 1497, got ${result.baseMonthlyCost}`);
});

// ---- Channel costs ----

test('Voice channel adds $200', () => {
  const result = calculatePricing({ ...baseInput, channels: ['voice'] });
  assert(result.channelCost === 200, `Expected 200, got ${result.channelCost}`);
});

test('All channels total $525', () => {
  const result = calculatePricing({ ...baseInput, channels: ['voice', 'chat', 'sms', 'email'] });
  assert(result.channelCost === 525, `Expected 525, got ${result.channelCost}`);
});

// ---- Integration costs ----

test('CRM integration adds $100', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'], integrations: ['crm'] });
  assert(result.integrationCost === 100, `Expected 100, got ${result.integrationCost}`);
});

test('Custom API integration adds $300/mo + $500 setup', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'], integrations: ['custom_api'] });
  assert(result.integrationCost === 300, `Expected 300, got ${result.integrationCost}`);
  const setupItem = result.lineItems.find(li => li.item === 'Custom API Integration');
  assert(setupItem?.oneTimeCost === 500, `Expected $500 one-time for custom API`);
});

// ---- Volume multiplier ----

test('500+ leads applies 1.6x multiplier', () => {
  const base = calculatePricing({ ...baseInput, channels: ['chat'], monthlyLeads: '<50' });
  const high = calculatePricing({ ...baseInput, channels: ['chat'], monthlyLeads: '500+' });
  assert(high.monthlyTotal > base.monthlyTotal, 'High volume should cost more');
  assert(high.volumeCost > 0, `Expected volume cost > 0, got ${high.volumeCost}`);
});

// ---- Industry modifiers ----

test('Healthcare adds 15% modifier', () => {
  const standard = calculatePricing({ ...baseInput, channels: ['chat'], industry: 'Real Estate' });
  const healthcare = calculatePricing({ ...baseInput, channels: ['chat'], industry: 'Healthcare' });
  assert(healthcare.monthlyTotal > standard.monthlyTotal, 'Healthcare should cost more than Real Estate');
  assert(healthcare.notes.some(n => n.includes('Healthcare')), 'Should note healthcare modifier');
});

test('Childcare gets 10% discount', () => {
  const standard = calculatePricing({ ...baseInput, channels: ['chat'], industry: 'Real Estate' });
  const childcare = calculatePricing({ ...baseInput, channels: ['chat'], industry: 'Childcare' });
  assert(childcare.monthlyTotal < standard.monthlyTotal, 'Childcare should cost less than Real Estate');
});

// ---- Add-ons ----

test('All add-ons increase total', () => {
  const base = calculatePricing({ ...baseInput, channels: ['chat'] });
  const addons = calculatePricing({
    ...baseInput,
    channels: ['chat'],
    dedicatedSupport: true,
    analyticsPackage: true,
    whiteLabel: true,
    slaGuarantee: true,
  });
  assert(addons.monthlyTotal > base.monthlyTotal, 'Add-ons should increase total');
  assert(addons.addonCost === 1250, `Expected addon cost 1250, got ${addons.addonCost}`);
});

// ---- Floor price ----

test('Monthly total never below $497', () => {
  const result = calculatePricing({ ...baseInput, channels: ['email'], industry: 'Childcare' });
  assert(result.monthlyTotal >= 497, `Monthly should be >= 497, got ${result.monthlyTotal}`);
});

// ---- Annual discount ----

test('Annual discount is 10%', () => {
  const result = calculatePricing({ ...baseInput, channels: ['voice', 'chat'] });
  const expected = Math.round(result.monthlyTotal * 12 * 0.10);
  assert(result.annualDiscount === expected, `Expected discount ${expected}, got ${result.annualDiscount}`);
});

// ---- Confidence levels ----

test('Custom API → low confidence', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'], integrations: ['custom_api'] });
  assert(result.confidence === 'low', `Expected low, got ${result.confidence}`);
});

test('Simple setup → high confidence', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'] });
  assert(result.confidence === 'high', `Expected high, got ${result.confidence}`);
});

// ---- Output generators ----

test('SMS quote includes company name', () => {
  const result = calculatePricing({ ...baseInput, channels: ['chat'] });
  const sms = generateSMSQuote(baseInput, result);
  assert(sms.includes('Test Corp'), 'SMS should include company name');
  assert(sms.includes('$'), 'SMS should include price');
});

test('Email quote includes breakdown', () => {
  const result = calculatePricing({ ...baseInput, channels: ['voice', 'chat'] });
  const email = generateEmailQuote(baseInput, result);
  assert(email.includes('Subject:'), 'Email should have subject');
  assert(email.includes('MONTHLY BREAKDOWN'), 'Email should have breakdown');
});

// ---- Setup fees ----

test('Setup fee includes tier base + one-time items', () => {
  const result = calculatePricing({
    ...baseInput,
    channels: ['chat'],
    integrations: ['custom_api'],
    aiPersonality: true,
  });
  // Starter setup = $500, custom API = $500, AI personality = $250
  assert(result.setupFee === 1250, `Expected setup fee 1250, got ${result.setupFee}`);
});

// ---- Summary ----

console.log('\n' + '='.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  process.exit(1);
}
