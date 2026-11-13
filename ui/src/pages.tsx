import { DateTime } from "luxon";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "preact/hooks";
import { useLocation } from "preact-iso";
import type { ProjectResponse, UserResponse } from "./api/generated";
import { AuthForm, ProfileForm } from "./components/account";
import { ProjectForm, Projects } from "./components/projects";
import { RequestStatus } from "./components/request-status";
import { useRequest } from "./hooks/use-request";
import * as authService from "./services/auth";
import * as projectService from "./services/projects";
import * as userService from "./services/users";
import { selectIsAdmin, useAuthStore } from "./state/auth";

function SignInRequired() {
  return (
    <section class="alert alert-info">
      <h2 class="h5">Sign in required</h2>
      <p class="mb-0">
        <a href="/login" class="alert-link">
          Sign in
        </a>{" "}
        or{" "}
        <a href="/register" class="alert-link">
          register
        </a>{" "}
        to access this page.
      </p>
    </section>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const request = useRequest();
  const { runRequest } = request;
  const userId = useAuthStore((state) => state.session?.user?.id);
  const loadProjects = useCallback(
    (skip: number) =>
      runRequest(async (signal) => {
        const projects = await projectService.fetchProjects(skip, signal);
        setProjects(projects);
        setOffset(skip);
      }),
    [runRequest],
  );

  useEffect(() => {
    void loadProjects(0);
  }, [loadProjects]);

  return (
    <section aria-label="Projects">
      <RequestStatus {...request} />
      <fieldset disabled={request.busy} class="border-0 p-0 m-0">
        <legend class="visually-hidden">Project actions</legend>
        <Projects
          projects={projects}
          userId={userId}
          offset={offset}
          pageSize={projectService.pageSize}
          onReload={() => void loadProjects(offset)}
          onPage={(skip) => void loadProjects(skip)}
          onDelete={(project) => {
            if (
              window.confirm(`Delete "${project.name}"? This cannot be undone.`)
            ) {
              void runRequest(async (signal) => {
                await projectService.deleteProject(project, signal);
                const skip =
                  projects.length === 1
                    ? Math.max(0, offset - projectService.pageSize)
                    : offset;
                const remaining = await projectService.fetchProjects(
                  skip,
                  signal,
                );
                setProjects(remaining);
                setOffset(skip);
              }, "Project deleted.");
            }
          }}
        />
      </fieldset>
    </section>
  );
}

export function ProjectEditorPage({ id }: { id?: string }) {
  const { route } = useLocation();
  const editorRequest = useRef<AbortController | null>(null);
  const userId = useAuthStore((state) => state.session?.user?.id);
  const [editing, setEditing] = useState<ProjectResponse | null>(null);
  const request = useRequest();
  const { error, runRequest } = request;

  // Initialize cancellation before the form can be submitted.
  useLayoutEffect(() => {
    const controller = new AbortController();
    editorRequest.current = controller;
    setEditing(null);
    if (id && userId) {
      void runRequest(async () => {
        const project = await projectService.getProject(id, controller.signal);
        setEditing(project);
      });
    }
    return () => {
      controller.abort();
    };
  }, [id, userId, runRequest]);

  if (!userId) return <SignInRequired />;

  return (
    <section class="card" aria-label={id ? "Edit project" : "New project"}>
      <div class="card-body">
        <h2 class="h5 card-title">{id ? "Edit project" : "New project"}</h2>
        <RequestStatus {...request} />
        <fieldset disabled={request.busy} class="border-0 p-0 m-0">
          <legend class="visually-hidden">Project editor</legend>
          {id && editing?.id !== id ? (
            <>
              <p>
                {error ? "Project could not be loaded." : "Loading project..."}
              </p>
              <a href="/projects">Back to projects</a>
            </>
          ) : (
            <ProjectForm
              key={id ?? "new"}
              project={id ? editing : null}
              onSave={async (data) => {
                const controller = editorRequest.current;
                const saved = await runRequest(async () => {
                  if (!controller)
                    throw new Error("Project editor is not ready.");
                  await projectService.saveProject(data, id, controller.signal);
                }, "Project saved.");
                if (saved && controller && !controller.signal.aborted) {
                  route("/projects");
                }
              }}
            />
          )}
        </fieldset>
      </div>
    </section>
  );
}

function AuthenticationPage({ registering }: { registering: boolean }) {
  const { route } = useLocation();
  const signedIn = useAuthStore((state) => state.session?.user != null);
  const request = useRequest();

  useEffect(() => {
    if (signedIn) route("/account", true);
  }, [signedIn, route]);

  if (signedIn) return <p role="status">Opening your account...</p>;

  return (
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <RequestStatus {...request} />
        <fieldset disabled={request.busy} class="border-0 p-0 m-0">
          <legend class="visually-hidden">Authentication</legend>
          <AuthForm
            registering={registering}
            onLogin={(data) =>
              void request.runRequest(
                (signal) => authService.signIn(data, signal),
                "Signed in.",
              )
            }
            onRegister={(data) =>
              void request.runRequest(
                (signal) => authService.register(data, signal),
                "Account created. You are signed in.",
              )
            }
          />
        </fieldset>
      </div>
    </div>
  );
}

export function LoginPage() {
  return <AuthenticationPage registering={false} />;
}

export function RegisterPage() {
  return <AuthenticationPage registering />;
}

export function AccountPage() {
  const { route } = useLocation();
  const request = useRequest();
  const session = useAuthStore((state) => state.session);
  if (!session?.user) return <SignInRequired />;

  return (
    <section class="row justify-content-center" aria-label="My account">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card">
          <div class="card-body">
            <h2 class="h5 card-title">My account</h2>
            <RequestStatus {...request} />
            <fieldset disabled={request.busy} class="border-0 p-0 m-0">
              <legend class="visually-hidden">Account actions</legend>
              <p class="d-flex flex-wrap gap-1">
                {session.user.roles.map((role) => (
                  <span class="badge text-bg-secondary" key={role}>
                    {role}
                  </span>
                ))}
              </p>
              <ProfileForm
                key={`${session.user.id}:${session.user.name}:${session.user.email}:${session.user.age}`}
                user={session.user}
                onSave={(data) =>
                  void request.runRequest(
                    (signal) => authService.saveProfile(data, signal),
                    "Profile saved.",
                  )
                }
              />
              <hr />
              <p class="small text-body-secondary">
                Session expires{" "}
                {DateTime.fromISO(session.token.expiresAt).toLocaleString(
                  DateTime.DATETIME_SHORT_WITH_SECONDS,
                )}
                . Your token is stored in this tab's session storage and
                survives page reloads.
              </p>
              <div class="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  onClick={() =>
                    void request.runRequest(
                      authService.refreshSession,
                      "Session refreshed.",
                    )
                  }
                >
                  Refresh session
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  onClick={() =>
                    void request.runRequest(async (signal) => {
                      await authService.signOut(signal);
                      route("/login");
                    }, "Signed out.")
                  }
                >
                  Sign out
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete your account? This cannot be undone.",
                      )
                    ) {
                      void request.runRequest(async (signal) => {
                        await authService.deleteAccount(signal);
                        route("/projects");
                      }, "Account deleted.");
                    }
                  }}
                >
                  Delete account
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const request = useRequest();
  const { runRequest } = request;
  const user = useAuthStore((state) => state.session?.user);
  const isAdmin = useAuthStore(selectIsAdmin);

  const loadUsers = useCallback(
    () =>
      runRequest(async (signal) => {
        setUsers(await userService.loadUsers(signal));
      }),
    [runRequest],
  );

  useEffect(() => {
    if (isAdmin) void loadUsers();
  }, [isAdmin, loadUsers]);

  if (!user) return <SignInRequired />;
  if (!isAdmin) {
    return (
      <section class="alert alert-warning" role="alert">
        Administrator access required.
      </section>
    );
  }

  return (
    <section class="card" aria-label="User management">
      <div class="card-body">
        <RequestStatus {...request} />
        <fieldset disabled={request.busy} class="border-0 p-0 m-0">
          <legend class="visually-hidden">User management actions</legend>
          <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0">User management</h2>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              onClick={() => void loadUsers()}
            >
              Reload users
            </button>
          </div>
          {users === null ? (
            <p class="text-body-secondary mb-0">
              Reload users to manage their roles.
            </p>
          ) : (
            <div class="table-responsive">
              <table class="table table-striped align-middle mb-0">
                <caption>
                  Registered users. The last administrator cannot be demoted or
                  deleted.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Roles</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td class="text-break">{user.name}</td>
                      <td class="text-break">{user.email}</td>
                      <td>{user.roles.join(", ")}</td>
                      <td>
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm"
                          aria-label={`Change role for ${user.email}`}
                          onClick={() =>
                            void runRequest(async (signal) => {
                              const updated = await userService.changeRole(
                                user.id,
                                user.roles.includes("admin")
                                  ? "basic"
                                  : "admin",
                                signal,
                              );
                              setUsers(
                                (users) =>
                                  users?.map((user) =>
                                    user.id === updated.id ? updated : user,
                                  ) ?? null,
                              );
                            }, "Role updated.")
                          }
                        >
                          Make{" "}
                          {user.roles.includes("admin") ? "basic" : "admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </fieldset>
      </div>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <section class="alert alert-warning">
      <h2 class="h5">Page not found</h2>
      <p class="mb-0">
        <a href="/projects" class="alert-link">
          Return to projects
        </a>
        .
      </p>
    </section>
  );
}
