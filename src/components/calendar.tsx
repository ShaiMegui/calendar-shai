import { createCalendar } from "@internationalized/date";
import { useRef } from "react";
import {
  AriaCalendarProps,
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useLocale,
} from "react-aria";
import { CalendarState, useCalendarState } from "react-stately";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DateValue = {
  day: number;
  month: number;
  year: number;
  toDate(timezone: string): Date;
};

interface CalendarProps extends AriaCalendarProps<DateValue> {
  isDateUnavailable?: (date: DateValue) => boolean;
  className?: string;
  availableDayClassName?: string;
  unavailableDayClassName?: string;
  timezone?: string;
}

function Calendar(props: CalendarProps) {
  const { locale } = useLocale();
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar
  });

  const ref = useRef<HTMLDivElement>(null);
  const {
    calendarProps,
    prevButtonProps,
    nextButtonProps,
    title
  } = useCalendar(props, state, ref);

  return (
    <div {...calendarProps} ref={ref} className={cn("space-y-4", props.className)}>
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
          aria-label="Previous month"
          onClick={prevButtonProps.onPress}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-gray-900">{title}</div>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
          aria-label="Next month"
          onClick={nextButtonProps.onPress}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <CalendarGrid state={state} props={props} />
    </div>
  );
}

function CalendarGrid({ state, props }: { state: CalendarState, props: CalendarProps }) {
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  return (
    <table {...gridProps} className="w-full border-collapse">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={index}
              className="text-center text-xs font-normal text-gray-500 py-2"
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(6)].map((_, weekIndex) => (
          <tr key={weekIndex}>
            {state.getDatesInWeek(weekIndex).map((date, dayIndex) => {
              if (!date) return <td key={dayIndex} />;
              return (
                <td key={dayIndex} className="text-center p-0 relative">
                  <CalendarCell 
                    date={date} 
                    state={state} 
                    isUnavailable={props.isDateUnavailable?.(date)}
                    availableDayClassName={props.availableDayClassName}
                    unavailableDayClassName={props.unavailableDayClassName}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface CalendarCellProps {
  date: DateValue;
  state: CalendarState;
  isUnavailable?: boolean;
  availableDayClassName?: string;
  unavailableDayClassName?: string;
}

function CalendarCell({ 
  date, 
  state, 
  isUnavailable,
  availableDayClassName,
  unavailableDayClassName 
}: CalendarCellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    formattedDate
  } = useCalendarCell({ date }, state, ref);

  const isOutsideMonth = date.month !== state.visibleRange.start.month;

  return (
    <div
      {...cellProps}
      className={cn(
        "py-1",
        isOutsideMonth && "opacity-50"
      )}
    >
      <button
        {...buttonProps}
        ref={ref}
        disabled={isOutsideVisibleRange || isUnavailable}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200",
          isSelected 
            ? "bg-blue-500 text-white hover:bg-blue-500" // Keep the same background on hover
            : (!isUnavailable 
                ? "hover:bg-blue-50 text-gray-700" 
                : "text-gray-300 cursor-not-allowed bg-gray-50"),
          isOutsideMonth && "text-gray-400 opacity-50",
          !isUnavailable && availableDayClassName,
          isUnavailable && unavailableDayClassName
        )}
      >
        {formattedDate}
      </button>
    </div>
  );
}

export { Calendar };