import { useState, useEffect, useRef } from "react";

export const useTimer = (initialMinutes: number = 25) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, secondsLeft]);

  // Actions
  const toggle = () => setIsActive(!isActive);

  const reset = (minutes: number) => {
    setIsActive(false);
    const newSeconds = minutes * 60;
    setSecondsLeft(newSeconds);
    setTotalTime(newSeconds);
  };

  const adjustTime = (minutes: number) => {
    setSecondsLeft((prev) => {
      const next = prev + minutes * 60;
      const final = next > 0 ? next : 0;
      // Update totalTime if we are increasing the cap
      if (final > totalTime) setTotalTime(final);
      return final;
    });
  };

  // Helpers
  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = totalTime > 0 ? 1 - secondsLeft / totalTime : 0;

  return {
    displayTime: formatTime(),
    isActive,
    progress,
    toggle,
    reset,
    adjustTime,
  };
};
