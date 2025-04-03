import { format } from "date-fns";
import { Calendar } from "@/components/calendar";
import { CalendarDate, DateValue } from "@internationalized/date";
import { useBookingState } from "@/hooks/use-booking-state";
import { decodeSlot, formatSlot } from "@/lib/helper";
import { getPublicAvailabilityByEventIdQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";
import HourButton from "@/components/HourButton";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useMemo } from "react";

interface BookingCalendarProps {
  eventId: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  defaultValue?: DateValue;
  onBack?: () => void;
}

const BookingCalendar = ({
  eventId,
  minValue,
  maxValue,
  defaultValue,
  onBack,
}: BookingCalendarProps) => {
  const {
    timezone,
    hourType,
    selectedDate,
    selectedSlot,
    handleSelectDate,
    handleSelectSlot,
    handleNext,
    setHourType,
    isSuccess,
    bookingInProgress
  } = useBookingState();

  // Query for availability data
  const queryKey = ["availability_single_event", eventId, selectedDate?.toString(), isSuccess];
  const { 
    data, 
    isFetching, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => getPublicAvailabilityByEventIdQueryFn(eventId),
    enabled: true, // Always fetch availability
  });

  // Refresh available slots after successful booking
  useEffect(() => {
    if (selectedDate && !isFetching) {
      refetch();
    }
  }, [isSuccess, selectedDate, refetch]);

  // Memoized availability and existing meetings to prevent unnecessary re-renders
  const availability = useMemo(() => data?.data || [], [data]);
  const existingMeetings = useMemo(() => data?.existingMeetings || [], [data]);

  // Enhanced isDateUnavailable method
  const isDateUnavailable = (date: DateValue) => {
    const dateToCheck = date.toDate(timezone);
    const now = new Date();
    
    // Block dates strictly in the past
    if (dateToCheck < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return true;
    }

    // Check availability for this day of the week
    const dayOfWeek = format(dateToCheck, "EEEE").toUpperCase();
    const dayAvailability = availability.find((day) => day.day === dayOfWeek);
    
    // If no availability is defined or no slots, mark as unavailable
    if (!dayAvailability || !dayAvailability.isAvailable || !dayAvailability.slots?.length) {
      return true;
    }

    // Additional check for slots on the specific day
    const timeSlots = dayAvailability.slots.filter(slot => {
      const slotDate = new Date(slot);
      const selectedDateObj = date.toDate(timezone);
      
      // Update slot date with selected date
      slotDate.setFullYear(selectedDateObj.getFullYear());
      slotDate.setMonth(selectedDateObj.getMonth());
      slotDate.setDate(selectedDateObj.getDate());

      // Filter out past slots
      if (slotDate <= now) {
        return false;
      }

      // Filter out slots that overlap with existing meetings
      return !existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.start_time);
        const meetingEnd = new Date(meeting.end_time);
        return slotDate >= meetingStart && slotDate < meetingEnd;
      });
    });

    // If no slots are available, mark the date as unavailable
    return timeSlots.length === 0;
  };

  // Get time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = format(selectedDate.toDate(timezone), "EEEE").toUpperCase();
    const dayAvailability = availability.find((day) => day.day === dayOfWeek);

    return dayAvailability?.slots.filter(slot => {
      const slotDate = new Date(slot);
      const selectedDateObj = selectedDate.toDate(timezone);
      const now = new Date();
      
      // Update slot date with selected date
      slotDate.setFullYear(selectedDateObj.getFullYear());
      slotDate.setMonth(selectedDateObj.getMonth());
      slotDate.setDate(selectedDateObj.getDate());

      // Filter out past slots
      if (slotDate <= now) {
        return false;
      }

      // Filter out slots that overlap with existing meetings
      return !existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.start_time);
        const meetingEnd = new Date(meeting.end_time);
        return slotDate >= meetingStart && slotDate < meetingEnd;
      });
    }) || [];
  }, [selectedDate, availability, existingMeetings, timezone]);

  const handleChangeDate = (newDate: DateValue) => {
    const calendarDate = newDate as CalendarDate;
    handleSelectSlot(null);
    handleSelectDate(calendarDate);
  };

  const handleSlotSelect = (slot: string) => {
    const slotDate = new Date(slot);
    const selectedDateObj = selectedDate?.toDate(timezone);
    
    if (selectedDateObj) {
      slotDate.setFullYear(selectedDateObj.getFullYear());
      slotDate.setMonth(selectedDateObj.getMonth());
      slotDate.setDate(selectedDateObj.getDate());
      
      handleSelectSlot(slotDate.toISOString());
    }
  };

  const selectedTime = decodeSlot(selectedSlot, timezone, hourType);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Select Date & Time
          </h2>
        </div>
      </div>

      {/* Loading State */}
      {isFetching && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader size="lg" color="blue" />
        </div>
      )}

      {/* Calendar and Time Slots */}
      <div className="space-y-6">
        {/* Calendar Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <Calendar
            className="w-full"
            minValue={minValue}
            maxValue={maxValue}
            defaultValue={defaultValue}
            value={selectedDate}
            timezone={timezone}
            onChange={handleChangeDate}
            isDateUnavailable={isDateUnavailable}
          />
        </div>

        {/* Time Slots Section */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              {/* Date and Hour Type Toggle */}
              <div className="flex justify-between items-center">
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {format(selectedDate.toDate(timezone), "EEEE, d MMMM")}
                </div>
                <div className="flex h-10 items-center border rounded-full bg-gray-100 overflow-hidden">
                  <HourButton
                    label="12h"
                    isActive={hourType === "12h"}
                    onClick={() => setHourType("12h")}
                  />
                  <HourButton
                    label="24h"
                    isActive={hourType === "24h"}
                    onClick={() => setHourType("24h")}
                  />
                </div>
              </div>

              {/* Time Slots List */}
              <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, i) => {
                    const formattedSlot = formatSlot(slot, timezone, hourType);
                    const isSelected = selectedTime === formattedSlot;
                    
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`
                          w-full text-left p-3 rounded-lg transition-all duration-300
                          ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-blue-50 text-gray-700"
                          }
                        `}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {formattedSlot}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center bg-gray-100 p-4 rounded-lg text-gray-500">
                    No available slots for this day
                  </div>
                )}
              </div>

              {/* Next Button */}
              {selectedSlot && (
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center 
                  bg-blue-500 text-white p-3 rounded-lg 
                  hover:bg-blue-600 transition-colors"
                >
                  Next
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              Select a date to view available time slots
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      <ErrorAlert isError={isError} error={error} />
    </div>
  );
};

export default BookingCalendar;