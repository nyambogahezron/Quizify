import { Howl } from "howler";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sound effects for different actions
const sounds = {
  correct: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3"],
    volume: 0.5,
  }),
  incorrect: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/522/522-preview.mp3"],
    volume: 0.5,
  }),
  achievement: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3"],
    volume: 0.5,
  }),
  levelComplete: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3"],
    volume: 0.5,
  }),
  buttonClick: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/1705/1705-preview.mp3"],
    volume: 0.3,
  }),
  notification: new Howl({
    src: ["https://assets.mixkit.co/active_storage/sfx/2053/2053-preview.mp3"],
    volume: 0.3,
  }),
};

// Create a store to manage sound preferences
interface SoundSettings {
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleSounds: () => void;
}

export const useSoundSettings = create<SoundSettings>()(
  persist(
    (set) => ({
      enabled: false,
      volume: 0.5,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => {
        set({ volume });
        // Update volume for all sounds
        Object.values(sounds).forEach((sound) => {
          sound.volume(volume);
        });
      },
      toggleSounds: () => set((state) => ({ enabled: !state.enabled })),
    }),
    {
      name: "sound-settings",
    }
  )
);

export const playSoundEffect = (type: keyof typeof sounds) => {
  const { enabled, volume } = useSoundSettings.getState();
  
  // Only play sound if it exists and sounds are enabled
  if (sounds[type] && enabled) {
    // Set volume before playing
    sounds[type].volume(volume);
    sounds[type].play();
  }
};

export default sounds;
