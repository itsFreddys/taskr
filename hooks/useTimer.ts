import * as KeepAwake from "expo-keep-awake";
import { useState, useEffect, useRef } from "react";

export const useTimer = (initialMinutes: number = 25) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(initialMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      KeepAwake.activateKeepAwakeAsync(); // 🟢 Force screen on
      // ... interval logic
    } else {
      KeepAwake.activateKeepAwakeAsync(); // 🔴 Allow sleep
      // ... clear interval
    }

    return () => {
      KeepAwake.deactivateKeepAwake(); // 🔴 Cleanup on unmount
    };
  }, [isActive, secondsLeft]);

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

  const reset = (seconds: number) => {
    setIsActive(false);
    setSecondsLeft(seconds);
    setTotalTime(seconds);
  };

  const adjustTime = (amount: number) => {
    setSecondsLeft((prev) => {
      const next = prev + amount * 10;
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
    secondsLeft,
    progress,
    toggle,
    reset,
    adjustTime,
  };
};
