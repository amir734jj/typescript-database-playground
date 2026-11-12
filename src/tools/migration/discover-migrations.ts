import { readdir } from 'node:fs/promises';
import _ from 'lodash';
import { isMigration, type VersionedMigration } from './migration.js';

export async function discoverMigrations(): Promise<VersionedMigration[]> {
    const isSource = import.meta.url.endsWith('.ts');
    const directory = new URL('../../migrations/', import.meta.url);
    const suffix = isSource ? '.migration.ts' : '.migration.js';
    const files = (await readdir(directory, { withFileTypes: true }))
        .filter((file) => file.isFile() && file.name.endsWith(suffix));
    const migrations = (await Promise.all(files.map(async (file) => {
        const exports: Record<string, unknown> = await import(new URL(file.name, directory).href);
        const definitions = Object.values(exports).filter(isMigration);
        if (definitions.length === 0) {
            throw new Error(`No exported @Migration class found in ${file.name}.`);
        }
        return definitions;
    }))).flat();

    const versions = new Set<number>();
    const names = new Set<string>();
    migrations.forEach((migration) => {
        if (versions.has(migration.migrationVersion)) {
            throw new Error(`Duplicate migration version: ${migration.migrationVersion}.`);
        }
        if (names.has(migration.migrationName)) {
            throw new Error(`Duplicate migration history name: ${migration.migrationName}.`);
        }
        versions.add(migration.migrationVersion);
        names.add(migration.migrationName);
    });

    return _.sortBy(migrations, 'migrationVersion');
}
