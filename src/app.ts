import 'reflect-metadata';
import 'dotenv/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { pinoHttp } from 'pino-http';
import { Sequelize } from 'sequelize-typescript';
import { ApiModule } from './modules';
import { ApiExceptionFilter, setupOpenApi } from './logic';
import { getJwtSecret } from './services';
import { BodyValidationPipe } from './pipes';
import { logger } from './tools/logger.ts';
import { runMigrations } from './tools/migration/migrate.ts';

getJwtSecret();

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
}

let app: NestExpressApplication | undefined;
try {
    app = await NestFactory.create<NestExpressApplication>(
        ApiModule,
        { logger: ['error'], abortOnError: false },
    );
    app.setGlobalPrefix('api');
    app.getHttpAdapter().getInstance().disable('x-powered-by');
    app.use(pinoHttp({
        logger,
        serializers: {
            req: (request) => ({
                ...request,
                url: request.url?.split('?')[0],
            }),
        },
    }));
    app.useBodyParser('json', { limit: '1mb' });
    app.useGlobalFilters(new ApiExceptionFilter(app.get(HttpAdapterHost)));
    app.useGlobalPipes(new BodyValidationPipe());

    if (process.env.NODE_ENV !== 'production') {
        setupOpenApi(app);
    }

    await runMigrations('up', app.get(Sequelize));
    await app.listen(port);
    app.enableShutdownHooks(['SIGINT', 'SIGTERM'], { useProcessExit: true });
} catch (error) {
    await app?.close();
    throw error;
}
logger.info({ port }, 'API server listening');
