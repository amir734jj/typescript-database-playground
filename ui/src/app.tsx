import { useEffect, useState } from "preact/hooks";
import { Route, Router, useLocation } from "preact-iso";
import { healthControllerHealth } from "./api/generated";
import { RequestStatus } from "./components/request-status";
import { useRequest } from "./hooks/use-request";
import {
  AccountPage,
  LoginPage,
  NotFoundPage,
  ProjectEditorPage,
  ProjectsPage,
  RegisterPage,
  UsersPage,
} from "./pages";
import { initializeSession, signOut } from "./services/auth";
import { selectIsAdmin, useAuthStore } from "./state/auth";

export function App() {
  const [ready, setReady] = useState(false);
  const { path, route } = useLocation();
  const user = useAuthStore((state) => state.session?.user);
  const request = useRequest();
  const { busy, runRequest } = request;
  const isAdmin = useAuthStore(selectIsAdmin);
  const links = [
    {
      href: "/projects",
      label: "Projects",
      active:
        path === "/" || path === "/projects" || path.startsWith("/projects/"),
    },
    ...(user
      ? [{ href: "/account", label: "My account", active: path === "/account" }]
      : [
          { href: "/login", label: "Sign in", active: path === "/login" },
          {
            href: "/register",
            label: "Register",
            active: path === "/register",
          },
        ]),
    ...(isAdmin
      ? [
          {
            href: "/users",
            label: "Users",
            active: path === "/users" || path === "/admin",
          },
        ]
      : []),
  ];

  useEffect(() => {
    let active = true;
    void runRequest(initializeSession).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [runRequest]);

  return (
    <>
      <header class="navbar bg-dark" data-bs-theme="dark">
        <div class="container">
          <a class="navbar-brand mb-0 h1" href="/">
            API Playground
          </a>
          <span class="navbar-text">
            {user ? user.email : "Browsing as a guest"}
          </span>
        </div>
      </header>
      <main class="container py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h1 class="h3 mb-1">Database playground</h1>
            <p class="text-body-secondary mb-0">
              A simple interface for the NestJS API.
            </p>
          </div>
          <button
            type="button"
            class="btn btn-outline-secondary"
            disabled={busy}
            onClick={() =>
              void runRequest(
                (signal) => healthControllerHealth({ signal }),
                "API is healthy.",
              )
            }
          >
            Check API
          </button>
        </div>

        <nav aria-label="Main navigation">
          <ul class="nav nav-pills gap-2 mb-4">
            {links.map((link) => (
              <li class="nav-item" key={link.href}>
                <a
                  class={`nav-link ${link.active ? "active" : ""}`}
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {user && (
              <li class="nav-item ms-auto">
                <button
                  type="button"
                  class="nav-link"
                  disabled={busy}
                  onClick={async () => {
                    if (await runRequest(signOut, "Signed out."))
                      route("/login");
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>

        <RequestStatus {...request} />

        <fieldset disabled={busy} class="border-0 p-0 m-0">
          <legend class="visually-hidden">API actions</legend>
          {ready && (
            <Router key={`${user?.id ?? "guest"}:${isAdmin}`}>
              <Route path="/" component={ProjectsPage} />
              <Route path="/projects" component={ProjectsPage} />
              <Route path="/projects/new" component={ProjectEditorPage} />
              <Route path="/projects/:id/edit" component={ProjectEditorPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/account" component={AccountPage} />
              <Route path="/users" component={UsersPage} />
              <Route path="/admin" component={UsersPage} />
              <Route default component={NotFoundPage} />
            </Router>
          )}
        </fieldset>
      </main>
    </>
  );
}
