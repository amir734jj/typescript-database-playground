import { Op } from 'sequelize';
import { Injectable } from '@nestjs/common';
import { Project } from '../entities/Project.ts';

@Injectable()
export class ProjectService {
    listPublic(afterId: number, limit: number): Promise<Project[]> {
        return Project.findAll({
            where: { id: { [Op.gt]: afterId } },
            order: [['id', 'ASC']],
            limit,
        });
    }

    findOwned(id: number, userId: number): Promise<Project | null> {
        return Project.findOne({ where: { id, userId } });
    }

    create(data: { name: string; description: string | null; userId: number }): Promise<Project> {
        return Project.create(data);
    }

    async updateOwned(
        id: number,
        userId: number,
        data: { name?: string; description?: string | null },
    ): Promise<Project | null> {
        const project = await this.findOwned(id, userId);
        if (!project) {
            return null;
        }
        await project.update(data);
        return project;
    }

    async deleteOwned(id: number, userId: number): Promise<boolean> {
        return (await Project.destroy({ where: { id, userId } })) > 0;
    }
}
