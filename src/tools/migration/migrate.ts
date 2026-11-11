import type { QueryInterface } from 'sequelize';
import { SequelizeStorage, Umzug, type MigrationParams } from 'umzug';
import { sequelize } from '../../database.ts';
import { discoverMigrations } from './discover-migrations.ts';

const migrations = (await discoverMigrations()).map((MigrationClass) => {
    const migration = new MigrationClass();
    return {
        name: MigrationClass.migrationName,
        up: ({ context }: MigrationParams<QueryInterface>) => migration.up(context),
        down: ({ context }: MigrationParams<QueryInterface>) => migration.down(context),
    };
});

const storage = new SequelizeStorage({
    sequelize,
    timestamps: true,
    tableName: 'Migrations',
});

export function createMigrator() {
    return new Umzug({
        migrations,
        context: sequelize.getQueryInterface(),
        storage,
        logger: console,
    });
}

export async function runMigrations(direction: 'up' | 'down'): Promise<void> {
    await sequelize.transaction(async () => {
        const migrator = createMigrator();
        const executed = await storage.executed();
        const missing = executed.filter((name) => !migrations.some((migration) => migration.name === name));
        if (missing.length > 0) {
            throw new Error(`Restore the source definitions for applied migrations: ${missing.join(', ')}`);
        }
        if (direction === 'up') {
            await migrator.up();
        } else {
            await migrator.down();
        }
    });
}
