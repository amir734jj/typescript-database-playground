# TypeScript Database Playground

Attempting to re-produce my great experience with .NET's [FluentMigration](https://github.com/fluentmigrator/fluentmigrator) in TypeScript

## Register entities

Export new Sequelize model classes from `src/entities/index.ts`. Database setup
automatically registers the exported subclasses of `Model`; no separate model
list is required.

## Generate example data

Run TypeScript directly with `npm run dev` (Node.js via tsx). To run compiled
JavaScript instead, first run `npm run build`, then `npm start` (Node.js).
The development command does not watch for file changes.

File-backed SQLite databases use write-ahead logging (WAL), enabled before
migrations or queries run. SQLite may create adjacent `-wal` and `-shm` files.
In-memory databases retain their default journal mode.
Sequelize queries are logged through Pino at info level as JSON with a `sql` field.

```sh
npm run db:seed
```

Both `npm run db:seed` and normal startup (`npm run dev` or `npm start` after
`npm run build`) apply pending migrations, then use Faker to add 10 million users
with 3 projects each (30 million projects). Inserts use batches of 1,000 users
and their projects, each committed in its own transaction. Completed batches
remain committed if seeding stops; a failing batch rolls back its users and
projects. Normal startup reads all matching
users and their projects in ID-ordered batches of 1,000 instead of loading the
entire result into memory. This limits application memory, but the complete seed
still requires substantial disk space and time. These commands
use the configured `DB_FILE_NAME` (default: `sqlite.db`).

Normal startup prints the total execution time, including connection cleanup,
and deletes the configured database file after closing the connection, even if
the main operation fails. Any existing data in that file is deleted too.
In-memory databases do not require file cleanup. `npm run db:seed` preserves the
database and adds another batch on every run.