# TypeScript Database Playground

Attempting to re-produce my great experience with .NET's [FluentMigration](https://github.com/fluentmigrator/fluentmigrator) in TypeScript

## Source layout

The API and UI are separate npm projects:

- `api/`: NestJS API, database code, and backend configuration.
- `ui/`: Preact UI and Vite configuration.

There is no root npm package. Run `npm install` in each project folder
to install its dependencies. Run `npm run dev` inside `api/` and `ui/` in
separate terminals for development. Run `npm run build` inside each folder
to build that project. The UI build writes to `api/wwwroot`, which the API serves.

The NestJS application starts at `api/src/app.ts`.
API code is organized by responsibility:

- `api/src/controllers`: HTTP controllers.
- `api/src/decorators`: Nest request parameter decorators.
- `api/src/dtos`: request and response DTOs and their validation/Swagger decorators.
- `api/src/enums`: shared enums.
- `api/src/guards`: authentication strategy and authorization guards.
- `api/src/interfaces`: shared interfaces.
- `api/src/logic`: validation, serialization, error handling, and OpenAPI helpers.
- `api/src/modules`: Nest application and database modules.
- `api/src/pipes`: Nest request validation pipes.
- `api/src/services`: application services.
- `api/src/validators`: custom DTO validation constraints.

Each API folder exposes a barrel for imports from other folders. Import the
folder directly, for example `import { AuthService } from '../services'`.
TypeScript uses bundler resolution, and the build uses `tsc-alias` to resolve
folder imports to `index.js` for native Node.js ESM. Within a folder, import
sibling files directly to avoid barrel cycles. Database
entities remain in `api/src/entities`, migration definitions in `api/src/migrations`,
and database tooling in `api/src/tools`.

## Docker

Build the image from the repository root:

```powershell
docker build -t drizzle-playground .
```

Set `JWT_SECRET` to a securely generated secret of at least 32 bytes. For a local
trial, generate it once in PowerShell, then run the container:

```powershell
$env:JWT_SECRET = [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
docker run --rm -p 3000:3000 --env JWT_SECRET --mount type=volume,source=drizzle-playground-data,target=/data drizzle-playground
```

Open `http://localhost:3000`. Keep the same secret across container restarts.
The image builds both projects and runs the API as a non-root user, serving the
built UI on the same origin. Only production API dependencies are included.
SQLite data is persisted in the named volume; migrations run automatically on
startup. Production mode disables Swagger. Local environment files, databases,
dependencies, and build outputs are excluded from the build context.

## UI

The Preact UI uses Bootstrap's packaged CSS only, with no custom styles or
Bootstrap JavaScript. From `ui/`, run `npm install` and `npm run dev`, with the
API running in another terminal. It supports:

- Public project browsing with pagination and owner-only creation, editing,
  and deletion.
- Registration, login, logout, and token refresh.
- Editing or deleting your own account.
- Administrator user listing and role changes.

The first registered account is an administrator. API validation and
authorization errors are shown in alerts, including last-administrator
protections. JWTs and expiry metadata are persisted in browser `sessionStorage`
under `api-playground-session`, so they survive reloads in the same tab, not
closing the tab. Profiles and roles are fetched from the API on startup, not
persisted. Logout, account deletion, expired tokens, and unauthorized responses
clear the stored token. Destructive actions require confirmation.

Client-side routing uses `preact-iso`:

- `/` and `/projects`: public projects.
- `/login`: sign in.
- `/register`: create an account. Successful login or registration opens `/account`.
- `/projects/new`: create a project (sign-in required).
- `/projects/:id/edit`: edit an owned project (sign-in and ownership required).
- `/account`: profile and session management (sign-in required).
- `/users`: user listing and role management (administrator required).
- `/admin`: compatibility alias for `/users`.
- Other UI paths show a not-found page.

Navigation preserves shared Zustand state. Reloading a protected URL restores
the token from session storage and verifies it by loading the current profile.
Vite and the API's existing SPA fallback support direct links and refreshes.
Public project browsing is separate from project forms. Successful saves return
to the project list; failed saves remain on the editor. Editing URLs load the
owned project directly, including after a refresh. User management loads the
user list automatically and retains a manual reload action.

Shared state lives in small Zustand `create` hooks in `ui/src/state`: auth,
projects, users, and request status. These stores contain state and Immer setter
actions only; auth uses Zustand's `persist` middleware backed by `store2`'s
`store.session` for the token only. API workflows live separately in
`ui/src/services`; components subscribe directly through hooks such as
`useAuthStore` and `useProjectStore`.
Administrator access is derived from the session.

The UI uses Lodash helpers for stored-session validation and Luxon for ISO token
expiry validation, comparisons, and localized display. Lodash imports target
individual functions to avoid bundling the entire library.

Run `npm test` inside `ui/` for the service/state tests (Node.js 22.15+).
The test setup maps React imports to Preact compatibility and resolves generated
extensionless TypeScript imports, matching Vite.

## UI API client

The UI uses Orval to generate Axios functions and request types from the API's
OpenAPI schema. With the API running outside production, run these commands
inside `ui/`:

```powershell
npm install
npm run api:generate
```

The generated client is committed in `ui/src/api/generated.ts`. Regenerate it
after API contract changes; normal UI builds do not need a running API.
Generation defaults to `http://localhost:3000/swagger-json`. Set `OPENAPI_URL`
to use a different schema URL.

Generated functions use the shared Axios instance in `ui/src/api/client.ts`.
Its request interceptor reads the current session token, so services do not
construct authentication options for each request. Responses are unwrapped to
their typed data, while HTTP errors remain rejected promises. Import generated
functions directly when needed:

