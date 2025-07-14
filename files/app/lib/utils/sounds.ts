import { Audio } from 'expo-av';

// Sound object cache
const soundObjects: { [key: string]: Audio.Sound } = {};

// Preload sounds
export const preloadSounds = async () => {
	try {
		// Create and load sound objects
		const correctSound = new Audio.Sound();
		await correctSound.loadAsync(require('../../assets/sounds/correct.mp3'));
		soundObjects.correct = correctSound;

		const incorrectSound = new Audio.Sound();
		await incorrectSound.loadAsync(require('../../assets/sounds/wrong.mp3'));
		soundObjects.incorrect = incorrectSound;

		const buttonSound = new Audio.Sound();
		await buttonSound.loadAsync(
			require('../../assets/sounds/notification.mp3')
		);
		soundObjects.button = buttonSound;

		const successSound = new Audio.Sound();
		await successSound.loadAsync(require('../../assets/sounds/correct.mp3'));
		soundObjects.success = successSound;

		const timerSound = new Audio.Sound();
		await timerSound.loadAsync(require('../../assets/sounds/negative.mp3'));
		soundObjects.timer = timerSound;

		console.log('Sounds preloaded successfully');
	} catch (error) {
		console.error('Error preloading sounds:', error);
	}
};

// Play a sound
export const playSound = async (
	soundName: 'correct' | 'incorrect' | 'button' | 'success' | 'timer'
) => {
	try {
		const sound = soundObjects[soundName];
		if (sound) {
			await sound.setPositionAsync(0);
			await sound.playAsync();
		} else {
			console.warn(`Sound ${soundName} not loaded`);
		}
	} catch (error) {
		console.error(`Error playing ${soundName} sound:`, error);
	}
};

// Unload all sounds
export const unloadSounds = async () => {
	try {
		for (const key in soundObjects) {
			await soundObjects[key].unloadAsync();
		}
		console.log('Sounds unloaded successfully');
	} catch (error) {
		console.error('Error unloading sounds:', error);
	}
};
