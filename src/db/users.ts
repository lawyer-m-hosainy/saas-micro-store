import { db } from './index';
import { users } from './schema';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  const updateSet: { email: string, name?: string } = { email };
  if (name) updateSet.name = name;

  const result = await db.insert(users)
    .values({ id: uid, email, name })
    .onConflictDoUpdate({
      target: users.id,
      set: updateSet,
    })
    .returning();
  return result[0] || null;
}
