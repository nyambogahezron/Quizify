import { create } from 'zustand';
import { getUser } from '../lib/db';

interface UserState {
	user: {
		id: number;
		name: string;
		email: string;
		username: string;
		level: number | null;
		points: number | null;
		avatar: string | null;
	} | null;
	setUser: (user: UserState['user']) => void;
	loadUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	loadUser: async () => {
		try {
			const user = (await getUser()) as UserState['user'];
			set({ user });
		} catch (error) {
			console.error('Error loading user:', error);
		}
	},
}));
