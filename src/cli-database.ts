import 'dotenv/config';
import { createDatabase } from './database.ts';

export const sequelize = await createDatabase(process.env.DATABASE_URL ?? 'sqlite.db');
