import { db } from 'App';
import { usersTable } from 'db/schema';

export async function getUser() {
	const user = await db.select().from(usersTable).get();
	return user;
}
