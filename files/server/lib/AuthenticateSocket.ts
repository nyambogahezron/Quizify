/*
 * AuthenticateSocket.ts
 *
 * This file contains the authenticateSocket function that authenticates a socket connection.
 * It checks the access token from the cookie and gets the session from the database.
 * If the session is valid, it adds the user ID to the socket object and calls the next function.
 * If the session is invalid, it throws an error.
 */

import { getSession } from '../middleware/session';
import { Socket } from 'socket.io';

interface UserSocket extends Socket {
	userId?: string;
}

const authenticateSocket = async (
	socket: UserSocket,
	next: (err?: Error) => void
) => {
	try {
		const accessToken = socket.handshake.headers.cookie
			?.split(';')
			.find((cookie) => cookie.trim().startsWith('accessToken='))
			?.split('=')[1];

		// Get the session from the cookie
		const session = await getSession(accessToken || '');

		if (!session) {
			throw new Error('Authentication error: No valid session');
		}

		socket.userId = session.userId;
		next();
	} catch (error) {
		console.error('Socket authentication error:', error);
		next(new Error('Authentication error: Invalid session'));
	}
};

export default authenticateSocket;
