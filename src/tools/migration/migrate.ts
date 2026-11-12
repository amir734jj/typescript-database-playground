import type { QueryInterface } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug, type MigrationParams } from 'umzug';
import { discoverMigrations } from './discover-migrations.js';

const migrations = (await discoverMigrations()).map((MigrationClass) => {
    const migration = new MigrationClass();
    return {
        name: MigrationClass.migrationName,
        up: ({ context }: MigrationParams<QueryInterface>) => migration.up(context),
        down: ({ context }: MigrationParams<QueryInterface>) => migration.down(context),
    };
});

export function createMigrator(sequelize: Sequelize) {
    const storage = new SequelizeStorage({
        sequelize,
        timestamps: true,
        tableName: 'Migrations',
    });
    const migrator = new Umzug({
        migrations,
        context: sequelize.getQueryInterface(),
        storage,
        logger: console,
    });
    return { migrator, storage };
}

export async function runMigrations(direction: 'up' | 'down', sequelize: Sequelize): Promise<void> {
    await sequelize.transaction(async () => {
        const { migrator, storage } = createMigrator(sequelize);
        const executed = await storage.executed();
        const missing = executed.filter(
            (name) => !migrations.some((migration) => migration.name === name),
        );
        if (missing.length > 0) {
            throw new Error(
                `Restore the source definitions for applied migrations: ${missing.join(', ')}`,
            );
        }
        if (direction === 'up') {
            await migrator.up();
        } else {
            await migrator.down();
        }
    });
}
