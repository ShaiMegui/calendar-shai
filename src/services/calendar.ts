import { supabase } from '@/lib/supabase';
import { Availability, DayAvailability, Event, Meeting } from '@/types/calendar';

export async function getAvailability(userId: string): Promise<Availability> {
  const { data, error } = await supabase
    .from('availability')
    .select(`
      *,
      days:day_availability(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAvailability(
  userId: string,
  availability: Partial<Availability>,
  days: Partial<DayAvailability>[]
) {
  const { data, error } = await supabase
    .from('availability')
    .upsert({
      user_id: userId,
      ...availability,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: daysError } = await supabase
    .from('day_availability')
    .upsert(
      days.map(day => ({
        ...day,
        availability_id: data.id,
      }))
    );

  if (daysError) throw daysError;

  return data;
}

export async function createEvent(userId: string, event: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      ...event,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEvents(userId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function createMeeting(meeting: Partial<Meeting>) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetings(userId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, event:events(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}