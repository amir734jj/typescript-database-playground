import { Transform } from 'class-transformer';
import _ from 'lodash';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Max,
    MaxLength,
    Min,
    MinLength,
    Validate,
    ValidateIf,
} from 'class-validator';
import { UserRoleName } from '../enums';
import { PasswordByteLength } from '../validators';

const trim = ({ value }: { value: unknown }) => (_.isString(value) ? value.trim() : value);
const normalizeEmail = ({ value }: { value: unknown }) => (
    _.isString(value) ? value.trim().toLowerCase() : value
);
const parseQueryInteger = ({ value }: { value: unknown }) => (
    _.isString(value) && /^\d+$/.test(value) ? _.toNumber(value) : value
);

export class RegisterRequest {
    @ApiProperty({ type: String, minLength: 1, maxLength: 100 })
    @Transform(trim)
    @IsString()
    @Length(1, 100)
    name!: string;

    @ApiProperty({ type: 'integer', minimum: 0, maximum: 130 })
    @IsInt()
    @Min(0)
    @Max(130)
    age!: number;

    @ApiProperty({ type: String, format: 'email', maxLength: 254 })
    @Transform(normalizeEmail)
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @ApiProperty({ type: String, format: 'password', minLength: 12, maxLength: 72 })
    @IsString()
    @MinLength(12)
    @MaxLength(72)
    @Validate(PasswordByteLength)
    password!: string;
}

export class LoginRequest {
    @ApiProperty({ type: String, format: 'email', maxLength: 254 })
    @Transform(normalizeEmail)
    @IsEmail()
    @MaxLength(254)
    email!: string;

    @ApiProperty({ type: String, format: 'password', minLength: 12, maxLength: 72 })
    @IsString()
    @MinLength(12)
    @MaxLength(72)
    @Validate(PasswordByteLength)
    password!: string;
}

export class UpdateUserRequest {
    @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 100 })
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(trim)
    @IsString()
    @Length(1, 100)
    name?: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 0, maximum: 130 })
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(0)
    @Max(130)
    age?: number;

    @ApiPropertyOptional({ type: String, format: 'email', maxLength: 254 })
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(normalizeEmail)
    @IsEmail()
    @MaxLength(254)
    email?: string;
}

export class ListProjectsRequest {
    @ApiPropertyOptional({ type: 'integer', minimum: 0, maximum: Number.MAX_SAFE_INTEGER, default: 0 })
    @Transform(parseQueryInteger)
    @IsInt()
    @Min(0)
    @Max(Number.MAX_SAFE_INTEGER)
    skip = 0;

    @ApiPropertyOptional({ type: 'integer', minimum: 1, maximum: 100, default: 50 })
    @Transform(parseQueryInteger)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 50;
}

export class CreateProjectRequest {
    @ApiProperty({ type: String, minLength: 1, maxLength: 200 })
    @Transform(trim)
    @IsString()
    @Length(1, 200)
    name!: string;

    @ApiPropertyOptional({ type: String, maxLength: 2000, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string | null;
}

export class UpdateProjectRequest {
    @ApiPropertyOptional({ type: String, minLength: 1, maxLength: 200 })
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(trim)
    @IsString()
    @Length(1, 200)
    name?: string;

    @ApiPropertyOptional({ type: String, maxLength: 2000, nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string | null;
}

export class UpdateRoleRequest {
    @ApiProperty({ enum: UserRoleName })
    @IsIn([UserRoleName.ADMIN, UserRoleName.BASIC])
    role!: UserRoleName;
}
