import { z } from "zod";
import { toast } from "sonner";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { dayMapping } from "@/lib/availability";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import DayAvailability from "./day-availability";
import { DayAvailabilityType } from "@/types/api.type";
import { updateUserAvailabilityMutationFn } from "@/lib/api";
import { Loader } from "@/components/loader";
import { Save } from "lucide-react";

const timeGapSchema = z
  .number()
  .int({ message: "Time gap must be an integer" })
  .min(1, { message: "Time gap must be at least 1 minute" })
  .refine((value) => [15, 30, 45, 60, 120].includes(value), {
    message: "Time gap must be 15, 30, 45, 60, or 120 minutes",
  });

const availabilitySchema = z
  .object({
    timeGap: timeGapSchema,
    days: z.array(
      z.object({
        id: z.string().optional(),
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        isAvailable: z.boolean(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    data.days.forEach((item, index) => {
      if (item.isAvailable && item.startTime && item.endTime) {
        if (item.endTime <= item.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be greater than start time",
            path: ["days", index, "startTime"],
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be greater than start time",
            path: ["days", index, "endTime"],
          });
        }
      }
    });
  });

type WeeklyHoursFormData = z.infer<typeof availabilitySchema>;

interface WeeklyHoursRowProps {
  days: DayAvailabilityType[];
  timeGap: number;
}

const formatTime = (time: string | undefined) => {
  if (!time) return "09:00";
  if (time.includes(":") && time.split(":").length > 2) {
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

const formatDays = (days: DayAvailabilityType[]) => {
  if (!Array.isArray(days)) return [];
  return days.map(day => ({
    ...day,
    startTime: formatTime(day.startTime),
    endTime: formatTime(day.endTime)
  }));
};

const WeeklyHoursRow = ({ days, timeGap }: WeeklyHoursRowProps) => {
  const queryClient = useQueryClient();
  
  const formattedDays = formatDays(days);
  
  const { mutate, isPending } = useMutation({
    mutationFn: updateUserAvailabilityMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_availability"] });
      toast.success("Availability updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update availability");
    },
  });

  const form = useForm<WeeklyHoursFormData>({
    resolver: zodResolver(availabilitySchema),
    mode: "onChange",
    defaultValues: {
      timeGap,
      days: formattedDays,
    },
  });

  const onSubmit = (values: WeeklyHoursFormData) => {
    if (isPending) return;
    const formattedFormData = {
      ...values,
      days: formatDays(values.days)
    };
    mutate(formattedFormData);
  };

  const handleTimeSelect = useCallback(
    (day: string, field: "startTime" | "endTime", time: string) => {
      const index = form
        .getValues("days")
        .findIndex((item) => item.day === day);
      if (index !== -1) {
        form.setValue(`days.${index}.${field}`, formatTime(time), {
          shouldValidate: true,
        });
      }
    },
    [form]
  );

  const onRemove = useCallback(
    (day: string) => {
      const index = form
        .getValues("days")
        .findIndex((item) => item.day === day);
      if (index !== -1) {
        form.setValue(`days.${index}.isAvailable`, false);
        form.setValue(`days.${index}.startTime`, "09:00");
        form.setValue(`days.${index}.endTime`, "17:00");
      }
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="space-y-6">
          <div className="space-y-3">
            {form.watch("days").map((day, index) => (
              <DayAvailability
                key={`${day.day}-${index}`}
                day={day.day}
                startTime={formatTime(day.startTime)}
                endTime={formatTime(day.endTime)}
                isAvailable={day.isAvailable}
                index={index}
                form={form}
                dayMapping={dayMapping}
                onRemove={onRemove}
                onTimeSelect={handleTimeSelect}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 w-full">
            <div className="flex items-center w-full gap-3">
              <Label className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0">
                Time Gap (minutes)
              </Label>
              <FormField
                name="timeGap"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-full py-2 px-3 rounded-lg focus:ring-primary/50 focus:border-primary"
                        value={field.value || ""}
                        min="1"
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          if (value === "") {
                            field.onChange(null);
                          } else {
                            const parsedValue = parseInt(value, 10);
                            if (!isNaN(parsedValue) && parsedValue > 0) {
                              field.onChange(parsedValue);
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:w-auto mt-3 sm:mt-0 flex items-center justify-center"
            >
              {isPending ? (
                <Loader size="sm" color="white" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="text-sm">Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default WeeklyHoursRow;