import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, BelongsToMany, Column, DataType, Default, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.ts';
import { UserRole } from './UserRole.ts';

@Table({ tableName: 'roles', timestamps: false, underscored: true })
export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
    @Default(DataType.UUIDV4)
    @PrimaryKey
    @Column(DataType.UUID)
    declare id: CreationOptional<string>;

    @Unique
    @AllowNull(false)
    @Column(DataType.TEXT)
    declare name: string;

    @BelongsToMany(() => User, () => UserRole, 'roleId', 'userId')
    declare users?: NonAttribute<User[]>;
}
