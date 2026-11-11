import { faker } from '@faker-js/faker';
import { sequelize } from './database.ts';
import { Project, User } from './entities';

const userCount = 100000;
const projectsPerUser = 3;

export async function seedData(): Promise<void> {
    await sequelize.transaction(async () => {
        const users = await User.bulkCreate(
            Array.from({ length: userCount }, () => ({
                name: faker.person.fullName(),
                age: faker.number.int({ min: 18, max: 80 }),
                email: `${faker.string.uuid()}@example.test`,
            })),
        );

        await Project.bulkCreate(
            users.flatMap((user) =>
                Array.from({ length: projectsPerUser }, () => ({
                    name: faker.company.catchPhrase(),
                    description: faker.lorem.sentence(),
                    userId: user.id,
                })),
            ),
        );
    });

    console.log(`Added ${userCount} users and ${userCount * projectsPerUser} projects.`);
}
