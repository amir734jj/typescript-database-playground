import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, BelongsToMany, Column, DataType, Default, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { AccessToken } from './AccessToken.ts';
import { Project } from './Project.ts';
import { Role } from './Role.ts';
import { UserRole } from './UserRole.ts';

@Table({ tableName: 'users_table', timestamps: true, underscored: true })
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Default(DataType.UUIDV4)
    @PrimaryKey
    @Column(DataType.UUID)
    declare id: CreationOptional<string>;

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
