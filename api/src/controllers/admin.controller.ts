import { Body, Controller, Get, Inject, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RoleService } from '../services';
import { AdminGuard, JwtAuthenticationGuard } from '../guards';
import { UpdateRoleRequest, UserResponse } from '../dtos';
import { publicUser, routeId } from '../logic';

@ApiTags('Administration')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthenticationGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(@Inject(RoleService) private readonly roles: RoleService) {}

    @Get('users')
    @ApiOperation({ summary: 'List users (admin only)' })
    @ApiOkResponse({ type: UserResponse, isArray: true })
    async listUsers() {
        return (await this.roles.listUsers()).map(publicUser);
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Assign admin or basic role (admin only)' })
    @ApiParam({ name: 'id', type: String, format: 'uuid' })
    @ApiBody({ type: UpdateRoleRequest })
    @ApiOkResponse({ type: UserResponse })
    async setRole(@Param('id') id: string, @Body() body: UpdateRoleRequest) {
        return publicUser(await this.roles.setRole(routeId(id), body.role));
    }
}
