/*
  # Add integrations table and related schemas

  1. New Tables
    - `integrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `provider` (enum)
      - `category` (enum)
      - `app_type` (enum)
      - `access_token` (text)
      - `refresh_token` (text, nullable)
      - `expiry_date` (bigint, nullable)
      - `metadata` (jsonb)
      - `is_connected` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on integrations table
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE integration_provider AS ENUM (
  'GOOGLE',
  'ZOOM',
  'MICROSOFT'
);

CREATE TYPE integration_category AS ENUM (
  'CALENDAR_AND_VIDEO_CONFERENCING',
  'VIDEO_CONFERENCING',
  'CALENDAR'
);

CREATE TYPE integration_app_type AS ENUM (
  'GOOGLE_MEET_AND_CALENDAR',
  'ZOOM_MEETING',
  'OUTLOOK_CALENDAR'
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider integration_provider NOT NULL,
  category integration_category NOT NULL,
  app_type integration_app_type NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expiry_date bigint,
  metadata jsonb NOT NULL DEFAULT '{}',
  is_connected boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own integrations"
  ON public.integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON public.integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON public.integrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON public.integrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX integrations_user_id_idx ON public.integrations(user_id);
CREATE UNIQUE INDEX integrations_user_id_app_type_idx ON public.integrations(user_id, app_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();