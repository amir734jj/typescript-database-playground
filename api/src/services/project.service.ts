import { Injectable } from '@nestjs/common';
import { Project } from '../entities';

@Injectable()
export class ProjectService {
    listPublic(skip: number, limit: number): Promise<Project[]> {
        return Project.findAll({
            order: [['id', 'ASC']],
            offset: skip,
            limit,
        });
    }

    findOwned(id: string, userId: string): Promise<Project | null> {
        return Project.findOne({ where: { id, userId } });
    }

    create(data: { name: string; description: string | null; userId: string }): Promise<Project> {
        return Project.create(data);
    }

    async updateOwned(
        id: string,
        userId: string,
        data: { name?: string; description?: string | null },
    ): Promise<Project | null> {
        const project = await this.findOwned(id, userId);
        if (!project) {
            return null;
        }
        await project.update(data);
        return project;
    }

    async deleteOwned(id: string, userId: string): Promise<boolean> {
        return (await Project.destroy({ where: { id, userId } })) > 0;
    }
}
