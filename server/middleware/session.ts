import { verifyJWT } from '../lib/JWT';
import { UnauthorizedError } from '../errors';

interface Session {
	userId: string;
	[key: string]: any;
}

export async function getSession(cookie: string): Promise<Session | null> {
	try {
		if (!cookie) {
			return null;
		}

		// URL decode the cookie
		const decodedCookie = decodeURIComponent(cookie);

		// Remove the session prefix if it exists (s:)
		const cleanToken = decodedCookie.replace(/^s:/, '');

		// Remove the session signature (everything after the last dot)
		const tokenParts = cleanToken.split('.');
		if (tokenParts.length > 3) {
			tokenParts.splice(3); // Keep only the standard JWT parts
		}
		const jwtToken = tokenParts.join('.');

		const payload = verifyJWT(jwtToken);

		if (typeof payload === 'string') {
			throw new UnauthorizedError('Authentication Invalid');
		}

		if (!payload.payload?.userId) {
			return null;
		}

		return {
			userId: payload.payload.userId,
			...payload.payload,
		};
	} catch (error) {
		console.error('Error decoding session:', error);
		return null;
	}
}
