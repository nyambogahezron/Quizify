import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
}

interface UserStore {
  user: User;
  setUser: (user: User) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://via.placeholder.com/40',
    level: 1,
  },
  setUser: (user) => set({ user }),
}));

export default useUserStore;
