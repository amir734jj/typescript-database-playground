import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CreateProjectRequest, ProjectResponse } from "../api/generated";
import { projectSchema } from "../validation";
import { FieldError, FormField } from "./form-validation";

interface ProjectsProps {
  projects: ProjectResponse[];
  userId?: string;
  offset: number;
  pageSize: number;
  onReload: () => void;
  onPage: (offset: number) => void;
  onDelete: (project: ProjectResponse) => void;
}

export function Projects({
  projects,
  userId,
  offset,
  pageSize,
  onReload,
  onPage,
  onDelete,
}: ProjectsProps) {
  return (
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 class="h5 mb-1">Public projects</h2>
            <p class="text-body-secondary small mb-0">
              Everyone can browse. Only owners can edit or delete.
            </p>
          </div>
          <div class="d-flex gap-2">
            {userId && (
              <a href="/projects/new" class="btn btn-primary btn-sm">
                New project
              </a>
            )}
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              onClick={onReload}
            >
              Reload projects
            </button>
          </div>
        </div>
        {projects.length === 0 ? (
          <p class="alert alert-light border">No projects on this page.</p>
        ) : (
          <div class="table-responsive">
            <table class="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td class="text-break">{project.name}</td>
                    <td class="text-break">
                      {project.description || "No description"}
                    </td>
                    <td>
                      {project.userId === userId ? (
                        <span class="badge text-bg-primary">You</span>
                      ) : (
                        <span class="text-body-secondary">Another user</span>
                      )}
                    </td>
                    <td>
                      {project.userId === userId ? (
                        <div class="d-flex gap-2">
                          <a
                            href={`/projects/${project.id}/edit`}
                            class="btn btn-outline-primary btn-sm"
                            aria-label={`Edit ${project.name}`}
                          >
                            Edit
                          </a>
                          <button
                            type="button"
                            class="btn btn-outline-danger btn-sm"
                            aria-label={`Delete ${project.name}`}
                            onClick={() => onDelete(project)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span class="text-body-secondary">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <nav
          class="d-flex flex-wrap justify-content-between align-items-center gap-2"
          aria-label="Project pages"
        >
          <span class="small text-body-secondary">
            Page {Math.floor(offset / pageSize) + 1} - {projects.length}{" "}
            projects
          </span>
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              disabled={offset === 0}
              onClick={() => onPage(Math.max(0, offset - pageSize))}
            >
              Previous
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              disabled={projects.length < pageSize}
              onClick={() => onPage(offset + pageSize)}
            >
              Next
            </button>
          </div>
        </nav>
        {!userId && (
          <p class="text-body-secondary small mt-3 mb-0">
            <a href="/login">Sign in</a> to create a project.
          </p>
        )}
      </div>
    </div>
  );
}

export function ProjectForm({
  project,
  onSave,
}: {
  project: ProjectResponse | null;
  onSave: (data: CreateProjectRequest) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSave)}>
      <FormField
        id="project-name"
        label="Project name"
        registration={register("name")}
        error={errors.name?.message}
        required
      />
      <div class="mb-3">
        <label class="form-label" for="project-description">
          Description
        </label>
        <textarea
          id="project-description"
          class={`form-control ${errors.description ? "is-invalid" : ""}`}
          {...register("description")}
          rows={3}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "project-description-error" : undefined
          }
        />
        <FieldError
          id="project-description-error"
          message={errors.description?.message}
        />
      </div>
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">
          {project ? "Save project" : "Create project"}
        </button>
        <a href="/projects" class="btn btn-outline-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
}
