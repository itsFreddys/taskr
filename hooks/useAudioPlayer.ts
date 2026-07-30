import { Audio } from "expo-av";
import { useEffect, useState } from "react";

const AUDIO_FILES: Record<string, any> = {
  rain: require("@/assets/audio/rainfall-track.mp3"),
  lofi: require("@/assets/audio/lofi-track.mp3"),
  forest: require("@/assets/audio/forest-track.mp3"),
  noise: require("@/assets/audio/wave-track.mp3"),
  synth: require("@/assets/audio/piano.mp3"),
};

export function useAudioPlayer(initialSoundId: string = "mute") {
  const [activeSoundId, setActiveSoundId] = useState<string>(initialSoundId);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;
    let newSoundInstance: Audio.Sound | null = null;

    async function playSound(id: string) {
      // Unload previous sound if playing
      if (sound) {
        await sound.unloadAsync();
      }

      if (id === "mute" || !AUDIO_FILES[id]) {
        setSound(null);
        return;
      }

      try {
        const { sound: createdSound } = await Audio.Sound.createAsync(
          AUDIO_FILES[id],
          { shouldPlay: true, isLooping: true }
        );

        if (isMounted) {
          newSoundInstance = createdSound;
          setSound(createdSound);
        } else {
          // Unload if component unmounted while loading
          await createdSound.unloadAsync();
        }
      } catch (err) {
        console.error(`Error playing audio track "${id}":`, err);
      }
    }

    playSound(activeSoundId);

    return () => {
      isMounted = false;
      if (newSoundInstance) {
        newSoundInstance.unloadAsync();
      } else if (sound) {
        sound.unloadAsync();
      }
    };
  }, [activeSoundId]);

  return {
    activeSoundId,
    setActiveSoundId,
  };
}
