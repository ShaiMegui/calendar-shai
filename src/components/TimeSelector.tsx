import React from "react";
import { UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/utils";

interface TimeSelectorProps {
  name: string;
  defaultValue?: string;
  timeGap?: number;
  register: UseFormRegister<any>;
  className?: string;
  onSelect: (time: string) => void;
}

const TimeSelector = ({
  name,
  defaultValue = "09:00",
  timeGap = 30,
  register,
  className,
  onSelect,
}: TimeSelectorProps) => {
  // Fonction simple pour formater les horaires
  const formatTime = (time) => {
    if (!time) return "09:00";
    // Si le temps inclut des secondes, les supprimer
    if (time.includes(":") && time.split(":").length > 2) {
      const parts = time.split(":");
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  // Générer des plages horaires de 00:00 à 23:59
  const generateTimeSlots = () => {
    const slots = [];
    const totalMinutesInDay = 24 * 60;
    
    for (let minutes = 0; minutes < totalMinutesInDay; minutes += timeGap) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const time = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      slots.push(time);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const formattedDefaultValue = formatTime(defaultValue);

  return (
    <select
      {...register(name)}
      defaultValue={formattedDefaultValue}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1",
        "text-sm shadow-sm transition-colors file:border-0 file:bg-transparent",
        "file:text-sm file:font-medium placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onChange={(e) => {
        const formattedTime = formatTime(e.target.value);
        onSelect(formattedTime);
      }}
    >
      {timeSlots.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
};

export default TimeSelector;