import _ from 'lodash';
import type { QueryInterface } from 'sequelize';

interface MigrationDefinition {
    up(database: QueryInterface): Promise<void>;
    down(database: QueryInterface): Promise<void>;
}

type MigrationConstructor = new () => MigrationDefinition;

export type VersionedMigration = MigrationConstructor & {
    readonly migrationVersion: number;
    readonly migrationName: string;
};

export function Migration(version: number, name = String(version)) {
    if (!_.isSafeInteger(version) || version <= 0) {
        throw new Error('Migration versions must be positive safe integers, for example 20261111_001.');
    }
    if (_.isEmpty(_.trim(name))) {
        throw new Error('Migration history names must not be empty.');
    }

    return (target: MigrationConstructor): void => {
        Object.defineProperties(target, {
            migrationVersion: { value: version },
            migrationName: { value: name },
        });
    };
}

export function isMigration(value: unknown): value is VersionedMigration {
    if (!_.isFunction(value)) {
        return false;
    }

    const version: unknown = _.get(value, 'migrationVersion');
    const name: unknown = _.get(value, 'migrationName');
    const prototype: unknown = _.get(value, 'prototype');

    return _.isSafeInteger(version) && _.gt(version, 0)
        && typeof name === 'string' && !_.isEmpty(_.trim(name))
        && _.isObjectLike(prototype)
        && _.isFunction(_.get(prototype, 'up'))
        && _.isFunction(_.get(prototype, 'down'));
}
