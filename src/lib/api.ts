import { supabase } from './supabase';
import { AvailabilityType, AvailabilityResponseType } from '@/types/api.type';
import { useStore } from '@/store/store';
import { generateTimeSlots } from './utils';
import { IntegrationAppType } from './types';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ENV } from './env';

export const getUserAvailabilityQueryFn = async (): Promise<{ data: AvailabilityResponseType }> => {
  const { user } = useStore.getState();
  
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('availability')
    .select(`
      id,
      time_gap,
      days:day_availability(
        id,
        day,
        start_time,
        end_time,
        is_available
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      data: {
        timeGap: 30,
        days: []
      }
    };
  }

  return {
    data: {
      timeGap: data.time_gap,
      days: data.days.map(day => ({
        id: day.id,
        day: day.day,
        startTime: day.start_time,
        endTime: day.end_time,
        isAvailable: day.is_available
      }))
    }
  };
};

export const updateUserAvailabilityMutationFn = async (data: AvailabilityType) => {
  const { user } = useStore.getState();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data: existingAvailability, error: fetchError } = await supabase
    .from('availability')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  let availabilityId: string;

  if (existingAvailability) {
    const { error: updateError } = await supabase
      .from('availability')
      .update({ time_gap: data.timeGap })
      .eq('id', existingAvailability.id);

    if (updateError) {
      throw updateError;
    }

    availabilityId = existingAvailability.id;
  } else {
    const { data: newAvailability, error: insertError } = await supabase
      .from('availability')
      .insert({ user_id: user.id, time_gap: data.timeGap })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    availabilityId = newAvailability.id;
  }

  for (const day of data.days) {
    const { error: upsertError } = await supabase
      .from('day_availability')
      .upsert({
        id: day.id,
        availability_id: availabilityId,
        day: day.day,
        start_time: day.startTime,
        end_time: day.endTime,
        is_available: day.isAvailable
      }, {
        onConflict: 'availability_id,day'
      });

    if (upsertError) {
      throw upsertError;
    }
  }

  return { message: "Availability updated successfully" };
};

export const getEventsQueryFn = async () => {
  const { user } = useStore.getState();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return data;
};

export const getMeetingsQueryFn = async () => {
  const { user } = useStore.getState();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return data;
};

export const getAllPublicEventQueryFn = async (username: string) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name')
    .eq('username', username)
    .maybeSingle();

  if (userError && userError.code !== 'PGRST116') {
    throw userError;
  }

  if (!user) {
    return { user: null, events: [] };
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_private', false);

  if (eventsError) {
    throw eventsError;
  }

  return { user, events };
};

export const getSinglePublicEventBySlugQueryFn = async ({ username, slug }: { username: string, slug: string }) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name')
    .eq('username', username)
    .maybeSingle();

  if (userError && userError.code !== 'PGRST116') {
    throw userError;
  }

  if (!user) {
    return { event: null };
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*, user:users(*)')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .maybeSingle();

  if (eventError && eventError.code !== 'PGRST116') {
    throw eventError;
  }

  return { event: event || null };
};

export const getPublicAvailabilityByEventIdQueryFn = async (eventId: string) => {
  const { data: existingMeetings, error: meetingsError } = await supabase
    .from('meetings')
    .select('start_time, end_time')
    .eq('event_id', eventId)
    .eq('status', 'SCHEDULED');

  if (meetingsError) {
    throw meetingsError;
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('user_id')
    .eq('id', eventId)
    .single();

  if (eventError) {
    throw eventError;
  }

  if (!event) {
    throw new Error('Event not found');
  }

  const { data: availability, error: availabilityError } = await supabase
    .from('availability')
    .select(`
      time_gap,
      days:day_availability(
        day,
        start_time,
        end_time,
        is_available
      )
    `)
    .eq('user_id', event.user_id)
    .single();

  if (availabilityError) {
    throw availabilityError;
  }

  if (!availability) {
    return { data: [] };
  }

  const availableDays = availability.days.filter((day: any) => day.is_available);

  const daysWithSlots = availableDays.map((day: any) => {
    const slots = generateTimeSlots(availability.time_gap).filter(slot => {
      const [slotHours, slotMinutes] = slot.split(':');
      const [startHours, startMinutes] = day.start_time.split(':');
      const [endHours, endMinutes] = day.end_time.split(':');

      const slotTime = new Date();
      slotTime.setHours(parseInt(slotHours), parseInt(slotMinutes), 0, 0);

      const startTime = new Date();
      startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endTime = new Date();
      endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      return slotTime >= startTime && slotTime <= endTime;
    });

    return {
      day: day.day,
      isAvailable: day.is_available,
      slots: slots.map(slot => {
        const [hours, minutes] = slot.split(':');
        const slotTime = new Date();
        slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return slotTime.toISOString();
      })
    };
  });

  return { 
    data: daysWithSlots,
    existingMeetings: existingMeetings || []
  };
};

export const scheduleMeetingMutationFn = async (data: any) => {
  // Get event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('location_type, user_id')
    .eq('id', data.eventId)
    .single();

  if (eventError) throw eventError;

  // Get integration details
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', event.user_id)
    .eq('app_type', event.location_type)
    .eq('is_connected', true)
    .single();

  if (integrationError) {
    throw new Error('No active integration found for this meeting type');
  }

  let meetLink = '';
  let calendarEventId = '';

  if (event.location_type === 'GOOGLE_MEET_AND_CALENDAR') {
    try {
      const response = await fetch(`${ENV.VITE_SUPABASE_URL}/functions/v1/create-google-meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integration.access_token}`,
        },
        body: JSON.stringify({
          startTime: data.startTime,
          endTime: data.endTime,
          attendees: [{ email: data.guestEmail }],
          summary: `Meeting with ${data.guestName}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Meet creation error:', errorData);
        throw new Error(errorData.error || 'Failed to create Google Meet link');
      }

      const result = await response.json();
      meetLink = result.meetLink;
      calendarEventId = result.eventId;

      if (!meetLink || !calendarEventId) {
        throw new Error('Invalid response from Google Meet creation');
      }
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      throw new Error('Failed to create Google Meet meeting');
    }
  } else {
    throw new Error('Unsupported meeting type');
  }

  // Create meeting in database
  const { data: meetingData, error } = await supabase
    .from('meetings')
    .insert({
      event_id: data.eventId,
      user_id: event.user_id,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      additional_info: data.additionalInfo,
      start_time: data.startTime,
      end_time: data.endTime,
      meet_link: meetLink,
      calendar_event_id: calendarEventId,
      calendar_app_type: event.location_type,
      status: 'SCHEDULED'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data: meetingData };
};

