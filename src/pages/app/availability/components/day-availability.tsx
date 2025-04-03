import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { XIcon } from "lucide-react";
import TimeSelector from "@/components/TimeSelector";
import { DayOfWeek } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface DayAvailabilityProps {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  index: number;
  form: any;
  dayMapping: Record<string, string>;
  onRemove: (day: string) => void;
  onTimeSelect: (
    day: string,
    field: "startTime" | "endTime",
    time: string
  ) => void;
}

const DayAvailability = ({
  day,
  startTime,
  endTime,
  isAvailable,
  index,
  form,
  dayMapping,
  onRemove,
  onTimeSelect,
}: DayAvailabilityProps) => {
  const formatTime = (time) => {
    if (!time) return "09:00";
    if (time.includes(":") && time.split(":").length > 2) {
      const parts = time.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  return (
    <div 
      className={cn(
        `flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-lg transition-colors duration-300`,
        isAvailable 
          ? 'bg-gray-50 hover:bg-gray-100' 
          : 'bg-gray-100/50 opacity-70'
      )}
    >
      <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 mb-2 sm:mb-0">
        <div className="flex items-center gap-3">
          <Switch
            checked={isAvailable}
            onCheckedChange={(checked) => {
              form.setValue(`days.${index}.isAvailable`, checked);
              if (!checked) {
                form.setValue(`days.${index}.startTime`, "09:00");
                form.setValue(`days.${index}.endTime`, "17:00");
              }
            }}
            className="mr-2"
          />
          <Label 
            className={cn(
              `text-sm font-semibold uppercase tracking-wider`,
              isAvailable ? 'text-gray-800' : 'text-gray-500'
            )}
          >
            {dayMapping[day] as DayOfWeek}
          </Label>
        </div>

        {isAvailable && (
          <button
            type="button"
            className={cn(
              `sm:hidden p-1 rounded-full transition-colors duration-300 
              hover:bg-destructive/10 group`,
              isAvailable ? 'text-gray-500 hover:text-destructive' : 'opacity-50'
            )}
            onClick={() => onRemove(day)}
            disabled={!isAvailable}
          >
            <XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {isAvailable ? (
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 w-full">
            <FormField
              name={`days.${index}.startTime`}
              control={form.control}
              render={() => (
                <FormItem className="w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Label className="text-sm text-gray-600 sm:hidden mb-1">
                      Start time
                    </Label>
                    <FormControl>
                      <TimeSelector
                        name={`days.${index}.startTime`}
                        defaultValue={formattedStartTime}
                        timeGap={form.watch("timeGap")}
                        register={form.register}
                        className={cn(
                          `w-full sm:w-32 text-center`,
                          form.formState.errors?.days?.[index]?.startTime
                            ? "border-destructive ring-destructive"
                            : "border-input"
                        )}
                        onSelect={(time) => onTimeSelect(day, "startTime", time)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator 
              orientation="vertical" 
              className="hidden sm:block h-6 w-px bg-gray-300" 
            />
            
            <FormField
              name={`days.${index}.endTime`}
              control={form.control}
              render={() => (
                <FormItem className="w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Label className="text-sm text-gray-600 sm:hidden mb-1">
                      End time
                    </Label>
                    <FormControl>
                      <TimeSelector
                        name={`days.${index}.endTime`}
                        defaultValue={formattedEndTime}
                        timeGap={form.watch("timeGap")}
                        register={form.register}
                        className={cn(
                          `w-full sm:w-32 text-center`,
                          form.formState.errors?.days?.[index]?.endTime
                            ? "border-destructive ring-destructive"
                            : "border-input"
                        )}
                        onSelect={(time) => onTimeSelect(day, "endTime", time)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <button
            type="button"
            className={cn(
              `hidden sm:block ml-auto p-2 rounded-full transition-colors duration-300 
              hover:bg-destructive/10 group`,
              isAvailable ? 'text-gray-500 hover:text-destructive' : 'opacity-50'
            )}
            onClick={() => onRemove(day)}
            disabled={!isAvailable}
          >
            <XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ) : (
        <span className="text-sm text-gray-500 italic pl-12 sm:pl-0">
          Unavailable
        </span>
      )}
    </div>
  );
};

export default DayAvailability;