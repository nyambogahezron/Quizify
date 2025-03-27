import jwt from 'jsonwebtoken';

interface Session {
	userId: string;
	[key: string]: any;
}

export async function getSession(cookie: string): Promise<Session | null> {
	try {
		if (!cookie) {
			console.log('No cookie provided');
			return null;
		}

		// Parse cookies
		const cookies = cookie.split(';').reduce((acc, curr) => {
			const [name, value] = curr.trim().split('=');
			acc[name] = value;
			return acc;
		}, {} as Record<string, string>);

		console.log('Parsed cookies:', Object.keys(cookies));

		const token = cookies['accessToken'];
		if (!token) {
			console.log('No accessToken found in cookies');
			return null;
		}

		// URL decode the token before verification
		const decodedToken = decodeURIComponent(token);
		const session = jwt.verify(
			decodedToken,
			process.env.JWT_SECRET!
		) as Session;
		console.log('Successfully decoded session for user:', session.userId);
		return session;
	} catch (error) {
		console.error('Error decoding session:', error);
		return null;
	}
}