```typescript
import { projectsControllerList, usersControllerMe } from './api/generated'

const projects = await projectsControllerList({ skip: 0, limit: 20 })
const me = await usersControllerMe()
```

Requests use relative `/api/...` URLs. Vite proxies `/api` to
`http://localhost:3000` during development; update `ui/vite.config.ts` if the API
uses a different port. In production, the API serves the built UI on the same
origin. Response typing depends on Swagger response DTOs/decorators; endpoints
without response schemas will not have useful generated response types.

## Lint

Inside `api/`, run `npm run lint` to check the TypeScript source and build scripts using
Airbnb's base ESLint configuration and TypeScript ESLint.
Run `npm run lint:fix` to automatically fix supported violations.
The configuration preserves the project's four-space indentation and named
exports and allows either LF or CRLF line endings.

## Register entities

Export new Sequelize model classes from `api/src/entities/index.ts`. Database setup
automatically registers the exported subclasses of `Model`; no separate model
list is required.

## Database migrations

The single initial migration creates the complete schema and seeds the `basic`
and `admin` roles. It is intended for a fresh database. Databases using the
previous migration history are not automatically upgraded and will be rejected
by the migration runner; use a new `DATABASE_URL` rather than pointing this
version at an existing database.
Databases that already applied this initial migration will not receive later
changes to it, including timestamp columns; use a fresh database for this schema.

## Database behavior

File-backed SQLite databases use write-ahead logging (WAL), enabled before
migrations or queries run. SQLite may create adjacent `-wal` and `-shm` files.
In-memory databases retain their default journal mode.
Sequelize's SQL logger uses Pino's silent level, so SQL statements are not emitted.
Application date handling uses Luxon in UTC, converting to native `Date` values
at Sequelize boundaries. Database columns retain Sequelize's `DATE` type, and
token expiry responses retain their ISO timestamp format.

## Local API (NestJS)

Set `JWT_SECRET` to a random secret of at least 32 bytes in the environment or
`api/.env`, then run `npm run dev` from `api/`.
The API listens on port 3000 by default; override it with `PORT`. Swagger UI is
available at `/swagger` outside production. Run `npm run build` followed by
`npm start` for the compiled API. `npm run api:dev` and `npm run api:start` are
aliases for the same entry point. The development command builds before startup
and does not watch files.
Run API commands from `api/`, so local configuration, relative database paths,
and static files all resolve there. Static files are
served from `api/wwwroot`; `npm run build` inside `ui/` generates the SPA there, including
`index.html`. The UI build replaces that directory, so keep source assets in
`ui/public` rather than editing the generated output. Client-side routes fall
back to `index.html`. API routes are under `/api`, and Swagger remains at `/swagger`.
Pino logs completed HTTP requests with their method, path, status, and response
time. Pino redacts headers, bodies, and query data; the URL query string is
removed before logging.
Logs are prettified outside production and remain JSON in production.
NestJS controllers, dependency injection, and Passport JWT
guards handle HTTP requests. Nest manages service dependencies through module
providers; database setup, queries, entities, and migrations are unchanged.
Nest HTTP exceptions are returned as `{ "error": "message" }`.
Controllers receive authenticated users and bearer tokens through Nest
parameter decorators rather than accessing Express requests directly. The
application still uses Nest's Express adapter for HTTP startup.
Request bodies use a global Nest `ValidationPipe`, with transformation and
rejection of unknown fields. The Nest CLI compiles TypeScript with decorator
metadata so Nest can infer DTO types from controller parameters. Build output is
written to `api/dist/nest` as native ES modules.
`DatabaseModule` loads `.env` through Nest's `ConfigModule` and uses an async
provider factory with `ConfigService` to create and export the Sequelize instance.
`DATABASE_URL` defaults to `sqlite.db` (inside `api/`) and accepts a local SQLite path or a
`file:` URL such as `file:sqlite.db`. API migrations use that same injected
connection, which closes through Nest shutdown hooks on `SIGINT` or `SIGTERM`.
Standalone migration
commands share the database factory through `api/src/cli-database.ts`
and retain their existing connection lifecycle. Neither path synchronizes models
or changes the existing migration definitions.
OpenAPI paths are generated from the controllers with `@nestjs/swagger`, and
request schemas are generated from Swagger DTO decorators alongside the existing
`class-validator` validation rules. Project endpoints also document their success
response shapes, including the no-content delete response.
The JSON specification is available at `/swagger-json` outside production,
including when running the compiled API without the source tree.

Register with `POST /api/auth/register` using `name`, `age`, `email`, and a password
of 12-72 UTF-8 bytes, then log in at `POST /api/auth/login`. Issued JWTs expire after
one hour; only their SHA-256 hashes and expiry times are stored in SQLite. Send
the token as a bearer token. `POST /api/auth/refresh` rotates it and
`POST /api/auth/logout` revokes it. `/api/users/me` supports reading, updating, and
deleting your own account. `GET /api/projects` is public and lists all projects;
use `skip` (default 0) and `limit` (default 50, maximum 100) for pagination.
Both parameters accept unsigned decimal integers; unknown query parameters,
including the removed `afterId`, are rejected by DTO validation.
Creating projects and reading, updating, or deleting an individual project
requires authentication and is limited to projects you own.
Accounts have `basic` and `admin` roles through a many-to-many relationship.
The first registered account is an administrator; subsequent accounts receive
the basic role. Administrators can list users at `GET /api/admin/users` and set a
user's role with `PATCH /api/admin/users/:id/role` and a JSON body such as
`{"role":"admin"}` or `{"role":"basic"}`. The last administrator cannot be
demoted or deleted.