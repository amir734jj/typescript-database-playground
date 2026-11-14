import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { createDatabase } from '../database.ts';
import { logger } from '../tools/logger.ts';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [{
        provide: Sequelize,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => createDatabase(configService.get<string>('DATABASE_URL')),
    }],
    exports: [Sequelize],
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(@Inject(Sequelize) private readonly connection: Sequelize) {}

    async onApplicationShutdown(signal?: string): Promise<void> {
        if (signal) {
            logger.info({ signal }, 'Shutting down API server');
        }
        try {
            await this.connection.close();
        } catch (error) {
            logger.error({ err: error }, 'Failed to close database during shutdown');
            throw error;
        }
    }
}
