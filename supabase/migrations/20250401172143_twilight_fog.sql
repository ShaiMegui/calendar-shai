/*
  # Initial Schema Setup for Calendar Application

  1. New Tables
    - users
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - password (text)
      - username (text, unique)
      - image_url (text, nullable)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - availability
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - time_gap (integer, default 30)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - day_availability
      - id (uuid, primary key)
      - availability_id (uuid, references availability)
      - day (text)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - is_available (boolean, default true)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - events
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - title (text)
      - description (text, nullable)
      - duration (integer, default 30)
      - slug (text)
      - is_private (boolean, default false)
      - location_type (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - meetings
      - id (uuid, primary key)
      - event_id (uuid, references events)
      - user_id (uuid, references users)
      - guest_name (text)
      - guest_email (text)
      - additional_info (text, nullable)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - meet_link (text)
      - calendar_event_id (text)
      - calendar_app_type (text)
      - status (text, default 'SCHEDULED')
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE day_of_week AS ENUM (
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'
);

CREATE TYPE event_location_type AS ENUM (
  'GOOGLE_MEET_AND_CALENDAR', 'ZOOM_MEETING'
);

CREATE TYPE meeting_status AS ENUM (
  'SCHEDULED', 'CANCELLED'
);

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  username text UNIQUE NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create availability table
CREATE TABLE availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  time_gap integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create day_availability table
CREATE TABLE day_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id uuid REFERENCES availability(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  duration integer DEFAULT 30,
  slug text NOT NULL,
  is_private boolean DEFAULT false,
  location_type event_location_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  additional_info text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  meet_link text NOT NULL,
  calendar_event_id text NOT NULL,
  calendar_app_type text NOT NULL,
  status meeting_status DEFAULT 'SCHEDULED',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own availability" ON availability
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own availability" ON availability
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own day availability" ON day_availability
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM availability a
    WHERE a.id = day_availability.availability_id
    AND a.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own events" ON events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public events" ON events
  FOR SELECT TO anon
  USING (NOT is_private);

CREATE POLICY "Users can manage own meetings" ON meetings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create meetings" ON meetings
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read public meetings" ON meetings
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = meetings.event_id
    AND NOT e.is_private
  ));