-- Pricing Quotes Table for Tessara Systems Internal Calculator
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pricing_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Client info
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  employee_count VARCHAR(50),

  -- Pricing result
  recommended_tier VARCHAR(50) NOT NULL,
  monthly_total DECIMAL(10, 2) NOT NULL,
  setup_fee DECIMAL(10, 2) NOT NULL,
  annual_total DECIMAL(10, 2) NOT NULL,

  -- Full input/output stored as JSON for flexibility
  pricing_input JSONB NOT NULL,
  pricing_output JSONB NOT NULL,

  -- Who created it
  created_by VARCHAR(255),

  -- Link to lead if applicable
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_company ON pricing_quotes(company_name);
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_created_at ON pricing_quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_quotes_tier ON pricing_quotes(recommended_tier);

-- RLS
ALTER TABLE pricing_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to pricing_quotes" ON pricing_quotes;
CREATE POLICY "Service role full access to pricing_quotes" ON pricing_quotes
  FOR ALL USING (auth.role() = 'service_role');

-- Updated at trigger
DROP TRIGGER IF EXISTS update_pricing_quotes_updated_at ON pricing_quotes;
CREATE TRIGGER update_pricing_quotes_updated_at
  BEFORE UPDATE ON pricing_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
