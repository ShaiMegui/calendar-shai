/*
  # Fix Events and Users Relationship

  1. Changes
    - Clean up orphaned events (events without valid user_id)
    - Add foreign key constraint from events.user_id to users.id
    - Add index on events.user_id for better query performance
  
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with CASCADE delete
    - Safe migration that handles existing data
*/

-- First, remove any events that reference non-existent users
DELETE FROM public.events
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Add foreign key constraint to events table
DO $$ 
BEGIN
  -- Check if the constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_user_id_fkey'
  ) THEN
    ALTER TABLE public.events
    ADD CONSTRAINT events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better query performance if it doesn't exist
DO $$ 
BEGIN
  -- Check if the index doesn't already exist
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'events_user_id_idx'
  ) THEN
    CREATE INDEX events_user_id_idx ON public.events(user_id);
  END IF;
END $$;