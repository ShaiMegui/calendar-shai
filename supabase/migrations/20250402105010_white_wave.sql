/*
  # Fix meetings table RLS policies

  1. Changes
    - Update RLS policies for meetings table
    - Allow anonymous users to create meetings
    - Ensure proper access control for meetings
  
  2. Security
    - Anonymous users can only create meetings
    - Users can manage their own meetings
    - Public meetings are readable by anyone
*/

-- First, disable RLS to modify policies
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Anyone can read public meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can manage own meetings" ON public.meetings;

-- Create new policies with proper access control
CREATE POLICY "Anyone can create meetings"
ON public.meetings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_id
    AND (NOT e.is_private OR e.user_id = auth.uid())
  )
);

CREATE POLICY "Anyone can read public meetings"
ON public.meetings
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_id
    AND (NOT e.is_private OR e.user_id = auth.uid())
  )
);

CREATE POLICY "Users can manage own meetings"
ON public.meetings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_id
    AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_id
    AND e.user_id = auth.uid()
  )
);

-- Re-enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;