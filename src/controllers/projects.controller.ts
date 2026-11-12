import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectService } from '../services/index.js';
import { JwtAuthenticationGuard } from '../guards/index.js';
import { CreateProjectRequest, UpdateProjectRequest } from '../dtos/index.js';
import { CurrentUser } from '../decorators/index.js';
import type { AuthenticatedUser } from '../interfaces/index.js';
import { publicProject, routeId } from '../logic/index.js';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
    constructor(@Inject(ProjectService) private readonly projects: ProjectService) {}

    @Get()
    @ApiOperation({ summary: 'List all public projects' })
    @ApiQuery({ name: 'afterId', required: false, schema: { type: 'integer', minimum: 0 } })
    @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 } })
    async list(@Query('afterId') afterIdValue: unknown, @Query('limit') limitValue: unknown) {
        const afterId = afterIdValue === undefined ? 0 : routeId(String(afterIdValue));
        const limit = limitValue === undefined ? 50 : Number(limitValue);
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
            throw new BadRequestException('limit must be an integer between 1 and 100.');
        }
        return (await this.projects.listPublic(afterId, limit)).map(publicProject);
    }

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Create a project' })
    @ApiBody({ type: CreateProjectRequest })
    async create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: CreateProjectRequest,
    ) {
        return publicProject(await this.projects.create({
            name: body.name,
            description: body.description ?? null,
            userId: user.id,
        }));
    }

    @Get(':id')
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Read an owned project' })
    @ApiParam({ name: 'id', type: Number })
    async find(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
        const project = await this.projects.findOwned(routeId(id), user.id);
        if (!project) {
            throw new NotFoundException('Project not found.');
        }
        return publicProject(project);
    }

    @Patch(':id')
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Update an owned project' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateProjectRequest })
    async update(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() body: UpdateProjectRequest,
    ) {
        if (body.name === undefined && body.description === undefined) {
            throw new BadRequestException('Provide at least one of name or description.');
        }
        const project = await this.projects.updateOwned(routeId(id), user.id, {
            ...(body.name === undefined ? {} : { name: body.name }),
            ...(body.description === undefined ? {} : { description: body.description }),
        });
        if (!project) {
            throw new NotFoundException('Project not found.');
        }
        return publicProject(project);
    }

    @Delete(':id')
    @HttpCode(204)
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Delete an owned project' })
    @ApiParam({ name: 'id', type: Number })
    async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
        if (!(await this.projects.deleteOwned(routeId(id), user.id))) {
            throw new NotFoundException('Project not found.');
        }
    }
}
