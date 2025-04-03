import { create } from 'zustand';
import { CalendarDate } from '@internationalized/date';

interface BookingState {
  timezone: string;
  hourType: '12h' | '24h';
  selectedDate: CalendarDate | null;
  selectedSlot: string | null;
  next: boolean;
  isSuccess: boolean;
  bookingInProgress: boolean;
  setTimezone: (timezone: string) => void;
  setHourType: (hourType: '12h' | '24h') => void;
  handleSelectDate: (date: CalendarDate) => void;
  handleSelectSlot: (slot: string | null) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSuccess: (value: boolean) => void;
  startNewBooking: () => void;
}

export const useBookingState = create<BookingState>((set) => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  hourType: '24h',
  selectedDate: null,
  selectedSlot: null,
  next: false,
  isSuccess: false,
  bookingInProgress: false,
  setTimezone: (timezone) => set({ timezone }),
  setHourType: (hourType) => set({ hourType }),
  handleSelectDate: (date) => set({ selectedDate: date }),
  handleSelectSlot: (slot) => set({ selectedSlot: slot }),
  handleNext: () => set({ next: true, bookingInProgress: true }),
  handleBack: () => set({ next: false }),
  handleSuccess: (value) => set({ isSuccess: value }),
  startNewBooking: () => set({
    selectedDate: null,
    selectedSlot: null,
    next: false,
    isSuccess: false,
    bookingInProgress: false
  }),
}));