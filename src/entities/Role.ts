import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsToMany, Column, DataType, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.ts';
import { UserRole } from './UserRole.ts';

@Table({ tableName: 'roles', timestamps: false, underscored: true })
export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @Unique
    @AllowNull(false)
    @Column(DataType.TEXT)
    declare name: string;

    @BelongsToMany(() => User, () => UserRole, 'roleId', 'userId')
    declare users?: NonAttribute<User[]>;
}
