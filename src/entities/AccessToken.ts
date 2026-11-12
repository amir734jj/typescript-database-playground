import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.ts';

@Table({ tableName: 'access_tokens', timestamps: true, underscored: true })
export class AccessToken extends Model<
    InferAttributes<AccessToken>,
    InferCreationAttributes<AccessToken>
> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare id: CreationOptional<number>;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: 'user_id' })
    declare userId: number;

    @Unique
    @AllowNull(false)
    @Column({ type: DataType.TEXT, field: 'token_hash' })
    declare tokenHash: string;

    @AllowNull(false)
    @Column({ type: DataType.DATE, field: 'expires_at' })
    declare expiresAt: Date;

    @BelongsTo(() => User, { foreignKey: 'userId' })
    declare user?: NonAttribute<User>;
}
