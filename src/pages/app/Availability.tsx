import { useQuery } from "@tanstack/react-query";
import { getUserAvailabilityQueryFn } from "@/lib/api";
import { DayAvailabilityType, DayOfWeekType } from "@/types/api.type";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Loader } from "@/components/loader";
import PageTitle from "@/components/PageTitle";
import { Card, CardContent } from "@/components/ui/card";
import WeeklyHoursRow from "./availability/components/weekly-hours";
import { ClockIcon } from "lucide-react";
import { useState, useEffect } from "react";

const defaultDays: DayAvailabilityType[] = [
  { day: "MONDAY", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "TUESDAY", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "WEDNESDAY", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "THURSDAY", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "FRIDAY", startTime: "09:00", endTime: "17:00", isAvailable: true },
  { day: "SATURDAY", startTime: "09:00", endTime: "17:00", isAvailable: false },
  { day: "SUNDAY", startTime: "09:00", endTime: "17:00", isAvailable: false }
];

const sortOrder: Record<DayOfWeekType, number> = {
  "MONDAY": 0,
  "TUESDAY": 1,
  "WEDNESDAY": 2,
  "THURSDAY": 3,
  "FRIDAY": 4,
  "SATURDAY": 5,
  "SUNDAY": 6
};

const Availability = () => {
  const [availabilityDays, setAvailabilityDays] = useState<DayAvailabilityType[]>(defaultDays);
  const [availabilityTimeGap, setAvailabilityTimeGap] = useState<number>(30);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user_availability"],
    queryFn: getUserAvailabilityQueryFn,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data?.data) {
      if (data.data.days?.length) {
        const sortedDays = [...data.data.days].sort(
          (a, b) => sortOrder[a.day] - sortOrder[b.day]
        );
        setAvailabilityDays(sortedDays);
      } else {
        setAvailabilityDays(defaultDays);
      }
      
      setAvailabilityTimeGap(data.data.timeGap ?? 30);
      setIsInitialized(true);
    }
  }, [data]);

  if (!isInitialized && isLoading) {
    return (
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <PageTitle 
            title="Availability" 
            subtitle="Set your weekly hours and configure when you're available for meetings."
            className="mb-0" 
          />
        </div>
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader 
            size="lg" 
            color="black" 
            className="text-primary opacity-70" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 md:px-6 lg:px-8">
      <div className="flex flex-col items-center sm:flex-row sm:justify-between gap-4 mb-6 md:mb-8 text-center sm:text-left">
        <PageTitle 
          title="Availability" 
          subtitle="Set your weekly hours and configure when you're available for meetings."
          className="w-full" 
        />
      </div>

      <ErrorAlert isError={isError} error={error} />
      
      <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-white">
            <div className="flex items-center justify-center sm:justify-start gap-3 px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <ClockIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Weekly Hours
              </h3>
            </div>
            
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="w-full">
                <WeeklyHoursRow 
                  key={`availability-${isInitialized ? 'loaded' : 'default'}`}
                  days={availabilityDays} 
                  timeGap={availabilityTimeGap}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Availability;