export const getAllIntegrationQueryFn = async () => {
  const { user } = useStore.getState();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return { integrations: data };
};

export const connectAppIntegrationQueryFn = async ({
  appType,
  origin
}: {
  appType: IntegrationAppType;
  origin: string;
}) => {
  const { user } = useStore.getState();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .functions.invoke('connect-integration', {
      body: { appType, userId: user.id, origin }
    });

  if (error) {
    throw error;
  }

  return data;
};

export const cancelMeetingMutationFn = async (meetingId: string) => {
  // Get meeting details first
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select(`
      *,
      event:events(
        user_id,
        location_type
      )
    `)
    .eq('id', meetingId)
    .single();

  if (meetingError) throw meetingError;
  if (!meeting) throw new Error('Meeting not found');

  // Get integration details for the event owner
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', meeting.event.user_id)
    .eq('app_type', meeting.event.location_type)
    .eq('is_connected', true)
    .single();

  if (integrationError) {
    throw new Error('No active integration found for this meeting type');
  }

  // Cancel the calendar event based on the integration type
  if (meeting.calendar_app_type === 'GOOGLE_MEET_AND_CALENDAR') {
    try {
      const response = await fetch(`${ENV.VITE_SUPABASE_URL}/functions/v1/delete-google-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${integration.access_token}`,
        },
        body: JSON.stringify({
          eventId: meeting.calendar_event_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel Google Calendar event');
      }
    } catch (error) {
      console.error('Error cancelling Google Calendar event:', error);
      throw new Error('Failed to cancel calendar event');
    }
  } else {
    throw new Error('Unsupported calendar type');
  }

  // Update meeting status in database
  const { error: updateError } = await supabase
    .from('meetings')
    .update({ status: 'CANCELLED' })
    .eq('id', meetingId);

  if (updateError) {
    throw updateError;
  }

  return { message: 'Meeting cancelled successfully' };
};