// Ajoutez ce fichier dans votre projet, par exemple à l'emplacement : @/lib/timeUtils.ts

/**
 * Formate une chaîne de temps au format HH:MM en supprimant les secondes si présentes
 * @param timeString - La chaîne de temps à formater (par exemple "09:00:00" ou "09:00")
 * @returns Chaîne de temps au format HH:MM
 */
export function formatTimeHHMM(timeString: string): string {
  if (!timeString) return "00:00";
  
  // Si le temps inclut des secondes (HH:MM:SS), ne garder que HH:MM
  if (timeString.includes(":") && timeString.split(":").length > 2) {
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  }
  
  return timeString;
}

/**
 * Transforme les objets d'un jour pour s'assurer que les heures sont au format HH:MM
 * @param day - Objet représentant un jour avec startTime et endTime
 * @returns Objet jour avec startTime et endTime au format HH:MM
 */
export function formatDayTimes<T extends { startTime: string; endTime: string }>(day: T): T {
  return {
    ...day,
    startTime: formatTimeHHMM(day.startTime),
    endTime: formatTimeHHMM(day.endTime)
  };
}

/**
 * Transforme un tableau de jours pour s'assurer que tous les temps sont au format HH:MM
 * @param days - Tableau d'objets jour
 * @returns Tableau d'objets jour avec temps au format HH:MM
 */
export function formatDaysTimes<T extends { startTime: string; endTime: string }>(days: T[]): T[] {
  return days.map(formatDayTimes);
}