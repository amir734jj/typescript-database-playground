import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { AccessToken } from './AccessToken.js';
import { Project } from './Project.js';
import { Role } from './Role.js';
import { UserRole } from './UserRole.js';

@Table({ tableName: 'users_table', timestamps: true, underscored: true })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @AllowNull(false)
    @Column(DataType.TEXT)
    declare name: string;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    declare age: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.TEXT)
    declare email: string;

    @AllowNull(true)
    @Column({ type: DataType.TEXT, field: 'password_hash' })
    declare passwordHash: string | null;

    @HasMany(() => Project)
    declare projects?: NonAttribute<Project[]>;

    @HasMany(() => AccessToken)
    declare accessTokens?: NonAttribute<AccessToken[]>;

    @BelongsToMany(() => Role, () => UserRole, 'userId', 'roleId')
    declare roles?: NonAttribute<Role[]>;
}
