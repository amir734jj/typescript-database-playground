import { DataTypes, type QueryInterface } from 'sequelize';
import { Migration } from '../tools/migration/migration.ts';

@Migration(20261111_002, '00000002-add_project_description.cjs')
export class AddProjectDescription {
    async up(database: QueryInterface): Promise<void> {
        await database.addColumn('projects', 'description', {
            type: DataTypes.TEXT,
            allowNull: true,
        });
    }

    async down(database: QueryInterface): Promise<void> {
        await database.removeColumn('projects', 'description');
    }
}
