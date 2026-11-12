import { Body, Controller, HttpCode, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services';
import { JwtAuthenticationGuard } from '../guards';
import { LoginRequest, RegisterRequest } from '../dtos';
import { BearerToken, CurrentUser } from '../decorators';
import type { AuthenticatedUser } from '../interfaces';
import { publicUser } from '../logic';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly auth: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register an account' })
    @ApiBody({ type: RegisterRequest })
    async register(@Body() body: RegisterRequest) {
        return publicUser(await this.auth.register({
            name: body.name,
            age: body.age,
            email: body.email,
            password: body.password,
        }));
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Create a persisted JWT session' })
    @ApiBody({ type: LoginRequest })
    async login(@Body() body: LoginRequest) {
        return { ...await this.auth.login(body.email, body.password), tokenType: 'Bearer' };
    }

    @Post('logout')
    @HttpCode(204)
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Revoke the current token' })
    async logout(@BearerToken() token: string) {
        await this.auth.logout(token);
    }

    @Post('refresh')
    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Rotate the current JWT' })
    async refresh(@BearerToken() token: string, @CurrentUser() user: AuthenticatedUser) {
        const refreshed = await this.auth.refresh(token, user);
        return { ...refreshed, tokenType: 'Bearer' };
    }
}
