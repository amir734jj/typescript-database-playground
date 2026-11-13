import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { UniqueConstraintError } from 'sequelize';
import { logger } from '../tools/logger.ts';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    constructor(private readonly adapterHost: HttpAdapterHost) {}

    catch(error: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse();
        const adapter = this.adapterHost.httpAdapter;
        if (error instanceof UniqueConstraintError) {
            adapter.reply(response, { error: 'A record with the supplied unique value already exists.' }, 409);
            return;
        }
        if (error instanceof HttpException) {
            if (error.getStatus() >= 500) {
                logger.error({ err: error }, 'Unhandled API error');
            }
            adapter.reply(response, { error: error.message }, error.getStatus());
            return;
        }
        logger.error({ err: error }, 'Unhandled API error');
        adapter.reply(response, { error: 'Internal server error.' }, 500);
    }
}
