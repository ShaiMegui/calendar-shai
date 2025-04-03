export type DayOfWeekType = 
  | "SUNDAY"
  | "MONDAY" 
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface DayAvailabilityType {
  id?: string;
  day: DayOfWeekType;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilityType {
  id?: string;
  timeGap: number;
  days: DayAvailabilityType[];
}

export interface AvailabilityResponseType {
  timeGap: number;
  days: DayAvailabilityType[];
}

export interface UserType {
  id: string;
  name: string;
  email: string;
  username?: string;
  image_url?: string;
}