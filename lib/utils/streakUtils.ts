// lib/utils/streakUtils.ts
import { startOfDay, parseISO, isToday, isYesterday } from "date-fns";

export const calculateNewStreak = (
  lastDateStr: string | null,
  currentStreak: number = 0
): number => {
  if (!lastDateStr) return 1; // Brand new task, start at 1

  const lastDate = startOfDay(parseISO(lastDateStr));
  const today = startOfDay(new Date());

  if (isToday(lastDate)) return currentStreak; // Already did it today
  if (isYesterday(lastDate)) return currentStreak + 1; // Continued the streak!

  return 1; // There was a gap of 2+ days, reset to 1
};
