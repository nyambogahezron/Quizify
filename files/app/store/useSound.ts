import { Audio } from 'expo-av';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sound effects for different actions
const soundObjects: { [key: string]: Audio.Sound } = {};

// Initialize sound objects
const initSounds = async () => {
	try {
		const { sound: correctSound } = await Audio.Sound.createAsync(
			require('@/assets/sounds/correct.mp3'),
			{ volume: 0.5 }
		);
		soundObjects.correct = correctSound;

		const { sound: incorrectSound } = await Audio.Sound.createAsync(
			require('@/assets/sounds/negative.mp3'),
			{ volume: 0.5 }
		);
		soundObjects.incorrect = incorrectSound;

		const { sound: levelCompleteSound } = await Audio.Sound.createAsync(
			require('@/assets/sounds/notification.mp3'),
			{ volume: 0.5 }
		);
		soundObjects.levelComplete = levelCompleteSound;

		const { sound: buttonClickSound } = await Audio.Sound.createAsync(
			require('@/assets/sounds/notification.mp3'),
			{ volume: 0.3 }
		);
		soundObjects.buttonClick = buttonClickSound;

		const { sound: notificationSound } = await Audio.Sound.createAsync(
			require('@/assets/sounds/notification.mp3'),
			{ volume: 0.3 }
		);
		soundObjects.notification = notificationSound;
	} catch (error) {
		console.error('Error loading sounds:', error);
	}
};

// store to manage sound preferences
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
			enabled: true,
			volume: 0.5,
			setEnabled: (enabled) => set({ enabled }),
			setVolume: (volume) => {
				set({ volume });
				// Update volume for all sounds
				Object.values(soundObjects).forEach((sound) => {
					sound.setVolumeAsync(volume);
				});
			},
			toggleSounds: () => set((state) => ({ enabled: !state.enabled })),
		}),
		{
			name: 'sound-settings',
		}
	)
);

export const playSoundEffect = async (type: keyof typeof soundObjects) => {
	const { enabled, volume } = useSoundSettings.getState();

	// Only play sound if it exists and sounds are enabled
	if (soundObjects[type] && enabled) {
		try {
			// Set volume before playing
			await soundObjects[type].setVolumeAsync(volume);
			await soundObjects[type].replayAsync();
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	}
};

// Initialize sounds when the app starts
initSounds();

// Cleanup function to unload sounds
export const cleanupSounds = async () => {
	try {
		await Promise.all(
			Object.values(soundObjects).map((sound) => sound.unloadAsync())
		);
	} catch (error) {
		console.error('Error cleaning up sounds:', error);
	}
};

export default soundObjects;
