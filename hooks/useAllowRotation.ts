// hooks/useAllowRotation.ts
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";

export function useAllowRotation() {
  useEffect(() => {
    // Unlocks the device to follow the accelerometer
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);

    // 🔵 SUGGESTION: Force lock back to portrait when the component unmounts
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);
}
