import type { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Role } from './Role.ts';
import { User } from './User.ts';

@Table({ tableName: 'user_roles', timestamps: false, underscored: true })
export class UserRole extends Model<InferAttributes<UserRole>, InferCreationAttributes<UserRole>> {
    @ForeignKey(() => User)
    @PrimaryKey
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    declare userId: number;

    @ForeignKey(() => Role)
    @PrimaryKey
    @Column({ type: DataType.INTEGER, field: 'role_id' })
    declare roleId: number;
}
