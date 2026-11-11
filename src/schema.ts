import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const client = createClient({
    url: process.env.DB_FILE_NAME!,
});

export const db = drizzle({ client, logger: true });
export { client };

export const usersTable = sqliteTable('users_table', {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    age: int().notNull(),
    email: text().notNull().unique(),
});

export async function initializeDatabase(): Promise<void> {
    await migrate(db, { migrationsFolder: './drizzle' });
}