-- Chatman Inc CRM Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lead Status Enum
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('hot', 'warm', 'cold', 'converted', 'lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Lead Source Enum
DO $$ BEGIN
  CREATE TYPE lead_source AS ENUM ('website_form', 'chat_widget', 'voice_call', 'referral', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Interaction Type Enum
DO $$ BEGIN
  CREATE TYPE interaction_type AS ENUM ('email', 'call', 'meeting', 'note', 'chat', 'voice_call');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment Status Enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact Info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(255),

  -- Lead Details
  status lead_status DEFAULT 'warm',
  source lead_source DEFAULT 'website_form',

  -- Qualification
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  interest TEXT,
  notes TEXT,

  -- Scoring
  score INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,

  -- Assignment
  assigned_to VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- CONTACTS TABLE (CRM)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to lead (optional)
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Contact Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(255),

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  -- Social
  linkedin_url VARCHAR(500),
  website VARCHAR(500),

  -- Status
  is_customer BOOLEAN DEFAULT FALSE,
  lifetime_value DECIMAL(10, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- INTERACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Links
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Interaction Details
  type interaction_type NOT NULL,
  subject VARCHAR(500),
  content TEXT,

  -- Metadata
  duration_minutes INTEGER,
  outcome VARCHAR(255),

  -- User who logged it
  logged_by VARCHAR(255),

  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Additional data (call recordings, chat transcripts, etc.)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Links
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Invoice Details
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,

  -- Payment
  status payment_status DEFAULT 'pending',
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),

  -- Dates
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Line items stored as JSON
  line_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- CALENDAR BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Links
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Booking Details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(100) DEFAULT 'America/New_York',

  -- Guest Info
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'confirmed',

  -- External IDs
  google_event_id VARCHAR(255),
  outlook_event_id VARCHAR(255),
  meeting_link VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- CHAT CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Links
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Session
  session_id VARCHAR(255) NOT NULL,

  -- Visitor Info
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'active',

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Message
  sender VARCHAR(50) NOT NULL, -- 'user' or 'ai'
  content TEXT NOT NULL,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_customer ON contacts(is_customer);

CREATE INDEX IF NOT EXISTS idx_interactions_lead_id ON interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_occurred_at ON interactions(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_calendar_bookings_start_time ON calendar_bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_bookings_guest_email ON calendar_bookings(guest_email);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (makes schema re-runnable)
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS update_calendar_bookings_updated_at ON calendar_bookings;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_bookings_updated_at
  BEFORE UPDATE ON calendar_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (makes schema re-runnable)
DROP POLICY IF EXISTS "Service role full access to leads" ON leads;
DROP POLICY IF EXISTS "Service role full access to contacts" ON contacts;
DROP POLICY IF EXISTS "Service role full access to interactions" ON interactions;
DROP POLICY IF EXISTS "Service role full access to invoices" ON invoices;
DROP POLICY IF EXISTS "Service role full access to calendar_bookings" ON calendar_bookings;
DROP POLICY IF EXISTS "Service role full access to chat_conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Service role full access to chat_messages" ON chat_messages;

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access to leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to contacts" ON contacts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to interactions" ON interactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to calendar_bookings" ON calendar_bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to chat_conversations" ON chat_conversations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to chat_messages" ON chat_messages
  FOR ALL USING (auth.role() = 'service_role');
