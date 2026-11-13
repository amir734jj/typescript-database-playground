import {
  projectsControllerCreate,
  projectsControllerDelete,
  projectsControllerFind,
  projectsControllerList,
  projectsControllerUpdate,
} from "../api/generated.ts";
import type {
  CreateProjectRequest,
  ProjectResponse,
} from "../api/generated.ts";

export const pageSize = 20;

export function fetchProjects(skip: number, signal?: AbortSignal) {
  return projectsControllerList({ skip, limit: pageSize }, { signal });
}

export function getProject(id: string, signal?: AbortSignal) {
  return projectsControllerFind(id, { signal });
}

export function saveProject(
  data: CreateProjectRequest,
  id?: string,
  signal?: AbortSignal,
) {
  return id
    ? projectsControllerUpdate(id, data, { signal })
    : projectsControllerCreate(data, { signal });
}

export function deleteProject(project: ProjectResponse, signal?: AbortSignal) {
  return projectsControllerDelete(project.id, { signal });
}
