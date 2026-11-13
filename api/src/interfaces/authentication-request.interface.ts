import type { IncomingHttpHeaders } from 'node:http';
import type { AuthenticatedUser } from './authenticated-user.interface.ts';

export interface AuthenticationRequest {
    headers: IncomingHttpHeaders;
    user?: AuthenticatedUser;
}
