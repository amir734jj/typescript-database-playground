import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import _ from 'lodash';
import { RoleService, UserService } from '../services';
import { JwtAuthenticationGuard } from '../guards';
import { UpdateUserRequest } from '../dtos';
import { CurrentUser } from '../decorators';
import type { AuthenticatedUser } from '../interfaces';
import { publicUser } from '../logic';

@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthenticationGuard)
@Controller('users')
export class UsersController {
    constructor(
        @Inject(UserService) private readonly users: UserService,
        @Inject(RoleService) private readonly roles: RoleService,
    ) {}

    @Get('me')
    @ApiOperation({ summary: 'Read own profile' })
    me(@CurrentUser() user: AuthenticatedUser) {
        return publicUser(user);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update own profile' })
    @ApiBody({ type: UpdateUserRequest })
    async update(
        @CurrentUser() currentUser: AuthenticatedUser,
        @Body() body: UpdateUserRequest,
    ) {
        const data = _.omitBy(_.pick(body, ['name', 'age', 'email']), _.isUndefined);
        if (_.isEmpty(data)) {
            throw new BadRequestException('Provide at least one of name, age, or email.');
        }
        const user = await this.users.update(currentUser.id, data);
        if (!user) {
            throw new NotFoundException('User not found.');
        }
        return publicUser(user);
    }

    @Delete('me')
    @HttpCode(204)
    @ApiOperation({ summary: 'Delete own account' })
    async delete(@CurrentUser() user: AuthenticatedUser) {
        await this.roles.deleteUser(user.id);
    }
}
