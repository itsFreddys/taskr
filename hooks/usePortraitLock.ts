// hooks/usePortraitLock.ts
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";

export function usePortraitLock() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);
}

// useEffect(() => {
//     async function lockOrientation() {
//       // 🟢 Force the screen to Portrait
//       await ScreenOrientation.lockAsync(
//         ScreenOrientation.OrientationLock.PORTRAIT_UP
//       );
//     }
//     lockOrientation();

//     // 🔵 SUGGESTION: If you want other screens to be able to rotate again
//     // when you leave this screen, you can unlock it on unmount:
//     return () => {
//       ScreenOrientation.unlockAsync();
//     };
//   }, []);
