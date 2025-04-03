import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTimeSlots(
  timeGap: number = 30,
  format: '12h' | '24h' = '24h'
): string[] {
  const slots: string[] = [];
  const totalMinutesInDay = 24 * 60;
  let currentMinutes = 0;

  while (currentMinutes < totalMinutesInDay) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;

    if (format === '24h') {
      slots.push(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`
      );
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      slots.push(
        `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
      );
    }

    currentMinutes += timeGap;
  }

  return slots;
}

export function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;
      options.push({ value: time, label: time });
    }
  }
  return options;
}

export function generateDayOptions() {
  return [
    { value: 'SUNDAY', label: 'Sunday' },
    { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' },
    { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' },
    { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
  ];
}