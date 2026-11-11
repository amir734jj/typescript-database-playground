import { seed } from 'drizzle-seed';
import { client, db, initializeDatabase, usersTable } from './schema.ts';

import 'dotenv/config';
import $sql from 'sql-template-strings';

try {
    await initializeDatabase();
    const existingUsers = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
    if (existingUsers.length === 0) {
        await seed(db, { usersTable });
    }

    const query = db.insert(usersTable).values({
        name: 'John',
        age: 25,
        email: 'john@example.com',
    }).toSQL();

    console.log($sql.SQL(query.sql, query.params).query);

    const readyToCopySql = db.dialect
        .sqlToQuery(insert.getSQL().inlineParams())
        .sql;

    console.log(readyToCopySql);

    console.log('Database is ready; the example user is present.');
} finally {
    client.close();
}