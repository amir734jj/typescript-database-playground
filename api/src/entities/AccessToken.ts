import type { CreationOptional, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript';
import { User } from './User.ts';

@Table({ tableName: 'access_tokens', timestamps: true, underscored: true })
export class AccessToken extends Model<
    InferAttributes<AccessToken>,
    InferCreationAttributes<AccessToken>
> {
    @Default(DataType.UUIDV4)
    @PrimaryKey
    @Column(DataType.UUID)
    declare id: CreationOptional<string>;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({ type: DataType.UUID, field: 'user_id' })
    declare userId: string;

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
