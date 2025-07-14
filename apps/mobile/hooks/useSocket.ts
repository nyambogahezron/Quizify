import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/config';

export const useSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(API_URL, {
			transports: ['websocket'],
			autoConnect: true,
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, []);

	return { socket };
};
