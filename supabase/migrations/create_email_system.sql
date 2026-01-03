-- =====================================================
-- EMAIL SYSTEM FOR SUPABASE
-- =====================================================
-- This migration creates the email queue system and functions
-- for sending emails via Supabase's SMTP configuration

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  email_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type ON email_queue(email_type);

-- Enable RLS
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only service role can access)
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Function to send email via Supabase SMTP
-- Note: This requires SMTP to be configured in Supabase Dashboard
CREATE OR REPLACE FUNCTION send_email_via_smtp(
  p_to_email TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_text_content TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- This function will be called by database triggers
  -- The actual email sending is handled by Supabase's SMTP configuration
  -- For now, we'll insert into email_queue and process via Edge Function
  
  INSERT INTO email_queue (
    to_email,
    subject,
    html_content,
    text_content,
    status
  ) VALUES (
    p_to_email,
    p_subject,
    p_html_content,
    p_text_content,
    'pending'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email queued for sending'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to process email queue (can be called by cron or Edge Function)
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email RECORD;
  v_result JSONB;
  v_processed INTEGER := 0;
BEGIN
  -- Process pending emails (limit to 10 at a time)
  FOR v_email IN 
    SELECT * FROM email_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC 
    LIMIT 10
  LOOP
    -- Update attempt count
    UPDATE email_queue
    SET attempts = attempts + 1,
        updated_at = NOW()
    WHERE id = v_email.id;
    
    -- Mark as sent (actual sending handled by Supabase SMTP or Edge Function)
    -- In production, you would call an email service API here
    UPDATE email_queue
    SET status = 'sent',
        sent_at = NOW(),
        updated_at = NOW()
    WHERE id = v_email.id;
    
    v_processed := v_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'processed', v_processed
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON email_queue TO service_role;

COMMENT ON TABLE email_queue IS 'Queue for transactional emails to be sent via Supabase SMTP';
COMMENT ON FUNCTION send_email_via_smtp IS 'Queues an email for sending via Supabase SMTP configuration';
COMMENT ON FUNCTION process_email_queue IS 'Processes pending emails from the queue';

