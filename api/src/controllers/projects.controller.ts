import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProjectService } from '../services';
import { JwtAuthenticationGuard } from '../guards';
import { CreateProjectRequest, ListProjectsRequest, ProjectResponse, UpdateProjectRequest } from '../dtos';
import { CurrentUser } from '../decorators';
import type { AuthenticatedUser } from '../interfaces';
import { publicProject, routeId } from '../logic';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
    constructor(@Inject(ProjectService) private readonly projects: ProjectService) {}

    @Get()
    @ApiOperation({ summary: 'List all public projects' })
    @ApiOkResponse({ type: ProjectResponse, isArray: true })
    async list(@Query() { skip, limit }: ListProjectsRequest) {
        return (await this.projects.listPublic(skip, limit)).map(publicProject);
    }

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({ summary: 'Create a project' })
    @ApiBody({ type: CreateProjectRequest })
    @ApiCreatedResponse({ type: ProjectResponse })
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
    @ApiParam({ name: 'id', type: String, format: 'uuid' })
    @ApiOkResponse({ type: ProjectResponse })
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
    @ApiParam({ name: 'id', type: String, format: 'uuid' })
    @ApiBody({ type: UpdateProjectRequest })
    @ApiOkResponse({ type: ProjectResponse })
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
    @ApiParam({ name: 'id', type: String, format: 'uuid' })
    @ApiNoContentResponse()
    async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
        if (!(await this.projects.deleteOwned(routeId(id), user.id))) {
            throw new NotFoundException('Project not found.');
        }
    }
}
