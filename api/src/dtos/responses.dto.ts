import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
    @ApiProperty({ type: String, format: 'uuid' })
    id!: string;

    @ApiProperty({ type: String })
    name!: string;

    @ApiProperty({ type: 'integer' })
    age!: number;

    @ApiProperty({ type: String, format: 'email' })
    email!: string;

    @ApiProperty({ type: [String] })
    roles!: string[];
}

export class TokenResponse {
    @ApiProperty({ type: String })
    accessToken!: string;

    @ApiProperty({ type: String, format: 'date-time' })
    expiresAt!: string;

    @ApiProperty({ type: String, enum: ['Bearer'] })
    tokenType!: 'Bearer';
}

export class ProjectResponse {
    @ApiProperty({ type: String, format: 'uuid' })
    id!: string;

    @ApiProperty({ type: String })
    name!: string;

    @ApiProperty({ type: String, nullable: true })
    description!: string | null;

    @ApiProperty({ type: String, format: 'uuid' })
    userId!: string;
}
