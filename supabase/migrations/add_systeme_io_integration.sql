-- ============================================================================
-- SYSTEME.IO INTEGRATION - Add fields to profiles table
-- ============================================================================
-- This migration adds fields to track Systeme.io signups, payments, and affiliates

-- Add Systeme.io fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS systeme_contact_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS systeme_order_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS systeme_purchase_amount DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS systeme_purchase_currency TEXT DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS systeme_product_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create indexes for Systeme.io fields
CREATE INDEX IF NOT EXISTS idx_profiles_systeme_contact_id ON profiles(systeme_contact_id);
CREATE INDEX IF NOT EXISTS idx_profiles_systeme_order_id ON profiles(systeme_order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_id ON profiles(affiliate_id);

-- ============================================================================
-- PAYMENTS TABLE - Track Systeme.io payments
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  systeme_order_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  product_name TEXT,
  affiliate_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_systeme_order_id ON payments(systeme_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_affiliate_id ON payments(affiliate_id);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments" ON payments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- AFFILIATE COMMISSIONS TABLE - Track affiliate commissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  affiliate_id TEXT NOT NULL,
  affiliate_name TEXT,
  commission_amount DECIMAL(10,2) NOT NULL,
  order_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for affiliate commissions
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user_id ON affiliate_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);

-- Enable RLS on affiliate_commissions
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate_commissions
CREATE POLICY "Users can view their own affiliate commissions" ON affiliate_commissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all affiliate commissions" ON affiliate_commissions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON COLUMN profiles.systeme_contact_id IS 'Systeme.io contact ID';
COMMENT ON COLUMN profiles.systeme_order_id IS 'Systeme.io order ID for purchases';
COMMENT ON COLUMN profiles.systeme_purchase_amount IS 'Amount of Systeme.io purchase';
COMMENT ON COLUMN profiles.systeme_purchase_currency IS 'Currency of Systeme.io purchase';
COMMENT ON COLUMN profiles.systeme_product_name IS 'Name of product purchased through Systeme.io';
COMMENT ON COLUMN profiles.affiliate_id IS 'Systeme.io affiliate ID who referred this user';
COMMENT ON COLUMN profiles.affiliate_name IS 'Name of affiliate who referred this user';
COMMENT ON COLUMN profiles.phone IS 'Phone number from Systeme.io';

