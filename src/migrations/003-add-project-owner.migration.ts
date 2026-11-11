import { DataTypes, type QueryInterface } from 'sequelize';
import { Migration } from '../tools/migration/migration.ts';

@Migration(20261111_003, '00000003-add_project_owner.cjs')
export class AddProjectOwner {
    async up(database: QueryInterface): Promise<void> {
        await database.addColumn('projects', 'user_id', {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users_table', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    }

    async down(database: QueryInterface): Promise<void> {
        await database.removeColumn('projects', 'user_id');
    }
}
