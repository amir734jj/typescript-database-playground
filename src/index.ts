import { rm } from 'node:fs/promises';
import { Op } from 'sequelize';
import { sequelize } from './database.ts';
import { seedData } from './seed-data.ts';
import { runMigrations } from './tools/migration/migrate.ts';
import { Project, User } from './entities';

console.time('Database run');
try {
    await runMigrations('up');
    await seedData();
    console.log('Database is ready; pending schema migrations have been applied.');
    const users = await User.findAll({
        include: [{ model: Project, include: [User] }],
        where: {
            name: { [Op.ne]: 'Amir' },
            age: { [Op.gt]: 18 }
        },
    });
    // console.dir(users.map((user) => user.toJSON()), { depth: null });
} finally {
    try {
        await sequelize.close();
        const databaseFile = sequelize.options.storage;
        if (databaseFile) {
            await rm(databaseFile, { force: true });
        }
    } finally {
        console.timeEnd('Database run');
    }
}