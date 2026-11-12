import { sequelize } from '../../cli-database.js';
import { runMigrations } from './migrate.js';

try {
    const direction = process.argv[2];
    if (direction !== 'up' && direction !== 'down') {
        throw new Error('Specify a migration direction: up or down.');
    }
    await runMigrations(direction, sequelize);
} finally {
    await sequelize.close();
}
