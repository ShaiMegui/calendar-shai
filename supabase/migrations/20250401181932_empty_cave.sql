/*
  # Fix Database Schema and Dependencies

  1. Changes
    - Drop existing tables in correct order
    - Recreate tables with proper dependencies
    - Add RLS policies and triggers
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Maintain data integrity with proper constraints
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own availability" ON public.availability;
DROP POLICY IF EXISTS "Users can manage own availability" ON public.availability;
DROP POLICY IF EXISTS "Users can read own day availability" ON public.day_availability;
DROP POLICY IF EXISTS "Users can manage own day availability" ON public.day_availability;

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM (
    'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS public.day_availability;
DROP TABLE IF EXISTS public.availability;

-- Create availability table
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  time_gap integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Create day_availability table
CREATE TABLE IF NOT EXISTS public.day_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id uuid NOT NULL REFERENCES public.availability(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (availability_id, day)
);

-- Enable RLS
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for availability
CREATE POLICY "Users can read own availability"
  ON public.availability
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own availability"
  ON public.availability
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for day_availability
CREATE POLICY "Users can read own day availability"
  ON public.day_availability
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.availability a
      WHERE a.id = day_availability.availability_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own day availability"
  ON public.day_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.availability a
      WHERE a.id = day_availability.availability_id
      AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.availability a
      WHERE a.id = day_availability.availability_id
      AND a.user_id = auth.uid()
    )
  );

-- Function to create default availability
CREATE OR REPLACE FUNCTION public.create_default_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  availability_id uuid;
  day_of_week day_of_week;
BEGIN
  -- Create availability record
  INSERT INTO public.availability (user_id)
  VALUES (NEW.id)
  RETURNING id INTO availability_id;

  -- Create default day_availability records
  FOR day_of_week IN SELECT unnest(enum_range(NULL::day_of_week))
  LOOP
    INSERT INTO public.day_availability (
      availability_id,
      day,
      start_time,
      end_time,
      is_available
    )
    VALUES (
      availability_id,
      day_of_week,
      '09:00',
      '17:00',
      CASE 
        WHEN day_of_week IN ('SATURDAY', 'SUNDAY') THEN false
        ELSE true
      END
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for default availability
DROP TRIGGER IF EXISTS on_auth_user_created_availability ON public.users;

CREATE TRIGGER on_auth_user_created_availability
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_availability();