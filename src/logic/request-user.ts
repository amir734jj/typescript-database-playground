import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser, AuthenticationRequest } from '../interfaces/index.js';

export function getAuthenticatedUser(request: Pick<AuthenticationRequest, 'user'>): AuthenticatedUser {
    const { user } = request;
    if (!user) {
        throw new UnauthorizedException('Authentication is required.');
    }
    return user;
}
