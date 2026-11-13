import 'reflect-metadata';
import cls from 'cls-hooked';
import { fileURLToPath } from 'node:url';
import { QueryTypes } from 'sequelize';
import { Model, Sequelize } from 'sequelize-typescript';
import * as entities from './entities';
import { logger } from './tools/logger.ts';

Sequelize.useCLS(cls.createNamespace('sqlite-playground'));

export async function createDatabase(databaseFile: string): Promise<Sequelize> {
    if (/^(https?|libsql):/i.test(databaseFile)) {
        throw new Error('This Sequelize setup requires a local SQLite database, not a remote libSQL URL.');
    }

    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: databaseFile.startsWith('file://')
            ? fileURLToPath(databaseFile)
            : databaseFile.replace(/^file:/, ''),
        models: Object.values(entities).filter(
            (entity) => entity.prototype instanceof Model,
        ),
        logging: (sql) => logger.silent({ sql }, 'Executing SQL query'),
    });

    try {
        if (sequelize.options.storage !== ':memory:') {
            const [result] = await sequelize.query<{ journal_mode: string }>('PRAGMA journal_mode = WAL', {
                type: QueryTypes.SELECT,
            });
            if (result?.journal_mode !== 'wal') {
                throw new Error(`Failed to enable SQLite WAL mode: ${result?.journal_mode}`);
            }
        }
        return sequelize;
    } catch (error) {
        await sequelize.close();
        throw error;
    }
}
