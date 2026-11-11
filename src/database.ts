import 'reflect-metadata';
import 'dotenv/config';
import cls from 'cls-hooked';
import { fileURLToPath } from 'node:url';
import { Model, Sequelize } from 'sequelize-typescript';
import * as entities from './entities';

Sequelize.useCLS(cls.createNamespace('sqlite-playground'));

const databaseFile = process.env.DB_FILE_NAME ?? 'sqlite.db';
if (/^(https?|libsql):/i.test(databaseFile)) {
    throw new Error('This Sequelize setup requires a local SQLite database, not a remote libSQL URL.');
}

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: databaseFile.startsWith('file://')
        ? fileURLToPath(databaseFile)
        : databaseFile.replace(/^file:/, ''),
    models: Object.values(entities).filter(
        (entity) => entity.prototype instanceof Model,
    ),
    logging: false,
});
