import { ExtractJwt } from 'passport-jwt';
import type { AuthenticationRequest } from '../interfaces/index.js';

const extractBearerToken = ExtractJwt.fromAuthHeaderAsBearerToken();

export function getBearerToken(request: Pick<AuthenticationRequest, 'headers'>): string | null {
    return extractBearerToken(request);
}
