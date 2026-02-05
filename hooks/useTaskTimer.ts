import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";

// 🟢 Helper to parse time (moved into hook scope or a utility file)
const parseTimeToSeconds = (rawValue: any) => {
  if (typeof rawValue === "string" && rawValue.includes(":")) {
    const parts = rawValue.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  }
  return Number(rawValue) || 0;
};

export const useTaskTimer = (task: any) => {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const defaultVal = task.defaultTimer || task.timers?.[0] || 0;
    return parseTimeToSeconds(defaultVal);
  });

  useEffect(() => {
    // 🟢 Use ReturnType to automatically match your environment's type
    let interval: ReturnType<typeof setInterval>;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }

    // 🟢 Clear it like normal
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    if (timeLeft > 0) {
      setIsTimerRunning((prev) => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return true; // 🟢 Signal that timer toggled
    }
    return false; // 🟢 Signal that timer is at 0 (need to show menu)
  }, [timeLeft]);

  const startTimer = useCallback((mins: number) => {
    setTimeLeft(mins * 60);
    setIsTimerRunning(true);
  }, []);

  const selectTimer = useCallback((timeValue: any) => {
    const seconds = parseTimeToSeconds(timeValue);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
  }, []);

  return {
    timeLeft,
    isTimerRunning,
    toggleTimer,
    startTimer,
    setTimeLeft, // Exposed in case of manual resets
    selectTimer,
  };
};
