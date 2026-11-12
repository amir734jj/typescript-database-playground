import type { Project } from '../entities/Project.ts';
import type { AuthenticatedUser } from '../interfaces';

export function publicUser(user: AuthenticatedUser) {
    return {
        id: user.id,
        name: user.name,
        age: user.age,
        email: user.email,
        roles: user.roles?.map((role) => role.name) ?? [],
    };
}

export function publicProject(project: Project) {
    return {
        id: project.id,
        name: project.name,
        description: project.description,
        userId: project.userId,
    };
}
