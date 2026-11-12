import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AccessTokenService, AuthService, ProjectService, RoleService, UserService } from '../services';
import { AdminGuard, JwtAuthenticationGuard, JwtStrategy } from '../guards';
import { AdminController, ApiNotFoundController, AuthController, HealthController, ProjectsController, UsersController } from '../controllers';
import { DatabaseModule } from './database.module.ts';

@Module({
    imports: [
        DatabaseModule,
        PassportModule.register({ session: false }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'wwwroot'),
            exclude: [
                '/swagger{/*path}',
                '/swagger-json{/*path}',
                '/swagger-yaml{/*path}',
            ],
        }),
    ],
    controllers: [
        HealthController,
        AuthController,
        UsersController,
        AdminController,
        ProjectsController,
        // Keep unmatched API paths from falling through to static files.
        ApiNotFoundController,
    ],
    providers: [
        AccessTokenService,
        AuthService,
        ProjectService,
        RoleService,
        UserService,
        JwtStrategy,
        JwtAuthenticationGuard,
        AdminGuard,
    ],
})
export class ApiModule {}
