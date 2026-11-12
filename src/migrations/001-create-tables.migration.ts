import { DataTypes, type QueryInterface } from 'sequelize';
import { Migration } from '../tools/migration/migration.js';

@Migration(20261111_001, '00000001-initial_schema.cjs')
export class CreateTables {
    async up(database: QueryInterface): Promise<void> {
        await database.createTable('users_table', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.TEXT, allowNull: false },
            age: { type: DataTypes.INTEGER, allowNull: false },
            email: { type: DataTypes.TEXT, allowNull: false, unique: true },
            password_hash: { type: DataTypes.TEXT, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false },
            updated_at: { type: DataTypes.DATE, allowNull: false },
        });
        await database.createTable('projects', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.TEXT, allowNull: false },
            description: { type: DataTypes.TEXT, allowNull: true },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users_table', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            created_at: { type: DataTypes.DATE, allowNull: false },
            updated_at: { type: DataTypes.DATE, allowNull: false },
        });
        await database.createTable('access_tokens', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users_table', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            token_hash: { type: DataTypes.TEXT, allowNull: false, unique: true },
            expires_at: { type: DataTypes.DATE, allowNull: false },
            created_at: { type: DataTypes.DATE, allowNull: false },
            updated_at: { type: DataTypes.DATE, allowNull: false },
        });
        await database.addIndex('access_tokens', ['user_id', 'expires_at']);
        await database.createTable('roles', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.TEXT, allowNull: false, unique: true },
        });
        await database.createTable('user_roles', {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: { model: 'users_table', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            role_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: { model: 'roles', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
        });
        await database.bulkInsert('roles', [{ name: 'admin' }, { name: 'basic' }]);
    }

    async down(database: QueryInterface): Promise<void> {
        await database.dropTable('user_roles');
        await database.dropTable('access_tokens');
        await database.dropTable('projects');
        await database.dropTable('roles');
        await database.dropTable('users_table');
    }
}
