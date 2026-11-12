import 'dotenv/config';
import { createDatabase } from './database.js';

export const sequelize = await createDatabase(process.env.DATABASE_URL ?? 'sqlite.db');
