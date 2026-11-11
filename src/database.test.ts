import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { after, test } from 'node:test';

process.env.DB_FILE_NAME = `database-test-${randomUUID()}.db`;

const { sequelize } = await import('./database.ts');
const { User } = await import('./entities/index.ts');
const { runMigrations } = await import('./tools/migration/migrate.ts');

after(async () => {
    await sequelize.close();
    await rm(sequelize.options.storage!, { force: true });
});

test('relative SQLite paths and implicit managed transactions work', async () => {
    await runMigrations('up');

    const failure = new Error('Roll back the user');
    await assert.rejects(
        sequelize.transaction(async () => {
            await User.create({ name: 'Rollback', age: 25, email: 'rollback@example.test' });
            throw failure;
        }),
        (error) => error === failure,
    );
    assert.equal(await User.count(), 0);

    await sequelize.transaction(async () => {
        await User.create({ name: 'Commit', age: 30, email: 'commit@example.test' });
    });
    assert.equal(await User.count(), 1);
});
