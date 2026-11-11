# SQLite Playground

## Run

Install dependencies and run the example:

```sh
npm install
npm run dev
```

The app creates `sqlite.db` in the project directory by default and ensures the
example user exists. It generates fixture users only if the users table is empty,
so existing users are preserved on subsequent runs. To use a different local or remote libSQL database, set
`DB_FILE_NAME` in a `.env` file. For example:

```env
DB_FILE_NAME=file:./data.db
```

To build and run the compiled app:

```sh
npm run build
npm start
```

Drizzle Kit uses `src/drizzle.config.ts` for schema operations.

## Database schema changes

Edit the Drizzle table definitions in `src/schema.ts`, then generate a migration:

```sh
npm run db:generate
```

Commit the generated files in `drizzle/`. The app applies pending migrations
automatically at startup; there is no need to write table-creation SQL in the
application code.
