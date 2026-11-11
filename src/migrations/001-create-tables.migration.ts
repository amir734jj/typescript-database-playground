import { DataTypes, type QueryInterface } from 'sequelize';
import { Migration } from '../tools/migration/migration.ts';

@Migration(20261111_001, '00000001-create_tables.cjs')
export class CreateTables {
    async up(database: QueryInterface): Promise<void> {
        await database.createTable('users_table', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.TEXT, allowNull: false },
            age: { type: DataTypes.INTEGER, allowNull: false },
            email: { type: DataTypes.TEXT, allowNull: false, unique: true },
        });
        await database.createTable('projects', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.TEXT, allowNull: false },
        });
    }

    async down(database: QueryInterface): Promise<void> {
        await database.dropTable('projects');
        await database.dropTable('users_table');
    }
}
