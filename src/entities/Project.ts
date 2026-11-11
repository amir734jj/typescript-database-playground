import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './User.ts';

@Table({ tableName: 'projects', timestamps: false })
export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare name: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    declare userId: number;

    @BelongsTo(() => User, { foreignKey: 'userId' })
    declare user?: NonAttribute<User>;
}
