export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  userId: string;
  timeGap: number;
  days: DayAvailability[];
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  id: string;
  availabilityId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

export enum EventLocationType {
  GOOGLE_MEET_AND_CALENDAR = 'GOOGLE_MEET_AND_CALENDAR',
  ZOOM_MEETING = 'ZOOM_MEETING'
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  duration: number;
  slug: string;
  isPrivate: boolean;
  locationType: EventLocationType;
  createdAt: string;
  updatedAt: string;
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED'
}

export interface Meeting {
  id: string;
  eventId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  additionalInfo?: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  calendarEventId: string;
  calendarAppType: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}