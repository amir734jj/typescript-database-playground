import { ForbiddenException, Inject, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import jwtStrategy from 'passport-jwt';
import { getJwtSecret, AuthService, RoleService } from '../services/index.js';
import { UserRoleName } from '../enums/index.js';
import type { AuthenticationRequest } from '../interfaces/index.js';
import { getAuthenticatedUser, getBearerToken } from '../logic/index.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(jwtStrategy.Strategy) {
    constructor(@Inject(AuthService) private readonly auth: AuthService) {
        super({
            jwtFromRequest: getBearerToken,
            secretOrKey: getJwtSecret(),
            algorithms: ['HS256'],
            passReqToCallback: true,
        });
    }

    async validate(request: AuthenticationRequest, payload: { sub?: string | number }) {
        const token = getBearerToken(request);
        const user = token ? await this.auth.authenticate(token, payload.sub) : null;
        if (!user) {
            throw new UnauthorizedException('Authentication is required.');
        }
        return user;
    }
}

@Injectable()
export class JwtAuthenticationGuard extends AuthGuard('jwt') {}

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(@Inject(RoleService) private readonly roles: RoleService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticationRequest>();
        if (!(await this.roles.hasRole(getAuthenticatedUser(request).id, UserRoleName.ADMIN))) {
            throw new ForbiddenException('Administrator role required.');
        }
        return true;
    }
}
