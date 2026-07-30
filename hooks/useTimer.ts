import * as KeepAwake from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";

const DEFAULT_TIMER_MINUTES = 25;

export const useTimer = (initialMinutes: number = DEFAULT_TIMER_MINUTES) => {
  // Convert initial minutes to seconds once
  const initialSeconds = initialMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🟢 Screen Keep-Awake Logic
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      KeepAwake.activateKeepAwakeAsync();
    } else {
      KeepAwake.deactivateKeepAwake(); // 🟢 Fixed: Deactivate when paused/stopped
    }

    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, [isActive, secondsLeft]);

  // 🟢 Countdown Interval
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

  // --- ACTIONS ---
  const toggle = () => setIsActive(!isActive);

  // 🟢 FIXED: Takes minutes (optional), converts correctly to seconds
  const reset = (minutes?: number) => {
    setIsActive(false);

    // If minutes passed: minutes * 60. Otherwise: initialMinutes * 60
    const targetSeconds =
      minutes !== undefined ? minutes * 60 : initialMinutes * 60;

    console.log(
      "minutes:",
      minutes,
      "targetSeconds:",
      targetSeconds,
      "initialMinutes:",
      initialMinutes
    );
    setSecondsLeft(targetSeconds);
    setTotalTime(targetSeconds);
  };

  // 🟢 FIXED: Adjusts time in minutes (or seconds if desired)
  const adjustTime = (amountInMinutes: number) => {
    setSecondsLeft((prev) => {
      const next = prev + amountInMinutes * 60;
      const final = next > 0 ? next : 0;
      if (final > totalTime) setTotalTime(final);
      return final;
    });
  };

  // --- HELPERS ---
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
