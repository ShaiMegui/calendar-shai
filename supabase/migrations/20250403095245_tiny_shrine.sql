/*
  # Add invitation token to meetings table

  1. Changes
    - Add invitation_token column to meetings table
    - Add unique constraint on invitation_token
    - Add function to generate secure tokens
  
  2. Security
    - Ensure tokens are unique
    - Add helper function for token generation
*/

-- Add invitation_token column
ALTER TABLE public.meetings
ADD COLUMN invitation_token TEXT UNIQUE;

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Add trigger to automatically generate token on insert
CREATE OR REPLACE FUNCTION set_invitation_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invitation_token IS NULL THEN
    NEW.invitation_token := generate_secure_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER meetings_set_invitation_token
  BEFORE INSERT ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_token();