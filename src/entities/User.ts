import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { Project } from './Project.ts';

@Table({ tableName: 'users_table', timestamps: false })
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

    @HasMany(() => Project)
    declare projects?: NonAttribute<Project[]>;
}
