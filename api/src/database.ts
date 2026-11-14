import 'reflect-metadata';
import cls from 'cls-hooked';
import { fileURLToPath } from 'node:url';
import { Model, Sequelize } from 'sequelize-typescript';
import * as entities from './entities';
import { logger } from './tools/logger.ts';

Sequelize.useCLS(cls.createNamespace('sqlite-playground'));

export async function createDatabase(databaseUrl?: string): Promise<Sequelize> {
    if (process.env.NODE_ENV === 'production' && !/^postgres(?:ql)?:\/\//i.test(databaseUrl ?? '')) {
        throw new Error('Set DATABASE_URL to a PostgreSQL connection URL in production.');
    }

    const url = databaseUrl ?? 'sqlite.db';
    const postgres = /^postgres(?:ql)?:\/\//i.test(url);
    if (!postgres && /^(https?|libsql):/i.test(url)) {
        throw new Error('Use a local SQLite database path or a PostgreSQL connection URL.');
    }

    const options = {
        models: Object.values(entities).filter(
            (entity) => entity.prototype instanceof Model,
        ),
        logging: (sql: string) => logger.silent({ sql }, 'Executing SQL query'),
    };
    return postgres
        ? new Sequelize(url, { ...options, dialect: 'postgres' })
        : new Sequelize({
            ...options,
            dialect: 'sqlite',
            pool: { max: 2 },
            storage: url.startsWith('file://')
                ? fileURLToPath(url)
                : url.replace(/^file:/, ''),
        });
}
