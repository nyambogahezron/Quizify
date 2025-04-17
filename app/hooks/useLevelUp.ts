import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface LevelUpData {
	newLevel: number;
	previousLevel: number;
	totalQuizzesAnswered: number;
}

export const useLevelUp = () => {
	const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
	const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
	const { socket } = useSocket();

	useEffect(() => {
		if (!socket) return;

		const handleLevelUp = (data: LevelUpData) => {
			setLevelUpData(data);
			setIsLevelUpVisible(true);
		};

		socket.on('levelUp', handleLevelUp);

		return () => {
			socket.off('levelUp', handleLevelUp);
		};
	}, [socket]);

	const handleCloseLevelUp = () => {
		setIsLevelUpVisible(false);
		setLevelUpData(null);
	};

	return {
		isLevelUpVisible,
		levelUpData,
		handleCloseLevelUp,
	};
};
