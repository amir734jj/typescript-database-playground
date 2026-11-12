import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { Op, Transaction } from 'sequelize';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import type { AuthenticatedUser } from '../interfaces';
import { User } from '../entities';
import { AccessTokenService } from './access-token.service.ts';
import { RoleService } from './role.service.ts';
import { UserService } from './user.service.ts';

const tokenLifetimeSeconds = 60 * 60;

export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
        throw new Error('Set JWT_SECRET to a random secret of at least 32 bytes.');
    }
    return secret;
}

export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(Sequelize) private readonly sequelize: Sequelize,
        @Inject(UserService) private readonly users: UserService,
        @Inject(AccessTokenService) private readonly tokens: AccessTokenService,
        @Inject(RoleService) private readonly roles: RoleService,
    ) {}

    async register(
        data: { name: string; age: number; email: string; password: string },
    ): Promise<User> {
        const { password, ...profile } = data;
        const passwordHash = await bcrypt.hash(password, 12);
        return this.sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE }, async () => {
            if (await this.users.findByEmail(data.email)) {
                throw new ConflictException('An account with this email already exists.');
            }
            const isFirstUser = await User.count({
                where: { passwordHash: { [Op.not]: null } },
            }) === 0;
            const user = await this.users.create({ ...profile, passwordHash });
            await this.roles.assignInitialRoles(user.id, isFirstUser);
            const registeredUser = await this.users.findById(user.id);
            if (!registeredUser) {
                throw new Error('Registered user could not be reloaded.');
            }
            return registeredUser;
        });
    }

    async login(
        email: string,
        password: string,
    ): Promise<{ accessToken: string; expiresAt: Date }> {
        const user = await this.users.findByEmail(email);
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid email or password.');
        }
        return this.issueToken(user);
    }

    async authenticate(token: string, subject: unknown): Promise<User | null> {
        if (!_.isString(subject) && !_.isNumber(subject)) {
            return null;
        }
        const userId = _.toNumber(subject);
        if (!_.isSafeInteger(userId) || userId < 1) {
            return null;
        }
        const storedToken = await this.tokens.findValid(hashToken(token), userId);
        return storedToken ? this.users.findById(userId) : null;
    }

    async logout(token: string): Promise<void> {
        await this.tokens.revoke(hashToken(token));
    }

    async refresh(
        token: string,
        user: Pick<AuthenticatedUser, 'id'>,
    ): Promise<{ accessToken: string; expiresAt: Date }> {
        const refreshed = await this.issueToken(user);
        await this.tokens.revoke(hashToken(token));
        return refreshed;
    }

    private async issueToken(user: Pick<User, 'id'>): Promise<{ accessToken: string; expiresAt: Date }> {
        const accessToken = jwt.sign({ sub: String(user.id) }, getJwtSecret(), {
            expiresIn: tokenLifetimeSeconds,
            jwtid: randomUUID(),
        });
        const payload = jwt.decode(accessToken) as JwtPayload;
        if (!_.isNumber(payload.exp)) {
            throw new Error('JWT expiration was not generated.');
        }
        const expiresAt = DateTime.fromSeconds(payload.exp, { zone: 'utc' }).toJSDate();
        await this.tokens.create({
            userId: user.id,
            tokenHash: hashToken(accessToken),
            expiresAt,
        });
        return { accessToken, expiresAt };
    }
}
