import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { User } from './User.ts';

@Table({ tableName: 'projects', timestamps: true, underscored: true })
export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
    @Default(DataType.UUIDV4)
    @PrimaryKey
    @Column(DataType.UUID)
    declare id: CreationOptional<string>;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare name: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'user_id' })
    declare userId: string;

    @BelongsTo(() => User, { foreignKey: 'userId' })
    declare user?: NonAttribute<User>;
}
