import { createParamDecorator, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { AuthenticationRequest } from '../interfaces';
import { getAuthenticatedUser, getBearerToken } from '../logic';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticationRequest>();
    return getAuthenticatedUser(request);
});

export const BearerToken = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticationRequest>();
    const token = getBearerToken(request);
    if (!token) {
        throw new UnauthorizedException('A bearer token is required.');
    }
    return token;
});
